# 风险分析模块后端API接口规范

## 文档版本

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| v1.0 | 2025-12-04 | System | 初始版本 |

## 目录

- [1. 接口概述](#1-接口概述)
- [2. 通用规范](#2-通用规范)
- [3. 拓扑分析接口](#3-拓扑分析接口)
- [4. 风险检测接口](#4-风险检测接口)
- [5. 演练场景生成接口](#5-演练场景生成接口)
- [6. 演练执行接口](#6-演练执行接口)
- [7. 结果分析接口](#7-结果分析接口)
- [8. 数据结构定义](#8-数据结构定义)
- [9. 错误码定义](#9-错误码定义)

---

## 1. 接口概述

风险分析模块提供从服务拓扑分析、风险检测、演练场景生成、执行到结果分析的完整闭环能力。

### 1.1 功能模块

| 模块 | 功能描述 | 接口数量 |
|------|---------|---------|
| 拓扑分析 | K8s资源拓扑可视化、关系分析 | 3 |
| 风险检测 | 自动化风险识别、分类、评估 | 4 |
| 演练场景生成 | 基于风险点自动生成演练场景 | 2 |
| 演练执行 | 执行演练、监控进度 | 3 |
| 结果分析 | 演练结果分析、风险验证、改进建议 | 3 |

### 1.2 接口基础路径

```
Base URL: /api/v1/chaos/risk-detection
```

---

## 2. 通用规范

### 2.1 请求规范

#### 请求头（Headers）

| Header | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| Content-Type | string | 是 | 请求内容类型 | `application/json` |
| Authorization | string | 是 | 认证令牌 | `Bearer {token}` |
| X-Request-ID | string | 否 | 请求追踪ID | `req-uuid-xxx` |
| X-Workspace-ID | string | 否 | 工作空间ID | `ws-123` |

#### 分页参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | integer | 否 | 1 | 页码（从1开始） |
| pageSize | integer | 否 | 20 | 每页数量（1-100） |

### 2.2 响应规范

#### 成功响应格式

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "requestId": "req-uuid-xxx",
  "timestamp": 1701676800000
}
```

#### 分页响应格式

```json
{
  "success": true,
  "code": 200,
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

#### 错误响应格式

```json
{
  "success": false,
  "code": 400,
  "message": "参数错误",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "namespace",
        "message": "命名空间不能为空"
      }
    ]
  },
  "requestId": "req-uuid-xxx",
  "timestamp": 1701676800000
}
```

### 2.3 HTTP状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 500 | Internal Server Error | 服务器内部错误 |
| 503 | Service Unavailable | 服务不可用 |

---

## 3. 拓扑分析接口

### 3.1 获取K8s资源拓扑

#### 接口信息

- **接口名称**：获取K8s资源拓扑数据
- **HTTP Method**：`GET`
- **URL路径**：`/topology`
- **接口描述**：获取指定命名空间或集群的K8s资源拓扑图数据，包括节点和边的关系

#### 请求参数（Query Parameters）

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| clusterId | string | 否 | 集群ID，不传则返回所有集群 | `cluster-prod-01` |
| namespaces | string[] | 否 | 命名空间列表（逗号分隔） | `production,staging` |
| resourceTypes | string[] | 否 | 资源类型过滤（逗号分隔） | `DEPLOYMENT,POD,SERVICE` |
| includeRisks | boolean | 否 | 是否包含风险信息 | `true` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "nodes": [
      {
        "id": "deploy-payment-api",
        "name": "payment-api",
        "type": "DEPLOYMENT",
        "namespace": "production",
        "status": "healthy",
        "riskCount": 2,
        "hasRiskConfig": true,
        "position": { "x": 200, "y": 150 },
        "labels": { "app": "payment-api", "version": "v1.2.0" },
        "metadata": {
          "replicas": 3,
          "readyReplicas": 3
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "deploy-payment-api",
        "target": "rs-payment-api-7d8f9",
        "type": "manages",
        "label": "管理"
      }
    ],
    "summary": {
      "totalNodes": 15,
      "totalEdges": 20,
      "resourceTypeCounts": {
        "DEPLOYMENT": 3,
        "POD": 9,
        "SERVICE": 3
      }
    }
  }
}
```

---

### 3.2 获取资源详情

#### 接口信息

- **接口名称**：获取K8s资源详细信息
- **HTTP Method**：`GET`
- **URL路径**：`/topology/resources/{resourceId}`
- **接口描述**：获取指定K8s资源的详细信息，包括配置、状态、事件等

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| resourceId | string | 是 | 资源ID | `deploy-payment-api` |

#### 请求参数（Query Parameters）

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| includeEvents | boolean | 否 | 是否包含事件信息 | `true` |
| includeMetrics | boolean | 否 | 是否包含监控指标 | `true` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": "deploy-payment-api",
    "name": "payment-api",
    "type": "DEPLOYMENT",
    "namespace": "production",
    "status": "healthy",
    "labels": { "app": "payment-api" },
    "annotations": {},
    "spec": {
      "replicas": 3,
      "selector": { "matchLabels": { "app": "payment-api" } }
    },
    "status": {
      "replicas": 3,
      "readyReplicas": 3,
      "availableReplicas": 3
    },
    "events": [
      {
        "type": "Normal",
        "reason": "ScalingReplicaSet",
        "message": "Scaled up replica set to 3",
        "timestamp": 1701676800000
      }
    ],
    "metrics": {
      "cpu": { "usage": "250m", "limit": "1000m" },
      "memory": { "usage": "512Mi", "limit": "2Gi" }
    }
  }
}
```

---

### 3.3 获取资源依赖关系

#### 接口信息

- **接口名称**：获取资源依赖关系链
- **HTTP Method**：`GET`
- **URL路径**：`/topology/resources/{resourceId}/dependencies`
- **接口描述**：获取指定资源的上下游依赖关系

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| resourceId | string | 是 | 资源ID | `deploy-payment-api` |

#### 请求参数（Query Parameters）

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| direction | string | 否 | 依赖方向：upstream/downstream/both | `both` |
| depth | integer | 否 | 依赖深度（1-5） | `2` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "resourceId": "deploy-payment-api",
    "upstream": [
      {
        "id": "svc-api-gateway",
        "name": "api-gateway",
        "type": "SERVICE",
        "relation": "calls"
      }
    ],
    "downstream": [
      {
        "id": "svc-mysql",
        "name": "mysql",
        "type": "SERVICE",
        "relation": "calls"
      }
    ]
  }
}
```

---

## 4. 风险检测接口

### 4.1 执行风险分析

#### 接口信息

- **接口名称**：执行风险分析
- **HTTP Method**：`POST`
- **URL路径**：`/risks/analyze`
- **接口描述**：对指定的K8s资源或整个集群执行风险分析，识别潜在的风险点

#### 请求体（Request Body）

```json
{
  "clusterId": "cluster-prod-01",
  "namespaces": ["production", "staging"],
  "resourceIds": ["deploy-payment-api", "svc-mysql"],
  "analysisScope": "SELECTED_RESOURCES",
  "categories": ["SINGLE_POINT_FAILURE", "DEPENDENCY_RISK"],
  "minSeverity": "MEDIUM"
}
```

#### 请求参数说明

| 字段 | 类型 | 必填 | 说明 | 可选值 |
|------|------|------|------|--------|
| clusterId | string | 否 | 集群ID | - |
| namespaces | string[] | 否 | 命名空间列表 | - |
| resourceIds | string[] | 否 | 资源ID列表 | - |
| analysisScope | string | 是 | 分析范围 | ALL/NAMESPACE/SELECTED_RESOURCES |
| categories | string[] | 否 | 风险类别过滤 | SINGLE_POINT_FAILURE/DEPENDENCY_RISK/RESOURCE_RISK/NETWORK_RISK/DATA_RISK/CAPACITY_RISK |
| minSeverity | string | 否 | 最低严重程度 | LOW/MEDIUM/HIGH/CRITICAL |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "analysisId": "analysis-uuid-xxx",
    "risks": [
      {
        "id": "risk-001",
        "name": "支付服务单点故障风险",
        "description": "支付服务仅有1个副本运行，存在单点故障风险",
        "category": "SINGLE_POINT_FAILURE",
        "severity": "CRITICAL",
        "targetService": "payment-api",
        "targetServiceId": "deploy-payment-api",
        "affectedServices": ["order-service", "user-service"],
        "detectedAt": 1701676800000,
        "status": "DETECTED",
        "recommendedFaults": [
          {
            "faultType": "POD_KILL",
            "faultCode": "chaosblade.k8s.pod-kill",
            "faultName": "Pod 终止",
            "description": "终止支付服务 Pod，验证服务自动恢复能力",
            "priority": 1,
            "parameters": {
              "namespace": "production",
              "names": "payment-service-.*"
            }
          }
        ],
        "analysis": {
          "impactScope": "影响支付、订单、用户等3个核心服务",
          "impactDescription": "支付服务故障将导致所有支付功能不可用",
          "rootCause": "Deployment配置的副本数为1，未配置HPA",
          "recommendations": [
            "增加副本数至至少3个",
            "配置HPA实现自动扩缩容"
          ],
          "mitigationSteps": [
            "立即扩容至3个副本",
            "配置资源限制和请求"
          ]
        }
      }
    ],
    "summary": {
      "totalRisks": 5,
      "bySeverity": {
        "CRITICAL": 2,
        "HIGH": 1,
        "MEDIUM": 2,
        "LOW": 0
      },
      "byCategory": {
        "SINGLE_POINT_FAILURE": 2,
        "DEPENDENCY_RISK": 1,
        "RESOURCE_RISK": 2
      },
      "criticalServices": ["payment-api", "mysql"]
    },
    "analysisTime": 1500
  }
}
```

---

### 4.2 获取风险点列表

#### 接口信息

- **接口名称**：获取风险点列表
- **HTTP Method**：`GET`
- **URL路径**：`/risks`
- **接口描述**：获取已检测到的风险点列表，支持分页和过滤

#### 请求参数（Query Parameters）

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| page | integer | 否 | 页码 | `1` |
| pageSize | integer | 否 | 每页数量 | `20` |
| category | string | 否 | 风险类别 | `SINGLE_POINT_FAILURE` |
| severity | string | 否 | 严重程度 | `CRITICAL` |
| status | string | 否 | 风险状态 | `DETECTED` |
| targetService | string | 否 | 目标服务名称（模糊搜索） | `payment` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "items": [
      {
        "id": "risk-001",
        "name": "支付服务单点故障风险",
        "category": "SINGLE_POINT_FAILURE",
        "severity": "CRITICAL",
        "targetService": "payment-api",
        "status": "DETECTED",
        "detectedAt": 1701676800000
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

---

### 4.3 获取风险点详情

#### 接口信息

- **接口名称**：获取风险点详细信息
- **HTTP Method**：`GET`
- **URL路径**：`/risks/{riskId}`
- **接口描述**：获取指定风险点的详细信息，包括分析结果和推荐的故障类型

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| riskId | string | 是 | 风险点ID | `risk-001` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": "risk-001",
    "name": "支付服务单点故障风险",
    "description": "支付服务仅有1个副本运行，存在单点故障风险",
    "category": "SINGLE_POINT_FAILURE",
    "severity": "CRITICAL",
    "targetService": "payment-api",
    "targetServiceId": "deploy-payment-api",
    "affectedServices": ["order-service", "user-service"],
    "detectedAt": 1701676800000,
    "status": "DETECTED",
    "recommendedFaults": [],
    "analysis": {},
    "relatedExperiments": [
      {
        "experimentId": "exp-001",
        "experimentName": "支付服务Pod终止演练",
        "status": "COMPLETED",
        "createdAt": 1701676800000,
        "executedAt": 1701680400000
      }
    ]
  }
}
```

---

### 4.4 更新风险点状态

#### 接口信息

- **接口名称**：更新风险点状态
- **HTTP Method**：`PATCH`
- **URL路径**：`/risks/{riskId}/status`
- **接口描述**：更新风险点的状态（如标记为已缓解、已解决等）

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| riskId | string | 是 | 风险点ID | `risk-001` |

#### 请求体（Request Body）

```json
{
  "status": "MITIGATED",
  "comment": "已增加副本数至3个，配置了HPA"
}
```

#### 请求参数说明

| 字段 | 类型 | 必填 | 说明 | 可选值 |
|------|------|------|------|--------|
| status | string | 是 | 新状态 | DETECTED/ANALYZING/VERIFIED/MITIGATED/RESOLVED |
| comment | string | 否 | 备注说明 | - |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": "risk-001",
    "status": "MITIGATED",
    "updatedAt": 1701676800000
  }
}
```

---

## 5. 演练场景生成接口

### 5.1 生成演练场景

#### 接口信息

- **接口名称**：基于风险点生成演练场景
- **HTTP Method**：`POST`
- **URL路径**：`/experiments/generate`
- **接口描述**：根据选中的风险点和故障类型，自动生成完整的演练场景配置

#### 请求体（Request Body）

```json
{
  "riskPoints": [
    {
      "id": "risk-001",
      "name": "支付服务单点故障风险",
      "targetService": "payment-api",
      "targetServiceId": "deploy-payment-api"
    }
  ],
  "selectedFaults": [
    {
      "riskPointId": "risk-001",
      "faultCode": "chaosblade.k8s.pod-kill",
      "faultName": "Pod 终止",
      "parameters": {
        "namespace": "production",
        "names": "payment-service-.*"
      }
    }
  ],
  "experimentConfig": {
    "name": "支付服务高可用性验证演练",
    "description": "验证支付服务Pod故障时的自动恢复能力",
    "workspaceId": "ws-123",
    "duration": 900,
    "autoRecover": true,
    "tags": ["payment", "high-availability"]
  }
}
```

#### 请求参数说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| riskPoints | RiskPoint[] | 是 | 风险点列表（简化版） |
| selectedFaults | SelectedFault[] | 是 | 选中的故障配置 |
| experimentConfig | ExperimentConfig | 是 | 演练配置 |

**SelectedFault 结构**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| riskPointId | string | 是 | 关联的风险点ID |
| faultCode | string | 是 | 故障代码 |
| faultName | string | 是 | 故障名称 |
| parameters | object | 是 | 故障参数（自动配置） |

**ExperimentConfig 结构**：

| 字段 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| name | string | 是 | 演练名称 | - |
| description | string | 是 | 演练描述 | - |
| workspaceId | string | 否 | 工作空间ID | - |
| duration | integer | 否 | 持续时间（秒） | 900 |
| autoRecover | boolean | 否 | 是否自动恢复 | true |
| tags | string[] | 否 | 标签 | [] |

#### 响应示例

```json
{
  "success": true,
  "code": 201,
  "data": {
    "experimentId": "exp-uuid-xxx",
    "baseInfo": {
      "experimentId": "exp-uuid-xxx",
      "name": "支付服务高可用性验证演练",
      "description": "验证支付服务Pod故障时的自动恢复能力",
      "tags": ["payment", "high-availability", "risk-detection", "auto-generated"],
      "source": "RISK_DETECTION"
    },
    "flow": {
      "experimentId": "exp-uuid-xxx",
      "runMode": "SEQUENCE",
      "state": "DRAFT",
      "duration": 900,
      "schedulerConfig": {
        "cronExpression": ""
      },
      "flowGroups": [
        {
          "id": "group-uuid-xxx",
          "groupId": null,
          "groupName": "payment-api",
          "hosts": [
            {
              "deviceId": "deploy-payment-api",
              "deviceName": "payment-api",
              "ip": "10.0.0.1",
              "clusterId": "default-cluster",
              "clusterName": "Default Cluster",
              "scopeType": 2,
              "k8s": true
            }
          ],
          "flows": [
            {
              "id": "flow-uuid-xxx",
              "flowId": null,
              "order": 0,
              "required": true,
              "prepare": [],
              "attack": [
                {
                  "id": "node-uuid-xxx",
                  "name": "Pod 终止",
                  "code": "chaosblade.k8s.pod-kill",
                  "functionId": "chaosblade.k8s.pod-kill",
                  "nodeType": 1,
                  "stage": "attack",
                  "arguments": [
                    {
                      "name": "namespace",
                      "alias": "命名空间",
                      "value": "production",
                      "description": "Kubernetes命名空间",
                      "enabled": true,
                      "component": {
                        "type": "input",
                        "required": true,
                        "defaultValue": "production"
                      }
                    },
                    {
                      "name": "names",
                      "alias": "Pod名称",
                      "value": "payment-service-.*",
                      "description": "Pod名称，支持正则表达式匹配",
                      "enabled": true,
                      "component": {
                        "type": "input",
                        "required": true,
                        "defaultValue": "payment-service-.*"
                      }
                    }
                  ],
                  "pauses": {
                    "before": 0,
                    "after": 0
                  },
                  "hostPercent": 100,
                  "failedTolerance": 0
                }
              ],
              "check": [],
              "recover": []
            }
          ],
          "scopeType": 2,
          "appId": "deploy-payment-api",
          "appName": "payment-api"
        }
      ],
      "guardConf": {
        "guards": []
      }
    },
    "riskContext": {
      "riskPointIds": ["risk-001"],
      "riskNames": ["支付服务单点故障风险"],
      "severityLevel": "CRITICAL",
      "expectedImpact": "支付服务故障将导致所有支付功能不可用",
      "validationCriteria": [
        "增加副本数至至少3个",
        "配置HPA实现自动扩缩容"
      ]
    }
  }
}
```

---

### 5.2 验证演练场景配置

#### 接口信息

- **接口名称**：验证演练场景配置
- **HTTP Method**：`POST`
- **URL路径**：`/experiments/validate`
- **接口描述**：验证生成的演练场景配置是否合法，检查参数、权限等

#### 请求体（Request Body）

```json
{
  "experimentId": "exp-uuid-xxx",
  "flow": {
    "flowGroups": []
  }
}
```

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      {
        "field": "flow.flowGroups[0].hosts[0].ip",
        "message": "IP地址为默认值，建议修改为实际IP"
      }
    ]
  }
}
```

---

## 6. 演练执行接口

### 6.1 执行演练

#### 接口信息

- **接口名称**：执行演练场景
- **HTTP Method**：`POST`
- **URL路径**：`/experiments/{experimentId}/execute`
- **接口描述**：执行指定的演练场景，返回任务ID用于后续查询

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| experimentId | string | 是 | 演练场景ID | `exp-uuid-xxx` |

#### 请求体（Request Body）

```json
{
  "executeMode": "IMMEDIATE",
  "notifyOnComplete": true,
  "notifyChannels": ["email", "webhook"]
}
```

#### 请求参数说明

| 字段 | 类型 | 必填 | 说明 | 可选值 |
|------|------|------|------|--------|
| executeMode | string | 否 | 执行模式 | IMMEDIATE（立即执行）/SCHEDULED（定时执行） |
| notifyOnComplete | boolean | 否 | 完成时是否通知 | true/false |
| notifyChannels | string[] | 否 | 通知渠道 | email/webhook/sms |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "taskId": "task-uuid-xxx",
    "experimentId": "exp-uuid-xxx",
    "status": "RUNNING",
    "startTime": 1701676800000,
    "estimatedDuration": 900
  }
}
```

---

### 6.2 查询演练执行状态

#### 接口信息

- **接口名称**：查询演练执行状态
- **HTTP Method**：`GET`
- **URL路径**：`/experiments/{experimentId}/tasks/{taskId}`
- **接口描述**：查询演练任务的执行状态和进度

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| experimentId | string | 是 | 演练场景ID | `exp-uuid-xxx` |
| taskId | string | 是 | 任务ID | `task-uuid-xxx` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "taskId": "task-uuid-xxx",
    "experimentId": "exp-uuid-xxx",
    "experimentName": "支付服务高可用性验证演练",
    "status": "RUNNING",
    "startTime": 1701676800000,
    "endTime": null,
    "progress": {
      "currentStage": "attack",
      "completedActivities": 1,
      "totalActivities": 3,
      "percentage": 33
    },
    "activities": [
      {
        "activityId": "node-uuid-xxx",
        "activityName": "Pod 终止",
        "state": "SUCCESS",
        "runResult": "执行成功",
        "startTime": 1701676800000,
        "endTime": 1701676805000
      }
    ]
  }
}
```

---

### 6.3 停止演练执行

#### 接口信息

- **接口名称**：停止演练执行
- **HTTP Method**：`POST`
- **URL路径**：`/experiments/{experimentId}/tasks/{taskId}/stop`
- **接口描述**：停止正在执行的演练任务

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| experimentId | string | 是 | 演练场景ID | `exp-uuid-xxx` |
| taskId | string | 是 | 任务ID | `task-uuid-xxx` |

#### 请求体（Request Body）

```json
{
  "reason": "用户手动停止",
  "forceStop": false
}
```

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "taskId": "task-uuid-xxx",
    "status": "STOPPED",
    "stoppedAt": 1701676900000
  }
}
```

---

## 7. 结果分析接口

### 7.1 获取演练结果

#### 接口信息

- **接口名称**：获取演练执行结果
- **HTTP Method**：`GET`
- **URL路径**：`/experiments/{experimentId}/tasks/{taskId}/result`
- **接口描述**：获取演练任务的执行结果，包括风险验证结果

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| experimentId | string | 是 | 演练场景ID | `exp-uuid-xxx` |
| taskId | string | 是 | 任务ID | `task-uuid-xxx` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "experimentId": "exp-uuid-xxx",
    "experimentName": "支付服务高可用性验证演练",
    "taskId": "task-uuid-xxx",
    "status": "COMPLETED",
    "startTime": 1701676800000,
    "endTime": 1701677700000,
    "executionResult": {
      "success": true,
      "duration": 900,
      "activities": [
        {
          "activityId": "node-uuid-xxx",
          "activityName": "Pod 终止",
          "state": "SUCCESS",
          "runResult": "执行成功",
          "startTime": 1701676800000,
          "endTime": 1701676805000
        }
      ]
    },
    "riskValidationResults": [
      {
        "riskPointId": "risk-001",
        "riskName": "支付服务单点故障风险",
        "verified": true,
        "impactAnalysis": {
          "impactLevel": "CRITICAL",
          "affectedServices": ["payment-api", "order-service"],
          "degradedMetrics": [
            {
              "metricName": "可用性",
              "baselineValue": 99.9,
              "faultValue": 0,
              "degradationPercent": 100
            },
            {
              "metricName": "响应时间(ms)",
              "baselineValue": 50,
              "faultValue": 5000,
              "degradationPercent": 9900
            }
          ],
          "userImpact": "所有用户无法完成支付操作",
          "businessImpact": "预计损失订单100笔，金额约50万元"
        },
        "recommendations": [
          {
            "priority": 1,
            "category": "ARCHITECTURE",
            "title": "增加服务副本数",
            "description": "将payment-api服务的副本数从1增加到至少3个",
            "implementationSteps": [
              "修改Deployment配置，设置replicas: 3",
              "配置PodDisruptionBudget，确保至少2个Pod可用",
              "验证负载均衡配置"
            ],
            "estimatedTime": "30分钟",
            "expectedBenefit": "消除单点故障，提升可用性至99.99%"
          },
          {
            "priority": 2,
            "category": "CONFIG",
            "title": "配置HPA自动扩缩容",
            "description": "配置HorizontalPodAutoscaler实现自动扩缩容",
            "implementationSteps": [
              "创建HPA配置，设置CPU阈值为70%",
              "设置最小副本数为3，最大副本数为10",
              "配置metrics-server"
            ],
            "estimatedTime": "1小时",
            "expectedBenefit": "根据负载自动调整副本数，提升系统弹性"
          }
        ]
      }
    ]
  }
}
```

---

### 7.2 获取影响分析报告

#### 接口信息

- **接口名称**：获取故障影响分析报告
- **HTTP Method**：`GET`
- **URL路径**：`/experiments/{experimentId}/tasks/{taskId}/impact-analysis`
- **接口描述**：获取演练过程中的系统状态变化和影响分析

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| experimentId | string | 是 | 演练场景ID | `exp-uuid-xxx` |
| taskId | string | 是 | 任务ID | `task-uuid-xxx` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "taskId": "task-uuid-xxx",
    "impactAssessment": {
      "beforeFault": {
        "availability": 99.9,
        "responseTime": 50,
        "errorRate": 0.1,
        "affectedUsers": 0,
        "description": "系统运行正常，所有指标在正常范围内"
      },
      "duringFault": {
        "availability": 0,
        "responseTime": 5000,
        "errorRate": 100,
        "affectedUsers": 1500,
        "description": "支付服务完全不可用，所有请求失败"
      },
      "afterFault": {
        "availability": 99.9,
        "responseTime": 55,
        "errorRate": 0.1,
        "affectedUsers": 0,
        "description": "系统已恢复正常，指标恢复到基线水平"
      },
      "differenceAnalysis": "故障期间可用性下降100%，响应时间增加9900%，影响1500个用户。恢复后系统指标恢复正常，响应时间略有增加（+10%）。"
    },
    "timeSeriesMetrics": {
      "availability": [
        { "timestamp": 1701676800000, "value": 99.9 },
        { "timestamp": 1701676860000, "value": 0 },
        { "timestamp": 1701677700000, "value": 99.9 }
      ],
      "responseTime": [
        { "timestamp": 1701676800000, "value": 50 },
        { "timestamp": 1701676860000, "value": 5000 },
        { "timestamp": 1701677700000, "value": 55 }
      ],
      "errorRate": [
        { "timestamp": 1701676800000, "value": 0.1 },
        { "timestamp": 1701676860000, "value": 100 },
        { "timestamp": 1701677700000, "value": 0.1 }
      ]
    }
  }
}
```

