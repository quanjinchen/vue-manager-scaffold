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
      method: 'get',
      url: '/api/operation-log/page',
      permissions: 'system:operationLog:query'
    })
  },
  users: {
    list: new AppRequest({
      method: 'get',
      url: '/api/user/page',
      permissions: 'system:user:query'
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/user',
      appendPathOnGet: true,
      permissions: 'system:user:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/user/save',
      permissions: 'system:user:update'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/user/update',
      permissions: 'system:user:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/user/delete',
      permissions: 'system:user:delete',
      customOptions: {
        paramsKey: 'params'
      }
    }),
    resetPassword: new AppRequest({
      method: 'post',
      url: '/api/user/reset-password',
      permissions: 'system:user:resetPassword',
      customOptions: {
        paramsKey: 'params'
      }
    })
  },
  organizations: {
    tree: new AppRequest({
      method: 'get',
      url: '/api/org/tree',
      permissions: 'system:org:query'
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/org',
      appendPathOnGet: true,
      permissions: 'system:org:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/org/save',
      permissions: 'system:org:update'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/org/update',
      permissions: 'system:org:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/org/delete',
      permissions: 'system:org:delete',
      customOptions: {
        paramsKey: 'params'
      }
    })
  },
  menus: {
    tree: new AppRequest({
      method: 'get',
      url: '/api/menu/tree',
      permissions: 'system:menu:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/menu/save',
      permissions: 'system:menu:update'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/menu/update',
      permissions: 'system:menu:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/menu/delete',
      permissions: 'system:menu:delete',
      customOptions: {
        paramsKey: 'params'
      }
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/menu',
      appendPathOnGet: true,
      permissions: 'system:menu:query'
    })
  },
  roles: {
    list: new AppRequest({
      method: 'get',
      url: '/api/role/page',
      permissions: 'system:role:query'
    }),
    detail: new AppRequest({
      method: 'get',
      url: '/api/role',
      appendPathOnGet: true,
      permissions: 'system:role:query'
    }),
    save: new AppRequest({
      method: 'post',
      url: '/api/role/save',
      permissions: 'system:role:update'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/role/update',
      permissions: 'system:role:update'
    }),
    delete: new AppRequest({
      method: 'post',
      url: '/api/role/delete',
      permissions: 'system:role:delete',
      customOptions: {
        paramsKey: 'params'
      }
    })
  }
};
