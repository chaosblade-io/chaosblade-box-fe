import { CommonReq } from 'config/interfaces';

export interface IScopeControlHeatmapChartData {
  date?: string;
  day?: number;
  month?: number;
  time: number;
  total: number;
  year?: number;
}

export interface IScopeControlRingChartData {
  code: string;
  count: number;
  name: string;
}

export interface IScopeContorlInfo {
  agent_status: number;
  agent_version: string;
  configuration_id: string;
  collect_time: number;
  last_ping_time: number;
  hostname: string;
  private_ip: string;
  public_ip: string;
  os_version: string;
  running_info: {
    total: number;
  };
  scope_type: number;
  device_id: string;
  app_info?: {
    app_name: string;
    app_id: string;
  };
  cluster_info?: {
    cluster_name: string;
    pod_count: number;
  }
}

export interface IScopeContorlDetailExperimentRecord {
  end_time: number;
  experiment_id: string;
  name: string;
  result: string;
  start_time: number;
  state: string;
  task_id: string;
}

export interface IQueryScopeControlPodReq extends CommonReq {
  node_configuration_id: string;
  key?: string;
  page?: number;
  size?: number;
  kub_namespace?: string[];
}

export interface IQueryScopeControlDetailReq extends CommonReq {
  configuration_id: string;
  scope_type?: number;
  page?: number;
  size?: number;
}

export interface IListExperimentNodesByCluster extends CommonReq {
  cluster_id: string;
  page?: number;
  size?: number;
}

export interface IQueryExperimentScopesReq extends CommonReq {
  scope_type: number;
  filter: {
    type: string;
    key: string;
  };
  page: number;
  size: number;
}

