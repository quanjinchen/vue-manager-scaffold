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
  import BaseStatsCard from '@/views/dashboard/components/BaseStatsCard.vue';
  import TrendChartCard from '@/views/dashboard/components/TrendChartCard.vue';
  import RankListCard from '@/views/dashboard/components/RankListCard.vue';
  import PieSummaryCard from '@/views/dashboard/components/PieSummaryCard.vue';
  import { getDashboardOverview, type DashboardOverview } from '@/services/dashboard';

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

  const dashboard = reactive<DashboardOverview>({
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
    const overview = await getDashboardOverview();
    dashboard.cards = overview.cards;
    dashboard.userSeries = overview.userSeries;
    dashboard.activeSeries = overview.activeSeries;
    dashboard.rankList = overview.rankList;
    dashboard.pieSummary = overview.pieSummary;
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
