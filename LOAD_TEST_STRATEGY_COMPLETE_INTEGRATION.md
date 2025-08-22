# 压测策略完整集成实现文档

## 概述

本文档描述了压测策略集成中所有关键问题的完整解决方案，包括演练配置、演练详情、编辑回显和删除功能的实现。

## 已解决的问题

### ✅ 问题1：演练配置页面压测策略创建
**位置**: 实验编辑器第二步（StepTwo组件）
**解决方案**:
- 在演练更新成功后获取experimentId
- 正确处理时间单位转换（分钟 × 60 = 秒）
- 调用创建压测策略接口

**实现细节**:
```typescript
// 演练更新成功后的回调
await dispatch.experimentEditor.updateExperiment({ ...convertFilter.convertFilterSubmit(flow as any) }, async () => {
  // 演练更新成功后，处理压测策略
  if (loadTestConfig.selectedDefinitions.length > 0 && props.experimentId) {
    await handleLoadTestStrategiesForUpdate(props.experimentId, loadTestConfig);
  }
  setUpdateVisible(true);
});
```

### ✅ 问题2：演练详情页面压测策略展示
**位置**: 演练详情页面（ExperimentDetail组件）
**解决方案**:
- 根据实验ID查询并展示对应的压测策略列表
- 在页面加载时自动获取压测策略
- 美观的UI展示策略信息

**实现细节**:
```typescript
// 加载压测策略
async function loadLoadTestStrategies(experimentId: string) {
  try {
    const strategies = await dispatch.loadTestDefinition.getLoadTestStrategyByExperimentId({
      experimentId,
    });
    setLoadTestStrategies(strategies || []);
  } catch (error) {
    console.error('Failed to load load test strategies:', error);
  }
}
```

### ✅ 问题3：编辑演练时的压测策略数据回显和更新
**位置**: 实验编辑器第二步（StepTwo组件）
**解决方案**:
- 编辑模式下自动加载现有压测策略
- 正确回显压测配置数据
- 智能处理时间单位转换（秒转分钟/秒）
- 在演练更新前先更新压测策略

**实现细节**:
```typescript
// 编辑模式下加载现有的压测策略
useEffect(() => {
  if (props.isEdit && props.experimentId) {
    loadExistingStrategies(props.experimentId);
  }
}, [props.isEdit, props.experimentId]);

// 回显压测配置
const selectedDefinitions = strategies.map((s: ILoadTestStrategy) => s.definitionId);
const firstStrategy = strategies[0];

// 智能时间单位转换
const preStartTime = firstStrategy.startBeforeFaultSec;
const duration = firstStrategy.trafficDurationSec;

const preStartUnit = preStartTime % 60 === 0 ? 'minute' : 'second';
const durationUnit = duration % 60 === 0 ? 'minute' : 'second';
```

### ✅ 问题4：删除压测策略功能
**位置**: 实验编辑器第二步（StepTwo组件）
**解决方案**:
- 当用户取消选择压测策略时，自动删除对应的策略
- 智能对比现有策略和选中策略
- 批量处理创建、更新、删除操作

**实现细节**:
```typescript
// 智能策略管理
const selectedDefinitionIds = new Set(config.selectedDefinitions);
const existingDefinitionIds = new Set(existingStrategies.map(s => s.definitionId));

// 需要删除的策略（现有的但未选中的）
const strategiesToDelete = existingStrategies.filter(s => !selectedDefinitionIds.has(s.definitionId));

// 需要创建的策略（选中的但不存在的）
const definitionsToCreate = config.selectedDefinitions.filter((id: string) => !existingDefinitionIds.has(id));

// 需要更新的策略（既存在又选中的）
const strategiesToUpdate = existingStrategies.filter(s => selectedDefinitionIds.has(s.definitionId));
```

## 新增API接口

### 1. 获取实验的压测策略
- **接口**: `POST /GetLoadTestStrategyByExperimentId`
- **参数**: `experimentId`, `namespace`
- **用途**: 演练详情页面展示和编辑回显

