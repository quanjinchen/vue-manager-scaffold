<template>
  <section class="OrganizationsView">
    <header class="toolbar surface-card">
      <AppListHeader>
        <div class="header-search">
          <div>
            <h2>Organizations</h2>
            <p>Tree and CRUD management migrated from the IAM organization module.</p>
          </div>
        </div>
        <div class="header-handle">
          <AppButton :button-props="{ type: 'primary' }" @click="openCreate()">Create organization</AppButton>
        </div>
      </AppListHeader>
    </header>

    <section class="content">
      <div class="tree-panel surface-card">
        <h3>Organization Tree</h3>
        <el-tree
          :data="organizations"
          node-key="id"
          default-expand-all
          :props="{ label: 'orgName', children: 'children' }"
          @node-click="handleNodeClick"
        />
      </div>

      <div class="table-panel surface-card">
        <AppTable :table-props="{ data: flatOrganizations }" :table-info="tableInfo" @handle-click="handleAction" />
      </div>
    </section>

    <OrganizationFormDialog
      v-model="dialogVisible"
      :record="selectedRecord"
      :organizations="organizations"
      @submit="handleSubmit"
    />
  </section>
</template>

<script setup lang="ts" name="OrganizationsView">
  import { computed, onMounted, ref } from 'vue';
  import { messageAlert, messageConfirm } from '@vue-scaffold/utils';
import OrganizationFormDialog from '@/components/forms/OrganizationFormDialog.vue';
import { organizationRepository } from '@/mock/repository';
import type { OrganizationRecord } from '@/types/domain';

  const organizations = ref<OrganizationRecord[]>([]);
  const selectedRecord = ref<OrganizationRecord | null>(null);
  const dialogVisible = ref(false);

  const flatOrganizations = computed(() => {
    const walk = (items: OrganizationRecord[]): OrganizationRecord[] =>
      items.flatMap(item => [item, ...walk(item.children ?? [])]);
    return walk(organizations.value);
  });

  const tableInfo = {
    columns: [
      { key: 'name', prop: 'orgName', label: 'Organization', minWidth: 180 },
      { key: 'shortName', prop: 'shortName', label: 'Short Name', minWidth: 120 },
      { key: 'orderNum', prop: 'orderNum', label: 'Order', minWidth: 80 },
      { key: 'remark', prop: 'remark', label: 'Remark', minWidth: 180 },
      {
        key: 'actions',
        label: 'Actions',
        genre: '$action',
        width: 200,
        actions: [
          { key: 'edit', label: 'Edit', permissions: 'system:org:update' },
          { key: 'delete', label: 'Delete', permissions: 'system:org:delete', type: 'danger' }
        ]
      }
    ]
  };

  async function loadData() {
    organizations.value = await organizationRepository.tree();
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
    if (id) {
      await organizationRepository.update(id, payload);
      messageAlert({ message: 'Organization updated' });
    } else {
      await organizationRepository.create(payload);
      messageAlert({ message: 'Organization created' });
    }
    await loadData();
  }

  async function handleAction(row: OrganizationRecord, action: Record<string, any>) {
    if (action.key === 'edit') {
      selectedRecord.value = row;
      dialogVisible.value = true;
      return;
    }
    if (action.key === 'delete') {
      await messageConfirm(`Delete organization ${row.orgName}?`);
      await organizationRepository.remove(row.id);
      messageAlert({ message: 'Organization deleted' });
      await loadData();
    }
  }

  onMounted(loadData);
</script>

<style scoped lang="scss">
  .OrganizationsView {
    display: grid;
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
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
  }

  .tree-panel,
  .table-panel {
    padding: 20px;
  }

  h3 {
    margin: 0 0 16px;
  }
</style>
