import type { RouteRecordRaw } from 'vue-router';
import type { AccessMenuItem } from '@vue-scaffold/types';
import { isDirectoryMenu, normalizeMenuType } from '@/types/menu';

// 递归处理菜单树，生成 path => menu 的映射表。
export function generatePathMap(menuList: AccessMenuItem[] = []) {
  const pathMap: Record<string, AccessMenuItem> = {};

  const walk = (items: AccessMenuItem[]) => {
    items.forEach(item => {
      if (item.path && !isDirectoryMenu(item.menuType)) {
        pathMap[item.path] = item;
      }
      if (item.children?.length) {
        walk(item.children);
      }
    });
  };

  walk(menuList);
  return pathMap;
}

// 参考 iammanager-web：本地页面路由是否可访问，核心只看后端菜单里有没有同 path 的节点。
export function filterRoutesByMenuList(routes: RouteRecordRaw[], menuList: AccessMenuItem[]) {
  const pathMap = generatePathMap(menuList);
  return routes.reduce<RouteRecordRaw[]>((result, route) => {
    if (pathMap[route.path]) {
      result.push({
        ...route
      });
    }
    return result;
  }, []);
}

// 根据最终可访问的路由树生成菜单树，避免重复维护一份菜单配置。
export function routesToMenus(routes: RouteRecordRaw[], basePath = ''): AccessMenuItem[] {
  return routes
    .filter(route => route.meta?.hideInMenu !== true)
    .map(route => {
      const path = route.path.startsWith('/')
        ? route.path
        : `${basePath}/${route.path}`.replace(/\/+/g, '/');
      return {
        name: String(route.meta?.title ?? route.name ?? path),
        path,
        menuType: normalizeMenuType(route.children?.length ? 'DIR' : 'MENU'),
        icon: route.meta?.icon as string | undefined,
        permissions: route.meta?.permissions as string | string[] | undefined,
        children: route.children ? routesToMenus(route.children, path) : []
      };
    });
}

// 获取菜单树中第一个实际可进入的叶子节点路径，用于首页重定向。
export function getFirstMenuPath(menuTree: AccessMenuItem[]) {
  for (const item of menuTree) {
    if (item.children && item.children.length > 0) {
      const childPath = getFirstMenuPath(item.children);
      if (childPath) {
        return childPath;
      }
    } else if (item.path && !isDirectoryMenu(item.menuType)) {
      return item.path;
    }
  }
  return '/';
}
