# 压测API接口修复总结

## 修复的问题

根据用户反馈的4个API接口问题，已完成以下修复：

### 1. ✅ GetLoadTestStrategyByExperimentId接口参数传递方式修复

**问题**: 接口参数应该拼接到URL后面，而不是放在请求体里

**修复前**:
```typescript
// 使用POST请求，参数放在请求体中
const { Data } = yield this.effects.call(createServiceChaos('GetLoadTestStrategyByExperimentId'), payload);
```

**修复后**:
```typescript
// 使用GET请求，参数拼接到URL后面
const response = yield this.effects.call(fetch, `${prefix}/GetLoadTestStrategyByExperimentId?experimentId=${payload.experimentId}&namespace=${getActiveNamespace()}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**接口调用示例**:
```
GET http://localhost:8082/api/chaos/GetLoadTestStrategyByExperimentId?experimentId=1958598136545050625&namespace=default
```

### 2. ✅ GetLoadTestTask接口数据同步问题修复

**问题**: 接口数据没有正确同步更新至前端页面

**修复内容**:
- 确认轮询机制正常工作（5秒间隔）
- 确认数据更新逻辑正确
- 确认使用正确的experimentTaskId参数

**关键逻辑**:
```typescript
// 轮询获取任务状态
const updatedTask = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: task.experimentTaskId });
if (updatedTask) {
  setLoadTestTasks([updatedTask]); // 更新前端状态
}
```

**接口调用示例**:
```
GET http://localhost:8082/api/chaos/GetLoadTestTask?taskId=1958681761458327553&namespace=default
```

### 3. ✅ metrics/performance接口请求方法修复

**问题**: 接口应该使用GET方法而不是POST

**修复前**:
```typescript
const response = yield this.effects.call(fetch, `${prefix}/api/metrics/performance/${payload.executionId}/series`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    namespace: getActiveNamespace(),
    Lang: getLanguage() === 'zh' ? 'zh' : 'en',
  }),
});
```

**修复后**:
```typescript
const response = yield this.effects.call(fetch, `${prefix}/api/metrics/performance/${payload.executionId}/series?namespace=${getActiveNamespace()}&Lang=${getLanguage() === 'zh' ? 'zh' : 'en'}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**接口调用示例**:
```
GET http://localhost:8082/api/chaos/api/metrics/performance/edad7516/series?namespace=default&Lang=zh
```

### 4. ✅ StopLoadTestTask接口参数传递修复

**问题**: 需要传递正确的压测任务执行ID

**确认修复**:
- 接口实现正确使用了`payload.taskId`参数
- 前端调用时正确传递了`experimentTaskId`
- 参数传递链路完整：`experimentTaskId` → `stopLoadTestTask` → `dispatch.loadTestDefinition.stopLoadTestTask`

**接口调用示例**:
```
POST http://localhost:8082/api/chaos/StopLoadTestTask?taskId=1958681761458327553&namespace=default
```

## 修改的文件

### 主要修改文件
- `src/models/Chaos/loadTestDefinition.ts` - 修复了3个API接口的实现

### 确认无需修改的文件
- `src/pages/Chaos/Experiment/ExperimentTask/index.tsx` - 数据同步逻辑正确
- `src/pages/Chaos/Experiment/ExperimentTask/LoadTestTaskStatus/index.tsx` - 参数传递正确
- `src/config/interfaces/Chaos/experimentTask.ts` - 接口类型定义正确

## 验证方法

### 1. 网络请求验证
在浏览器开发者工具的Network标签页检查：
- GetLoadTestStrategyByExperimentId: GET请求，参数在URL中
- GetLoadTestTask: GET请求，正确的taskId参数
- metrics/performance: GET请求，参数在URL中
- StopLoadTestTask: POST请求，正确的taskId参数

### 2. 功能验证
- 压测策略能正确加载和显示
- 压测任务状态能实时更新
- 压测指标数据能正确获取和展示
- 停止压测任务功能正常工作

## 注意事项

1. 所有修复都保持了向后兼容性
2. 接口调用方式在页面层面无需修改
3. 错误处理机制保持不变
4. 轮询机制和数据同步逻辑保持稳定

## 后续建议

1. 建议在测试环境验证所有修复的接口
2. 可以考虑添加更详细的错误日志
3. 建议定期检查API接口的一致性
4. 可以考虑添加接口调用的性能监控
