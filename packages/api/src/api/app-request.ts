import { request, type RequestOptions } from './http';

type AppRequestConfig = RequestOptions & {
  permissions?: string | string[];
  appendPathOnGet?: boolean;
};

let permissionChecker: (permission?: string | string[]) => boolean = () => true;

export function configureAppRequest(options: { hasPermission: (permission?: string | string[]) => boolean }) {
  permissionChecker = options.hasPermission;
}

function buildPathUrl(url: string, params: Record<string, any>) {
  const nextParams = { ...params };
  const pathValue = nextParams.id ?? Object.values(nextParams)[0];
  if (pathValue === undefined || pathValue === null || pathValue === '') {
    return { url, params: nextParams };
  }
  if ('id' in nextParams) {
    delete nextParams.id;
  }
  return {
    url: `${url.replace(/\/$/, '')}/${pathValue}`,
    params: nextParams
  };
}

export class AppRequest {
  constructor(private readonly config: AppRequestConfig) {}

  async request(params: Record<string, any> = {}, options: Partial<AppRequestConfig> = {}) {
    const merged = {
      ...this.config,
      ...options
    };

    if (!permissionChecker(merged.permissions)) {
      return undefined;
    }

    let finalUrl = merged.url ?? '';
    let finalParams = { ...params };

    if (merged.appendPathOnGet && ['get', 'delete'].includes(merged.method ?? 'post')) {
      const pathResult = buildPathUrl(finalUrl, finalParams);
      finalUrl = pathResult.url;
      finalParams = pathResult.params;
    }

    const response = await request({
      ...merged,
      url: finalUrl,
      params: finalParams
    });

    return response?.data ?? response;
  }
}

