import type { AccessMenuItem } from '@vue-scaffold/types';
import { requests } from '@/api/requests';

type LoginInfoResponse = {
  data?: Record<string, any>;
  id?: string | number;
  adminId?: string | number;
  userId?: string | number;
  username?: string;
  userName?: string;
  nickname?: string;
  fullName?: string;
  email?: string;
  roleCodes?: string[];
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

function collectPermissions(menuList: Record<string, any>[] = [], initialPermissions: string[] = []) {
  const permissions = new Set<string>();
  initialPermissions.forEach(item => {
    if (item) {
      permissions.add(String(item));
    }
  });
  const loop = (list: Record<string, any>[]) => {
    list.forEach(item => {
      if (item.permissionCode ?? item.menuCode) {
        permissions.add(String(item.permissionCode ?? item.menuCode));
      }
      if (Array.isArray(item.children) && item.children.length) {
        loop(item.children);
      }
    });
  };
  loop(menuList);
  return [...permissions];
}

function mapMenuType(menuType?: string | number) {
  switch (String(menuType ?? '').toUpperCase()) {
    case 'CATALOG':
      return 1 as const;
    case 'MENU':
      return 2 as const;
    case 'BUTTON':
      return 4 as const;
    default:
      return Number(menuType) === 1 || Number(menuType) === 2 || Number(menuType) === 3 || Number(menuType) === 4
        ? Number(menuType) as 1 | 2 | 3 | 4
        : 2 as const;
  }
}

function mapMenuList(menuList: Record<string, any>[] = []): AccessMenuItem[] {
  return menuList
    .filter(item => item && (item.path || (Array.isArray(item.children) && item.children.length)))
    .map(item => ({
      name: String(item.menuName ?? item.name ?? ''),
      path: String(item.path),
      menuType: mapMenuType(item.menuType),
      icon: item.icon ? String(item.icon) : undefined,
      permissions: item.permissionCode ?? item.menuCode ? String(item.permissionCode ?? item.menuCode) : undefined,
      children: Array.isArray(item.children) ? mapMenuList(item.children) : undefined
    }));
}

function normalizeAccessPayload(token: string, loginInfo: LoginInfoResponse, account: string) {
  const rawLoginInfo = unwrapLoginInfo(loginInfo);
  const userInfo = rawLoginInfo.userInfo ?? rawLoginInfo;
  const menuList = Array.isArray(rawLoginInfo.menus)
    ? rawLoginInfo.menus
    : Array.isArray(userInfo.menuList)
      ? userInfo.menuList
      : [];
  const permissions = rawLoginInfo.permissions?.length
    ? rawLoginInfo.permissions
    : collectPermissions(menuList);

  return {
    token: String(token ?? ''),
    profile: {
      id: String(rawLoginInfo.profile?.id ?? userInfo.adminId ?? userInfo.userId ?? userInfo.id ?? '1'),
      name: String(rawLoginInfo.profile?.name ?? userInfo.nickname ?? userInfo.username ?? userInfo.userName ?? userInfo.fullName ?? account),
      email: String(rawLoginInfo.profile?.email ?? userInfo.email ?? '')
    },
    permissions,
    menuList: mapMenuList(menuList)
  };
}

export async function loginByPassword(params: Record<string, string>) {
  const loginResult = await requests.login.accountLogin.request(params, {
    customOptions: {
      alertError: false,
      needLogin: false
    }
  });

  const token = String(loginResult?.token ?? '');
  if (!token) {
    throw new Error('登录响应缺少 token');
  }

  const loginInfo = await requests.login.getLoginInfo.request({}, {
    axiosOptions: {
      headers: {
        Authorization: token
      }
    },
    customOptions: {
      alertError: false
    }
  });

  return normalizeAccessPayload(token, loginInfo || {}, params.account);
}
