<template>
  <div class="AppTableList-root">
    <slot />
  </div>
</template>

<script setup lang="ts" name="AppTableList"></script>

<style scoped lang="scss">
  .AppTableList-root {
    display: grid;
    gap: 16px;
  }
</style>
