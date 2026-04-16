import { AppRequest } from '@vue-scaffold/api';

export const requests = {
  login: {
    accountLogin: new AppRequest({
      method: 'post',
      url: '/api/admin/login'
    }),
    logout: new AppRequest({
      method: 'post',
      url: '/api/admin/logout'
    }),
    getLoginInfo: new AppRequest({
      method: 'post',
      url: '/api/admin/get-login-info'
    }),
    getCaptcha: new AppRequest({
      method: 'post',
      url: '/api/admin/get-captcha'
    })
  },
  dashboard: {
    summary: new AppRequest({
      method: 'post',
      url: '/api/dashboard/summary',
      permissions: 'system:index:baseInfo'
    })
  },
  operationLogs: {
    page: new AppRequest({
      method: 'post',
      url: '/api/operation-log/list-operation-log',
      permissions: 'system:operationLog:query'
    })
  },
  users: {
    list: new AppRequest({
      method: 'post',
      url: '/api/user/list-user',
      permissions: 'system:user:query'
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/user/get-user-by-id',
      appendPathOnGet: true,
      permissions: 'system:user:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/user/create-user',
      permissions: 'system:user:add'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/user/update-user',
      permissions: 'system:user:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/user/delete-user',
      permissions: 'system:user:delete'
    }),
    resetPassword: new AppRequest({
      method: 'post',
      url: '/api/user/reset-user-password',
      permissions: 'system:user:resetPassword'
    })
  },
  organizations: {
    tree: new AppRequest({
      method: 'post',
      url: '/api/org/list-all-org-tree',
      permissions: 'system:org:query'
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/org/get-org-by-id',
      appendPathOnGet: true,
      permissions: 'system:org:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/org/create-org',
      permissions: 'system:org:update'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/org/update-org',
      permissions: 'system:org:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/org/delete-org',
      permissions: 'system:org:delete'
    })
  },
  menus: {
    tree: new AppRequest({
      method: 'post',
      url: '/api/menu/list-all-menu-tree',
      permissions: 'system:menu:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/menu/create-menu',
      permissions: 'system:menu:update'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/menu/update-menu',
      permissions: 'system:menu:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/menu/delete-menu',
      permissions: 'system:menu:delete'
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/menu/get-menu-by-id',
      appendPathOnGet: true,
      permissions: 'system:menu:query'
    })
  },
  roles: {
    list: new AppRequest({
      method: 'post',
      url: '/api/role/list-role',
      permissions: 'system:role:query'
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/role/get-role-by-id',
      appendPathOnGet: true,
      permissions: 'system:role:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/role/create-role',
      permissions: 'system:role:update'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/role/update-role',
      permissions: 'system:role:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/role/delete-role',
      permissions: 'system:role:delete'
    }),
    grantInfo: new AppRequest({
      method: 'get',
      url: '/api/role/get-role-grant-info-by-role-id',
      appendPathOnGet: true,
      permissions: 'system:role:query'
    }),
    grantMenus: new AppRequest({
      method: 'post',
      url: '/api/role/grant-role-menus',
      permissions: 'system:role:update'
    })
  },
  userRoles: {
    list: new AppRequest({
      method: 'post',
      url: '/api/user-role/list-user-role',
      permissions: 'system:user:query'
    }),
    grant: new AppRequest({
      method: 'post',
      url: '/api/user-role/grant-user-roles',
      permissions: 'system:user:update'
    })
  },
  orgUsers: {
    list: new AppRequest({
      method: 'post',
      url: '/api/org-user/list-org-user',
      permissions: 'system:org:query'
    }),
    grant: new AppRequest({
      method: 'post',
      url: '/api/org-user/grant-org-users',
      permissions: 'system:org:update'
    })
  }
};
