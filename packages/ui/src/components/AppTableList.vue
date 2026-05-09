<template>
  <div class="AppTableList-root">
    <slot />
  </div>
</template>

<script setup lang="ts" name="AppTableList"></script>

<style scoped lang="scss">
  .AppTableList-root {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
