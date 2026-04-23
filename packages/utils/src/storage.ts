import { STORAGE_KEYS } from '@vue-scaffold/constants';

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

export function readStorage<T>(key: string, fallback: T): T {
  const storage = getBrowserStorage();
  const raw = storage?.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown) {
  getBrowserStorage()?.setItem(key, JSON.stringify(value));
}

export function removeStorage(key: string) {
  getBrowserStorage()?.removeItem(key);
}

export function cleartStorage() {
  getBrowserStorage()?.clear();
}

export function hasStoredPermission(permission?: string | string[]) {
  if (!permission) {
    return true;
  }
  const permissions = readStorage<string[]>(
    STORAGE_KEYS.permissions,
    readStorage<{ permissions?: string[] }>(STORAGE_KEYS.profile, {}).permissions ?? []
  );
  if (Array.isArray(permission)) {
    return permission.some(item => permissions.includes(item));
  }
  return permissions.includes(permission);
}

export const persistedStorage = {
  getItem(key: string) {
    return getBrowserStorage()?.getItem(key) ?? null;
  },
  setItem(key: string, value: string) {
    getBrowserStorage()?.setItem(key, value);
  },
  removeItem(key: string) {
    getBrowserStorage()?.removeItem(key);
  }
};
