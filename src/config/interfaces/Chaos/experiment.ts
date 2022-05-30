import { CommonReq } from 'config/interfaces';
import { ILabel } from 'config/interfaces/Chaos/components';

export interface IExperiment extends CommonReq{
  id: string;
  experimentId: string;
  baseInfo: IBaseInfo;
  flow: IFlowInfo;
  observerNodes: INode[];
  recoverNodes: INode[];
  flowInfo?: IFlowInfo;
  basicInfo?: IBaseInfo;
  definition?: IFlowInfo;
  workspaceId?: string;
  permission?: number;
}

export interface IBaseInfo extends CommonReq{
  name: string;
  description: string;
  tags: [];
  experimentId: string;
  gmtCreate?: string;
  gmtModified?: string;
  miniAppDesc: [];
  relations: [];
  state?: string;
  workspaces: [];
  [key: string]: any;
}

export interface IFlowInfo {
  experimentId: string;
  runMode: string;
  state: string;
  duration: number;
  schedulerConfig: {
    cronExpression: string;
  };
  flowGroups: IFlowGroup[];
  guardConf: {
    guards: any[];
  };
}

export interface IBaseInfo {
  experimentId: string;
  name: string;
  description: string;
  tags: [];
  miniAppDesc: [];
  workspaces: [];
  relations: [];
}

export interface IFlowGroup extends CommonReq{
  appId?: string;
  appName?: string;
  appGroups?: any[];
  appType?: number | string;
  flows?: IFlow[] | undefined;
  groupId?: string | null;
  groupName?: string;
  hosts: IHost[];
  id?: string;
  order?: number;
  required?: boolean;
  scopeType?: number | string;
  displayIndex?: number;
  app_name?: string;
  selectType?: number | string;
  hostPercent?: number | string;
  experimentObj?: number;
  cloudServiceType?: string;
  cloudServiceName?: string;
  osType?: number;
}

export interface IFlow {
  flowId?: string;
  id: string;
  order?: number;
  required: boolean;
  attack: any[];
  check: any[];
  prepare: any[];
  recover: any[];
  [key: string]: any;
}

// export interface IInitMiniFlow {
//   attack: any[];
//   check: any[];
//   prepare: any[];
//   recover: any[];
//   id?: number | string;
//   [key: string]: any;
// }

export interface IHost {
  scopeType: number | string;
  clusterName: string;
  clusterId: string;
  deviceName: string;
  deviceId: string;
  ip: string;
  allow: boolean;
  appConfigurationId?: string;
  nodeGroup?: string;
  appScope: boolean;
  deviceConfigurationId: string;
  deviceType: number;
  k8s: boolean;
  master: boolean;
  port: number;
  privateIp: string;
  regionId: string;
  targetIp: string;
  vpcId: string;
  appId?: number | string;
  app?: string;
  appName?: string;
  appGroups?: any[];
  appType?: string | number;
  label?: string;
  passed?: boolean;
  content?: string;
  invalid?: boolean; // 是否是失效机器，true失效
  authMessage: string; // 不可以原因
}

export interface IStage {
  key: string;
}

export interface INode {
  activityId?: string;
  activityName?: string;
  app_code?: string;
  arguments: IArgs[];
  nodeType?: number;
  order?: number;
  required?: boolean;
  scope?: [];
  sync?: boolean;
  user_check?: boolean;
  actionType?: number;
  appCode?: string;
  args: IArgs[];
  code?: string;
  guardId?: string;
  id: string;
  name: string;
  functionId?: string;
  parentName?: string;
  tolerance?: any[];
  fields?: IField[];
  displayFields?: IField[];
  displayTolerance?: any[];
  prev?: INode;
  next?: INode;
  deletable?: boolean;
  flowId?: string | number | null;
  argsValid?: boolean;
  stage?: string | undefined;
  phase?: number;
  insertBefore?: (newNode: INode) => void;
  insertAfter?: (newNode: INode) => void;
  miniAppName?: string;
  state?: string;
  runResult: string;
  retryable: boolean;
  userCheckState?: string;
  groupOrder?: number;
  hosts?: IHost[];
  pauses?: {
    before: number;
    after: number;
  };
  hostPercent?: number | string;
  failedTolerance: number;
  interruptedIfFailed: boolean
}

export interface IArgs {
  alias: string;
  component: IComponent;
  description: string;
  enabled: boolean;
  functionId: string;
  name: string;
  parameterId: string;
  unit: string;
  value: string | number | boolean;
  errorMessage?: string;
  type?: string;
}

