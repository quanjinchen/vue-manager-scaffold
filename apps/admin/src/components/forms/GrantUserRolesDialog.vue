<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `分配用户角色${user ? ` - ${user.fullName || user.userName}` : ''}`, width: 640 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <el-form label-position="top">
      <el-form-item label="角色列表">
        <AppSelectV2
          v-model="selectedRoleIds"
          :list="roles.map(item => ({ id: item.id, name: item.name }))"
          :select-v2-props="{ multiple: true, collapseTags: true, placeholder: '请选择角色' }"
        />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts" name="GrantUserRolesDialog">
  import { computed, ref, watch } from 'vue';
  import type { UserRecord } from '@/types/domain';

  export type GrantRoleOption = {
    id: string;
    name: string;
  };

  const props = defineProps<{
    modelValue: boolean;
    user?: UserRecord | null;
    roles: GrantRoleOption[];
    checkedRoleIds: number[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    submit: [roleIds: number[]];
  }>();

  const submitLoading = ref(false);
  const selectedRoleIds = ref<string[]>([]);

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  watch(
    () => props.checkedRoleIds,
    value => {
      selectedRoleIds.value = (value ?? []).map(item => String(item));
    },
    { immediate: true, deep: true }
  );

  async function handleSubmit() {
    submitLoading.value = true;
    try {
      await emit('submit', selectedRoleIds.value.map(item => Number(item)).filter(item => !Number.isNaN(item)));
      visible.value = false;
    } finally {
      submitLoading.value = false;
    }
  }
</script>
