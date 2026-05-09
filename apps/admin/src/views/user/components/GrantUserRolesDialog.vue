<template>
  <AppDialog
    v-model="visible"
    :modal-props="{ title: `分配用户角色${props.user ? ` - ${props.user.fullName || props.user.userName}` : ''}`, width: 640 }"
    :footer-props="{
      buttons: [
        { text: '取消', close: true, buttonProps: {} },
        { text: submitLoading ? '保存中...' : '保存', close: false, buttonProps: { type: 'primary', loading: submitLoading }, click: dataInfo.handleSubmit }
      ]
    }"
  >
    <el-form label-position="top" v-loading="dataInfo.loading">
      <el-form-item label="角色列表">
        <AppSelectV2
          v-model="dataInfo.selectedRoleIds"
          :list="dataInfo.roleOptions.map(item => ({ id: item.id, name: item.name }))"
          :select-v2-props="{ multiple: true, collapseTags: true, placeholder: '请选择角色' }"
        />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts" name="GrantUserRolesDialog">
  import { computed, reactive, watch, toRefs } from 'vue';
  import { messageAlert } from '@vue-scaffold/utils';
  import { requests } from '@/api/requests';
  import type { UserRecord } from '@/types/domain';

  export type GrantRoleOption = {
    id: string;
    name: string;
  };

  type RolePageItem = {
    id: number | string;
    code?: string;
    name?: string;
  };

  type UserRoleInfo = {
    roleId?: number;
  };

  const props = defineProps<{
    modelValue: boolean;
    user?: UserRecord | null;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [boolean];
    success: [];
  }>();

  const visible = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  // 数据信息
  const dataInfo: any = reactive({
    loading: false,
    submitLoading: false,
    roleOptions: [] as GrantRoleOption[],
    selectedRoleIds: [] as string[],

    // 映射角色选项
    mapRoleOption(item: RolePageItem): GrantRoleOption {
      return {
        id: String(item.id),
        name: item.name || item.code || ''
      };
    },

    // 获取角色列表和用户已有角色
    async loadData() {
      if (!props.user?.id) {
        return;
      }

      this.loading = true;
      try {
        const [roleResult, userRoleResult] = await Promise.all([
          requests.roles.list({
            pageNum: 1,
            pageSize: 100,
            keyword: ''
          }),
          requests.userRoles.list({
            userId: Number(props.user.id)
          })
        ]);

        this.roleOptions = Array.isArray(roleResult?.records)
          ? roleResult.records.map((item: RolePageItem) => this.mapRoleOption(item))
          : [];

        const checkedRoleIds = Array.isArray(userRoleResult)
          ? userRoleResult
              .map((item: UserRoleInfo) => Number(item.roleId))
              .filter(item => !Number.isNaN(item))
          : [];

        this.selectedRoleIds = checkedRoleIds.map(item => String(item));
      } finally {
        this.loading = false;
      }
    },

    // 提交表单
    async handleSubmit() {
      if (!props.user?.id) {
        return;
      }

      this.submitLoading = true;
      try {
        const roleIds = this.selectedRoleIds
          .map((item: string) => Number(item))
          .filter((item: number) => !Number.isNaN(item));

        await requests.userRoles.grant({
          userId: Number(props.user.id),
          roleIds
        });

        messageAlert({ message: '用户角色分配成功' });
        visible.value = false;
        emit('success');
      } finally {
        this.submitLoading = false;
      }
    }
  });

  const { submitLoading } = toRefs(dataInfo);

  // 监听对话框打开，加载数据
  watch(
    () => props.modelValue,
    value => {
      if (value && props.user) {
        dataInfo.loadData();
      }
    },
    { immediate: true }
  );

  // 暴露
  defineExpose({ dataInfo });
</script>
