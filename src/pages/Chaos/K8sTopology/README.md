# Kubernetes 拓扑感知模块

## 概述

Kubernetes 拓扑感知模块是一个完整的示例页面，用于可视化展示 K8s 集群的资源拓扑结构，包括 Namespace、Node、Pod、Container 等资源及其关系。

## 功能特性

### 1. 完整的资源层级展示
- **Namespace**: 命名空间，顶层资源容器
- **Node**: Kubernetes 工作节点，展示 CPU、内存、网络、磁盘等指标
- **Pod**: Pod 实例，展示运行状态和资源使用情况
- **Container**: 容器实例，展示镜像信息和资源消耗

### 2. 丰富的可视化功能
- 节点点击查看详情
- 节点拖拽移动
- 画布缩放和平移
- 多种布局算法（层级布局、力导向布局、网格布局）
- 实时指标展示（CPU、内存使用率等）
- 健康状态可视化（健康、警告、异常）

### 3. 交互式属性面板
- 右侧属性面板展示选中节点的详细信息
- 包含基础信息、资源指标、健康状态等
- 支持关闭和展开

### 4. 图例说明
- 左侧图例面板说明节点类型、边类型、健康状态
- 帮助用户快速理解拓扑图

## 文件结构

```
src/pages/Chaos/K8sTopology/
├── index.tsx           # 主页面组件
├── index.scss          # 样式文件
├── mockData.ts         # 示例数据
└── README.md           # 本文档

src/components/XFlow/
├── components/
│   └── nodes/
│       ├── K8sNodeComponent.tsx        # Node 节点组件
│       ├── K8sPodComponent.tsx         # Pod 节点组件
│       ├── K8sContainerComponent.tsx   # Container 节点组件
│       └── K8sNamespaceComponent.tsx   # Namespace 节点组件
├── config/
│   └── nodeConfig.ts   # 节点注册配置（已更新）
└── types/
    ├── topology.ts     # 类型定义（已扩展）
    └── xflow.ts        # XFlow 类型定义（已扩展）
```

## 数据结构

### 节点类型（EntityType）
```typescript
enum EntityType {
  K8S_NAMESPACE = 'K8S_NAMESPACE',
  K8S_NODE = 'K8S_NODE',
  K8S_POD = 'K8S_POD',
  K8S_CONTAINER = 'K8S_CONTAINER',
  // ... 其他类型
}
```

### 关系类型（RelationType）
```typescript
enum RelationType {
  SCHEDULES_ON = 'SCHEDULES_ON',  // Pod -> Node
  HOSTS = 'HOSTS',                // Node -> Pod
  CONTAINS = 'CONTAINS',          // Pod -> Container
  MANAGES = 'MANAGES',            // Namespace -> Node
  EXPOSES = 'EXPOSES',            // Service -> Pod
  BELONGS_TO = 'BELONGS_TO',      // Resource -> Namespace
}
```

### Kubernetes 指标（K8sMetrics）
```typescript
interface K8sMetrics {
  // CPU 指标
  cpuUsage: number;
  cpuRequest: number;
  cpuLimit: number;
  cpuUsagePercent: number;
  
  // 内存指标
  memoryUsage: number;
  memoryRequest: number;
  memoryLimit: number;
  memoryUsagePercent: number;
  
  // 网络指标
  networkRxRate?: number;
  networkTxRate?: number;
  
  // 磁盘指标
  diskUsagePercent?: number;
  
  // Pod 特有指标
  restartCount?: number;
  readyContainers?: number;
  totalContainers?: number;
  
  timestamp: number;
}
```

