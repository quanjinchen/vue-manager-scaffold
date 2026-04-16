<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `分配角色菜单${role ? ` - ${role.roleName}` : ''}`, width: 720 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <div class="GrantRoleMenusDialog-root">
      <el-tree
        ref="treeRef"
        :data="menus"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="{ label: 'label', children: 'children' }"
      />
    </div>
  </AppDialog>
</template>

<script setup lang="ts" name="GrantRoleMenusDialog">
  import { computed, nextTick, ref, watch } from 'vue';
  import type { RoleRecord } from '@/types/domain';

  export type GrantMenuTreeNode = {
    id: string;
    label: string;
    children?: GrantMenuTreeNode[];
  };

  const props = defineProps<{
    modelValue: boolean;
    role?: RoleRecord | null;
    menus: GrantMenuTreeNode[];
    checkedMenuIds: number[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    submit: [menuIds: number[]];
  }>();

  const treeRef = ref<any>();
  const submitLoading = ref(false);

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  async function syncCheckedKeys() {
    await nextTick();
    treeRef.value?.setCheckedKeys((props.checkedMenuIds ?? []).map(item => String(item)));
  }

  watch(
    () => [props.modelValue, props.checkedMenuIds, props.menus] as const,
    async ([modelValue]) => {
      if (modelValue) {
        await syncCheckedKeys();
      }
    },
    { immediate: true, deep: true }
  );

  async function handleSubmit() {
    submitLoading.value = true;
    try {
      const checkedKeys = (treeRef.value?.getCheckedKeys(false) ?? []) as Array<string | number>;
      const halfCheckedKeys = (treeRef.value?.getHalfCheckedKeys?.() ?? []) as Array<string | number>;
      const menuIds = [...new Set([...checkedKeys, ...halfCheckedKeys].map(item => Number(item)).filter(item => !Number.isNaN(item)))];
      await emit('submit', menuIds);
      visible.value = false;
    } finally {
      submitLoading.value = false;
    }
  }
</script>

<style scoped lang="scss">
  .GrantRoleMenusDialog-root {
    max-height: 520px;
    overflow: auto;
    padding-right: 4px;
  }
</style>
