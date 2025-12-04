// 演练场景相关类型定义 - 用于风险点到演练场景的转换

import { RiskPoint, RiskSeverity } from './index';

// 生成演练场景的请求
export interface GenerateExperimentRequest {
  riskPoints: RiskPoint[];
  selectedFaults: SelectedFault[];
  experimentConfig: ExperimentConfig;
}

// 选中的故障配置
export interface SelectedFault {
  riskPointId: string;
  faultCode: string;
  faultName: string;
  parameters: Record<string, any>;
}

// 演练配置
export interface ExperimentConfig {
  name: string;
  description: string;
  workspaceId?: string;
  duration: number;         // 演练持续时间（秒）
  autoRecover: boolean;     // 是否自动恢复
  tags: string[];
}

// 生成的演练场景（与原有演练体系兼容）
export interface GeneratedExperiment {
  experimentId: string;
  baseInfo: ExperimentBaseInfo;
  flow: ExperimentFlow;
  riskContext: RiskContext;   // 风险上下文信息
}

// 演练基础信息
export interface ExperimentBaseInfo {
  experimentId: string;
  name: string;
  description: string;
  tags: string[];
  miniAppDesc: any[];
  workspaces: any[];
  relations: any[];
  source: 'RISK_DETECTION';   // 标记来源为风险探测
}

// 演练流程
export interface ExperimentFlow {
  experimentId: string;
  runMode: 'SEQUENCE' | 'PARALLEL';
  state: string;
  duration: number;
  schedulerConfig: {
    cronExpression: string;
  };
  flowGroups: FlowGroup[];
  guardConf: {
    guards: any[];
  };
}

// 流程组
export interface FlowGroup {
  groupId: string;
  groupName: string;
  hosts: Host[];
  flows: Flow[];
  scopeType: number;
  appId?: string;
  appName?: string;
}

// 主机
export interface Host {
  deviceId: string;
  deviceName: string;
  ip: string;
  clusterId: string;
  clusterName: string;
  scopeType: number;
  k8s: boolean;
}

// 流程
export interface Flow {
  flowId: string;
  id: string;
  attack: ActivityNode[];
  check: ActivityNode[];
  prepare: ActivityNode[];
  recover: ActivityNode[];
}

// 活动节点
export interface ActivityNode {
  id: string;
  name: string;
  code: string;
  functionId: string;
  arguments: ArgumentItem[];
  nodeType: number;
}

// 参数项
export interface ArgumentItem {
  name: string;
  alias: string;
  value: string | number | boolean;
  unit: string;
}

// 风险上下文
export interface RiskContext {
  riskPointIds: string[];
  riskNames: string[];
  severityLevel: RiskSeverity;
  expectedImpact: string;
  validationCriteria: string[];
}

// 演练执行结果（包含风险验证信息）
export interface RiskDrillResult {
  experimentId: string;
  experimentName: string;
  taskId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED';
  startTime: number;
  endTime?: number;
  
  // 原始演练结果
  executionResult: ExecutionResult;
  
  // 风险验证结果
  riskValidationResults: RiskValidationResult[];
}

// 执行结果
export interface ExecutionResult {
  success: boolean;
  duration: number;
  activities: ActivityResult[];
}

// 活动结果
export interface ActivityResult {
  activityId: string;
  activityName: string;
  state: string;
  runResult: string;
  startTime: number;
  endTime: number;
}

// 风险验证结果
export interface RiskValidationResult {
  riskPointId: string;
  riskName: string;
  verified: boolean;
  impactAnalysis: ImpactAnalysis;
  recommendations: Recommendation[];
}

// 影响分析
export interface ImpactAnalysis {
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedServices: string[];
  degradedMetrics: MetricDegradation[];
  userImpact: string;
  businessImpact: string;
}

// 指标降级
export interface MetricDegradation {
  metricName: string;
  baselineValue: number;
  faultValue: number;
  degradationPercent: number;
}

// 改进建议
export interface Recommendation {
  priority: number;
  category: 'ARCHITECTURE' | 'CODE' | 'CONFIG' | 'MONITORING' | 'RUNBOOK';
  title: string;
  description: string;
  implementationSteps: string[];
  estimatedTime: string;
  expectedBenefit: string;
}

