export default {
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
      tagText: (row: Record<string, any>) => row.successFlag ? '成功' : '失败',
      tagType: (row: Record<string, any>) => row.successFlag ? 'success' : 'danger',
    },
    { key: 'requestTime', prop: 'requestTime', label: '操作时间', genre: '$date', minWidth: 180 },
  ],
} as const satisfies {
  columns: Array<Record<string, any>>;
};
