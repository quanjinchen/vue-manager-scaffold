import type { MenuRecord, OrganizationRecord, RoleRecord, UserRecord } from '@/types/domain';

export const mockOrganizations: OrganizationRecord[] = [
  {
    id: 'org-root',
    parentId: null,
    orgName: '总部',
    shortName: 'HQ',
    orderNum: 1,
    remark: '默认根组织',
    children: [
      {
        id: 'org-tech',
        parentId: 'org-root',
        orgName: '技术中心',
        shortName: 'TECH',
        orderNum: 1,
        remark: '研发组织',
        children: []
      },
      {
        id: 'org-ops',
        parentId: 'org-root',
        orgName: '运营中心',
        shortName: 'OPS',
        orderNum: 2,
        remark: '运营组织',
        children: []
      }
    ]
  }
];

export const mockUsers: UserRecord[] = [
  {
    id: 'user-1',
    userName: 'ada',
    fullName: 'Ada Lovelace',
    phoneNum: '13800138000',
    email: 'ada@example.com',
    orgIds: ['org-tech'],
    orgNames: ['技术中心'],
    status: 'active',
    createdAt: '2026-04-01 09:00:00',
    updatedAt: '2026-04-03 10:00:00',
    remark: '管理员示例'
  },
  {
    id: 'user-2',
    userName: 'grace',
    fullName: 'Grace Hopper',
    phoneNum: '13900139000',
    email: 'grace@example.com',
    orgIds: ['org-ops'],
    orgNames: ['运营中心'],
    status: 'disabled',
    createdAt: '2026-04-01 10:00:00',
    updatedAt: '2026-04-03 11:30:00',
    remark: '运营示例'
  }
];

export const mockRoles: RoleRecord[] = [
  {
    id: 'role-1',
    roleCode: 'system_admin',
    roleName: '系统管理员',
    userNum: 2,
    userGroupNum: 1,
    systemDefault: true,
    remark: '默认平台角色',
    createdAt: '2026-04-01 09:00:00',
    updatedAt: '2026-04-03 10:00:00'
  },
  {
    id: 'role-2',
    roleCode: 'auditor',
    roleName: '安全审计员',
    userNum: 3,
    userGroupNum: 0,
    systemDefault: false,
    remark: '审计和日志查看角色',
    createdAt: '2026-04-01 10:00:00',
    updatedAt: '2026-04-03 11:30:00'
  }
];

export const mockMenus: MenuRecord[] = [
  {
    id: 'menu-index',
    parentId: null,
    menuType: 1,
    menuName: '首页',
    icon: 'House',
    path: '/index',
    menuCode: 'index',
    orderNum: 1,
    enabled: true,
    remark: '首页',
    children: [
      {
        id: 'menu-index-base',
        parentId: 'menu-index',
        menuType: 2,
        menuName: '基础信息',
        path: '/index/baseInfo',
        menuCode: 'index:baseInfo',
        orderNum: 1,
        enabled: true,
        remark: '基础信息',
        children: [
          {
            id: 'menu-index-base-stats',
            parentId: 'menu-index-base',
            menuType: 4,
            menuName: '基础信息统计',
            path: '',
            menuCode: 'system:index:baseInfo',
            orderNum: 1,
            enabled: true,
            remark: '基础信息统计'
          },
          {
            id: 'menu-index-user-stats',
            parentId: 'menu-index-base',
            menuType: 4,
            menuName: '用户数统计',
            path: '',
            menuCode: 'system:index:userNum',
            orderNum: 2,
            enabled: true,
            remark: '用户数统计'
          },
          {
            id: 'menu-index-active-stats',
            parentId: 'menu-index-base',
            menuType: 4,
            menuName: '用户活跃统计',
            path: '',
            menuCode: 'system:index:userActive',
            orderNum: 3,
            enabled: true,
            remark: '用户活跃统计'
          },
          {
            id: 'menu-index-app-rank',
            parentId: 'menu-index-base',
            menuType: 4,
            menuName: '接入应用排行榜',
            path: '',
            menuCode: 'system:index:appRank',
            orderNum: 4,
            enabled: true,
            remark: '接入应用排行榜'
          },
          {
            id: 'menu-index-device-stats',
            parentId: 'menu-index-base',
            menuType: 4,
            menuName: '用户登录设备统计',
            path: '',
            menuCode: 'system:index:userDevice',
            orderNum: 5,
            enabled: true,
            remark: '用户登录设备统计'
          }
        ]
      },
    ]
  },
  {
    id: 'menu-user',
    parentId: null,
    menuType: 1,
    menuName: '身份管理',
    icon: 'User',
    path: '/user',
    menuCode: 'user',
    orderNum: 2,
    enabled: true,
    remark: '身份管理',
    children: [
      {
        id: 'menu-user-index',
        parentId: 'menu-user',
        menuType: 2,
        menuName: '用户列表',
        path: '/user/index',
        menuCode: 'system:user:query',
        orderNum: 1,
        enabled: true,
        remark: '用户管理'
      }
    ]
  },
  {
    id: 'menu-organization',
    parentId: null,
    menuType: 2,
    menuName: '组织管理',
    icon: 'Document',
    path: '/organization',
    menuCode: 'organization',
    orderNum: 3,
    enabled: true,
    remark: '组织管理'
  },
  {
    id: 'menu-system',
    parentId: null,
    menuType: 1,
    menuName: '系统管理',
    icon: 'Setting',
    path: '/system',
    menuCode: 'system',
    orderNum: 99,
    enabled: true,
    remark: '系统管理',
    children: [
      {
        id: 'menu-system-menus',
        parentId: 'menu-system',
        menuType: 2,
        menuName: '平台菜单',
        path: '/system/menus',
        menuCode: 'system:menu:query',
        orderNum: 1,
        enabled: true,
        remark: '菜单管理'
      },
      {
        id: 'menu-system-roles',
        parentId: 'menu-system',
        menuType: 2,
        menuName: '平台角色',
        path: '/system/roles',
        menuCode: 'system:role:query',
        orderNum: 2,
        enabled: true,
        remark: '角色管理',
        children: [
          {
            id: 'menu-system-roles-add',
            parentId: 'menu-system-roles',
            menuType: 4,
            menuName: '新增平台角色',
            path: '',
            menuCode: 'system:role:add',
            orderNum: 1,
            enabled: true,
            remark: '新增平台角色'
          },
          {
            id: 'menu-system-roles-update',
            parentId: 'menu-system-roles',
            menuType: 4,
            menuName: '编辑平台角色',
            path: '',
            menuCode: 'system:role:update',
            orderNum: 2,
            enabled: true,
            remark: '编辑平台角色'
          },
          {
            id: 'menu-system-roles-delete',
            parentId: 'menu-system-roles',
            menuType: 4,
            menuName: '删除平台角色',
            path: '',
            menuCode: 'system:role:delete',
            orderNum: 3,
            enabled: true,
            remark: '删除平台角色'
          }
        ]
      }
    ]
  }
];

