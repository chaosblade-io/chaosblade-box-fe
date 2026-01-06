# 故障模版完整指南

## 文档概述

本文档详细说明风险分析模块中故障模版的定义、数据结构、参数配置，以及Kubernetes和主机场景下的差异。

---

## 一、核心问题解答

### 1.1 演练场景数据格式规范

#### IExperiment 完整结构

基于 `src/config/interfaces/Chaos/experiment.ts` 的定义：

```typescript
interface IExperiment {
  // 顶层标识
  id: string;
  experimentId: string;

  // 基础信息
  baseInfo: IBaseInfo;

  // 流程配置
  flow: IFlowInfo;

  // 观察和恢复节点
  observerNodes: INode[];
  recoverNodes: INode[];

  // 可选字段（兼容性）
  flowInfo?: IFlowInfo;      // 与flow相同
  basicInfo?: IBaseInfo;     // 与baseInfo相同
  definition?: IFlowInfo;    // 与flow相同
  workspaceId?: string;
  permission?: number;
}
```

#### IBaseInfo 结构（必填项）

```typescript
interface IBaseInfo {
  experimentId: string;      // 必填
  name: string;              // 必填 - 演练名称
  description: string;       // 必填 - 演练描述
  tags: [];                  // 必填 - 标签数组
  miniAppDesc: [];           // 必填 - 小程序描述
  workspaces: [];            // 必填 - 工作空间
  relations: [];             // 必填 - 关联关系

  // 可选字段
  gmtCreate?: string;
  gmtModified?: string;
  state?: string;
}
```

#### IFlowInfo 结构（必填项）

```typescript
interface IFlowInfo {
  experimentId: string;      // 必填
  runMode: string;           // 必填 - "SEQUENCE" 或 "PARALLEL"
  state: string;             // 必填 - "DRAFT", "READY", "RUNNING"
  duration: number;          // 必填 - 自动恢复时间（秒）
  schedulerConfig: {         // 必填
    cronExpression: string;  // 定时表达式，空字符串表示不定时
  };
  flowGroups: IFlowGroup[];  // 必填 - 流程组数组
  guardConf: {               // 必填
    guards: any[];           // 恢复策略数组
  };
}
```

#### IFlowGroup 结构（30+字段）

```typescript
interface IFlowGroup {
  // 核心标识
  id?: string;
  groupId?: string | null;
  groupName?: string;

  // 主机配置
  hosts: IHost[];            // 必填 - 主机数组

  // 流程配置
  flows?: IFlow[];           // 流程数组

  // 应用配置
  appId?: string;
  appName?: string;
  appGroups?: any[];
  appType?: number | string;

  // 范围配置
  scopeType?: number | string;  // 0=主机, 2=K8S

  // 其他配置
  order?: number;
  required?: boolean;
  displayIndex?: number;
  selectType?: number | string;
  hostPercent?: number | string;
  experimentObj?: number;
  cloudServiceType?: string;
  cloudServiceName?: string;
  osType?: number;
}
```

#### IHost 结构（30+字段）

```typescript
interface IHost {
  // 核心标识（必填）
  deviceId: string;
  deviceName: string;
  ip: string;

  // 集群信息（必填）
  clusterId: string;
  clusterName: string;

  // 范围类型（必填）
  scopeType: number | string;  // 0=主机, 2=K8S
  k8s: boolean;                // true=K8S, false=主机

  // 设备配置（必填）
  deviceConfigurationId: string;
  deviceType: number;

  // 网络配置（必填）
  port: number;
  privateIp: string;
  targetIp: string;

  // 区域配置（必填）
  regionId: string;
  vpcId: string;

  // 权限配置（必填）
  allow: boolean;
  appScope: boolean;
  master: boolean;

  // 应用配置（可选）
  appId?: number | string;
  app?: string;
  appName?: string;
  appGroups?: any[];
  appType?: string | number;
  appConfigurationId?: string;

  // 其他配置（可选）
  nodeGroup?: string;
  label?: string;
  passed?: boolean;
  content?: string;
  invalid?: boolean;
  authMessage: string;
}
```

