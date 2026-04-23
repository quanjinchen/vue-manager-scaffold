import { appRequest, type AppRequestMethodOptions } from '@/api/app-request';

export const requests = {
  login: {
    accountLogin(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post(url, params, options);
    },
    logout(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post(url, params, options);
    },
    getLoginInfo(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post(url, params, options);
    },
    getCaptcha(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
      return appRequest.post(url, params, options);
    }
  },
  dashboard: {
    summary(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    }
  },
  operationLogs: {
    page(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    }
  },
  users: {
    list(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    detail(url: string, params: Record<string, any> = {}) {
      return appRequest.get(url, params, {
        appendPathOnGet: true
      });
    },
    save(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    update(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    delete(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    resetPassword(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    }
  },
  organizations: {
    tree(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    detail(url: string, params: Record<string, any> = {}) {
      return appRequest.get(url, params, {
        appendPathOnGet: true
      });
    },
    save(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    update(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    delete(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    }
  },
  menus: {
    tree(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    save(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    update(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    delete(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    detail(url: string, params: Record<string, any> = {}) {
      return appRequest.get(url, params, {
        appendPathOnGet: true
      });
    }
  },
  roles: {
    list(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    detail(url: string, params: Record<string, any> = {}) {
      return appRequest.get(url, params, {
        appendPathOnGet: true
      });
    },
    save(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    update(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    delete(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    grantInfo(url: string, params: Record<string, any> = {}) {
      return appRequest.get(url, params, {
        appendPathOnGet: true
      });
    },
    grantMenus(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    }
  },
  userRoles: {
    list(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    grant(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    }
  },
  orgUsers: {
    list(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    },
    grant(url: string, params: Record<string, any> = {}) {
      return appRequest.post(url, params);
    }
  }
};