---

### 7.3 获取改进建议

#### 接口信息

- **接口名称**：获取系统改进建议
- **HTTP Method**：`GET`
- **URL路径**：`/experiments/{experimentId}/tasks/{taskId}/recommendations`
- **接口描述**：基于演练结果生成系统改进建议

#### 路径参数

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| experimentId | string | 是 | 演练场景ID | `exp-uuid-xxx` |
| taskId | string | 是 | 任务ID | `task-uuid-xxx` |

#### 请求参数（Query Parameters）

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| category | string | 否 | 建议类别过滤 | `ARCHITECTURE` |
| priority | integer | 否 | 优先级过滤（1-5） | `1` |

#### 响应示例

```json
{
  "success": true,
  "code": 200,
  "data": {
    "recommendations": [
      {
        "priority": 1,
        "category": "ARCHITECTURE",
        "title": "增加服务副本数",
        "description": "将payment-api服务的副本数从1增加到至少3个，消除单点故障风险",
        "implementationSteps": [
          "修改Deployment配置，设置replicas: 3",
          "配置PodDisruptionBudget，确保至少2个Pod可用",
          "验证负载均衡配置是否正确分发流量"
        ],
        "estimatedTime": "30分钟",
        "expectedBenefit": "消除单点故障，提升可用性至99.99%，减少故障影响范围"
      },
      {
        "priority": 2,
        "category": "CONFIG",
        "title": "配置HPA自动扩缩容",
        "description": "配置HorizontalPodAutoscaler实现基于CPU和内存的自动扩缩容",
        "implementationSteps": [
          "创建HPA配置，设置CPU阈值为70%，内存阈值为80%",
          "设置最小副本数为3，最大副本数为10",
          "部署metrics-server用于采集指标",
          "验证扩缩容策略是否生效"
        ],
        "estimatedTime": "1小时",
        "expectedBenefit": "根据负载自动调整副本数，提升系统弹性和资源利用率"
      },
      {
        "priority": 3,
        "category": "MONITORING",
        "title": "完善监控告警",
        "description": "添加服务可用性和性能监控告警，及时发现问题",
        "implementationSteps": [
          "配置Prometheus监控规则",
          "设置可用性告警阈值为99%",
          "设置响应时间告警阈值为200ms",
          "配置告警通知渠道（邮件、短信、钉钉）"
        ],
        "estimatedTime": "2小时",
        "expectedBenefit": "及时发现和响应故障，减少MTTR（平均恢复时间）"
      },
      {
        "priority": 4,
        "category": "RUNBOOK",
        "title": "编写故障应急手册",
        "description": "编写支付服务故障的应急处理手册，提升故障响应效率",
        "implementationSteps": [
          "记录常见故障场景和处理步骤",
          "编写快速诊断checklist",
          "准备回滚和恢复脚本",
          "组织团队演练和培训"
        ],
        "estimatedTime": "4小时",
        "expectedBenefit": "提升故障响应速度，减少人为错误"
      }
    ],
    "summary": {
      "totalRecommendations": 4,
      "byCategory": {
        "ARCHITECTURE": 1,
        "CONFIG": 1,
        "MONITORING": 1,
        "RUNBOOK": 1
      },
      "estimatedTotalTime": "7.5小时",
      "expectedImpact": "HIGH"
    }
  }
}
```

