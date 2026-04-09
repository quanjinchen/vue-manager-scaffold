<template>
  <section class="TrendChartCard-root surface-card">
    <header class="card-head">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <el-radio-group v-if="tabs.length" v-model="currentValue" size="small" @change="emit('change', currentValue)">
        <el-radio-button v-for="item in tabs" :key="item.id" :value="item.id">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </header>

    <div v-if="!series.length" class="empty-state">
      <AppEmpty />
    </div>

    <div v-else class="chart-shell">
      <div class="axis">
        <span v-for="label in labels" :key="label">{{ label }}</span>
      </div>
      <div class="series-list">
        <div v-for="item in series" :key="item.name" class="series-row">
          <div class="series-label">
            <i :style="{ background: item.color }"></i>
            <span>{{ item.name }}</span>
          </div>
          <div class="bars">
            <div
              v-for="(value, index) in item.values"
              :key="`${item.name}-${labels[index]}`"
              class="bar-wrap"
            >
              <div class="bar" :style="{ height: `${getBarHeight(value)}%`, background: item.color }"></div>
              <em>{{ formatStatisticNumber(value) }}</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts" name="TrendChartCard">
  import { computed } from 'vue';
  import { formatStatisticNumber } from '@vue-scaffold/utils';

  type TabItem = {
    id: string;
    name: string;
  };

  type SeriesItem = {
    name: string;
    color: string;
    values: number[];
  };

  const props = defineProps<{
    title: string;
    subtitle: string;
    labels: string[];
    tabs?: TabItem[];
    modelValue?: string;
    series: SeriesItem[];
  }>();

  const emit = defineEmits<{
    change: [value: string];
  }>();

  const currentValue = computed({
    get: () => props.modelValue ?? '',
    set: value => emit('change', value)
  });

  const maxValue = computed(() => Math.max(...props.series.flatMap(item => item.values), 1));

  function getBarHeight(value: number) {
    return Math.max((value / maxValue.value) * 100, 8);
  }
</script>

<style scoped lang="scss">
  .TrendChartCard-root {
    padding: 24px;
    min-height: 320px;
  }

  .card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card-head h3 {
    margin: 0 0 6px;
    font-size: 18px;
    color: #1f2937;
  }

  .card-head p {
    margin: 0;
    color: #667085;
  }

  .empty-state {
    min-height: 220px;
    display: grid;
    place-items: center;
  }

  .chart-shell {
    display: grid;
    gap: 16px;
  }

  .axis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
    gap: 12px;
    color: #98a2b3;
    font-size: 12px;
    text-align: center;
  }

  .series-list {
    display: grid;
    gap: 18px;
  }

  .series-row {
    display: grid;
    gap: 12px;
  }

  .series-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #344054;
    font-weight: 600;
  }

  .series-label i {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    display: inline-block;
  }

  .bars {
    height: 160px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
    gap: 12px;
    align-items: end;
  }

  .bar-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
    gap: 8px;
  }

  .bar {
    width: 100%;
    min-height: 8px;
    border-radius: 14px 14px 8px 8px;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.2);
  }

  .bar-wrap em {
    font-style: normal;
    font-size: 12px;
    color: #667085;
  }
</style>
