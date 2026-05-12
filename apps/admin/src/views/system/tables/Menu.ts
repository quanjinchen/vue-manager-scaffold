import type { MenuRecord } from '@/types/domain';

export default {
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
      tagText: (row: MenuRecord) => ({ M: '目录', C: '菜单', B: '按钮' }[row.menuType] || '菜单'),
    },
    {
      key: 'actions',
      label: '操作',
      genre: '$action',
      width: 280,
      actions: [
        { key: 'create', label: '新增下级', permissions: 'system:menu:update' },
        { key: 'edit', label: '编辑', permissions: 'system:menu:update' },
        { key: 'delete', label: '删除', permissions: 'system:menu:delete', type: 'danger' },
      ],
    },
  ],
} as const satisfies {
  columns: Array<Record<string, any>>;
};
