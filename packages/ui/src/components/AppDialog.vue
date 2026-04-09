<template>
  <el-dialog v-model="showModel" class="AppDialog-root" v-bind="modalPropsResult">
    <slot />

    <template v-if="footerPropsResult.buttons.length > 0" #footer>
      <div class="AppDialog-footer" :style="footerPropsResult.styles">
        <AppButton
          v-for="(item, index) in footerPropsResult.buttons"
          :key="`${item.text}-${index}`"
          :button-props="item.buttonProps ?? { type: item.type ?? 'default' }"
          @click="buttonClick(item)"
        >
          {{ item.text }}
        </AppButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="AppDialog">
  import { useAttrs } from 'vue';
  import { modalProps, useModal } from '../composables';
  import AppButton from './AppButton.vue';

  const props = defineProps({
    ...modalProps
  });

  const emit = defineEmits(['update:modelValue']);
  const attrs = useAttrs();

  const { showModel, modalPropsResult, footerPropsResult, buttonClick } = useModal(props, attrs, emit);
</script>

<style scoped lang="scss">
  .AppDialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
