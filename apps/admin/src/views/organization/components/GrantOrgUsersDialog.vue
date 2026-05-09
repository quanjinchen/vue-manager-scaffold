<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `分配组织用户${organization ? ` - ${organization.orgName}` : ''}`, width: 680 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: handleSubmit }
      ]
    }"
  >
    <el-form label-position="top">
      <el-form-item label="用户列表">
        <AppSelectV2
          v-model="selectedUserIds"
          :list="users.map(item => ({ id: item.id, name: item.name }))"
          :select-v2-props="{ multiple: true, collapseTags: true, placeholder: '请选择用户' }"
        />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts" name="GrantOrgUsersDialog">
  import { computed, ref, watch } from 'vue';
  import type { OrganizationRecord } from '@/types/domain';

  export type GrantUserOption = {
    id: string;
    name: string;
  };

  const props = defineProps<{
    modelValue: boolean;
    organization?: OrganizationRecord | null;
    users: GrantUserOption[];
    checkedUserIds: number[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    submit: [userIds: number[]];
  }>();

  const submitLoading = ref(false);
  const selectedUserIds = ref<string[]>([]);

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  watch(
    () => props.checkedUserIds,
    value => {
      selectedUserIds.value = (value ?? []).map(item => String(item));
    },
    { immediate: true, deep: true }
  );

  async function handleSubmit() {
    submitLoading.value = true;
    try {
      await emit('submit', selectedUserIds.value.map(item => Number(item)).filter(item => !Number.isNaN(item)));
      visible.value = false;
    } finally {
      submitLoading.value = false;
    }
  }
</script>
