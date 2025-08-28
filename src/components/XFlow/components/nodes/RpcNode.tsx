import React from 'react';
import type { Node } from '@antv/x6';
import type { XFlowNodeData, NodeStatus } from '../../types/xflow';

interface RpcNodeProps {
  node: Node;
}

/**
 * RPC节点组件
 */
export const RpcNode: React.FC<RpcNodeProps> = ({ node }) => {
  const nodeData = node.getData() as XFlowNodeData;
  if (!nodeData) {
    return (
      <div style={{
        width: '100px',
        height: '40px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#999',
      }}>
        无数据
      </div>
    );
  }

  const { entity, redMetrics, status } = nodeData;

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'success':
        return '#722ed1';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  return (
    <div
      className="rpc-node"
      style={{
        width: '100px',
        height: '40px',
        border: `1px solid ${getStatusColor(status)}`,
        borderRadius: '4px',
        backgroundColor: '#f9f0ff',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '8px',
        position: 'relative',
      }}
    >
      {/* 状态指示器 */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(status),
        }}
      />

      {/* RPC名称 */}
      <div
        style={{
          fontWeight: 'bold',
          color: '#722ed1',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          fontSize: '10px',
          marginBottom: '1px',
        }}
        title={entity.displayName}
      >
        {entity.displayName}
      </div>

      {/* RED 指标 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          fontSize: '6px',
          color: '#666',
        }}
      >
        <span title={`成功率: ${redMetrics.successRate}%`}>
          ✓ {redMetrics.successRate}%
        </span>
        <span title={`响应时间: ${redMetrics.rt}ms`}>
          ⏱ {redMetrics.rt}ms
        </span>
      </div>
    </div>
  );
};
