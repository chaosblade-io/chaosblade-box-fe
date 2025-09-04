// 拓扑图相关类型定义

export interface RedMetrics {
  errorRate: number;
  successRate: number;
  healthy: boolean;
  count: number;
  error: number;
  rt: number;
  status: string;
}

export interface Entity {
  entityId: string;
  type: EntityType;
  displayName: string;
  name: string;
  appId?: string;
  regionId: string;
  firstSeen: number;
  lastSeen: number;
  attributes: Record<string, any>;
}

export interface TopologyNode {
  entityType: EntityType;
  redMetrics: RedMetrics;
  displayName: string;
  nodeId: string;
  entity: Entity;
  attrs: {
    RED: RedMetrics;
    extensions: Record<string, any>;
  };
}

export interface TopologyEdge {
  redMetrics: RedMetrics;
  edgeId: string;
  from: string;
  to: string;
  type: RelationType;
  firstSeen: number;
  lastSeen: number;
  attrs: {
    RED: RedMetrics;
    extensions: Record<string, any>;
  };
}

export interface TopologyStatistics {
  nodeCount: number;
  edgeCount: number;
  nodeTypeCount: Record<EntityType, number>;
  edgeTypeCount: Record<RelationType, number>;
}

export interface TopologyMetadata {
  title: string;
  description: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}

export interface TopologyData {
  statistics: TopologyStatistics;
  empty: boolean;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  metadata: TopologyMetadata;
}

export enum EntityType {
  SERVICE = 'SERVICE',
  NAMESPACE = 'NAMESPACE',
  RPC = 'RPC',
  RPC_GROUP = 'RPC_GROUP',
  HOST = 'HOST'
}

export enum RelationType {
  DEPENDS_ON = 'DEPENDS_ON',
  CONTAINS = 'CONTAINS',
  INVOKES = 'INVOKES',
  RUNS_ON = 'RUNS_ON'
}

export type NodeStatus = 'success' | 'warning' | 'error' | 'unknown';
