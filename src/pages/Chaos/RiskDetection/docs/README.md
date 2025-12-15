# 风险分析模块文档中心

## 📚 文档列表

### 1. [API接口规范](./API_SPECIFICATION.md)
**完整的后端API接口设计文档**

- ✅ 15个RESTful API接口详细定义
- ✅ 请求/响应格式、参数说明、示例代码
- ✅ 完整的数据结构定义（TypeScript）
- ✅ 错误码定义和处理方案
- ✅ 接口汇总表和使用示例

**适用人群**：后端开发、前端开发、测试工程师

---

### 2. [API快速参考](./API_QUICK_REFERENCE.md)
**简化版API接口速查表**

- ✅ 15个接口的快速索引
- ✅ 核心数据结构示例
- ✅ 常用枚举值说明
- ✅ 完整流程示例

**适用人群**：开发人员日常查阅

---

### 3. [自动化配置指南](./AUTO_CONFIG_GUIDE.md)
**演练场景自动化配置说明**

- ✅ 全自动化配置功能介绍
- ✅ 支持的故障类型和参数
- ✅ 参数自动翻译和描述
- ✅ 使用流程和优势

**适用人群**：产品经理、用户、开发人员

---

### 4. [API调用示例](./API_EXAMPLES.md)
**实际API调用示例和场景演示**

- ✅ 完整流程示例（拓扑→分析→生成→执行→结果）
- ✅ 各个接口的请求/响应示例
- ✅ 错误处理示例
- ✅ 前端TypeScript调用示例

**适用人群**：前端开发、后端开发、测试工程师

---

## 🎯 功能模块概览

风险分析模块提供从服务拓扑分析、风险检测、演练场景生成、执行到结果分析的**完整闭环能力**。

### 核心功能

```
拓扑分析 → 风险检测 → 场景生成 → 执行演练 → 结果分析
   ↓          ↓          ↓          ↓          ↓
 K8s资源   自动识别   全自动配置   实时监控   改进建议
 可视化     风险点     所有参数     执行状态   风险验证
```

### 技术特点

1. **智能化风险识别**
   - 自动分析K8s资源拓扑
   - 识别6大类风险（单点故障、依赖风险、资源风险等）
   - 智能推荐故障类型和参数

2. **全自动化场景生成**
   - 零配置：用户只需选择风险点和故障类型
   - 自动填充所有参数（30+字段）
   - 参数中文翻译和详细描述
   - 支持10+种ChaosBlade故障类型

3. **完整的结果分析**
   - 风险验证结果
   - 系统影响分析（可用性、响应时间、错误率）
   - 分类改进建议（架构、配置、监控、运维手册）
   - 预估实施时间和预期收益

---

## 🚀 快速开始

### 前端开发

1. 查看 [API_SPECIFICATION.md](./API_SPECIFICATION.md) 了解接口定义
2. 参考现有Mock数据实现：`src/pages/Chaos/RiskDetection/services/mockData.ts`
3. 使用 `riskDetectionService.ts` 中的服务方法调用API

### 后端开发

1. 按照 [API_SPECIFICATION.md](./API_SPECIFICATION.md) 实现15个接口
2. 遵循RESTful规范和响应格式
3. 实现完整的错误处理和错误码

### 测试

1. 使用 [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) 快速查找接口
2. 参考文档中的请求/响应示例编写测试用例
3. 验证所有错误码和边界情况

---

## 📊 接口统计

| 模块 | 接口数量 | 说明 |
|------|---------|------|
| 拓扑分析 | 3 | K8s资源拓扑、详情、依赖关系 |
| 风险检测 | 4 | 风险分析、列表、详情、状态更新 |
| 场景生成 | 2 | 生成演练场景、验证配置 |
| 演练执行 | 3 | 执行、查询状态、停止 |
| 结果分析 | 3 | 演练结果、影响分析、改进建议 |
| **总计** | **15** | **完整闭环** |

---

## 🔗 相关资源

### 前端代码

- **组件目录**: `src/pages/Chaos/RiskDetection/components/`
  - `RiskTopology/` - 拓扑可视化
  - `RiskAnalysisDrawer/` - 风险分析抽屉
  - `GenerateExperimentModal/` - 场景生成弹窗
  - `DrillResultAnalysis/` - 结果分析

- **服务层**: `src/pages/Chaos/RiskDetection/services/`
  - `riskDetectionService.ts` - 核心服务
  - `mockData.ts` - Mock数据
  - `traceService.ts` - 追踪服务

- **类型定义**: `src/pages/Chaos/RiskDetection/types/`
  - `index.ts` - 核心类型
  - `experimentTypes.ts` - 演练相关类型

### 技术栈

- **前端框架**: React + TypeScript
- **UI组件**: Ant Design (Fusion)
- **图可视化**: AntV X6
- **状态管理**: DVA (Redux)
- **故障注入**: ChaosBlade

---

## 📝 更新日志

### v1.0 (2025-12-04)

- ✅ 完成API接口规范设计（15个接口）
- ✅ 完成自动化配置功能实现
- ✅ 完成Mock数据优化
- ✅ 完成文档编写

---

## 💡 贡献指南

如需更新文档，请遵循以下规范：

1. **API_SPECIFICATION.md** - 接口变更时必须更新
2. **API_QUICK_REFERENCE.md** - 保持与完整文档同步
3. **AUTO_CONFIG_GUIDE.md** - 新增故障类型时更新

---

## 📧 联系方式

如有疑问或建议，请联系开发团队。

---

**最后更新**: 2025-12-04

