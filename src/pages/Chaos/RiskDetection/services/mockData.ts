// Mock 数据 - 风险探测模块 - K8s 资源拓扑

import { RiskPoint, RiskTopologyNode, RiskTopologyEdge, RiskSummary, K8sResourceType, K8sRelationType } from '../types';
import { RiskDrillResult } from '../types/experimentTypes';

// Mock K8s 资源拓扑节点数据
export const mockTopologyNodes: RiskTopologyNode[] = [
  // Namespace
  {
    id: 'ns-production',
    name: 'production',
    type: 'NAMESPACE',
    namespace: 'production',
    status: 'healthy',
    riskCount: 0,
    hasRiskConfig: false,
    risks: [],
    position: { x: 400, y: 50 },
    labels: { 'app.kubernetes.io/managed-by': 'helm' },
  },
  // Deployment
  {
    id: 'deploy-payment-api',
    name: 'payment-api',
    type: 'DEPLOYMENT',
    namespace: 'production',
    status: 'healthy',
    riskCount: 2,
    hasRiskConfig: true,
    risks: [],
    position: { x: 200, y: 150 },
    metadata: { replicas: 3, readyReplicas: 3 },
    labels: { app: 'payment-api', version: 'v1.2.0' },
  },
  // ReplicaSet
  {
    id: 'rs-payment-api-7d8f9',
    name: 'payment-api-7d8f9',
    type: 'REPLICASET',
    namespace: 'production',
    status: 'healthy',
    riskCount: 1,
    hasRiskConfig: false,
    risks: [],
    position: { x: 200, y: 280 },
    metadata: { replicas: 3, readyReplicas: 3 },
  },
  // Pod 1
  {
    id: 'pod-payment-api-7d8f9-abc12',
    name: 'payment-api-7d8f9-abc12',
    type: 'POD',
    namespace: 'production',
    status: 'healthy',
    riskCount: 0,
    hasRiskConfig: false,
    risks: [],
    position: { x: 80, y: 420 },
    metadata: { podIP: '10.0.1.15', hostIP: '192.168.1.10', phase: 'Running' },
    labels: { app: 'payment-api', 'pod-template-hash': '7d8f9' },
  },
  // Pod 2
  {
    id: 'pod-payment-api-7d8f9-def34',
    name: 'payment-api-7d8f9-def34',
    type: 'POD',
    namespace: 'production',
    status: 'warning',
    riskCount: 1,
    hasRiskConfig: true,
    risks: [],
    position: { x: 200, y: 420 },
    metadata: { podIP: '10.0.1.16', hostIP: '192.168.1.11', phase: 'Running' },
    labels: { app: 'payment-api', 'pod-template-hash': '7d8f9' },
  },
  // Pod 3
  {
    id: 'pod-payment-api-7d8f9-ghi56',
    name: 'payment-api-7d8f9-ghi56',
    type: 'POD',
    namespace: 'production',
    status: 'error',
    riskCount: 2,
    hasRiskConfig: true,
    risks: [],
    position: { x: 320, y: 420 },
    metadata: { podIP: '10.0.1.17', hostIP: '192.168.1.12', phase: 'CrashLoopBackOff' },
    labels: { app: 'payment-api', 'pod-template-hash': '7d8f9' },
  },
  // Service
  {
    id: 'svc-payment-api',
    name: 'payment-api',
    type: 'SERVICE',
    namespace: 'production',
    status: 'healthy',
    riskCount: 1,
    hasRiskConfig: true,
    risks: [],
    position: { x: 500, y: 280 },
    metadata: { clusterIP: '10.96.0.100', ports: [{ port: 80, targetPort: 8080, protocol: 'TCP' }] },
    labels: { app: 'payment-api' },
  },
  // ConfigMap
  {
    id: 'cm-payment-config',
    name: 'payment-config',
    type: 'CONFIGMAP',
    namespace: 'production',
    status: 'healthy',
    riskCount: 0,
    hasRiskConfig: false,
    risks: [],
    position: { x: 600, y: 150 },
    labels: { app: 'payment-api', type: 'config' },
  },
  // Secret
  {
    id: 'secret-payment-db-creds',
    name: 'payment-db-credentials',
    type: 'SECRET',
    namespace: 'production',
    status: 'healthy',
    riskCount: 1,
    hasRiskConfig: false,
    risks: [],
    position: { x: 700, y: 280 },
    labels: { app: 'payment-api', type: 'credentials' },
  },
  // PVC
  {
    id: 'pvc-payment-data',
    name: 'payment-data',
    type: 'PVC',
    namespace: 'production',
    status: 'healthy',
    riskCount: 0,
    hasRiskConfig: false,
    risks: [],
    position: { x: 600, y: 420 },
    metadata: { storageClass: 'standard', capacity: '10Gi' },
    labels: { app: 'payment-api' },
  },
];

