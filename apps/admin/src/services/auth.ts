import type { AccessMenuItem } from '@vue-scaffold/types';
import { requests } from '@/api/requests';
import { authRepository } from '@/mock/repository';

type LoginInfoResponse = {
  data?: Record<string, any>;
  id?: string;
  adminId?: string | number;
  userName?: string;
  fullName?: string;
  email?: string;
  menuList?: Record<string, any>[];
  profile?: {
    id?: string;
    name?: string;
    email?: string;
  };
  permissions?: string[];
  menus?: AccessMenuItem[];
  userInfo?: Record<string, any>;
};

function unwrapLoginInfo(loginInfo: LoginInfoResponse) {
  if (loginInfo && typeof loginInfo === 'object' && loginInfo.data && typeof loginInfo.data === 'object') {
    return loginInfo.data as Record<string, any>;
  }
  return loginInfo as Record<string, any>;
}

function collectPermissions(menuList: Record<string, any>[] = []) {
  const permissions = new Set<string>();
  const loop = (list: Record<string, any>[]) => {
    list.forEach(item => {
      if (item.menuCode) {
        permissions.add(String(item.menuCode));
      }
      if (Array.isArray(item.children) && item.children.length) {
        loop(item.children);
      }
    });
  };
  loop(menuList);
  return [...permissions];
}

function mapMenuList(menuList: Record<string, any>[] = []): AccessMenuItem[] {
  return menuList
    .filter(item => item && (item.path || (Array.isArray(item.children) && item.children.length)))
    .map(item => ({
      name: String(item.menuName ?? item.name ?? ''),
      path: String(item.path),
      menuType: Number(item.menuType) as 1 | 2 | 3 | 4,
      icon: item.icon ? String(item.icon) : undefined,
      permissions: item.menuCode ? String(item.menuCode) : undefined,
      children: Array.isArray(item.children) ? mapMenuList(item.children) : undefined
    }));
}

function normalizeAccessPayload(token: string, loginInfo: LoginInfoResponse, account: string) {
  const rawLoginInfo = unwrapLoginInfo(loginInfo);
  const userInfo = rawLoginInfo.userInfo ?? rawLoginInfo;
  const menuList = Array.isArray(userInfo.menuList) ? userInfo.menuList : [];
  const permissions = rawLoginInfo.permissions?.length ? rawLoginInfo.permissions : collectPermissions(menuList);

  return {
    token: String(token ?? ''),
    profile: {
      id: String(rawLoginInfo.profile?.id ?? userInfo.adminId ?? userInfo.id ?? '1'),
      name: String(rawLoginInfo.profile?.name ?? userInfo.userName ?? userInfo.fullName ?? account),
      email: String(rawLoginInfo.profile?.email ?? userInfo.email ?? `${account}@example.com`)
    },
    permissions,
    menuList: rawLoginInfo.menus?.length ? rawLoginInfo.menus : mapMenuList(menuList)
  };
}

export async function loginByPassword(params: Record<string, string>) {
  const loginResult = await requests.login.accountLogin.request(params, {
    customOptions: {
      alertError: false,
      needLogin: false
    }
  }).catch(async error => {
    const code = error?.response?.data?.code;
    if (code) {
      throw error;
    }
    return authRepository.login(params.account, params.password);
  });

  const token = String(loginResult?.token ?? '');
  if (!token) {
    throw new Error('登录响应缺少 token');
  }

  const loginInfo = await requests.login.getLoginInfo.request({}, {
    customOptions: {
      alertError: false
    }
  }).catch(() => authRepository.getLoginInfo(params.account));

  return normalizeAccessPayload(token, loginInfo || {}, params.account);
}
