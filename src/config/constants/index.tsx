import { IBreadCrumbItem } from '../interfaces';
export const productName = 'ahas';

// Request Code校验
export const ERROR_CODE_ENUM = {
  openAHASServiceFailed: {
    code: 'OpenAHASServiceFailed',
    message: '服务开通失败，请稍后再试',
  },
  demoNoOpt: {
    code: 'demo.not.support.operation',
  },
  sgNoAuth: {
    code: 'sub_user_no_authority',
    message: '子账号没有对应权限',
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
