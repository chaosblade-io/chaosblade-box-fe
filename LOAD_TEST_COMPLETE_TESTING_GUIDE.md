# 压测功能完整测试指南

## 概述

本文档提供了压测功能的完整测试指南，包括所有页面的功能验证和API调用测试。

## 测试环境准备

### 1. 确保后端API可用
- 压测定义管理API
- 压测策略管理API  
- 压测任务监控API
- 压测指标获取API

### 2. 准备测试数据
- 至少一个压测定义
- 一个可用的演练实验
- 测试用的实验任务

## 功能测试清单

### 📋 1. 压测定义管理（基础功能）

#### 1.1 压测定义列表页面
**路径**: 应用高可用服务/故障演练/空间管理/压测定义

**测试步骤**:
1. 访问压测定义列表页面
2. 检查是否正确显示现有的压测定义
3. 测试搜索和筛选功能
4. 测试分页功能

**预期结果**:
- ✅ 正确显示压测定义列表
- ✅ 搜索和筛选功能正常
- ✅ 分页功能正常

#### 1.2 创建压测定义
**测试步骤**:
1. 点击"创建压测定义"按钮
2. 填写必要信息（名称、引擎类型、端点等）
3. 提交创建

**预期结果**:
- ✅ 创建成功并返回列表页面
- ✅ 新创建的定义出现在列表中

### 📋 2. 演练配置中的压测策略

#### 2.1 创建演练时配置压测策略
**路径**: 应用高可用服务/故障演练/空间管理/演练配置

**测试步骤**:
1. 创建新演练，进入第二步配置页面
2. 在压测策略区域选择压测定义
3. 配置时序参数（提前启动时间、持续时间）
4. 提交创建演练

**预期结果**:
- ✅ 压测定义列表正确加载
- ✅ 时序参数配置正常
- ✅ 演练创建成功
- ✅ 压测策略创建成功

**API调用验证**:
```bash
# 应该看到以下API调用
POST /api/chaos/CreateExperiment
POST /api/chaos/CreateLoadTestStrategy
```

#### 2.2 编辑演练时的压测策略回显
**测试步骤**:
1. 编辑已有压测策略的演练
2. 进入第二步配置页面
3. 检查压测策略是否正确回显

**预期结果**:
- ✅ 现有压测策略正确回显
- ✅ 时序参数正确显示
- ✅ 修改后保存成功

**API调用验证**:
```bash
# 应该看到以下API调用
POST /api/chaos/GetLoadTestStrategyByExperimentId
POST /api/chaos/UpdateExperimentFlowDefinition
POST /api/chaos/UpdateLoadTestStrategy  # 如果有修改
POST /api/chaos/CreateLoadTestStrategy  # 如果有新增
POST /api/chaos/DeleteLoadTestStrategy  # 如果有删除
```

### 📋 3. 演练详情中的压测策略展示

#### 3.1 压测策略信息展示
**路径**: 应用高可用服务/故障演练/空间管理/演练详情

**测试步骤**:
1. 访问有压测策略的演练详情页面
2. 检查压测策略区域的显示

**预期结果**:
- ✅ 正确显示压测策略信息
- ✅ 包含定义ID、时序配置、启用状态
- ✅ 样式美观，信息清晰

**API调用验证**:
```bash
# 应该看到以下API调用
POST /api/chaos/GetLoadTestStrategyByExperimentId
```

### 📋 4. 演练记录详情中的压测任务监控

#### 4.1 压测任务状态获取
**路径**: 应用高可用服务/故障演练/空间管理/演练记录详情

**测试步骤**:
1. 访问有压测任务的演练记录详情页面
2. 检查是否显示压测任务状态卡片

**预期结果**:
- ✅ 正确显示压测任务状态
- ✅ 包含任务ID、执行ID、状态标签
- ✅ 显示开始时间、创建时间等信息

**API调用验证**:
```bash
# 应该看到以下API调用
POST /api/chaos/QueryExperimentTask
GET /GetLoadTestTask?taskId={experimentTaskId}&namespace=default
```

#### 4.2 运行中任务的实时监控
**测试步骤**:
1. 访问有运行中压测任务的演练记录详情页面
2. 观察任务状态和指标的更新

**预期结果**:
- ✅ 任务状态显示为"运行中"
- ✅ 显示"停止"按钮
- ✅ 每5秒自动更新状态和指标
- ✅ 指标图表实时更新