---

## 二、故障模版定义位置

### 2.1 前端现有定义

**位置**: `src/pages/Chaos/RiskDetection/services/mockData.ts`

**状态**: ✅ **已有完整定义**

前端在Mock数据中已经定义了完整的故障模版，包括：
- 故障码（faultCode）
- 故障名称（faultName）
- 故障描述（description）
- 参数配置（parameters）

**示例**:
```typescript
{
  faultType: 'POD_KILL',
  faultCode: 'chaosblade.k8s.pod-kill',
  faultName: 'Pod 终止',
  description: '终止支付服务 Pod，验证服务自动恢复能力和高可用性',
  priority: 1,
  parameters: {
    namespace: 'production',
    names: 'payment-service-.*',
  }
}
```

### 2.2 参数自动处理

**位置**: `src/pages/Chaos/RiskDetection/services/riskDetectionService.ts`

**功能**: 自动将故障参数转换为完整的IArgs结构

**核心方法**:
- `buildNodeArguments()` - 构建参数数组
- `getParameterAlias()` - 参数中文翻译（40+参数）
- `getParameterDescription()` - 参数描述生成
- `getComponentType()` - 组件类型判断
- `isParameterRequired()` - 必填项判断

---

## 三、Kubernetes vs 主机场景差异

### 3.1 核心差异对比

| 维度 | Kubernetes场景 | 主机场景 |
|------|---------------|---------|
| **scopeType** | `2` | `0` |
| **k8s** | `true` | `false` |
| **故障码前缀** | `chaosblade.k8s.*` | `chaosblade.*` |
| **目标选择** | namespace + names/labels | ip + port |
| **资源类型** | Pod, Container, Service | Process, CPU, Memory, Disk |

### 3.2 Kubernetes场景故障模版

#### 3.2.1 Pod故障

**Pod终止 (chaosblade.k8s.pod-kill)**
```typescript
{
  faultCode: 'chaosblade.k8s.pod-kill',
  faultName: 'Pod 终止',
  parameters: {
    namespace: 'production',        // 必填 - 命名空间
    names: 'payment-service-.*',    // 必填 - Pod名称（正则）
    // labels: { app: 'payment' },  // 可选 - 标签选择器
  }
}
```

**参数说明**:
- `namespace`: Kubernetes命名空间
- `names`: Pod名称，支持正则表达式匹配
- `labels`: Pod标签选择器（JSON格式），与names二选一

#### 3.2.2 容器资源故障

**容器CPU压力 (chaosblade.k8s.container-cpu)**
```typescript
{
  faultCode: 'chaosblade.k8s.container-cpu',
  faultName: 'CPU 压力',
  parameters: {
    namespace: 'production',        // 必填
    names: 'payment-service-.*',    // 必填
    'cpu-percent': 80,              // 必填 - CPU使用率（0-100）
    timeout: 60,                    // 必填 - 持续时间（秒）
    // 'container-names': 'app',    // 可选 - 容器名称
  }
}
```

**容器内存压力 (chaosblade.k8s.container-memory)**
```typescript
{
  faultCode: 'chaosblade.k8s.container-memory',
  faultName: '内存压力',
  parameters: {
    namespace: 'production',
    names: 'payment-service-.*',
    'memory-percent': 80,           // 必填 - 内存使用率（0-100）
    timeout: 60,
  }
}
```

#### 3.2.3 网络故障

**网络延迟 (chaosblade.k8s.network-delay)**
```typescript
{
  faultCode: 'chaosblade.k8s.network-delay',
  faultName: '网络延迟',
  parameters: {
    namespace: 'production',
    names: 'payment-service-.*',
    'destination-ip': '10.0.0.0/8', // 必填 - 目标IP段（CIDR）
    time: 3000,                     // 必填 - 延迟时间（毫秒）
    offset: 500,                    // 可选 - 抖动范围（毫秒）
    timeout: 120,
  }
}
```

