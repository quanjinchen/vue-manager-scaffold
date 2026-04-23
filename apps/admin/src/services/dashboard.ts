import type { AccessMenuItem } from '@vue-scaffold/types';
import dayjs from 'dayjs';
import { appRequest } from '@/api/app-request';
import { useMenuStore } from '@/stores';

type UserItem = {
  id?: string | number;
  status?: number | string | null;
};

type OperationLogItem = {
  id?: string | number;
  moduleName?: string | null;
  operatorName?: string | null;
  successFlag?: boolean | null;
  requestTime?: string | null;
};

type StatsPoint = {
  date: string;
  num: number;
};

type RangeType = 'WEEK' | 'MONTH' | 'YEAR';
type RankType = 'TOTAL' | 'SUCCESS';
type PieType = 'STATUS' | 'MODULE';

type TimeBucket = {
  label: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

export type DashboardCardItem = {
  id: number;
  name: string;
  num: number;
  subLabel: string;
  subValue: number;
  icon: string;
};

export type DashboardRankItem = {
  name: string;
  num: number;
};

export type DashboardPieItem = {
  name: string;
  num: number;
};

export type DashboardOverview = {
  cards: DashboardCardItem[];
  userSeries: Record<RangeType, StatsPoint[]>;
  activeSeries: Record<RangeType, { peopleList: StatsPoint[]; timesList: StatsPoint[] }>;
  rankList: Record<RankType, DashboardRankItem[]>;
  pieSummary: Record<PieType, DashboardPieItem[]>;
};

type PageResponse<T> = {
  records?: T[];
  total?: number;
};

const EMPTY_OVERVIEW: DashboardOverview = {
  cards: [],
  userSeries: {
    WEEK: [],
    MONTH: [],
    YEAR: []
  },
  activeSeries: {
    WEEK: { peopleList: [], timesList: [] },
    MONTH: { peopleList: [], timesList: [] },
    YEAR: { peopleList: [], timesList: [] }
  },
  rankList: {
    TOTAL: [],
    SUCCESS: []
  },
  pieSummary: {
    STATUS: [],
    MODULE: []
  }
};

function normalizeNumber(value: unknown) {
  const nextValue = Number(value ?? 0);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function flattenMenus(menuList: AccessMenuItem[] = []) {
  return menuList.flatMap(item => [item, ...flattenMenus(item.children ?? [])]);
}

function isEnabledUser(item: UserItem) {
  return String(item.status ?? '') === '1' || String(item.status ?? '').toLowerCase() === 'active';
}

function normalizeModuleName(value: string | null | undefined) {
  return String(value || '未归类模块').trim() || '未归类模块';
}

function normalizeOperatorName(value: string | null | undefined) {
  return String(value || '未知操作人').trim() || '未知操作人';
}

function getTimeBuckets(rangeType: RangeType) {
  const now = dayjs();

  if (rangeType === 'WEEK') {
    return Array.from({ length: 7 }, (_, index) => {
      const cursor = now.startOf('day').subtract(6 - index, 'day');
      return {
        label: cursor.format('MM-DD'),
        start: cursor,
        end: cursor.endOf('day')
      };
    });
  }

  if (rangeType === 'MONTH') {
    return Array.from({ length: 4 }, (_, index) => {
      const end = now.endOf('day').subtract((3 - index) * 7, 'day');
      const start = end.startOf('day').subtract(6, 'day');
      return {
        label: `${start.format('MM-DD')}`,
        start,
        end
      };
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const cursor = now.startOf('month').subtract(11 - index, 'month');
    return {
      label: cursor.format('YYYY-MM'),
      start: cursor,
      end: cursor.endOf('month')
    };
  });
}

function buildOperatorSeries(logs: OperationLogItem[], rangeType: RangeType) {
  const buckets = getTimeBuckets(rangeType);

  return buckets.map(bucket => {
    const operatorSet = new Set<string>();

    logs.forEach(item => {
      const requestTime = dayjs(item.requestTime);
      if (!requestTime.isValid()) {
        return;
      }
      if (requestTime.isBefore(bucket.start) || requestTime.isAfter(bucket.end)) {
        return;
      }
      operatorSet.add(normalizeOperatorName(item.operatorName));
    });

    return {
      date: bucket.label,
      num: operatorSet.size
    };
  });
}

function buildActiveSeries(logs: OperationLogItem[], rangeType: RangeType) {
  const buckets = getTimeBuckets(rangeType);

  return buckets.reduce(
    (result, bucket) => {
      const operatorSet = new Set<string>();
      let times = 0;

      logs.forEach(item => {
        const requestTime = dayjs(item.requestTime);
        if (!requestTime.isValid()) {
          return;
        }
        if (requestTime.isBefore(bucket.start) || requestTime.isAfter(bucket.end)) {
          return;
        }
        operatorSet.add(normalizeOperatorName(item.operatorName));
        times += 1;
      });

      result.peopleList.push({
        date: bucket.label,
        num: operatorSet.size
      });
      result.timesList.push({
        date: bucket.label,
        num: times
      });
      return result;
    },
    {
      peopleList: [] as StatsPoint[],
      timesList: [] as StatsPoint[]
    }
  );
}

function buildRankList(logs: OperationLogItem[], rankType: RankType) {
  const countMap = new Map<string, number>();

  logs.forEach(item => {
    if (rankType === 'SUCCESS' && !item.successFlag) {
      return;
    }
    const key = normalizeModuleName(item.moduleName);
    countMap.set(key, normalizeNumber(countMap.get(key)) + 1);
  });

  return [...countMap.entries()]
    .map(([name, num]) => ({ name, num }))
    .sort((left, right) => right.num - left.num)
    .slice(0, 6);
}

function buildPieSummary(logs: OperationLogItem[], pieType: PieType) {
  if (pieType === 'STATUS') {
    const successCount = logs.filter(item => Boolean(item.successFlag)).length;
    const failedCount = Math.max(logs.length - successCount, 0);
    return [
      { name: '成功', num: successCount },
      { name: '失败', num: failedCount }
    ].filter(item => item.num > 0);
  }

  return buildRankList(logs, 'TOTAL').slice(0, 5);
}

function buildCards(users: UserItem[], logs: OperationLogItem[], menuList: AccessMenuItem[]) {
  const flatMenus = flattenMenus(menuList);
  const pageCount = flatMenus.filter(item => Number(item.menuType) === 2 && item.path).length;
  const permissionCount = flatMenus.filter(item => item.permissions).length;
  const enabledUserCount = users.filter(isEnabledUser).length;
  const recentLogCount = logs.filter(item => {
    const requestTime = dayjs(item.requestTime);
    return requestTime.isValid() && !requestTime.isBefore(dayjs().subtract(6, 'day').startOf('day'));
  }).length;

  return [
    {
      id: 1,
      name: '用户总数',
      num: users.length,
      subLabel: '启用用户',
      subValue: enabledUserCount,
      icon: 'User'
    },
    {
      id: 2,
      name: '可访问页面',
      num: pageCount,
      subLabel: '权限节点',
      subValue: permissionCount,
      icon: 'Grid'
    },
    {
      id: 3,
      name: '操作日志数',
      num: logs.length,
      subLabel: '近7天日志',
      subValue: recentLogCount,
      icon: 'Histogram'
    }
  ];
}

async function listUsers() {
  const result = await appRequest.post(
    '/api/user/list-user',
    {
      pageNum: 1,
      pageSize: 1000,
      keyword: ''
    },
    {
      alertError: false,
      permissions: 'system:user:query'
    }
  );

  const pageResult = result as PageResponse<UserItem> | undefined;

  return Array.isArray(pageResult?.records) ? pageResult.records : [];
}

async function listOperationLogs() {
  const records: OperationLogItem[] = [];
  const pageSize = 200;

  for (let pageNum = 1; pageNum <= 5; pageNum += 1) {
    const result = await appRequest.post(
      '/api/operation-log/list-operation-log',
      {
        pageNum,
        pageSize
      },
      {
        alertError: false,
        permissions: 'system:operationLog:query'
      }
    );

    const pageResult = result as PageResponse<OperationLogItem> | undefined;
    const pageRecords = Array.isArray(pageResult?.records) ? pageResult.records : [];
    if (!pageRecords.length) {
      break;
    }

    records.push(...pageRecords);

    const total = normalizeNumber(pageResult?.total);
    if (records.length >= total || pageRecords.length < pageSize) {
      break;
    }
  }

  return records;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const menuStore = useMenuStore();

  try {
    const [users, logs] = await Promise.all([listUsers(), listOperationLogs()]);

    return {
      cards: buildCards(users, logs, menuStore.menuList),
      userSeries: {
        WEEK: buildOperatorSeries(logs, 'WEEK'),
        MONTH: buildOperatorSeries(logs, 'MONTH'),
        YEAR: buildOperatorSeries(logs, 'YEAR')
      },
      activeSeries: {
        WEEK: buildActiveSeries(logs, 'WEEK'),
        MONTH: buildActiveSeries(logs, 'MONTH'),
        YEAR: buildActiveSeries(logs, 'YEAR')
      },
      rankList: {
        TOTAL: buildRankList(logs, 'TOTAL'),
        SUCCESS: buildRankList(logs, 'SUCCESS')
      },
      pieSummary: {
        STATUS: buildPieSummary(logs, 'STATUS'),
        MODULE: buildPieSummary(logs, 'MODULE')
      }
    };
  } catch {
    return EMPTY_OVERVIEW;
  }
}
