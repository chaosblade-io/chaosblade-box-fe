// 风险探测服务

import { RiskPoint, RiskAnalysisResponse, RiskTopologyNode, RiskTopologyEdge } from '../types';
import { GenerateExperimentRequest, GeneratedExperiment, RiskDrillResult } from '../types/experimentTypes';
import { mockTopologyNodes, mockTopologyEdges, mockRiskPoints, mockRiskSummary, mockDrillResults } from './mockData';
import { v4 as uuidv4 } from 'uuid';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class RiskDetectionService {
  // 获取拓扑数据
  async getTopologyData(): Promise<{ nodes: RiskTopologyNode[]; edges: RiskTopologyEdge[] }> {
    await delay(500);
    
    // 将风险点关联到节点
    const nodesWithRisks = mockTopologyNodes.map(node => {
      const nodeRisks = mockRiskPoints.filter(risk => risk.targetServiceId === node.id);
      return {
        ...node,
        risks: nodeRisks,
        riskCount: nodeRisks.length,
        hasRiskConfig: nodeRisks.length > 0,
      };
    });

    return {
      nodes: nodesWithRisks,
      edges: mockTopologyEdges,
    };
  }

  // 执行风险分析
  async analyzeRisks(nodeIds?: string[]): Promise<RiskAnalysisResponse> {
    await delay(1500); // 模拟分析耗时

    let risks = mockRiskPoints;
    if (nodeIds && nodeIds.length > 0) {
      risks = mockRiskPoints.filter(risk => nodeIds.includes(risk.targetServiceId));
    }

    return {
      success: true,
      risks,
      summary: mockRiskSummary,
      analysisTime: 1500,
    };
  }

  // 获取风险点列表
  async getRiskPoints(): Promise<RiskPoint[]> {
    await delay(300);
    return mockRiskPoints;
  }

  // 获取单个风险点详情
  async getRiskPointDetail(riskId: string): Promise<RiskPoint | null> {
    await delay(200);
    return mockRiskPoints.find(risk => risk.id === riskId) || null;
  }

  // 生成演练场景
  async generateExperiment(request: GenerateExperimentRequest): Promise<GeneratedExperiment> {
    await delay(800);

    const experimentId = `exp-${uuidv4()}`;
    const { riskPoints, selectedFaults, experimentConfig } = request;

    // 构建与原有演练体系兼容的数据结构
    const experiment: GeneratedExperiment = {
      experimentId,
      baseInfo: {
        experimentId,
        name: experimentConfig.name,
        description: experimentConfig.description,
        tags: [...experimentConfig.tags, 'risk-detection', 'auto-generated'],
        miniAppDesc: [],
        workspaces: [],
        relations: [],
        source: 'RISK_DETECTION',
      },
      flow: {
        experimentId,
        runMode: 'SEQUENCE',
        state: 'DRAFT',
        duration: experimentConfig.duration,
        schedulerConfig: { cronExpression: '' },
        flowGroups: this.buildFlowGroups(riskPoints, selectedFaults),
        guardConf: { guards: [] },
      },
      riskContext: {
        riskPointIds: riskPoints.map(r => r.id),
        riskNames: riskPoints.map(r => r.name),
        severityLevel: this.getHighestSeverity(riskPoints),
        expectedImpact: riskPoints.map(r => r.analysis.impactDescription).join('; '),
        validationCriteria: riskPoints.flatMap(r => r.analysis.recommendations),
      },
    };

    return experiment;
  }

  // 构建流程组 - 全自动化配置所有参数
  private buildFlowGroups(riskPoints: RiskPoint[], selectedFaults: any[]): any[] {
    return selectedFaults.map((fault, index) => {
      const riskPoint = riskPoints.find(r => r.id === fault.riskPointId);

      // 构建完整的Host配置
      const host = this.buildHostConfig(riskPoint);

      // 构建完整的Flow配置
      const flow = this.buildFlowConfig(fault, index);

      return {
        // 流程组标识
        id: uuidv4(),
        groupId: null,  // 新建时为null，保存后由后端返回
        groupName: riskPoint?.targetService || 'Unknown Service',

        // 执行目标
        hosts: [host],

        // 流程配置
        flows: [flow],

        // 流程组配置
        scopeType: 2,  // K8S
        appId: riskPoint?.targetServiceId || '',
        appName: riskPoint?.targetService || '',
        appType: 1,
        appGroups: [],
        order: index,
        required: true,
        displayIndex: index,
        selectType: 1,
        hostPercent: 100,
        experimentObj: 1,
        cloudServiceType: '',
        cloudServiceName: '',
        osType: 0,
      };
    });
  }

  // 构建完整的Host配置
  private buildHostConfig(riskPoint: RiskPoint | undefined): any {
    const deviceId = riskPoint?.targetServiceId || `device-${uuidv4()}`;
    const deviceName = riskPoint?.targetService || 'Unknown Service';

    return {
      // 设备基本信息
      deviceId,
      deviceName,
      ip: '10.0.0.1',
      privateIp: '10.0.0.1',
      targetIp: '10.0.0.1',

      // 集群信息
      clusterId: 'default-cluster',
      clusterName: 'Default Cluster',

      // 类型标识
      scopeType: 2,  // K8S
      deviceType: 1,
      k8s: true,
      master: false,

      // 网络信息
      port: 8080,
      regionId: 'cn-hangzhou',
      vpcId: 'vpc-default',

      // 应用信息
      appId: deviceId,
      appName: deviceName,
      appType: 1,
      appGroups: [],
      app: deviceName,

      // 配置信息
      deviceConfigurationId: `config-${deviceId}`,
      appConfigurationId: `app-config-${deviceId}`,
      nodeGroup: 'default',

      // 状态标识
      allow: true,
      appScope: true,
      passed: true,
      invalid: false,
      authMessage: '',

      // 其他
      label: deviceName,
      content: '',
    };
  }

  // 构建完整的Flow配置
  private buildFlowConfig(fault: any, index: number): any {
    const flowId = uuidv4();

    return {
      // 流程标识
      id: flowId,
      flowId: null,  // 新建时为null，保存后由后端返回
      order: 0,
      required: true,

      // 四个阶段
      prepare: [],
      attack: [this.buildAttackNode(fault)],
      check: [],
      recover: [],
    };
  }

  // 构建攻击节点 - 完整的参数配置
  private buildAttackNode(fault: any): any {
    const nodeId = uuidv4();

    // 构建完整的arguments数组
    const arguments_array = this.buildNodeArguments(fault);

    return {
      // 节点标识
      id: nodeId,
      name: fault.faultName,
      code: fault.faultCode,
      functionId: fault.faultCode,
      appCode: fault.faultCode,

      // 节点类型
      nodeType: 1,  // 普通节点
      stage: 'attack',
      actionType: undefined,

      // 参数配置
      arguments: arguments_array,
      args: arguments_array,  // args和arguments保持一致

      // 执行配置
      order: 0,
      required: true,
      sync: true,
      user_check: false,
      flowId: null,

      // 暂停配置
      pauses: {
        before: 0,
        after: 0,
      },

      // 容错配置
      hostPercent: 100,
      failedTolerance: 0,
      interruptedIfFailed: true,

      // 其他配置
      scope: [],
      tolerance: [],
      fields: [],
      displayFields: [],
      displayTolerance: [],
      deletable: true,
      argsValid: true,
      retryable: false,

      // 可选字段
      activityId: '',
      activityName: '',
      guardId: '',
      parentName: '',
      miniAppName: '',
      state: '',
      runResult: '',
      userCheckState: '',
      groupOrder: 0,
      hosts: [],
      phase: undefined,
      app_code: fault.faultCode,
    };
  }

  // 构建节点参数 - 完整的IArgs结构
  private buildNodeArguments(fault: any): any[] {
    const parameters = fault.parameters || {};

    return Object.entries(parameters).map(([name, value], index) => {
      const parameterId = `param-${name}-${uuidv4()}`;

      return {
        // 参数基本信息
        name,
        alias: this.getParameterAlias(name),
        value: value as any,
        unit: '',
        description: this.getParameterDescription(name),

        // 参数配置
        enabled: true,
        functionId: fault.faultCode,
        parameterId,

        // 组件配置
        component: {
          type: this.getComponentType(name, value),
          required: this.isParameterRequired(name),
          defaultValue: value,
          cipherText: '',
          requestUrl: '',
          unit: '',
          linkage: null,
          opLevel: undefined,
          constraint: undefined,
          options: undefined,
        },

        // 可选字段
        errorMessage: '',
        type: typeof value,
      };
    });
  }

  // 获取参数别名（中文名称）
  private getParameterAlias(name: string): string {
    const aliasMap: Record<string, string> = {
      // K8s基础参数
      'namespace': '命名空间',
      'names': 'Pod名称',
      'labels': '标签选择器',
      'container_names': '容器名称',

      // CPU/内存参数
      'cpu-percent': 'CPU使用率',
      'cpuPercent': 'CPU使用率',
      'memory-percent': '内存使用率',
      'memoryPercent': '内存使用率',

      // 时间参数
      'timeout': '持续时间',
      'duration': '持续时间',
      'time': '延迟时间',
      'delay': '延迟时间',
      'offset': '抖动范围',
      'jitter': '抖动范围',

      // 网络参数
      'destination-ip': '目标IP',
      'percent': '丢包率',
      'lossPercent': '丢包率',

      // 数据库参数
      'max-connections': '最大连接数',
      'maxConnections': '最大连接数',
      'database': '数据库编号',

      // HTTP参数
      'url': '目标URL',
      'qps': '每秒请求数',

      // Redis参数
      'pattern': '匹配模式',
    };
    return aliasMap[name] || name;
  }

  // 获取参数描述
  private getParameterDescription(name: string): string {
    const descMap: Record<string, string> = {
      // K8s基础参数
      'namespace': 'Kubernetes命名空间',
      'names': 'Pod名称，支持正则表达式匹配',
      'labels': 'Pod标签选择器，JSON格式',
      'container_names': '容器名称列表',

      // CPU/内存参数
      'cpu-percent': 'CPU压力百分比（0-100）',
      'cpuPercent': 'CPU压力百分比（0-100）',
      'memory-percent': '内存压力百分比（0-100）',
      'memoryPercent': '内存压力百分比（0-100）',

      // 时间参数
      'timeout': '故障持续时间（秒）',
      'duration': '故障持续时间（秒）',
      'time': '网络延迟时间（毫秒）',
      'delay': '延迟时间（毫秒）',
      'offset': '延迟抖动范围（毫秒）',
      'jitter': '延迟抖动范围（毫秒）',

      // 网络参数
      'destination-ip': '目标IP地址或IP段（CIDR格式）',
      'percent': '网络丢包率（0-100）',
      'lossPercent': '网络丢包率（0-100）',

      // 数据库参数
      'max-connections': '数据库最大连接数限制',
      'maxConnections': '数据库最大连接数限制',
      'database': 'Redis数据库编号（0-15）',

      // HTTP参数
      'url': 'HTTP请求目标URL',
      'qps': '每秒查询数（QPS）',

      // Redis参数
      'pattern': 'Redis键匹配模式（支持通配符*）',
    };
    return descMap[name] || '';
  }

  // 获取组件类型
  private getComponentType(name: string, value: any): string {
    if (typeof value === 'boolean') {
      return 'switch';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'object') {
      return 'json';
    }
    return 'input';
  }

  // 判断参数是否必填
  private isParameterRequired(name: string): boolean {
    // K8s相关的必填参数
    const requiredParams = [
      'namespace',  // 命名空间必填
      'names',      // Pod名称必填（或labels二选一）
      'labels',     // 标签选择器（或names二选一）
    ];
    return requiredParams.includes(name);
  }

  // 获取最高严重级别
  private getHighestSeverity(riskPoints: RiskPoint[]): any {
    const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    for (const severity of severityOrder) {
      if (riskPoints.some(r => r.severity === severity)) {
        return severity;
      }
    }
    return 'LOW';
  }

  // 获取演练结果列表
  async getDrillResults(): Promise<RiskDrillResult[]> {
    await delay(400);
    return mockDrillResults;
  }

  // 获取单个演练结果详情
  async getDrillResultDetail(experimentId: string): Promise<RiskDrillResult | null> {
    await delay(300);
    return mockDrillResults.find(r => r.experimentId === experimentId) || null;
  }
}

export const riskDetectionService = new RiskDetectionService();
export default riskDetectionService;

