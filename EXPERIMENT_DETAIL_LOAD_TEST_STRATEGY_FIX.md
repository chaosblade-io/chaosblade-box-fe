# 演练详情页面压测策略显示修复

## 问题描述

在演练详情页面的"配置"tab栏下，`GetLoadTestStrategyByExperimentId`接口返回的压测策略数据没有正确进行页面渲染。

## 问题分析

经过代码检查，发现以下问题：

1. **API参数错误**: 使用了`Namespace`（大写N）而不是`namespace`（小写n）
2. **显示效果不佳**: 原有的压测策略显示比较简陋
3. **调试信息不足**: 缺少足够的日志来诊断问题

## 修复内容

### 1. ✅ 修复API调用参数

**修复前**:
```typescript
const strategies = await dispatch.loadTestDefinition.getLoadTestStrategyByExperimentId({
  experimentId,
  Namespace: 'default', // 错误：大写N
});
```

**修复后**:
```typescript
const strategies = await dispatch.loadTestDefinition.getLoadTestStrategyByExperimentId({
  experimentId,
  namespace: 'default', // 正确：小写n
});
```

### 2. ✅ 增强压测策略显示

**新的显示功能**:
- 策略编号显示（Strategy #1, #2...）
- 状态标签（启用/禁用）
- 详细信息展示
- 更好的视觉布局

**显示的信息**:
- Definition ID
- Pre-start Time (提前启动时间)
- Duration (持续时间)
- Abort on Failure (失败时中止)
- Created At (创建时间)

### 3. ✅ 改进UI样式

**新增CSS样式**:
```css
.loadTestStrategies {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.strategyItem {
  padding: 16px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e1e4e8;
  transition: all 0.2s ease;
}

.strategyItem:hover {
  border-color: #d0d7de;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 4. ✅ 添加调试信息

**控制台日志**:
- 加载压测策略时的日志
- API调用结果的日志
- 错误处理的日志

**页面显示**:
- 策略数量显示
- 无策略时的友好提示

## 修改的文件

### 主要修改
- `src/pages/Chaos/Experiment/ExperimentDetail/index.tsx` - 修复API调用和增强显示
- `src/pages/Chaos/Experiment/ExperimentDetail/index.css` - 新增样式

### 修改详情

#### 1. API调用修复
```typescript
// 加载压测策略
async function loadLoadTestStrategies(experimentId: string) {
  try {
    console.log('Loading load test strategies for experimentId:', experimentId);
    const strategies = await dispatch.loadTestDefinition.getLoadTestStrategyByExperimentId({
      experimentId,
      namespace: 'default', // 修正为小写namespace
    });
    console.log('Loaded load test strategies:', strategies);
    setLoadTestStrategies(strategies || []);
  } catch (error) {
    console.error('Failed to load load test strategies:', error);
    setLoadTestStrategies([]);
  }
}
```

#### 2. 增强的显示组件
```typescript
function renderLoadTestStrategies() {
  if (!loadTestStrategies || loadTestStrategies.length === 0) {
    return (
      <div style={{ color: '#999', fontStyle: 'italic' }}>
        <Translation>No load test strategies configured</Translation>
      </div>
    );
  }

  return (
    <div className={styles.loadTestStrategies}>
      {loadTestStrategies.map((strategy: ILoadTestStrategy, index: number) => (
        <div key={strategy.id} className={styles.strategyItem}>
          {/* 详细的策略信息显示 */}
        </div>
      ))}
    </div>
  );
}
```

## 验证方法

### 1. 浏览器开发者工具检查
- 打开Network标签页
- 查看是否有对`GetLoadTestStrategyByExperimentId`的API调用
- 检查请求参数是否正确：`experimentId=xxx&namespace=default`

### 2. 控制台日志检查
- 查看是否有"Loading load test strategies for experimentId"日志
- 查看是否有"Loaded load test strategies"日志
- 检查返回的数据结构

### 3. 页面显示检查
- 在"配置"tab下查看"Load Test Strategy"部分
- 应该显示策略数量：`(Count: X)`
- 如果有策略，应该显示详细的策略卡片
- 如果没有策略，应该显示"No load test strategies configured"

## API接口说明

**接口**: `GET /api/chaos/GetLoadTestStrategyByExperimentId`

**参数**: 
- `experimentId`: 实验ID
- `namespace`: 命名空间（默认为"default"）

**示例调用**:
```
GET http://localhost:8082/api/chaos/GetLoadTestStrategyByExperimentId?experimentId=1958598136545050625&namespace=default
```

**期望响应**:
```json
{
  "success": true,
  "Data": [
    {
      "id": "strategy_id",
      "enable": true,
      "definitionId": "definition_id",
      "experimentId": "1958598136545050625",
      "startBeforeFaultSec": 300,
      "trafficDurationSec": 600,
      "abortOnLoadFailure": true,
      "namespace": "default",
      "createdAt": "2023-12-01T10:00:00Z"
    }
  ]
}
```

## 故障排除

### 如果仍然看不到压测策略：

1. **检查API响应**: 确认接口返回了正确的数据
2. **检查实验ID**: 确认使用的是正确的experimentId
3. **检查命名空间**: 确认namespace参数正确
4. **检查控制台错误**: 查看是否有JavaScript错误
5. **检查网络请求**: 确认API请求成功发送并返回

### 常见问题：

1. **404错误**: 可能是实验没有配置压测策略
2. **参数错误**: 检查experimentId和namespace参数
3. **权限问题**: 确认用户有查看压测策略的权限
4. **数据格式问题**: 检查API返回的数据格式是否符合预期

## 后续优化建议

1. 添加压测策略的编辑功能
2. 显示压测定义的详细信息（通过definitionId关联）
3. 添加压测策略的启用/禁用切换功能
4. 支持压测策略的删除操作
5. 添加压测策略执行历史的查看功能
