import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
import { STORAGE_KEYS } from '@vue-scaffold/constants';
import { persistedStorage } from '@vue-scaffold/utils';
import type { AccessMenuItem } from '@vue-scaffold/types';
import { filterRoutesByMenuList } from '@/router/menu';
import { localRoutes } from '@/router/routes';
import {
  isBreadcrumbMenu,
  isDirectoryMenu,
  isVisibleNavigationMenu,
  normalizeMenuType
} from '@/types/menu';

export const useMenuStore = defineStore(
  'scaffold-menu',
  () => {
    // 保存后端返回的原始菜单树，后续路由、左侧菜单、面包屑都从这里派生。
    const menuList = ref<AccessMenuItem[]>([]);
    // 动态过滤后真正可注册的本地页面路由。
    const permissionRoutes = ref<RouteRecordRaw[]>([]);
    // 是否已经完成过动态路由注入，对齐 iammanager-web 里的 isAddRoutes 语义。
    const isAddRoutes = ref(false);

    function setPermissionData(menus: AccessMenuItem[] = []) {
      menuList.value = menus;
      permissionRoutes.value = filterRoutesByMenuList(localRoutes, menus);
      return permissionRoutes.value;
    }

    function setIsAddRoutes(value: boolean) {
      isAddRoutes.value = value;
    }

    function clearMenuData() {
      menuList.value = [];
      permissionRoutes.value = [];
      isAddRoutes.value = false;
    }

    function generateTree(
      filterCondition: (menuType?: string | number) => boolean
    ): AccessMenuItem[] {
      const generateMenusTree = (treeList: AccessMenuItem[]) =>
        treeList
          .filter(menuItem => {
            if (!filterCondition(menuItem.menuType)) {
              return false;
            }
            // 目录允许没有 path，只要下面还有可展示子节点；菜单/页面必须有 path。
            if (isDirectoryMenu(menuItem.menuType)) {
              return true;
            }
            return Boolean(menuItem.path);
          })
          .map(menuItem => ({
            ...menuItem,
            children: menuItem.children ? generateMenusTree(menuItem.children) : undefined
          }))
          .filter(menuItem => {
            if (isDirectoryMenu(menuItem.menuType)) {
              return Boolean(menuItem.children?.length);
            }
            return true;
          });

      return generateMenusTree(menuList.value);
    }

    // 左侧菜单只保留目录和菜单节点，按钮节点不参与导航展示。
    const menuTree = computed(() => generateTree(isVisibleNavigationMenu));
    // 面包屑允许包含页面节点。
    const breadcrumbTree = computed(() => generateTree(isBreadcrumbMenu));

    return {
      menuList,
      permissionRoutes,
      isAddRoutes,
      menuTree,
      breadcrumbTree,
      setPermissionData,
      setIsAddRoutes,
      clearMenuData
    };
  },
  {
    persist: {
      storage: persistedStorage,
      key: STORAGE_KEYS.menus,
      pick: ['menuList']
    }
  }
);
