import i18n from '../../../i18n';
export * from './AgentSetting';

export const breadCrumbConf = {
  ahaos: {
    key: 'scope/control',
    value: i18n.t('Probe Management'),
    path: '/chaos/experiment/scope/control',
  },
  manage: {
    key: 'setting',
    value: i18n.t('Probe Management'),
    path: '/manage/setting',
  },
};
