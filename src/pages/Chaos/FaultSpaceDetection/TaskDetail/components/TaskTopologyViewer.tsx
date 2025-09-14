import React, { FC, useMemo, useState } from 'react';
/* Read-only topology viewer for Task Detail page.
 * Debug logs included; remove or guard by env in production if needed.
 */
import { Drawer, Icon, Tag, Message } from '@alicloud/console-components';

interface TopologyNode {
  id: number | string;
  name: string;
  layer: number;
  protocol?: string;
}

interface TopologyEdge {
  id?: number | string;
  fromNodeId: number | string;
  toNodeId: number | string;
}

interface FaultConfigItem {
  nodeId: number | string;
  type?: string;
  faultscript?: any;
}

interface TaskTopologyViewerProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  faultConfigs: FaultConfigItem[];
}

const TaskTopologyViewer: FC<TaskTopologyViewerProps> = ({ nodes, edges, faultConfigs }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const nodePositions = useMemo(() => {
    // 布局：按 layer 进行分层，横向均匀排列
    const byLayer = new Map<number, TopologyNode[]>();
    nodes.forEach(n => {
      const l = Number(n.layer || 0);
      if (!byLayer.has(l)) byLayer.set(l, []);
      byLayer.get(l)!.push(n);
    });
    const layers = Array.from(byLayer.keys()).sort((a, b) => a - b);
    const laneWidth = 180;
    const laneHeight = 120;
    const baseX = 120;
    const baseY = 80;
    const canvasWidth = 1000;

    const pos = new Map<string | number, { x: number; y: number }>();
    layers.forEach((layer, li) => {
      const list = byLayer.get(layer)!;
      const totalWidth = (list.length - 1) * laneWidth;
      const startX = baseX + Math.max(0, (canvasWidth - totalWidth) / 2);
      list.forEach((n, idx) => {
        pos.set(n.id, { x: startX + (idx * laneWidth), y: baseY + (li * laneHeight) });
      });
    });
    return pos;
  }, [nodes]);

  const faultsByNode = useMemo(() => {
    const map = new Map<string | number, FaultConfigItem[]>();
    faultConfigs.forEach(fc => {
      const key = fc.nodeId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(fc);
    });
    return map;
  }, [faultConfigs]);

  const handleNodeClick = (nodeId: string | number) => {
    setSelectedNodeId(nodeId);
    setDrawerVisible(true);
  };

  const getFaultTypeFromScript = (fc: FaultConfigItem) => {
    const type = fc.type
      || fc.faultscript?.spec?.experiments?.[0]?.action
      || fc.faultscript?.spec?.experiments?.[0]?.target
      || '';
    return String(type);
  };

  const getFaultParamsFromScript = (fc: FaultConfigItem) => {
    try {
      const matchers = fc.faultscript?.spec?.experiments?.[0]?.matchers || [];
      const entries = matchers
        .filter((m: any) => !['names', 'namespace', 'container-names', 'container_names'].includes(String(m?.name)))
        .map((m: any) => [ String(m?.name), Array.isArray(m?.value) ? m.value.join(',') : String(m?.value) ]);
      return Object.fromEntries(entries);
    } catch {
      return {} as Record<string, string>;
    }
  };

  const selectedFaults = selectedNodeId != null ? (faultsByNode.get(selectedNodeId) || []) : [];

  // 画布尺寸估算
  const height = useMemo(() => {
    const layers = new Set<number>();
    nodes.forEach(n => layers.add(Number(n.layer || 0)));
    return 120 + layers.size * 120 + 80;
  }, [nodes]);

  return (
    <div style={{ width: '100%', overflow: 'hidden', border: '1px solid #eee', borderRadius: 8 }}>
      <svg width="100%" height={height} viewBox={`0 0 1200 ${height}`}>
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,4 L0,8 z" fill="#bbb" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, idx) => {
          const from = nodePositions.get(e.fromNodeId);
          const to = nodePositions.get(e.toNodeId);
          if (!from || !to) return null;
          return (
            <line
              key={e.id || idx}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="#ccc"
              strokeWidth={1.5}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const p = nodePositions.get(n.id);
          if (!p) return null;
          const hasFault = (faultsByNode.get(n.id) || []).length > 0;
          return (
            <g key={String(n.id)} transform={`translate(${p.x - 60}, ${p.y - 25})`} onClick={() => hasFault && handleNodeClick(n.id)} style={{ cursor: hasFault ? 'pointer' : 'default' }}>
              {/* Badge background */}
              <rect x={-10} y={-6} width={140} height={62} rx={8} ry={8} fill={hasFault ? '#fff7e6' : '#fff'} stroke={hasFault ? '#fa8c16' : '#e8e8e8'} strokeWidth={hasFault ? 2 : 1} />
              {/* Service name */}
              <text x={60} y={18} textAnchor="middle" dominantBaseline="middle" fill="#333" style={{ fontSize: 12, fontWeight: 600 }}>{n.name}</text>
              {/* Protocol & indicator */}
              {hasFault ? (
                <g>
                  <circle cx={118} cy={-6} r={8} fill="#fa8c16" />
                  <text x={118} y={-6} textAnchor="middle" dominantBaseline="middle" fill="#fff" style={{ fontSize: 10 }}>F</text>
                </g>
              ) : (
                <g>
                  <circle cx={118} cy={-6} r={6} fill="#bbb" />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Drawer to show faults on selected node */}
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon type="warning" /><span>Faults on Service</span></div>}
        closeable
        placement="right"
        width={420}
      >
        {selectedNodeId == null || selectedFaults.length === 0 ? (
          <div style={{ color: '#999' }}>No fault configurations on this node</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedFaults.map((fc, idx) => {
              const type = getFaultTypeFromScript(fc);
              const params = getFaultParamsFromScript(fc) as Record<string, string>;
              return (
                <div key={idx} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Tag color="#fa8c16">{type || 'Unknown Fault'}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {Object.keys(params).length === 0 ? (
                      <div style={{ color: '#999' }}>No parameters</div>
                    ) : (
                      Object.entries(params).map(([k, v]) => (
                        <div key={k} style={{ marginBottom: 4 }}>
                          <code>{k}</code>: {String(v)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TaskTopologyViewer;

