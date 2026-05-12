import type { RoleRecord } from '@/types/domain';

export default {
  columns: [
    { key: 'ordinal', label: '#', genre: '$ordinal', width: 64 },
    { key: 'roleName', prop: 'roleName', label: '角色名称', minWidth: 180 },
    { key: 'roleCode', prop: 'roleCode', label: '角色编码', minWidth: 180 },
    {
      key: 'systemDefault',
      prop: 'systemDefault',
      label: '角色类型',
      genre: '$tag',
      width: 120,
      tagText: (row: RoleRecord) => (row.systemDefault ? '内置角色' : '自定义角色'),
      tagType: (row: RoleRecord) => (row.systemDefault ? 'success' : 'primary'),
    },
    { key: 'userNum', prop: 'userNum', label: '用户数', width: 100 },
    { key: 'userGroupNum', prop: 'userGroupNum', label: '分组数', width: 100 },
    { key: 'updatedAt', prop: 'updatedAt', label: '更新时间', genre: '$date', minWidth: 180 },
    {
      key: 'actions',
      label: '操作',
      genre: '$action',
      width: 280,
      actions: [
        { key: 'grantMenus', label: '分配菜单', permissions: 'system:role:update' },
        { key: 'edit', label: '编辑', permissions: 'system:role:update' },
        {
          key: 'delete',
          label: '删除',
          permissions: 'system:role:delete',
          type: 'danger',
          visible: (row: RoleRecord) => !row.systemDefault,
        },
      ],
    },
  ],
} as const satisfies {
  columns: Array<Record<string, any>>;
};
