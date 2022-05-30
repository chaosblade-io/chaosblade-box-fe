import { CommonReq } from 'config/interfaces';

/** 请求参数 */
export interface IQueryParams extends CommonReq {
  region: string
}

/** 探针统计数据 */
export interface IUserAgentBase {
  errorCount: number;
  normalCount: number;
  onlineCount: number;
  totalCount: number;
}
export interface IUserAgent {
  cluster?: IUserAgentBase;
  host?: IUserAgentBase;
}
/** 公告消息 */
export interface INotifyBase {
  important: boolean;
  link: string;
  title: string;
}
export interface INotify {
  message?: INotifyBase[];
  practice?: INotifyBase[];
}
/** 常用场景 */
export interface IUserScene {
  appCode: string;
  name: string;
  sceneTarget: string;
  sceneType: string;
}
/** 演练数据统计 */
export interface IUserExperimentInfo {
  active: number;
  exception: number;
  failure: number;
  finished: number;
  idle: number;
  running: number;
  success: number;
  total: number;
}
/** 用户演练经验 */
export interface IUserExperiment {
  expertiseDescription: string;
  expertiseId: string;
  expertiseName: string;
  expertiseTargetType: string;
  expertiseTargetIcon: string;
}

/** 用户演练任务分布 */
export interface IExperimentDay {
  failedCount: number;
  time: number;
  totalCount: number;
}
