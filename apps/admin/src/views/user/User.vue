<template>
  <section class="User">
    <div class="surface-card table-wrap">
      <AppTableList>
        <AppListHeader>
          <div class="header-search">
            <AppInput
              v-model="keyword"
              placeholder="按用户名、姓名、手机号或邮箱搜索"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @update:model-value="loadUsers"
            />
          </div>
          <div class="header-handle">
            <AppButton :button-props="{ loading }" @click="refreshPageData()">刷新</AppButton>
          <AppButton :button-props="{ type: 'primary' }" v-permission="'system:user:add'" @click="openCreate()">新增用户</AppButton>
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

    <UserFormDialog
      v-model="dialogVisible"
      :record="selectedRecord"
      :organizations="organizations"
      @submit="handleSubmit"
    />
    <GrantUserRolesDialog
      v-model="grantDialogVisible"
      :user="selectedGrantUser"
      :roles="roleOptions"
      :checked-role-ids="checkedRoleIds"
      @submit="handleGrantRoles"
    />
  </section>
</template>

<script setup lang="ts" name="User">
  import { onMounted, ref } from 'vue';
  import { userStatusOptions } from '@vue-scaffold/constants';
  import { messageAlert, messageConfirm } from '@vue-scaffold/utils';
  import UserFormDialog from '@/components/forms/UserFormDialog.vue';
  import GrantUserRolesDialog, { type GrantRoleOption } from '@/components/forms/GrantUserRolesDialog.vue';
  import { requests } from '@/api/requests';
  import type { OrganizationRecord, UserRecord } from '@/types/domain';

  type UserPageItem = {
    id: number | string;
    username?: string;
    nickname?: string;
    phone?: string;
    email?: string;
    orgId?: number | string | null;
    status?: number | null;
  };

  type OrgTreeItem = {
    id: number | string;
    parentId?: number | string | null;
    name?: string;
    orgCode?: string;
    sortOrder?: number;
    children?: OrgTreeItem[];
  };

  type RolePageItem = {
    id: number | string;
    code?: string;
    name?: string;
  };

  type UserRoleInfo = {
    roleId?: number;
  };

  const dialogVisible = ref(false);
  const grantDialogVisible = ref(false);
  const keyword = ref('');
  const selectedRecord = ref<UserRecord | null>(null);
  const selectedGrantUser = ref<UserRecord | null>(null);
  const organizations = ref<OrganizationRecord[]>([]);
  const roleOptions = ref<GrantRoleOption[]>([]);
  const checkedRoleIds = ref<number[]>([]);
  const rows = ref<UserRecord[]>([]);
  const loading = ref(false);
  const actionLoading = ref(false);

  const tableInfo = {
    columns: [
      { key: 'ordinal', label: '#', genre: '$ordinal', width: 64 },
      { key: 'userName', prop: 'userName', label: '用户名', minWidth: 160 },
      { key: 'name', prop: 'fullName', label: '昵称', minWidth: 180 },
      { key: 'phoneNum', prop: 'phoneNum', label: '手机号', minWidth: 160 },
      { key: 'email', prop: 'email', label: '邮箱', minWidth: 220 },
      {
        key: 'orgNames',
        prop: 'orgNames',
        label: '所属组织',
        minWidth: 220,
        tagText: (row: UserRecord) => row.orgNames.join(', ') || '-'
      },
      {
        key: 'status',
        prop: 'status',
        label: '状态',
        genre: '$tag',
        width: 120,
        tagMap: userStatusOptions
      },
      { key: 'updatedAt', prop: 'updatedAt', label: '更新时间', genre: '$date', minWidth: 180 },
      {
        key: 'actions',
        label: '操作',
        genre: '$action',
        width: 380,
        actions: [
          { key: 'grantRoles', label: '分配角色', permissions: 'system:user:update' },
          { key: 'edit', label: '编辑', permissions: 'system:user:update' },
          { key: 'resetPassword', label: '重置密码', permissions: 'system:user:resetPassword', type: 'warning' },
          { key: 'delete', label: '删除', permissions: 'system:user:delete', type: 'danger' }
        ]
      }
    ]
  };

  function buildOrgNameMap(items: OrganizationRecord[]) {
    const nameMap = new Map<string, string>();
    const walk = (nodes: OrganizationRecord[]) => {
      nodes.forEach(item => {
        nameMap.set(item.id, item.orgName);
        walk(item.children ?? []);
      });
    };
    walk(items);
    return nameMap;
  }

  function mapOrganization(item: OrgTreeItem): OrganizationRecord {
    return {
      id: String(item.id),
      parentId: item.parentId === null || item.parentId === undefined ? null : String(item.parentId),
      orgName: item.name ?? '',
      shortName: item.orgCode ?? '',
      orderNum: Number(item.sortOrder ?? 1),
      remark: '',
      children: Array.isArray(item.children) ? item.children.map(mapOrganization) : []
    };
  }

  function mapUser(item: UserPageItem, orgNameMap: Map<string, string>): UserRecord {
    const orgId = item.orgId === null || item.orgId === undefined ? '' : String(item.orgId);
    const orgName = orgId ? orgNameMap.get(orgId) ?? '' : '';
    return {
      id: String(item.id),
      userName: item.username ?? '',
      fullName: item.nickname ?? '',
      phoneNum: item.phone ?? '',
      email: item.email ?? '',
      orgIds: orgId ? [orgId] : [],
      orgNames: orgName ? [orgName] : [],
      status: Number(item.status ?? 1) === 1 ? 'active' : 'disabled',
      createdAt: '',
      updatedAt: '',
      remark: ''
    };
  }

  function mapRoleOption(item: RolePageItem): GrantRoleOption {
    return {
      id: String(item.id),
      name: item.name || item.code || ''
    };
  }

  async function loadUsers() {
    loading.value = true;
    try {
      const orgNameMap = buildOrgNameMap(organizations.value);
      const result = await requests.users.list('/api/user/list-user', {
        pageNum: 1,
        pageSize: 100,
        keyword: keyword.value
      });
      rows.value = Array.isArray(result?.records)
        ? result.records.map((item: UserPageItem) => mapUser(item, orgNameMap))
        : [];
    } finally {
      loading.value = false;
    }
  }

  async function loadOrganizations() {
      loading.value = true;
      try {
        const result = await requests.organizations.tree('/api/org/list-all-org-tree', {});
        organizations.value = Array.isArray(result) ? result.map((item: OrgTreeItem) => mapOrganization(item)) : [];
      } finally {
        loading.value = false;
      }
  }

  async function refreshPageData() {
    loading.value = true;
    try {
      const orgResult = await requests.organizations.tree('/api/org/list-all-org-tree', {});
      organizations.value = Array.isArray(orgResult) ? orgResult.map((item: OrgTreeItem) => mapOrganization(item)) : [];
      const orgNameMap = buildOrgNameMap(organizations.value);
      const userResult = await requests.users.list('/api/user/list-user', {
        pageNum: 1,
        pageSize: 100,
        keyword: keyword.value
      });
      rows.value = Array.isArray(userResult?.records)
        ? userResult.records.map((item: UserPageItem) => mapUser(item, orgNameMap))
        : [];
    } finally {
      loading.value = false;
    }
  }

  function openCreate() {
    selectedRecord.value = null;
    dialogVisible.value = true;
  }

  async function handleSubmit(payload: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>, id?: string) {
    const requestBody = {
      id: id ? Number(id) : undefined,
      username: payload.userName,
      nickname: payload.fullName,
      phone: payload.phoneNum,
      email: payload.email,
      orgId: payload.orgIds[0] ? Number(payload.orgIds[0]) : undefined,
      status: payload.status === 'active' ? 1 : 0
    };
    if (id) {
      await requests.users.update('/api/user/update-user', requestBody);
      messageAlert({ message: '用户更新成功' });
    } else {
      await requests.users.save('/api/user/create-user', {
        ...requestBody,
        password: '123456'
      });
      messageAlert({ message: '用户创建成功' });
    }
    await refreshPageData();
  }

  async function openGrantRoles(row: UserRecord) {
    actionLoading.value = true;
    try {
      const [roleResult, userRoleResult] = await Promise.all([
        requests.roles.list('/api/role/list-role', {
          pageNum: 1,
          pageSize: 100,
          keyword: ''
        }),
        requests.userRoles.list('/api/user-role/list-user-role', {
          userId: Number(row.id)
        })
      ]);
      roleOptions.value = Array.isArray(roleResult?.records) ? roleResult.records.map((item: RolePageItem) => mapRoleOption(item)) : [];
      checkedRoleIds.value = Array.isArray(userRoleResult)
        ? userRoleResult.map((item: UserRoleInfo) => Number(item.roleId)).filter(item => !Number.isNaN(item))
        : [];
      selectedGrantUser.value = row;
      grantDialogVisible.value = true;
    } finally {
      actionLoading.value = false;
    }
  }

  async function handleGrantRoles(roleIds: number[]) {
    if (!selectedGrantUser.value) {
      return;
    }
    await requests.userRoles.grant('/api/user-role/grant-user-roles', {
      userId: Number(selectedGrantUser.value.id),
      roleIds
    });
    messageAlert({ message: '用户角色分配成功' });
  }

  async function handleAction(row: UserRecord, action: Record<string, any>) {
    if (actionLoading.value) {
      return;
    }
    if (action.key === 'grantRoles') {
      await openGrantRoles(row);
      return;
    }
    if (action.key === 'edit') {
      selectedRecord.value = row;
      dialogVisible.value = true;
      return;
    }
    if (action.key === 'resetPassword') {
      actionLoading.value = true;
      try {
        await messageConfirm(`确认重置用户“${row.fullName || row.userName}”的密码吗？`);
        await requests.users.resetPassword('/api/user/reset-user-password', {
          userId: Number(row.id)
        });
        messageAlert({ message: '密码重置成功' });
        await refreshPageData();
        return;
      } finally {
        actionLoading.value = false;
      }
    }
    if (action.key === 'delete') {
      actionLoading.value = true;
      try {
        await messageConfirm(`确认删除用户“${row.fullName || row.userName}”吗？`);
        await requests.users.delete('/api/user/delete-user', {
          userId: Number(row.id)
        });
        messageAlert({ message: '用户删除成功' });
        await refreshPageData();
      } finally {
        actionLoading.value = false;
      }
    }
  }

  onMounted(async () => {
    await refreshPageData();
  });
</script>

<style scoped lang="scss">
  .User {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .table-wrap {
    padding: 16px;
  }
</style>