---

## 8. 数据结构定义

### 8.1 RiskPoint（风险点）

```typescript
interface RiskPoint {
  id: string;                          // 风险点ID
  name: string;                        // 风险名称
  description: string;                 // 风险描述
  category: RiskCategory;              // 风险类别
  severity: RiskSeverity;              // 严重程度
  targetService: string;               // 目标服务名称
  targetServiceId: string;             // 目标服务ID
  affectedServices: string[];          // 受影响的服务列表
  detectedAt: number;                  // 检测时间（时间戳）
  status: RiskStatus;                  // 风险状态
  recommendedFaults: RecommendedFault[]; // 推荐的故障类型
  analysis: RiskAnalysis;              // 风险分析详情
  relatedExperiments?: RelatedExperiment[]; // 关联的演练场景
}

// 风险类别
type RiskCategory =
  | 'SINGLE_POINT_FAILURE'   // 单点故障
  | 'DEPENDENCY_RISK'        // 依赖风险
  | 'RESOURCE_RISK'          // 资源风险
  | 'NETWORK_RISK'           // 网络风险
  | 'DATA_RISK'              // 数据风险
  | 'CAPACITY_RISK';         // 容量风险

// 风险严重程度
type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// 风险状态
type RiskStatus =
  | 'DETECTED'     // 已发现
  | 'ANALYZING'    // 分析中
  | 'VERIFIED'     // 已验证（通过演练验证）
  | 'MITIGATED'    // 已缓解
  | 'RESOLVED';    // 已解决
```

