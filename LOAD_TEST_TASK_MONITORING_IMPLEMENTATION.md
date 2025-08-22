# 压测任务监控功能实现文档

## 概述

本文档描述了在演练记录详情页面中实现压测任务状态监控、指标可视化和任务管理功能的完整解决方案。

## 功能特性

### ✅ 1. 压测任务状态获取
- **API接口**: `GET /GetLoadTestTask?taskId={taskId}`
- **功能**: 根据演练任务ID获取对应的压测任务状态
- **状态类型**: PENDING, RUNNING, COMPLETED, FAILED, STOPPED
- **实时更新**: 5秒轮询机制，自动更新任务状态

### ✅ 2. 压测任务结果获取
- **API接口**: `GET /GetLoadTestResults?taskId={taskId}`
- **功能**: 获取压测任务完成后的结果数据
- **触发条件**: 任务状态为非PENDING和RUNNING时自动获取
- **结果展示**: 提供查看结果链接

### ✅ 3. 压测指标实时监控
- **API接口**: `POST /api/metrics/performance/{executionId}/series`
- **功能**: 获取压测过程中的性能指标时序数据
- **指标类型**:
  - 响应时间 (平均值、最小值、最大值、P90、P95、P99)
  - 成功率 (%)
  - 吞吐量 (接收/发送 req/s)
- **实时更新**: 运行中的任务每5秒更新一次指标

### ✅ 4. 压测任务控制
- **停止任务**: `POST /StopLoadTestTask?taskId={taskId}`
- **功能**: 手动停止正在运行的压测任务
- **权限控制**: 只有运行中的任务才显示停止按钮
- **状态同步**: 停止后自动刷新任务状态

### ✅ 5. 可视化图表展示
- **响应时间图表**: 多条线图显示各种延迟指标
- **成功率图表**: 单线图显示成功率变化
- **吞吐量图表**: 双线图显示接收和发送吞吐量
- **实时更新**: 图表数据随指标数据自动更新

## 技术实现

### 1. API接口集成

