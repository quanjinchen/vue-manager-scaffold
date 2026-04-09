import { AppRequest } from '@vue-scaffold/api';

export const requests = {
  login: {
    accountLogin: new AppRequest({
      method: 'post',
      url: '/api/admin/login'
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
  users: {
    list: new AppRequest({
      method: 'post',
      url: '/api/users',
      permissions: 'system:user:query'
    }),
    detail: new AppRequest({
      method: 'post',
      url: '/api/users',
      permissions: 'system:user:query'
    }),
    create: new AppRequest({
      method: 'post',
      url: '/api/user/create-user',
      permissions: 'system:user:add'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/user/update-user',
      permissions: 'system:user:update'
    }),
    remove: new AppRequest({
      method: 'post',
      url: '/api/user/delete-user',
      permissions: 'system:user:delete'
    })
  },
  organizations: {
    tree: new AppRequest({
      method: 'post',
      url: '/api/org/get-org-tree',
      permissions: 'system:org:query'
    }),
    detail: new AppRequest({
      method: 'post',
      url: '/api/org/get-org-by-id',
      permissions: 'system:org:query'
    }),
    create: new AppRequest({
      method: 'post',
      url: '/api/org/create-org',
      permissions: 'system:org:add'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/org/update-org',
      permissions: 'system:org:update'
    }),
    remove: new AppRequest({
      method: 'post',
      url: '/api/org/delete-org',
      permissions: 'system:org:delete'
    })
  },
  menus: {
    tree: new AppRequest({
      method: 'post',
      url: '/api/sys-menu/get-menu-tree',
      permissions: 'system:sysMenu:query'
    }),
    create: new AppRequest({
      method: 'post',
      url: '/api/sys-menu/create-menu',
      permissions: 'system:sysMenu:add'
    }),
    update: new AppRequest({
      method: 'post',
      url: '/api/sys-menu/update-menu',
      permissions: 'system:sysMenu:update'
    }),
    remove: new AppRequest({
      method: 'post',
      url: '/api/sys-menu/delete-menu',
      permissions: 'system:sysMenu:delete'
    })
  }
};
