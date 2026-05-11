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
        :table-props="{
          data: rows,
          rowKey: 'id',
          treeProps: { children: 'children' },
          defaultExpandAll: true
        }"
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
  import MenuFormDialog from '@/views/system/components/MenuFormDialog.vue';
  import { requests } from '@/api/requests';
  import type { MenuRecord } from '@/types/domain';

  type MenuTreeItem = {
    id: number | string;
    parentId?: number | string | null;
    menuType?: string;
    name?: string;
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
        tagText: (row: MenuRecord) => ({ M: '目录', C: '菜单', B: '按钮' }[row.menuType] || '菜单')
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

  function mapMenuType(menuType?: string | number): 'M' | 'C' | 'B' {
    const typeStr = String(menuType ?? '').toUpperCase();
    if (typeStr === 'M' || typeStr === 'C' || typeStr === 'B') {
      return typeStr as 'M' | 'C' | 'B';
    }
    // 兼容旧的数字格式
    switch (Number(menuType)) {
      case 1:
        return 'M';
      case 2:
      case 3:
        return 'C';
      case 4:
        return 'B';
      default:
        return 'C';
    }
  }

  function mapMenu(item: MenuTreeItem): MenuRecord {
    return {
      id: String(item.id),
      parentId: item.parentId === null || item.parentId === undefined ? null : String(item.parentId),
      menuType: mapMenuType(item.menuType),
      menuName: item.name ?? '',
      path: item.path ?? '',
      menuCode: item.permissionCode ?? '',
      orderNum: Number(item.sortOrder ?? 1),
      enabled: item.visible !== false && Number(item.visible ?? 1) !== 0,
      children: Array.isArray(item.children) ? item.children.map(mapMenu) : []
    };
  }

  async function loadData() {
    loading.value = true;
    try {
      const result = await requests.menus.tree({});
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
          menuType: 'C',
          menuName: '',
          path: '',
          menuCode: '',
          orderNum: 1,
          enabled: true,
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
      path: payload.path,
      permissionCode: payload.menuCode,
      sortOrder: payload.orderNum,
      visible: payload.enabled
    };
    if (id) {
      await requests.menus.update(requestBody);
    } else {
      await requests.menus.save(requestBody);
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
        await requests.menus.delete({
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
    display: flex;
    flex-direction: column;
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
