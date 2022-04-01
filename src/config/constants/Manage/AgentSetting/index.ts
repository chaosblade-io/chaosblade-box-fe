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
    label: '故障演练探针',
  },
];

export const AGENT_SEARCH = [
  {
    label: '私网IP',
    value: 'PrivateIpList',
  },
  {
    label: '实例名称',
    value: 'InstanceNameList',
  },
  {
    label: '公网IP',
    value: 'PublicIpList',
  },
  {
    label: '实例ID',
    value: 'InstanceIdList',
  },
];

export const AGENT_SCOPE_TYPE = {
  HOST: 0, // 主机
  K8S: 2, // kubernates
};