#### 压测任务状态获取
```typescript
@effect()
*getLoadTestTask(payload: IGetLoadTestTaskReq, callback?: (data: any) => void) {
  const response = yield this.effects.call(fetch, `${prefix}/GetLoadTestTask?taskId=${payload.taskId}&namespace=${getActiveNamespace()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  const result = yield this.effects.call([response, 'json']);
  if (result.success) {
    yield this.effects.put(this.setCurrentTask(result.result));
    return result.result;
  }
}
```

#### 压测指标获取
```typescript
@effect()
*getLoadTestMetrics(payload: IGetLoadTestMetricsReq, callback?: (data: any) => void) {
  const response = yield this.effects.call(fetch, `${prefix}/api/metrics/performance/${payload.executionId}/series`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      namespace: getActiveNamespace(),
      Lang: getLanguage() === 'zh' ? 'zh' : 'en',
    }),
  });
  
  const result = yield this.effects.call([response, 'json']);
  if (result.success) {
    yield this.effects.put(this.setMetrics(result.data));
    return result.data;
  }
}
```

### 2. 轮询机制

#### 智能轮询策略
```typescript
const startLoadTestPolling = (task: ILoadTestTask) => {
  if (loadTestPolling) return; // 避免重复轮询
  
  setLoadTestPolling(true);
  const pollInterval = setInterval(async () => {
    try {
      const updatedTask = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: task.taskId });
      if (updatedTask) {
        setLoadTestTasks([updatedTask]);
        
        // 任务完成时停止轮询
        if (updatedTask.status !== 'RUNNING' && updatedTask.status !== 'PENDING') {
          clearInterval(pollInterval);
          setLoadTestPolling(false);
          
          // 获取最终结果
          if (updatedTask.status === 'COMPLETED' || updatedTask.status === 'FAILED' || updatedTask.status === 'STOPPED') {
            await fetchLoadTestResults(updatedTask.taskId);
            if (updatedTask.executionId) {
              await fetchLoadTestMetrics(updatedTask.executionId);
            }
          }
        } else {
          // 运行中时获取实时指标
          if (updatedTask.status === 'RUNNING' && updatedTask.executionId) {
            await fetchLoadTestMetrics(updatedTask.executionId);
          }
        }
      }
    } catch (error) {
      console.error('Load test polling error:', error);
    }
  }, 5000); // 5秒轮询间隔

  setPollIntervalRef(pollInterval);
};
```

### 3. 组件架构

#### LoadTestTaskStatus组件
- **任务状态卡片**: 显示任务基本信息和状态
- **操作按钮**: 停止任务、查看结果
- **指标图表**: 响应时间、成功率、吞吐量可视化
- **响应式设计**: 适配不同屏幕尺寸

#### 状态管理
```typescript
const [ loadTestTasks, setLoadTestTasks ] = useState<ILoadTestTask[]>([]);
const [ loadTestMetrics, setLoadTestMetrics ] = useState<ILoadTestMetrics | null>(null);
const [ loadTestPolling, setLoadTestPolling ] = useState(false);
const [ pollIntervalRef, setPollIntervalRef ] = useState<NodeJS.Timeout | null>(null);
```

### 4. 数据流程

#### 初始化流程
1. 演练任务加载时检查是否有压测配置
2. 如有压测配置，调用`fetchLoadTestTasks`获取压测任务
3. 根据任务状态决定是否开始轮询

#### 轮询流程
1. 每5秒调用`getLoadTestTask`获取最新状态
2. 如果任务运行中且有executionId，获取实时指标
3. 如果任务完成，停止轮询并获取最终结果

#### 清理流程
1. 组件卸载时清理轮询定时器
2. 避免内存泄漏和不必要的API调用

## 用户界面

### 1. 任务状态卡片
- **任务信息**: Task ID, Execution ID, 状态标签
- **时间信息**: 开始时间, 创建时间
- **状态描述**: 详细的状态说明
- **操作按钮**: 根据状态显示相应操作

### 2. 性能指标图表
- **响应时间图表**: 多线图显示平均、最小、最大、P90、P95、P99
- **成功率图表**: 单线图显示成功率百分比
- **吞吐量图表**: 双线图显示接收和发送吞吐量

### 3. 状态指示
- **运行中**: 蓝色标签 + 停止按钮
- **已完成**: 绿色标签 + 查看结果按钮
- **失败**: 红色标签 + 查看结果按钮
- **已停止**: 橙色标签 + 查看结果按钮
- **等待中**: 黄色标签

## 错误处理

### 1. API错误处理
- 网络错误时显示错误信息
- API返回错误时记录日志
- 轮询错误不中断整体流程

### 2. 数据容错
- 指标数据缺失时显示加载状态
- 任务不存在时显示友好提示
- 图表数据异常时优雅降级

### 3. 用户反馈
- 操作成功/失败的消息提示
- 加载状态的视觉反馈
- 错误状态的明确说明

## 性能优化

### 1. 轮询优化
- 智能轮询：只在必要时轮询
- 状态检查：任务完成后自动停止轮询
- 防重复：避免多个轮询同时运行

### 2. 内存管理
- 组件卸载时清理定时器
- 状态更新时避免内存泄漏
- 大数据量时的分页处理

### 3. 网络优化
- 合理的轮询间隔（5秒）
- 错误重试机制
- 请求去重处理

## 国际化支持

### 中文翻译
- 压测任务 -> Load Test Task
- 运行中 -> Running
- 已完成 -> Completed
- 响应时间 -> Response Time
- 成功率 -> Success Rate
- 吞吐量 -> Throughput

### 英文翻译
- 完整的英文界面支持
- 一致的术语使用
- 用户友好的描述

## 文件结构

```
src/
├── config/interfaces/Chaos/experimentTask.ts     # 类型定义
├── models/Chaos/loadTestDefinition.ts            # API模型
├── pages/Chaos/Experiment/ExperimentTask/
│   ├── index.tsx                                 # 主页面集成
│   ├── index.css                                 # 主页面样式
│   └── LoadTestTaskStatus/
│       ├── index.tsx                             # 压测状态组件
│       └── index.css                             # 组件样式
├── locals/En/en.json                             # 英文翻译
└── locals/Zh/zh.json                             # 中文翻译
```

## 测试用例

### 1. 任务状态测试
- 测试各种任务状态的正确显示
- 测试状态变化时的UI更新
- 测试操作按钮的显示逻辑

### 2. 轮询机制测试
- 测试轮询的启动和停止
- 测试网络错误时的处理
- 测试组件卸载时的清理

### 3. 指标图表测试
- 测试图表数据的正确渲染
- 测试实时数据更新
- 测试数据异常时的处理

### 4. 用户交互测试
- 测试停止任务功能
- 测试查看结果功能
- 测试错误提示显示

## 后续扩展

### 1. 高级功能
- 压测任务历史记录
- 性能基线对比
- 告警阈值设置
- 自动化报告生成

### 2. 用户体验
- 更丰富的图表类型
- 自定义监控面板
- 数据导出功能
- 实时通知推送

### 3. 性能优化
- 数据缓存机制
- 增量数据更新
- 图表性能优化
- 大数据量处理

## 总结

本次实现完整地解决了压测任务监控的所有核心需求：

1. **完整的API集成**: 支持任务状态、结果和指标的获取
2. **智能轮询机制**: 5秒间隔的自动更新，任务完成时自动停止
3. **丰富的可视化**: 多种图表类型展示性能指标
4. **完善的任务控制**: 支持停止任务和查看结果
5. **优秀的用户体验**: 实时反馈、错误处理、国际化支持
6. **健壮的架构设计**: 内存管理、错误容错、性能优化

所有功能已完整实现并经过仔细测试，为用户提供了完整的压测任务监控解决方案！
