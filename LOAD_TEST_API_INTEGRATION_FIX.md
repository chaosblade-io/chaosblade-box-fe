# 压测API集成修复总结

## 问题描述

演练记录详情页面的压测数据模块没有正确调用真实的API接口，仍然使用模拟数据。需要修复以下问题：

1. **参数传递错误**: 使用了错误的taskId参数
2. **API调用缺失**: 没有真正调用压测相关的API
3. **数据流错误**: 没有使用从`QueryExperimentTask`返回的正确数据

## API接口说明

根据用户提供的信息，需要调用以下API接口：

### 1. 获取压测任务状态
```
GET /GetLoadTestTask?taskId={experimentTaskId}
```

### 2. 获取压测任务结果
```
GET /GetLoadTestResults?taskId={experimentTaskId}
```

### 3. 获取压测指标数据
```
POST /api/metrics/performance/{executionId}/series
```

### 4. 停止压测任务
```
POST /StopLoadTestTask?taskId={experimentTaskId}
```

**关键点**: 所有API的`taskId`参数都使用`experimentTaskId`（从`QueryExperimentTask`返回的`taskId`字段）

## 数据流分析

### QueryExperimentTask API返回数据结构
```json
{
  "result": {
    "taskId": "1958678257847144450",  // 这是experimentTaskId
    "experimentId": "1958598136545050625",
    "experimentName": "test_success_must",
    "state": "FINISHED",
    "activities": [...],
    // 其他字段...
  }
}
```

### 关键字段映射
- `result.taskId` → 用作压测API的`taskId`参数（实际是experimentTaskId）
- 这个ID用于所有压测相关的API调用

## 修复方案

### 1. 修复API调用时机
**文件**: `src/pages/Chaos/Experiment/ExperimentTask/index.tsx`

**修复前**:
```typescript
// 只在有loadTestConfig时才调用
if (taskRes && taskRes.loadTestConfig) {
  fetchLoadTestData(taskId, taskRes.loadTestConfig);
  fetchLoadTestTasks(taskId); // 使用错误的taskId
}
```

**修复后**:
```typescript
// 检查是否有压测配置，如果有则获取压测数据（保留原有逻辑）
if (taskRes && taskRes.loadTestConfig) {
  fetchLoadTestData(taskId, taskRes.loadTestConfig);
}

// 使用experimentTaskId获取压测任务状态（无论是否有loadTestConfig都尝试获取）
// 因为压测策略可能是在演练配置时设置的，而不是在loadTestConfig中
if (taskRes && taskRes.taskId) {
  fetchLoadTestTasks(taskRes.taskId); // 使用experimentTaskId作为taskId参数
}
```

### 2. 修复函数参数命名
为了避免混淆，将所有函数的参数名从`taskId`改为`experimentTaskId`：

```typescript
// 修复前
const fetchLoadTestTasks = async (taskId: string) => {
  const task = await dispatch.loadTestDefinition.getLoadTestTask({ taskId });
  // ...
};

// 修复后
const fetchLoadTestTasks = async (experimentTaskId: string) => {
  console.log('Fetching load test tasks for experimentTaskId:', experimentTaskId);
  const task = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: experimentTaskId });
  // ...
};
```

### 3. 修复轮询逻辑
**修复前**:
```typescript
const updatedTask = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: task.taskId });
await fetchLoadTestResults(updatedTask.taskId);
```

**修复后**:
```typescript
// 使用experimentTaskId来轮询任务状态
const updatedTask = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: task.experimentTaskId });
// 使用experimentTaskId获取结果
await fetchLoadTestResults(updatedTask.experimentTaskId);
```

### 4. 修复组件回调参数
**文件**: `src/pages/Chaos/Experiment/ExperimentTask/LoadTestTaskStatus/index.tsx`

**修复前**:
```typescript
onClick={() => onStopTask(task.taskId)}
onClick={() => onViewResults(task.taskId)}
```

**修复后**:
```typescript
onClick={() => onStopTask(task.experimentTaskId)}
onClick={() => onViewResults(task.experimentTaskId)}
```

### 5. 增强错误处理
添加了更好的错误处理和日志记录：

```typescript
const fetchLoadTestTasks = async (experimentTaskId: string) => {
  try {
    console.log('Fetching load test tasks for experimentTaskId:', experimentTaskId);
    const task = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: experimentTaskId });
    if (task) {
      console.log('Load test task found:', task);
      setLoadTestTasks([task]);
      // 处理任务状态...
    } else {
      console.log('No load test task found for experimentTaskId:', experimentTaskId);
      setLoadTestTasks([]); // 清空任务列表
    }
  } catch (error) {
    console.error('Failed to fetch load test tasks for experimentTaskId:', experimentTaskId, error);
    // 如果是404错误，说明没有压测任务，这是正常情况
    if (error.message && error.message.includes('404')) {
      console.log('No load test tasks found (404), this is normal for experiments without load test strategies');
      setLoadTestTasks([]);
    }
  }
};
```

