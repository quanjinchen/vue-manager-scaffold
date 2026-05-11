<template>
  <main class="Dashboard">
    <section class="hero surface-card">
      <div>
        <p class="eyebrow">IAM Dashboard</p>
        <h2>基础信息总览</h2>
        <p class="description">首页数据改为基于现有真实接口聚合展示，不再依赖本地 mock 数据。</p>
      </div>
      <div class="hero-side">
        <span>数据刷新时间</span>
        <strong>{{ lastUpdated }}</strong>
      </div>
    </section>

    <BaseStatsCard :items="dashboard.cards" />

    <section class="dashboard-grid">
      <TrendChartCard
        title="操作用户统计"
        subtitle="按周期统计活跃操作人数量"
        :tabs="timeTabs"
        :model-value="userDataType"
        :labels="userStats.labels"
        :series="userStats.series"
        @change="userDataType = $event"
      />

      <TrendChartCard
        title="操作活跃统计"
        subtitle="同时观察活跃操作人与日志次数变化"
        :tabs="timeTabs"
        :model-value="activeDataType"
        :labels="activeStats.labels"
        :series="activeStats.series"
        @change="activeDataType = $event"
      />

      <RankListCard
        title="模块操作排行"
        subtitle="按总次数或成功次数查看模块活跃度"
        :list="rankList"
        :tabs="rankTabs"
        :model-value="rankType"
        :unit-label="rankType === 'TOTAL' ? '操作次数' : '成功次数'"
        @change="rankType = $event"
      />

      <PieSummaryCard
        title="日志分布统计"
        subtitle="查看结果分布或模块占比"
        :list="pieList"
        :total="pieTotal"
        :tabs="pieTabs"
        :model-value="pieType"
        @change="pieType = $event"
      />
    </section>
  </main>
</template>

