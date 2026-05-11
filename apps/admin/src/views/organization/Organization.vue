<template>
  <section class="Organization">
    <header class="toolbar surface-card">
      <AppListHeader>
        <div class="header-search">
          <div>
            <h2>组织管理</h2>
            <p>支持组织树浏览、创建与编辑维护。</p>
          </div>
        </div>
        <div class="header-handle">
          <AppButton :button-props="{ loading }" @click="loadData()">刷新</AppButton>
          <AppButton :button-props="{ type: 'primary' }" v-permission="'system:org:update'" @click="openCreate()">新增组织</AppButton>
        </div>
      </AppListHeader>
    </header>

    <section class="content">
      <div class="tree-panel surface-card">
        <h3>组织树</h3>
        <el-tree
          :data="organizations"
          node-key="id"
          default-expand-all
          :props="{ label: 'orgName', children: 'children' }"
          @node-click="handleNodeClick"
        />
      </div>

      <div class="table-panel surface-card">
        <AppTable :table-props="{ data: flatOrganizations }" :table-info="tableInfo" :loading="loading" @handle-click="handleAction" />
      </div>
    </section>

    <OrganizationFormDialog
      v-model="dialogVisible"
      :record="selectedRecord"
      :organizations="organizations"
      @submit="handleSubmit"
    />
    <GrantOrgUsersDialog
      v-model="grantDialogVisible"
      :organization="selectedGrantOrg"
      :users="userOptions"
      :checked-user-ids="checkedUserIds"
      @submit="handleGrantUsers"
    />
  </section>
</template>