// Mock K8s 资源关系边数据
export const mockTopologyEdges: RiskTopologyEdge[] = [
  // Namespace contains Deployment
  { id: 'e1', source: 'ns-production', target: 'deploy-payment-api', type: 'contains', label: '包含' },
  // Deployment manages ReplicaSet
  { id: 'e2', source: 'deploy-payment-api', target: 'rs-payment-api-7d8f9', type: 'manages', label: '管理' },
  // ReplicaSet creates Pods
  { id: 'e3', source: 'rs-payment-api-7d8f9', target: 'pod-payment-api-7d8f9-abc12', type: 'creates', label: '创建' },
  { id: 'e4', source: 'rs-payment-api-7d8f9', target: 'pod-payment-api-7d8f9-def34', type: 'creates', label: '创建' },
  { id: 'e5', source: 'rs-payment-api-7d8f9', target: 'pod-payment-api-7d8f9-ghi56', type: 'creates', label: '创建' },
  // Service selects Pods
  { id: 'e6', source: 'svc-payment-api', target: 'pod-payment-api-7d8f9-abc12', type: 'selects', label: '选择' },
  { id: 'e7', source: 'svc-payment-api', target: 'pod-payment-api-7d8f9-def34', type: 'selects', label: '选择' },
  { id: 'e8', source: 'svc-payment-api', target: 'pod-payment-api-7d8f9-ghi56', type: 'selects', label: '选择' },
  // Pod mounts ConfigMap
  { id: 'e9', source: 'pod-payment-api-7d8f9-abc12', target: 'cm-payment-config', type: 'mounts', label: '挂载' },
  { id: 'e10', source: 'pod-payment-api-7d8f9-def34', target: 'cm-payment-config', type: 'mounts', label: '挂载' },
  // Pod mounts Secret
  { id: 'e11', source: 'pod-payment-api-7d8f9-abc12', target: 'secret-payment-db-creds', type: 'mounts', label: '挂载' },
  // Pod claims PVC
  { id: 'e12', source: 'pod-payment-api-7d8f9-ghi56', target: 'pvc-payment-data', type: 'claims', label: '声明' },
];

