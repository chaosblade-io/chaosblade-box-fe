import { CommonReq } from 'config/interfaces';
import { IComponent, IField, ITolerance } from 'config/interfaces/Chaos/experiment';

export interface ITask extends CommonReq{
  taskId: string | string[] | null;
}

export interface IExperimentTaskId extends CommonReq{
  experimentTaskId: string | string[] | null;
}

export interface IActivityTaskId extends CommonReq{
  activityTaskId: string;
}

export interface IminiTaskId extends CommonReq{
  miniAppTaskId: string;
}

export interface IPourLogPrams extends CommonReq{
  expid: string;
  hostIp: string;
  fromDate: number;
}

export interface ISubmitFeedback extends CommonReq{
  taskId: string | string[] | null;
  feedback: any;
}

export interface IExperimentTask{
  creator: ICreator;
  endTime: number;
  experimentId: string;
  experimentName: string;
  activities: IActivity[];
  result: string;
  startTime: number;
  state: string;
  taskId: string;
  schedulerTask: boolean;
  permission?: number;
  isJvm: boolean;
  loadTestConfig?: ILoadTestConfig;
}

export interface ILoadTestConfig {
  selectedDefinitions: string[];
  preStartTime: number;
  preStartUnit: 'minute' | 'second';
  duration: number;
  durationUnit: 'minute' | 'second';
}

export interface ICreator{
  outerId: string | number;
  userId: string;
  userName: string;
  userNick: number;
}

export interface IMetrics{
  guardId: string;
  name: string;
  state: string;
  data: IMetricsItem[];
  subName: string;
}

export interface IMetricsItem{
  group: string;
  timestamp: number | string;
  value: number;
}

export interface IToleranceTask extends ITolerance{
  data: IToleranceValue[];
}

export interface IToleranceValue{
  alias: string;
  value: string;
  unit: string;
  name: string;
  component: IComponent;
}

export interface IActivity{
  activityId: string;
  activityTaskId: string;
  endTime: number;
  miniAppCode: string;
  miniAppName: string;
  retryable: boolean;
  order: number;
  phase: string;
  runResult: string;
  userCheckState: string;
  startTime: number;
  state: string;
  stage?: string;
  id?: string;
  nodeType?: number;
}

export interface IActivityTask{
  activityId: string;
  activityTaskId: string;
  apps: IApp[];
  endTime: number;
  startTime: number;
  miniAppCode: string;
  miniAppName: string;
  order: number;
  phase: string;
  arguments: [];
  extInfo: {
    schedulerConfig: {
      cronExpression: string;
    }
  };
  runResult: string;
  state: string;
  userCheckState: string;
}

export interface IApp{
  data: any;
  endTime: number;
  errorMessage: string;
  hostIp: string;
  result: string;
  startTime: number;
  state: string;
  taskId: string;
  expId: string;
  deviceName: string;
  appConfigurationId: string;
}

export interface ITaskGuardInfo{
  metrics: IMetrics[];
  strategies: [];
}

export interface IStrategies{
  guardId: string;
  name: string;
  strategyDesc: string;
  state: string;
  fields: IField[];
  tolerance: IToleranceTask[];
}

export interface ILog{
  content: string;
}
