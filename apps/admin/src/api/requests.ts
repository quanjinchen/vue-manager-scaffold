import { appRequest, type AppRequestMethodOptions } from '@/api/app-request';

export const requests = {
  login: {
    accountLogin: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, options),
    logout: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, options),
    getLoginInfo: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, options),
    getCaptcha: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, options)
  },
  dashboard: {
    summary: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:index:baseInfo',
          ...(options.custom ?? {})
        }
      })
  },
  operationLogs: {
    page: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:operationLog:query',
          ...(options.custom ?? {})
        }
      })
  },
  users: {
    list: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:query',
          ...(options.custom ?? {})
        }
      }),
    detail: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.get(url, params, {
        ...options,
        custom: {
          appendPathOnGet: true,
          permissions: 'system:user:query',
          ...(options.custom ?? {})
        }
      }),
    save: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:add',
          ...(options.custom ?? {})
        }
      }),
    update: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:update',
          ...(options.custom ?? {})
        }
      }),
    delete: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:delete',
          ...(options.custom ?? {})
        }
      }),
    resetPassword: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:resetPassword',
          ...(options.custom ?? {})
        }
      })
  },
  organizations: {
    tree: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:org:query',
          ...(options.custom ?? {})
        }
      }),
    detail: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.get(url, params, {
        ...options,
        custom: {
          appendPathOnGet: true,
          permissions: 'system:org:query',
          ...(options.custom ?? {})
        }
      }),
    save: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:org:update',
          ...(options.custom ?? {})
        }
      }),
    update: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:org:update',
          ...(options.custom ?? {})
        }
      }),
    delete: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:org:delete',
          ...(options.custom ?? {})
        }
      })
  },
  menus: {
    tree: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:menu:query',
          ...(options.custom ?? {})
        }
      }),
    save: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:menu:update',
          ...(options.custom ?? {})
        }
      }),
    update: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:menu:update',
          ...(options.custom ?? {})
        }
      }),
    delete: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:menu:delete',
          ...(options.custom ?? {})
        }
      }),
    detail: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.get(url, params, {
        ...options,
        custom: {
          appendPathOnGet: true,
          permissions: 'system:menu:query',
          ...(options.custom ?? {})
        }
      })
  },
  roles: {
    list: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:role:query',
          ...(options.custom ?? {})
        }
      }),
    detail: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.get(url, params, {
        ...options,
        custom: {
          appendPathOnGet: true,
          permissions: 'system:role:query',
          ...(options.custom ?? {})
        }
      }),
    save: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:role:update',
          ...(options.custom ?? {})
        }
      }),
    update: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:role:update',
          ...(options.custom ?? {})
        }
      }),
    delete: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:role:delete',
          ...(options.custom ?? {})
        }
      }),
    grantInfo: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.get(url, params, {
        ...options,
        custom: {
          appendPathOnGet: true,
          permissions: 'system:role:query',
          ...(options.custom ?? {})
        }
      }),
    grantMenus: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:role:update',
          ...(options.custom ?? {})
        }
      })
  },
  userRoles: {
    list: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:query',
          ...(options.custom ?? {})
        }
      }),
    grant: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:update',
          ...(options.custom ?? {})
        }
      })
  },
  orgUsers: {
    list: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:org:query',
          ...(options.custom ?? {})
        }
      }),
    grant: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:org:update',
          ...(options.custom ?? {})
        }
      })
  }
};
