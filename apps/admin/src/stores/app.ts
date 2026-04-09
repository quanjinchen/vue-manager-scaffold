import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { STORAGE_KEYS } from '@vue-scaffold/constants';
import { persistedStorage } from '@vue-scaffold/utils';

export const useAppStore = defineStore(
  'scaffold-app',
  () => {
    // 应用级展示状态，和具体业务无关。
    const title = ref('Vue Scaffold');
    const sidebarCollapsed = ref(false);

    // 侧边栏宽度直接由折叠状态推导，组件里只消费结果即可。
    const sidebarWidth = computed(() => (sidebarCollapsed.value ? '72px' : '240px'));

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    }

    // 统一修改系统标题，便于不同环境或不同系统复用。
    function setTitle(value: string) {
      title.value = value;
    }

    return {
      title,
      sidebarCollapsed,
      sidebarWidth,
      toggleSidebar,
      setTitle
    };
  },
  {
    persist: {
      // 这类 UI 偏好需要跨刷新保留，用户体验会更连贯。
      storage: persistedStorage,
      key: STORAGE_KEYS.settings,
      pick: ['title', 'sidebarCollapsed']
    }
  }
);
