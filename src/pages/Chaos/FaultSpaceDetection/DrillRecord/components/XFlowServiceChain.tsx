import React, { FC, useCallback } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';

interface ServiceNode {
  id: string;
  name: string;
  layer: number;
  protocol: 'HTTP' | 'gRPC' | 'DB' | 'MQ';
  status: 'TESTED' | 'TESTING' | 'UNTESTED';
  x: number;
  y: number;
  testResults?: {
    faultScenarios: Array<{
      type: string;
      status: 'COMPLETED' | 'RUNNING' | 'PENDING';
      responseData?: any;
      latencyMetrics?: {
        p50: number;
        p95: number;
        p99: number;
      };
      errorRate?: number;
      performanceComparison?: {
        before: { p95: number; errorRate: number };
        during: { p95: number; errorRate: number };
        after: { p95: number; errorRate: number };
      };
    }>;
    currentFaultType?: string;
    remainingScenarios?: string[];
  };
  plannedFaults?: string[];
  dependencies?: string[];
}

interface XFlowServiceChainProps {
  serviceNodes: ServiceNode[];
  onServiceClick: (serviceId: string) => void;
  selectedService: ServiceNode | null;
}

const XFlowServiceChain: FC<XFlowServiceChainProps> = ({
  serviceNodes,
  onServiceClick,
  selectedService,
}) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TESTED': return '#52c41a';
      case 'TESTING': return '#1890ff';
      case 'UNTESTED': return '#d9d9d9';
      default: return '#d9d9d9';
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'HTTP': return '#52c41a';
      case 'gRPC': return '#1890ff';
      case 'DB': return '#faad14';
      case 'MQ': return '#722ed1';
      default: return '#666';
    }
  };

  const handleServiceClick = useCallback((serviceId: string) => {
    onServiceClick(serviceId);
  }, [ onServiceClick ]);

  const renderServiceNode = (node: ServiceNode) => {
    const statusColor = getStatusColor(node.status);
    const protocolColor = getProtocolColor(node.protocol);
    const isSelected = selectedService?.id === node.id;

    // Check if service has test results
    const hasTestResults = node.testResults && node.testResults.faultScenarios.length > 0;
    const completedScenarios = node.testResults?.faultScenarios.filter(s => s.status === 'COMPLETED').length || 0;
    const totalScenarios = node.testResults?.faultScenarios.length || 0;

    return (
      <g key={node.id} transform={`translate(${node.x - 60}, ${node.y - 30})`}>
        {/* Selection highlight */}
        {isSelected && (
          <rect
            width="124"
            height="64"
            rx="10"
            x="-2"
            y="-2"
            fill="none"
            stroke="#1890ff"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.8"
          />
        )}

        {/* Node background */}
        <rect
          width="120"
          height="60"
          rx="8"
          fill={isSelected ? '#e6f7ff' : '#fff'}
          stroke={statusColor}
          strokeWidth="3"
          style={{ cursor: 'pointer' }}
          onClick={() => handleServiceClick(node.id)}
        />

        {/* Protocol indicator bar */}
        <rect
          width="120"
          height="6"
          rx="4 4 0 0"
          fill={protocolColor}
          style={{ cursor: 'pointer' }}
          onClick={() => handleServiceClick(node.id)}
        />

        {/* Service name */}
        <text
          x="60"
          y="25"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="600"
          fill="#333"
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => handleServiceClick(node.id)}
        >
          {node.name}
        </text>

        {/* Protocol type */}
        <text
          x="60"
          y="38"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#666"
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => handleServiceClick(node.id)}
        >
          {node.protocol}
        </text>

        {/* Test progress indicator */}
        {hasTestResults && (
          <text
            x="60"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#666"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => handleServiceClick(node.id)}
          >
            {completedScenarios}/{totalScenarios} tests
          </text>
        )}

        {/* Status indicator */}
        <circle
          cx="105"
          cy="15"
          r="8"
          fill={statusColor}
          style={{ cursor: 'pointer' }}
          onClick={() => handleServiceClick(node.id)}
        />

        {/* Testing indicator for services currently being tested */}
        {node.status === 'TESTING' && (
          <g>
            <circle
              cx="15"
              cy="15"
              r="10"
              fill="#1890ff"
              opacity="0.8"
            >
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x="15"
              y="15"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="bold"
              fill="#fff"
              style={{ userSelect: 'none' }}
            >
              T
            </text>
          </g>
        )}

        {/* Fault configuration indicator */}
        {node.plannedFaults && node.plannedFaults.length > 0 && (
          <g>
            <circle
              cx="105"
              cy="45"
              r="10"
              fill="#ff4d4f"
              stroke="#fff"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => handleServiceClick(node.id)}
            />
            <text
              x="105"
              y="45"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight="bold"
              fill="#fff"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleServiceClick(node.id)}
            >
              {node.plannedFaults.length}
            </text>
          </g>
        )}
      </g>
    );
  };

  const renderConnections = () => {
    const connections = [
      // Layer 0 to Layer 1
      { from: 'api-gateway', to: 'user-service' },
      { from: 'api-gateway', to: 'auth-service' },
      { from: 'api-gateway', to: 'order-service' },

      // Layer 1 to Layer 2
      { from: 'user-service', to: 'user-db' },
      { from: 'user-service', to: 'cache' },
      { from: 'auth-service', to: 'auth-db' },
      { from: 'auth-service', to: 'cache' },
      { from: 'order-service', to: 'order-db' },
      { from: 'order-service', to: 'mq' },
    ];

    return connections.map((conn, index) => {
      const fromNode = serviceNodes.find(node => node.id === conn.from);
      const toNode = serviceNodes.find(node => node.id === conn.to);

      if (!fromNode || !toNode) return null;

      return (
        <line
          key={index}
          x1={fromNode.x}
          y1={fromNode.y + 30}
          x2={toNode.x}
          y2={toNode.y - 30}
          stroke="#d9d9d9"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  return (
    <div style={{
      border: '1px solid #e8e8e8',
      borderRadius: 6,
      overflow: 'hidden',
      background: '#fafafa',
      padding: 20,
    }}>
      <svg width="100%" height="400" viewBox="0 0 900 400">
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#d9d9d9"
            />
          </marker>
        </defs>

        {/* Render connections */}
        {renderConnections()}

        {/* Render service nodes */}
        {serviceNodes.map(renderServiceNode)}
      </svg>
    </div>
  );
};

export default XFlowServiceChain;
