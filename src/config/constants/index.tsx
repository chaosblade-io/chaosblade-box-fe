import { IBreadCrumbItem } from '../interfaces';

// Request Code校验
export const ERROR_CODE_ENUM = {
  demoNoOpt: {
    code: 'demo.not.support.operation',
  },
  systemError: {
    code: 'system.error',
    message: '请求失败，请稍后再试',
  },
};

export const DEFAULT_BREADCRUMB_ITEM: IBreadCrumbItem = {
  key: 'home',
  value: '应用高可用服务',
  path: '/index',
};

export * from './menu';
export * from './Chaos';
export * from './Manage';
