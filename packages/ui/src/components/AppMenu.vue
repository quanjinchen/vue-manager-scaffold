<template>
  <el-menu
    class="AppMenu-root"
    :default-active="route.path"
    :collapse="collapsed"
    :router="true"
    background-color="transparent"
    text-color="#d0d5dd"
    active-text-color="#ffffff"
  >
    <AppMenuItems :list="list" />
  </el-menu>
</template>

<script setup lang="ts" name="AppMenu">
  import type { PropType } from 'vue';
  import { useRoute } from 'vue-router';
  import type { AccessMenuItem } from '@vue-scaffold/types';
  import AppMenuItems from './AppMenuItems.vue';

  defineProps({
    list: {
      type: Array as PropType<AccessMenuItem[]>,
      default: () => []
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  });

  const route = useRoute();
</script>

<style scoped lang="scss">
  .AppMenu-root {
    border-right: 0;
  }
</style>
