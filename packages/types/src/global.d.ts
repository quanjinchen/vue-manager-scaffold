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
  icon?: string;
  permissions?: string | string[];
  children?: AccessMenuItem[];
}

