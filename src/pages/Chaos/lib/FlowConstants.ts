export const STAGES = [
  {
    key: 'prepare', // 准备阶段
    value: 1 << 0, // eslint-disable-line no-bitwise
  },
  {
    key: 'attack', // 注入阶段
    value: 1 << 1, // eslint-disable-line no-bitwise
  },
  {
    key: 'check', // 检查阶段
    value: 1 << 2, // eslint-disable-line no-bitwise
  },
  {
    key: 'recover', // 恢复阶段
    value: 1 << 3, // eslint-disable-line no-bitwise
  },
];

export const SCOPE_TYPE = {
  HOST: 0, // 主机
  K8S: 2, // kubernates
  CLOUD: 3, // 云服务
};

// 主机下不同操作系统
export const OS_TYPE = {
  LINUX: 0, // linux
  WINDOWS: 1, // windows
};

export const CLOUD_TYPE = {
  ECS: 1,
  RDS: 2,
  REDIS: 3,
};

// 百分比与具体ip
export const SELECT_TYPE = {
  PERCENT: 2, // 百分比选择机器
  IPS: 1, // 指定IP选择机器
};

// 资源管理筛选条件
export const FILTER_TYPE = [
  {
    label: '全部',
    value: '0',
  },
  {
    label: '演练过',
    value: '1',
  },
  {
    label: '未演练过',
    value: '2',
  },
];


export const AGENT_STATUS = {
  WAIT_INSTALL: 0, // 未安装
  INSTALLING: 1, // 安装中
  INSTALL_FAIL: -1, // 安装失败
  ONLINE: 2, // 上线
  OFFLINE: 3, // 离线
  UNINSTALLING: 4, // 卸载中
  UNINSTALL_FAIL: 5, // 卸载失败
};

// 演练对象 应用 or 非应用
export const APPLICATION_TYPE = {
  APPLICATION: 0, // 应用
  HOSTS: 2, // 非应用
};

// 节点类型
export const NODE_TYPE = {
  NORMAL: -1, // 流程节点
  OBSERVER: 0, // 全局观察节点
  RECOVER: 1, // 全局恢复节点
  TASK: 2, // 执行页面操作节点，主要用来做前端区分
};

// 演练前置校验参数
export const OPLEVEL = {
  GREEN: 0, // 校验通过，可演练
  YELLOW: 1, // 可演练，但有检查项不通过
  RED: 2, // 不可演练
  POP: 3, // 资源包校验
};

