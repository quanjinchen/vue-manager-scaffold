import { h } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import Login from '@/views/login/Login.vue';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import Menu from '@/views/system/Menu.vue';
import OperationLog from '@/views/system/OperationLog.vue';
import Organization from '@/views/organization/Organization.vue';
import User from '@/views/user/User.vue';
import Role from '@/views/system/Role.vue';

// 固定路由：无论是否登录、是否有权限都需要提前存在的页面。
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: '登录',
      noAuth: true
    }
  },
  {
    path: '/',
    name: 'root',
    component: AdminLayout,
    children: []
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: {
      render() {
        return h('div', { style: 'padding:24px' }, '页面不存在');
      }
    },
    meta: {
      title: '页面不存在',
      hideInMenu: true
    }
  }
];

// 本地页面路由表。登录后会按照后端 menuList.path 精确匹配这些页面，再动态挂到 root 下。
export const localRoutes: RouteRecordRaw[] = [
  {
    path: '/system/operation-log',
    name: 'system-operation-log',
    component: OperationLog,
    meta: {
      title: '日志审计',
      icon: 'Document',
      permissions: 'system:operationLog:query'
    }
  },
  {
    path: '/user',
    name: 'user',
    component: User,
    meta: {
      title: '用户列表',
      icon: 'User',
      permissions: 'system:user:query'
    }
  },
  {
    path: '/organization',
    name: 'organization',
    component: Organization,
    meta: {
      title: '组织管理',
      icon: 'Document',
      permissions: 'system:org:query'
    }
  },
  {
    path: '/system/menu',
    name: 'system-menu',
    component: Menu,
    meta: {
      title: '平台菜单',
      icon: 'Setting',
      permissions: 'system:menu:query'
    }
  },
  {
    path: '/system/role',
    name: 'system-role',
    component: Role,
    meta: {
      title: '平台角色',
      icon: 'Setting',
      permissions: 'system:role:query'
    }
  },
  {
    path: '/index/baseInfo',
    name: 'index-baseInfo',
    component: Dashboard,
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
  }
];
