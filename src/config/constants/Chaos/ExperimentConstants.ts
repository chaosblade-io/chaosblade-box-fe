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

  ERROR: '异常',
  FAILED: '不符合预期',
  STOPPED: '中断',
  SUCCESS: '成功',
  EXCEPTION: '异常',
  TOTAL: '演练次数',
};

export const SearchOptDict: any = {
  // '': {
  //   name: '全部',
  // },
  1: {
    name: '成功',
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [ ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS ],
  },
  2: {
    name: '进行中',
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING,
    results: [],
  },
  3: {
    name: '中断',
    value: '3',
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_REJECTED,
      ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED,
    ],
  },
  4: {
    name: '不符合预期',
    value: '4',
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED,
    ],
  },
  5: {
    name: '异常',
    status: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR,
    ],
  },
};


export const SearchOptions = [
  {
    label: '全部',
  },
  {
    label: '成功',
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS,
    ],
  },
  {
    label: '进行中',
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING,
    results: [],
  },
  {
    label: '中断',
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_REJECTED,
      ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED,
    ],
  },
  {
    label: '不符合预期',
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED,
    ],
  },
  {
    label: '异常',
    state: ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED,
    results: [
      ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR,
    ],
  },
];
