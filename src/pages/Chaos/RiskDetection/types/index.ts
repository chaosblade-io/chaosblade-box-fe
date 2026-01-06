// 风险探测模块类型定义

// 风险点数据结构
export interface RiskPoint {
  id: string;
  name: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  targetService: string;
  targetServiceId: string;
  affectedServices: string[];
  detectedAt: number;
  status: RiskStatus;
  // 推荐的故障类型
  recommendedFaults: RecommendedFault[];
  // 风险分析详情
  analysis: RiskAnalysis;
  // 关联的演练场景
  relatedExperiments?: RelatedExperiment[];
}

// 风险类别
export type RiskCategory =
  | 'SINGLE_POINT_FAILURE'  // 单点故障
  | 'DEPENDENCY_RISK'       // 依赖风险
  | 'RESOURCE_RISK'         // 资源风险
  | 'NETWORK_RISK'          // 网络风险
  | 'DATA_RISK'             // 数据风险
  | 'CAPACITY_RISK';        // 容量风险

// 风险严重程度
export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// 风险状态
export type RiskStatus =
  | 'DETECTED'    // 已发现
  | 'ANALYZING'   // 分析中
  | 'VERIFIED'    // 已验证（通过演练验证）
  | 'MITIGATED'   // 已缓解
  | 'RESOLVED';   // 已解决

// 推荐的故障类型
export interface RecommendedFault {
  faultType: string;
  faultCode: string;
  faultName: string;
  description: string;
  priority: number;
  parameters?: Record<string, any>;
}

// 风险分析详情
export interface RiskAnalysis {
  impactScope: string;
  impactDescription: string;
  rootCause: string;
  recommendations: string[];
  mitigationSteps: string[];
}

// 关联的演练场景
export interface RelatedExperiment {
  experimentId: string;
  experimentName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: number;
  executedAt?: number;
  result?: ExperimentResult;
}

// 演练结果
export interface ExperimentResult {
  success: boolean;
  executionTime: number;
  affectedNodes: number;
  metrics: ExperimentMetrics;
  riskValidation: RiskValidation;
}

// 演练指标
export interface ExperimentMetrics {
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
  throughput: number;
}

// 风险验证结果
export interface RiskValidation {
  riskConfirmed: boolean;
  impactAssessment: ImpactAssessment;
  repairSuggestions: RepairSuggestion[];
}

// 影响评估
export interface ImpactAssessment {
  beforeFault: SystemState;
  duringFault: SystemState;
  afterFault: SystemState;
  differenceAnalysis: string;
}

// 系统状态
export interface SystemState {
  availability: number;
  responseTime: number;
  errorRate: number;
  affectedUsers: number;
  description: string;
}

// 修复建议
export interface RepairSuggestion {
  priority: number;
  title: string;
  description: string;
  steps: string[];
  estimatedEffort: string;
  expectedImprovement: string;
}

// K8s 资源类型
export type K8sResourceType =
  | 'NAMESPACE'
  | 'DEPLOYMENT'
  | 'REPLICASET'
  | 'POD'
  | 'SERVICE'
  | 'CONFIGMAP'
  | 'SECRET'
  | 'PVC'
  | 'INGRESS'
  | 'STATEFULSET'
  | 'DAEMONSET';

// K8s 资源关系类型
export type K8sRelationType =
  | 'contains'    // 包含
  | 'manages'     // 管理
  | 'creates'     // 创建
  | 'selects'     // 选择
  | 'mounts'      // 挂载
  | 'claims'      // 声明
  | 'calls'       // 调用
  | 'routes_to'   // 路由
  | 'runs_on';    // 运行于

// K8s 资源状态类型
export type K8sResourceStatus =
  // Pod 状态
  | 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Unknown'
  | 'CrashLoopBackOff' | 'ImagePullBackOff'
  // Node 状态
  | 'Ready' | 'NotReady' | 'SchedulingDisabled'
  // Deployment 状态
  | 'Available' | 'Progressing' | 'ReplicaFailure'
  // Service 状态
  | 'Active'
  // PVC 状态
  | 'Bound' | 'Lost'
  // 通用状态
  | 'Healthy' | 'Warning' | 'Error';

