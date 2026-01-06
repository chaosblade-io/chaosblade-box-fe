import i18n from '../../i18n';
import { getActiveNamespace, getParams } from 'utils/libs/sre-utils';

const commonUrlStr = `ns=${getActiveNamespace()}`;
// 默认主导航
const menuConfig = [
  {
    key: '/index',
    label: i18n.t('Overview'),
    to: `/index?${commonUrlStr}`,
  },
  {
    key: '/chaos/workspace/owner',
    label: i18n.t('My space'),
    to: `/chaos/workspace/owner?${commonUrlStr}`,
    activePathPatterns: [
      '/chaos/workspace/owner',
    ],
  },
  {
    key: '/chaos/scenes',
    label: i18n.t('Rehearsal scene'),
    to: `/chaos/scenes?${commonUrlStr}`,
  },
  {
    key: '/chaos/expertise/list',
    label: i18n.t('Drill experience'),
    to: `/chaos/expertise/list?${commonUrlStr}`,
    activePathPatterns: [ '/chaos/expertise/detail' ],
  },
  {
    key: '/chaos/application',
    label: i18n.t('Application management'),
    to: `/chaos/application?${commonUrlStr}`,
    activePathPatterns: [ '/chaos/freshapplication/access' ],
  },
  {
    key: '/chaos/experiment/scope/control',
    label: i18n.t('Probe management'),
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
    key: '/chaos/topology-perception',
    label: i18n.t('Topo Visualization'),
    to: `/chaos/topology-perception?${commonUrlStr}`,
    activePathPatterns: [ '/chaos/topology-perception' ],
  },
  {
    key: '/chaos/fault-space-detection',
    label: i18n.t('Fault Space Detection'),
    items: [
      {
        key: '/chaos/fault-space-detection/tasks',
        label: i18n.t('Detection Tasks'),
        to: `/chaos/fault-space-detection/tasks?${commonUrlStr}`,
        activePathPatterns: [ '/chaos/fault-space-detection/tasks' ],
      },
      {
        key: '/chaos/fault-space-detection/add',
        label: i18n.t('Add Detection'),
        to: `/chaos/fault-space-detection/add?${commonUrlStr}`,
        activePathPatterns: [ '/chaos/fault-space-detection/add' ],
      },
      {
        key: '/chaos/fault-space-detection/records',
        label: i18n.t('Detection Records'),
        to: `/chaos/fault-space-detection/records?${commonUrlStr}`,
        activePathPatterns: [ '/chaos/fault-space-detection/records' ],
      },
    ],
  },
  {
    key: '/chaos/risk-detection',
    label: i18n.t('Risk Detection'),
    to: `/chaos/risk-detection?${commonUrlStr}`,
    activePathPatterns: [
      '/chaos/risk-detection',
      '/chaos/risk-detection/analysis',
      '/chaos/risk-detection/drill-results',
    ],
  },
  {
    key: '/chaos/dataAdmin',
    label: i18n.t('Data Management'),
    items: [
      {
        key: '/chaos/expertise/admin',
        label: i18n.t('Expertise Management'),
        to: `/chaos/expertise/admin?${commonUrlStr}`,
        activePathPatterns: [ '/chaos/expertise/editor' ],
      },
      {
        key: '/chaos/loadtest/admin',
        label: i18n.t('Load Testing Management'),
        to: `/chaos/loadtest/admin?${commonUrlStr}`,
        activePathPatterns: [ '/chaos/loadtest/admin' ],
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
  {
    index: '/chaos/fault-space-detection/',
    value: 'faultSpaceDetectionMenu',
  },
];

// 从二级导航返回哪个菜单
export const returnMenuList = [
  {
    key: 'chaosApplicationMenu',
    value: '/chaos/application',
  },
  {
    key: 'faultSpaceDetectionMenu',
    value: '/chaos/fault-space-detection',
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
        label: i18n.t('Application overview'),
        to: `/chaos/application/detail?${urlApp}&${commonUrlStr}`,
      },
      {
        key: '/chaos/application/scopelist',
        label: i18n.t('Machine list'),
        to: `/chaos/application/scopelist?${urlApp}&${commonUrlStr}`,
      },
      {
        key: '/chaos/application/tasklist',
        label: i18n.t('Exercise record'),
        to: `/chaos/application/tasklist?${urlApp}&${commonUrlStr}`,
      },
      {
        key: '/chaos/application/setting',
        label: i18n.t('Application configuration'),
        to: `/chaos/application/setting?${urlApp}&${commonUrlStr}`,
      },
    ];
  }
  if (key === 'faultSpaceDetectionMenu') {
    return [
      {
        key: '/chaos/fault-space-detection/tasks',
        label: i18n.t('Detection Tasks'),
        to: `/chaos/fault-space-detection/tasks?${commonUrlStr}`,
      },
      {
        key: '/chaos/fault-space-detection/add',
        label: i18n.t('Add Detection'),
        to: `/chaos/fault-space-detection/add?${commonUrlStr}`,
      },
      {
        key: '/chaos/fault-space-detection/records',
        label: i18n.t('Detection Records'),
        to: `/chaos/fault-space-detection/records?${commonUrlStr}`,
      },
    ];
  }
}

// 激活菜单
export const activeKeys: {[key: string]: string} = {
  '/chaos/expertise/admin': '/chaos/dataAdmin',
  '/chaos/scene/list': '/chaos/dataAdmin',
  '/chaos/loadtest/admin': '/chaos/dataAdmin',
  '/chaos/fault-space-detection/tasks': '/chaos/fault-space-detection',
  '/chaos/fault-space-detection/add': '/chaos/fault-space-detection',
  '/chaos/fault-space-detection/records': '/chaos/fault-space-detection',
  '/chaos/topology-perception': '/chaos/topology-perception',
  '/chaos/risk-detection': '/chaos/risk-detection',
  '/chaos/risk-detection/analysis': '/chaos/risk-detection',
  '/chaos/risk-detection/drill-results': '/chaos/risk-detection',
};