export const mockDashboard = {
  baseStats: {
    userCot: 12864,
    appCot: 286,
    userAuthCot: 48291,
    userUp: true,
    appUp: true,
    userAuthUp: false,
    upUserNum: 486,
    upAppNum: 18,
    upUserAuthNum: 203
  },
  userStats: {
    WEEK: [
      { date: '周一', num: 312 },
      { date: '周二', num: 356 },
      { date: '周三', num: 338 },
      { date: '周四', num: 402 },
      { date: '周五', num: 428 },
      { date: '周六', num: 290 },
      { date: '周日', num: 244 }
    ],
    MONTH: [
      { date: '第1周', num: 1588 },
      { date: '第2周', num: 1736 },
      { date: '第3周', num: 1812 },
      { date: '第4周', num: 1924 }
    ],
    YEAR: [
      { date: '1月', num: 4280 },
      { date: '2月', num: 4610 },
      { date: '3月', num: 5024 },
      { date: '4月', num: 5368 },
      { date: '5月', num: 5812 },
      { date: '6月', num: 6036 },
      { date: '7月', num: 6288 },
      { date: '8月', num: 6460 },
      { date: '9月', num: 6820 },
      { date: '10月', num: 7016 },
      { date: '11月', num: 7340 },
      { date: '12月', num: 7688 }
    ]
  },
  activeStats: {
    WEEK: {
      peopleList: [
        { date: '周一', num: 182 },
        { date: '周二', num: 205 },
        { date: '周三', num: 198 },
        { date: '周四', num: 236 },
        { date: '周五', num: 244 },
        { date: '周六', num: 160 },
        { date: '周日', num: 148 }
      ],
      timesList: [
        { date: '周一', num: 624 },
        { date: '周二', num: 688 },
        { date: '周三', num: 652 },
        { date: '周四', num: 744 },
        { date: '周五', num: 792 },
        { date: '周六', num: 536 },
        { date: '周日', num: 498 }
      ]
    },
    MONTH: {
      peopleList: [
        { date: '第1周', num: 912 },
        { date: '第2周', num: 986 },
        { date: '第3周', num: 1024 },
        { date: '第4周', num: 1108 }
      ],
      timesList: [
        { date: '第1周', num: 3640 },
        { date: '第2周', num: 3918 },
        { date: '第3周', num: 4066 },
        { date: '第4周', num: 4324 }
      ]
    },
    YEAR: {
      peopleList: [
        { date: '1月', num: 1680 },
        { date: '2月', num: 1724 },
        { date: '3月', num: 1812 },
        { date: '4月', num: 1898 },
        { date: '5月', num: 1966 },
        { date: '6月', num: 2088 },
        { date: '7月', num: 2148 },
        { date: '8月', num: 2186 },
        { date: '9月', num: 2264 },
        { date: '10月', num: 2316 },
        { date: '11月', num: 2394 },
        { date: '12月', num: 2468 }
      ],
      timesList: [
        { date: '1月', num: 6240 },
        { date: '2月', num: 6468 },
        { date: '3月', num: 6752 },
        { date: '4月', num: 7024 },
        { date: '5月', num: 7266 },
        { date: '6月', num: 7540 },
        { date: '7月', num: 7812 },
        { date: '8月', num: 7924 },
        { date: '9月', num: 8248 },
        { date: '10月', num: 8466 },
        { date: '11月', num: 8710 },
        { date: '12月', num: 9024 }
      ]
    }
  },
  appStats: {
    USER: [
      { name: 'IAM Core', num: 2086 },
      { name: 'SSO Portal', num: 1724 },
      { name: 'CMDB', num: 1460 },
      { name: 'Workflow', num: 1288 },
      { name: 'Mail Gateway', num: 1024 }
    ],
    AUTH: [
      { name: 'IAM Core', num: 12884 },
      { name: 'SSO Portal', num: 10626 },
      { name: 'CMDB', num: 9450 },
      { name: 'Workflow', num: 8120 },
      { name: 'Mail Gateway', num: 6940 }
    ]
  },
  deviceStats: {
    '0': [
      { name: 'Chrome', num: 6840 },
      { name: 'Edge', num: 3160 },
      { name: 'Safari', num: 1820 },
      { name: 'Firefox', num: 1260 }
    ],
    '1': [
      { name: 'Windows', num: 8420 },
      { name: 'macOS', num: 2410 },
      { name: 'Linux', num: 1288 },
      { name: 'Android', num: 962 }
    ]
  }
};
