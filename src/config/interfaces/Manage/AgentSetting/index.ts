import { CommonReq } from '../../index';

export interface IQueryPluginsParams extends CommonReq {
  PageIndex: number;
  PageSize: number;
  InstanceName: string;
  PluginType: number;
  PluginStatus: string;
  ClusterId?: string;
}
export interface IListKubernetesClusterParams extends CommonReq {
  PageIndex: number;
  PageSize: number;
  ClusterId?: string;
  ClusterName?: string;
}

export interface IDescribePluginRateParams extends CommonReq {
  PluginType: number;
}

export interface IQueryPluginsResult {
  currentPage: number;
  pageSize: number;
  result: IQueryPluginsResultDatas[];
  totalItem: number;
  totalPage: number;
}

export interface IQueryPluginsResultDatas extends IQueryPluginStatusResult {
  connectTime: number | string;
  installMode: string;
  link: string;
  version: string;
  upgrade: boolean;
  upgradeVersion: string;
  chaosTools: string[] | undefined;
}
export interface IListKubernetesClusterResult {
  CurrentPage: number;
  PageSize: number;
  Result: IListKubernetesClusterResultDatas[];
  TotalItem: number;
  TotalPage: number;
}

export interface IListKubernetesClusterResultDatas {
  ClusterId: number | string;
  ClusterName: string;
  ConnectTime: number;
  OnlineCount: number;
  PluginType: string;
  Version: string;
  Upgrade: boolean;
  UpgradeVersion: string;
}
export interface IStopAndStartPluginParams extends CommonReq {
  PluginType: string;
  ConfigurationId: string;
}

export interface IUninstallPluginParams extends CommonReq {
  ConfigurationId: string;
}

export interface IInstallPluginParams extends CommonReq {
  InstanceId: string;
}

export interface IQueryPluginStatusParams extends CommonReq {
  Loop: boolean;
  InstanceId: string;
}

export interface IQueryPluginStatusResult {
  canAutoInstall: boolean;
  configurationId: string;
  createTime?: number;
  enable: boolean;
  instanceId: string;
  instanceName: string;
  pluginStatus: number;
  pluginType: string;
  privateIp?: string;
  publicIp?: string;
  osType?: number;
  networkType?: string;
  pluginStatusShow: any;
  ip: any;
}


export interface IQueryUninstallAndInstallCommandParams extends CommonReq {
  Mode: 'host' | 'k8s_helm';
  ConfigurationId?: string;
  helmVersion?: string;
  OsType?: number;
}

export interface IQueryWaitInstallPluginParams extends CommonReq {
  PageNumber: number;
  PageSize: number;
  [key: string]: any,
}

export interface IGetUserApplicationsParams extends CommonReq {
  args: string;
}

export interface IBatchInstallPluginParams extends CommonReq {
  InstanceIds: string;
  AppName: string;
  AppGroupName: string;
}

export interface IBatchQueryPluginStatusParams extends CommonReq {
  Loop: boolean;
  InstanceIds: string;
}

export interface IListChaosAgentMetricsParams extends CommonReq {
  MetricNames: string;
  ConfigurationId: string;
  EndTime: number;
  StartTime: number;
}

export interface IDescribePluginDetailParams extends CommonReq {
  ConfigurationId: string;
}
