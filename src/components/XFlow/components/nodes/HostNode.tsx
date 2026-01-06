import React from 'react';
import type { Node } from '@antv/x6';
import type { XFlowNodeData, NodeStatus } from '../../types/xflow';

interface HostNodeProps {
  node: Node;
}

/**
 * 主机节点组件
 */
export const HostNode: React.FC<HostNodeProps> = ({ node }) => {
  const nodeData = node.getData() as XFlowNodeData;
  if (!nodeData) {
    return (
      <div style={{
        width: '100px',
        height: '50px',
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
        return '#fa8c16';
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
      className="host-node"
      style={{
        width: '100px',
        height: '50px',
        border: `1px solid ${getStatusColor(status)}`,
        borderRadius: '4px',
        backgroundColor: '#fff7e6',
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

      {/* 主机名称 */}
      <div
        style={{
          fontWeight: 'bold',
          color: '#fa8c16',
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

      {/* IP地址 */}
      <div
        style={{
          fontSize: '8px',
          color: '#666',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          marginBottom: '1px',
        }}
        title={entity.attributes?.ip || '未知IP'}
      >
        {entity.attributes?.ip || '未知IP'}
      </div>

      {/* CPU使用率 */}
      <div
        style={{
          fontSize: '6px',
          color: '#666',
          textAlign: 'center',
          width: '100%',
        }}
        title={`CPU: ${entity.attributes?.cpuUsage || 0}%`}
      >
        CPU: {entity.attributes?.cpuUsage || 0}%
      </div>
    </div>
  );
};