**网络丢包 (chaosblade.k8s.network-loss)**
```typescript
{
  faultCode: 'chaosblade.k8s.network-loss',
  faultName: '网络丢包',
  parameters: {
    namespace: 'production',
    names: 'payment-service-.*',
    'destination-ip': '10.0.0.0/8',
    percent: 30,                    // 必填 - 丢包率（0-100）
    timeout: 120,
  }
}
```

**网络分区 (chaosblade.k8s.network-partition)**
```typescript
{
  faultCode: 'chaosblade.k8s.network-partition',
  faultName: '网络分区',
  parameters: {
    namespace: 'production',
    names: 'payment-service-.*',
    'destination-ip': '10.0.1.0/24', // 隔离的目标IP段
    timeout: 60,
  }
}
```

### 3.3 主机场景故障模版

#### 3.3.1 CPU故障

**CPU满载 (chaosblade.cpu.fullload)**
```typescript
{
  faultCode: 'chaosblade.cpu.fullload',
  faultName: 'CPU 满载',
  parameters: {
    'cpu-percent': 80,              // 必填 - CPU使用率（0-100）
    'cpu-count': 2,                 // 可选 - CPU核心数
    timeout: 60,                    // 必填 - 持续时间（秒）
  }
}
```

**关键差异**:
- ❌ 无 `namespace` 参数
- ❌ 无 `names` 参数
- ✅ 直接作用于主机的CPU资源
- ✅ 可指定CPU核心数

#### 3.3.2 内存故障

**内存占用 (chaosblade.mem.load)**
```typescript
{
  faultCode: 'chaosblade.mem.load',
  faultName: '内存占用',
  parameters: {
    'mem-percent': 80,              // 必填 - 内存使用率（0-100）
    // 或者
    'mem-size': 2048,               // 可选 - 内存大小（MB）
    timeout: 60,
    mode: 'ram',                    // 可选 - ram/cache/swap
  }
}
```

**关键差异**:
- ❌ 无 `namespace` 参数
- ✅ 支持按百分比或绝对值指定
- ✅ 支持不同内存类型（RAM/Cache/Swap）

#### 3.3.3 磁盘故障

**磁盘填充 (chaosblade.disk.fill)**
```typescript
{
  faultCode: 'chaosblade.disk.fill',
  faultName: '磁盘填充',
  parameters: {
    path: '/data',                  // 必填 - 目标路径
    size: 10240,                    // 必填 - 填充大小（MB）
    // 或者
    percent: 80,                    // 可选 - 填充百分比
    timeout: 120,
  }
}
```

**磁盘IO延迟 (chaosblade.disk.burn)**
```typescript
{
  faultCode: 'chaosblade.disk.burn',
  faultName: '磁盘IO压力',
  parameters: {
    path: '/data',
    'read-count': 100,              // 读操作数
    'write-count': 100,             // 写操作数
    'block-size': 1024,             // 块大小（KB）
    timeout: 60,
  }
}
```

#### 3.3.4 网络故障（主机）

**网络延迟 (chaosblade.network.delay)**
```typescript
{
  faultCode: 'chaosblade.network.delay',
  faultName: '网络延迟',
  parameters: {
    'destination-ip': '192.168.1.100', // 必填 - 目标IP
    // 或者
    'destination-port': 3306,       // 可选 - 目标端口
    time: 3000,                     // 必填 - 延迟时间（毫秒）
    offset: 500,                    // 可选 - 抖动范围
    timeout: 120,
    interface: 'eth0',              // 可选 - 网卡名称
  }
}
```

**网络丢包 (chaosblade.network.loss)**
```typescript
{
  faultCode: 'chaosblade.network.loss',
  faultName: '网络丢包',
  parameters: {
    'destination-ip': '192.168.1.100',
    percent: 30,                    // 必填 - 丢包率
    timeout: 120,
    interface: 'eth0',
  }
}
```

