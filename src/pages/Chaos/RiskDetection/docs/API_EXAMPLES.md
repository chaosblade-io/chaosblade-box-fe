# API调用示例

本文档提供风险分析模块各个接口的实际调用示例，包括请求和响应的完整数据。

---

## 场景一：完整的风险分析到演练执行流程

### Step 1: 获取K8s资源拓扑

**请求**:
```bash
GET /api/v1/chaos/risk-detection/topology?namespaces=production&includeRisks=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
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
        "metadata": {
          "replicas": 1,
          "readyReplicas": 1
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "deploy-payment-api",
        "target": "svc-mysql",
        "type": "calls"
      }
    ]
  }
}
```

---

### Step 2: 执行风险分析

**请求**:
```bash
POST /api/v1/chaos/risk-detection/risks/analyze
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "analysisScope": "SELECTED_RESOURCES",
  "resourceIds": ["deploy-payment-api"],
  "categories": ["SINGLE_POINT_FAILURE", "DEPENDENCY_RISK"],
  "minSeverity": "MEDIUM"
}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "analysisId": "analysis-20251204-001",
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
      "totalRisks": 1,
      "bySeverity": {
        "CRITICAL": 1,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0
      },
      "byCategory": {
        "SINGLE_POINT_FAILURE": 1
      },
      "criticalServices": ["payment-api"]
    },
    "analysisTime": 1500
  }
}
```

---

### Step 3: 生成演练场景

**请求**:
```bash
POST /api/v1/chaos/risk-detection/experiments/generate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "riskPoints": [
    {
      "id": "risk-001",
      "name": "支付服务单点故障风险",
      "targetService": "payment-api",
      "targetServiceId": "deploy-payment-api",
      "category": "SINGLE_POINT_FAILURE",
      "severity": "CRITICAL"
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
    "description": "验证支付服务Pod故障时的自动恢复能力和系统容错性",
    "duration": 900,
    "autoRecover": true,
    "tags": ["payment", "high-availability", "critical"]
  }
}
```

**响应**:
```json
{
  "success": true,
  "code": 201,
  "data": {
    "experimentId": "exp-20251204-001",
    "baseInfo": {
      "experimentId": "exp-20251204-001",
      "name": "支付服务高可用性验证演练",
      "description": "验证支付服务Pod故障时的自动恢复能力和系统容错性",
      "tags": ["payment", "high-availability", "critical", "risk-detection", "auto-generated"],
      "source": "RISK_DETECTION"
    },
    "flow": {
      "experimentId": "exp-20251204-001",
      "runMode": "SEQUENCE",
      "state": "DRAFT",
      "duration": 900,
      "flowGroups": [
        {
          "groupName": "payment-api",
          "hosts": [
            {
              "deviceId": "deploy-payment-api",
              "deviceName": "payment-api",
              "scopeType": 2,
              "k8s": true
            }
          ],
          "flows": [
            {
              "attack": [
                {
                  "id": "node-uuid-001",
                  "name": "Pod 终止",
                  "code": "chaosblade.k8s.pod-kill",
                  "arguments": [
                    {
                      "name": "namespace",
                      "alias": "命名空间",
                      "value": "production",
                      "description": "Kubernetes命名空间"
                    },
                    {
                      "name": "names",
                      "alias": "Pod名称",
                      "value": "payment-service-.*",
                      "description": "Pod名称，支持正则表达式匹配"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    "riskContext": {
      "riskPointIds": ["risk-001"],
      "riskNames": ["支付服务单点故障风险"],
      "severityLevel": "CRITICAL",
      "expectedImpact": "支付服务故障将导致所有支付功能不可用"
    }
  }
}
```

---

### Step 4: 执行演练

**请求**:
```bash
POST /api/v1/chaos/risk-detection/experiments/exp-20251204-001/execute
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "executeMode": "IMMEDIATE",
  "notifyOnComplete": true,
  "notifyChannels": ["email", "webhook"]
}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "taskId": "task-20251204-001",
    "experimentId": "exp-20251204-001",
    "status": "RUNNING",
    "startTime": 1701676800000,
    "estimatedDuration": 900
  }
}
```

---

### Step 5: 查询执行状态

**请求**:
```bash
GET /api/v1/chaos/risk-detection/experiments/exp-20251204-001/tasks/task-20251204-001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "taskId": "task-20251204-001",
    "experimentId": "exp-20251204-001",
    "experimentName": "支付服务高可用性验证演练",
    "status": "RUNNING",
    "startTime": 1701676800000,
    "progress": {
      "currentStage": "attack",
      "completedActivities": 1,
      "totalActivities": 1,
      "percentage": 100
    },
    "activities": [
      {
        "activityId": "node-uuid-001",
        "activityName": "Pod 终止",
        "state": "SUCCESS",
        "runResult": "执行成功，已终止1个Pod",
        "startTime": 1701676800000,
        "endTime": 1701676805000
      }
    ]
  }
}
```

