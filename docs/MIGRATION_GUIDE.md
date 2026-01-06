# MicroGraph 拓扑图功能迁移指南

> 本文档详细说明 MicroGraph 项目中 Kubernetes 资源拓扑图功能的技术实现，供迁移到其他项目参考。

---

## 目录

1. [技术栈概览](#1-技术栈概览)
2. [数据格式规范](#2-数据格式规范)
3. [样式系统](#3-样式系统)
4. [交互功能](#4-交互功能)
5. [布局系统](#5-布局系统)
6. [动态效果优化方案](#6-动态效果优化方案)
7. [迁移指南](#7-迁移指南)

---

## 1. 技术栈概览

### 核心依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `@antv/g6` | ^4.8.24 | 图可视化引擎（核心） |
| `react` | ^18.2.0 | UI 框架 |
| `antd` | ^5.12.0 | UI 组件库 |
| `tailwindcss` | ^3.4.0 | 样式工具 |
| `typescript` | ^5.3.3 | 类型支持 |
| `vite` | ^5.0.8 | 构建工具 |

### 安装命令

```bash
npm install @antv/g6@^4.8.24 antd@^5.12.0
npm install -D tailwindcss@^3.4.0 typescript@^5.3.3
```

---

## 2. 数据格式规范

### 2.1 节点数据结构 (MicroGraphNode)

```typescript
interface MicroGraphNode {
  id: string;                           // 全局唯一标识符
                                        // 格式: {type}/{namespace}/{name}
                                        // 示例: k8s.workload.pod/default/nginx-abc
  
  type: string;                         // 资源类型
                                        // 示例: k8s.workload.pod, k8s.network.service
  
  domain: string;                       // 所属域
                                        // 可选值: k8s.infra, k8s.workload, k8s.network, k8s.config
  
  name: string;                         // 资源名称
                                        // 示例: nginx-abc
  
  namespace?: string;                   // 命名空间（可选）
                                        // 示例: default
  
  labels: Record<string, string>;       // K8s 标签
                                        // 示例: { app: 'nginx', version: 'v1' }
  
  properties: Record<string, any>;      // 资源属性
                                        // 示例: { replicas: 3, phase: 'Running' }
  
  status: NodeStatus;                   // 资源状态
                                        // 可选值: running, warning, error, pending, terminated
}

type NodeStatus = 'running' | 'warning' | 'error' | 'pending' | 'terminated';
```

### 2.2 边数据结构 (MicroGraphEdge)

```typescript
interface MicroGraphEdge {
  id: string;                           // 边唯一标识符
                                        // 示例: edge-1
  
  type: EdgeType;                       // 关系类型
  
  source: string;                       // 源节点 ID
                                        // 必须与 MicroGraphNode.id 对应
  
  target: string;                       // 目标节点 ID
                                        // 必须与 MicroGraphNode.id 对应
  
  properties: Record<string, any>;      // 边属性
}

type EdgeType = 
  | 'contains'    // 包含关系 (Namespace → Deployment)
  | 'owns'        // 拥有关系
  | 'manages'     // 管理关系 (Deployment → ReplicaSet)
  | 'creates'     // 创建关系 (ReplicaSet → Pod)
  | 'selects'     // 选择关系 (Service → Pod)
  | 'routes_to'   // 路由关系 (Ingress → Service)
  | 'runs_on'     // 运行关系 (Pod → Node)
  | 'mounts'      // 挂载关系 (Pod → PersistentVolume)
  | 'claims'      // 声明关系 (Pod → PersistentVolumeClaim)
  | 'calls';      // 调用关系 (Service → Service)
```

### 2.3 完整图数据结构 (GraphData)

```typescript
interface GraphData {
  nodes: MicroGraphNode[];
  edges: MicroGraphEdge[];
  domains: Domain[];
}

interface Domain {
  key: string;        // 域标识 (k8s.infra, k8s.workload, etc.)
  name: string;       // 显示名称
  color: string;      // 域颜色
  icon: string;       // 域图标
  entityCount: number;// 实体数量
}
```

### 2.4 示例数据

```json
{
  "nodes": [
    {
      "id": "k8s.workload.deployment/default/nginx-deployment",
      "type": "k8s.workload.deployment",
      "domain": "k8s.workload",
      "name": "nginx-deployment",
      "namespace": "default",
      "labels": { "app": "nginx" },
      "properties": { "replicas": 3 },
      "status": "running"
    },
    {
      "id": "k8s.workload.pod/default/nginx-pod-1",
      "type": "k8s.workload.pod",
      "domain": "k8s.workload",
      "name": "nginx-pod-1",
      "namespace": "default",
      "labels": { "app": "nginx" },
      "properties": { "phase": "Running" },
      "status": "running"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "type": "creates",
      "source": "k8s.workload.replicaset/default/nginx-rs-abc",
      "target": "k8s.workload.pod/default/nginx-pod-1",
      "properties": {}
    }
  ]
}
```

---

## 3. 样式系统

### 3.1 节点样式配置

#### 域颜色方案

| 域 | 颜色系 | 主色 | 说明 |
|----|--------|------|------|
| `k8s.infra` | 蓝色系 | `#3B82F6` | 基础设施（Namespace、Node、PV） |
| `k8s.workload` | 绿色系 | `#10B981` | 工作负载（Deployment、Pod等） |
| `k8s.network` | 紫色系 | `#8B5CF6` | 网络资源（Service、Ingress） |
| `k8s.config` | 黄色系 | `#F59E0B` | 配置资源（ConfigMap、Secret） |

#### 资源类型样式配置

```typescript
const nodeStyleMap: Record<string, NodeStyleConfig> = {
  // 基础设施域 - 蓝色系
  'k8s.infra.namespace': {
    shape: 'rect',
    size: [200, 90],
    fill: '#EFF6FF',      // 浅蓝背景
    icon: 'NS',
    borderWidth: 3,
    borderStyle: 'dashed'
  },
  'k8s.infra.node': {
    shape: 'rect',
    size: [180, 85],
    fill: '#DBEAFE',
    icon: 'ND',
    borderWidth: 2
  },
  'k8s.infra.persistentvolume': {
    shape: 'rect',
    size: [180, 85],
    fill: '#BFDBFE',
    icon: 'PV',
    borderWidth: 2
  },

  // 工作负载域 - 绿色系
  'k8s.workload.deployment': {
    shape: 'rect',
    size: [180, 85],
    fill: '#ECFDF5',      // 浅绿背景
    icon: 'DP',
    borderWidth: 2
  },
  'k8s.workload.replicaset': {
    shape: 'rect',
    size: [180, 85],
    fill: '#D1FAE5',
    icon: 'RS',
    borderWidth: 2
  },
  'k8s.workload.statefulset': {
    shape: 'rect',
    size: [180, 85],
    fill: '#A7F3D0',
    icon: 'SS',
    borderWidth: 2
  },
  'k8s.workload.daemonset': {
    shape: 'rect',
    size: [180, 85],
    fill: '#6EE7B7',
    icon: 'DS',
    borderWidth: 2
  },
  'k8s.workload.pod': {
    shape: 'rect',
    size: [160, 80],
    fill: '#D1FAE5',
    icon: 'PO',
    borderWidth: 2
  },

  // 网络域 - 紫色系
  'k8s.network.service': {
    shape: 'rect',
    size: [180, 85],
    fill: '#F5F3FF',      // 浅紫背景
    icon: 'SV',
    borderWidth: 2
  },
  'k8s.network.ingress': {
    shape: 'rect',
    size: [180, 85],
    fill: '#EDE9FE',
    icon: 'IG',
    borderWidth: 2
  },

  // 配置域 - 黄色系
  'k8s.config.configmap': {
    shape: 'rect',
    size: [180, 85],
    fill: '#FFFBEB',      // 浅黄背景
    icon: 'CM',
    borderWidth: 2
  },
  'k8s.config.secret': {
    shape: 'rect',
    size: [180, 85],
    fill: '#FEF3C7',
    icon: 'SC',
    borderWidth: 2
  },
  'k8s.config.persistentvolumeclaim': {
    shape: 'rect',
    size: [180, 85],
    fill: '#FDE68A',
    icon: 'PC',
    borderWidth: 2
  }
};
```

#### 状态颜色配置

```typescript
const statusColors = {
  running: {
    border: '#10B981',                    // 绿色边框
    glow: 'rgba(16, 185, 129, 0.3)'       // 绿色光晕
  },
  warning: {
    border: '#F59E0B',                    // 黄色边框
    glow: 'rgba(245, 158, 11, 0.3)'
  },
  error: {
    border: '#EF4444',                    // 红色边框
    glow: 'rgba(239, 68, 68, 0.5)'
  },
  pending: {
    border: '#6B7280',                    // 灰色边框
    glow: 'rgba(107, 114, 128, 0.2)'
  },
  terminated: {
    border: '#9CA3AF',                    // 浅灰边框
    glow: 'rgba(156, 163, 175, 0.1)'
  }
};
```

### 3.2 边样式配置

```typescript
const edgeStyleMap: Record<EdgeType, EdgeStyleConfig> = {
  contains: {
    type: 'line',
    color: '#3B82F6',     // 蓝色
    width: 2,
    lineDash: [5, 5],     // 虚线
    arrow: true,
    label: '包含'
  },
  owns: {
    type: 'line',
    color: '#10B981',     // 绿色
    width: 2,
    lineDash: null,       // 实线
    arrow: true,
    label: '拥有'
  },
  manages: {
    type: 'quadratic',    // 曲线
    color: '#8B5CF6',     // 紫色
    width: 2,
    lineDash: null,
    arrow: true,
    label: '管理'
  },
  creates: {
    type: 'quadratic',
    color: '#F59E0B',     // 黄色
    width: 2,
    lineDash: null,
    arrow: true,
    label: '创建'
  },
  selects: {
    type: 'quadratic',
    color: '#EC4899',     // 粉色
    width: 2,
    lineDash: [3, 3],
    arrow: true,
    label: '选择'
  },
  routes_to: {
    type: 'quadratic',
    color: '#06B6D4',     // 青色
    width: 2,
    lineDash: null,
    arrow: true,
    label: '路由到'
  },
  runs_on: {
    type: 'line',
    color: '#6366F1',     // 靛蓝色
    width: 2,
    lineDash: null,
    arrow: true,
    label: '运行于'
  },
  mounts: {
    type: 'line',
    color: '#84CC16',     // 青柠色
    width: 2,
    lineDash: [2, 2],
    arrow: true,
    label: '挂载'
  },
  claims: {
    type: 'line',
    color: '#F97316',     // 橙色
    width: 2,
    lineDash: [2, 2],
    arrow: true,
    label: '声明'
  },
  calls: {
    type: 'quadratic',
    color: '#EF4444',     // 红色
    width: 3,
    lineDash: null,
    arrow: true,
    label: '调用'
  }
};
```

### 3.3 G6 节点状态样式

```typescript
const nodeStateStyles = {
  hover: {
    lineWidth: 3,
    shadowBlur: 20
  },
  selected: {
    lineWidth: 4,
    stroke: '#1890FF'
  },
  dimmed: {
    opacity: 0.2
  }
};

const edgeStateStyles = {
  hover: {
    lineWidth: 3,
    opacity: 1,
    stroke: '#40A9FF'
  },
  selected: {
    lineWidth: 4,
    opacity: 1,
    stroke: '#1890FF'
  },
  dimmed: {
    opacity: 0.1
  }
};
```

---

## 4. 交互功能

### 4.1 支持的交互列表

| 功能 | 实现方式 | 说明 |
|------|----------|------|
| 画布拖拽 | `drag-canvas` | 鼠标拖拽移动画布 |
| 画布缩放 | `zoom-canvas` | 鼠标滚轮缩放 |
| 节点拖拽 | `drag-node` | 拖拽单个节点 |
| 点击选择 | `click-select` | 点击选中节点/边 |
| 关系激活 | `activate-relations` | 点击节点高亮相关边 |
| 悬停效果 | `node:mouseenter/leave` | 鼠标悬停样式变化 |
| 布局切换 | 6种布局算法 | 实时切换布局 |
| 搜索过滤 | 文本搜索 | 高亮匹配节点 |
| 详情面板 | 侧边面板 | 展示节点/边详情 |

### 4.2 交互模式配置

```typescript
const modes = {
  default: [
    'drag-canvas',      // 拖拽画布
    'zoom-canvas',      // 缩放画布
    {
      type: 'drag-node',
      enableDelegate: false,
      shouldBegin: (e: any) => true,
      shouldUpdate: (e: any) => true
    },
    'click-select',     // 点击选择
    {
      type: 'activate-relations',
      resetSelected: true
    }
  ]
};
```

### 4.3 事件监听实现

```typescript
// 节点点击
graph.on('node:click', (evt) => {
  const node = evt.item;
  const model = node?.getModel();
  if (model?.data) {
    onNodeSelect(model.data as MicroGraphNode);
    focusNode(graph, node);
  }
});

// 边点击
graph.on('edge:click', (evt) => {
  const edge = evt.item;
  const model = edge?.getModel();
  if (model?.data) {
    onEdgeSelect(model.data as MicroGraphEdge);
  }
});

// 节点悬停
graph.on('node:mouseenter', (evt) => {
  const node = evt.item;
  graph.setItemState(node!, 'hover', true);
});

graph.on('node:mouseleave', (evt) => {
  const node = evt.item;
  graph.setItemState(node!, 'hover', false);
});

// 画布点击（清除选择）
graph.on('canvas:click', () => {
  graph.getNodes().forEach(node => graph.clearItemStates(node));
  graph.getEdges().forEach(edge => graph.clearItemStates(edge));
  onCanvasClick?.();
});
```

### 4.4 缩放控制

```typescript
// 放大
const handleZoomIn = () => {
  const zoom = graph.getZoom();
  graph.zoomTo(zoom * 1.2);
};

// 缩小
const handleZoomOut = () => {
  const zoom = graph.getZoom();
  graph.zoomTo(zoom * 0.8);
};

// 适应画布
const handleZoomReset = () => {
  graph.fitView(20);  // 20px 内边距
};

// 缩放范围限制
const graphConfig = {
  minZoom: 0.1,
  maxZoom: 5
};
```

---

## 5. 布局系统

### 5.1 支持的布局类型

| 布局类型 | 名称 | 图标 | 适用场景 |
|----------|------|------|----------|
| `force` | 力导向布局 | 🔄 | 展示整体结构和关系聚类 |
| `dagre` | 层次布局 | 📊 | 展示依赖关系和层级结构 |
| `circular` | 圆形布局 | ⭕ | 展示整体结构和节点分布 |
| `grid` | 网格布局 | ⊞ | 整齐有序展示所有节点 |
| `radial` | 辐射布局 | ☀️ | 展示核心资源及其关联 |
| `concentric` | 同心圆布局 | 🎯 | 按层级重要性展示 |

### 5.2 布局配置详情

```typescript
// 力导向布局 - 适合展示整体结构
const forceLayoutConfig = {
  type: 'force',
  preventOverlap: true,      // 防止节点重叠
  nodeSpacing: 100,          // 节点间距
  linkDistance: 150,         // 边长度
  nodeStrength: -500,        // 节点斥力
  edgeStrength: 0.6,         // 边引力
  collideStrength: 0.8,      // 碰撞强度
  alpha: 0.9,
  alphaMin: 0.001,
  alphaDecay: 0.028,
  gravity: 10                // 向心力
};

// 层次布局 - 适合展示依赖关系
const dagreLayoutConfig = {
  type: 'dagre',
  rankdir: 'TB',             // 从上到下
  align: 'UL',               // 左上对齐
  nodesep: 50,               // 同层节点间距
  ranksep: 80,               // 层级间距
  controlPoints: true        // 控制点
};

// 圆形布局
const circularLayoutConfig = {
  type: 'circular',
  radius: 300,
  startRadius: 100,
  endRadius: 500,
  clockwise: true,
  divisions: 5,
  ordering: 'degree',        // 按度数排序
  angleRatio: 1
};

// 网格布局
const gridLayoutConfig = {
  type: 'grid',
  begin: [0, 0],
  preventOverlap: true,
  preventOverlapPadding: 20,
  nodeSize: 100,
  condense: false,
  sortBy: 'degree'
};

// 辐射布局
const radialLayoutConfig = {
  type: 'radial',
  unitRadius: 100,
  linkDistance: 150,
  preventOverlap: true,
  nodeSize: 80,
  strictRadial: true,
  sortBy: 'degree',
  sortStrength: 10
};

// 同心圆布局
const concentricLayoutConfig = {
  type: 'concentric',
  minNodeSpacing: 50,
  preventOverlap: true,
  nodeSize: 80,
  equidistant: false,
  startAngle: 0,
  clockwise: true,
  sortBy: 'degree'
};
```

---

## 6. 动态效果优化方案

### 6.1 节点边框光效（流光效果）

#### 方案一：CSS 渐变旋转动画

```typescript
// 在自定义节点中添加流光边框
G6.registerNode('k8s-node-animated', {
  afterDraw(cfg: any, group: any) {
    const shape = group.get('children')[0];
    const { width, height } = shape.getBBox();

    // 添加渐变边框
    const borderShape = group.addShape('rect', {
      attrs: {
        x: -width / 2 - 2,
        y: -height / 2 - 2,
        width: width + 4,
        height: height + 4,
        radius: 10,
        stroke: 'transparent',
        lineWidth: 3,
        fill: 'transparent'
      },
      name: 'border-glow'
    });

    // 创建渐变动画
    let angle = 0;
    const animate = () => {
      angle = (angle + 2) % 360;
      const gradient = `l(${angle}) 0:#3B82F6 0.5:#10B981 1:#8B5CF6`;
      borderShape.attr('stroke', gradient);
      if (!shape.destroyed) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
}, 'k8s-node');
```

#### 方案二：G6 动画 API 实现呼吸灯效果

```typescript
G6.registerNode('k8s-node-breathing', {
  afterDraw(cfg: any, group: any) {
    const shape = group.get('children')[0];

    // 呼吸灯动画
    shape.animate(
      (ratio: number) => {
        const opacity = Math.sin(ratio * Math.PI * 2) * 0.3 + 0.7;
        const shadowBlur = Math.sin(ratio * Math.PI * 2) * 10 + 10;
        return {
          shadowBlur,
          shadowColor: `rgba(59, 130, 246, ${opacity})`
        };
      },
      {
        repeat: true,
        duration: 2000,
        easing: 'easeSinInOut'
      }
    );
  }
}, 'k8s-node');
```

#### 方案三：跑马灯边框效果（推荐）

```typescript
G6.registerNode('k8s-node-marquee', {
  afterDraw(cfg: any, group: any) {
    const shape = group.get('children')[0];
    const bbox = shape.getBBox();
    const { width, height } = bbox;

    // 添加流动光点
    const lightDot = group.addShape('circle', {
      attrs: {
        r: 4,
        fill: '#00ff88',
        shadowColor: '#00ff88',
        shadowBlur: 10
      },
      name: 'light-dot'
    });

    // 计算边框路径长度
    const perimeter = 2 * (width + height);

    lightDot.animate(
      (ratio: number) => {
        const distance = ratio * perimeter;
        let x, y;

        if (distance < width) {
          // 上边
          x = -width / 2 + distance;
          y = -height / 2;
        } else if (distance < width + height) {
          // 右边
          x = width / 2;
          y = -height / 2 + (distance - width);
        } else if (distance < 2 * width + height) {
          // 下边
          x = width / 2 - (distance - width - height);
          y = height / 2;
        } else {
          // 左边
          x = -width / 2;
          y = height / 2 - (distance - 2 * width - height);
        }

        return { x, y };
      },
      {
        repeat: true,
        duration: 3000,
        easing: 'easeLinear'
      }
    );
  }
}, 'k8s-node');
```

### 6.2 边的数据流动效果

#### 方案一：虚线流动效果

```typescript
G6.registerEdge('flow-line', {
  afterDraw(cfg: any, group: any) {
    const shape = group.get('children')[0];
    const length = shape.getTotalLength();

    shape.animate(
      (ratio: number) => {
        const startLen = ratio * length;
        return {
          lineDash: [4, 4],
          lineDashOffset: -startLen
        };
      },
      {
        repeat: true,
        duration: 3000
      }
    );
  }
}, 'line');
```

#### 方案二：流动光点效果（推荐）

```typescript
G6.registerEdge('flow-dot-line', {
  afterDraw(cfg: any, group: any) {
    const shape = group.get('children')[0];
    const startPoint = shape.getPoint(0);
    const endPoint = shape.getPoint(1);

    // 创建流动的光点
    const circle = group.addShape('circle', {
      attrs: {
        x: startPoint.x,
        y: startPoint.y,
        r: 4,
        fill: '#00ff88',
        shadowColor: '#00ff88',
        shadowBlur: 8
      },
      name: 'flow-dot'
    });

    // 沿路径移动
    circle.animate(
      (ratio: number) => {
        const point = shape.getPoint(ratio);
        return {
          x: point.x,
          y: point.y
        };
      },
      {
        repeat: true,
        duration: 2000,
        easing: 'easeLinear'
      }
    );
  }
}, 'quadratic');
```

#### 方案三：多光点粒子流动效果

```typescript
G6.registerEdge('particle-flow-line', {
  afterDraw(cfg: any, group: any) {
    const shape = group.get('children')[0];
    const particleCount = 3;

    for (let i = 0; i < particleCount; i++) {
      const circle = group.addShape('circle', {
        attrs: {
          r: 3,
          fill: '#06B6D4',
          opacity: 0.8,
          shadowColor: '#06B6D4',
          shadowBlur: 6
        },
        name: `particle-${i}`
      });

      circle.animate(
        (ratio: number) => {
          // 错开各个粒子的位置
          const adjustedRatio = (ratio + i / particleCount) % 1;
          const point = shape.getPoint(adjustedRatio);
          return {
            x: point.x,
            y: point.y,
            opacity: 0.3 + adjustedRatio * 0.7
          };
        },
        {
          repeat: true,
          duration: 2500,
          easing: 'easeLinear'
        }
      );
    }
  }
}, 'quadratic');
```

### 6.3 其他视觉效果建议

#### 状态脉冲效果（警告/错误节点）

```typescript
// 为警告或错误状态的节点添加脉冲动画
if (cfg.data.status === 'warning' || cfg.data.status === 'error') {
  const pulseColor = cfg.data.status === 'error' ? '#EF4444' : '#F59E0B';

  const pulse = group.addShape('rect', {
    attrs: {
      x: -width / 2,
      y: -height / 2,
      width,
      height,
      radius: 8,
      fill: 'transparent',
      stroke: pulseColor,
      lineWidth: 2,
      opacity: 0
    },
    name: 'pulse'
  });

  pulse.animate(
    {
      opacity: 0.8,
      lineWidth: 4
    },
    {
      duration: 1000,
      easing: 'easeCubicOut',
      repeat: true,
      delay: 500
    }
  );

  pulse.animate(
    {
      opacity: 0,
      lineWidth: 10
    },
    {
      duration: 1000,
      easing: 'easeCubicIn',
      repeat: true,
      delay: 1500
    }
  );
}
```

#### 节点进入动画

```typescript
// 节点首次出现时的动画
graph.on('afterrender', () => {
  graph.getNodes().forEach((node, index) => {
    const model = node.getModel();
    node.get('group').attr('opacity', 0);

    setTimeout(() => {
      node.get('group').animate(
        { opacity: 1 },
        {
          duration: 500,
          easing: 'easeCubicOut'
        }
      );
    }, index * 50);  // 依次出现
  });
});
```

#### 边的渐变颜色

```typescript
const edge = group.addShape('path', {
  attrs: {
    path: pathArray,
    stroke: 'l(0) 0:#3B82F6 1:#10B981',  // 线性渐变
    lineWidth: 2,
    endArrow: {
      path: G6.Arrow.triangle(8, 10, 0),
      fill: '#10B981'
    }
  }
});
```

---

## 7. 迁移指南

### 7.1 需要复制的核心文件

```
src/
├── types/
│   └── graph.ts                 # 核心类型定义（必须）
├── utils/
│   ├── nodeStyles.ts            # 节点样式配置（必须）
│   ├── edgeStyles.ts            # 边样式配置（必须）
│   └── layout.ts                # 布局配置（必须）
├── services/
│   └── graphTransform.ts        # 数据转换服务（必须）
├── components/
│   └── GraphCanvas/
│       ├── index.tsx            # 主画布组件（必须）
│       ├── GraphConfig.ts       # G6 配置（必须）
│       ├── CustomNodes.ts       # 自定义节点（必须）
│       └── CustomEdges.ts       # 自定义边（可选）
└── hooks/
    ├── useGraphData.ts          # 数据获取 Hook（按需修改）
    └── useGraphInteraction.ts   # 交互 Hook（可选）
```

### 7.2 依赖包清单

```json
{
  "dependencies": {
    "@antv/g6": "^4.8.24",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3"
  }
}
```

### 7.3 集成步骤

#### 步骤 1: 安装依赖

```bash
npm install @antv/g6@^4.8.24
```

#### 步骤 2: 复制核心文件

将上述文件复制到目标项目对应目录。

#### 步骤 3: 注册自定义节点和边

在应用入口处调用注册函数：

```typescript
// main.tsx 或 App.tsx
import { registerCustomNodes } from './components/GraphCanvas/CustomNodes';
import { registerCustomEdges } from './components/GraphCanvas/CustomEdges';

// 在渲染前注册
registerCustomNodes();
registerCustomEdges();
```

#### 步骤 4: 数据适配

根据你的数据源修改 `graphTransform.ts`：

```typescript
// 将你的数据格式转换为 MicroGraphNode 和 MicroGraphEdge
export function transformYourData(yourData: YourDataType): GraphData {
  return {
    nodes: yourData.nodes.map(node => ({
      id: node.id,
      type: mapToNodeType(node.type),  // 映射到标准类型
      domain: getDomain(node.type),
      name: node.name,
      namespace: node.namespace,
      labels: node.labels || {},
      properties: node.properties || {},
      status: mapToStatus(node.status)  // 映射到标准状态
    })),
    edges: yourData.edges.map(edge => ({
      id: edge.id,
      type: mapToEdgeType(edge.type),  // 映射到标准关系类型
      source: edge.source,
      target: edge.target,
      properties: edge.properties || {}
    })),
    domains: []
  };
}
```

#### 步骤 5: 使用组件

```tsx
import { GraphCanvas } from './components/GraphCanvas';

function YourComponent() {
  return (
    <GraphCanvas
      clusterId="your-cluster"
      namespaces={['default']}
      layout="force"
      onNodeSelect={(node) => console.log('Selected:', node)}
      onEdgeSelect={(edge) => console.log('Edge:', edge)}
      onCanvasClick={() => console.log('Canvas clicked')}
    />
  );
}
```

### 7.4 自定义扩展

#### 添加新的资源类型

```typescript
// nodeStyles.ts
nodeStyleMap['your.custom.type'] = {
  shape: 'rect',
  size: [180, 85],
  fill: '#your-color',
  icon: 'YT',
  borderWidth: 2
};
```

#### 添加新的关系类型

```typescript
// edgeStyles.ts
edgeStyleMap['your_relation'] = {
  type: 'quadratic',
  color: '#your-color',
  width: 2,
  lineDash: null,
  arrow: true,
  label: '你的关系'
};

// graph.ts (类型定义)
type EdgeType = ... | 'your_relation';
```

#### 自定义节点外观

修改 `CustomNodes.ts` 中的 `draw` 方法来自定义节点的渲染逻辑。

---

## 附录

### A. 完整 G6 配置示例

```typescript
const config = {
  container: containerElement,
  width: 1200,
  height: 800,

  layout: {
    type: 'force',
    preventOverlap: true,
    nodeSpacing: 100
  },

  defaultNode: {
    type: 'k8s-node',
    size: [180, 85]
  },

  defaultEdge: {
    type: 'quadratic',
    style: {
      stroke: '#91D5FF',
      lineWidth: 2,
      endArrow: {
        path: G6.Arrow.triangle(8, 10, 0),
        fill: '#91D5FF'
      }
    }
  },

  modes: {
    default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'click-select']
  },

  animate: true,
  animateCfg: {
    duration: 500,
    easing: 'easeCubic'
  },

  minZoom: 0.1,
  maxZoom: 5,
  fitView: true,
  fitViewPadding: [20, 40, 50, 20]
};
```

### B. 性能优化建议

1. **大规模数据**: 节点超过 500 个时，考虑使用 `renderer: 'svg'` 或分页加载
2. **动画性能**: 复杂动画在移动端可能卡顿，可根据设备性能动态关闭
3. **布局计算**: 力导向布局计算密集，大图建议使用 Web Worker
4. **内存管理**: 切换布局前调用 `graph.clear()` 清理旧数据

### C. 常见问题

| 问题 | 解决方案 |
|------|----------|
| 节点重叠 | 增加 `nodeSpacing` 或启用 `preventOverlap` |
| 边交叉严重 | 尝试 `dagre` 层次布局 |
| 动画卡顿 | 减少 `animateCfg.duration` 或关闭动画 |
| 缩放后模糊 | 使用 `renderer: 'svg'` |

---

> 文档版本: 1.0
> 最后更新: 2025-12
```

