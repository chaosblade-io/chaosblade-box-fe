import React from 'react';
import type { Node } from '@antv/x6';
import type { XFlowNodeData, NodeStatus } from '../../types/xflow';

interface NamespaceNodeProps {
  node: Node;
}

/**
 * 命名空间节点组件
 */
export const NamespaceNode: React.FC<NamespaceNodeProps> = ({ node }) => {
  const nodeData = node.getData() as XFlowNodeData;
  if (!nodeData) {
    return (
      <div style={{
        width: '160px',
        height: '80px',
        border: '2px solid #d9d9d9',
        borderRadius: '8px',
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
        return '#1890ff';
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
      className="namespace-node"
      style={{
        width: '160px',
        height: '80px',
        border: `2px solid ${getStatusColor(status)}`,
        borderRadius: '8px',
        backgroundColor: '#e6f7ff',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '10px',
        position: 'relative',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      {/* 状态指示器 */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(status),
        }}
      />

      {/* 命名空间名称 */}
      <div
        style={{
          fontWeight: 'bold',
          color: '#1890ff',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          fontSize: '14px',
          marginBottom: '4px',
        }}
        title={entity.displayName}
      >
        {entity.displayName}
      </div>

      {/* 命名空间ID */}
      <div
        style={{
          fontSize: '10px',
          color: '#666',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          marginBottom: '4px',
        }}
        title={entity.entityId}
      >
        ID: {entity.entityId.substring(0, 8)}...
      </div>

      {/* RED 指标概览 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          fontSize: '8px',
          color: '#666',
        }}
      >
        <span title={`服务数: ${entity.attributes?.serviceCount || 0}`}>
          🏢 {entity.attributes?.serviceCount || 0}
        </span>
        <span title={`实例数: ${entity.attributes?.instanceCount || 0}`}>
          🖥️ {entity.attributes?.instanceCount || 0}
        </span>
      </div>
    </div>
  );
};
