<template>
  <el-select v-model="model" class="AppSelect-root" v-bind="selectPropsResult">
    <el-option v-for="item in list" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>

<script setup lang="ts" name="AppSelect">
  import { computed } from 'vue';
  import { useVModel, deepMerge } from '@vue-scaffold/utils';

  defineOptions({ inheritAttrs: false });

  const props = defineProps({
    modelValue: {
      type: [String, Number, Array],
      default: ''
    },
    list: {
      type: Array,
      default: () => []
    },
    selectProps: {
      type: Object,
      default: () => ({})
    }
  });

  const emit = defineEmits(['update:modelValue']);

  const model = useVModel(props, emit);
  const selectPropsResult = computed(() =>
    deepMerge(
      {
        style: 'width: 100%',
        clearable: true
      },
      props.selectProps
    )
  );
</script>
