<template>
  <section class="RolesView">
    <div class="surface-card table-wrap">
      <AppTableList>
        <AppListHeader>
          <div class="header-search">
            <AppInput
              v-model="keyword"
              placeholder="Search by role name or code"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @update:model-value="loadRoles"
            />
          </div>
          <div class="header-handle">
            <AppButton :button-props="{ type: 'primary' }" @click="openCreate()">Create role</AppButton>
          </div>
        </AppListHeader>

        <AppTable
          :table-props="{ data: rows }"
          :table-info="tableInfo"
          :page-info="{ pageNum: 1, pageSize: 10 }"
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
  import { roleRepository } from '@/mock/repository';
  import type { RoleRecord } from '@/types/domain';

  const dialogVisible = ref(false);
  const keyword = ref('');
  const selectedRecord = ref<RoleRecord | null>(null);
  const rows = ref<RoleRecord[]>([]);

  const tableInfo = {
    columns: [
      { key: 'ordinal', label: '#', genre: '$ordinal', width: 64 },
      { key: 'roleName', prop: 'roleName', label: 'Role Name', minWidth: 180 },
      { key: 'roleCode', prop: 'roleCode', label: 'Role Code', minWidth: 180 },
      {
        key: 'systemDefault',
        prop: 'systemDefault',
        label: 'Role Type',
        genre: '$tag',
        width: 120,
        tagText: (row: RoleRecord) => (row.systemDefault ? 'Default' : 'Custom'),
        tagType: (row: RoleRecord) => (row.systemDefault ? 'success' : 'primary')
      },
      { key: 'userNum', prop: 'userNum', label: 'Users', width: 100 },
      { key: 'userGroupNum', prop: 'userGroupNum', label: 'Groups', width: 100 },
      { key: 'updatedAt', prop: 'updatedAt', label: 'Updated', genre: '$date', minWidth: 180 },
      {
        key: 'actions',
        label: 'Actions',
        genre: '$action',
        width: 180,
        actions: [
          { key: 'edit', label: 'Edit', permissions: 'system:sysRole:update' },
          { key: 'delete', label: 'Delete', permissions: 'system:sysRole:delete', type: 'danger', visible: (row: RoleRecord) => !row.systemDefault }
        ]
      }
    ]
  };

  async function loadRoles() {
    rows.value = await roleRepository.list(keyword.value);
  }

  function openCreate() {
    selectedRecord.value = null;
    dialogVisible.value = true;
  }

  async function handleSubmit(payload: Omit<RoleRecord, 'id' | 'createdAt' | 'updatedAt' | 'userNum' | 'userGroupNum'>, id?: string) {
    if (id) {
      await roleRepository.update(id, payload);
      messageAlert({ message: 'Role updated' });
    } else {
      await roleRepository.create(payload);
      messageAlert({ message: 'Role created' });
    }
    await loadRoles();
  }

  async function handleAction(row: RoleRecord, action: Record<string, any>) {
    if (action.key === 'edit') {
      selectedRecord.value = row;
      dialogVisible.value = true;
      return;
    }
    if (action.key === 'delete') {
      await messageConfirm(`Delete role ${row.roleName}?`);
      await roleRepository.remove(row.id);
      messageAlert({ message: 'Role deleted' });
      await loadRoles();
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
