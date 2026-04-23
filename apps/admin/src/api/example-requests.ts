import { appRequest, type AppRequestMethodOptions } from '@/api/app-request';

/**
 * 这个文件演示“接口层如何基于 http 封装业务请求”。
 */
export const exampleRequests = {
  users: {
    list: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, options),
    detail: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.get(url, params, {
        appendPathOnGet: true,
        ...options
      }),
    create: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, options)
  },
  operationLogs: {
    pageSilently: (url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) =>
      appRequest.post(url, params, {
        alertError: false,
        ...options
      })
  }
};
