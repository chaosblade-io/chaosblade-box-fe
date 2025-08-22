# 压测定义API集成文档

## 概述

本文档描述了压测定义管理功能的API集成实现，包括创建、更新、删除、查询压测定义等功能。

## API接口列表

### 1. 创建压测定义
- **接口**: `POST /chaos/CreateLoadTestDefinition`
- **功能**: 创建新的压测定义
- **请求参数**:
```json
{
  "name": "压测定义名称",
  "engineType": "JMETER|K6|LOCUST",
  "endpoint": "http://example.com",
  "entry": "URL|SCRIPT",
  "contentRef": "文件URL引用（可选）",
  "urlCase": {
    "method": "GET|POST|PUT|DELETE",
    "path": "/api/test",
    "headers": {}
  },
  "namespace": "default"
}
```

### 2. 更新压测定义
- **接口**: `POST /chaos/UpdateLoadTestDefinition`
- **功能**: 更新现有的压测定义
- **请求参数**:
```json
{
  "id": "ldef_xxxxxxxxxx",
  "name": "更新后的名称",
  "engineType": "K6",
  "endpoint": "http://updated-example.com",
  "entry": "SCRIPT",
  "namespace": "default"
}
```

### 3. 删除压测定义
- **接口**: `POST /chaos/DeleteLoadTestDefinition`
- **功能**: 删除指定的压测定义
- **请求参数**: `id=ldef_xxxxxxxxxx&namespace=default`

### 4. 查询压测定义详情
- **接口**: `POST /chaos/GetLoadTestDefinition`
- **功能**: 获取单个压测定义的详细信息
- **请求参数**: `id=ldef_xxxxxxxxxx&namespace=default`

### 5. 分页查询压测定义
- **接口**: `POST /chaos/QueryLoadTestDefinitions`
- **功能**: 分页查询压测定义列表
- **请求参数**:
```json
{
  "pageNum": 1,
  "pageSize": 20,
  "name": "搜索关键词（可选）",
  "engineType": "JMETER（可选）",
  "namespace": "default"
}
```

### 6. 查询所有压测定义
- **接口**: `POST /chaos/ListAllLoadTestDefinitions`
- **功能**: 获取所有压测定义（不分页）
- **请求参数**: `namespace=default`

## 前端实现

### 1. 数据模型 (loadTestDefinition.ts)
- 使用dva模型管理压测定义的状态
- 包含增删改查的effects和reducers
- 支持分页和搜索功能

### 2. 管理页面 (LoadTestAdmin/index.tsx)
- 压测定义列表展示
- 支持搜索和筛选
- 创建、编辑、删除操作
- 分页功能

### 3. 压测数据图表 (LoadTestDataCharts/index.tsx)
- 集成压测定义选择器
- 支持多选压测定义
- 实时数据展示

## 使用方法

### 1. 访问管理页面
访问路径: `/chaos/loadtest/admin`

### 2. 创建压测定义
1. 点击"添加压测定义"按钮
2. 填写基本信息（名称、引擎类型、端点）
3. 选择入口类型（URL配置或脚本文件）
4. 根据入口类型填写相应配置
5. 保存

### 3. 编辑压测定义
1. 在列表中点击"编辑"按钮
2. 修改相应字段
3. 保存更改

### 4. 删除压测定义
1. 在列表中点击"删除"按钮
2. 确认删除操作

### 5. 在压测数据图表中使用
1. 在实验任务页面的压测数据图表区域
2. 使用压测定义选择器选择要监控的压测定义
3. 查看实时压测数据

## 数据结构

### ILoadTestDefinition
```typescript
interface ILoadTestDefinition {
  id: string;
  name: string;
  engineType: 'JMETER' | 'K6' | 'LOCUST';
  endpoint: string;
  entry: 'URL' | 'SCRIPT';
  contentRef?: string;
  urlCase?: {
    method: string;
    path: string;
    headers: Record<string, string>;
  };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  namespace: string;
}
```

## 注意事项

1. 所有API调用都会自动添加当前命名空间
2. 创建和更新操作支持表单验证
3. 删除操作需要用户确认
4. 支持按名称和引擎类型搜索
5. 分页查询支持自定义页面大小

## 扩展功能

1. 可以扩展支持更多压测引擎类型
2. 可以添加压测定义的导入导出功能
3. 可以添加压测定义的版本管理
4. 可以集成压测任务的执行状态监控

## 故障排除

1. 如果API调用失败，检查网络连接和服务器状态
2. 如果数据不显示，检查命名空间配置
3. 如果表单验证失败，检查必填字段
4. 如果删除失败，检查是否有关联的压测任务正在运行
