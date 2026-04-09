import { createRouter, createWebHistory } from 'vue-router';
import { STORAGE_KEYS } from '@vue-scaffold/constants';
import { readStorage } from '@vue-scaffold/utils';
import { getFirstMenuPath } from '@/router/menu';
import { startProgress, stopProgress } from '@/router/progress';
import { useAppStore, useAuthStore, useMenuStore } from '@/stores';
import { constantRoutes } from '@/router/routes';

// 先只挂载固定路由，权限路由在登录后按权限动态注入。
const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes
});

// 显式执行一次权限路由注册，既可以在登录成功后主动调用，也可以在刷新后的守卫里兜底调用。
export function ensureAccessRoutes() {
  const menuStore = useMenuStore();

  if (menuStore.isAddRoutes) {
    return menuStore.menuTree;
  }

  menuStore.permissionRoutes.forEach(route => router.addRoute('root', route));
  menuStore.setIsAddRoutes(true);

  return menuStore.menuTree;
}

router.beforeEach(async to => {
  // 每次切换路由时都启动顶部进度条，给页面切换一个明确反馈。
  startProgress();

  const authStore = useAuthStore();
  const menuStore = useMenuStore();
  const appStore = useAppStore();
  const token = readStorage<string>(STORAGE_KEYS.token, '');
  const storedMenus = readStorage(STORAGE_KEYS.menus, menuStore.menuList);
  const hasStoredMenus = Array.isArray(storedMenus) && storedMenus.length > 0;

  // 路由标题优先使用页面自身标题，没有时回退到系统标题。
  document.title = to.meta?.title
    ? `${String(to.meta.title)} | ${appStore.title}`
    : appStore.title;

  // 标记为 noAuth 的页面不参与登录校验，例如登录页、404。
  if (to.meta?.noAuth) {
    // localStorage 中已有 token 时，说明当前浏览器会话仍然处于登录态。
    if (to.path === '/login' && token) {
      return '/';
    }
    return true;
  }

  // 未登录时统一打回登录页，并记录原目标地址，登录后再跳回去。
  if (!token) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    };
  }

  // 参考 iammanager-web：只要浏览器里还有菜单缓存，且本次会话尚未完成动态路由注入，
  // 就优先补注册，再继续进入当前目标地址。这样刷新动态页面时不会先被固定路由表吞掉。
  if (!menuStore.isAddRoutes && hasStoredMenus) {
    menuStore.setPermissionData(menuStore.menuList.length ? menuStore.menuList : storedMenus);
    ensureAccessRoutes();
    return to.fullPath;
  }

  // 登录成功后的第一次跳转，动态过滤并挂载当前用户有权访问的路由。
  if (!menuStore.isAddRoutes) {
    menuStore.setPermissionData(menuStore.menuList);
    ensureAccessRoutes();

    // 进入根路径时，自动跳到用户的第一个可访问菜单。
    if (to.path === '/') {
      return getFirstMenuPath(menuStore.menuTree);
    }

    // 动态加完路由后重新进入当前目标地址，避免首次访问命中不到新路由。
    return to.fullPath;
  }

  // 后续再次访问根路径时，同样跳到第一个可访问菜单。
  if (to.path === '/') {
    return getFirstMenuPath(menuStore.menuTree);
  }

  return true;
});

router.afterEach(() => {
  // 路由切换完成后关闭顶部进度条。
  stopProgress();
});

export default router;
