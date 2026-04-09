<template>
  <el-input-number v-model="model" class="AppInputNumber-root" v-bind="inputNumberPropsResult" />
</template>

<script setup lang="ts" name="AppInputNumber">
  import { computed } from 'vue';
  import { useVModel, deepMerge } from '@vue-scaffold/utils';

  const props = defineProps({
    modelValue: {
      type: Number,
      default: 0
    },
    inputNumberProps: {
      type: Object,
      default: () => ({})
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const model = useVModel(props, emit);
  const inputNumberPropsResult = computed(() => deepMerge({}, props.inputNumberProps));
</script>