### Kubernetes 属性（K8sAttributes）
```typescript
interface K8sAttributes {
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  
  // Node 特有属性
  nodeInfo?: {
    osImage: string;
    kernelVersion: string;
    kubeletVersion: string;
    containerRuntime: string;
    architecture: string;
    capacity: { cpu: string; memory: string; pods: string };
    allocatable: { cpu: string; memory: string; pods: string };
  };
  
  // Pod 特有属性
  podInfo?: {
    phase: string;
    qosClass: string;
    nodeName: string;
    podIP: string;
    hostIP: string;
    startTime: number;
  };
  
  // Container 特有属性
  containerInfo?: {
    image: string;
    imageID: string;
    containerID: string;
    state: string;
    ready: boolean;
    restartCount: number;
  };
}
```

## 使用方法

### 1. 访问页面
访问路由：`/chaos/k8s-topology`

### 2. 查看拓扑
页面加载后自动展示 Kubernetes 集群拓扑图

### 3. 交互操作
- **点击节点**: 在右侧属性面板查看详细信息
- **拖拽节点**: 调整节点位置
- **缩放画布**: 使用鼠标滚轮缩放
- **平移画布**: 按住鼠标左键拖动画布
- **切换布局**: 点击顶部工具栏的布局按钮
- **刷新数据**: 点击刷新按钮重新加载数据
- **导出数据**: 点击导出按钮下载 JSON 格式的拓扑数据
- **全屏模式**: 点击全屏按钮进入全屏查看

## 后端集成

### API 接口设计

```typescript
// 获取 K8s 拓扑数据
GET /api/chaos/k8s-topology

// 响应格式
{
  "success": true,
  "data": {
    "nodes": [...],  // 节点数组
    "edges": [...]   // 边数组
  }
}
```

### 数据采集

后端需要实现以下功能：
1. 连接 Kubernetes API Server
2. 获取 Namespace、Node、Pod、Container 资源信息
3. 从 Metrics Server 或 Prometheus 获取实时指标
4. 构建资源关系图
5. 按照前端数据格式返回

### 示例代码（Go）

```go
// 获取 K8s 拓扑数据
func GetK8sTopology(c *gin.Context) {
    clientset, err := kubernetes.NewForConfig(config)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    // 获取所有 Namespace
    namespaces, _ := clientset.CoreV1().Namespaces().List(context.TODO(), metav1.ListOptions{})
    
    // 获取所有 Node
    nodes, _ := clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
    
    // 获取所有 Pod
    pods, _ := clientset.CoreV1().Pods("").List(context.TODO(), metav1.ListOptions{})
    
    // 构建拓扑数据
    topology := buildTopology(namespaces, nodes, pods)
    
    c.JSON(200, gin.H{
        "success": true,
        "data": topology,
    })
}
```

## 技术栈

- **React 17+**: 前端框架
- **TypeScript 4+**: 类型系统
- **AntV X6**: 图形可视化引擎
- **Alibaba Fusion Design**: UI 组件库
- **SCSS**: 样式预处理器

## 扩展建议

### 1. 添加更多资源类型
- Deployment
- Service
- ConfigMap
- Secret
- PersistentVolume

### 2. 增强交互功能
- 节点搜索和过滤
- 资源关系路径高亮
- 时间序列指标图表
- 告警信息展示

### 3. 性能优化
- 虚拟化渲染大规模拓扑
- 节点聚合和折叠
- 增量更新数据

### 4. 集成故障注入
- 在拓扑图上直接选择目标进行故障注入
- 可视化展示故障影响范围
- 实时监控故障演练效果

## 注意事项

1. **性能考虑**: 当集群规模较大时（超过 100 个 Pod），建议实现分页或过滤功能
2. **实时更新**: 可以使用 WebSocket 或轮询实现拓扑数据的实时更新
3. **权限控制**: 确保用户只能查看有权限的 Namespace 和资源
4. **错误处理**: 完善错误提示和降级方案

## 参考资料

- [AntV X6 文档](https://x6.antv.vision/)
- [Kubernetes API 文档](https://kubernetes.io/docs/reference/kubernetes-api/)
- [Metrics Server](https://github.com/kubernetes-sigs/metrics-server)
- [Prometheus](https://prometheus.io/)