**API调用验证**:
```bash
# 应该看到每5秒的轮询调用
GET /GetLoadTestTask?taskId={experimentTaskId}&namespace=default
POST /api/metrics/performance/{executionId}/series
```

#### 4.3 完成任务的结果查看
**测试步骤**:
1. 访问有已完成压测任务的演练记录详情页面
2. 点击"查看结果"按钮

**预期结果**:
- ✅ 任务状态显示为"已完成"、"失败"或"已停止"
- ✅ 显示"查看结果"按钮
- ✅ 显示最终的指标图表
- ✅ 点击查看结果有相应反馈

**API调用验证**:
```bash
# 应该看到以下API调用
GET /GetLoadTestResults?taskId={experimentTaskId}&namespace=default
POST /api/metrics/performance/{executionId}/series
```

#### 4.4 停止压测任务功能
**测试步骤**:
1. 访问有运行中压测任务的演练记录详情页面
2. 点击"停止"按钮

**预期结果**:
- ✅ 显示成功提示消息
- ✅ 任务状态更新为"已停止"
- ✅ "停止"按钮变为"查看结果"按钮

**API调用验证**:
```bash
# 应该看到以下API调用
POST /StopLoadTestTask?taskId={experimentTaskId}&namespace=default
GET /GetLoadTestTask?taskId={experimentTaskId}&namespace=default  # 重新获取状态
```

## 错误场景测试

### 📋 5. 异常情况处理

#### 5.1 无压测策略的演练
**测试步骤**:
1. 访问没有配置压测策略的演练详情页面
2. 访问没有压测任务的演练记录详情页面

**预期结果**:
- ✅ 不显示压测策略区域（或显示"无"）
- ✅ 不显示压测任务监控区域
- ✅ 页面其他功能正常

#### 5.2 API调用失败处理
**测试步骤**:
1. 模拟网络错误或API返回错误
2. 观察页面的错误处理

**预期结果**:
- ✅ 显示友好的错误提示
- ✅ 不影响页面其他功能
- ✅ 控制台有详细的错误日志

## 性能测试

### 📋 6. 轮询机制测试

#### 6.1 轮询启动和停止
**测试步骤**:
1. 访问有运行中压测任务的页面
2. 观察轮询是否正常启动
3. 离开页面或任务完成时观察轮询是否停止

**预期结果**:
- ✅ 轮询正常启动（每5秒一次）
- ✅ 任务完成时轮询自动停止
- ✅ 页面卸载时轮询被清理
- ✅ 不会出现内存泄漏

## 浏览器兼容性测试

### 📋 7. 多浏览器测试

**测试浏览器**:
- Chrome（推荐）
- Firefox
- Safari
- Edge

**测试要点**:
- ✅ 页面布局正常
- ✅ 图表渲染正常
- ✅ API调用正常
- ✅ 交互功能正常

## 调试工具

### 📋 8. 开发者工具使用

#### 8.1 Network标签页
检查以下API调用是否正常：
```
POST /api/chaos/GetLoadTestStrategyByExperimentId
GET /GetLoadTestTask
GET /GetLoadTestResults  
POST /api/metrics/performance/{executionId}/series
POST /StopLoadTestTask
```

#### 8.2 Console标签页
查看以下日志信息：
```
Fetching load test tasks for experimentTaskId: {id}
Load test task found: {...}
Load test results: {...}
Load test metrics: {...}
```

#### 8.3 Application标签页
检查是否有内存泄漏或定时器未清理的问题。

## 问题排查

### 📋 9. 常见问题及解决方案

#### 9.1 压测策略不显示
**可能原因**:
- API调用失败
- 数据格式不正确
- 权限问题

**排查步骤**:
1. 检查Network标签页的API调用
2. 检查Console的错误日志
3. 验证用户权限

#### 9.2 压测任务状态不更新
**可能原因**:
- 轮询未启动
- API返回错误
- experimentTaskId不正确

**排查步骤**:
1. 检查轮询是否启动
2. 验证experimentTaskId是否正确
3. 检查API响应数据

#### 9.3 图表不显示
**可能原因**:
- 指标数据为空
- 图表组件加载失败
- 数据格式不正确

**排查步骤**:
1. 检查指标API返回的数据
2. 验证数据格式是否符合图表要求
3. 检查bizcharts组件是否正常加载

## 总结

通过以上完整的测试流程，可以验证压测功能的所有方面是否正常工作。如果发现任何问题，请参考问题排查部分进行调试。

所有功能测试通过后，压测集成功能就可以正式投入使用了！
