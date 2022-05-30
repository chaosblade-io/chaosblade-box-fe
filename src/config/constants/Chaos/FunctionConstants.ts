import i18n from '../../../i18n';
export const FunctionConstants = {

  SOURCE_CUSTOM_APP: 0,
  SOURCE_CHAOS_BLADE: 1,
  SOURCE_SCRIPT: 2,
  SOURCE_FISSION: 3,
  SOURCE_LITMUS_CHAOS: 4,

  STATUS_READY: { value: 0, label: i18n.t('To be published'), operation: '', next: 1 },
  STATUS_PUBLISH: { value: 1, label: i18n.t('Published'), operation: i18n.t('On the shelf'), next: 2 },
  STATUS_ONLINE: { value: 2, label: i18n.t('Published (online)'), operation: i18n.t('Take down'), next: 1 },

  // eslint-disable-next-line no-bitwise
  PHASE_PREPARE: { label: i18n.t('Preparation stage'), shortLabel: i18n.t('Prepare'), value: (1 << 0) },
  // eslint-disable-next-line no-bitwise
  PHASE_EXECUTE: { label: i18n.t('Execution phase'), shortLabel: i18n.t('Implement'), value: (1 << 1) },
  // eslint-disable-next-line no-bitwise
  PHASE_CHECK: { label: i18n.t('Inspection phase'), shortLabel: i18n.t('Checking'), value: (1 << 2) },
  // eslint-disable-next-line no-bitwise
  PHASE_RECOVER: { label: i18n.t('Recovery phase'), shortLabel: i18n.t('Resume'), value: (1 << 3) },
  // eslint-disable-next-line no-bitwise
  PHASE_OVERALL: { label: i18n.t('Global'), shortLabel: i18n.t('Global'), value: (1 << 4) },

  DRILL_HOST: { label: i18n.t('Host'), value: 0 },
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

export const ENABLED_TYPES = [ i18n.t('To be published'), i18n.t('Published'), i18n.t('Published (online)') ];

