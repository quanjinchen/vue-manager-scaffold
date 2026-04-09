<template>
  <main class="DashboardView">
    <section class="hero surface-card">
      <div>
        <p class="eyebrow">IAM Dashboard</p>
        <h2>基础信息总览</h2>
        <p class="description">这一版先迁入 `iammanager-web` 的主 dashboard 核心区，包含基础统计、用户趋势、活跃趋势、应用排行和终端分布。</p>
      </div>
      <div class="hero-side">
        <span>数据刷新时间</span>
        <strong>{{ lastUpdated }}</strong>
      </div>
    </section>

    <BaseStatsCard v-if="dashboard.baseStats" :detail="dashboard.baseStats" />

    <section class="dashboard-grid">
      <TrendChartCard
        title="用户数统计"
        subtitle="按周 / 月 / 年查看接入用户趋势"
        :tabs="timeTabs"
        :model-value="userDataType"
        :labels="userStats.labels"
        :series="userStats.series"
        @change="userDataType = $event"
      />

      <TrendChartCard
        title="用户活跃统计"
        subtitle="同时观察活跃人数与登录次数变化"
        :tabs="timeTabs"
        :model-value="activeDataType"
        :labels="activeStats.labels"
        :series="activeStats.series"
        @change="activeDataType = $event"
      />

      <RankListCard
        :list="dashboard.appStats"
        :tabs="rankTabs"
        :model-value="rankType"
        :unit-label="rankType === 'USER' ? '用户数' : '认证次数'"
        @change="rankType = $event"
      />

      <PieSummaryCard
        :list="dashboard.deviceStats"
        :total="deviceTotal"
        :tabs="deviceTabs"
        :model-value="deviceType"
        @change="deviceType = $event"
      />
    </section>
  </main>
</template>

<script setup lang="ts" name="DashboardView">
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import dayjs from 'dayjs';
  import BaseStatsCard from '@/views/dashboard/components/BaseStatsCard.vue';
  import TrendChartCard from '@/views/dashboard/components/TrendChartCard.vue';
  import RankListCard from '@/views/dashboard/components/RankListCard.vue';
  import PieSummaryCard from '@/views/dashboard/components/PieSummaryCard.vue';
  import { dashboardRepository } from '@/mock/repository';

  const timeTabs = [
    { id: 'WEEK', name: '近一周' },
    { id: 'MONTH', name: '近一月' },
    { id: 'YEAR', name: '近一年' }
  ];

  const rankTabs = [
    { id: 'USER', name: '用户数' },
    { id: 'AUTH', name: '认证次数' }
  ];

  const deviceTabs = [
    { id: '0', name: '浏览器' },
    { id: '1', name: '操作系统' }
  ];

  const userDataType = ref('YEAR');
  const activeDataType = ref('YEAR');
  const rankType = ref('USER');
  const deviceType = ref('0');
  const lastUpdated = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  const dashboard = reactive({
    baseStats: null as Record<string, any> | null,
    userStats: [] as Record<string, any>[],
    activeStats: {
      peopleList: [] as Record<string, any>[],
      timesList: [] as Record<string, any>[]
    },
    appStats: [] as Record<string, any>[],
    deviceStats: [] as Record<string, any>[]
  });

  const userStats = computed(() => ({
    labels: dashboard.userStats.map(item => String(item.date)),
    series: [
      {
        name: '人数',
        color: 'linear-gradient(180deg, #6385ff 0%, #c4d9ff 100%)',
        values: dashboard.userStats.map(item => Number(item.num) || 0)
      }
    ]
  }));

  const activeStats = computed(() => ({
    labels: dashboard.activeStats.peopleList.map(item => String(item.date)),
    series: [
      {
        name: '登录人数',
        color: 'linear-gradient(180deg, #6bdeb0 0%, #c9f4df 100%)',
        values: dashboard.activeStats.peopleList.map(item => Number(item.num) || 0)
      },
      {
        name: '登录次数',
        color: 'linear-gradient(180deg, #6385ff 0%, #c4d9ff 100%)',
        values: dashboard.activeStats.timesList.map(item => Number(item.num) || 0)
      }
    ]
  }));

  const deviceTotal = computed(() => dashboard.deviceStats.reduce((sum, item) => sum + (Number(item.num) || 0), 0));

  async function loadBaseStats() {
    dashboard.baseStats = await dashboardRepository.baseStats();
  }

  async function loadUserStats() {
    dashboard.userStats = await dashboardRepository.userStats(userDataType.value);
  }

  async function loadActiveStats() {
    dashboard.activeStats = await dashboardRepository.activeStats(activeDataType.value);
  }

  async function loadAppStats() {
    dashboard.appStats = await dashboardRepository.appStats(rankType.value);
  }

  async function loadDeviceStats() {
    dashboard.deviceStats = await dashboardRepository.deviceStats(deviceType.value);
  }

  async function init() {
    await Promise.all([
      loadBaseStats(),
      loadUserStats(),
      loadActiveStats(),
      loadAppStats(),
      loadDeviceStats()
    ]);
    lastUpdated.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  watch(userDataType, () => {
    loadUserStats();
  });

  watch(activeDataType, () => {
    loadActiveStats();
  });

  watch(rankType, () => {
    loadAppStats();
  });

  watch(deviceType, () => {
    loadDeviceStats();
  });

  onMounted(() => {
    init();
  });
</script>

<style scoped lang="scss">
  .DashboardView {
    display: grid;
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
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
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

    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
