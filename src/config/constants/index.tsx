import i18n from '../../i18n';
import { IBreadCrumbItem } from '../interfaces';

// Request Code校验
export const ERROR_CODE_ENUM = {
  demoNoOpt: {
    code: 'demo.not.support.operation',
  },
  systemError: {
    code: 'system.error',
    message: i18n.t('Request failed, please try again later'),
  },
};

export const DEFAULT_BREADCRUMB_ITEM: IBreadCrumbItem = {
  key: 'home',
  value: i18n.t('Apply high availability services'),
  path: '/index',
};

export * from './menu';
export * from './Chaos';
export * from './Manage';
