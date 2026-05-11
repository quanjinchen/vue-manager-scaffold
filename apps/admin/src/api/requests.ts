import { appRequest, type AppRequestMethodOptions } from '@/api/app-request';

type RequestParams = Record<string, any>;

export const requests = {
  login: {
    accountLogin(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/admin/login', params, options);
    },
    logout(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/admin/logout', params, options);
    },
    getLoginInfo(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/admin/get-login-info', params, options);
    },
    getCaptcha(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/admin/get-captcha', params, options);
    }
  },
  dashboard: {
    summary(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/dashboard/summary', params, options);
    }
  },
  operationLogs: {
    page(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/operation-log/list-operation-log', params, options);
    }
  },
  users: {
    list(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/user/list-user', params, options);
    },
    detail(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.get('/api/user/detail', params, {
        appendPathOnGet: true,
        ...options
      });
    },
    save(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/user/create-user', params, options);
    },
    update(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/user/update-user', params, options);
    },
    delete(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/user/delete-user', params, options);
    },
    resetPassword(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/user/reset-user-password', params, options);
    }
  },
  organizations: {
    tree(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/org/list-all-org-tree', params, options);
    },
    detail(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.get('/api/org/detail', params, {
        appendPathOnGet: true,
        ...options
      });
    },
    save(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/org/create-org', params, options);
    },
    update(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/org/update-org', params, options);
    },
    delete(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/org/delete-org', params, options);
    }
  },
  menus: {
    tree(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/menu/list-all-menu-tree', params, options);
    },
    save(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/menu/create-menu', params, options);
    },
    update(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/menu/update-menu', params, options);
    },
    delete(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/menu/delete-menu', params, options);
    },
    detail(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.get('/api/menu/detail', params, {
        appendPathOnGet: true,
        ...options
      });
    }
  },
  roles: {
    list(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/role/list-role', params, options);
    },
    detail(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.get('/api/role/detail', params, {
        appendPathOnGet: true,
        ...options
      });
    },
    save(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/role/create-role', params, options);
    },
    update(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/role/update-role', params, options);
    },
    delete(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/role/delete-role', params, options);
    },
    grantInfo(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.get('/api/role/get-role-grant-info-by-role-id', params, {
        appendPathOnGet: true,
        ...options
      });
    },
    grantMenus(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/role/grant-role-menus', params, options);
    }
  },
  userRoles: {
    list(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/user-role/list-user-role', params, options);
    },
    grant(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/user-role/grant-user-roles', params, options);
    }
  },
  orgUsers: {
    list(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/org-user/list-org-user', params, options);
    },
    grant(params: RequestParams = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post('/api/org-user/grant-org-users', params, options);
    }
  }
};
