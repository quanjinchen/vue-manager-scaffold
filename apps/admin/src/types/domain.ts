export type UserRecord = {
  id: string;
  userName: string;
  fullName: string;
  phoneNum: string;
  email: string;
  orgIds: string[];
  orgNames: string[];
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
  remark?: string;
};

export type OrganizationRecord = {
  id: string;
  parentId: string | null;
  orgName: string;
  shortName?: string;
  orderNum: number;
  remark?: string;
  children?: OrganizationRecord[];
};

export type MenuRecord = {
  id: string;
  parentId: string | null;
  menuType: 1 | 2 | 3 | 4;
  menuName: string;
  icon?: string;
  path: string;
  menuCode: string;
  orderNum: number;
  enabled: boolean;
  remark?: string;
  children?: MenuRecord[];
};

export type RoleRecord = {
  id: string;
  roleCode: string;
  roleName: string;
  userNum: number;
  userGroupNum: number;
  systemDefault: boolean;
  dataScopeType?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
};
