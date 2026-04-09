import dayjs from 'dayjs';

export function formatDateTime(value?: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  const result = dayjs(value);
  return result.isValid() ? result.format(format) : '-';
}

export function nowTimestamp() {
  return Date.now();
}

export function previousMonthTimestamp() {
  return dayjs().subtract(1, 'month').valueOf();
}