<script setup lang="ts" name="Dashboard">
  import { computed, onMounted, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import type { AccessMenuItem } from '@vue-scaffold/types';
  import { requests } from '@/api/requests';
  import { useMenuStore } from '@/stores';
  import BaseStatsCard from '@/views/dashboard/components/BaseStatsCard.vue';
  import TrendChartCard from '@/views/dashboard/components/TrendChartCard.vue';
  import RankListCard from '@/views/dashboard/components/RankListCard.vue';
  import PieSummaryCard from '@/views/dashboard/components/PieSummaryCard.vue';

  type StatsPoint = {
    date: string;
    num: number;
  };

  type DashboardCardItem = {
    id: number;
    name: string;
    num: number;
    subLabel: string;
    subValue: number;
    icon: string;
  };

  type DashboardRankItem = {
    name: string;
    num: number;
  };

  type DashboardPieItem = {
    name: string;
    num: number;
  };

  type RangeType = 'WEEK' | 'MONTH' | 'YEAR';
  type RankType = 'TOTAL' | 'SUCCESS';
  type PieType = 'STATUS' | 'MODULE';

  type DashboardState = {
    cards: DashboardCardItem[];
    userSeries: Record<RangeType, StatsPoint[]>;
    activeSeries: Record<RangeType, { peopleList: StatsPoint[]; timesList: StatsPoint[] }>;
    rankList: Record<RankType, DashboardRankItem[]>;
    pieSummary: Record<PieType, DashboardPieItem[]>;
  };

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

  type PageResponse<T> = {
    records?: T[];
    total?: number;
  };

  type TimeBucket = {
    label: string;
    start: dayjs.Dayjs;
    end: dayjs.Dayjs;
  };

  const timeTabs = [
    { id: 'WEEK', name: '近一周' },
    { id: 'MONTH', name: '近一月' },
    { id: 'YEAR', name: '近一年' }
  ];

  const rankTabs = [
    { id: 'TOTAL', name: '总次数' },
    { id: 'SUCCESS', name: '成功次数' }
  ];

  const pieTabs = [
    { id: 'STATUS', name: '结果分布' },
    { id: 'MODULE', name: '模块占比' }
  ];

  const userDataType = ref('YEAR');
  const activeDataType = ref('YEAR');
  const rankType = ref('TOTAL');
  const pieType = ref('STATUS');
  const lastUpdated = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  const menuStore = useMenuStore();

  const dashboard = reactive<DashboardState>({
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
  });

  function normalizeNumber(value: unknown) {
    const nextValue = Number(value ?? 0);
    return Number.isFinite(nextValue) ? nextValue : 0;
  }

  function flattenMenus(menuList: AccessMenuItem[] = []): AccessMenuItem[] {
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

  function getTimeBuckets(rangeType: RangeType): TimeBucket[] {
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
          label: start.format('MM-DD'),
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

  function buildOperatorSeries(logs: OperationLogItem[], rangeType: RangeType): StatsPoint[] {
    const buckets = getTimeBuckets(rangeType);

    return buckets.map(bucket => {
      const operatorSet = new Set<string>();
      logs.forEach(item => {
        const requestTime = dayjs(item.requestTime);
        if (!requestTime.isValid() || requestTime.isBefore(bucket.start) || requestTime.isAfter(bucket.end)) {
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
    return getTimeBuckets(rangeType).reduce(
      (result, bucket) => {
        const operatorSet = new Set<string>();
        let times = 0;

        logs.forEach(item => {
          const requestTime = dayjs(item.requestTime);
          if (!requestTime.isValid() || requestTime.isBefore(bucket.start) || requestTime.isAfter(bucket.end)) {
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

  function buildRankList(logs: OperationLogItem[], rankTypeValue: RankType): DashboardRankItem[] {
    const countMap = new Map<string, number>();

    logs.forEach(item => {
      if (rankTypeValue === 'SUCCESS' && !item.successFlag) {
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

  function buildPieSummary(logs: OperationLogItem[], pieTypeValue: PieType): DashboardPieItem[] {
    if (pieTypeValue === 'STATUS') {
      const successCount = logs.filter(item => Boolean(item.successFlag)).length;
      const failedCount = Math.max(logs.length - successCount, 0);
      return [
        { name: '成功', num: successCount },
        { name: '失败', num: failedCount }
      ].filter(item => item.num > 0);
    }

    return buildRankList(logs, 'TOTAL').slice(0, 5);
  }

  function buildCards(users: UserItem[], logs: OperationLogItem[], menuList: AccessMenuItem[]): DashboardCardItem[] {
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

  function createEmptyDashboard(): DashboardState {
    return {
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
  }

  async function listUsers() {
    const result = await requests.users.list(
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
      const result = await requests.operationLogs.page(
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

  function applyDashboardData(nextValue: DashboardState) {
    dashboard.cards = nextValue.cards;
    dashboard.userSeries = nextValue.userSeries;
    dashboard.activeSeries = nextValue.activeSeries;
    dashboard.rankList = nextValue.rankList;
    dashboard.pieSummary = nextValue.pieSummary;
  }

  async function loadDashboardByAggregation() {
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
    } as DashboardState;
  }

  const userStats = computed(() => ({
    labels: dashboard.userSeries[userDataType.value as keyof typeof dashboard.userSeries].map(item => String(item.date)),
    series: [
      {
        name: '活跃操作人',
        color: 'linear-gradient(180deg, #6385ff 0%, #c4d9ff 100%)',
        values: dashboard.userSeries[userDataType.value as keyof typeof dashboard.userSeries].map(item => Number(item.num) || 0)
      }
    ]
  }));

  const activeStats = computed(() => ({
    labels: dashboard.activeSeries[activeDataType.value as keyof typeof dashboard.activeSeries].peopleList.map(item => String(item.date)),
    series: [
      {
        name: '活跃操作人',
        color: 'linear-gradient(180deg, #6bdeb0 0%, #c9f4df 100%)',
        values: dashboard.activeSeries[activeDataType.value as keyof typeof dashboard.activeSeries].peopleList.map(item => Number(item.num) || 0)
      },
      {
        name: '操作次数',
        color: 'linear-gradient(180deg, #6385ff 0%, #c4d9ff 100%)',
        values: dashboard.activeSeries[activeDataType.value as keyof typeof dashboard.activeSeries].timesList.map(item => Number(item.num) || 0)
      }
    ]
  }));

  const rankList = computed(() => dashboard.rankList[rankType.value as keyof typeof dashboard.rankList] ?? []);
  const pieList = computed(() => dashboard.pieSummary[pieType.value as keyof typeof dashboard.pieSummary] ?? []);
  const pieTotal = computed(() => pieList.value.reduce((sum, item) => sum + (Number(item.num) || 0), 0));

  async function init() {
    try {
      const summary = await requests.dashboard.summary({}, { alertError: false });
      if (
        summary &&
        typeof summary === 'object' &&
        Array.isArray((summary as DashboardState).cards) &&
        (summary as DashboardState).userSeries &&
        (summary as DashboardState).activeSeries &&
        (summary as DashboardState).rankList &&
        (summary as DashboardState).pieSummary
      ) {
        applyDashboardData(summary as DashboardState);
      } else {
        applyDashboardData(await loadDashboardByAggregation());
      }
    } catch {
      try {
        applyDashboardData(await loadDashboardByAggregation());
      } catch {
        applyDashboardData(createEmptyDashboard());
      }
    }
    lastUpdated.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  onMounted(() => {
    init();
  });
</script>

<style scoped lang="scss">
  .Dashboard {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 28px 32px;
    background:
      radial-gradient(circle at top left, rgba(45, 109, 246, 0.18), transparent 26%),
      radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.16), transparent 24%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 249, 255, 0.94));
  }

  .eyebrow {
    margin: 0 0 8px;
    color: #0041c0;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 12px;
  }

  h2 {
    margin: 0 0 10px;
    font-size: 32px;
    line-height: 1.1;
  }

  .description {
    margin: 0;
    max-width: 720px;
    color: #556176;
  }

  .hero-side {
    min-width: 220px;
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid #deebfb;
  }

  .hero-side span {
    display: block;
    color: #98a2b3;
    font-size: 12px;
    margin-bottom: 6px;
  }

  .hero-side strong {
    color: #111827;
    font-size: 18px;
  }

  .dashboard-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .dashboard-grid > * {
    flex: 1 1 calc(50% - 10px);
    min-width: 400px;
  }

  @media (max-width: 1080px) {
    .hero {
      flex-direction: column;
      align-items: flex-start;
    }

    .hero-side {
      min-width: 0;
      width: 100%;
    }

    .dashboard-grid > * {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
</style>