---

### Step 6: 获取演练结果

**请求**:
```bash
GET /api/v1/chaos/risk-detection/experiments/exp-20251204-001/tasks/task-20251204-001/result
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "experimentId": "exp-20251204-001",
    "taskId": "task-20251204-001",
    "status": "COMPLETED",
    "startTime": 1701676800000,
    "endTime": 1701677700000,
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
            "estimatedTime": "30分钟",
            "expectedBenefit": "消除单点故障，提升可用性至99.99%"
          }
        ]
      }
    ]
  }
}
```

---

## 场景二：获取风险点列表并更新状态

### 获取风险点列表

**请求**:
```bash
GET /api/v1/chaos/risk-detection/risks?page=1&pageSize=20&severity=CRITICAL&status=DETECTED
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
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
      },
      {
        "id": "risk-002",
        "name": "数据库连接池耗尽风险",
        "category": "DEPENDENCY_RISK",
        "severity": "CRITICAL",
        "targetService": "mysql",
        "status": "DETECTED",
        "detectedAt": 1701676900000
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

### 更新风险点状态

**请求**:
```bash
PATCH /api/v1/chaos/risk-detection/risks/risk-001/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "MITIGATED",
  "comment": "已增加副本数至3个，配置了HPA和PDB"
}
```

**响应**:
```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": "risk-001",
    "status": "MITIGATED",
    "updatedAt": 1701680400000
  }
}
```

---

## 场景三：获取资源依赖关系

**请求**:
```bash
GET /api/v1/chaos/risk-detection/topology/resources/deploy-payment-api/dependencies?direction=both&depth=2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
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
        "relation": "calls",
        "distance": 1
      }
    ],
    "downstream": [
      {
        "id": "svc-mysql",
        "name": "mysql",
        "type": "SERVICE",
        "relation": "calls",
        "distance": 1
      },
      {
        "id": "svc-redis",
        "name": "redis",
        "type": "SERVICE",
        "relation": "calls",
        "distance": 1
      }
    ]
  }
}
```

---

## 错误处理示例

### 示例1: 参数验证错误

**请求**:
```bash
POST /api/v1/chaos/risk-detection/risks/analyze
Content-Type: application/json

{
  "analysisScope": "INVALID_SCOPE"
}
```

**响应**:
```json
{
  "success": false,
  "code": 400,
  "message": "参数验证失败",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "analysisScope",
        "message": "分析范围必须是 ALL、NAMESPACE 或 SELECTED_RESOURCES 之一"
      }
    ]
  },
  "requestId": "req-uuid-xxx",
  "timestamp": 1701676800000
}
```

### 示例2: 资源不存在

**请求**:
```bash
GET /api/v1/chaos/risk-detection/risks/invalid-risk-id
```

**响应**:
```json
{
  "success": false,
  "code": 404,
  "message": "风险点不存在",
  "error": {
    "type": "RESOURCE_NOT_FOUND",
    "details": [
      {
        "field": "riskId",
        "message": "未找到ID为 invalid-risk-id 的风险点"
      }
    ]
  },
  "requestId": "req-uuid-xxx",
  "timestamp": 1701676800000
}
```

---

## 前端调用示例（TypeScript）

```typescript
import { riskDetectionService } from '../services/riskDetectionService';

// 1. 获取拓扑数据
const topology = await riskDetectionService.getTopologyData();

// 2. 执行风险分析
const analysisResult = await riskDetectionService.analyzeRisks(['deploy-payment-api']);

// 3. 生成演练场景
const experiment = await riskDetectionService.generateExperiment({
  riskPoints: analysisResult.risks,
  selectedFaults: [
    {
      riskPointId: 'risk-001',
      faultCode: 'chaosblade.k8s.pod-kill',
      faultName: 'Pod 终止',
      parameters: { namespace: 'production', names: 'payment-service-.*' }
    }
  ],
  experimentConfig: {
    name: '支付服务高可用性验证演练',
    description: '验证Pod故障时的自动恢复能力',
    duration: 900,
    autoRecover: true,
    tags: ['payment']
  }
});

// 4. 执行演练（需要调用演练系统的API）
// ...

// 5. 获取演练结果
const result = await riskDetectionService.getDrillResult(experiment.experimentId);
```

---

**更多示例请参考**: [API_SPECIFICATION.md](./API_SPECIFICATION.md)

