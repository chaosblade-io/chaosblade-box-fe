# 风险分析模块API快速参考

## 基础信息

**Base URL**: `/api/v1/chaos/risk-detection`

**认证方式**: Bearer Token

**Content-Type**: `application/json`

---

## 接口列表

### 1️⃣ 拓扑分析（3个接口）

| 接口 | Method | 路径 | 说明 |
|------|--------|------|------|
| 获取拓扑 | `GET` | `/topology` | 获取K8s资源拓扑图 |
| 资源详情 | `GET` | `/topology/resources/{id}` | 获取资源详细信息 |
| 依赖关系 | `GET` | `/topology/resources/{id}/dependencies` | 获取依赖关系链 |

### 2️⃣ 风险检测（4个接口）

| 接口 | Method | 路径 | 说明 |
|------|--------|------|------|
| 风险分析 | `POST` | `/risks/analyze` | 执行风险分析 |
| 风险列表 | `GET` | `/risks` | 获取风险点列表 |
| 风险详情 | `GET` | `/risks/{riskId}` | 获取风险点详情 |
| 更新状态 | `PATCH` | `/risks/{riskId}/status` | 更新风险状态 |

### 3️⃣ 演练场景生成（2个接口）

| 接口 | Method | 路径 | 说明 |
|------|--------|------|------|
| 生成场景 | `POST` | `/experiments/generate` | 生成演练场景 |
| 验证配置 | `POST` | `/experiments/validate` | 验证配置合法性 |

### 4️⃣ 演练执行（3个接口）

| 接口 | Method | 路径 | 说明 |
|------|--------|------|------|
| 执行演练 | `POST` | `/experiments/{id}/execute` | 执行演练场景 |
| 查询状态 | `GET` | `/experiments/{id}/tasks/{taskId}` | 查询执行状态 |
| 停止演练 | `POST` | `/experiments/{id}/tasks/{taskId}/stop` | 停止演练 |

### 5️⃣ 结果分析（3个接口）

| 接口 | Method | 路径 | 说明 |
|------|--------|------|------|
| 演练结果 | `GET` | `/experiments/{id}/tasks/{taskId}/result` | 获取执行结果 |
| 影响分析 | `GET` | `/experiments/{id}/tasks/{taskId}/impact-analysis` | 获取影响分析 |
| 改进建议 | `GET` | `/experiments/{id}/tasks/{taskId}/recommendations` | 获取改进建议 |

---

## 核心数据结构

### RiskPoint（风险点）

```json
{
  "id": "risk-001",
  "name": "支付服务单点故障风险",
  "category": "SINGLE_POINT_FAILURE",
  "severity": "CRITICAL",
  "targetService": "payment-api",
  "status": "DETECTED",
  "recommendedFaults": [...]
}
```

### GeneratedExperiment（演练场景）

```json
{
  "experimentId": "exp-uuid-xxx",
  "baseInfo": {
    "name": "演练名称",
    "description": "演练描述",
    "tags": ["risk-detection"]
  },
  "flow": {
    "runMode": "SEQUENCE",
    "duration": 900,
    "flowGroups": [...]
  }
}
```

### RiskDrillResult（演练结果）

```json
{
  "experimentId": "exp-uuid-xxx",
  "taskId": "task-uuid-xxx",
  "status": "COMPLETED",
  "riskValidationResults": [
    {
      "riskPointId": "risk-001",
      "verified": true,
      "impactAnalysis": {...},
      "recommendations": [...]
    }
  ]
}
```

---

## 常用枚举值

### RiskCategory（风险类别）
- `SINGLE_POINT_FAILURE` - 单点故障
- `DEPENDENCY_RISK` - 依赖风险
- `RESOURCE_RISK` - 资源风险
- `NETWORK_RISK` - 网络风险
- `DATA_RISK` - 数据风险
- `CAPACITY_RISK` - 容量风险

### RiskSeverity（严重程度）
- `CRITICAL` - 严重
- `HIGH` - 高
- `MEDIUM` - 中
- `LOW` - 低

### RiskStatus（风险状态）
- `DETECTED` - 已发现
- `ANALYZING` - 分析中
- `VERIFIED` - 已验证
- `MITIGATED` - 已缓解
- `RESOLVED` - 已解决

### TaskStatus（任务状态）
- `PENDING` - 待执行
- `RUNNING` - 执行中
- `COMPLETED` - 已完成
- `FAILED` - 失败
- `STOPPED` - 已停止

---

## 完整流程示例

```bash
# Step 1: 获取拓扑
curl -X GET "http://api/v1/chaos/risk-detection/topology?namespaces=production" \
  -H "Authorization: Bearer {token}"

# Step 2: 执行风险分析
curl -X POST "http://api/v1/chaos/risk-detection/risks/analyze" \
  -H "Authorization: Bearer {token}" \
  -d '{"analysisScope":"NAMESPACE","namespaces":["production"]}'

# Step 3: 生成演练场景
curl -X POST "http://api/v1/chaos/risk-detection/experiments/generate" \
  -H "Authorization: Bearer {token}" \
  -d '{"riskPoints":[...],"selectedFaults":[...],"experimentConfig":{...}}'

# Step 4: 执行演练
curl -X POST "http://api/v1/chaos/risk-detection/experiments/{id}/execute" \
  -H "Authorization: Bearer {token}"

# Step 5: 获取结果
curl -X GET "http://api/v1/chaos/risk-detection/experiments/{id}/tasks/{taskId}/result" \
  -H "Authorization: Bearer {token}"
```

---

**详细文档**: 请参考 [API_SPECIFICATION.md](./API_SPECIFICATION.md)

