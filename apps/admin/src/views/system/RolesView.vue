<template>
  <section class="RolesView">
    <div class="surface-card table-wrap">
      <AppTableList>
        <AppListHeader>
          <div class="header-search">
            <AppInput
              v-model="keyword"
              placeholder="按角色名称或编码搜索"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @update:model-value="loadRoles"
            />
          </div>
          <div class="header-handle">
            <AppButton :button-props="{ loading }" @click="loadRoles()">刷新</AppButton>
            <AppButton :button-props="{ type: 'primary' }" @click="openCreate()">新增角色</AppButton>
          </div>
        </AppListHeader>

        <AppTable
          :table-props="{ data: rows }"
          :table-info="tableInfo"
          :page-info="{ pageNum: 1, pageSize: 10 }"
          :loading="loading"
          @handle-click="handleAction"
        />
      </AppTableList>
    </div>

    <RoleFormDialog
      v-model="dialogVisible"
      :record="selectedRecord"
      @submit="handleSubmit"
    />
  </section>
</template>

<script setup lang="ts" name="RolesView">
  import { onMounted, ref } from 'vue';
  import { messageAlert, messageConfirm } from '@vue-scaffold/utils';
  import RoleFormDialog from '@/components/forms/RoleFormDialog.vue';
  import { requests } from '@/api/requests';
  import type { RoleRecord } from '@/types/domain';

  type RolePageItem = {
    id: number | string;
    code?: string;
    name?: string;
    dataScope?: string;
    status?: number;
    remark?: string;
    createTime?: string;
    updateTime?: string;
  };

  const dialogVisible = ref(false);
  const keyword = ref('');
  const selectedRecord = ref<RoleRecord | null>(null);
  const rows = ref<RoleRecord[]>([]);
  const loading = ref(false);
  const actionLoading = ref(false);

  const tableInfo = {
    columns: [
      { key: 'ordinal', label: '#', genre: '$ordinal', width: 64 },
      { key: 'roleName', prop: 'roleName', label: '角色名称', minWidth: 180 },
      { key: 'roleCode', prop: 'roleCode', label: '角色编码', minWidth: 180 },
      {
        key: 'systemDefault',
        prop: 'systemDefault',
        label: '角色类型',
        genre: '$tag',
        width: 120,
        tagText: (row: RoleRecord) => (row.systemDefault ? '内置角色' : '自定义角色'),
        tagType: (row: RoleRecord) => (row.systemDefault ? 'success' : 'primary')
      },
      { key: 'userNum', prop: 'userNum', label: '用户数', width: 100 },
      { key: 'userGroupNum', prop: 'userGroupNum', label: '分组数', width: 100 },
      { key: 'updatedAt', prop: 'updatedAt', label: '更新时间', genre: '$date', minWidth: 180 },
      {
        key: 'actions',
        label: '操作',
        genre: '$action',
        width: 200,
        actions: [
          { key: 'edit', label: '编辑', permissions: 'system:role:update' },
          { key: 'delete', label: '删除', permissions: 'system:role:delete', type: 'danger', visible: (row: RoleRecord) => !row.systemDefault }
        ]
      }
    ]
  };

  function mapRole(item: RolePageItem): RoleRecord {
    return {
      id: String(item.id),
      roleCode: item.code ?? '',
      roleName: item.name ?? '',
      userNum: 0,
      userGroupNum: 0,
      systemDefault: ['systemAdmin', 'ADMIN', 'SUPER_ADMIN'].includes(item.code ?? ''),
      dataScopeType: item.dataScope ?? '1',
      remark: item.remark ?? '',
      createdAt: item.createTime ?? '',
      updatedAt: item.updateTime ?? ''
    };
  }

  async function loadRoles() {
    loading.value = true;
    try {
      const result = await requests.roles.list.request({
        pageNum: 1,
        pageSize: 100,
        keyword: keyword.value
      });
      rows.value = Array.isArray(result?.records)
        ? result.records.map((item: RolePageItem) => mapRole(item))
        : [];
    } finally {
      loading.value = false;
    }
  }

  function openCreate() {
    selectedRecord.value = null;
    dialogVisible.value = true;
  }

  async function handleSubmit(payload: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt' | 'userNum' | 'userGroupNum'>, id?: string) {
    const requestBody = {
      id: id ? Number(id) : undefined,
      code: payload.roleCode,
      name: payload.roleName,
      dataScope: payload.dataScopeType ?? '1',
      status: 1,
      remark: payload.remark ?? ''
    };
    if (id) {
      await requests.roles.update.request(requestBody);
      messageAlert({ message: '角色更新成功' });
    } else {
      await requests.roles.save.request(requestBody);
      messageAlert({ message: '角色创建成功' });
    }
    await loadRoles();
  }

  async function handleAction(row: RoleRecord, action: Record<string, any>) {
    if (actionLoading.value) {
      return;
    }
    if (action.key === 'edit') {
      selectedRecord.value = row;
      dialogVisible.value = true;
      return;
    }
    if (action.key === 'delete') {
      actionLoading.value = true;
      try {
        await messageConfirm(`确认删除角色“${row.roleName}”吗？`);
        await requests.roles.delete.request({
          roleId: Number(row.id)
        });
        messageAlert({ message: '角色删除成功' });
        await loadRoles();
      } finally {
        actionLoading.value = false;
      }
    }
  }

  onMounted(async () => {
    await loadRoles();
  });
</script>

<style scoped lang="scss">
  .RolesView {
    display: grid;
    gap: 16px;
  }

  .table-wrap {
    padding: 16px;
  }
</style>
