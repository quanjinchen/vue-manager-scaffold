export type MenuType = "DIR" | "MENU" | "PAGE" | "BTN";

export const MENU_TYPE_DIRECTORY: MenuType = "DIR";
export const MENU_TYPE_MENU: MenuType = "MENU";
export const MENU_TYPE_PAGE: MenuType = "PAGE";
export const MENU_TYPE_BUTTON: MenuType = "BTN";

const MENU_TYPE_MAP: Record<string, MenuType> = {
  MENU: MENU_TYPE_MENU,
  PAGE: MENU_TYPE_PAGE,
  BTN: MENU_TYPE_BUTTON,
  DIR: MENU_TYPE_DIRECTORY,
};

export function normalizeMenuType(menuType?: string | number): MenuType {
  const normalizedType = String(menuType ?? "").trim().toUpperCase();
  return MENU_TYPE_MAP[normalizedType] ?? MENU_TYPE_MENU;
}

export function isDirectoryMenu(menuType?: string | number) {
  return normalizeMenuType(menuType) === MENU_TYPE_DIRECTORY;
}

export function isVisibleNavigationMenu(menuType?: string | number) {
  const normalizedType = normalizeMenuType(menuType);
  return (
    normalizedType === MENU_TYPE_DIRECTORY ||
    normalizedType === MENU_TYPE_MENU
  );
}

export function isBreadcrumbMenu(menuType?: string | number) {
  const normalizedType = normalizeMenuType(menuType);
  return (
    normalizedType === MENU_TYPE_DIRECTORY ||
    normalizedType === MENU_TYPE_MENU ||
    normalizedType === MENU_TYPE_PAGE
  );
}
