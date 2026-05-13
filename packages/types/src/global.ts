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
  menuName: string;
  path: string;
  menuType?: "DIR" | "MENU" | "PAGE" | "BTN";
  icon?: string;
  menuCode?: string | string[];
  children?: AccessMenuItem[];
}
