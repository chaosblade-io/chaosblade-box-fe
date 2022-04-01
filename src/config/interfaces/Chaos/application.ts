import { CommonReq } from 'config/interfaces';

export interface IAppLicationBasic {
  app_groups: string[];
  app_id: string;
  app_name: string;
  app_type: number;
  experiment_task_count: number;
  machine_count: number;
  task: IAppLicationBasicTask;
}

export interface IAppLicationBasicTask {
  creator: IBasicTaskCreator;
  endTime: number;
  experimentId: string;
  experimentName: string;
  feedbackStatus: number;
  result: string;
  startTime: number;
  state: string;
  taskId: string;
}

interface IBasicTaskCreator {
  aliAccount: boolean;
  currentUserId: string;
  mfaPresent: boolean;
  secureTransport: boolean;
  stsUser: boolean;
  subUser: boolean;
  userId: string;
}

export interface IAppLicationScopeOrContorlRecord {
  agentStatus: number;
  agentVersion: string;
  canAutoInstall: boolean;
  chaosTools: string[] | any;
  clusterName: string;
  configurationId: string;
  connectTime: number;
  deviceId: string;
  experimentTaskCount: number;
  hostName: string;
  isExperimented: boolean;
  osType: number;
  pluginType: string;
  privateIp: string;
  publicIp: string;
  // instanceId: string;
  pluginStatus: number;
  enable: boolean;
  deviceName: string;
  deviceTags: string[];
  groups?: string[];
  // hostConfigurationId: string;
  OnlineCount: number;
  // instanceId: string;
  // pluginStatus: number;
}

export interface IK8sRecord {
  clusterId: string;
  clusterName: string;
  nodeCount: number;
  chaosTools: string[] | any;
  pluginType: string;
  upgrade: boolean;
  version: string;
  agentConsistency: boolean;
  partNodes: IAppLicationScopeOrContorlRecord[];
  onlineCount: number;
  installMode: string;
  // osType: number;
  // configurationId: string;
}

export interface IApplicationConfigurationRecordAndReq extends CommonReq {
  alias: string;
  appId: string;
  component: {
    defaultValue?: string;
    required?: boolean;
    type?: string;
    value?: string;
  };
  description: string;
  functionParamAlias: string;
  gmt_modified: number;
  name: string;
  override: boolean;
  phaseFlag: number;
  priority: number;
  scope: IApplicationConfigRecordScope;
  status: number;
  value: string;
  app_id?: string;
}

export interface IApplicationConfigRecordScope {
  appCodes?: string[];
  nodeGroups?: string[];
}

export interface IAppLicationCommmonReq extends CommonReq {
  app_id?: string;
  app_name?: string;
  page?: number;
  size?: number;
  pageSize?: number;
  filterDisabled?: boolean;
}

export interface IAppLicationSearchApp extends CommonReq {
  key: string;
  filterDisabled: boolean;
}

export interface ISearchApplicationHosts extends IAppLicationCommmonReq {
  key: string;
  group: string;
}

export interface IUpdateApplicationTag extends IAppLicationCommmonReq {
  appId: string,
  configurationIds: string[],
  tags: string[],
  groupName?: string;
}

