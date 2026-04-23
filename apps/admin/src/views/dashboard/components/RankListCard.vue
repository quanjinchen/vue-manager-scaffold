<template>
  <section class="RankListCard-root surface-card">
    <header class="card-head">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <el-radio-group v-model="currentValue" size="small" @change="emit('change', currentValue)">
        <el-radio-button v-for="item in tabs" :key="item.id" :value="item.id">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </header>

    <div v-if="!list.length" class="empty-state">
      <AppEmpty />
    </div>

    <ol v-else class="rank-list">
      <li v-for="(item, index) in list" :key="item.name" class="rank-item">
        <div class="rank-meta">
          <span class="index">{{ index + 1 }}</span>
          <div class="copy">
            <strong>{{ item.name }}</strong>
            <p>{{ unitLabel }}</p>
          </div>
        </div>
        <div class="rank-main">
          <div class="track">
            <div class="fill" :style="{ width: `${getRatio(item.num)}%` }"></div>
          </div>
          <em>{{ formatStatisticNumber(item.num) }}</em>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts" name="RankListCard">
  import { computed } from 'vue';
  import { formatStatisticNumber } from '@vue-scaffold/utils';

  type RankItem = {
    name: string;
    num: number;
  };

  type TabItem = {
    id: string;
    name: string;
  };

  const props = defineProps<{
    title: string;
    subtitle: string;
    list: RankItem[];
    tabs: TabItem[];
    modelValue: string;
    unitLabel: string;
  }>();

  const emit = defineEmits<{
    change: [value: string];
  }>();

  const currentValue = computed({
    get: () => props.modelValue,
    set: value => emit('change', value)
  });

  const maxValue = computed(() => Math.max(...props.list.map(item => item.num), 1));

  function getRatio(value: number) {
    return Math.max((value / maxValue.value) * 100, 10);
  }
</script>

<style scoped lang="scss">
  .RankListCard-root {
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

  .rank-list {
    display: grid;
    gap: 16px;
  }

  .rank-item {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr);
    gap: 16px;
    align-items: center;
  }

  .rank-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .index {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #edf2ff;
    color: #0041c0;
    font-weight: 700;
  }

  .copy strong {
    display: block;
    color: #111827;
  }

  .copy p {
    margin: 4px 0 0;
    color: #98a2b3;
    font-size: 12px;
  }

  .rank-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .track {
    height: 12px;
    border-radius: 999px;
    background: #eef2f7;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #2d6df6 0%, #7aa3ff 100%);
  }

  .rank-main em {
    font-style: normal;
    color: #344054;
    font-weight: 600;
  }

  @media (max-width: 860px) {
    .rank-item {
      grid-template-columns: 1fr;
    }
  }
</style>
