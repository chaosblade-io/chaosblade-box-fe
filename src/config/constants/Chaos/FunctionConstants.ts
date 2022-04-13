export const FunctionConstants = {

  SOURCE_CUSTOM_APP: 0,
  SOURCE_CHAOS_BLADE: 1,
  SOURCE_SCRIPT: 2,
  SOURCE_FISSION: 3,
  SOURCE_LITMUS_CHAOS: 4,

  STATUS_READY: { value: 0, label: '待发布', operation: '', next: 1 },
  STATUS_PUBLISH: { value: 1, label: '已发布', operation: '上架', next: 2 },
  STATUS_ONLINE: { value: 2, label: '已发布（上线）', operation: '下架', next: 1 },

  // eslint-disable-next-line no-bitwise
  PHASE_PREPARE: { label: '准备阶段', shortLabel: '准备', value: (1 << 0) },
  // eslint-disable-next-line no-bitwise
  PHASE_EXECUTE: { label: '执行阶段', shortLabel: '执行', value: (1 << 1) },
  // eslint-disable-next-line no-bitwise
  PHASE_CHECK: { label: '检查阶段', shortLabel: '检查', value: (1 << 2) },
  // eslint-disable-next-line no-bitwise
  PHASE_RECOVER: { label: '恢复阶段', shortLabel: '恢复', value: (1 << 3) },
  // eslint-disable-next-line no-bitwise
  PHASE_OVERALL: { label: '全局', shortLabel: '全局', value: (1 << 4) },

  DRILL_HOST: { label: '主机', value: 0 },
  DRILL_DOCKER: { label: 'Docker', value: 1 },
  DRILL_KUBERNETES: { label: 'kubernetes', value: 2 },

};

export const PHASE_FLAGS = [
  FunctionConstants.PHASE_PREPARE,
  FunctionConstants.PHASE_EXECUTE,
  FunctionConstants.PHASE_CHECK,
  FunctionConstants.PHASE_RECOVER,
  FunctionConstants.PHASE_OVERALL,
];

export const STATUS_VALUES = [
  FunctionConstants.STATUS_READY,
  FunctionConstants.STATUS_PUBLISH,
  FunctionConstants.STATUS_ONLINE,
];

export const STATUS_STYLES = [
  { ...FunctionConstants.STATUS_ONLINE, style: 'publish', iconType: 'select' },
  { ...FunctionConstants.STATUS_PUBLISH, style: 'publish', iconType: 'select' },
  { ...FunctionConstants.STATUS_READY, style: 'ready', iconType: 'close' },
];

export const FUNCTION_STATUS = [
  FunctionConstants.STATUS_READY,
  FunctionConstants.STATUS_PUBLISH,
  FunctionConstants.STATUS_ONLINE,
];

export const DRILL_OBJ = [
  FunctionConstants.DRILL_HOST,
  FunctionConstants.DRILL_KUBERNETES,
];

export const ENABLED_TYPES = [ '待发布', '已发布', '已发布（上线）' ];

