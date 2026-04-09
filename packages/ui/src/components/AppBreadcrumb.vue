<template>
  <el-breadcrumb class="AppBreadcrumb-root" separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts" name="AppBreadcrumb">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const breadcrumbItems = computed(() =>
  route.matched
    .filter((item) => item.meta?.title && item.name !== "root")
    .map((item) => ({
      path: item.path,
      title: String(item.meta?.title ?? item.name ?? item.path),
    })),
);
</script>

<style scoped lang="scss">
.AppBreadcrumb-root {
  height: 56px;
  padding: 0 24px;
  background-color: #fff;
  border-bottom: 1px solid #dfe0e2;
  display: flex;
  align-items: center;
  flex: none;
  font-size: 16px;
  .title {
    color: var(--el-text-color-primary);
    font-weight: bold;
    flex: none;
  }
  .desc {
    color: #646670;
    font-size: 14px;
    .el-link {
      vertical-align: initial;
    }
  }
}

.AppBreadcrumb-root.single :deep(.el-breadcrumb__item) {
  .el-breadcrumb__inner {
    color: var(--el-text-color-primary);
    font-weight: bold;
  }
}

.AppBreadcrumb-root :deep(.el-breadcrumb__item) {
  .el-breadcrumb__separator {
    font-weight: normal;
  }
  .el-breadcrumb__inner {
    color: #a7a8ad;
    &.is-link,
    a {
      font-weight: normal !important;
      transition: all 0.2s;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
  &:last-of-type {
    .el-breadcrumb__inner {
      color: var(--el-text-color-primary);
    }
  }
}
</style>