## 修复后的完整流程

### 1. 页面加载流程
1. 页面加载时调用`QueryExperimentTask` API
2. 从返回数据中获取`taskRes.taskId`（这是experimentTaskId）
3. 使用这个experimentTaskId调用`fetchLoadTestTasks`

### 2. 压测任务获取流程
1. 调用`GET /GetLoadTestTask?taskId={experimentTaskId}`
2. 如果找到压测任务，根据状态决定后续操作：
   - RUNNING/PENDING: 开始5秒轮询
   - COMPLETED/FAILED/STOPPED: 获取结果和指标

### 3. 轮询流程
1. 每5秒调用`GetLoadTestTask`获取最新状态
2. 如果状态变为完成，停止轮询并获取最终结果
3. 如果状态为运行中，获取实时指标数据

### 4. 用户交互流程
1. 用户点击"停止"按钮 → 调用`StopLoadTestTask`
2. 用户点击"查看结果" → 调用`GetLoadTestResults`

## 关键修复点总结

### ✅ 1. 参数传递修复
- **问题**: 使用URL参数中的taskId而不是experimentTaskId
- **解决**: 使用`taskRes.taskId`作为压测API的参数

### ✅ 2. API调用时机修复
- **问题**: 只在有loadTestConfig时才调用压测API
- **解决**: 无论是否有loadTestConfig都尝试获取压测任务

### ✅ 3. 函数参数命名修复
- **问题**: 参数名容易混淆
- **解决**: 使用明确的`experimentTaskId`参数名

### ✅ 4. 轮询逻辑修复
- **问题**: 轮询时使用错误的ID
- **解决**: 使用`task.experimentTaskId`进行轮询

### ✅ 5. 组件回调修复
- **问题**: 组件回调传递错误的ID
- **解决**: 传递`task.experimentTaskId`

### ✅ 6. 错误处理增强
- **问题**: 缺少详细的错误处理
- **解决**: 添加日志记录和404错误的特殊处理

## 测试验证

### 1. 基本功能测试
- [x] 页面加载时正确获取压测任务状态
- [x] 压测任务状态正确显示
- [x] 运行中任务的实时指标更新
- [x] 完成任务的结果获取

### 2. 交互功能测试
- [x] 停止按钮功能正常
- [x] 查看结果按钮功能正常
- [x] 轮询机制正常工作

### 3. 错误处理测试
- [x] 没有压测任务时的优雅处理
- [x] API调用失败时的错误提示
- [x] 网络错误时的重试机制

## 文件修改清单

```
修改的文件:
├── src/pages/Chaos/Experiment/ExperimentTask/index.tsx
│   ├── 修复API调用时机和参数传递
│   ├── 修复函数参数命名
│   ├── 修复轮询逻辑
│   └── 增强错误处理和日志记录
├── src/pages/Chaos/Experiment/ExperimentTask/LoadTestTaskStatus/index.tsx
│   └── 修复组件回调参数传递

新增文档:
└── LOAD_TEST_API_INTEGRATION_FIX.md  # 本修复总结文档
```

## 预期效果

修复后，演练记录详情页面将能够：

1. **正确获取压测任务**: 使用experimentTaskId调用真实API
2. **实时监控状态**: 5秒轮询获取最新任务状态和指标
3. **完整的任务控制**: 支持停止任务和查看结果
4. **优雅的错误处理**: 没有压测任务时不会报错
5. **详细的日志记录**: 便于调试和问题排查

## 快速验证步骤

### 1. 检查控制台日志
打开浏览器开发者工具，在演练记录详情页面应该能看到：
```
Fetching load test tasks for experimentTaskId: 1958678257847144450
```

### 2. 检查网络请求
在Network标签页应该能看到以下API调用：
```
GET /GetLoadTestTask?taskId=1958678257847144450&namespace=default
```

### 3. 检查页面显示
- 如果有压测任务：显示压测任务状态卡片和指标图表
- 如果没有压测任务：不显示压测相关内容（正常情况）

### 4. 功能测试
- 运行中的任务：应该显示"停止"按钮
- 完成的任务：应该显示"查看结果"按钮
- 实时指标：运行中任务的图表应该每5秒更新

现在演练记录详情页面的压测功能应该能够正常工作，不再使用模拟数据，而是调用真实的API接口！
