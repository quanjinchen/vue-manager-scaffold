import { requests } from '@/api/requests';

export type OperationLogRecord = {
  id: string | number;
  moduleName?: string;
  actionName?: string;
  operatorName?: string;
  requestPath?: string;
  successFlag?: boolean;
  requestTime?: string;
};

export type OperationLogPageResult = {
  records: OperationLogRecord[];
  total: number;
  pageNum: number;
  pageSize: number;
};

type OperationLogPageResponse = Partial<OperationLogPageResult> & {
  list?: OperationLogRecord[];
};

function normalizePageResult(result: OperationLogPageResponse | undefined, pageNum: number, pageSize: number): OperationLogPageResult {
  return {
    records: Array.isArray(result?.records) ? result.records : Array.isArray(result?.list) ? result.list : [],
    total: Number(result?.total ?? 0),
    pageNum: Number(result?.pageNum ?? pageNum),
    pageSize: Number(result?.pageSize ?? pageSize)
  };
}

export async function getOperationLogPage(pageNum = 1, pageSize = 10) {
  const result = await requests.operationLogs.page('/api/operation-log/list-operation-log', {
    pageNum,
    pageSize
  });

  return normalizePageResult(result, pageNum, pageSize);
}
