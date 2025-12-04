# 风险分析自动化演练场景配置说明

## 概述

风险分析功能在生成演练场景时，会**全自动化配置所有参数**，用户无需手动填写任何配置项。系统会根据风险点信息和推荐的故障类型，自动生成完整的演练场景配置。

## 自动化配置内容

### 1. 基础信息自动配置

```javascript
{
  experimentId: "exp-{uuid}",           // 自动生成UUID
  name: "用户输入的演练名称",            // 用户在生成弹窗中输入
  description: "用户输入的演练描述",     // 用户在生成弹窗中输入
  tags: [...用户输入, "risk-detection", "auto-generated"],  // 自动添加标签
  duration: 900,                        // 默认900秒（15分钟）
  runMode: "SEQUENCE",                  // 默认顺序执行
}
```

### 2. 流程组（FlowGroup）自动配置

每个选中的故障类型会自动生成一个流程组，包含：

#### 2.1 主机配置（Host）
```javascript
{
  deviceId: "从风险点获取",
  deviceName: "从风险点获取",
  ip: "10.0.0.1",                      // 默认IP
  clusterId: "default-cluster",         // 默认集群
  clusterName: "Default Cluster",
  scopeType: 2,                         // K8S类型
  k8s: true,
  // ... 其他30+个字段全部自动填充
}
```

#### 2.2 流程配置（Flow）
```javascript
{
  id: "{uuid}",
  flowId: null,                         // 新建时为null
  order: 0,
  required: true,
  prepare: [],                          // 准备阶段（空）
  attack: [攻击节点],                   // 故障注入节点
  check: [],                            // 检查阶段（空）
  recover: [],                          // 恢复阶段（空）
}
```

### 3. 攻击节点（Attack Node）自动配置

#### 3.1 节点基本信息
```javascript
{
  id: "{uuid}",
  name: "从故障类型获取",
  code: "chaosblade.k8s.pod-kill",
  functionId: "chaosblade.k8s.pod-kill",
  nodeType: 1,                          // 普通节点
  stage: "attack",
  // ... 其他20+个字段全部自动填充
}
```

#### 3.2 参数配置（Arguments）
每个参数都包含完整的IArgs结构：

```javascript
{
  name: "namespace",
  alias: "命名空间",                    // 自动翻译为中文
  value: "production",                  // 从故障推荐参数获取
  unit: "",
  description: "Kubernetes命名空间",    // 自动生成描述
  enabled: true,
  functionId: "chaosblade.k8s.pod-kill",
  parameterId: "param-{uuid}",
  component: {
    type: "input",                      // 根据值类型自动判断
    required: true,                     // 自动判断是否必填
    defaultValue: "production",
    cipherText: "",
    requestUrl: "",
    unit: "",
    linkage: null,
  }
}
```

## 支持的故障类型及参数

### Pod 终止（chaosblade.k8s.pod-kill）
```javascript
parameters: {
  namespace: "production",              // 命名空间
  names: "payment-service-.*",          // Pod名称（支持正则）
}
```

### CPU 压力（chaosblade.k8s.container-cpu）
```javascript
parameters: {
  namespace: "production",
  names: "payment-service-.*",
  "cpu-percent": 80,                    // CPU使用率（0-100）
  timeout: 60,                          // 持续时间（秒）
}
```

### 内存压力（chaosblade.k8s.container-memory）
```javascript
parameters: {
  namespace: "production",
  names: "payment-service-.*",
  "memory-percent": 80,                 // 内存使用率（0-100）
  timeout: 60,
}
```

### 网络延迟（chaosblade.k8s.network-delay）
```javascript
parameters: {
  namespace: "production",
  names: "payment-service-.*",
  "destination-ip": "10.0.0.0/8",       // 目标IP段
  time: 3000,                           // 延迟时间（毫秒）
  offset: 500,                          // 抖动范围（毫秒）
  timeout: 120,
}
```

### 网络丢包（chaosblade.k8s.network-loss）
```javascript
parameters: {
  namespace: "production",
  names: "payment-service-.*",
  "destination-ip": "10.0.0.0/8",
  percent: 30,                          // 丢包率（0-100）
  timeout: 120,
}
```

## 参数自动翻译

系统会自动将英文参数名翻译为中文别名：

| 英文参数 | 中文别名 | 说明 |
|---------|---------|------|
| namespace | 命名空间 | Kubernetes命名空间 |
| names | Pod名称 | 支持正则表达式 |
| cpu-percent | CPU使用率 | 0-100 |
| memory-percent | 内存使用率 | 0-100 |
| timeout | 持续时间 | 秒 |
| time | 延迟时间 | 毫秒 |
| offset | 抖动范围 | 毫秒 |
| destination-ip | 目标IP | CIDR格式 |
| percent | 丢包率 | 0-100 |

## 使用流程

1. **风险分析** → 点击"风险分析"按钮
2. **选择风险点** → 勾选需要验证的风险点
3. **选择故障类型** → 为每个风险点选择推荐的故障类型
4. **生成场景** → 点击"生成演练场景"
5. **填写基本信息** → 仅需填写演练名称和描述
6. **确认生成** → 系统自动配置所有参数
7. **跳转编辑器** → 自动跳转到演练编辑器，可查看和微调配置
8. **保存执行** → 保存后即可执行演练

## 优势

✅ **零配置** - 用户无需了解故障注入参数细节
✅ **智能推荐** - 根据风险类型自动推荐合适的故障和参数
✅ **参数完整** - 自动填充所有必填和可选参数
✅ **即开即用** - 生成后可直接保存执行
✅ **可微调** - 在编辑器中可根据需要调整参数

