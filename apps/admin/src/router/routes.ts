import { h } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import LoginView from '@/views/login/LoginView.vue';
import DashboardView from '@/views/dashboard/DashboardView.vue';
import MenusView from '@/views/system/MenusView.vue';
import OrganizationsView from '@/views/system/OrganizationsView.vue';
import UsersView from '@/views/system/UsersView.vue';
import RolesView from '@/views/system/RolesView.vue';

// 固定路由：无论是否登录、是否有权限都需要提前存在的页面。
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Login',
      noAuth: true
    }
  },
  {
    path: '/',
    name: 'root',
    component: AdminLayout,
    redirect: '/index/baseInfo',
    children: []
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: {
      render() {
        return h('div', { style: 'padding:24px' }, 'Page not found');
      }
    },
    meta: {
      title: 'Not Found',
      hideInMenu: true
    }
  }
];

// 本地页面路由表。登录后会按照后端 menuList.path 精确匹配这些页面，再动态挂到 root 下。
export const localRoutes: RouteRecordRaw[] = [
  {
    path: '/index/baseInfo',
    name: 'index-baseInfo',
    component: DashboardView,
    meta: {
      title: '基础信息',
      icon: 'House',
      permissions: [
        'index:baseInfo',
        'system:index:baseInfo',
        'system:index:userNum',
        'system:index:userActive',
        'system:index:appRank',
        'system:index:userDevice'
      ]
    }
  },
  {
    path: '/user/index',
    name: 'user-index',
    component: UsersView,
    meta: {
      title: '用户列表',
      icon: 'User',
      permissions: 'system:user:query'
    }
  },
  {
    path: '/organization',
    name: 'organization',
    component: OrganizationsView,
    meta: {
      title: '组织管理',
      icon: 'Document',
      permissions: 'system:org:query'
    }
  },
  {
    path: '/system/menus',
    name: 'system-menus',
    component: MenusView,
    meta: {
      title: '平台菜单',
      icon: 'Setting',
      permissions: 'system:sysMenu:query'
    }
  },
  {
    path: '/system/roles',
    name: 'system-roles',
    component: RolesView,
    meta: {
      title: '平台角色',
      icon: 'Setting',
      permissions: 'system:sysRole:query'
    }
  }
];
