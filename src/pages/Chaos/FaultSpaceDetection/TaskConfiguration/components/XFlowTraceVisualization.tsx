import React, { FC, useState, useEffect, useRef, useCallback } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import {
  Button,
  Message,
  Icon,
  Drawer,
  Checkbox,
  Input,
  Select,
  NumberPicker,
  Tag,
  Balloon,
} from '@alicloud/console-components';

// XFlow imports - we'll use a simplified approach for now
// In a real implementation, you would install @antv/xflow and import properly
// For now, we'll create a high-quality SVG-based visualization

interface TraceConfigData {
  baselineTrace: any;
  faultConfigurations: Array<{
    serviceId: string;
    serviceName: string;
    layer: number;
    faultTemplates: Array<{
      type: string;
      enabled: boolean;
      parameters: Record<string, any>;
    }>;
  }>;
}

interface XFlowTraceVisualizationProps {
  data: TraceConfigData;
  errors?: string[];
  onChange: (data: Partial<TraceConfigData>) => void;
}

interface ServiceNode {
  id: string;
  name: string;
  layer: number;
  protocol: 'HTTP' | 'gRPC' | 'DB' | 'MQ';
  x: number;
  y: number;
  selected: boolean;
  status: 'TESTED' | 'TESTING' | 'UNTESTED';
}

interface FaultTemplate {
  type: string;
  name: string;
  description: string;
  category: 'NETWORK' | 'RESOURCE' | 'APPLICATION' | 'INFRASTRUCTURE';
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: string[];
    description: string;
  }>;
}

