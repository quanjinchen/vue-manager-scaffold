export interface OptionItem {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

export interface PageInfo {
  pageNum: number;
  pageSize: number;
}

export interface AccessMenuItem {
  name: string;
  path: string;
  menuType?: 1 | 2 | 3 | 4;
  icon?: string;
  permissions?: string | string[];
  children?: AccessMenuItem[];
}
