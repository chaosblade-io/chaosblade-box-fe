# 压测策略集成文档

## 概述

本文档描述了在创建实验时集成压测策略的完整实现，包括获取压测定义列表和创建压测策略的功能。

## 新增功能

### 1. 获取所有压测定义
- **接口**: `POST /chaos/ListAllLoadTestDefinitions`
- **功能**: 在实验创建页面加载所有可用的压测定义
- **集成位置**: 实验编辑器第二步（StepTwo组件）

### 2. 创建压测策略
- **接口**: `POST /chaos/CreateLoadTestStrategy`
- **功能**: 在实验创建成功后，为选中的压测定义创建对应的压测策略
- **触发时机**: 实验创建成功的回调中

## 实现细节

### 1. 数据流程

#### 实验创建流程
1. 用户在实验编辑器第二步选择压测定义
2. 配置压测时序参数（提前启动时间、持续时间）
3. 提交创建实验
4. 实验创建成功后，自动为每个选中的压测定义创建压测策略

#### 压测策略参数映射
```typescript
{
  enable: true,                           // 默认启用
  definitionId: "选中的压测定义ID",
  experimentId: "创建成功的实验ID",
  startBeforeFaultSec: "提前启动时间（秒）",
  trafficDurationSec: "压测持续时间（秒）",
  abortOnLoadFailure: true,               // 默认在压测失败时中止
  namespace: "default"                    // 命名空间
}
```

### 2. 时间单位转换

前端配置支持分钟和秒两种单位，后端API需要秒为单位：

```typescript
// 提前启动时间转换
const preStartTimeSec = config.preStartUnit === 'minute' 
  ? config.preStartTime * 60 
  : config.preStartTime;

// 持续时间转换
const durationSec = config.durationUnit === 'minute' 
  ? config.duration * 60 
  : config.duration;
```

### 3. 批量创建策略

为每个选中的压测定义创建独立的策略：

```typescript
const promises = config.selectedDefinitions.map((definitionId: string) => {
  return dispatch.loadTestDefinition.createLoadTestStrategy({
    enable: true,
    definitionId,
    experimentId,
    startBeforeFaultSec: preStartTimeSec,
    trafficDurationSec: durationSec,
    abortOnLoadFailure: true,
  });
});

await Promise.all(promises);
```

## 用户界面更新

### 1. 压测定义选择
- 使用真实的压测定义数据替换模拟数据
- 显示格式：`定义名称 (入口类型 - 引擎类型)`
- 支持多选

### 2. 选中定义预览
- 显示已选择的压测定义列表
- 包含定义名称和元信息

### 3. 时序配置
- 提前启动时间：0-60分钟或秒
- 持续时间：1-120分钟或秒
- 时间线可视化预览

## 测试用例

### 1. 正常创建流程测试

**测试步骤**:
1. 创建新实验，进入第二步配置
2. 选择一个或多个压测定义
3. 配置提前启动时间和持续时间
4. 填写其他必要信息，提交创建实验
5. 验证实验创建成功
6. 验证压测策略创建成功

**预期结果**:
- 实验创建成功，返回experimentId
- 为每个选中的压测定义创建对应的压测策略
- 策略参数正确映射

### 2. 无压测配置创建测试

**测试步骤**:
1. 创建新实验，不选择任何压测定义
2. 提交创建实验

**预期结果**:
- 实验创建成功
- 不创建任何压测策略

### 3. 时间单位转换测试

**测试步骤**:
1. 配置提前启动时间为5分钟
2. 配置持续时间为10分钟
3. 创建实验

**预期结果**:
- startBeforeFaultSec = 300（5 * 60）
- trafficDurationSec = 600（10 * 60）

### 4. 错误处理测试

**测试步骤**:
1. 模拟压测策略创建失败
2. 验证错误处理

**预期结果**:
- 显示错误提示："创建压测策略失败"
- 实验仍然创建成功

## API请求示例

### 1. 获取压测定义列表

**请求**:
```
POST /chaos/ListAllLoadTestDefinitions
Content-Type: application/json

{
  "namespace": "default",
  "Lang": "zh"
}
```

**响应**:
```json
{
  "success": true,
  "result": [
    {
      "id": "ldef_01H...",
      "name": "示例压测定义",
      "engineType": "JMETER",
      "endpoint": "http://example.com",
      "entry": "URL",
      "urlCase": {
        "method": "GET",
        "path": "/api/test",
        "headers": {}
      },
      "createdAt": "2023-12-01T10:00:00+08:00"
    }
  ]
}
```

### 2. 创建压测策略

**请求**:
```
POST /chaos/CreateLoadTestStrategy
Content-Type: application/json

{
  "enable": true,
  "definitionId": "ldef_01H...",
  "experimentId": "1957308844015296513",
  "startBeforeFaultSec": 300,
  "trafficDurationSec": 600,
  "abortOnLoadFailure": true,
  "namespace": "default",
  "Lang": "zh"
}
```

**响应**:
```json
{
  "success": true,
  "result": "lstrategy_d71dcdebcaa04781a9d6ed3b2c72fb6f"
}
```

## 文件修改清单

### 1. 类型定义
- `src/config/interfaces/Chaos/experimentTask.ts`
  - 添加 `ILoadTestStrategy` 接口
  - 添加 `ICreateLoadTestStrategyReq` 接口

### 2. 数据模型
- `src/models/Chaos/loadTestDefinition.ts`
  - 添加压测策略相关状态
  - 添加 `createLoadTestStrategy` effect
  - 添加策略相关的reducer方法

### 3. 实验编辑器
- `src/pages/Chaos/Experiment/ExperimentEditor/StepTwo/index.tsx`
  - 集成压测定义列表加载
  - 更新压测定义选择UI
  - 添加压测策略创建逻辑
  - 修改实验创建回调

### 4. 国际化
- `src/locals/En/en.json` - 英文翻译
- `src/locals/Zh/zh.json` - 中文翻译

## 注意事项

1. **时序关系**: 压测策略必须在实验创建成功后创建，因为需要experimentId
2. **错误处理**: 压测策略创建失败不应影响实验创建的成功状态
3. **批量操作**: 多个压测定义会创建多个独立的策略
4. **参数验证**: 前端已有时间参数的验证逻辑
5. **向后兼容**: 不选择压测定义的实验创建流程保持不变

## 后续扩展

1. **策略管理**: 可以添加压测策略的查询、编辑、删除功能
2. **策略模板**: 支持保存和复用压测策略配置
3. **高级配置**: 支持更多压测策略参数配置
4. **状态监控**: 实时监控压测策略的执行状态
