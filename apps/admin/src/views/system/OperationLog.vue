<template>
  <section class="OperationLog">
    <div class="surface-card table-wrap">
      <AppTableList>
        <AppListHeader>
          <div class="header-search">
            <div class="summary-text">
              记录管理员登录、退出、菜单维护、用户维护等操作行为，便于后续审计排查。
            </div>
          </div>
          <div class="header-handle">
            <AppButton :button-props="{ loading }" @click="loadLogs">刷新</AppButton>
          </div>
        </AppListHeader>

        <AppTable
          :table-props="{ data: rows }"
          :table-info="tableInfo"
          :page-info="{ pageNum, pageSize }"
          :loading="loading"
        />

        <div class="pagination-wrap">
          <el-pagination
            background
            layout="total, prev, pager, next, sizes"
            :total="total"
            :current-page="pageNum"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </AppTableList>
    </div>
  </section>
</template>

<script setup lang="ts" name="OperationLog">
  import { onMounted, ref } from 'vue';
  import { requests } from '@/api/requests';

  type OperationLogRecord = {
    id: string | number;
    moduleName?: string;
    actionName?: string;
    operatorName?: string;
    requestPath?: string;
    successFlag?: boolean;
    requestTime?: string;
  };

  const loading = ref(false);
  const rows = ref<OperationLogRecord[]>([]);
  const total = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(10);

  const tableInfo = {
    columns: [
      { key: 'ordinal', label: '#', genre: '$ordinal', width: 64 },
      { key: 'moduleName', prop: 'moduleName', label: '模块', minWidth: 140 },
      { key: 'actionName', prop: 'actionName', label: '动作', minWidth: 140 },
      { key: 'operatorName', prop: 'operatorName', label: '操作人', minWidth: 140 },
      { key: 'requestPath', prop: 'requestPath', label: '请求路径', minWidth: 260 },
      {
        key: 'successFlag',
        prop: 'successFlag',
        label: '结果',
        genre: '$tag',
        width: 120,
        tagText: (row: OperationLogRecord) => row.successFlag ? '成功' : '失败',
        tagType: (row: OperationLogRecord) => row.successFlag ? 'success' : 'danger'
      },
      { key: 'requestTime', prop: 'requestTime', label: '操作时间', genre: '$date', minWidth: 180 }
    ]
  };

  async function loadLogs() {
    loading.value = true;
    try {
      const result = await requests.operationLogs.page({
        pageNum: pageNum.value,
        pageSize: pageSize.value
      });
      rows.value = Array.isArray(result?.records) ? result.records : [];
      total.value = Number(result?.total ?? 0);
      pageNum.value = Number(result?.pageNum ?? pageNum.value);
      pageSize.value = Number(result?.pageSize ?? pageSize.value);
    } finally {
      loading.value = false;
    }
  }

  async function handleCurrentChange(value: number) {
    pageNum.value = value;
    await loadLogs();
  }

  async function handleSizeChange(value: number) {
    pageSize.value = value;
    pageNum.value = 1;
    await loadLogs();
  }

  onMounted(async () => {
    await loadLogs();
  });
</script>

<style scoped lang="scss">
  .OperationLog {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .table-wrap {
    padding: 16px;
  }

  .summary-text {
    color: #667085;
    line-height: 1.6;
  }

  .pagination-wrap {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
</style>