**关键差异**:
- ❌ 无 `namespace` 参数
- ✅ 使用具体IP地址而非IP段
- ✅ 可指定网卡接口
- ✅ 可指定目标端口

---

## 四、完整的INode结构（40+字段）

### 4.1 Attack节点完整示例

```typescript
{
  // 节点标识
  id: "node-uuid-xxx",
  name: "Pod 终止",
  code: "chaosblade.k8s.pod-kill",
  functionId: "chaosblade.k8s.pod-kill",
  appCode: "chaosblade.k8s.pod-kill",
  app_code: "chaosblade.k8s.pod-kill",

  // 节点类型
  nodeType: 1,                      // 1=普通节点, 2=观察节点, 3=恢复节点
  stage: "attack",                  // prepare/attack/check/recover
  actionType: undefined,
  phase: undefined,

  // 参数配置（核心）
  arguments: [...],                 // IArgs数组
  args: [...],                      // 与arguments相同

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
  hostPercent: 100,                 // 主机执行百分比
  failedTolerance: 0,               // 失败容忍度
  interruptedIfFailed: true,        // 失败时是否中断

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
  activityId: "",
  activityName: "",
  guardId: "",
  parentName: "",
  miniAppName: "",
  state: "",
  runResult: "",
  userCheckState: "",
  groupOrder: 0,
  hosts: [],
}
```

### 4.2 IArgs完整结构（参数配置）

```typescript
{
  // 参数基本信息
  name: "namespace",
  alias: "命名空间",                // 中文别名
  value: "production",              // 参数值
  unit: "",                         // 单位
  description: "Kubernetes命名空间", // 描述

  // 参数配置
  enabled: true,
  functionId: "chaosblade.k8s.pod-kill",
  parameterId: "param-uuid-xxx",

  // 组件配置（IComponent）
  component: {
    type: "input",                  // input/number/select/switch/json
    required: true,                 // 是否必填
    defaultValue: "production",     // 默认值
    cipherText: "",                 // 加密文本
    requestUrl: "",                 // 远程数据URL
    unit: "",                       // 单位
    linkage: null,                  // 联动配置
    opLevel: undefined,             // 操作级别
    constraint: undefined,          // 约束条件
    options: undefined,             // 选项列表（select类型）
  },

  // 可选字段
  errorMessage: "",
  type: "string",                   // 值类型
}
```

### 4.3 Component类型说明

| Type | 说明 | 适用场景 | 示例参数 |
|------|------|---------|---------|
| `input` | 文本输入框 | 字符串参数 | namespace, names |
| `number` | 数字输入框 | 数值参数 | cpu-percent, timeout |
| `select` | 下拉选择框 | 枚举参数 | mode, interface |
| `switch` | 开关 | 布尔参数 | enabled, debug |
| `json` | JSON编辑器 | 对象参数 | labels, headers |
| `password` | 密码输入框 | 敏感参数 | token, secret |
| `time` | 时间选择器 | 时间参数 | startTime |
| `date` | 日期选择器 | 日期参数 | scheduleDate |

---

## 五、完整Mock流程示例

### 5.1 Kubernetes场景完整示例

