import type { MenuRecord, OrganizationRecord, RoleRecord, UserRecord } from '@/types/domain';
import { mockDashboard, mockMenus, mockOrganizations, mockRoles, mockUsers } from '@/mock/db';

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function uuid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function flattenOrganizations(tree: OrganizationRecord[]): OrganizationRecord[] {
  return tree.flatMap(item => [item, ...flattenOrganizations(item.children ?? [])]);
}

function flattenMenus(tree: MenuRecord[]): MenuRecord[] {
  return tree.flatMap(item => [item, ...flattenMenus(item.children ?? [])]);
}

function updateTreeNode<T extends { id: string; children?: T[] }>(tree: T[], id: string, updater: (node: T) => T): T[] {
  return tree.map(item => {
    if (item.id === id) {
      return updater(item);
    }
    if (item.children?.length) {
      return {
        ...item,
        children: updateTreeNode(item.children, id, updater)
      };
    }
    return item;
  });
}

function appendTreeNode<T extends { id: string; children?: T[] }>(tree: T[], parentId: string | null, node: T): T[] {
  if (!parentId) {
    return [...tree, node];
  }
  return tree.map(item => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children ?? []), node]
      };
    }
    if (item.children?.length) {
      return {
        ...item,
        children: appendTreeNode(item.children, parentId, node)
      };
    }
    return item;
  });
}

function removeTreeNode<T extends { id: string; children?: T[] }>(tree: T[], id: string): T[] {
  return tree
    .filter(item => item.id !== id)
    .map(item => ({
      ...item,
      children: item.children ? removeTreeNode(item.children, id) : []
    }));
}

let usersDb = cloneDeep(mockUsers);
let rolesDb = cloneDeep(mockRoles);
let organizationsDb = cloneDeep(mockOrganizations);
let menusDb = cloneDeep(mockMenus);

export const authRepository = {
  async login(account: string, password: string) {
    return Promise.resolve({
      token: `token-${account}`
    });
  },
  async getLoginInfo(account = 'admin') {
    return Promise.resolve({
      id: '1',
      userName: account || 'admin',
      fullName: account || 'admin',
      email: `${account || 'admin'}@example.com`,
      menuList: cloneDeep(mockMenus)
    });
  }
};

export const dashboardRepository = {
  async baseStats() {
    return Promise.resolve(cloneDeep(mockDashboard.baseStats));
  },
  async userStats(dataType = 'YEAR') {
    return Promise.resolve(cloneDeep(mockDashboard.userStats[dataType as keyof typeof mockDashboard.userStats] ?? []));
  },
  async activeStats(dataType = 'YEAR') {
    return Promise.resolve(cloneDeep(mockDashboard.activeStats[dataType as keyof typeof mockDashboard.activeStats] ?? { peopleList: [], timesList: [] }));
  },
  async appStats(rankType = 'USER') {
    return Promise.resolve(cloneDeep(mockDashboard.appStats[rankType as keyof typeof mockDashboard.appStats] ?? []));
  },
  async deviceStats(deviceType = '0') {
    return Promise.resolve(cloneDeep(mockDashboard.deviceStats[deviceType as keyof typeof mockDashboard.deviceStats] ?? []));
  }
};