### 8.2 RecommendedFault（推荐故障）

```typescript
interface RecommendedFault {
  faultType: string;           // 故障类型
  faultCode: string;           // 故障代码（ChaosBlade）
  faultName: string;           // 故障名称
  description: string;         // 故障描述
  priority: number;            // 优先级（1-5）
  parameters?: Record<string, any>; // 故障参数（自动配置）
}
```

### 8.3 RiskAnalysis（风险分析）

```typescript
interface RiskAnalysis {
  impactScope: string;         // 影响范围
  impactDescription: string;   // 影响描述
  rootCause: string;           // 根本原因
  recommendations: string[];   // 改进建议
  mitigationSteps: string[];   // 缓解步骤
}
```

### 8.4 K8sResourceNode（K8s资源节点）

```typescript
interface RiskTopologyNode {
  id: string;                  // 资源ID
  name: string;                // 资源名称
  type: K8sResourceType;       // 资源类型
  namespace?: string;          // 命名空间
  status: K8sResourceStatus;   // 资源状态
  riskCount: number;           // 风险数量
  hasRiskConfig: boolean;      // 是否有风险配置
  risks: RiskPoint[];          // 关联的风险点
  position: { x: number; y: number }; // 拓扑图位置
  labels?: Record<string, string>;    // K8s标签
  annotations?: Record<string, string>; // K8s注解
  metadata?: K8sResourceMetadata;     // 资源元数据
}

// K8s资源类型
type K8sResourceType =
  | 'NAMESPACE' | 'DEPLOYMENT' | 'REPLICASET' | 'POD'
  | 'SERVICE' | 'CONFIGMAP' | 'SECRET' | 'PVC'
  | 'INGRESS' | 'STATEFULSET' | 'DAEMONSET';
```

