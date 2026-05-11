import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { STORAGE_KEYS } from '@vue-scaffold/constants';
import { persistedStorage, removeStorage, writeStorage } from '@vue-scaffold/utils';
import { requests } from '@/api/requests';
import { useMenuStore } from '@/stores/menu';

// 当前登录用户的基础信息。
type UserProfile = {
  id: string;
  name: string;
  email: string;
};

// 登录成功后写入权限系统所需的核心数据结构。
type AccessPayload = {
  token: string;
  profile: UserProfile;
  permissions: string[];
};

export const useAuthStore = defineStore(
  'scaffold-auth',
  () => {
    // token、用户资料、权限码和菜单树共同决定当前用户能看到什么、能访问什么。
    const token = ref('');
    const profile = ref<UserProfile>({
      id: '',
      name: '',
      email: ''
    });
    const permissions = ref<string[]>([]);

    // 只要 token 存在，就认为当前处于已登录状态。
    const isAuthenticated = computed(() => Boolean(token.value));

    // 写入一次完整的登录结果，并同步到持久化存储。
    function applyAccess(payload: AccessPayload) {
      const menuStore = useMenuStore();
      token.value = payload.token;
      profile.value = payload.profile;
      permissions.value = payload.permissions;
      writeStorage(STORAGE_KEYS.token, payload.token);
      writeStorage(STORAGE_KEYS.permissions, payload.permissions);
      menuStore.setIsAddRoutes(false);
    }

    // 统一的权限判断入口，指令、请求层和页面逻辑都可以复用它。
    function hasPermission(permission?: string | string[]) {
      if (!permission) {
        return true;
      }
      return Array.isArray(permission)
        ? permission.some(item => permissions.value.includes(item))
        : permissions.value.includes(permission);
    }

    // 退出登录时清空登录态和权限态，避免脏数据污染下一个用户会话。
    function clearAccess() {
      const menuStore = useMenuStore();
      token.value = '';
      permissions.value = [];
      profile.value = { id: '', name: '', email: '' };
      removeStorage(STORAGE_KEYS.token);
      removeStorage(STORAGE_KEYS.permissions);
      menuStore.clearMenuData();
    }

    // 优先通知后端注销当前 token；即使后端请求失败，也要兜底清理前端本地登录态。
    async function logout() {
      try {
        await requests.login.logout({}, { alertError: false });
      } finally {
        clearAccess();
      }
    }

    return {
      token,
      profile,
      permissions,
      isAuthenticated,
      applyAccess,
      hasPermission,
      clearAccess,
      logout
    };
  },
  {
    persist: {
      // 这些字段刷新后仍然要保留，否则用户每次刷新都要重新登录和重新建菜单。
      storage: persistedStorage,
      key: STORAGE_KEYS.profile,
      pick: ['token', 'profile', 'permissions']
    }
  }
);
