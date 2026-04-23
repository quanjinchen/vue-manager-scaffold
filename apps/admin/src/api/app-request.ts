import { RequestClient } from '@vue-scaffold/api';
import { STORAGE_KEYS } from '@vue-scaffold/constants';
import { generateUuid, hasStoredPermission, readStorage, removeStorage, cleartStorage } from '@vue-scaffold/utils';
import { ElMessage } from 'element-plus';
import type { AxiosRequestConfig } from 'axios';
import { getRouterInstance } from '@/router/router-instance';

export type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
export type AppRequestCustomOptions = {
  paramsKey?: 'params' | 'data';
  alertSuccess?: boolean;
  alertError?: boolean;
  needLogin?: boolean;
  permissions?: string | string[];
  appendPathOnGet?: boolean;
  skipBusinessError?: boolean;
};

export type AppRequestMethodOptions = AppRequestCustomOptions & {
  axiosOptions?: AxiosRequestConfig;
};


// admin 端当前请求约定直接写在业务层，不再额外暴露运行时配置入口。
const requestClient = createRequestClient();
const requestBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');


function resolveBusinessMessage(response: any) {
  // 兼容不同后端返回字段，优先拿到一个可直接展示给用户的业务提示。
  return response?.message ?? response?.msg;
}

function resolveBusinessCode(response: any) {
  // 兼容不同后端返回字段，优先拿到一个可直接展示给用户的业务提示。
  return response?.code ?? response?.retCode;
}



/**
 * 消息提示函数
 */
function showMessage(type: 'success' | 'error', message: string, options: any = {}) {
  return ElMessage({
    type,
    message,
    duration: 2000,
    ...options
  });
}

function successHandler(message: string, options?: any) {
  return showMessage('success', message || '成功', options);
}

function errorHandler(message: string, options?: any) {
  return showMessage('error', message || '未知错误，请联系管理员', options);
}


// 错误处理函数
function handleError(msg: string) {
  // 防止多个请求重复抛错
  if (!document.querySelector('.el-message--error')) {
    errorHandler(msg);
  }
}


function handleUnauthorized() {
  cleartStorage()
  const router = getRouterInstance();
  if (router) {
    // 正常应用启动后优先走 router 跳转，避免整页刷新。
    router.replace('/login');
    return;
  }
  // 兜底给未拿到 router 的场景，例如极早期模块初始化时的请求失败。
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}


function createRequestClient() {
  const client = new RequestClient({
    baseURL: requestBaseUrl || window.location.origin,
    responseReturn: 'body',
    timeout: 30000
  });
  return client;
}

function buildRequestHeaders(
  needLogin: boolean,
  customHeaders: Record<string, any> = {}
) {
  const token = needLogin ? readStorage<string>(STORAGE_KEYS.token, '') : '';

  return {
    'Content-Type': 'application/json',
    // 方便后端日志串联一次请求，也方便排查网关或服务间调用链。
    'X-REQUEST-ID': generateUuid(),
    // 预留给后端做签名、重放校验或调试分析使用。
    'X-TIMESTAMP': String(Date.now()),
    ...(token
      ? {
        // 当前项目约定直接透传 token，不额外拼 Bearer 前缀。
        Authorization: token
      }
      : {}),
    ...customHeaders
  };
}

function buildPathUrl(url: string, params: Record<string, any>) {
  const nextParams = { ...params };
  // 优先取显式 id；如果调用方没传 id，则回退到第一个参数值，兼容历史调用方式。
  const pathValue = nextParams.id ?? Object.values(nextParams)[0];
  if (pathValue === undefined || pathValue === null || pathValue === '') {
    return { url, params: nextParams };
  }
  if ('id' in nextParams) {
    // 已经拼到路径里的 id 不再重复留在 query/body 里。
    delete nextParams.id;
  }
  return {
    url: `${url.replace(/\/$/, '')}/${pathValue}`,
    params: nextParams
  };
}

