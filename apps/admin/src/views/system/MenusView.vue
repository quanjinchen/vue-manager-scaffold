<template>
  <section class="MenusView">
    <header class="toolbar surface-card">
      <AppListHeader>
        <div class="header-search">
          <div>
            <h2>菜单管理</h2>
            <p>支持平台菜单树的维护、层级调整与权限编码管理。</p>
          </div>
        </div>
        <div class="header-handle">
          <AppButton :button-props="{ loading }" @click="loadData()">刷新</AppButton>
          <AppButton :button-props="{ type: 'primary' }" @click="openCreate()">新增菜单</AppButton>
        </div>
      </AppListHeader>
    </header>

    <div class="surface-card table-wrap">
      <AppTable :table-props="{ data: flatMenus, rowKey: 'id' }" :table-info="tableInfo" :loading="loading" @handle-click="handleAction">
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
  import { requests } from '@/api/requests';
  import type { MenuRecord } from '@/types/domain';

  type MenuTreeItem = {
    id: number | string;
    parentId?: number | string | null;
    name?: string;
    path?: string;
    menuType?: string;
    permissionCode?: string;
    sortOrder?: number;
    visible?: boolean;
    children?: MenuTreeItem[];
  };

  const menus = ref<MenuRecord[]>([]);
  const selectedRecord = ref<MenuRecord | null>(null);
  const dialogVisible = ref(false);
  const loading = ref(false);
  const actionLoading = ref(false);

  const flatMenus = computed(() => {
    const walk = (items: MenuRecord[], level = 0): Array<MenuRecord & { displayName: string }> =>
      items.flatMap(item => [
        { ...item, displayName: `${'　'.repeat(level)}${item.menuName}` },
        ...walk(item.children ?? [], level + 1)
      ]);
    return walk(menus.value);
  });

  const menuTypeMap = Object.fromEntries(menuTypeOptions.map((item: { id: number; name: string }) => [item.id, item.name]));

  const tableInfo = {
    columns: [
      { key: 'menuName', prop: 'displayName', label: '菜单名称', minWidth: 220 },
      { key: 'orderNum', prop: 'orderNum', label: '排序', minWidth: 80 },
      {
        key: 'menuType',
        prop: 'menuType',
        label: '类型',
        minWidth: 100,
        genre: '$tag',
        tagText: (row: MenuRecord) => menuTypeMap[row.menuType]
      },
      { key: 'icon', prop: 'icon', label: '图标', genre: '$slot', minWidth: 80 },
      { key: 'path', prop: 'path', label: '路径', minWidth: 180 },
      { key: 'menuCode', prop: 'menuCode', label: '权限编码', minWidth: 180 },
      {
        key: 'enabled',
        prop: 'enabled',
        label: '启用状态',
        minWidth: 100,
        genre: '$tag',
        tagText: (row: MenuRecord) => (row.enabled ? '启用' : '停用'),
        tagType: (row: MenuRecord) => (row.enabled ? 'success' : 'danger')
      },
      {
        key: 'actions',
        label: '操作',
        genre: '$action',
        width: 260,
        actions: [
          { key: 'append', label: '新增下级', permissions: 'system:menu:update' },
          { key: 'edit', label: '编辑', permissions: 'system:menu:update' },
          { key: 'delete', label: '删除', permissions: 'system:menu:delete', type: 'danger' }
        ]
      }
    ]
  };

  function mapMenuType(value?: string): 1 | 2 | 3 | 4 {
    if (value === 'CATALOG') {
      return 1;
    }
    if (value === 'BUTTON') {
      return 4;
    }
    return 2;
  }

  function toBackendMenuType(value: number) {
    if (value === 1) {
      return 'CATALOG';
    }
    if (value === 4) {
      return 'BUTTON';
    }
    return 'MENU';
  }

  function mapMenu(item: MenuTreeItem): MenuRecord {
    return {
      id: String(item.id),
      parentId: item.parentId === null || item.parentId === undefined ? null : String(item.parentId),
      menuType: mapMenuType(item.menuType),
      menuName: item.name ?? '',
      icon: '',
      path: item.path ?? '',
      menuCode: item.permissionCode ?? '',
      orderNum: Number(item.sortOrder ?? 1),
      enabled: item.visible !== false,
      remark: '',
      children: Array.isArray(item.children) ? item.children.map(mapMenu) : []
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await requests.menus.tree.request();
      menus.value = Array.isArray(result) ? result.map((item: MenuTreeItem) => mapMenu(item)) : [];
    } finally {
      loading.value = false;
    }
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
    const requestBody = {
      id: id ? Number(id) : undefined,
      parentId: payload.parentId ? Number(payload.parentId) : 0,
      name: payload.menuName,
      path: payload.path,
      menuType: toBackendMenuType(payload.menuType),
      permissionCode: payload.menuCode,
      sortOrder: payload.orderNum,
      visible: payload.enabled
    };
    if (id) {
      await requests.menus.update.request(requestBody);
      messageAlert({ message: '菜单更新成功' });
    } else {
      await requests.menus.save.request(requestBody);
      messageAlert({ message: '菜单创建成功' });
    }
    await loadData();
  }

  async function handleAction(row: MenuRecord, action: Record<string, any>) {
    if (actionLoading.value) {
      return;
    }
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
      actionLoading.value = true;
      try {
        await messageConfirm(`确认删除菜单“${row.menuName}”吗？`);
        await requests.menus.delete.request({
          menuId: Number(row.id)
        });
        messageAlert({ message: '菜单删除成功' });
        await loadData();
      } finally {
        actionLoading.value = false;
      }
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
