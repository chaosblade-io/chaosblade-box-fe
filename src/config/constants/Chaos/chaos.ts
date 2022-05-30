import i18n from '../../../i18n';
import { IBreadCrumbItem } from '../../interfaces';
// 面包屑的主导航
export const CHAOS_DEFAULT_BREADCRUMB_ITEM: IBreadCrumbItem[] = [
  {
    key: 'index',
    value: i18n.t('Apply high availability services'),
    path: '/index',
  },
  {
    key: 'chaos',
    value: i18n.t('Troubleshooting'),
    path: '/index',
  },
];
