import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

export interface RONode {
  id: number | string;
  name: string;
  layer?: number;
  protocol?: string;
}

export interface ROEdge {
  id?: number | string;
  fromNodeId: number | string;
  toNodeId: number | string;
}

export interface ROFaultConfig {
  nodeId: number | string;
  type?: string;
  faultscript?: any;
}

interface ReadOnlyServiceTopologyProps {
  nodes: RONode[];
  edges: ROEdge[];
  faultConfigs: ROFaultConfig[];
  height?: number;
  showFaultIndicators?: boolean; // 默认隐藏故障标识
  selectedNodeId?: string | number | null;
  onSelectNode?: (nodeId: string | number, node?: RONode) => void;
}

const ReadOnlyServiceTopology: FC<ReadOnlyServiceTopologyProps> = ({ nodes, edges, faultConfigs, height = 600, showFaultIndicators = false, selectedNodeId = null, onSelectNode }) => {
  // Pan/Zoom state
  const [ scale, setScale ] = useState(1);
  const [ pan, setPan ] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  // Faults map
  const faultsByNode = useMemo(() => {
    const map = new Map<string | number, { type: string; params: Record<string, string> }[]>();
    const getType = (fc: ROFaultConfig) => (fc.type
      || fc.faultscript?.spec?.experiments?.[0]?.action
      || fc.faultscript?.spec?.experiments?.[0]?.target
      || '');
    const getParams = (fc: ROFaultConfig) => {
      try {
        const ms = fc.faultscript?.spec?.experiments?.[0]?.matchers || [];
        const entries = ms
          .filter((m: any) => !['names', 'namespace', 'container-names', 'container_names'].includes(String(m?.name)))
          .map((m: any) => [ String(m?.name), Array.isArray(m?.value) ? m.value.join(',') : String(m?.value) ]);
        return Object.fromEntries(entries) as Record<string, string>;
      } catch { return {}; }
    };
    faultConfigs.forEach(fc => {
      const key = fc.nodeId;
      const type = String(getType(fc));
      const params = getParams(fc);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ type, params });
    });
    return map;
  }, [ faultConfigs ]);

  // Build adjacency and compute hierarchical layers using Kahn + single pass relax
  const layout = useMemo(() => {
    const nodeIds = nodes.map(n => n.id);
    const idSet = new Set(nodeIds.map(String));
    const adj = new Map<string, string[]>();
    const rev = new Map<string, string[]>();
    const inDeg = new Map<string, number>();

    nodeIds.forEach(id => { adj.set(String(id), []); rev.set(String(id), []); inDeg.set(String(id), 0); });
    edges.forEach(e => {
      const u = String(e.fromNodeId), v = String(e.toNodeId);
      if (!idSet.has(u) || !idSet.has(v)) return;
      adj.get(u)!.push(v);
      rev.get(v)!.push(u);
      inDeg.set(v, (inDeg.get(v) || 0) + 1);
    });

    const roots: string[] = [];
    inDeg.forEach((deg, id) => { if (deg === 0) roots.push(id); });
    if (roots.length === 0) {
      // pick minimal inDeg as pseudo roots
      let min = Infinity; inDeg.forEach(d => { if (d < min) min = d; });
      inDeg.forEach((d, id) => { if (d === min) roots.push(id); });
    }

    const layer = new Map<string, number>();
    const queue: string[] = [ ...roots ];
    const seen = new Set<string>();
    roots.forEach(r => { layer.set(r, 0); seen.add(r); });
    while (queue.length) {
      const u = queue.shift()!;
      const lu = layer.get(u) || 0;
      (adj.get(u) || []).forEach(v => {
        const proposed = lu + 1;
        if ((layer.get(v) ?? -1) < proposed) layer.set(v, proposed);
        const deg = (inDeg.get(v) || 0) - 1; inDeg.set(v, deg);
        if (deg === 0 && !seen.has(v)) { queue.push(v); seen.add(v); }
      });
    }
    // Single-pass relax for remaining
    nodes.forEach(n => { const id = String(n.id); if (!layer.has(id)) layer.set(id, 0); });
    nodes.forEach(n => {
      const id = String(n.id);
      const parents = rev.get(id) || [];
      let maxParent = -1; parents.forEach(p => { maxParent = Math.max(maxParent, layer.get(p) ?? 0); });
      const proposed = maxParent >= 0 ? maxParent + 1 : 0;
      if ((layer.get(id) ?? 0) < proposed) layer.set(id, proposed);
    });

    // Group by layer and assign coordinates
    const byLayer = new Map<number, string[]>();
    layer.forEach((lv, id) => {
      if (!byLayer.has(lv)) byLayer.set(lv, []);
      byLayer.get(lv)!.push(id);
    });
    const orderedLayers = Array.from(byLayer.keys()).sort((a, b) => a - b);
    const laneWidth = 180; const laneHeight = 120; const baseX = 120; const baseY = 80; const width = 1100;
    const pos = new Map<string, { x: number; y: number }>();
    orderedLayers.forEach((lv, li) => {
      const ids = byLayer.get(lv)!;
      const totalWidth = (ids.length - 1) * laneWidth;
      const startX = baseX + Math.max(0, (width - totalWidth) / 2);
      ids.forEach((id, idx) => { pos.set(id, { x: startX + idx * laneWidth, y: baseY + li * laneHeight }); });
    });
    return { pos, orderedLayers };
  }, [ nodes, edges ]);

  // SVG events
  const onWheel: React.WheelEventHandler<SVGSVGElement> = e => {
    e.preventDefault();
    const delta = -e.deltaY; // up zoom in
    const factor = delta > 0 ? 1.1 : 0.9;
    const next = Math.min(3, Math.max(0.4, scale * factor));
    setScale(next);
  };
  const onMouseDown: React.MouseEventHandler<SVGSVGElement> = e => {
    isPanningRef.current = true;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove: React.MouseEventHandler<SVGSVGElement> = e => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPointRef.current.x;
    const dy = e.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onMouseUp: React.MouseEventHandler<SVGSVGElement> = () => { isPanningRef.current = false; };
  const onMouseLeave: React.MouseEventHandler<SVGSVGElement> = () => { isPanningRef.current = false; };

  // Helpers
  const getNode = (id: string | number) => nodes.find(n => String(n.id) === String(id));
  const getFaultTags = (id: string | number) => faultsByNode.get(id) || [];

  // Estimated height by number of layers
  const estHeight = useMemo(() => {
    const layers = new Set<number>();
    nodes.forEach(n => layers.add(Number(n.layer ?? 0)));
    // If layer not present, derive from layout.orderedLayers length
    const L = Math.max(layers.size, layout.orderedLayers.length || 1);
    return Math.max(height, 80 + L * 120);
  }, [ nodes, layout.orderedLayers, height ]);

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
      <svg
        width="100%"
        height={estHeight}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{ cursor: isPanningRef.current ? 'grabbing' : 'default', background: '#fff' }}
      >
        <defs>
          <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,4 L0,8 z" fill="#bbb" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {/* Edges */}
          {edges.map((e, idx) => {
            const from = layout.pos.get(String(e.fromNodeId));
            const to = layout.pos.get(String(e.toNodeId));
            if (!from || !to) return null;
            return (
              <line
                key={String(e.id || idx)}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#d9d9d9"
                strokeWidth={1.5}
                markerEnd="url(#arrow-gray)"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const p = layout.pos.get(String(n.id));
            if (!p) return null;
            const faults = getFaultTags(n.id);
            const hasFault = faults.length > 0;
            const isSelected = selectedNodeId != null && String(selectedNodeId) === String(n.id);
            return (
              <g key={String(n.id)} transform={`translate(${p.x - 60}, ${p.y - 25})`} onClick={() => onSelectNode && onSelectNode(n.id, n)} style={{ cursor: 'pointer' }}>
                <rect x={-10} y={-6} width={140} height={62} rx={8} ry={8} fill="#fff" stroke={isSelected ? '#1890ff' : '#e8e8e8'} strokeWidth={isSelected ? 2 : 1} />
                <text x={60} y={18} textAnchor="middle" dominantBaseline="middle" fill="#333" style={{ fontSize: 12, fontWeight: 600 }}>{n.name}</text>
                {/* protocol */}
                <text x={60} y={38} textAnchor="middle" dominantBaseline="middle" fill="#666" style={{ fontSize: 10 }}>{n.protocol || 'HTTP'}</text>
                {/* optional indicator */}
                {showFaultIndicators && hasFault && (
                  <g>
                    <circle cx={118} cy={-6} r={8} fill="#fa8c16" />
                    <text x={118} y={-6} textAnchor="middle" dominantBaseline="middle" fill="#fff" style={{ fontSize: 10 }}>F</text>
                  </g>
                )}
                {/* no inline tags in initial state per requirements */}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default ReadOnlyServiceTopology;

