import { appRequest, type AppRequestMethodOptions } from '@/api/app-request';

export const requests = {
  login: {
    accountLogin(params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/auth/login', params, options);
    },
    logout(params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/auth/logout', params, options);
    },
    getLoginInfo(params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/auth/login-info', params, options);
    },
    getCaptcha(params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/auth/captcha', params, options);
    }
  },
  dashboard: {
    summary(params: Record<string, any> = {}) {
      return appRequest.post('/api/dashboard/summary', params);
    }
  },
  operationLogs: {
    page(params: Record<string, any> = {}) {
      return appRequest.post('/api/operation-log/list-operation-log', params);
    }
  },
  users: {
    list(params: Record<string, any> = {}) {
      return appRequest.post('/api/user/list-user', params);
    },
    detail(params: Record<string, any> = {}) {
      return appRequest.get('/api/user/detail', params, {
        appendPathOnGet: true
      });
    },
    save(params: Record<string, any> = {}) {
      return appRequest.post('/api/user/create-user', params);
    },
    update(params: Record<string, any> = {}) {
      return appRequest.post('/api/user/update-user', params);
    },
    delete(params: Record<string, any> = {}) {
      return appRequest.post('/api/user/delete-user', params);
    },
    resetPassword(params: Record<string, any> = {}) {
      return appRequest.post('/api/user/reset-user-password', params);
    }
  },
  organizations: {
    tree(params: Record<string, any> = {}) {
      return appRequest.post('/api/org/list-all-org-tree', params);
    },
    detail(params: Record<string, any> = {}) {
      return appRequest.get('/api/org/detail', params, {
        appendPathOnGet: true
      });
    },
    save(params: Record<string, any> = {}) {
      return appRequest.post('/api/org/create-org', params);
    },
    update(params: Record<string, any> = {}) {
      return appRequest.post('/api/org/update-org', params);
    },
    delete(params: Record<string, any> = {}) {
      return appRequest.post('/api/org/delete-org', params);
    }
  },
  menus: {
    tree(params: Record<string, any> = {}) {
      return appRequest.post('/api/menu/list-all-menu-tree', params);
    },
    save(params: Record<string, any> = {}) {
      return appRequest.post('/api/menu/create-menu', params);
    },
    update(params: Record<string, any> = {}) {
      return appRequest.post('/api/menu/update-menu', params);
    },
    delete(params: Record<string, any> = {}) {
      return appRequest.post('/api/menu/delete-menu', params);
    },
    detail(params: Record<string, any> = {}) {
      return appRequest.get('/api/menu/detail', params, {
        appendPathOnGet: true
      });
    }
  },
  roles: {
    list(params: Record<string, any> = {}) {
      return appRequest.post('/api/role/list-role', params);
    },
    detail(params: Record<string, any> = {}) {
      return appRequest.get('/api/role/detail', params, {
        appendPathOnGet: true
      });
    },
    save(params: Record<string, any> = {}) {
      return appRequest.post('/api/role/create-role', params);
    },
    update(params: Record<string, any> = {}) {
      return appRequest.post('/api/role/update-role', params);
    },
    delete(params: Record<string, any> = {}) {
      return appRequest.post('/api/role/delete-role', params);
    },
    grantInfo(params: Record<string, any> = {}) {
      return appRequest.get('/api/role/get-role-grant-info-by-role-id', params, {
        appendPathOnGet: true
      });
    },
    grantMenus(params: Record<string, any> = {}) {
      return appRequest.post('/api/role/grant-role-menus', params);
    }
  },
  userRoles: {
    list(params: Record<string, any> = {}) {
      return appRequest.post('/api/user-role/list-user-role', params);
    },
    grant(params: Record<string, any> = {}) {
      return appRequest.post('/api/user-role/grant-user-roles', params);
    }
  },
  orgUsers: {
    list(params: Record<string, any> = {}) {
      return appRequest.post('/api/org-user/list-org-user', params);
    },
    grant(params: Record<string, any> = {}) {
      return appRequest.post('/api/org-user/grant-org-users', params);
    }
  }
};

