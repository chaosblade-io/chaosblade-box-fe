/**
 * MicroGraph 核心类型定义
 */

export interface MicroGraphNode {
  id: string;                           // k8s.workload.pod/default/nginx-abc
  type: string;                         // k8s.workload.pod
  domain: string;                       // k8s.workload
  name: string;                         // nginx-abc
  namespace?: string;                   // default
  labels: Record<string, string>;
  properties: Record<string, any>;
  status: NodeStatus;
}

export interface MicroGraphEdge {
  id: string;
  type: EdgeType;
  source: string;
  target: string;
  properties: Record<string, any>;
}

export type NodeStatus = 'running' | 'warning' | 'error' | 'pending' | 'terminated';

export type EdgeType =
  | 'contains'
  | 'owns'
  | 'manages'
  | 'creates'
  | 'selects'
  | 'routes_to'
  | 'runs_on'
  | 'mounts'
  | 'claims'
  | 'calls';  // Service 调用关系

export interface GraphData {
  nodes: MicroGraphNode[];
  edges: MicroGraphEdge[];
  domains: Domain[];
}

export interface Domain {
  key: string;
  name: string;
  color: string;
  icon: string;
  entityCount: number;
}

// G6 数据格式
export interface G6Node {
  id: string;
  label: string;
  type: string;
  style?: Partial<G6NodeStyle>;
  data: MicroGraphNode;
}

export interface G6Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  style?: Partial<G6EdgeStyle>;
  data: MicroGraphEdge;
}

export interface G6GraphData {
  nodes: G6Node[];
  edges: G6Edge[];
}

export interface G6NodeStyle {
  fill: string;
  stroke: string;
  lineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  opacity: number;
  cursor: string;
}

export interface G6EdgeStyle {
  stroke: string;
  lineWidth: number;
  opacity: number;
  lineDash: number[] | null;
  endArrow: any;
}

// 布局类型
export type LayoutType = 'force' | 'dagre' | 'circular' | 'grid' | 'radial' | 'concentric';

// 过滤器配置
export interface FilterConfig {
  domains: string[];
  namespaces: string[];
  resourceTypes: string[];
  statuses: NodeStatus[];
  searchText: string;
}

// 统计信息
export interface GraphStatistics {
  totalNodes: number;
  totalEdges: number;
  domainStats: Record<string, number>;
  statusStats: Record<NodeStatus, number>;
  namespaceStats: Record<string, number>;
}