```typescript
// 完整的IExperiment数据结构
const kubernetesExperiment: IExperiment = {
  id: "exp-k8s-001",
  experimentId: "exp-k8s-001",

  // 基础信息
  baseInfo: {
    experimentId: "exp-k8s-001",
    name: "支付服务高可用性验证演练",
    description: "验证支付服务Pod故障时的自动恢复能力和系统容错性",
    tags: ["payment", "high-availability", "critical", "risk-detection"],
    miniAppDesc: [],
    workspaces: [],
    relations: [],
  },

  // 流程配置
  flow: {
    experimentId: "exp-k8s-001",
    runMode: "SEQUENCE",
    state: "DRAFT",
    duration: 900,
    schedulerConfig: {
      cronExpression: "",
    },
    flowGroups: [
      {
        id: "group-uuid-001",
        groupId: null,
        groupName: "payment-service",

        // 主机配置（K8S）
        hosts: [
          {
            deviceId: "deploy-payment-api",
            deviceName: "payment-api",
            ip: "10.0.1.100",
            clusterId: "cluster-prod-001",
            clusterName: "production-cluster",
            scopeType: 2,                    // K8S
            k8s: true,
            deviceConfigurationId: "config-001",
            deviceType: 1,
            port: 8080,
            privateIp: "10.0.1.100",
            targetIp: "10.0.1.100",
            regionId: "cn-hangzhou",
            vpcId: "vpc-001",
            allow: true,
            appScope: true,
            master: false,
            appId: "payment-service",
            appName: "Payment Service",
            appType: 1,
            authMessage: "",
          }
        ],

        // 流程配置
        flows: [
          {
            id: "flow-uuid-001",
            flowId: null,
            order: 0,
            required: true,
            prepare: [],
            attack: [
              {
                id: "node-uuid-001",
                name: "Pod 终止",
                code: "chaosblade.k8s.pod-kill",
                functionId: "chaosblade.k8s.pod-kill",
                appCode: "chaosblade.k8s.pod-kill",
                app_code: "chaosblade.k8s.pod-kill",
                nodeType: 1,
                stage: "attack",

                // 参数配置
                arguments: [
                  {
                    name: "namespace",
                    alias: "命名空间",
                    value: "production",
                    unit: "",
                    description: "Kubernetes命名空间",
                    enabled: true,
                    functionId: "chaosblade.k8s.pod-kill",
                    parameterId: "param-namespace-001",
                    component: {
                      type: "input",
                      required: true,
                      defaultValue: "production",
                      cipherText: "",
                      requestUrl: "",
                      unit: "",
                      linkage: null,
                    },
                    type: "string",
                  },
                  {
                    name: "names",
                    alias: "Pod名称",
                    value: "payment-service-.*",
                    unit: "",
                    description: "Pod名称，支持正则表达式匹配",
                    enabled: true,
                    functionId: "chaosblade.k8s.pod-kill",
                    parameterId: "param-names-001",
                    component: {
                      type: "input",
                      required: true,
                      defaultValue: "payment-service-.*",
                      cipherText: "",
                      requestUrl: "",
                      unit: "",
                      linkage: null,
                    },
                    type: "string",
                  }
                ],
                args: [...],  // 与arguments相同

                // 执行配置
                order: 0,
                required: true,
                sync: true,
                user_check: false,
                flowId: null,
                pauses: { before: 0, after: 0 },
                hostPercent: 100,
                failedTolerance: 0,
                interruptedIfFailed: true,
                scope: [],
                tolerance: [],
                fields: [],
                displayFields: [],
                displayTolerance: [],
                deletable: true,
                argsValid: true,
                retryable: false,
                runResult: "",
              }
            ],
            check: [],
            recover: [],
          }
        ],

        // 应用配置
        scopeType: 2,
        appId: "payment-service",
        appName: "Payment Service",
        appType: 1,
        order: 0,
        required: true,
      }
    ],
    guardConf: {
      guards: [],
    },
  },

  // 观察和恢复节点
  observerNodes: [],
  recoverNodes: [],
};
```

### 5.2 主机场景完整示例

