import { CommonReq } from 'config/interfaces';

export interface IStatisitcInfo {
  active: number;
  exception: number;
  exceptionCount: number;
  failure: number;
  failureCount: number;
  finished: number;
  finishedCount: number;
  idle: number;
  running: number;
  runningCount: number;
  success: number;
  total: number;
  totalCount: number;
}

export interface IGetExperimentListReq extends CommonReq {
  searchKey: string;
  states: string[];
  results: string[];
  page: number;
  size: number;
  tagNames: string[];
  scheduler: boolean;
}

export interface IExperiment {
  experiment: IExperimentInfo;
  experimentId: string;
}

export interface IExperimentInfo {
  blockReasons: string[];
  createTime: string;
  experimentId: string;
  miniAppDesc: string[];
  name: string;
  opLevel: number;
  state: string;
  tags: string[];
  task: any; // 暂时不知是什么类型
  taskCreator: string;
  taskResult: string;
  taskStartTime: string;
  taskState: string;
  taskUserCheckState?: string;
  description?: string;
  schedulerConfig: {
    cronExpression: boolean;
  };
  popMessage: IPopMessage;
  permission?: number;
}

export interface IGetExperimentOptionAndInfoReq extends CommonReq {
  experimentId?: string;
  name?: string;
  taskId?: string;
  workspaceId?: string;
}

export interface IPopMessage {
  count: string;
  packName: string;
  type: string;
}
