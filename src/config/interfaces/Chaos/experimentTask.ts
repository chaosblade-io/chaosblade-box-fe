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

// 压测定义相关接口
export interface ILoadTestDefinition {
  id: string;
  name: string;
  engineType: 'JMETER' | 'K6' | 'LOCUST';
  endpoint: string;
  entry: 'URL' | 'SCRIPT';
  contentRef?: string;
  urlCase?: {
    method: string;
    path: string;
    headers: Record<string, string>;
  };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  namespace: string;
}

export interface ICreateLoadTestDefinitionReq extends CommonReq {
  name: string;
  engineType: 'JMETER' | 'K6' | 'LOCUST';
  endpoint: string;
  entry: 'URL' | 'SCRIPT';
  contentRef?: string;
  urlCase?: {
    method: string;
    path: string;
    headers: Record<string, string>;
  };
}

export interface IUpdateLoadTestDefinitionReq extends CommonReq {
  id: string;
  name?: string;
  engineType?: 'JMETER' | 'K6' | 'LOCUST';
  endpoint?: string;
  entry?: 'URL' | 'SCRIPT';
  contentRef?: string;
  urlCase?: {
    method: string;
    path: string;
    headers: Record<string, string>;
  };
}

export interface IDeleteLoadTestDefinitionReq extends CommonReq {
  id: string;
}

export interface IGetLoadTestDefinitionReq extends CommonReq {
  id: string;
}

export interface IQueryLoadTestDefinitionsReq extends CommonReq {
  pageNum: number;
  pageSize: number;
  name?: string;
  engineType?: 'JMETER' | 'K6' | 'LOCUST';
}

export interface IListAllLoadTestDefinitionsReq extends CommonReq {
  // 只需要 namespace，已在 CommonReq 中
}

// 文件上传相关接口
export interface IUploadJmxFileReq extends CommonReq {
  file: File;
  endpoint: string;
}

export interface IJmxFileUploadResponse {
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  uploadPath: string;
  accessUrl: string;
  uploadTime: number;
  uploadDate: string;
}

// 压测策略相关接口
export interface ILoadTestStrategy {
  id: string;
  enable: boolean;
  definitionId: string;
  experimentId: string;
  startBeforeFaultSec: number;
  trafficDurationSec: number;
  abortOnLoadFailure: boolean;
  namespace: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateLoadTestStrategyReq extends CommonReq {
  enable: boolean;
  definitionId: string;
  experimentId: string;
  startBeforeFaultSec: number;
  trafficDurationSec: number;
  abortOnLoadFailure: boolean;
}

export interface IGetLoadTestStrategyByExperimentIdReq extends CommonReq {
  experimentId: string;
}

export interface IUpdateLoadTestStrategyReq extends CommonReq {
  id: string;
  enable?: boolean;
  definitionId?: string;
  experimentId?: string;
  startBeforeFaultSec?: number;
  trafficDurationSec?: number;
  abortOnLoadFailure?: boolean;
}

export interface IDeleteLoadTestStrategyReq extends CommonReq {
  id: string;
}

// 压测任务相关接口
export interface ILoadTestTask {
  createdAt: number;
  executionId: string;
  experimentTaskId: string;
  startTime: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED';
  statusDescription: string;
  strategyId: string;
  taskId: string;
  updatedAt: number;
}

export interface IGetLoadTestTaskReq extends CommonReq {
  taskId: string;
}

export interface IGetLoadTestResultsReq extends CommonReq {
  taskId: string;
}

export interface IGetLoadTestMetricsReq extends CommonReq {
  executionId: string;
}

export interface IStopLoadTestTaskReq extends CommonReq {
  taskId: string;
}

// 压测指标数据结构
export interface ILoadTestMetrics {
  executionId: string;
  bucketSizeMs: number;
  avgLatency: [number, number][];
  minLatency: [number, number][];
  maxLatency: [number, number][];
  p90: [number, number][];
  p95: [number, number][];
  p99: [number, number][];
  successRate: [number, number][];
  throughputReceived: [number, number][];
  throughputSent: [number, number][];
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