```typescript
const hostExperiment: IExperiment = {
  id: "exp-host-001",
  experimentId: "exp-host-001",

  baseInfo: {
    experimentId: "exp-host-001",
    name: "应用服务器CPU压力测试",
    description: "验证应用服务器在高CPU负载下的性能表现",
    tags: ["host", "cpu", "performance"],
    miniAppDesc: [],
    workspaces: [],
    relations: [],
  },

  flow: {
    experimentId: "exp-host-001",
    runMode: "SEQUENCE",
    state: "DRAFT",
    duration: 600,
    schedulerConfig: { cronExpression: "" },
    flowGroups: [
      {
        id: "group-uuid-002",
        groupId: null,
        groupName: "app-server-01",

        // 主机配置（Host）
        hosts: [
          {
            deviceId: "host-192-168-1-100",
            deviceName: "app-server-01",
            ip: "192.168.1.100",
            clusterId: "datacenter-01",
            clusterName: "Main Datacenter",
            scopeType: 0,                    // 主机
            k8s: false,
            deviceConfigurationId: "config-002",
            deviceType: 0,
            port: 22,
            privateIp: "192.168.1.100",
            targetIp: "192.168.1.100",
            regionId: "cn-beijing",
            vpcId: "vpc-002",
            allow: true,
            appScope: true,
            master: false,
            authMessage: "",
          }
        ],

        flows: [
          {
            id: "flow-uuid-002",
            flowId: null,
            order: 0,
            required: true,
            prepare: [],
            attack: [
              {
                id: "node-uuid-002",
                name: "CPU 满载",
                code: "chaosblade.cpu.fullload",
                functionId: "chaosblade.cpu.fullload",
                nodeType: 1,
                stage: "attack",

                arguments: [
                  {
                    name: "cpu-percent",
                    alias: "CPU使用率",
                    value: 80,
                    unit: "%",
                    description: "CPU压力百分比（0-100）",
                    enabled: true,
                    functionId: "chaosblade.cpu.fullload",
                    parameterId: "param-cpu-percent-001",
                    component: {
                      type: "number",
                      required: true,
                      defaultValue: 80,
                      cipherText: "",
                      requestUrl: "",
                      unit: "%",
                      linkage: null,
                      constraint: {
                        checkerTemplate: "range",
                        range: ["0", "100"],
                      },
                    },
                    type: "number",
                  },
                  {
                    name: "timeout",
                    alias: "持续时间",
                    value: 60,
                    unit: "秒",
                    description: "故障持续时间（秒）",
                    enabled: true,
                    functionId: "chaosblade.cpu.fullload",
                    parameterId: "param-timeout-001",
                    component: {
                      type: "number",
                      required: true,
                      defaultValue: 60,
                      cipherText: "",
                      requestUrl: "",
                      unit: "秒",
                      linkage: null,
                    },
                    type: "number",
                  }
                ],
                args: [...],

                order: 0,
                required: true,
                sync: true,
                user_check: false,
                flowId: null,
                pauses: { before: 0, after: 0 },
                hostPercent: 100,
                failedTolerance: 0,
                interruptedIfFailed: true,
                scope: [],
                tolerance: [],
                fields: [],
                deletable: true,
                argsValid: true,
                retryable: false,
                runResult: "",
              }
            ],
            check: [],
            recover: [],
          }
        ],

        scopeType: 0,                        // 主机
        appId: "app-server",
        appName: "Application Server",
        appType: 0,
        osType: 0,                           // Linux
        order: 0,
        required: true,
      }
    ],
    guardConf: { guards: [] },
  },

  observerNodes: [],
  recoverNodes: [],
};
```

---

## 六、使用建议

### 6.1 Mock数据使用

**当前实现**: ✅ 前端已有完整Mock数据

**位置**: `src/pages/Chaos/RiskDetection/services/mockData.ts`

**使用方式**:
```typescript
import { mockRiskPoints } from './mockData';

// 获取风险点及其推荐故障
const riskPoint = mockRiskPoints[0];
const recommendedFaults = riskPoint.recommendedFaults;

// 使用riskDetectionService自动生成完整的IExperiment
const experiment = await riskDetectionService.generateExperiment({
  riskPoints: [riskPoint],
  selectedFaults: recommendedFaults.map(fault => ({
    riskPointId: riskPoint.id,
    ...fault,
  })),
  experimentConfig: {
    name: "演练名称",
    description: "演练描述",
    duration: 900,
    autoRecover: true,
    tags: ["tag1"],
  },
});
```

### 6.2 后端API集成（未来）

**接口**: `GET /api/chaos/fault-types`

