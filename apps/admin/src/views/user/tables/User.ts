// 用户管理的表格
import { userStatusOptions } from '@vue-scaffold/constants';
import type { UserRecord } from '@/types/domain';

export default {
  columns: [
    {
      key: 'ordinal',
      label: '#',
      genre: '$ordinal',
      width: 64
    },
    {
      prop: 'username',
      label: '用户名',
      minWidth: 160
    },
    {
      prop: 'nickname',
      label: '昵称',
      minWidth: 180
    },
    {
      prop: 'phone',
      label: '手机号',
      minWidth: 160
    },
    {
      key: 'email',
      prop: 'email',
      label: '邮箱',
      minWidth: 220
    },
    {
      key: 'orgNames',
      prop: 'orgNames',
      label: '所属组织',
      minWidth: 220,
      tagText: (row: UserRecord) => row.orgNames.join(', ') || '-'
    },
    {
      key: 'status',
      prop: 'status',
      label: '状态',
      genre: '$tag',
      width: 120,
      tagMap: userStatusOptions
    },
    {
      key: 'updatedAt',
      prop: 'updatedAt',
      label: '更新时间',
      genre: '$date',
      minWidth: 180
    },
    {
      key: 'actions',
      label: '操作',
      genre: '$action',
      width: 380,
      actions: [
        { key: 'grantRoles', label: '分配角色', permissions: 'system:user:update' },
        { key: 'edit', label: '编辑', permissions: 'system:user:update' },
        { key: 'resetPassword', label: '重置密码', permissions: 'system:user:resetPassword', type: 'warning' },
        { key: 'delete', label: '删除', permissions: 'system:user:delete', type: 'danger' }
      ]
    }
  ]
};