export const userRepository = {
  async list(keyword = '') {
    const value = keyword.trim().toLowerCase();
    const result = usersDb.filter(item => {
      if (!value) {
        return true;
      }
      return [item.userName, item.fullName, item.phoneNum, item.email].some(field => field.toLowerCase().includes(value));
    });
    return Promise.resolve(cloneDeep(result));
  },
  async detail(id: string) {
    return Promise.resolve(cloneDeep(usersDb.find(item => item.id === id)));
  },
  async create(payload: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const record: UserRecord = {
      ...payload,
      id: uuid('user'),
      createdAt: now,
      updatedAt: now
    };
    usersDb.unshift(record);
    return Promise.resolve(cloneDeep(record));
  },
  async update(id: string, payload: Partial<UserRecord>) {
    usersDb = usersDb.map(item =>
      item.id === id
        ? {
            ...item,
            ...payload,
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        : item
    );
    return Promise.resolve(cloneDeep(usersDb.find(item => item.id === id)));
  },
  async remove(id: string) {
    usersDb = usersDb.filter(item => item.id !== id);
    return Promise.resolve(true);
  }
};

export const roleRepository = {
  async list(keyword = '') {
    const value = keyword.trim().toLowerCase();
    const result = rolesDb.filter(item => {
      if (!value) {
        return true;
      }
      return [item.roleName, item.roleCode, item.remark ?? ''].some(field => field.toLowerCase().includes(value));
    });
    return Promise.resolve(cloneDeep(result));
  },
  async detail(id: string) {
    return Promise.resolve(cloneDeep(rolesDb.find(item => item.id === id)));
  },
  async create(payload: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt' | 'userNum' | 'userGroupNum'>) {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const record: RoleRecord = {
      ...payload,
      id: uuid('role'),
      userNum: 0,
      userGroupNum: 0,
      createdAt: now,
      updatedAt: now
    };
    rolesDb.unshift(record);
    return Promise.resolve(cloneDeep(record));
  },
  async update(id: string, payload: Partial<RoleRecord>) {
    rolesDb = rolesDb.map(item =>
      item.id === id
        ? {
            ...item,
            ...payload,
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        : item
    );
    return Promise.resolve(cloneDeep(rolesDb.find(item => item.id === id)));
  },
  async remove(id: string) {
    rolesDb = rolesDb.filter(item => item.id !== id);
    return Promise.resolve(true);
  }
};

export const organizationRepository = {
  async tree() {
    return Promise.resolve(cloneDeep(organizationsDb));
  },
  async list() {
    return Promise.resolve(cloneDeep(flattenOrganizations(organizationsDb)));
  },
  async detail(id: string) {
    return Promise.resolve(cloneDeep(flattenOrganizations(organizationsDb).find(item => item.id === id)));
  },
  async create(payload: Omit<OrganizationRecord, 'id' | 'children'>) {
    const record: OrganizationRecord = {
      ...payload,
      id: uuid('org'),
      children: []
    };
    organizationsDb = appendTreeNode(organizationsDb, payload.parentId, record);
    return Promise.resolve(cloneDeep(record));
  },
  async update(id: string, payload: Partial<OrganizationRecord>) {
    organizationsDb = updateTreeNode(organizationsDb, id, item => ({
      ...item,
      ...payload
    }));
    return Promise.resolve(cloneDeep(flattenOrganizations(organizationsDb).find(item => item.id === id)));
  },
  async remove(id: string) {
    organizationsDb = removeTreeNode(organizationsDb, id);
    usersDb = usersDb.map(item => ({
      ...item,
      orgIds: item.orgIds.filter(orgId => orgId !== id),
      orgNames: item.orgNames.filter((_, index) => item.orgIds[index] !== id)
    }));
    return Promise.resolve(true);
  }
};

export const menuRepository = {
  async tree() {
    return Promise.resolve(cloneDeep(menusDb));
  },
  async detail(id: string) {
    return Promise.resolve(cloneDeep(flattenMenus(menusDb).find(item => item.id === id)));
  },
  async create(payload: Omit<MenuRecord, 'id' | 'children'>) {
    const record: MenuRecord = {
      ...payload,
      id: uuid('menu'),
      children: []
    };
    menusDb = appendTreeNode(menusDb, payload.parentId, record);
    return Promise.resolve(cloneDeep(record));
  },
  async update(id: string, payload: Partial<MenuRecord>) {
    menusDb = updateTreeNode(menusDb, id, item => ({
      ...item,
      ...payload
    }));
    return Promise.resolve(cloneDeep(flattenMenus(menusDb).find(item => item.id === id)));
  },
  async remove(id: string) {
    menusDb = removeTreeNode(menusDb, id);
    return Promise.resolve(true);
  }
};