export interface IStages {
  key: string;
  value: number;
}

export interface IComponent {
  cipherText: string;
  defaultValue: string | number | boolean;
  linkage: ILinkage;
  opLevel?: number;
  requestUrl: string;
  required: boolean;
  type: string;
  unit: string;
  constraint?: IConstraint;
  options?: IOption[];
}

export interface ILinkage {
  condition: string;
  defaultState: boolean;
  depends: string;
}

export interface IOption {
  key: string;
  value: string;
}

export interface IConstraint {
  checkerTemplate: string;
  range: string[];
}

export interface IApp {
  appType: number;
  deep: number;
  label: string;
  scopesType: number;
  value: string;
  osType: number;
}

export interface IFunctionsResult {
  data: IFunction[];
  hasMore: boolean;
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface IFunction {
  agentRequired: boolean;
  categoryIds: [];
  code: string;
  description: string;
  enabled: number;
  functionId: string;
  gmtCreate: string;
  name: string;
  nextDepAppCode: string;
  parentFunctionId: string;
  parentName: string;
  phaseFlag: number;
  sceneId: string;
  source: number;
  supportScopeTypes: [];
  systemVersions: [];
  type: string;
  version: string;
  arguments?: [];
}

export interface ICheckResult{
  is_pass: boolean;
  details: ICheckDeatail[];
}

export interface ICheckDeatail{
  id: string;
  params: IParam[];
}

export interface IParam{
  alias: string;
  error: string;
}

export interface IParamter extends IArgs {
  type: string;
  sequence: number;
  state: boolean;
}
export interface IAppLications {
  appType: number;
  label: string;
  scopesType: number;
  value: string;
  osType?: number;
}

export interface IAppGet {
  app_id: string;
  app_name: string;
  scope_type: number;
  app_type: number;
  os_type?: number;
}

export interface ICronExpression {
  cronExpression: string;
}

// 恢复策略接口
export interface IGuardRule {
  functionId: string;
  parameters: IArgs[];
  fields: IField[];
  tolerance: ITolerance[];
}

export interface ITolerance {
  name: string;
  alias: string;
  description: string;
  unit: string;
  component: IComponent;
  value?: string | number;
  state?: boolean;
}

export interface IField extends ITolerance {
  operations?: ILabel[];
  operation?: {
    value?: string;
    label?: string;
  };
  and: string | boolean;
}

export interface IExperimentId extends CommonReq{
  experimentId: string | string[] | null | undefined;
}

export interface ISearchKey extends CommonReq{
  key: string;
  type: number;
}

export interface IGetApp extends CommonReq{
  appType?: number | string;
  filterDisabled?: boolean;
  osType?: number;
}

export interface IApplicationGroup extends CommonReq{
  app_id: string | number | undefined;
}

export interface IGetScopeByApplication extends IApplicationGroup{
  app_group: string[] | undefined;
  page: number;
  key?: string;
  size: number;
  tags?: string[];
  osType?: number;
}

export interface IGetScopeNoApplication extends CommonReq {
  scopeType?: number | string;
  page: number;
  size: number;
  key?: string;
  tags?: string[];
  osType?: number;
}

export interface IGetCloudServiceInstanceList extends CommonReq {
  type: string | undefined;
  page: number;
  size: number;
  key: string | undefined;
}

export interface ICategories extends CommonReq{
  phase: number | string;
  scopeType: number | string;
  filterNoChild?: boolean;
  cloudServiceType?: string;
  osType?: number;
}

export interface ISearchFunctions extends CommonReq{
  key?: string;
  page: number;
  k8sResourceType: number | string;
  phase: number | string;
  scopeType: number | string;
  categoryId?: string | any[];
  size: number;
}

export interface IFunctionParamterId extends CommonReq{
  functionId: string;
}

export interface IInitMiniFlowByAppCode extends CommonReq{
  appCode: string;
  source: number;
  appId: string;
  nodeGroups: string[];
}

// 标签搜索参数
export interface IDeviceTags extends CommonReq{
  appId?: string;
  groupNames?: string[];
  key: string;
}

// 百分比选择机器，机器总数
export interface ICount extends CommonReq{
  appId?: string;
  groupNames?: string[];
}

export interface IWorkSpaces {
  workspaceId: string;
  name: string;
}
