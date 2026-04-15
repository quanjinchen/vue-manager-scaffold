import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import { generateUuid } from '@vue-scaffold/utils';

type RequestHooks = {
  getToken?: () => string;
  getBaseURL?: () => string;
  onUnauthorized?: () => void;
};

const requestHooks: RequestHooks = {};

export function configureHttpHooks(hooks: RequestHooks) {
  Object.assign(requestHooks, hooks);
}

export type RequestOptions = {
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  url?: string;
  params?: Record<string, any>;
  axiosOptions?: AxiosRequestConfig;
  customOptions?: {
    paramsKey?: 'params' | 'data';
    alertSuccess?: boolean;
    alertError?: boolean;
    needLogin?: boolean;
  };
};

function showError(message: string) {
  ElMessage({
    type: 'error',
    message,
    duration: 2200
  });
}

export async function request({
  method = 'post',
  url = '',
  params = {},
  axiosOptions = {},
  customOptions = {}
}: RequestOptions = {}) {
  // 单独拆出 headers，避免调用方传入 axiosOptions.headers 时把默认请求头整体覆盖掉。
  const { headers: customHeaders = {}, ...restAxiosOptions } = axiosOptions;
  const finalCustomOptions = {
    paramsKey: /^(post|put|patch)$/i.test(method) ? 'data' : 'params',
    alertSuccess: false,
    alertError: true,
    needLogin: true,
    ...customOptions
  };
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: finalCustomOptions.needLogin && requestHooks.getToken?.()
      ? requestHooks.getToken?.()
      : '',
    'X-REQUEST-ID': generateUuid(),
    'X-TIMESTAMP': String(Date.now())
  };

  const instance = axios.create({
    baseURL: requestHooks.getBaseURL?.() ?? '',
    timeout: 30000,
    headers: {
      ...defaultHeaders,
      ...customHeaders
    },
    ...restAxiosOptions
  });

  try {
    const response = await instance({
      method,
      url,
      [finalCustomOptions.paramsKey]: params,
      ...restAxiosOptions
    });
    const result = response.data;
    if (typeof result === 'object' && result !== null && 'code' in result) {
      if (result.code === 0) {
        return result;
      }
      throw new AxiosError(result.message ?? result.msg ?? 'Request failed', undefined, undefined, undefined, response);
    }
    return result;
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    const result = axiosError.response?.data;
    if (status === 401) {
      requestHooks.onUnauthorized?.();
    }
    if (finalCustomOptions.alertError) {
      showError(result?.message ?? result?.msg ?? axiosError.message ?? 'Network error');
    }
    throw error;
  }
}

export function get(url: string, params?: Record<string, any>, options: Omit<RequestOptions, 'method' | 'url' | 'params'> = {}) {
  return request({ method: 'get', url, params, ...options });
}

export function post(url: string, params?: Record<string, any>, options: Omit<RequestOptions, 'method' | 'url' | 'params'> = {}) {
  return request({ method: 'post', url, params, ...options });
}