<script setup lang="ts" name="Organization">
  import { computed, onMounted, ref } from 'vue';
  import { messageAlert, messageConfirm } from '@vue-scaffold/utils';
  import OrganizationFormDialog from '@/views/organization/components/OrganizationFormDialog.vue';
  import GrantOrgUsersDialog, { type GrantUserOption } from '@/views/organization/components/GrantOrgUsersDialog.vue';
  import { requests } from '@/api/requests';
  import type { OrganizationRecord } from '@/types/domain';

  type OrgTreeItem = {
    id: number | string;
    parentId?: number | string | null;
    orgCode?: string;
    name?: string;
    leaderName?: string;
    sortOrder?: number;
    children?: OrgTreeItem[];
  };

  type UserPageItem = {
    id: number | string;
    username?: string;
    nickname?: string;
  };

  type OrgUserInfo = {
    userId?: number;
  };

  const organizations = ref<OrganizationRecord[]>([]);
  const selectedRecord = ref<OrganizationRecord | null>(null);
  const selectedGrantOrg = ref<OrganizationRecord | null>(null);
  const dialogVisible = ref(false);
  const grantDialogVisible = ref(false);
  const loading = ref(false);
  const actionLoading = ref(false);
  const userOptions = ref<GrantUserOption[]>([]);
  const checkedUserIds = ref<number[]>([]);

  const flatOrganizations = computed(() => {
    const walk = (items: OrganizationRecord[]): OrganizationRecord[] =>
      items.flatMap(item => [item, ...walk(item.children ?? [])]);
    return walk(organizations.value);
  });

  const tableInfo = {
    columns: [
      { key: 'name', prop: 'orgName', label: '组织名称', minWidth: 180 },
      { key: 'shortName', prop: 'shortName', label: '组织简称', minWidth: 120 },
      { key: 'orderNum', prop: 'orderNum', label: '排序', minWidth: 80 },
      { key: 'remark', prop: 'remark', label: '备注', minWidth: 180 },
      {
        key: 'actions',
        label: '操作',
        genre: '$action',
        width: 280,
        actions: [
          { key: 'grantUsers', label: '分配用户', permissions: 'system:org:update' },
          { key: 'edit', label: '编辑', permissions: 'system:org:update' },
          { key: 'delete', label: '删除', permissions: 'system:org:delete', type: 'danger' }
        ]
      }
    ]
  };

  function mapOrganization(item: OrgTreeItem): OrganizationRecord {
    return {
      id: String(item.id),
      parentId: item.parentId === null || item.parentId === undefined ? null : String(item.parentId),
      orgName: item.name ?? '',
      shortName: item.orgCode ?? '',
      orderNum: Number(item.sortOrder ?? 1),
      remark: item.leaderName ?? '',
      children: Array.isArray(item.children) ? item.children.map(mapOrganization) : []
    };
  }

  function mapUserOption(item: UserPageItem): GrantUserOption {
    return {
      id: String(item.id),
      name: item.nickname || item.username || ''
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await requests.organizations.tree({});
      organizations.value = Array.isArray(result) ? result.map((item: OrgTreeItem) => mapOrganization(item)) : [];
    } finally {
      loading.value = false;
    }
  }

  function handleNodeClick(node: OrganizationRecord) {
    selectedRecord.value = node;
  }

  function openCreate(parent?: OrganizationRecord | null) {
    selectedRecord.value = parent
      ? {
          parentId: parent.id,
          orgName: '',
          shortName: '',
          orderNum: 1,
          remark: '',
          id: '',
          children: []
        }
      : null;
    dialogVisible.value = true;
  }

  async function handleSubmit(payload: Omit<OrganizationRecord, 'id' | 'children'>, id?: string) {
    const requestBody = {
      id: id ? Number(id) : undefined,
      parentId: payload.parentId ? Number(payload.parentId) : 0,
      orgCode: payload.shortName ?? '',
      name: payload.orgName,
      leaderName: payload.remark ?? '',
      sortOrder: payload.orderNum,
      status: 1
    };
    if (id) {
      await requests.organizations.update(requestBody);
      messageAlert({ message: '组织更新成功' });
    } else {
      await requests.organizations.save(requestBody);
      messageAlert({ message: '组织创建成功' });
    }
    await loadData();
  }

  async function openGrantUsers(row: OrganizationRecord) {
    actionLoading.value = true;
    try {
      const [userResult, orgUserResult] = await Promise.all([
        requests.users.list({
          pageNum: 1,
          pageSize: 100,
          keyword: ''
        }),
        requests.orgUsers.list({
          orgId: Number(row.id)
        })
      ]);
      userOptions.value = Array.isArray(userResult?.records) ? userResult.records.map((item: UserPageItem) => mapUserOption(item)) : [];
      checkedUserIds.value = Array.isArray(orgUserResult)
        ? orgUserResult.map((item: OrgUserInfo) => Number(item.userId)).filter(item => !Number.isNaN(item))
        : [];
      selectedGrantOrg.value = row;
      grantDialogVisible.value = true;
    } finally {
      actionLoading.value = false;
    }
  }

  async function handleGrantUsers(userIds: number[]) {
    if (!selectedGrantOrg.value) {
      return;
    }
    await requests.orgUsers.grant({
      orgId: Number(selectedGrantOrg.value.id),
      userIds
    });
    messageAlert({ message: '组织用户分配成功' });
  }

  async function handleAction(row: OrganizationRecord, action: Record<string, any>) {
    if (actionLoading.value) {
      return;
    }
    if (action.key === 'grantUsers') {
      await openGrantUsers(row);
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
        await messageConfirm(`确认删除组织“${row.orgName}”吗？`);
        await requests.organizations.delete({
          orgId: Number(row.id)
        });
        messageAlert({ message: '组织删除成功' });
        await loadData();
      } finally {
        actionLoading.value = false;
      }
    }
  }

  onMounted(loadData);
</script>

<style scoped lang="scss">
  .Organization {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .toolbar {
    padding: 20px 24px;
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 16px;
  }

  .toolbar p {
    margin: 8px 0 0;
    color: #667085;
  }

  .toolbar :deep(.AppListHeader-root) {
    width: 100%;
  }

  .content {
    display: flex;
    gap: 20px;
  }

  .tree-panel {
    flex: 0 0 320px;
    padding: 20px;
  }

  .table-panel {
    flex: 1;
    min-width: 0;
    padding: 20px;
  }

  h3 {
    margin: 0 0 16px;
  }
</style>