const XFlowTraceVisualization: FC<XFlowTraceVisualizationProps> = ({ data, errors, onChange }) => {
  const [ serviceNodes, setServiceNodes ] = useState<ServiceNode[]>([]);
  const [ selectedService, setSelectedService ] = useState<ServiceNode | null>(null);
  const [ faultDrawerVisible, setFaultDrawerVisible ] = useState(false);
  const [ availableFaultTemplates ] = useState<FaultTemplate[]>([
    {
      type: 'NETWORK_DELAY',
      name: 'Network Delay',
      description: 'Inject network latency to simulate slow network conditions',
      category: 'NETWORK',
      parameters: [
        { name: 'delay', type: 'number', required: true, defaultValue: 100, description: 'Delay in milliseconds' },
        { name: 'variance', type: 'number', required: false, defaultValue: 10, description: 'Delay variance percentage' },
      ],
    },
    {
      type: 'CPU_STRESS',
      name: 'CPU Stress',
      description: 'Consume CPU resources to simulate high load',
      category: 'RESOURCE',
      parameters: [
        { name: 'cpuPercent', type: 'number', required: true, defaultValue: 80, description: 'CPU usage percentage' },
        { name: 'duration', type: 'number', required: true, defaultValue: 60, description: 'Duration in seconds' },
      ],
    },
    {
      type: 'MEMORY_LEAK',
      name: 'Memory Leak',
      description: 'Gradually consume memory to simulate memory leaks',
      category: 'RESOURCE',
      parameters: [
        { name: 'memoryMB', type: 'number', required: true, defaultValue: 512, description: 'Memory to consume in MB' },
        { name: 'rate', type: 'number', required: false, defaultValue: 10, description: 'Consumption rate MB/s' },
      ],
    },
    {
      type: 'PROCESS_KILL',
      name: 'Process Kill',
      description: 'Terminate service processes to test recovery',
      category: 'APPLICATION',
      parameters: [
        { name: 'signal', type: 'select', required: true, defaultValue: 'SIGTERM', options: [ 'SIGTERM', 'SIGKILL' ], description: 'Kill signal' },
      ],
    },
  ]);

  useEffect(() => {
    generateMockServiceTopology();
  }, []);

  const generateMockServiceTopology = () => {
    const mockNodes: ServiceNode[] = [
      // Layer 0 (Entry point)
      { id: 'api-gateway', name: 'API Gateway', layer: 0, protocol: 'HTTP', x: 400, y: 80, selected: false, status: 'UNTESTED' },

      // Layer 1 (Services)
      { id: 'user-service', name: 'User Service', layer: 1, protocol: 'HTTP', x: 200, y: 200, selected: false, status: 'UNTESTED' },
      { id: 'auth-service', name: 'Auth Service', layer: 1, protocol: 'gRPC', x: 400, y: 200, selected: false, status: 'UNTESTED' },
      { id: 'order-service', name: 'Order Service', layer: 1, protocol: 'HTTP', x: 600, y: 200, selected: false, status: 'UNTESTED' },

      // Layer 2 (Data stores)
      { id: 'user-db', name: 'User Database', layer: 2, protocol: 'DB', x: 150, y: 320, selected: false, status: 'UNTESTED' },
      { id: 'auth-db', name: 'Auth Database', layer: 2, protocol: 'DB', x: 300, y: 320, selected: false, status: 'UNTESTED' },
      { id: 'cache', name: 'Redis Cache', layer: 2, protocol: 'DB', x: 450, y: 320, selected: false, status: 'UNTESTED' },
      { id: 'order-db', name: 'Order Database', layer: 2, protocol: 'DB', x: 600, y: 320, selected: false, status: 'UNTESTED' },
      { id: 'mq', name: 'Message Queue', layer: 2, protocol: 'MQ', x: 750, y: 320, selected: false, status: 'UNTESTED' },
    ];

    setServiceNodes(mockNodes);
  };

  const handleServiceClick = useCallback((serviceId: string) => {
    const service = serviceNodes.find(node => node.id === serviceId);
    if (service) {
      setSelectedService(service);
      setFaultDrawerVisible(true);

      // Update selected state
      setServiceNodes(prev => prev.map(node => ({
        ...node,
        selected: node.id === serviceId,
      })));
    }
  }, [ serviceNodes ]);

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

  const renderServiceNode = (node: ServiceNode) => {
    const statusColor = getStatusColor(node.status);
    const protocolColor = getProtocolColor(node.protocol);

    // Check if this service has fault configuration
    const hasFaultConfig = data.faultConfigurations.some(config =>
      config.serviceId === node.id && config.faultTemplates.some(template => template.enabled),
    );

    return (
      <g key={node.id} transform={`translate(${node.x - 60}, ${node.y - 25})`}>
        {/* Glow effect for services with fault configuration */}
        {hasFaultConfig && (
          <rect
            width="124"
            height="54"
            rx="10"
            x="-2"
            y="-2"
            fill="none"
            stroke="#ff4d4f"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.6"
            style={{ cursor: 'pointer' }}
            onClick={() => handleServiceClick(node.id)}
          />
        )}

        {/* Node background */}
        <rect
          width="120"
          height="50"
          rx="8"
          fill={node.selected ? '#e6f7ff' : (hasFaultConfig ? '#fff2f0' : '#fff')}
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

        {/* Status indicator */}
        <circle
          cx="105"
          cy="15"
          r="4"
          fill={statusColor}
          style={{ cursor: 'pointer' }}
          onClick={() => handleServiceClick(node.id)}
        />

        {/* Fault Configuration Indicator */}
        {hasFaultConfig && (
          <g>
            {/* Fault configuration badge background */}
            <circle
              cx="15"
              cy="15"
              r="8"
              fill="#ff4d4f"
              stroke="#fff"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => handleServiceClick(node.id)}
            />

            {/* Fault configuration icon (lightning bolt) */}
            <path
              d="M12 8 L18 8 L15 15 L18 15 L12 22 L15 15 L12 15 Z"
              fill="#fff"
              fontSize="8"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleServiceClick(node.id)}
              transform="scale(0.4) translate(12, 12)"
            />

            {/* Alternative: Simple exclamation mark */}
            <text
              x="15"
              y="19"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#fff"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => handleServiceClick(node.id)}
            >
              !
            </text>
          </g>
        )}

        {/* Fault Configuration Count Badge (if multiple faults configured) */}
        {hasFaultConfig && (() => {
          const faultCount = data.faultConfigurations
            .find(config => config.serviceId === node.id)
            ?.faultTemplates.filter(template => template.enabled).length || 0;

          if (faultCount > 1) {
            return (
              <g>
                {/* Count badge background */}
                <circle
                  cx="105"
                  cy="35"
                  r="6"
                  fill="#1890ff"
                  stroke="#fff"
                  strokeWidth="1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleServiceClick(node.id)}
                />

                {/* Count text */}
                <text
                  x="105"
                  y="38"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#fff"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleServiceClick(node.id)}
                >
                  {faultCount}
                </text>
              </g>
            );
          }
          return null;
        })()}
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
          y1={fromNode.y + 25}
          x2={toNode.x}
          y2={toNode.y - 25}
          stroke="#d9d9d9"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>3</span>
            <Translation>Trace Visualization & Fault Configuration</Translation>
          </div>
          <div className={styles.sectionDescription}>
            <Translation>Visualize service topology and configure fault injection scenarios</Translation>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors && errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.map((error, index) => (
            <div key={index} className={styles.errorItem}>
              <Icon type="exclamation-circle" size="xs" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Service Topology Visualization */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: 0 }}>
            <Icon type="share-alt" style={{ marginRight: 8 }} />
            <Translation>Service Topology</Translation>
          </h4>
          <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span><Translation>Click services to configure fault injection</Translation></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#52c41a' }}>●</span> <Translation>Tested</Translation>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#1890ff' }}>●</span> <Translation>Testing</Translation>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#d9d9d9' }}>●</span> <Translation>Untested</Translation>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#ff4d4f',
                  color: '#fff',
                  fontSize: 8,
                  textAlign: 'center',
                  lineHeight: '12px',
                  fontWeight: 'bold',
                }}>!</span>
                <Translation>Fault Configured</Translation>
              </span>
            </div>
          </div>
        </div>

        <div style={{
          border: '1px solid #e8e8e8',
          borderRadius: 8,
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
      </div>

      {/* Fault Configuration Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon type="setting" />
            <span>
              <Translation>Configure Fault Injection</Translation>: {selectedService?.name}
            </span>
          </div>
        }
        placement="right"
        width={600}
        visible={faultDrawerVisible}
        onClose={() => setFaultDrawerVisible(false)}
      >
        {selectedService && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                <Translation>Service Information</Translation>
              </h4>
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #e8e8e8',
                borderRadius: 6,
                padding: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Tag color={getProtocolColor(selectedService.protocol)} size="medium">
                    {selectedService.protocol}
                  </Tag>
                  <Tag color={getStatusColor(selectedService.status)} size="medium">
                    {selectedService.status}
                  </Tag>
                </div>
                <div style={{ fontSize: 14, color: '#666' }}>
                  <Translation>Layer</Translation>: {selectedService.layer} |
                  <Translation>Service ID</Translation>: {selectedService.id}
                </div>
              </div>
            </div>

            {/* Current Fault Configuration Summary */}
            {(() => {
              const currentConfig = data.faultConfigurations.find(
                config => config.serviceId === selectedService.id,
              );
              const enabledFaults = currentConfig?.faultTemplates.filter(t => t.enabled) || [];

              if (enabledFaults.length > 0) {
                return (
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                      <Translation>Currently Configured Faults</Translation>
                    </h4>
                    <div style={{
                      background: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 16,
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {enabledFaults.map((fault, index) => {
                          const template = availableFaultTemplates.find(t => t.type === fault.type);
                          return (
                            <Tag key={index} color="#52c41a" size="medium">
                              {template?.name || fault.type}
                            </Tag>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                        <Translation>Total configured faults</Translation>: {enabledFaults.length}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                <Translation>Available Fault Templates</Translation>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {availableFaultTemplates.map((template, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #e8e8e8',
                      borderRadius: 6,
                      padding: 16,
                      background: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <Checkbox
                        checked={(() => {
                          const currentConfig = data.faultConfigurations.find(
                            config => config.serviceId === selectedService.id,
                          );
                          return currentConfig?.faultTemplates.some(t => t.type === template.type && t.enabled) || false;
                        })()}
                        onChange={checked => {
                          // Handle fault template selection
                          const currentConfig = data.faultConfigurations.find(
                            config => config.serviceId === selectedService.id,
                          );

                          if (currentConfig) {
                            const updatedTemplates = checked
                              ? [ ...currentConfig.faultTemplates.filter(t => t.type !== template.type), {
                                type: template.type,
                                enabled: true,
                                parameters: {},
                              }]
                              : currentConfig.faultTemplates.filter(t => t.type !== template.type);

                            onChange({
                              faultConfigurations: data.faultConfigurations.map(config =>
                                (config.serviceId === selectedService.id
                                  ? { ...config, faultTemplates: updatedTemplates }
                                  : config),
                              ),
                            });
                          } else {
                            onChange({
                              faultConfigurations: [
                                ...data.faultConfigurations,
                                {
                                  serviceId: selectedService.id,
                                  serviceName: selectedService.name,
                                  layer: selectedService.layer,
                                  faultTemplates: [{
                                    type: template.type,
                                    enabled: true,
                                    parameters: {},
                                  }],
                                },
                              ],
                            });
                          }
                        }}
                      >
                        <strong>{template.name}</strong>
                      </Checkbox>
                      <Tag color="#666" size="small">
                        {template.category}
                      </Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                      {template.description}
                    </div>

                    {/* Parameter Configuration */}
                    <div style={{ marginLeft: 24 }}>
                      {template.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: 12, color: '#333', marginBottom: 4, display: 'block' }}>
                            {param.name} {param.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                          </label>
                          {param.type === 'number' && (
                            <NumberPicker
                              size="small"
                              defaultValue={param.defaultValue}
                              style={{ width: '100%' }}
                            />
                          )}
                          {param.type === 'string' && (
                            <Input
                              size="small"
                              defaultValue={param.defaultValue}
                              style={{ width: '100%' }}
                            />
                          )}
                          {param.type === 'select' && (
                            <Select
                              size="small"
                              defaultValue={param.defaultValue}
                              dataSource={param.options?.map(opt => ({ label: opt, value: opt }))}
                              style={{ width: '100%' }}
                            />
                          )}
                          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                            {param.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #e8e8e8',
              paddingTop: 16,
              display: 'flex',
              gap: 12,
            }}>
              <Button type="primary" onClick={() => setFaultDrawerVisible(false)}>
                <Translation>Apply Configuration</Translation>
              </Button>
              <Button onClick={() => setFaultDrawerVisible(false)}>
                <Translation>Cancel</Translation>
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default XFlowTraceVisualization;