### 8.5 GeneratedExperiment（生成的演练场景）

```typescript
interface GeneratedExperiment {
  experimentId: string;        // 演练场景ID
  baseInfo: ExperimentBaseInfo; // 基础信息
  flow: ExperimentFlow;        // 流程配置
  riskContext: RiskContext;    // 风险上下文
}

interface ExperimentBaseInfo {
  experimentId: string;
  name: string;                // 演练名称
  description: string;         // 演练描述
  tags: string[];              // 标签
  source: 'RISK_DETECTION';    // 来源标识
}

interface ExperimentFlow {
  experimentId: string;
  runMode: 'SEQUENCE' | 'PARALLEL'; // 执行模式
  state: string;               // 状态
  duration: number;            // 持续时间（秒）
  schedulerConfig: {
    cronExpression: string;    // 定时表达式
  };
  flowGroups: FlowGroup[];     // 流程组
  guardConf: {
    guards: any[];             // 恢复策略
  };
}

interface RiskContext {
  riskPointIds: string[];      // 风险点ID列表
  riskNames: string[];         // 风险名称列表
  severityLevel: RiskSeverity; // 严重程度
  expectedImpact: string;      // 预期影响
  validationCriteria: string[]; // 验证标准
}
```

### 8.6 RiskDrillResult（演练结果）

