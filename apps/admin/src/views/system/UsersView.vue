<template>
  <section class="UsersView">
    <div class="surface-card table-wrap">
      <AppTableList>
        <AppListHeader>
          <div class="header-search">
            <AppInput
              v-model="keyword"
              placeholder="Search by username, full name, phone, or email"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @update:model-value="loadUsers"
            />
          </div>
          <div class="header-handle">
            <AppButton :button-props="{ type: 'primary' }" @click="openCreate()">Create user</AppButton>
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

    <UserFormDialog
      v-model="dialogVisible"
      :record="selectedRecord"
      :organizations="organizations"
      @submit="handleSubmit"
    />
  </section>
</template>

<script setup lang="ts" name="UsersView">
  import { onMounted, ref } from 'vue';
  import { userStatusOptions } from '@vue-scaffold/constants';
  import { messageAlert, messageConfirm } from '@vue-scaffold/utils';
import UserFormDialog from '@/components/forms/UserFormDialog.vue';
import { organizationRepository, userRepository } from '@/mock/repository';
import type { OrganizationRecord, UserRecord } from '@/types/domain';

  const dialogVisible = ref(false);
  const keyword = ref('');
  const selectedRecord = ref<UserRecord | null>(null);
  const organizations = ref<OrganizationRecord[]>([]);
  const rows = ref<UserRecord[]>([]);

  const tableInfo = {
    columns: [
      { key: 'ordinal', label: '#', genre: '$ordinal', width: 64 },
      { key: 'userName', prop: 'userName', label: 'Username', minWidth: 160 },
      { key: 'name', prop: 'fullName', label: 'Full Name', minWidth: 180 },
      { key: 'phoneNum', prop: 'phoneNum', label: 'Phone', minWidth: 160 },
      { key: 'email', prop: 'email', label: 'Email', minWidth: 220 },
      {
        key: 'orgNames',
        prop: 'orgNames',
        label: 'Organizations',
        minWidth: 220,
        tagText: (row: UserRecord) => row.orgNames.join(', ') || '-'
      },
      {
        key: 'status',
        prop: 'status',
        label: 'Status',
        genre: '$tag',
        width: 120,
        tagMap: userStatusOptions
      },
      { key: 'updatedAt', prop: 'updatedAt', label: 'Updated', genre: '$date', minWidth: 180 },
      {
        key: 'actions',
        label: 'Actions',
        genre: '$action',
        width: 180,
        actions: [
          { key: 'edit', label: 'Edit', permissions: 'system:user:update' },
          { key: 'delete', label: 'Delete', permissions: 'system:user:delete', type: 'danger' }
        ]
      }
    ]
  };

  async function loadUsers() {
    rows.value = await userRepository.list(keyword.value);
  }

  async function loadOrganizations() {
    organizations.value = await organizationRepository.tree();
  }

  function openCreate() {
    selectedRecord.value = null;
    dialogVisible.value = true;
  }

  async function handleSubmit(payload: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>, id?: string) {
    if (id) {
      await userRepository.update(id, payload);
      messageAlert({ message: 'User updated' });
    } else {
      await userRepository.create(payload);
      messageAlert({ message: 'User created' });
    }
    await loadUsers();
  }

  async function handleAction(row: UserRecord, action: Record<string, any>) {
    if (action.key === 'edit') {
      selectedRecord.value = row;
      dialogVisible.value = true;
      return;
    }
    if (action.key === 'delete') {
      await messageConfirm(`Delete user ${row.fullName}?`);
      await userRepository.remove(row.id);
      messageAlert({ message: 'User deleted' });
      await loadUsers();
    }
  }

  onMounted(async () => {
    await loadOrganizations();
    await loadUsers();
  });
</script>

<style scoped lang="scss">
  .UsersView {
    display: grid;
    gap: 16px;
  }

  .table-wrap {
    padding: 16px;
  }
</style>