// Mock 风险点数据
export const mockRiskPoints: RiskPoint[] = [
  {
    id: 'risk-001',
    name: '支付服务单点故障',
    description: '支付服务仅有单个实例运行，存在单点故障风险',
    category: 'SINGLE_POINT_FAILURE',
    severity: 'CRITICAL',
    targetService: 'Payment Service',
    targetServiceId: 'payment-service',
    affectedServices: ['Order Service', 'API Gateway'],
    detectedAt: Date.now() - 86400000,
    status: 'DETECTED',
    recommendedFaults: [
      {
        faultType: 'POD_KILL',
        faultCode: 'chaosblade.k8s.pod-kill',
        faultName: 'Pod 终止',
        description: '终止支付服务 Pod，验证服务自动恢复能力和高可用性',
        priority: 1,
        parameters: {
          namespace: 'production',
          names: 'payment-service-.*',  // 支持正则匹配
          // labels: { app: 'payment-service' },  // 标签选择器（可选）
        },
      },
      {
        faultType: 'CPU_STRESS',
        faultCode: 'chaosblade.k8s.container-cpu',
        faultName: 'CPU 压力',
        description: '对支付服务容器施加 CPU 压力，验证资源限制和性能表现',
        priority: 2,
        parameters: {
          namespace: 'production',
          names: 'payment-service-.*',
          'cpu-percent': 80,  // CPU使用率百分比
          timeout: 60,  // 持续时间（秒）
        },
      },
      {
        faultType: 'MEMORY_STRESS',
        faultCode: 'chaosblade.k8s.container-memory',
        faultName: '内存压力',
        description: '对支付服务容器施加内存压力，验证OOM处理',
        priority: 3,
        parameters: {
          namespace: 'production',
          names: 'payment-service-.*',
          'memory-percent': 80,  // 内存使用率百分比
          timeout: 60,
        },
      },
    ],
    analysis: {
      impactScope: '全局',
      impactDescription: '支付服务不可用将导致所有订单无法完成支付',
      rootCause: '服务副本数设置为1，缺乏高可用配置',
      recommendations: ['增加服务副本数至少为2', '配置 PodDisruptionBudget', '添加健康检查'],
      mitigationSteps: ['扩容支付服务实例', '配置自动扩缩容策略', '添加服务熔断机制'],
    },
  },
  {
    id: 'risk-002',
    name: '数据库连接池耗尽',
    description: 'MySQL 数据库连接池配置过小，高并发下可能耗尽',
    category: 'RESOURCE_RISK',
    severity: 'HIGH',
    targetService: 'MySQL Database',
    targetServiceId: 'mysql-db',
    affectedServices: ['User Service', 'Order Service', 'Payment Service', 'Inventory Service'],
    detectedAt: Date.now() - 172800000,
    status: 'DETECTED',
    recommendedFaults: [
      {
        faultType: 'DB_CONNECTION_LIMIT',
        faultCode: 'chaosblade.mysql.connection-limit',
        faultName: '数据库连接限制',
        description: '限制MySQL数据库连接数，模拟连接池耗尽场景',
        priority: 1,
        parameters: {
          namespace: 'production',
          names: 'mysql-.*',
          'max-connections': 5,  // 最大连接数
          timeout: 120,  // 持续时间（秒）
        },
      },
      {
        faultType: 'DB_DELAY',
        faultCode: 'chaosblade.mysql.delay',
        faultName: '数据库延迟',
        description: '注入数据库查询延迟，验证超时处理',
        priority: 2,
        parameters: {
          namespace: 'production',
          names: 'mysql-.*',
          delay: 3000,  // 延迟时间（毫秒）
          timeout: 120,
        },
      },
    ],
    analysis: {
      impactScope: '多服务',
      impactDescription: '连接池耗尽将导致所有依赖数据库的服务请求失败',
      rootCause: '连接池最大连接数设置为50，不足以支撑高峰期流量',
      recommendations: ['增加连接池大小至200', '配置连接超时', '实现连接池监控告警'],
      mitigationSteps: ['临时增加连接池配置', '优化慢查询减少连接占用', '添加读写分离'],
    },
  },
  {
    id: 'risk-003',
    name: '用户服务缓存失效风险',
    description: 'Redis 缓存未配置持久化，重启后数据丢失导致缓存穿透',
    category: 'DATA_RISK',
    severity: 'MEDIUM',
    targetService: 'Redis Cache',
    targetServiceId: 'redis-cache',
    affectedServices: ['User Service', 'Inventory Service'],
    detectedAt: Date.now() - 259200000,
    status: 'DETECTED',
    recommendedFaults: [
      {
        faultType: 'CACHE_CLEAR',
        faultCode: 'chaosblade.redis.flushdb',
        faultName: '缓存清空',
        description: '清空Redis缓存数据库，验证缓存穿透和缓存重建机制',
        priority: 1,
        parameters: {
          namespace: 'production',
          names: 'redis-.*',
          database: 0,  // Redis数据库编号
        },
      },
      {
        faultType: 'CACHE_DELAY',
        faultCode: 'chaosblade.redis.delay',
        faultName: '缓存延迟',
        description: '注入Redis操作延迟，验证缓存超时处理',
        priority: 2,
        parameters: {
          namespace: 'production',
          names: 'redis-.*',
          delay: 2000,  // 延迟时间（毫秒）
          timeout: 60,
        },
      },
    ],
    analysis: {
      impactScope: '部分服务',
      impactDescription: '缓存失效会导致大量请求直接打到数据库',
      rootCause: 'Redis 未配置 AOF 或 RDB 持久化',
      recommendations: ['配置 Redis AOF 持久化', '实现缓存预热机制', '添加本地二级缓存'],
      mitigationSteps: ['配置 Redis 持久化', '实现缓存降级策略', '添加数据库限流保护'],
    },
  },
  {
    id: 'risk-004',
    name: '服务间网络延迟风险',
    description: 'Order Service 与 Payment Service 之间网络延迟超时设置不合理',
    category: 'NETWORK_RISK',
    severity: 'MEDIUM',
    targetService: 'Order Service',
    targetServiceId: 'order-service',
    affectedServices: ['Payment Service', 'API Gateway'],
    detectedAt: Date.now() - 345600000,
    status: 'DETECTED',
    recommendedFaults: [
      {
        faultType: 'NETWORK_DELAY',
        faultCode: 'chaosblade.k8s.network-delay',
        faultName: '网络延迟',
        description: '注入Pod网络延迟，验证服务超时和重试机制',
        priority: 1,
        parameters: {
          namespace: 'production',
          names: 'payment-service-.*',
          'destination-ip': '10.0.0.0/8',  // 目标IP段
          time: 3000,  // 延迟时间（毫秒）
          offset: 500,  // 抖动范围（毫秒）
          timeout: 120,
        },
      },
      {
        faultType: 'NETWORK_LOSS',
        faultCode: 'chaosblade.k8s.network-loss',
        faultName: '网络丢包',
        description: '模拟Pod网络丢包，验证网络容错和重试策略',
        priority: 2,
        parameters: {
          namespace: 'production',
          names: 'payment-service-.*',
          'destination-ip': '10.0.0.0/8',
          percent: 30,  // 丢包率（百分比）
          timeout: 120,
        },
      },
      {
        faultType: 'NETWORK_PARTITION',
        faultCode: 'chaosblade.k8s.network-partition',
        faultName: '网络分区',
        description: '模拟网络分区，验证服务隔离处理',
        priority: 3,
        parameters: {
          namespace: 'production',
          names: 'payment-service-.*',
          'destination-ip': '10.0.1.0/24',  // 隔离的目标IP段
          timeout: 60,
        },
      },
    ],
    analysis: {
      impactScope: '订单流程',
      impactDescription: '网络延迟可能导致订单支付超时失败',
      rootCause: '服务间调用超时设置为30秒，过长导致资源占用',
      recommendations: ['调整超时时间为5秒', '配置重试策略', '实现熔断降级'],
      mitigationSteps: ['配置合理的超时时间', '添加异步支付确认', '实现订单状态补偿'],
    },
  },
  {
    id: 'risk-005',
    name: 'API 网关容量风险',
    description: 'API Gateway 未配置限流，大流量下可能被压垮',
    category: 'CAPACITY_RISK',
    severity: 'HIGH',
    targetService: 'API Gateway',
    targetServiceId: 'gateway-service',
    affectedServices: ['User Service', 'Order Service'],
    detectedAt: Date.now() - 432000000,
    status: 'DETECTED',
    recommendedFaults: [
      {
        faultType: 'HTTP_FLOOD',
        faultCode: 'chaosblade.http.flood',
        faultName: 'HTTP 压力测试',
        description: '对API网关进行高并发请求测试，验证限流和熔断机制',
        priority: 1,
        parameters: {
          namespace: 'production',
          names: 'api-gateway-.*',
          url: 'http://api-gateway/api/v1',  // 目标URL
          qps: 10000,  // 每秒请求数
          timeout: 60,
        },
      },
      {
        faultType: 'POD_KILL',
        faultCode: 'chaosblade.k8s.pod-kill',
        faultName: 'Pod 终止',
        description: '终止网关Pod，验证负载均衡和故障转移',
        priority: 2,
        parameters: {
          namespace: 'production',
          names: 'api-gateway-.*',
        },
      },
    ],
    analysis: {
      impactScope: '全局',
      impactDescription: '网关崩溃将导致所有服务不可访问',
      rootCause: '未配置请求限流和熔断保护',
      recommendations: ['配置请求限流', '添加熔断器', '部署多实例负载均衡'],
      mitigationSteps: ['紧急配置限流规则', '扩容网关实例', '优化后端服务响应时间'],
    },
  },
];