```typescript
interface RiskDrillResult {
  experimentId: string;
  experimentName: string;
  taskId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED';
  startTime: number;
  endTime?: number;
  executionResult: ExecutionResult;
  riskValidationResults: RiskValidationResult[];
}

interface RiskValidationResult {
  riskPointId: string;
  riskName: string;
  verified: boolean;           // 是否验证通过
  impactAnalysis: ImpactAnalysis;
  recommendations: Recommendation[];
}

interface ImpactAnalysis {
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedServices: string[];
  degradedMetrics: MetricDegradation[];
  userImpact: string;
  businessImpact: string;
}

interface Recommendation {
  priority: number;
  category: 'ARCHITECTURE' | 'CODE' | 'CONFIG' | 'MONITORING' | 'RUNBOOK';
  title: string;
  description: string;
  implementationSteps: string[];
  estimatedTime: string;
  expectedBenefit: string;
}
```

---

## 9. 错误码定义

### 9.1 通用错误码

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|-----------|------|---------|
| 10000 | 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 10001 | 401 | 未授权 | 提供有效的认证令牌 |
| 10002 | 403 | 无权限 | 联系管理员分配权限 |
| 10003 | 404 | 资源不存在 | 检查资源ID是否正确 |
| 10004 | 409 | 资源冲突 | 检查资源状态或名称是否重复 |
| 10005 | 500 | 服务器内部错误 | 联系技术支持 |
| 10006 | 503 | 服务不可用 | 稍后重试 |

