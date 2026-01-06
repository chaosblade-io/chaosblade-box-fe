// API 相关类型定义

import type { XFlowData, LayoutRequest } from './xflow';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface NodeDetailsResponse {
  nodeId: string;
  displayName: string;
  entityType: string;
  entity: any;
  redMetrics: any;
  status: string;
}

export interface ApiError {
  error: string;
  message: string;
  nodeId?: string;
}

export interface XFlowApiService {
  getTopology(): Promise<XFlowData>;
  refreshTopology(): Promise<XFlowData>;
  getNodeDetails(nodeId: string): Promise<NodeDetailsResponse>;
  applyLayout(layoutRequest: LayoutRequest): Promise<XFlowData>;
}