// Mock 风险汇总
export const mockRiskSummary: RiskSummary = {
  totalRisks: 5,
  bySeverity: {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 2,
    LOW: 0,
  },
  byCategory: {
    SINGLE_POINT_FAILURE: 1,
    DEPENDENCY_RISK: 0,
    RESOURCE_RISK: 1,
    NETWORK_RISK: 1,
    DATA_RISK: 1,
    CAPACITY_RISK: 1,
  },
  criticalServices: ['Payment Service', 'API Gateway'],
};

// Mock 演练结果数据
export const mockDrillResults: RiskDrillResult[] = [
  {
    experimentId: 'exp-risk-001',
    experimentName: '支付服务单点故障验证演练',
    taskId: 'task-001',
    status: 'SUCCESS',
    startTime: Date.now() - 7200000,
    endTime: Date.now() - 3600000,
    duration: 300,
    summary: '本次演练验证了支付服务的单点故障风险。通过终止唯一的支付服务Pod，发现系统在故障期间完全无法处理支付请求，验证了该风险点的严重性。建议立即增加服务副本数并配置PodDisruptionBudget。',
    executionTime: new Date(Date.now() - 7200000).toISOString(),
    riskPointNames: ['支付服务单点故障'],
    validation: {
      overallStatus: 'FAILED',
      totalCount: 3,
      passedCount: 1,
      results: [
        {
          checkName: '服务可用性检查',
          description: '验证支付服务在故障期间是否保持可用',
          status: 'FAILED',
          expectedValue: '99%',
          actualValue: '0%',
        },
        {
          checkName: '故障转移检查',
          description: '验证是否有备用实例接管流量',
          status: 'FAILED',
          expectedValue: '有备用实例',
          actualValue: '无备用实例',
        },
        {
          checkName: '告警触发检查',
          description: '验证监控系统是否正确触发告警',
          status: 'PASSED',
          expectedValue: '触发告警',
          actualValue: '已触发告警',
        },
      ],
    },
    impact: {
      overallImpact: 'CRITICAL',
      affectedServices: ['Order Service', 'API Gateway', 'User Service'],
      description: '支付服务完全不可用导致所有依赖该服务的业务流程中断，包括订单支付、余额查询等功能。系统在故障期间无法处理任何支付相关请求。',
      recoveryTime: '5分钟',
      errorRate: '100%',
      responseTimeIncrease: 'N/A',
      metrics: [
        { name: '订单成功率', before: '99.9%', after: '0%' },
        { name: '支付延迟', before: '200ms', after: '超时' },
        { name: 'API错误率', before: '0.1%', after: '100%' },
      ],
    },
    recommendations: [
      {
        title: '增加服务副本数',
        description: '将支付服务副本数从1增加到至少3个，确保高可用性',
        priority: 'HIGH',
        actionItems: [
          '修改 Deployment 配置，设置 replicas: 3',
          '配置 HPA 自动扩缩容策略',
          '验证负载均衡配置',
          '进行滚动更新测试',
        ],
      },
      {
        title: '配置 PodDisruptionBudget',
        description: '确保在维护期间至少有一个Pod保持可用',
        priority: 'HIGH',
        actionItems: [
          '创建 PDB 资源文件',
          '配置 minAvailable: 1',
          '测试滚动更新场景',
        ],
      },
      {
        title: '实现服务降级策略',
        description: '在支付服务不可用时提供降级方案',
        priority: 'MEDIUM',
        actionItems: [
          '设计异步支付确认机制',
          '实现订单状态补偿逻辑',
          '添加友好的错误提示',
        ],
      },
    ],
    riskValidationResults: [
      {
        riskPointId: 'risk-001',
        riskName: '支付服务单点故障',
        verified: true,
        impactAnalysis: {
          impactLevel: 'CRITICAL',
          affectedServices: ['Order Service', 'API Gateway'],
          degradedMetrics: [
            { metricName: '订单成功率', baselineValue: 99.9, faultValue: 0, degradationPercent: 100 },
            { metricName: '支付延迟', baselineValue: 200, faultValue: 30000, degradationPercent: 14900 },
          ],
          userImpact: '所有用户无法完成支付，影响用户约5000人/分钟',
          businessImpact: '预估每分钟损失约￥50,000',
        },
        recommendations: [
          {
            priority: 1,
            category: 'ARCHITECTURE',
            title: '增加服务副本数',
            description: '将支付服务副本数从1增加到至少3个',
            implementationSteps: ['修改 Deployment 配置', '配置 HPA 自动扩缩容', '验证负载均衡'],
            estimatedTime: '2小时',
            expectedBenefit: '服务可用性从 99% 提升到 99.99%',
          },
          {
            priority: 2,
            category: 'CONFIG',
            title: '配置 PodDisruptionBudget',
            description: '确保至少有一个 Pod 始终可用',
            implementationSteps: ['创建 PDB 资源', '配置 minAvailable: 1', '测试滚动更新'],
            estimatedTime: '30分钟',
            expectedBenefit: '避免维护期间服务完全中断',
          },
        ],
      },
    ],
  },
  {
    experimentId: 'exp-risk-002',
    experimentName: '数据库连接池耗尽验证演练',
    taskId: 'task-002',
    status: 'SUCCESS',
    startTime: Date.now() - 86400000,
    endTime: Date.now() - 82800000,
    duration: 300,
    summary: '本次演练验证了数据库连接池配置不当的风险。通过模拟高并发场景，发现连接池在压力下快速耗尽，导致新请求无法获取数据库连接。建议优化连接池配置并实现连接泄漏检测。',
    executionTime: new Date(Date.now() - 86400000).toISOString(),
    riskPointNames: ['数据库连接池耗尽'],
    validation: {
      overallStatus: 'PARTIAL',
      totalCount: 4,
      passedCount: 2,
      results: [
        {
          checkName: '连接池监控检查',
          description: '验证连接池使用率监控是否正常',
          status: 'PASSED',
          expectedValue: '监控正常',
          actualValue: '监控正常',
        },
        {
          checkName: '连接泄漏检测',
          description: '验证是否能检测到连接泄漏',
          status: 'FAILED',
          expectedValue: '能检测',
          actualValue: '无检测机制',
        },
        {
          checkName: '降级策略检查',
          description: '验证连接池耗尽时的降级策略',
          status: 'FAILED',
          expectedValue: '有降级策略',
          actualValue: '无降级策略',
        },
        {
          checkName: '告警触发检查',
          description: '验证连接池告警是否触发',
          status: 'PASSED',
          expectedValue: '触发告警',
          actualValue: '已触发告警',
        },
      ],
    },
    impact: {
      overallImpact: 'HIGH',
      affectedServices: ['Order Service', 'User Service'],
      description: '数据库连接池耗尽导致新请求无法获取连接，系统响应时间显著增加，部分请求超时失败。',
      recoveryTime: '3分钟',
      errorRate: '45%',
      responseTimeIncrease: '+350%',
      metrics: [
        { name: '数据库连接使用率', before: '60%', after: '100%' },
        { name: '请求响应时间', before: '150ms', after: '675ms' },
        { name: '请求成功率', before: '99.5%', after: '55%' },
      ],
    },
    recommendations: [
      {
        title: '优化连接池配置',
        description: '增加连接池大小并优化超时配置',
        priority: 'HIGH',
        actionItems: [
          '将最大连接数从50增加到200',
          '配置合理的连接超时时间',
          '启用连接池预热机制',
        ],
      },
      {
        title: '实现连接泄漏检测',
        description: '添加连接泄漏检测和自动回收机制',
        priority: 'HIGH',
        actionItems: [
          '配置连接泄漏检测阈值',
          '实现自动回收机制',
          '添加连接使用追踪日志',
        ],
      },
    ],
    riskValidationResults: [],
  },
];