### 9.2 拓扑分析错误码

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|-----------|------|---------|
| 20001 | 400 | 集群ID无效 | 检查集群ID是否存在 |
| 20002 | 400 | 命名空间不存在 | 检查命名空间名称 |
| 20003 | 404 | 资源不存在 | 检查资源ID |
| 20004 | 500 | 拓扑数据获取失败 | 检查K8s集群连接 |

### 9.3 风险检测错误码

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|-----------|------|---------|
| 30001 | 400 | 分析范围参数错误 | 检查analysisScope参数 |
| 30002 | 400 | 风险类别参数错误 | 检查categories参数 |
| 30003 | 404 | 风险点不存在 | 检查风险点ID |
| 30004 | 500 | 风险分析失败 | 查看详细错误信息 |
| 30005 | 409 | 风险点状态冲突 | 检查当前状态是否允许更新 |

### 9.4 演练场景生成错误码

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|-----------|------|---------|
| 40001 | 400 | 风险点列表为空 | 至少选择一个风险点 |
| 40002 | 400 | 故障配置为空 | 至少选择一个故障类型 |
| 40003 | 400 | 演练配置参数错误 | 检查name、description等必填项 |
| 40004 | 400 | 故障参数验证失败 | 检查故障参数格式 |
| 40005 | 500 | 演练场景生成失败 | 查看详细错误信息 |