### 2. 更新压测策略
- **接口**: `POST /UpdateLoadTestStrategy`
- **参数**: `id`, `enable`, `startBeforeFaultSec`, `trafficDurationSec`, `abortOnLoadFailure`
- **用途**: 编辑演练时更新现有策略

### 3. 删除压测策略
- **接口**: `DELETE /DeleteLoadTestStrategy`
- **参数**: `id`, `namespace`
- **用途**: 取消选择压测定义时删除策略

## 核心功能特性

### 1. 智能时间单位处理
- **前端到后端**: 分钟 × 60 = 秒
- **后端到前端**: 能整除60的显示为分钟，否则显示秒
- **用户友好**: 自动选择最合适的时间单位

### 2. 策略生命周期管理
- **创建**: 新实验创建时批量创建策略
- **回显**: 编辑时自动加载和回显现有策略
- **更新**: 智能对比并更新策略
- **删除**: 取消选择时自动删除策略

### 3. 用户界面优化
- **演练配置**: 集成在实验编辑器中，无缝体验
- **演练详情**: 清晰展示策略信息和状态
- **错误处理**: 完善的错误提示和容错机制

## 测试用例

### 1. 创建演练测试
1. 创建新演练，选择压测定义
2. 配置时序参数，提交创建
3. 验证策略创建成功

### 2. 编辑演练测试
1. 编辑现有演练，验证策略回显
2. 修改压测配置，提交更新
3. 验证策略更新成功

### 3. 策略删除测试
1. 编辑演练，取消选择部分压测定义
2. 提交更新
3. 验证对应策略被删除

### 4. 演练详情测试
1. 访问演练详情页面
2. 验证压测策略正确展示
3. 检查策略信息的完整性

## 文件修改清单

### 1. 类型定义
- `src/config/interfaces/Chaos/experimentTask.ts`
  - 添加 `IGetLoadTestStrategyByExperimentIdReq`
  - 添加 `IUpdateLoadTestStrategyReq`
  - 添加 `IDeleteLoadTestStrategyReq`

### 2. 数据模型
- `src/models/Chaos/loadTestDefinition.ts`
  - 添加 `getLoadTestStrategyByExperimentId` effect
  - 添加 `updateLoadTestStrategy` effect
  - 添加 `deleteLoadTestStrategy` effect

### 3. 实验编辑器
- `src/pages/Chaos/Experiment/ExperimentEditor/StepTwo/index.tsx`
  - 添加现有策略状态管理
  - 实现策略回显逻辑
  - 实现智能策略更新逻辑

### 4. 演练详情
- `src/pages/Chaos/Experiment/ExperimentDetail/index.tsx`
  - 添加策略加载和展示
  - 实现策略信息渲染
- `src/pages/Chaos/Experiment/ExperimentDetail/index.css`
  - 添加策略展示样式

### 5. 国际化
- `src/locals/En/en.json` - 英文翻译
- `src/locals/Zh/zh.json` - 中文翻译

## 技术亮点

### 1. 智能策略管理
- 自动对比现有策略和选中策略
- 批量处理创建、更新、删除操作
- 避免不必要的API调用

### 2. 时间单位智能转换
- 前端友好的分钟/秒选择
- 后端统一的秒单位存储
- 回显时智能选择最佳单位

### 3. 完善的错误处理
- 策略操作失败不影响演练操作
- 详细的错误日志和用户提示
- 优雅的降级处理

### 4. 用户体验优化
- 无缝集成到现有流程
- 清晰的状态反馈
- 直观的信息展示

## 后续扩展建议

1. **策略模板**: 支持保存和复用压测策略配置
2. **批量操作**: 支持批量启用/禁用策略
3. **策略监控**: 实时监控策略执行状态
4. **高级配置**: 支持更多压测引擎参数
5. **策略历史**: 记录策略变更历史

## 总结

本次实现完整解决了压测策略集成中的所有关键问题，提供了从创建到删除的完整生命周期管理，确保了用户体验的一致性和功能的完整性。所有功能都经过精心设计，具有良好的扩展性和维护性。
