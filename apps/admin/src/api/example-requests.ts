import { appRequest, type AppRequestMethodOptions } from '@/api/app-request';

/**
 * 这个文件演示“接口层如何基于 http 封装业务请求”。
 */
export const exampleRequests = {
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
    create: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:user:add',
          ...(options.custom ?? {})
        }
      })
  },
  operationLogs: {
    pageSilently: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        ...options,
        custom: {
          permissions: 'system:operationLog:query',
          customOptions: {
            alertError: false,
            ...(options.custom?.customOptions ?? {})
          },
          ...(options.custom ?? {})
        }
      })
  }
};
