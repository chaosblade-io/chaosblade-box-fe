import React from 'react';
import type { Node } from '@antv/x6';
import type { XFlowNodeData, NodeStatus } from '../../types/xflow';

interface RpcGroupNodeProps {
  node: Node;
}

/**
 * RPC组节点组件
 */
export const RpcGroupNode: React.FC<RpcGroupNodeProps> = ({ node }) => {
  const nodeData = node.getData() as XFlowNodeData;
  if (!nodeData) {
    return (
      <div style={{
        width: '140px',
        height: '50px',
        border: '2px solid #d9d9d9',
        borderRadius: '6px',
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
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
        return '#ff4d4f';
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
      className="rpc-group-node"
      style={{
        width: '140px',
        height: '50px',
        border: `2px solid ${getStatusColor(status)}`,
        borderRadius: '6px',
        backgroundColor: '#fff2f0',
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '10px',
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {/* 状态指示器 */}
      <div
        style={{
          position: 'absolute',
          top: '3px',
          right: '3px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(status),
        }}
      />

      {/* RPC组名称 */}
      <div
        style={{
          fontWeight: 'bold',
          color: '#ff4d4f',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          fontSize: '12px',
          marginBottom: '2px',
        }}
        title={entity.displayName}
      >
        {entity.displayName}
      </div>

      {/* 统计信息 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          fontSize: '8px',
          color: '#666',
        }}
      >
        <span title={`RPC数量: ${entity.attributes?.rpcCount || 0}`}>
          📡 {entity.attributes?.rpcCount || 0}
        </span>
        <span title={`调用次数: ${redMetrics.count}`}>
          📊 {redMetrics.count}
        </span>
      </div>
    </div>
  );
};
