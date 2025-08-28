// XFlow 相关类型定义

import type { Node, Edge } from '@antv/x6';
import type { EntityType, RelationType, RedMetrics, Entity, NodeStatus } from './topology';

// 适配 API 返回的数据结构
export interface XFlowNodeData {
  entity: Entity;
  redMetrics: RedMetrics;
  entityType: string;
  status: NodeStatus;
  displayName: string;
}

export interface XFlowEdgeData {
  type: string;
  redMetrics: RedMetrics;
}

// 与API返回结构匹配的节点接口
export interface XFlowNode {
  id: string;
  label: string;
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  entityType?: string;
  redMetrics?: RedMetrics;
  entity?: Entity;
  attrs: {
    body: {
      fill: string;
      stroke: string;
      strokeWidth: number;
      rx?: number;
      ry?: number;
      strokeDasharray?: string;
    };
    text: {
      fontSize: number;
      fill: string;
      textAnchor?: string;
      textVerticalAnchor?: string;
      textWrap?: {
        width: string;
        height: string;
      };
      text?: string;
    };
  };
  data: XFlowNodeData;
}

// 与API返回结构匹配的边接口
export interface XFlowEdge {
  id: string;
  source: string;
  target: string;
  shape: string;
  type?: string;
  redMetrics?: RedMetrics;
  label?: {
    text: string;
    fontSize: number;
    fill: string;
    position?: number;
  };
  attrs: {
    line: {
      stroke: string;
      strokeWidth: number;
      targetMarker: any;
      strokeDasharray?: string;
    };
  };
  data: XFlowEdgeData;
}

export interface XFlowData {
  nodes: XFlowNode[];
  edges: XFlowEdge[];
  statistics: {
    nodeCount: number;
    edgeCount: number;
    nodeTypeCount: Record<EntityType, number>;
    edgeTypeCount: Record<RelationType, number>;
  };
  metadata: {
    title: string;
    description: string;
    version: string;
    createdAt: number;
    updatedAt: number;
  };
}

export interface LayoutRequest {
  algorithm: string;
  direction?: string;
  options?: Record<string, any>;
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeSize {
  width: number;
  height: number;

}

export type LayoutAlgorithm = 'dagre' | 'force' | 'grid' | 'circular';
export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';
