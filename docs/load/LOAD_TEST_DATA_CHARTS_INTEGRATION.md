# LoadTestDataCharts组件真实API集成

## 概述

已将LoadTestDataCharts组件从使用模拟数据改为集成真实的压测API，实现了完整的压测任务状态监控和交互功能。

## 主要修改

### 1. ✅ 添加真实API集成

**新增状态管理**:
```typescript
const [ realMetrics, setRealMetrics ] = useState<ILoadTestMetrics | null>(null);
const [ loadTestTasks, setLoadTestTasks ] = useState<ILoadTestTask[]>([]);
const [ pollingInterval, setPollingInterval ] = useState<NodeJS.Timeout | null>(null);
```

**新增API调用函数**:
- `fetchLoadTestTasks()` - 获取压测任务状态
- `fetchLoadTestMetrics(executionId)` - 获取压测指标数据
- `startPolling(task)` - 开始轮询任务状态
- `stopPolling()` - 停止轮询
- `convertRealMetricsToChartData()` - 转换真实数据为图表格式

### 2. ✅ 压测任务状态监控

**实时状态更新**:
- 5秒轮询获取任务状态
- 自动映射任务状态到UI状态
- 实时获取压测指标数据

**状态映射**:
```typescript
const mapTaskStatusToLoadTestStatus = (status: string) => {
  switch (status) {
    case 'RUNNING': return 'running';
    case 'PENDING': return 'preparing';
    case 'COMPLETED':
    case 'STOPPED': return 'stopped';
    case 'FAILED': return 'failed';
    default: return 'stopped';
  }
};
```

### 3. ✅ 压测交互操作

**停止压测功能**:
```typescript
async function handleStopLoadTest() {
  await dispatch.loadTestDefinition.stopLoadTestTask({ taskId });
  Message.success(i18n.t('Load test task stopped successfully').toString());
  // 更新状态和重新获取任务信息
}
```

**启动压测说明**:
- 压测通常通过实验执行触发，不能直接启动
- 提供了重启实验的提示和按钮（已禁用）

### 4. ✅ 状态显示优化

**无压测任务状态**:
```typescript
if (loadTestTasks.length === 0) {
  return (
    <Tag color="default">
      <Translation>No Load Test</Translation>
    </Tag>
  );
}
```

**真实任务信息显示**:
- Task ID 和 Execution ID
- 任务开始时间和持续时间
- 任务状态描述
- 创建时间等详细信息

### 5. ✅ 数据转换和兼容性

**真实数据转换**:
```typescript
const convertRealMetricsToChartData = (realMetrics: ILoadTestMetrics): LoadTestMetrics => {
  return {
    latency: {
      avg: realMetrics.avgLatency?.map(([, value]) => value) || [],
      min: realMetrics.minLatency?.map(([, value]) => value) || [],
      max: realMetrics.maxLatency?.map(([, value]) => value) || [],
      p90: realMetrics.p90?.map(([, value]) => value) || [],
      p95: realMetrics.p95?.map(([, value]) => value) || [],
      p99: realMetrics.p99?.map(([, value]) => value) || [],
    },
    successRate: realMetrics.successRate?.map(([, value]) => value) || [],
    throughput: {
      received: realMetrics.throughputReceived?.map(([, value]) => value) || [],
      sent: realMetrics.throughputSent?.map(([, value]) => value) || [],
    },
    timestamps: realMetrics.avgLatency?.map(([timestamp]) => timestamp) || [],
  };
};
```

**向后兼容**:
- 当没有真实数据时，自动使用模拟数据
- 保持原有的图表展示功能
- 错误处理和降级机制

## 功能特性

### ✅ 实时监控
- 自动轮询压测任务状态（5秒间隔）
- 实时获取和显示压测指标
- 任务完成时自动停止轮询

### ✅ 交互操作
- 停止正在运行的压测任务
- 确认对话框显示任务详细信息
- 错误处理和用户反馈

### ✅ 状态管理
- 完整的任务生命周期状态跟踪
- 智能状态映射和显示
- 轮询资源管理和清理

### ✅ 数据可视化
- 支持真实压测指标数据
- 自动数据格式转换
- 保持原有图表功能

## API集成

### 使用的API接口
1. `dispatch.loadTestDefinition.getLoadTestTask({ taskId })` - 获取任务状态
2. `dispatch.loadTestDefinition.getLoadTestMetrics({ executionId })` - 获取指标数据
3. `dispatch.loadTestDefinition.stopLoadTestTask({ taskId })` - 停止任务
4. `dispatch.loadTestDefinition.listAllLoadTestDefinitions({})` - 获取定义列表

### 数据流程
1. 组件加载时获取压测任务状态
2. 如果任务运行中，开始轮询状态
3. 获取executionId后，获取指标数据
4. 转换数据格式并更新图表
5. 任务完成时停止轮询

## 使用方式

组件接收`taskId`参数（实验任务ID），自动：
1. 获取对应的压测任务状态
2. 显示任务信息和控制按钮
3. 实时更新指标数据和图表
4. 提供停止任务的交互功能

## 注意事项

1. **任务ID映射**: 使用实验任务ID（experimentTaskId）作为压测任务的taskId
2. **轮询管理**: 组件卸载时自动清理轮询定时器
3. **错误处理**: 404错误被视为正常情况（无压测任务）
4. **数据兼容**: 支持真实数据和模拟数据的无缝切换
5. **用户体验**: 提供清晰的状态指示和操作反馈

## 后续优化建议

1. 可以添加更多的压测配置选项
2. 支持压测任务的重新配置
3. 添加更详细的错误信息显示
4. 支持压测结果的导出功能
