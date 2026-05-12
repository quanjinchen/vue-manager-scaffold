<template>
  <main class="Menu-root">
    <AppTableList>
      <AppListHeader>
        <el-row :gutter="16" style="width: 100%">
          <el-col :xs="12" :sm="12" :md="6" :lg="5" :xl="4">
            <AppInput
              v-model="searchParams.menuName"
              placeholder="菜单名称"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @input="dataInfo.debounceSearch()"
            />
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="5" :xl="4">
            <AppInput
              v-model="searchParams.path"
              placeholder="路由路径"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @input="dataInfo.debounceSearch()"
            />
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="5" :xl="4">
            <AppInput
              v-model="searchParams.menuCode"
              placeholder="权限编码"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @input="dataInfo.debounceSearch()"
            />
          </el-col>
          <el-col :xs="24" :sm="24" :md="6" :lg="9" :xl="12">
            <div class="header-handle">
              <AppButton :button-props="{ loading }" @click="dataInfo.refreshPageData()">
                刷新
              </AppButton>
              <AppButton
                :button-props="{ type: 'primary' }"
                v-permission="'system:menu:update'"
                @click="dataInfo.openCreate()"
              >
                新增菜单
              </AppButton>
            </div>
          </el-col>
        </el-row>
      </AppListHeader>

      <AppTable
        :table-props="{
          data: filteredMenus,
          rowKey: 'id',
          treeProps: { children: 'children' },
          defaultExpandAll: true
        }"
        :table-info="tableInfo"
        :loading="loading"
        @handle-click="dataInfo.handleAction"
      />
    </AppTableList>

    <MenuFormDialog
      v-model="dataInfo.dialogVisible"
      :select-item="dataInfo.selectedRecord"
      :menus="list"
      @success="dataInfo.getList()"
    />
  </main>
</template>

<script setup lang="ts" name="Menu">
import { computed, reactive, toRefs } from 'vue';
import { debounce, messageAlert, messageConfirm } from '@vue-scaffold/utils';
import MenuFormDialog from '@/views/system/components/MenuFormDialog.vue';
import tableInfo from '@/views/system/tables/Menu';
import { $apis } from '@/api/requests';
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

const dataInfo = reactive({
  list: [] as MenuRecord[],
  searchParams: {
    menuName: '',
    path: '',
    menuCode: '',
  },
  dialogVisible: false,
  selectedRecord: null as MenuRecord | null,
  loading: false,
  actionLoading: false,
  async getList() {
    this.loading = true;
    try {
      const result = await $apis.menus.tree({});
      this.list = Array.isArray(result)
        ? result.map((item: MenuTreeItem) => mapMenu(item))
        : [];
    } finally {
      this.loading = false;
    }
  },
  async refreshPageData() {
    this.loading = true;
    try {
      await this.getList();
    } finally {
      this.loading = false;
    }
  },
  search() {
    return;
  },
  debounceSearch: debounce(function (this: any) {
    this.search();
  }, 300),
  openCreate() {
    this.selectedRecord = null;
    this.dialogVisible = true;
  },
  openCreateChild(row: MenuRecord) {
    this.selectedRecord = {
      id: '',
      parentId: row.id,
      menuType: 'C',
      menuName: '',
      path: '',
      menuCode: '',
      orderNum: 1,
      enabled: true,
      children: [],
    };
    this.dialogVisible = true;
  },
  openEdit(row: MenuRecord) {
    this.selectedRecord = row;
    this.dialogVisible = true;
  },
  async deleteMenu(row: MenuRecord) {
    if (this.actionLoading) {
      return;
    }

    this.actionLoading = true;
    try {
      await messageConfirm(`确认删除菜单“${row.menuName}”吗？`);
      await $apis.menus.delete({
        menuId: Number(row.id),
      });
      messageAlert({ message: '菜单删除成功' });
      await this.getList();
    } finally {
      this.actionLoading = false;
    }
  },
  async handleAction(row: MenuRecord, action: Record<string, any>) {
    if (dataInfo.actionLoading) {
      return;
    }

    const actionMap: Record<string, () => void | Promise<void>> = {
      create: () => dataInfo.openCreateChild(row),
      edit: () => dataInfo.openEdit(row),
      delete: () => dataInfo.deleteMenu(row),
    };

    await actionMap[action.key]?.();
  },
  async init() {
    await this.getList();
  },
});

const filteredMenus = computed(() => {
  const menuNameKeyword = dataInfo.searchParams.menuName.trim().toLowerCase();
  const pathKeyword = dataInfo.searchParams.path.trim().toLowerCase();
  const menuCodeKeyword = dataInfo.searchParams.menuCode.trim().toLowerCase();

  if (!menuNameKeyword && !pathKeyword && !menuCodeKeyword) {
    return dataInfo.list;
  }

  return filterMenuTree(dataInfo.list, item => {
    const menuName = item.menuName.toLowerCase();
    const path = item.path.toLowerCase();
    const menuCode = item.menuCode.toLowerCase();
    const matchMenuName = !menuNameKeyword || menuName.includes(menuNameKeyword);
    const matchPath = !pathKeyword || path.includes(pathKeyword);
    const matchMenuCode = !menuCodeKeyword || menuCode.includes(menuCodeKeyword);
    return matchMenuName && matchPath && matchMenuCode;
  });
});

function mapMenuType(menuType?: string | number): 'M' | 'C' | 'B' {
  const typeStr = String(menuType ?? '').toUpperCase();
  if (typeStr === 'M' || typeStr === 'C' || typeStr === 'B') {
    return typeStr as 'M' | 'C' | 'B';
  }

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
    parentId:
      item.parentId === null || item.parentId === undefined
        ? null
        : String(item.parentId),
    menuType: mapMenuType(item.menuType),
    menuName: item.name ?? '',
    path: item.path ?? '',
    menuCode: item.permissionCode ?? '',
    orderNum: Number(item.sortOrder ?? 1),
    enabled: item.visible !== false && Number(item.visible ?? 1) !== 0,
    children: Array.isArray(item.children) ? item.children.map(mapMenu) : [],
  };
}

function filterMenuTree(
  items: MenuRecord[],
  matcher: (item: MenuRecord) => boolean,
): MenuRecord[] {
  return items.reduce<MenuRecord[]>((result, item) => {
    const nextChildren = filterMenuTree(item.children ?? [], matcher);
    if (matcher(item) || nextChildren.length) {
      result.push({
        ...item,
        children: nextChildren,
      });
    }
    return result;
  }, []);
}

const { list, searchParams, loading } = toRefs(dataInfo);

dataInfo.init();
</script>

<style scoped lang="scss">
.Menu-root {
  height: 100%;
  padding-bottom: 20px;
}

.header-handle {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