// 拓扑节点（K8s 资源）
export interface RiskTopologyNode {
  id: string;
  name: string;
  type: K8sResourceType;
  namespace?: string;
  status: K8sResourceStatus;
  riskCount: number;
  hasRiskConfig: boolean;
  risks: RiskPoint[];
  position: { x: number; y: number };
  // K8s 资源特有属性
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  resourceVersion?: string;
  createdAt?: number;
  // 额外的资源信息
  metadata?: K8sResourceMetadata;
  // 域信息
  domain?: string;
}

// K8s 资源元数据
export interface K8sResourceMetadata {
  replicas?: number;        // Deployment/ReplicaSet
  readyReplicas?: number;   // Deployment/ReplicaSet
  podIP?: string;           // Pod
  hostIP?: string;          // Pod
  phase?: string;           // Pod phase
  clusterIP?: string;       // Service
  ports?: { port: number; targetPort: number; protocol: string }[];  // Service
  storageClass?: string;    // PVC
  capacity?: string;        // PVC
}

// 拓扑边
export interface RiskTopologyEdge {
  id: string;
  source: string;
  target: string;
  type: K8sRelationType;
  label?: string;
}

// 风险分析请求
export interface RiskAnalysisRequest {
  nodeIds?: string[];
  categories?: RiskCategory[];
  minSeverity?: RiskSeverity;
}

// 风险分析响应
export interface RiskAnalysisResponse {
  success: boolean;
  risks: RiskPoint[];
  summary: RiskSummary;
  analysisTime: number;
}

// 风险汇总
export interface RiskSummary {
  totalRisks: number;
  bySeverity: Record<RiskSeverity, number>;
  byCategory: Record<RiskCategory, number>;
  criticalServices: string[];
}

// 拓扑过滤器配置
export interface TopologyFilterConfig {
  // 按资源类型过滤
  resourceTypes: K8sResourceType[];
  // 按命名空间过滤
  namespaces: string[];
  // 按状态过滤
  statuses: K8sResourceStatus[];
  // 按风险等级过滤
  hasRisk: boolean | null;  // null = 全部, true = 有风险, false = 无风险
  // 按域过滤
  domains: string[];
  // 搜索文本
  searchText: string;
}

// Trace 相关类型（参考 OpenTelemetry 和 Jaeger）
export interface TraceData {
  traceId: string;
  spanCount: number;
  duration: number; // 毫秒
  startTime: number; // 时间戳（毫秒）
  endTime: number;
  serviceName: string;
  operationName: string;
  status: 'success' | 'error';
  spans: SpanData[];
}

export interface SpanData {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: number; // 微秒（相对于 trace 开始时间）
  duration: number; // 微秒
  tags: Record<string, any>; // 兼容 Jaeger
  attributes?: Record<string, any>; // OpenTelemetry 标准
  logs: SpanLog[]; // 兼容 Jaeger
  events?: SpanEvent[]; // OpenTelemetry 标准
  status: 'ok' | 'error';
  statusCode?: number; // OpenTelemetry 状态码：0=UNSET, 1=OK, 2=ERROR
  statusMessage?: string; // OpenTelemetry 状态消息
  kind: 'client' | 'server' | 'producer' | 'consumer' | 'internal';
  resource?: Record<string, any>; // OpenTelemetry 资源信息
}

export interface SpanLog {
  timestamp: number; // 微秒
  fields: Record<string, any>;
}

export interface SpanEvent {
  timeUnixNano: number; // 纳秒时间戳
  name: string;
  attributes?: Record<string, any>;
}

export interface REDMetrics {
  // Rate - 请求速率
  rate: number; // 每秒请求数
  totalRequests: number; // 总请求数

  // Errors - 错误率
  errorCount: number; // 错误总数
  errorPercentage: number; // 错误百分比

  // Duration - 延迟分布
  p50: number; // 中位数（毫秒）
  p95: number; // 95分位数（毫秒）
  p99: number; // 99分位数（毫秒）
  avg: number; // 平均值（毫秒）
  max: number; // 最大值（毫秒）
  min: number; // 最小值（毫秒）
}

export interface TraceListFilter {
  timeRange: {
    start: number;
    end: number;
  };
  serviceName?: string;
  minDuration?: number; // 毫秒
  maxDuration?: number; // 毫秒
  status?: 'success' | 'error' | 'all';
}

export interface TraceListResponse {
  traces: TraceData[];
  total: number;
  redMetrics: REDMetrics;
}