**响应格式**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "faultTypeId": 1,
        "faultCode": "chaosblade.k8s.pod-kill",
        "name": "Pod 终止",
        "description": "终止Pod验证自动恢复",
        "category": "POD",
        "enabled": true,
        "displayOrder": 1,
        "paramConfig": {
          "namespace": {
            "type": "string",
            "required": true,
            "defaultValue": "default",
            "description": "Kubernetes命名空间"
          },
          "names": {
            "type": "string",
            "required": true,
            "description": "Pod名称（支持正则）"
          }
        }
      }
    ]
  }
}
```

**集成方式**:
```typescript
// 从后端获取故障类型
const faultTypes = await probeProxy.getFaultTypes();

// 根据faultCode匹配参数配置
const faultType = faultTypes.data.items.find(
  ft => ft.faultCode === 'chaosblade.k8s.pod-kill'
);

// 使用paramConfig生成IArgs
const args = Object.entries(faultType.paramConfig).map(([name, config]) => ({
  name,
  alias: config.alias || name,
  value: config.defaultValue,
  component: {
    type: config.type === 'number' ? 'number' : 'input',
    required: config.required,
    defaultValue: config.defaultValue,
  },
  // ...
}));
```

---

## 七、故障类型汇总表

### 7.1 Kubernetes故障类型

| 故障码 | 故障名称 | 类别 | 核心参数 |
|--------|---------|------|---------|
| `chaosblade.k8s.pod-kill` | Pod终止 | Pod | namespace, names |
| `chaosblade.k8s.pod-failure` | Pod故障 | Pod | namespace, names |
| `chaosblade.k8s.container-cpu` | 容器CPU压力 | 资源 | namespace, names, cpu-percent, timeout |
| `chaosblade.k8s.container-memory` | 容器内存压力 | 资源 | namespace, names, memory-percent, timeout |
| `chaosblade.k8s.network-delay` | 网络延迟 | 网络 | namespace, names, destination-ip, time |
| `chaosblade.k8s.network-loss` | 网络丢包 | 网络 | namespace, names, destination-ip, percent |
| `chaosblade.k8s.network-partition` | 网络分区 | 网络 | namespace, names, destination-ip |
| `chaosblade.mysql.connection-limit` | 数据库连接限制 | 数据库 | namespace, names, max-connections |
| `chaosblade.mysql.delay` | 数据库延迟 | 数据库 | namespace, names, delay |
| `chaosblade.redis.flushdb` | 缓存清空 | 缓存 | namespace, names, database |
| `chaosblade.redis.delay` | 缓存延迟 | 缓存 | namespace, names, delay |
| `chaosblade.http.flood` | HTTP压力 | 应用 | namespace, names, url, qps |

### 7.2 主机故障类型

| 故障码 | 故障名称 | 类别 | 核心参数 |
|--------|---------|------|---------|
| `chaosblade.cpu.fullload` | CPU满载 | CPU | cpu-percent, timeout |
| `chaosblade.mem.load` | 内存占用 | 内存 | mem-percent/mem-size, timeout |
| `chaosblade.disk.fill` | 磁盘填充 | 磁盘 | path, size/percent, timeout |
| `chaosblade.disk.burn` | 磁盘IO压力 | 磁盘 | path, read-count, write-count |
| `chaosblade.network.delay` | 网络延迟 | 网络 | destination-ip, time, interface |
| `chaosblade.network.loss` | 网络丢包 | 网络 | destination-ip, percent, interface |
| `chaosblade.process.kill` | 进程终止 | 进程 | process-name/process-id |
| `chaosblade.process.stop` | 进程暂停 | 进程 | process-name/process-id, timeout |

---

## 八、参数翻译对照表

### 8.1 通用参数

| 英文参数 | 中文别名 | 说明 | 类型 | 必填 |
|---------|---------|------|------|------|
| `timeout` | 持续时间 | 故障持续时间（秒） | number | ✅ |
| `duration` | 持续时间 | 故障持续时间（秒） | number | ✅ |

### 8.2 Kubernetes参数

| 英文参数 | 中文别名 | 说明 | 类型 | 必填 |
|---------|---------|------|------|------|
| `namespace` | 命名空间 | Kubernetes命名空间 | string | ✅ |
| `names` | Pod名称 | Pod名称（支持正则） | string | ✅ |
| `labels` | 标签选择器 | Pod标签选择器（JSON） | json | ❌ |
| `container-names` | 容器名称 | 容器名称列表 | string | ❌ |

### 8.3 资源参数

| 英文参数 | 中文别名 | 说明 | 类型 | 必填 |
|---------|---------|------|------|------|
| `cpu-percent` | CPU使用率 | CPU压力百分比（0-100） | number | ✅ |
| `memory-percent` | 内存使用率 | 内存压力百分比（0-100） | number | ✅ |
| `mem-percent` | 内存使用率 | 内存压力百分比（0-100） | number | ✅ |
| `mem-size` | 内存大小 | 内存大小（MB） | number | ❌ |

### 8.4 网络参数

| 英文参数 | 中文别名 | 说明 | 类型 | 必填 |
|---------|---------|------|------|------|
| `destination-ip` | 目标IP | 目标IP地址或IP段（CIDR） | string | ✅ |
| `time` | 延迟时间 | 网络延迟时间（毫秒） | number | ✅ |
| `delay` | 延迟时间 | 延迟时间（毫秒） | number | ✅ |
| `offset` | 抖动范围 | 延迟抖动范围（毫秒） | number | ❌ |
| `percent` | 丢包率 | 网络丢包率（0-100） | number | ✅ |
| `interface` | 网卡接口 | 网卡名称（如eth0） | string | ❌ |

### 8.5 数据库参数

| 英文参数 | 中文别名 | 说明 | 类型 | 必填 |
|---------|---------|------|------|------|
| `max-connections` | 最大连接数 | 数据库最大连接数限制 | number | ✅ |
| `database` | 数据库编号 | Redis数据库编号（0-15） | number | ✅ |

### 8.6 HTTP参数

| 英文参数 | 中文别名 | 说明 | 类型 | 必填 |
|---------|---------|------|------|------|
| `url` | 目标URL | HTTP请求目标URL | string | ✅ |
| `qps` | 每秒请求数 | 每秒查询数（QPS） | number | ✅ |

---

## 九、总结

### 9.1 关键要点

1. **前端已有完整故障模版定义** ✅
   - 位置: `src/pages/Chaos/RiskDetection/services/mockData.ts`
   - 包含11种故障类型的完整参数配置

2. **自动化参数处理** ✅
   - 位置: `src/pages/Chaos/RiskDetection/services/riskDetectionService.ts`
   - 自动翻译、描述生成、类型判断、必填判断

3. **Kubernetes vs 主机差异** ✅
   - scopeType: 2 vs 0
   - k8s: true vs false
   - 参数差异: namespace/names vs ip/interface

4. **完整数据结构** ✅
   - IExperiment (6个核心字段)
   - IFlowGroup (30+字段)
   - IHost (30+字段)
   - INode (40+字段)
   - IArgs (完整component配置)

### 9.2 使用流程

```
1. 风险分析 → 识别风险点
2. 推荐故障 → 从mockData获取
3. 生成场景 → riskDetectionService.generateExperiment()
4. 自动填充 → 所有参数自动配置
5. 跳转编辑器 → dispatch到Redux store
6. 用户确认 → 可微调参数
7. 保存执行 → 完整的IExperiment数据
```

### 9.3 扩展建议

1. **新增故障类型**: 在mockData.ts中添加新的recommendedFaults
2. **新增参数翻译**: 在riskDetectionService.ts的getParameterAlias()中添加
3. **新增参数描述**: 在getParameterDescription()中添加
4. **后端集成**: 使用probeProxy.getFaultTypes()获取动态故障类型

---

**文档版本**: v1.0
**最后更新**: 2025-12-04
**维护者**: 风险分析模块开发团队