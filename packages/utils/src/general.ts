import type { OptionItem } from '@vue-scaffold/types';

function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function deepMerge<T extends Record<string, any>>(...sources: T[]): T {
  return sources.reduce((acc, source) => {
    Object.entries(source || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value.slice();
        return;
      }
      if (isObject(value) && isObject(acc[key])) {
        acc[key] = deepMerge(acc[key], value);
        return;
      }
      acc[key] = value;
    });
    return acc;
  }, {} as T);
}

export function getOrdinalKey(index = 0, pageNum = 1, pageSize = 10) {
  return pageSize * (pageNum - 1) + index + 1;
}

export function findIdItem<T extends OptionItem>(list: T[] = [], id: string | number) {
  return list.find(item => item.id === id);
}

export function findIdName<T extends OptionItem>(list: T[] = [], id: string | number) {
  return findIdItem(list, id)?.name ?? '-';
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let last = 0;
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn(...args);
      return;
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      last = Date.now();
      fn(...args);
    }, wait - (now - last));
  };
}

export function getCssObject(styles: Record<string, string> = {}) {
  return Object.entries(styles)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
}

export function formatStatisticNumber(value: number | string = 0) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number);
}
