import React from 'react';
import type { Node } from '@antv/x6';
import type { XFlowNodeData, NodeStatus } from '../../types/xflow';

interface ServiceNodeProps {
  node: Node;
}

/**
 * 服务节点组件
 * 展示微服务相关信息和 RED 指标
 */
export const ServiceNode: React.FC<ServiceNodeProps> = ({ node }) => {
  const nodeData = node.getData() as XFlowNodeData;
  if (!nodeData) {
    return (
      <div style={{
        width: '120px',
        height: '60px',
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

  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'success':
        return '#52c41a';
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
      className="service-node"
      style={{
        width: '120px',
        height: '60px',
        border: `2px solid ${getStatusColor(status)}`,
        borderRadius: '6px',
        backgroundColor: '#52c41a12', // 淡绿色背景
        padding: '4px',
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
          top: '2px',
          right: '2px',
          fontSize: '8px',
        }}
      >
        {getStatusIcon(status)}
      </div>

      {/* 服务名称 */}
      <div
        style={{
          fontWeight: 'bold',
          color: '#52c41a', // 强制使用绿色
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
        应用 {entity.name || entity.displayName}
      </div>

      {/* RED 指标 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: '2px',
          fontSize: '8px',
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

      {/* 请求数量 */}
      <div
        style={{
          fontSize: '8px',
          color: '#999',
          marginTop: '1px',
        }}
        title={`总请求数: ${redMetrics.count}`}
      >
        📊 {redMetrics.count} 次
      </div>
    </div>
  );
};
