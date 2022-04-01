import { getActiveNamespace, getParams } from 'utils/libs/sre-utils';

const commonUrlStr = `ns=${getActiveNamespace()}`;
// 默认主导航
const menuConfig = [
  {
    key: '/index',
    label: '概览',
    to: `/index?${commonUrlStr}`,
  },
  {
    key: '/chaos/workspace/owner',
    label: '我的空间',
    to: `/chaos/workspace/owner?${commonUrlStr}`,
    activePathPatterns: [
      '/chaos/workspace/owner',
    ],
  },
  {
    key: '/chaos/scenes',
    label: '演练场景',
    to: `/chaos/scenes?${commonUrlStr}`,
  },
  {
    key: '/chaos/expertise/list',
    label: '演练经验',
    to: `/chaos/expertise/list?${commonUrlStr}`,
    activePathPatterns: [ '/chaos/expertise/detail' ],
  },
  {
    key: '/chaos/application',
    label: '应用管理',
    to: `/chaos/application?${commonUrlStr}`,
    activePathPatterns: [ '/chaos/freshapplication/access' ],
  },
  {
    key: '/chaos/experiment/scope/control',
    label: '探针管理',
    to: `/chaos/experiment/scope/control?${commonUrlStr}`,
    activePathPatterns: [
      '/chaos/experiment/scope/detail',
      '/chaos/agentmanage/k8sHostl',
      '/chaos/agentmanage/detail',
      '/chaos/agentmanage/setting/step',
      '/chaos/agentmanage/alarm',
    ],
  },
  {
    key: '/ahas/chaos/dataAdmin',
    label: '数据管理',
    items: [
      {
        key: '/chaos/expertise/admin',
        label: '经验库管理',
        to: `/chaos/expertise/admin?${commonUrlStr}`,
        activePathPatterns: [ '/chaos/expertise/editor' ],
      },
      {
        key: '/chaos/migration',
        label: '数据迁移',
        to: `/chaos/migration?${commonUrlStr}`,
        activePathPatterns: [ '/chaos/migration' ],
      },
    ],
  },
];

// 要匹配哪个二级导航
export const pathNameList = [
  {
    index: '/chaos/application/',
    value: 'chaosApplicationMenu',
  },
];

// 从二级导航返回哪个菜单
export const returnMenuList = [
  {
    key: 'chaosApplicationMenu',
    value: '/chaos/application',
  },
];

export function setMenuConfig(key: string) {
  if (key === 'menuConfig') {
    return menuConfig;
  }
  if (key === 'chaosApplicationMenu') {
    const urlApp = `appId=${getParams('appId')}&appType=${getParams('appType')}`;
    return [
      {
        key: '/chaos/application/detail',
        label: '应用概览',
        to: `/chaos/application/detail?${urlApp}&${commonUrlStr}`,
      },
      {
        key: '/chaos/application/scopelist',
        label: '机器列表',
        to: `/chaos/application/scopelist?${urlApp}&${commonUrlStr}`,
      },
      {
        key: '/chaos/application/tasklist',
        label: '演练记录',
        to: `/chaos/application/tasklist?${urlApp}&${commonUrlStr}`,
      },
      {
        key: '/chaos/application/setting',
        label: '应用配置',
        to: `/chaos/application/setting?${urlApp}&${commonUrlStr}`,
      },
    ];
  }
}

// 激活菜单
export const activeKeys: {[key: string]: string} = {
  '/chaos/expertise/admin': '/ahas/chaos/dataAdmin',
  '/chaos/scene/list': '/ahas/chaos/dataAdmin',
};