### 9.5 演练执行错误码

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|-----------|------|---------|
| 50001 | 404 | 演练场景不存在 | 检查experimentId |
| 50002 | 404 | 任务不存在 | 检查taskId |
| 50003 | 409 | 演练场景状态不允许执行 | 检查演练场景状态 |
| 50004 | 409 | 任务已在执行中 | 等待当前任务完成 |
| 50005 | 500 | 演练执行失败 | 查看详细错误信息 |
| 50006 | 400 | 停止任务失败 | 检查任务状态 |

### 9.6 结果分析错误码

| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|-----------|------|---------|
| 60001 | 404 | 演练结果不存在 | 检查任务是否已完成 |
| 60002 | 400 | 任务未完成 | 等待任务执行完成 |
| 60003 | 500 | 结果分析失败 | 查看详细错误信息 |
| 60004 | 500 | 影响分析数据不完整 | 检查监控数据采集 |

---

## 10. 接口汇总表

### 10.1 拓扑分析接口（3个）

| 序号 | 接口名称 | Method | URL路径 | 说明 |
|------|---------|--------|---------|------|
| 1 | 获取K8s资源拓扑 | GET | `/topology` | 获取拓扑图数据 |
| 2 | 获取资源详情 | GET | `/topology/resources/{resourceId}` | 获取资源详细信息 |
| 3 | 获取资源依赖关系 | GET | `/topology/resources/{resourceId}/dependencies` | 获取依赖关系链 |

### 10.2 风险检测接口（4个）

| 序号 | 接口名称 | Method | URL路径 | 说明 |
|------|---------|--------|---------|------|
| 4 | 执行风险分析 | POST | `/risks/analyze` | 执行风险分析 |
| 5 | 获取风险点列表 | GET | `/risks` | 获取风险点列表 |
| 6 | 获取风险点详情 | GET | `/risks/{riskId}` | 获取风险点详情 |
| 7 | 更新风险点状态 | PATCH | `/risks/{riskId}/status` | 更新风险状态 |

### 10.3 演练场景生成接口（2个）

| 序号 | 接口名称 | Method | URL路径 | 说明 |
|------|---------|--------|---------|------|
| 8 | 生成演练场景 | POST | `/experiments/generate` | 生成演练场景 |
| 9 | 验证演练场景配置 | POST | `/experiments/validate` | 验证配置合法性 |

### 10.4 演练执行接口（3个）

| 序号 | 接口名称 | Method | URL路径 | 说明 |
|------|---------|--------|---------|------|
| 10 | 执行演练 | POST | `/experiments/{experimentId}/execute` | 执行演练场景 |
| 11 | 查询演练执行状态 | GET | `/experiments/{experimentId}/tasks/{taskId}` | 查询执行状态 |
| 12 | 停止演练执行 | POST | `/experiments/{experimentId}/tasks/{taskId}/stop` | 停止演练 |

### 10.5 结果分析接口（3个）

| 序号 | 接口名称 | Method | URL路径 | 说明 |
|------|---------|--------|---------|------|
| 13 | 获取演练结果 | GET | `/experiments/{experimentId}/tasks/{taskId}/result` | 获取执行结果 |
| 14 | 获取影响分析报告 | GET | `/experiments/{experimentId}/tasks/{taskId}/impact-analysis` | 获取影响分析 |
| 15 | 获取改进建议 | GET | `/experiments/{experimentId}/tasks/{taskId}/recommendations` | 获取改进建议 |

**总计：15个接口**

---

## 11. 使用示例

### 11.1 完整流程示例

```bash
# 1. 获取拓扑数据
GET /api/v1/chaos/risk-detection/topology?namespaces=production

# 2. 执行风险分析
POST /api/v1/chaos/risk-detection/risks/analyze
{
  "analysisScope": "NAMESPACE",
  "namespaces": ["production"]
}

# 3. 生成演练场景
POST /api/v1/chaos/risk-detection/experiments/generate
{
  "riskPoints": [...],
  "selectedFaults": [...],
  "experimentConfig": {...}
}

# 4. 执行演练
POST /api/v1/chaos/risk-detection/experiments/{experimentId}/execute

# 5. 查询执行状态
GET /api/v1/chaos/risk-detection/experiments/{experimentId}/tasks/{taskId}

# 6. 获取演练结果
GET /api/v1/chaos/risk-detection/experiments/{experimentId}/tasks/{taskId}/result

# 7. 获取改进建议
GET /api/v1/chaos/risk-detection/experiments/{experimentId}/tasks/{taskId}/recommendations
```

---

## 12. 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0 | 2025-12-04 | 初始版本，定义15个核心接口 |

---

## 13. 附录

### 13.1 参考资料

- ChaosBlade 故障注入规范
- Kubernetes API 规范
- OpenTelemetry 追踪规范
- RESTful API 设计最佳实践

### 13.2 联系方式

如有疑问或建议，请联系：
- 技术支持：support@example.com
- API文档：https://docs.example.com/api

---

**文档结束**
```