async function runAppRequest(
  method: RequestMethod,
  url: string = '',
  params: Record<string, any> = {},
  options: AppRequestMethodOptions = {}
) {
  const {
    axiosOptions = {},
    ...customOptions
  } = options;

  const {
    paramsKey: customParamsKey,
    alertSuccess = false,
    alertError = true,
    needLogin = true,
    permissions,
    appendPathOnGet = false,
    skipBusinessError = false
  } = customOptions;

  // 请求层直接复用本地权限缓存做短路，延续当前脚手架“无权限时静默返回”的语义。
  if (!hasStoredPermission(permissions)) {
    return undefined;
  }

  let finalUrl = url ?? '';
  let finalParams = { ...params };
  // 兼容现有详情接口风格：GET/DELETE 且配置 appendPathOnGet 时自动把 id 拼到路径末尾。
  if (appendPathOnGet && ['get', 'delete'].includes(method ?? 'post')) {
    const pathResult = buildPathUrl(finalUrl, finalParams);
    finalUrl = pathResult.url;
    finalParams = pathResult.params;
  }

  // 默认把写操作放进 body，读操作放进 query，允许调用方按接口约定覆盖。
  const paramsKey = customParamsKey ?? (/^(post|put|patch)$/i.test(method) ? 'data' : 'params');
  const { headers: customHeaders = {}, ...restAxiosOptions } = axiosOptions;

  try {
    const response = await requestClient.request(finalUrl, {
      ...restAxiosOptions,
      headers: buildRequestHeaders(needLogin, customHeaders as Record<string, any>),
      method: method.toUpperCase() as Uppercase<RequestMethod>,
      // 通过动态 key 兼容 axios 的 params/data 两套传参位置。
      [paramsKey]: finalParams,
      responseReturn: 'body'
    });

    const responseData = response && typeof response === 'object' && 'data' in response
      ? response.data
      : response;
    const businessCode = resolveBusinessCode(response);
    const businessMessage = resolveBusinessMessage(responseData);

    if (!skipBusinessError && businessCode != undefined && businessCode !== 0) {
      Promise.reject({ response })
    }

    if (alertSuccess) {
      successHandler(businessMessage || '操作成功');
    }

    // 兼容历史返回习惯：如果后端响应还是 { code, data, message }，优先把 data 交给业务层。
    // 这样页面层大多数场景可以直接拿到业务数据，而不用每次都写 response.data。
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      return responseData.data;
    }

    return responseData;
  } catch (error: any) {
    if (error?.response) {
      const { response } = error
      const businessCode = resolveBusinessCode(response);
      const businessMessage = resolveBusinessMessage(response);
      if (businessCode != undefined) {
        if ([401, 403].includes(Number(businessCode))) {
          handleError(businessMessage || '登录失效');
          setTimeout(() => {
            handleUnauthorized();
          }, 500);
        } else if (alertError) {
          errorHandler(businessMessage || '请求失败');
        }

      }
    } if (error?.message?.includes?.('timeout')) {
      if (alertError) {
        errorHandler('请求超时');
      }
    }

    else if (error?.request) {
      if (alertError) {
        errorHandler('网络错误');
      }
    } else if (alertError) {
      errorHandler(error.message);
    }

    throw error;
  }
}

// appRequest 直接暴露最常用的 get/post/put/delete/patch 方法。
// 业务层传配置和参数即可，不再额外包一层请求实例。
export const appRequest = {
  request(method: RequestMethod, url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
    return runAppRequest(method, url, params, options);
  },
  get(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
    return runAppRequest('get', url, params, options);
  },
  post(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
    return runAppRequest('post', url, params, options);
  },
  put(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
    return runAppRequest('put', url, params, options);
  },
  delete(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
    return runAppRequest('delete', url, params, options);
  },
  patch(url: string, params: Record<string, any> = {}, options: AppRequestMethodOptions = {}) {
    return runAppRequest('patch', url, params, options);
  }
};
