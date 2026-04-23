<template>
  <section class="Menu">
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
          <AppButton :button-props="{ type: 'primary' }" v-permission="'system:menu:update'" @click="openCreate()">新增菜单</AppButton>
        </div>
      </AppListHeader>
    </header>

    <section class="content surface-card">
      <AppTable
        :table-props="{ data: rows }"
        :table-info="tableInfo"
        :loading="loading"
        @handle-click="handleAction"
      />
    </section>

    <MenuFormDialog
      v-model="dialogVisible"
      :record="selectedRecord"
      :menus="rows"
      @submit="handleSubmit"
    />
  </section>
</template>

<script setup lang="ts" name="Menu">
  import { ref } from 'vue';
  import { messageAlert, messageConfirm } from '@vue-scaffold/utils';
  import MenuFormDialog from '@/components/forms/MenuFormDialog.vue';
  import { requests } from '@/api/requests';
  import type { MenuRecord } from '@/types/domain';

  type MenuTreeItem = {
    id: number | string;
    parentId?: number | string | null;
    menuType?: string | number;
    name?: string;
    icon?: string;
    path?: string;
    permissionCode?: string;
    sortOrder?: number;
    visible?: number | boolean;
    remark?: string;
    children?: MenuTreeItem[];
  };

  const rows = ref<MenuRecord[]>([]);
  const selectedRecord = ref<MenuRecord | null>(null);
  const dialogVisible = ref(false);
  const loading = ref(false);
  const actionLoading = ref(false);

  const tableInfo = {
    columns: [
      { key: 'menuName', prop: 'menuName', label: '菜单名称', minWidth: 180 },
      { key: 'path', prop: 'path', label: '路由路径', minWidth: 220 },
      { key: 'menuCode', prop: 'menuCode', label: '权限编码', minWidth: 220 },
      { key: 'orderNum', prop: 'orderNum', label: '排序', width: 100 },
      {
        key: 'menuType',
        prop: 'menuType',
        label: '类型',
        width: 100,
        tagText: (row: MenuRecord) => ({ 1: '目录', 2: '菜单', 3: '页面', 4: '按钮' }[row.menuType] || '菜单')
      },
      {
        key: 'actions',
        label: '操作',
        genre: '$action',
        width: 280,
        actions: [
          { key: 'create', label: '新增下级', permissions: 'system:menu:update' },
          { key: 'edit', label: '编辑', permissions: 'system:menu:update' },
          { key: 'delete', label: '删除', permissions: 'system:menu:delete', type: 'danger' }
        ]
      }
    ]
  };

  function mapMenuType(menuType?: string | number) {
    switch (String(menuType ?? '').toUpperCase()) {
      case 'CATALOG':
      case 'M':
        return 1 as const;
      case 'MENU':
      case 'C':
        return 2 as const;
      case 'BUTTON':
      case 'B':
        return 4 as const;
      default:
        return Number(menuType) === 1 || Number(menuType) === 2 || Number(menuType) === 3 || Number(menuType) === 4
          ? Number(menuType) as 1 | 2 | 3 | 4
          : 2 as const;
    }
  }

  function mapMenu(item: MenuTreeItem): MenuRecord {
    return {
      id: String(item.id),
      parentId: item.parentId === null || item.parentId === undefined ? null : String(item.parentId),
      menuType: mapMenuType(item.menuType),
      menuName: item.name ?? '',
      icon: item.icon ?? '',
      path: item.path ?? '',
      menuCode: item.permissionCode ?? '',
      orderNum: Number(item.sortOrder ?? 1),
      enabled: item.visible !== false && Number(item.visible ?? 1) !== 0,
      remark: item.remark ?? '',
      children: Array.isArray(item.children) ? item.children.map(mapMenu) : []
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await requests.menus.tree('/api/menu/list-all-menu-tree', {});
      rows.value = Array.isArray(result) ? result.map((item: MenuTreeItem) => mapMenu(item)) : [];
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
      menuType: payload.menuType,
      name: payload.menuName,
      icon: payload.icon ?? '',
      path: payload.path,
      permissionCode: payload.menuCode,
      sortOrder: payload.orderNum,
      visible: payload.enabled ? 1 : 0,
      remark: payload.remark ?? ''
    };
    if (id) {
      await requests.menus.update('/api/menu/update-menu', requestBody);
      messageAlert({ message: '菜单更新成功' });
    } else {
      await requests.menus.save('/api/menu/create-menu', requestBody);
      messageAlert({ message: '菜单创建成功' });
    }
    await loadData();
  }

  async function handleAction(row: MenuRecord, action: Record<string, any>) {
    if (actionLoading.value) {
      return;
    }
    if (action.key === 'create') {
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
        await requests.menus.delete('/api/menu/delete-menu', {
          menuId: Number(row.id)
        });
        messageAlert({ message: '菜单删除成功' });
        await loadData();
      } finally {
        actionLoading.value = false;
      }
    }
  }

  loadData();
</script>

<style scoped lang="scss">
  .Menu {
    display: grid;
    gap: 20px;
  }

  .toolbar,
  .content {
    padding: 20px 24px;
  }

  .toolbar :deep(.AppListHeader-root) {
    width: 100%;
  }
</style>
