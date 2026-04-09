<template>
  <section class="MenusView">
    <header class="toolbar surface-card">
      <AppListHeader>
        <div class="header-search">
          <div>
            <h2>Menus</h2>
            <p>Menu CRUD migrated from the IAM system menu module.</p>
          </div>
        </div>
        <div class="header-handle">
          <AppButton :button-props="{ type: 'primary' }" @click="openCreate()">Create menu</AppButton>
        </div>
      </AppListHeader>
    </header>

    <div class="surface-card table-wrap">
      <AppTable :table-props="{ data: flatMenus, rowKey: 'id' }" :table-info="tableInfo" @handle-click="handleAction">
        <template #icon="{ row }">
          <AppIcon v-if="row.icon" :name="row.icon" />
          <span v-else>-</span>
        </template>
      </AppTable>
    </div>

    <MenuFormDialog v-model="dialogVisible" :record="selectedRecord" :menus="menus" @submit="handleSubmit" />
  </section>
</template>

<script setup lang="ts" name="MenusView">
  import { computed, onMounted, ref } from 'vue';
  import { menuTypeOptions } from '@vue-scaffold/constants';
  import { messageAlert, messageConfirm } from '@vue-scaffold/utils';
import MenuFormDialog from '@/components/forms/MenuFormDialog.vue';
import { menuRepository } from '@/mock/repository';
import type { MenuRecord } from '@/types/domain';

  const menus = ref<MenuRecord[]>([]);
  const selectedRecord = ref<MenuRecord | null>(null);
  const dialogVisible = ref(false);

  const flatMenus = computed(() => {
    const walk = (items: MenuRecord[], level = 0): Array<MenuRecord & { displayName: string }> =>
      items.flatMap(item => [
        { ...item, displayName: `${'　'.repeat(level)}${item.menuName}` },
        ...walk(item.children ?? [], level + 1)
      ]);
    return walk(menus.value);
  });

  const menuTypeMap = Object.fromEntries(menuTypeOptions.map(item => [item.id, item.name]));

  const tableInfo = {
    columns: [
      { key: 'menuName', prop: 'displayName', label: 'Name', minWidth: 220 },
      { key: 'orderNum', prop: 'orderNum', label: 'Order', minWidth: 80 },
      {
        key: 'menuType',
        prop: 'menuType',
        label: 'Type',
        minWidth: 100,
        genre: '$tag',
        tagText: (row: MenuRecord) => menuTypeMap[row.menuType]
      },
      { key: 'icon', prop: 'icon', label: 'Icon', genre: '$slot', minWidth: 80 },
      { key: 'path', prop: 'path', label: 'Path', minWidth: 180 },
      { key: 'menuCode', prop: 'menuCode', label: 'Permission Code', minWidth: 180 },
      {
        key: 'enabled',
        prop: 'enabled',
        label: 'Enabled',
        minWidth: 100,
        genre: '$tag',
        tagText: (row: MenuRecord) => (row.enabled ? 'Enabled' : 'Disabled'),
        tagType: (row: MenuRecord) => (row.enabled ? 'success' : 'danger')
      },
      {
        key: 'actions',
        label: 'Actions',
        genre: '$action',
        width: 220,
        actions: [
          { key: 'append', label: 'Append', permissions: 'system:sysMenu:add' },
          { key: 'edit', label: 'Edit', permissions: 'system:sysMenu:update' },
          { key: 'delete', label: 'Delete', permissions: 'system:sysMenu:delete', type: 'danger' }
        ]
      }
    ]
  };

  async function loadData() {
    menus.value = await menuRepository.tree();
  }

  function openCreate(parent?: MenuRecord | null) {
    selectedRecord.value = parent
      ? {
          id: '',
          parentId: parent.id,
          menuType: 2,
          menuName: '',
          icon: '',
          path: '',
          menuCode: '',
          orderNum: 1,
          enabled: true,
          remark: '',
          children: []
        }
      : null;
    dialogVisible.value = true;
  }

  async function handleSubmit(payload: Omit<MenuRecord, 'id' | 'children'>, id?: string) {
    if (id) {
      await menuRepository.update(id, payload);
      messageAlert({ message: 'Menu updated' });
    } else {
      await menuRepository.create(payload);
      messageAlert({ message: 'Menu created' });
    }
    await loadData();
  }

  async function handleAction(row: MenuRecord, action: Record<string, any>) {
    if (action.key === 'append') {
      openCreate(row);
      return;
    }
    if (action.key === 'edit') {
      selectedRecord.value = row;
      dialogVisible.value = true;
      return;
    }
    if (action.key === 'delete') {
      await messageConfirm(`Delete menu ${row.menuName}?`);
      await menuRepository.remove(row.id);
      messageAlert({ message: 'Menu deleted' });
      await loadData();
    }
  }

  onMounted(loadData);
</script>

<style scoped lang="scss">
  .MenusView {
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

  .table-wrap {
    padding: 16px;
  }
</style>
