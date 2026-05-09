<!-- 用户管理 -->
<template>
  <main class="User-root AppTableList-wrap">
    <div class="surface-card table-wrap">
      <AppTableList>
        <AppListHeader>
          <div class="header-search">
            <AppInput
              v-model="dataInfo.keyword"
              placeholder="按用户名、姓名、手机号或邮箱搜索"
              :icon-props="{ place: 'suffix', name: 'Search' }"
              @input="dataInfo.debounceSearch()"
            />
          </div>
          <div class="header-handle">
            <AppButton
              :button-props="{ loading }"
              @click="dataInfo.refreshPageData()"
              >刷新</AppButton
            >
            <AppButton
              :button-props="{ type: 'primary' }"
              v-permission="'system:user:add'"
              @click="dataInfo.openCreate()"
              >新增用户</AppButton
            >
          </div>
        </AppListHeader>

        <AppTable
          :table-props="{ data: list }"
          :table-info="dataInfo.tableInfo"
          :page-info="pageInfo"
          :loading="loading"
          @handle-click="dataInfo.handleAction"
        />

        <AppPager
          v-model:page-index="pageInfo.pageNum"
          v-model:page-size="pageInfo.pageSize"
          :total="total"
          @change="dataInfo.getList()"
        />
      </AppTableList>
    </div>

    <UserFormDialog
      v-model="dataInfo.dialogVisible"
      :record="dataInfo.selectedRecord"
      :organizations="dataInfo.organizations"
      @success="dataInfo.getList()"
    />
    <GrantUserRolesDialog
      v-model="dataInfo.grantDialogVisible"
      :user="dataInfo.selectedGrantUser"
      @success="dataInfo.getList()"
    />
  </main>
</template>

<script setup lang="ts" name="User">
import { reactive, toRefs } from "vue";
import { messageAlert, messageConfirm, debounce } from "@vue-scaffold/utils";
import UserFormDialog from "@/views/user/components/UserFormDialog.vue";
import GrantUserRolesDialog from "@/views/user/components/GrantUserRolesDialog.vue";
import { requests } from "@/api/requests";
import type { OrganizationRecord, UserRecord } from "@/types/domain";
import tableInfo from "@/views/user/tables/User";

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

// 数据信息
const dataInfo: any = reactive({
  // 表格配置
  tableInfo,
  pageInfo: { pageNum: 1, pageSize: 10 },
  keyword: "",
  dialogVisible: false,
  grantDialogVisible: false,
  selectedRecord: null as UserRecord | null,
  selectedGrantUser: null as UserRecord | null,
  organizations: [] as OrganizationRecord[],
  total: 0,
  list: [] as UserRecord[],
  loading: false,
  actionLoading: false,
  // 请求参数
  get params() {
    return {
      keyword: this.keyword,
      ...this.pageInfo,
    };
  },
  // 获取用户列表
  async getList() {
    this.loading = true;
    try {
      const data = await requests.users.list(this.params);
      this.total = data?.total;
      this.list = data.records;
    } finally {
      this.loading = false;
    }
  },

  // 获取组织列表
  async getOrganizations() {
    const data = await requests.organizations.tree();
    this.organizations = data;
  },

  // 刷新页面数据
  async refreshPageData() {
    this.loading = true;
    try {
      await this.getOrganizations();
      await this.getList();
    } finally {
      this.loading = false;
    }
  },

  // 搜索
  search() {
    this.pageInfo.pageNum = 1;
    this.getList();
  },

  // 带防抖搜索
  debounceSearch: debounce(function (this: any) {
    this.search();
  }, 300),

  // 打开新增对话框
  openCreate() {
    this.selectedRecord = null;
    this.dialogVisible = true;
  },

  // 打开分配角色对话框
  openGrantRoles(row: UserRecord) {
    this.selectedGrantUser = row;
    this.grantDialogVisible = true;
  },

  // 打开编辑对话框
  openEdit(row: UserRecord) {
    this.selectedRecord = row;
    this.dialogVisible = true;
  },

  // 重置密码
  async resetPassword(row: UserRecord) {
    this.actionLoading = true;
    try {
      await messageConfirm(
        `确认重置用户"${row.fullName || row.userName}"的密码吗？`,
      );
      await requests.users.resetPassword({
        userId: Number(row.id),
      });
      messageAlert({ message: "密码重置成功" });
      await this.getList();
    } finally {
      this.actionLoading = false;
    }
  },

  // 删除用户
  async deleteUser(row: UserRecord) {
    this.actionLoading = true;
    try {
      await messageConfirm(
        `确认删除用户"${row.fullName || row.userName}"吗？`,
      );
      await requests.users.delete({
        userId: Number(row.id),
      });
      messageAlert({ message: "用户删除成功" });
      await this.getList();
    } finally {
      this.actionLoading = false;
    }
  },

  // 处理操作（分发）
  async handleAction(row: UserRecord, action: Record<string, any>) {
    if (dataInfo.actionLoading) {
      return;
    }

    const actionMap: Record<string, () => void | Promise<void>> = {
      grantRoles: () => dataInfo.openGrantRoles(row),
      edit: () => dataInfo.openEdit(row),
      resetPassword: () => dataInfo.resetPassword(row),
      delete: () => dataInfo.deleteUser(row),
    };

    const handler = actionMap[action.key];
    if (handler) {
      await handler();
    }
  },

  // 初始化
  async init() {
    await this.refreshPageData();
  },
});

const { pageInfo, loading, total, list } = toRefs(dataInfo);

// 初始化
dataInfo.init();

// 暴露
defineExpose({ dataInfo });
</script>

<style scoped lang="scss">
.User-root {
  height: 100%;
}

.table-wrap {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-wrap :deep(.AppTableList-root) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-wrap :deep(.AppTable-root) {
  flex: 1;
  overflow: auto;
}
</style>
