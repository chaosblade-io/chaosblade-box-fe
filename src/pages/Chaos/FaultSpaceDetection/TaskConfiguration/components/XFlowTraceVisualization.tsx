import React, { FC, useState, useEffect, useCallback } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';

import styles from '../index.css';
import { Button, Icon, Drawer, Checkbox, Input, Select, NumberPicker, Tag } from '@alicloud/console-components';

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
      target?: string;
      action?: string;
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
  // Standardized chaosblade identifiers
  target?: string;
  action?: string;
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
  const [ availableFaultTemplates, setAvailableFaultTemplates ] = useState<FaultTemplate[]>([]);
  const [ viewBox, setViewBox ] = useState({ x: 0, y: 0, width: 1000, height: 600 });
  const [ scale, setScale ] = useState(1);
  const [ isPanning, setIsPanning ] = useState(false);
  const [ lastPanPoint, setLastPanPoint ] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 使用真实拓扑：由外部在选择 API 后触发 onChange 带入 data.baselineTrace 或额外 props 亦可
    // 这里直接从后端拉取拓扑和故障类型
    const fetchData = async () => {
      try {
        // 获取已选 API
        // 由外部父组件将 nodes 注入到 data.baselineTrace?.nodes（或 data.faultConfigurations）
        // 为保持兼容，这里仅在 data.baselineTrace?.nodes 存在时做渲染
        const topologyNodes: any[] = (data as any).baselineTrace?.nodes || [];
        const topologyEdges: any[] = (data as any).baselineTrace?.edges || [];
        if (topologyNodes.length > 0) {
          // 1) 基于边关系构建邻接表与入度/逆邻接（用于计算层级与处理环）
          const nodeIds: number[] = topologyNodes.map(n => Number(n.id ?? n.nodeId));
          const nodeById = new Map<number, any>();
          topologyNodes.forEach(n => nodeById.set(Number(n.id ?? n.nodeId), n));

          const adj = new Map<number, number[]>();
          const rev = new Map<number, number[]>();
          const inDeg = new Map<number, number>();
          nodeIds.forEach(id => { adj.set(id, []); rev.set(id, []); inDeg.set(id, 0); });
          topologyEdges.forEach(e => {
            const u = Number(e.fromNodeId);
            const v = Number(e.toNodeId);
            if (!adj.has(u)) adj.set(u, []);
            if (!rev.has(v)) rev.set(v, []);
            adj.get(u)!.push(v);
            rev.get(v)!.push(u);
            inDeg.set(v, (inDeg.get(v) || 0) + 1);
            if (!inDeg.has(u)) inDeg.set(u, inDeg.get(u) || 0);
          });

          // 2) 根集合：入度为 0（若无，则选择最小入度的节点集合作为“伪根”）
          let roots: number[] = nodeIds.filter(id => (inDeg.get(id) || 0) === 0);
          if (roots.length === 0) {
            let minIn = Infinity;
            nodeIds.forEach(id => { const v = inDeg.get(id) ?? 0; minIn = Math.min(minIn, v); });
            roots = nodeIds.filter(id => (inDeg.get(id) ?? 0) === minIn);
          }

          // 3) Kahn 拓扑分层（对有环图，仍可推进部分；剩余节点后续再分配）
          const layerMap = new Map<number, number>();
          const q: number[] = [];
          roots.forEach(id => { layerMap.set(id, 0); q.push(id); });
          const inDegWork = new Map(inDeg);
          while (q.length) {
            const u = q.shift()!;
            const base = layerMap.get(u) ?? 0;
            (adj.get(u) || []).forEach(v => {
              // 子节点层级 = max(现层级, 父层级+1)
              layerMap.set(v, Math.max(layerMap.get(v) ?? 0, base + 1));
              inDegWork.set(v, (inDegWork.get(v) || 0) - 1);
              if ((inDegWork.get(v) || 0) === 0) q.push(v);
            });
          }

          // 4) 处理环/未分配层级的节点：单次基于父层级的分配，避免大规模迭代造成卡顿
          const processed = new Set<number>();
          roots.forEach(r => processed.add(r));
          // 记录在 Kahn 流程中被处理过的节点
          layerMap.forEach((_, id) => { if ((inDeg.get(id) || 0) === 0) processed.add(id); });
          const remaining = nodeIds.filter(id => !processed.has(id));
          remaining.forEach(v => {
            const parents = rev.get(v) || [];
            let maxParentLayer = -1;
            parents.forEach(p => { maxParentLayer = Math.max(maxParentLayer, layerMap.get(p) ?? 0); });
            const proposed = maxParentLayer >= 0 ? maxParentLayer + 1 : 0;
            if ((layerMap.get(v) ?? 0) < proposed) layerMap.set(v, proposed);
          });

          // 5) 按层分组并布局（自上而下、同层横向）
          const grouped = new Map<number, number[]>();
          layerMap.forEach((layer, id) => {
            if (!grouped.has(layer)) grouped.set(layer, []);
            grouped.get(layer)!.push(id);
          });
          const layerKeys = Array.from(grouped.keys()).sort((a, b) => a - b);
          const laneWidth = 180; // 节点横向间距
          const laneHeight = 120; // 节点纵向间距
          const baseX = 120;
          const baseY = 80;
          const canvasWidth = viewBox.width || 900;
          const mapped: ServiceNode[] = [];
          layerKeys.forEach((layer, li) => {
            const ids = grouped.get(layer)!;
            const totalWidth = (ids.length - 1) * laneWidth;
            const startX = baseX + Math.max(0, (canvasWidth - totalWidth) / 2);
            ids.forEach((id, idx) => {
              const n = nodeById.get(id) || {};
              mapped.push({
                id: String(id),
                name: n.name || `Node-${id}`,
                layer: Number(layer),
                protocol: (n.protocol || 'HTTP'),
                x: startX + (idx * laneWidth),
                y: baseY + (li * laneHeight),
                selected: false,
                status: 'UNTESTED',
              });
            });
          });
          setServiceNodes(mapped);
        }

        // 故障类型
        const { probeProxy } = await import('../../../../../services/faultSpaceDetection/probeProxy');
        const faultRes: any = await probeProxy.getFaultTypes();
        const items = faultRes?.data?.items || [];
        const templates: FaultTemplate[] = items.map((it: any) => {
          const code: string = it.faultCode || it.code || it.type || String(it.id || '');
          // Parse paramConfig first to extract target/action/fields
          let conf: any = {};
          try {
            conf = it.paramConfig ? JSON.parse(it.paramConfig) : {};
          } catch {
            conf = {};
          }
          // Prefer paramConfig.target/action; fallback to item fields; lastly derive from code
          let target = String(conf.target || it.target || '');
          let action = String(conf.action || it.action || '');
          if (!target || !action) {
            const parts = code.split('_');
            if (parts.length >= 2) {
              target = target || parts[0];
              action = action || parts.slice(1).join('_');
            }
          }
          // Normalize some common aliases
          const normTarget = (t: string) => {
            const x = (t || '').toLowerCase();
            if (x === 'memory') return 'mem';
            if (x === 'cpu') return 'cpu';
            if (x === 'process') return 'process';
            if (x === 'container') return 'container';
            if (x === 'disk') return 'disk';
            if (x === 'network' || x === 'net') return 'network';
            if (x === 'mem') return 'mem';
            return x || 'container';
          };
          const fields = Array.isArray(conf.fields) ? conf.fields : [];
          return {
            type: code,
            name: it.name || code,
            description: it.description || '',
            category: (it.category || 'APPLICATION') as any,
            target: normTarget(target),
            action: (action || '').toLowerCase(),
            parameters: fields
              .filter((f: any) => ![ 'names', 'namespace', 'container_names' ].includes((f.key || f.name)))
              .map((f: any) => ({
                name: f.key || f.name,
                type: (String(f.type || 'string').includes('int') || String(f.type || '').includes('number')) ? 'number' : 'string',
                required: !!f.required,
                defaultValue: f.default,
                options: Array.isArray(f.options) ? f.options : undefined,
                description: f.label || f.desc || '',
              })),
          } as FaultTemplate;
        });
        setAvailableFaultTemplates(templates);
      } catch (e) {
        console.error('Failed to fetch topology/fault types:', e);
      }
    };
    fetchData();
  }, [ data?.baselineTrace ]);

  // 取消 mock 数据渲染（已接入真实数据）

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
    const edges: Array<{ fromNodeId: number; toNodeId: number }> = (data as any)?.baselineTrace?.edges || [];
    if (!edges || edges.length === 0) return null;

    // 建立 id->坐标映射（后端节点 id -> 前端节点）
    const idToNode = new Map<string | number, ServiceNode>();
    serviceNodes.forEach(n => idToNode.set(Number(n.id), n));

    return edges.map((edge, index) => {
      const fromNode = idToNode.get(Number(edge.fromNodeId));
      const toNode = idToNode.get(Number(edge.toNodeId));
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
            {i18n.t('Visualize service topology and configure fault injection scenarios').toString()}
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
                {i18n.t('Fault Configured').toString()}
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
          <svg
            width="100%"
            height="500"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            onWheel={e => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? 1.1 : 0.9;
              setScale(prev => Math.min(3, Math.max(0.5, prev * delta)));
              setViewBox(v => ({ x: v.x, y: v.y, width: v.width * delta, height: v.height * delta }));
            }}
            onMouseDown={e => {
              setIsPanning(true);
              setLastPanPoint({ x: e.clientX, y: e.clientY });
            }}
            onMouseMove={e => {
              if (!isPanning) return;
              const dx = (e.clientX - lastPanPoint.x);
              const dy = (e.clientY - lastPanPoint.y);
              setLastPanPoint({ x: e.clientX, y: e.clientY });
              setViewBox(v => ({ x: v.x - dx, y: v.y - dy, width: v.width, height: v.height }));
            }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
          >
            {/* Arrow marker definition */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#d9d9d9" />
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
                            const initialParams = Object.fromEntries(
                              (template.parameters || [])
                                .filter(p => p.defaultValue !== undefined && p.defaultValue !== null && p.defaultValue !== '')
                                .map(p => [ p.name, p.defaultValue ]),
                            );
                            const updatedTemplates = checked
                              ? [ ...currentConfig.faultTemplates.filter(t => t.type !== template.type), {
                                type: template.type,
                                enabled: true,
                                target: template.target,
                                action: template.action,
                                parameters: initialParams,
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
                            const initialParams = Object.fromEntries(
                              (template.parameters || [])
                                .filter(p => p.defaultValue !== undefined && p.defaultValue !== null && p.defaultValue !== '')
                                .map(p => [ p.name, p.defaultValue ]),
                            );
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
                                    target: template.target,
                                    action: template.action,
                                    parameters: initialParams,
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
                              onChange={(val: number) => {
                                const currentConfig = data.faultConfigurations.find(c => c.serviceId === selectedService.id);
                                if (!currentConfig) return;
                                const updatedTemplates = (currentConfig.faultTemplates || []).map(t => {
                                  return t.type === template.type ? { ...t, parameters: { ...t.parameters, [param.name]: val } } : t;
                                });
                                onChange({
                                  faultConfigurations: data.faultConfigurations.map(c => (c.serviceId === selectedService.id ? { ...c, faultTemplates: updatedTemplates } : c)),
                                });
                              }}
                            />
                          )}
                          {param.type === 'string' && (
                            <Input
                              size="small"
                              defaultValue={param.defaultValue}
                              style={{ width: '100%' }}
                              onChange={(val: string) => {
                                const currentConfig = data.faultConfigurations.find(c => c.serviceId === selectedService.id);
                                if (!currentConfig) return;
                                const updatedTemplates = (currentConfig.faultTemplates || []).map(t => {
                                  return t.type === template.type ? { ...t, parameters: { ...t.parameters, [param.name]: val } } : t;
                                });
                                onChange({
                                  faultConfigurations: data.faultConfigurations.map(c => (c.serviceId === selectedService.id ? { ...c, faultTemplates: updatedTemplates } : c)),
                                });
                              }}
                            />
                          )}
                          {param.type === 'select' && (
                            <Select
                              size="small"
                              defaultValue={param.defaultValue}
                              dataSource={param.options?.map(opt => ({ label: opt, value: opt }))}
                              style={{ width: '100%' }}
                              onChange={(val: string) => {
                                const currentConfig = data.faultConfigurations.find(c => c.serviceId === selectedService.id);
                                if (!currentConfig) return;
                                const updatedTemplates = (currentConfig.faultTemplates || []).map(t => {
                                  return t.type === template.type ? { ...t, parameters: { ...t.parameters, [param.name]: val } } : t;
                                });
                                onChange({
                                  faultConfigurations: data.faultConfigurations.map(c => (c.serviceId === selectedService.id ? { ...c, faultTemplates: updatedTemplates } : c)),
                                });
                              }}
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
