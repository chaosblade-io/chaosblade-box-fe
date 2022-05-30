import i18n from '../../../../i18n';
export const AGENT_OPTIONS = [
  // {
  //   value: 1,
  //   label: '架构感知探针',
  // },
  // {
  //   value: 2,
  //   label: '限流降级探针',
  // },
  {
    value: 3,
    label: i18n.t('Troubleshooting Probes'),
  },
];

export const AGENT_SEARCH = [
  {
    label: i18n.t('Private Internet IP'),
    value: 'PrivateIpList',
  },
  {
    label: i18n.t('Instance name'),
    value: 'InstanceNameList',
  },
  {
    label: i18n.t('Public IP'),
    value: 'PublicIpList',
  },
  {
    label: i18n.t('Instance ID'),
    value: 'InstanceIdList',
  },
];

export const AGENT_SCOPE_TYPE = {
  HOST: 0, // 主机
  K8S: 2, // kubernates
};
