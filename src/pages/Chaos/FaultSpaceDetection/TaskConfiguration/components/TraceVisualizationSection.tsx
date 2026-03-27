import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
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
import ReadOnlyServiceTopology from '../../TaskDetail/components/ReadOnlyServiceTopology';

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

interface TraceVisualizationSectionProps {
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
  p95Latency?: number;
  callCount?: number;
}

interface FaultTemplate {
  type: string;
  name: string;
  description: string;
  parameters: Array<{
    key: string;
    name: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    default: any;
    min?: number;
    max?: number;
    options?: Array<{ label: string; value: any }>;
    unit?: string;
  }>;
}

const TraceVisualizationSection: FC<TraceVisualizationSectionProps> = ({ data, errors, onChange }) => {
  const [ selectedService, setSelectedService ] = useState<ServiceNode | null>(null);
  const [ faultDrawerVisible, setFaultDrawerVisible ] = useState(false);

  // Convert baselineTrace data to RONode[]/ROEdge[] for ReadOnlyServiceTopology
  const topoNodes = useMemo(() => {
    const raw = data?.baselineTrace?.nodes || [];
    return raw.map((n: any) => ({
      id: n.id ?? n.nodeKey ?? n.name,
      name: n.name || n.nodeKey || String(n.id),
      layer: n.layer,
      protocol: n.protocol || 'HTTP',
    }));
  }, [data?.baselineTrace?.nodes]);

  const topoEdges = useMemo(() => {
    const raw = data?.baselineTrace?.edges || [];
    return raw.map((e: any) => ({
      id: e.id,
      fromNodeId: e.fromNodeId ?? e.source,
      toNodeId: e.toNodeId ?? e.target,
    }));
  }, [data?.baselineTrace?.edges]);

  const hasTopology = topoNodes.length > 0;

  // Fault templates configuration
  const faultTemplates: FaultTemplate[] = [
    {
      type: 'network_delay',
      name: i18n.t('Network Delay').toString(),
      description: i18n.t('Inject network latency to simulate slow network conditions').toString(),
      parameters: [
        { key: 'delay', name: i18n.t('Delay (ms)').toString(), type: 'number', default: 100, min: 0, max: 5000, unit: 'ms' },
        { key: 'variance', name: i18n.t('Variance (%)').toString(), type: 'number', default: 10, min: 0, max: 100, unit: '%' },
      ],
    },
    {
      type: 'packet_loss',
      name: i18n.t('Packet Loss').toString(),
      description: i18n.t('Simulate network packet loss').toString(),
      parameters: [
        { key: 'lossRate', name: i18n.t('Loss Rate (%)').toString(), type: 'number', default: 5, min: 0, max: 100, unit: '%' },
      ],
    },
    {
      type: 'cpu_stress',
      name: i18n.t('CPU Stress').toString(),
      description: i18n.t('Increase CPU usage to simulate high load').toString(),
      parameters: [
        { key: 'cpuPercent', name: i18n.t('CPU Usage (%)').toString(), type: 'number', default: 80, min: 0, max: 100, unit: '%' },
        { key: 'duration', name: i18n.t('Duration (s)').toString(), type: 'number', default: 60, min: 1, max: 3600, unit: 's' },
      ],
    },
    {
      type: 'memory_stress',
      name: i18n.t('Memory Stress').toString(),
      description: i18n.t('Consume memory to simulate memory pressure').toString(),
      parameters: [
        { key: 'memoryMB', name: i18n.t('Memory (MB)').toString(), type: 'number', default: 512, min: 1, max: 8192, unit: 'MB' },
        { key: 'duration', name: i18n.t('Duration (s)').toString(), type: 'number', default: 60, min: 1, max: 3600, unit: 's' },
      ],
    },
    {
      type: 'io_stress',
      name: i18n.t('IO Stress').toString(),
      description: i18n.t('Generate disk I/O load').toString(),
      parameters: [
        { key: 'workers', name: i18n.t('Workers').toString(), type: 'number', default: 4, min: 1, max: 16 },
        { key: 'size', name: i18n.t('File Size (MB)').toString(), type: 'number', default: 100, min: 1, max: 1024, unit: 'MB' },
      ],
    },
    {
      type: 'process_kill',
      name: i18n.t('Process Kill').toString(),
      description: i18n.t('Terminate process to simulate service failure').toString(),
      parameters: [
        { key: 'signal', name: i18n.t('Signal').toString(), type: 'select', default: 'SIGTERM',
          options: [
            { label: 'SIGTERM', value: 'SIGTERM' },
            { label: 'SIGKILL', value: 'SIGKILL' },
            { label: 'SIGSTOP', value: 'SIGSTOP' },
          ],
        },
        { key: 'restartDelay', name: i18n.t('Restart Delay (s)').toString(), type: 'number', default: 10, min: 0, max: 300, unit: 's' },
      ],
    },
    {
      type: 'http_abort',
      name: i18n.t('HTTP Abort').toString(),
      description: i18n.t('Return HTTP error responses').toString(),
      parameters: [
        { key: 'statusCode', name: i18n.t('Status Code').toString(), type: 'select', default: 500,
          options: [
            { label: '400 Bad Request', value: 400 },
            { label: '401 Unauthorized', value: 401 },
            { label: '403 Forbidden', value: 403 },
            { label: '404 Not Found', value: 404 },
            { label: '500 Internal Server Error', value: 500 },
            { label: '502 Bad Gateway', value: 502 },
            { label: '503 Service Unavailable', value: 503 },
            { label: '504 Gateway Timeout', value: 504 },
          ],
        },
        { key: 'percentage', name: i18n.t('Percentage (%)').toString(), type: 'number', default: 50, min: 1, max: 100, unit: '%' },
      ],
    },
  ];

  const handleNodeSelect = (nodeId: string | number, node?: any) => {
    if (node) {
      setSelectedService({
        id: String(nodeId),
        name: node.name || String(nodeId),
        layer: node.layer ?? 0,
        protocol: node.protocol || 'HTTP',
        x: 0, y: 0, selected: true,
      });
      setFaultDrawerVisible(true);
    }
  };

  const updateFaultConfiguration = (serviceId: string, faultTemplates: any[]) => {
    const existingConfig = data.faultConfigurations.find(f => f.serviceId === serviceId);
    const service = topoNodes.find((s: any) => String(s.id) === serviceId);

    if (!service) return;

    const newConfig = {
      serviceId,
      serviceName: service.name,
      layer: service.layer,
      faultTemplates,
    };

    const updatedConfigurations = existingConfig
      ? data.faultConfigurations.map(f => (f.serviceId === serviceId ? newConfig : f))
      : [ ...data.faultConfigurations, newConfig ];

    onChange({
      faultConfigurations: updatedConfigurations,
    });
  };

  const renderFaultConfigurationDrawer = () => {
    if (!selectedService) return null;

    const existingConfig = data.faultConfigurations.find(f => f.serviceId === selectedService.id);
    const currentFaultTemplates = existingConfig?.faultTemplates || [];

    const handleTemplateToggle = (templateType: string, enabled: boolean) => {
      const template = faultTemplates.find(t => t.type === templateType);
      if (!template) return;

      const updatedTemplates = enabled
        ? [
          ...currentFaultTemplates.filter(t => t.type !== templateType),
          {
            type: templateType,
            enabled: true,
            parameters: template.parameters.reduce((acc, param) => ({
              ...acc,
              [param.key]: param.default,
            }), {}),
          },
        ]
        : currentFaultTemplates.filter(t => t.type !== templateType);

      updateFaultConfiguration(selectedService.id, updatedTemplates);
    };

    const handleParameterChange = (templateType: string, paramKey: string, value: any) => {
      const updatedTemplates = currentFaultTemplates.map(template => {
        if (template.type === templateType) {
          return {
            ...template,
            parameters: {
              ...template.parameters,
              [paramKey]: value,
            },
          };
        }
        return template;
      });

      updateFaultConfiguration(selectedService.id, updatedTemplates);
    };

    return (
      <Drawer
        visible={faultDrawerVisible}
        title={
          <div>
            <Translation>Fault Configuration</Translation>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {selectedService.name} ({selectedService.protocol})
            </div>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => setFaultDrawerVisible(false)}
      >
        <div style={{ padding: '0 24px 24px 24px' }}>
          {/* Service Information */}
          <div style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 6,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>
                <Translation>Service</Translation>: {selectedService.name}
              </span>
              <Tag color={selectedService.protocol === 'HTTP' ? '#52c41a' :
                selectedService.protocol === 'gRPC' ? '#1890ff' :
                  selectedService.protocol === 'DB' ? '#faad14' : '#722ed1'}>
                {selectedService.protocol}
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <Translation>Layer</Translation>: L{selectedService.layer} |
              P95: {selectedService.p95Latency}ms |
              <Translation>Calls</Translation>: {selectedService.callCount}
            </div>
          </div>

          {/* Fault Templates */}
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              <Translation>Fault Templates</Translation>
            </h4>

            {faultTemplates.map(template => {
              const isEnabled = currentFaultTemplates.some(t => t.type === template.type && t.enabled);
              const currentTemplate = currentFaultTemplates.find(t => t.type === template.type);

              return (
                <div key={template.type} style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  marginBottom: 16,
                  background: isEnabled ? '#f6ffed' : '#fff',
                }}>
                  <div style={{ padding: 16, borderBottom: isEnabled ? '1px solid #e8e8e8' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <Checkbox
                        checked={isEnabled}
                        onChange={checked => handleTemplateToggle(template.type, checked)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {template.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parameters */}
                  {isEnabled && currentTemplate && (
                    <div style={{ padding: 16 }}>
                      {template.parameters.map(param => (
                        <div key={param.key} style={{ marginBottom: 16 }}>
                          <label style={{
                            display: 'block',
                            fontSize: 14,
                            fontWeight: 500,
                            marginBottom: 8,
                          }}>
                            {param.name}
                          </label>

                          {param.type === 'number' && (
                            <NumberPicker
                              value={currentTemplate.parameters[param.key]}
                              onChange={value => handleParameterChange(template.type, param.key, value)}
                              min={param.min}
                              max={param.max}
                              step={1}
                              style={{ width: '100%' }}
                              innerAfter={param.unit && <span>{param.unit}</span>}
                            />
                          )}

                          {param.type === 'select' && (
                            <Select
                              value={currentTemplate.parameters[param.key]}
                              onChange={value => handleParameterChange(template.type, param.key, value)}
                              style={{ width: '100%' }}
                              dataSource={param.options}
                            />
                          )}

                          {param.type === 'string' && (
                            <Input
                              value={currentTemplate.parameters[param.key]}
                              onChange={value => handleParameterChange(template.type, param.key, value)}
                              style={{ width: '100%' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Batch Operations */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#f9f9f9',
            borderRadius: 6,
          }}>
            <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              <Translation>Batch Operations</Translation>
            </h5>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="small">
                <Translation>Apply to Layer</Translation> L{selectedService.layer}
              </Button>
              <Button size="small">
                <Translation>Apply to All Services</Translation>
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    );
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>2</span>
            <Translation>Trace Visualization & Fault Configuration</Translation>
          </div>
          <div className={styles.sectionDescription}>
            <Translation>Visualize the service call trace and configure fault injection for each service</Translation>
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

      {/* Trace Visualization */}
      <div style={{ marginBottom: 24 }}>
        {hasTopology ? (
          <ReadOnlyServiceTopology
            nodes={topoNodes}
            edges={topoEdges}
            faultConfigs={[]}
            height={400}
            showFaultIndicators={false}
            selectedNodeId={selectedService?.id || null}
            onSelectNode={handleNodeSelect}
          />
        ) : (
          <div style={{
            border: '1px solid #e8e8e8',
            borderRadius: 8,
            background: '#fafafa',
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}>
            <div style={{ textAlign: 'center' }}>
              <Icon type="chart-pie" size="xl" style={{ color: '#d9d9d9', marginBottom: 12 }} />
              <div><Translation>Select an API to load its service topology</Translation></div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae7ff',
        borderRadius: 6,
        padding: 16,
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Icon type="info-circle" style={{ color: '#1890ff', marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              <Translation>How to Configure Faults</Translation>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 14, color: '#666' }}>
              <li><Translation>Click on any service node to open the fault configuration panel</Translation></li>
              <li><Translation>Use mouse wheel to zoom in/out, drag to pan the view</Translation></li>
              <li><Translation>Red dots indicate services with active fault configurations</Translation></li>
              <li><Translation>At least one service must have fault injection configured</Translation></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      {data.faultConfigurations.length > 0 && (
        <div style={{
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: 6,
          padding: 16,
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            <Translation>Fault Configuration Summary</Translation>
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.faultConfigurations.map(config => {
              const enabledFaults = config.faultTemplates.filter(t => t.enabled);
              return (
                <Tag key={config.serviceId} color="#52c41a">
                  {config.serviceName}: {enabledFaults.length} <Translation>faults</Translation>
                </Tag>
              );
            })}
          </div>
        </div>
      )}

      {/* Fault Configuration Drawer */}
      {renderFaultConfigurationDrawer()}
    </div>
  );
};

export default TraceVisualizationSection;
