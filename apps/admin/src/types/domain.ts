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
  menuType: 'M' | 'C' | 'B';
  menuName: string;
  path: string;
  menuCode: string;
  orderNum: number;
  enabled: boolean;
  children?: MenuRecord[];
};

export type RoleRecord = {
  id: string;
  roleCode: string;
  roleName: string;
  userNum: number;
  userGroupNum: number;
  systemDefault: boolean;
  remark?: string;
  createdAt: string;
  updatedAt: string;
};
