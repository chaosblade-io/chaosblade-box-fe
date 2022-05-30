import i18n from '../../../i18n';
export const ExperimentConstants = {

  EXPERIMENT_STATE_DRAFT: 'DRAFT',
  EXPERIMENT_STATE_READY: 'READY',
  EXPERIMENT_STATE_RUNNING: 'RUNNING',
  EXPERIMENT_STATE_SYNC: 'SYNC_WAIT_EDIT',

  EXPERIMENT_TASK_RESULT_SUCCESS: 'SUCCESS',
  EXPERIMENT_TASK_RESULT_FAILED: 'FAILED',
  EXPERIMENT_TASK_RESULT_REJECTED: 'REJECTED', // 丢弃
  EXPERIMENT_TASK_RESULT_ERROR: 'ERROR',
  EXPERIMENT_TASK_RESULT_STOPPED: 'STOPPED', // 主动停止

  EXPERIMENT_TASK_STATE_FINISHED: 'FINISHED',
  EXPERIMENT_TASK_STATE_RUNNING: 'RUNNING',
  EXPERIMENT_TASK_STATE_STOPPING: 'STOPPING',
  EXPERIMENT_TASK_STATE_READY: 'READY',

  EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_WAITING: 'USER_CHECK_STATE_WAITING',
  EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_PASSED: 'USER_CHECK_STATE_PASSED',
  EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_FAILED: 'USER_CHECK_STATE_FAILED',

  EXPERIMENT_RELATION_TYPE_EMERGENCY_SCENE: 'emergency_scene',
  EXPERIMENT_RELATION_TYPE_OWNER: 'owner',

  ERROR: i18n.t('Abnormal'),
  FAILED: i18n.t('Not as expected'),
  STOPPED: i18n.t('Interrupt'),
  SUCCESS: i18n.t('Success'),
  EXCEPTION: i18n.t('Abnormal'),
  TOTAL: i18n.t('Number of drills'),
};

export const SearchOptDict: any = {
  // '': {
  //   name: '全部',
  // },
  1: {
    name: i18n.t('Success'),
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [ ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS ],
  },
  2: {
    name: i18n.t('In progress'),
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING,
    results: [],
  },
  3: {
    name: i18n.t('Interrupt'),
    value: '3',
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_REJECTED,
      ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED,
    ],
  },
  4: {
    name: i18n.t('Not as expected'),
    value: '4',
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED,
    ],
  },
  5: {
    name: i18n.t('Abnormal'),
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR,
    ],
  },
};


export const SearchOptions = [
  {
    label: i18n.t('All'),
  },
  {
    label: i18n.t('Success'),
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS,
    ],
  },
  {
    label: i18n.t('In progress'),
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING,
    results: [],
  },
  {
    label: i18n.t('Interrupt'),
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_REJECTED,
      ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED,
    ],
  },
  {
    label: i18n.t('Not as expected'),
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED,
    ],
  },
  {
    label: i18n.t('Abnormal'),
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR,
    ],
  },
];
