import React, { FC, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Graph, Edge } from '@antv/x6';
import { Button, Loading, Message, Icon, Select, Tab, Input, Tag } from '@alicloud/console-components';
import { useHistory } from 'dva';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import Translation from 'components/Translation';
import { riskDetectionService } from '../../services/riskDetectionService';
import { RiskTopologyNode, RiskTopologyEdge, K8sResourceType, K8sRelationType, RiskPoint } from '../../types';
import { GenerateExperimentRequest, SelectedFault } from '../../types/experimentTypes';
import TracePanel from '../TracePanel';
import RiskAnalysisDrawer from '../RiskAnalysisDrawer';
import GenerateExperimentModal from '../GenerateExperimentModal';
import styles from './index.css';

// 布局类型
type LayoutType = 'force' | 'dagre' | 'grid' | 'circular';

// K8s 资源类型样式配置 - 参考 MicroGraph 风格
const nodeStyleConfig: Record<K8sResourceType, { fill: string; icon: string; iconBg: string; domain: string }> = {
  NAMESPACE: { fill: '#EFF6FF', icon: 'NS', iconBg: '#3B82F6', domain: 'k8s.infra' },
  DEPLOYMENT: { fill: '#ECFDF5', icon: 'DP', iconBg: '#10B981', domain: 'k8s.workload' },
  REPLICASET: { fill: '#F0FDF4', icon: 'RS', iconBg: '#22C55E', domain: 'k8s.workload' },
  POD: { fill: '#FEF3C7', icon: 'PO', iconBg: '#F59E0B', domain: 'k8s.workload' },
  SERVICE: { fill: '#F5F3FF', icon: 'SV', iconBg: '#8B5CF6', domain: 'k8s.network' },
  CONFIGMAP: { fill: '#FFF7ED', icon: 'CM', iconBg: '#F97316', domain: 'k8s.config' },
  SECRET: { fill: '#FEF2F2', icon: 'SC', iconBg: '#EF4444', domain: 'k8s.config' },
  PVC: { fill: '#EEF2FF', icon: 'PV', iconBg: '#6366F1', domain: 'k8s.storage' },
  INGRESS: { fill: '#ECFEFF', icon: 'IG', iconBg: '#06B6D4', domain: 'k8s.network' },
  STATEFULSET: { fill: '#D1FAE5', icon: 'SS', iconBg: '#059669', domain: 'k8s.workload' },
  DAEMONSET: { fill: '#DBEAFE', icon: 'DS', iconBg: '#3B82F6', domain: 'k8s.workload' },
};

// 域配置
const domainConfig: Record<string, { name: string; color: string }> = {
  'k8s.infra': { name: '基础设施', color: '#3B82F6' },
  'k8s.workload': { name: '工作负载', color: '#10B981' },
  'k8s.network': { name: '网络', color: '#8B5CF6' },
  'k8s.config': { name: '配置', color: '#F97316' },
  'k8s.storage': { name: '存储', color: '#6366F1' },
};

// 关系类型样式配置
const relationStyleConfig: Record<string, { stroke: string; dashArray: string; label: string }> = {
  contains: { stroke: '#0EA5E9', dashArray: '', label: '包含' },
  manages: { stroke: '#10B981', dashArray: '', label: '管理' },
  creates: { stroke: '#22C55E', dashArray: '5,3', label: '创建' },
  selects: { stroke: '#8B5CF6', dashArray: '8,4', label: '选择' },
  mounts: { stroke: '#F97316', dashArray: '3,3', label: '挂载' },
  claims: { stroke: '#6366F1', dashArray: '6,3', label: '声明' },
  calls: { stroke: '#EC4899', dashArray: '', label: '调用' },
  routes_to: { stroke: '#06B6D4', dashArray: '8,4', label: '路由' },
  runs_on: { stroke: '#78716C', dashArray: '4,4', label: '运行于' },
};

// 状态颜色配置
const statusColors: Record<string, { border: string; bg: string; label: string }> = {
  running: { border: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: '运行中' },
  healthy: { border: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: '健康' },
  warning: { border: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: '警告' },
  error: { border: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: '错误' },
  pending: { border: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', label: '等待中' },
  terminated: { border: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', label: '已终止' },
  unknown: { border: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)', label: '未知' },
};

// 动画帧ID引用
let animationFrameId: number | null = null;

// 统计信息类型
interface GraphStatistics {
  totalNodes: number;
  totalEdges: number;
  statusStats: Record<string, number>;
  domainStats: Record<string, number>;
  namespaceStats: Record<string, number>;
}

const RiskTopology: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<RiskTopologyNode[]>([]);
  const [edges, setEdges] = useState<RiskTopologyEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<RiskTopologyNode | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [layoutType, setLayoutType] = useState<LayoutType>('dagre');  // 默认使用层次布局
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'domain' | 'filter' | 'network'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('riskTopology_sidebarCollapsed');
    return saved === 'true';
  });

  // 风险分析相关状态
  const [riskAnalysisVisible, setRiskAnalysisVisible] = useState(false);
  const [riskAnalysisLoading, setRiskAnalysisLoading] = useState(false);
  const [analyzedRisks, setAnalyzedRisks] = useState<RiskPoint[]>([]);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [selectedRisksForGenerate, setSelectedRisksForGenerate] = useState<RiskPoint[]>([]);
  const [selectedFaultsForGenerate, setSelectedFaultsForGenerate] = useState<Map<string, string[]>>(new Map());

  // 过滤器状态
  const [filterConfig, setFilterConfig] = useState<{
    resourceTypes: K8sResourceType[];
    namespaces: string[];
    statuses: string[];
    hasRisk: boolean | null;
    domains: string[];
  }>({
    resourceTypes: [],
    namespaces: [],
    statuses: [],
    hasRisk: null,
    domains: [],
  });

  // 域视图状态
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(['k8s.infra', 'k8s.workload', 'k8s.network', 'k8s.config', 'k8s.storage'])
  );

  // 详情面板 Tab 状态
  const [detailTab, setDetailTab] = useState<'detail' | 'relations' | 'trace' | 'yaml'>('detail');

  // 侧边栏和详情抽屉宽度状态
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('riskTopology_sidebarWidth');
    return saved ? parseInt(saved, 10) : 300;
  });
  const [detailPanelWidth, setDetailPanelWidth] = useState(() => {
    const saved = localStorage.getItem('riskTopology_detailPanelWidth');
    return saved ? parseInt(saved, 10) : 400;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingDetail, setIsResizingDetail] = useState(false);

  // 应用过滤器，获取过滤后的节点
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // 按资源类型过滤
      if (filterConfig.resourceTypes.length > 0 && !filterConfig.resourceTypes.includes(node.type)) {
        return false;
      }

      // 按命名空间过滤
      if (filterConfig.namespaces.length > 0 && !filterConfig.namespaces.includes(node.namespace || 'default')) {
        return false;
      }

      // 按状态过滤
      if (filterConfig.statuses.length > 0 && !filterConfig.statuses.includes(node.status)) {
        return false;
      }

      // 按风险等级过滤
      if (filterConfig.hasRisk !== null) {
        const hasRisk = node.riskCount > 0;
        if (filterConfig.hasRisk !== hasRisk) {
          return false;
        }
      }

      // 按域过滤
      if (filterConfig.domains.length > 0) {
        const domain = nodeStyleConfig[node.type]?.domain || 'unknown';
        if (!filterConfig.domains.includes(domain)) {
          return false;
        }
      }

      // 按搜索文本过滤
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        return node.name.toLowerCase().includes(searchLower) ||
               node.type.toLowerCase().includes(searchLower) ||
               (node.namespace || '').toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [nodes, filterConfig, searchText]);

  // 过滤后的边（只显示两端节点都可见的边）
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(edge =>
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  // 按域分组节点
  const nodesByDomain = useMemo(() => {
    const groups: Record<string, RiskTopologyNode[]> = {
      'k8s.infra': [],
      'k8s.workload': [],
      'k8s.network': [],
      'k8s.config': [],
      'k8s.storage': [],
    };

    filteredNodes.forEach(node => {
      const domain = nodeStyleConfig[node.type]?.domain || 'k8s.infra';
      if (groups[domain]) {
        groups[domain].push(node);
      }
    });

    return groups;
  }, [filteredNodes]);

  // 计算统计信息（基于过滤后的数据）
  const statistics = useMemo((): GraphStatistics => {
    const statusStats: Record<string, number> = {};
    const domainStats: Record<string, number> = {};
    const namespaceStats: Record<string, number> = {};

    filteredNodes.forEach(node => {
      const status = node.status || 'unknown';
      statusStats[status] = (statusStats[status] || 0) + 1;

      const domain = nodeStyleConfig[node.type]?.domain || 'unknown';
      domainStats[domain] = (domainStats[domain] || 0) + 1;

      const ns = node.namespace || 'default';
      namespaceStats[ns] = (namespaceStats[ns] || 0) + 1;
    });

    return {
      totalNodes: filteredNodes.length,
      totalEdges: filteredEdges.length,
      statusStats,
      domainStats,
      namespaceStats,
    };
  }, [filteredNodes, filteredEdges]);

  // 加载拓扑数据
  const loadTopologyData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await riskDetectionService.getTopologyData();
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (error) {
      Message.error('加载拓扑数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 执行风险分析
  const handleRiskAnalysis = useCallback(async () => {
    try {
      setRiskAnalysisLoading(true);
      setRiskAnalysisVisible(true);

      // 获取所有有风险的节点ID
      const nodeIds = nodes.filter(n => n.riskCount > 0).map(n => n.id);

      const response = await riskDetectionService.analyzeRisks(nodeIds);

      if (response.success) {
        setAnalyzedRisks(response.risks);
        Message.success(`风险分析完成，发现 ${response.risks.length} 个风险点`);
      } else {
        Message.error('风险分析失败');
      }
    } catch (error) {
      Message.error('风险分析失败');
    } finally {
      setRiskAnalysisLoading(false);
    }
  }, [nodes]);

  // 处理生成演练场景
  const handleGenerateExperiment = useCallback((selectedRisks: RiskPoint[], selectedFaults: Map<string, string[]>) => {
    setSelectedRisksForGenerate(selectedRisks);
    setSelectedFaultsForGenerate(selectedFaults);
    setRiskAnalysisVisible(false);
    setGenerateModalVisible(true);
  }, []);

  // 确认生成演练场景
  const handleConfirmGenerate = useCallback(async (config: any) => {
    try {
      // 构建选中的故障配置
      const selectedFaultConfigs: SelectedFault[] = [];
      selectedRisksForGenerate.forEach(risk => {
        const faultCodes = selectedFaultsForGenerate.get(risk.id) || [];
        faultCodes.forEach(faultCode => {
          const fault = risk.recommendedFaults.find(f => f.faultCode === faultCode);
          if (fault) {
            selectedFaultConfigs.push({
              riskPointId: risk.id,
              faultCode,
              faultName: fault.faultName,
              parameters: fault.parameters || {},
            });
          }
        });
      });

      const request: GenerateExperimentRequest = {
        riskPoints: selectedRisksForGenerate,
        selectedFaults: selectedFaultConfigs,
        experimentConfig: config,
      };

      const experiment = await riskDetectionService.generateExperiment(request);

      Message.success('演练场景生成成功，请在演练编辑器中完善配置后保存');
      setGenerateModalVisible(false);

      // 将生成的实验数据设置到Redux store中
      // 构造符合IExperiment接口的数据结构
      const experimentData: any = {
        id: experiment.experimentId,
        experimentId: experiment.experimentId,
        flowInfo: experiment.flow,
        basicInfo: experiment.baseInfo,
        baseInfo: experiment.baseInfo,
        flow: experiment.flow,
        observerNodes: [],
        recoverNodes: [],
      };

      // 先清空现有实验数据
      dispatch.experimentEditor.setClearExperiment();

      // 设置新的实验数据
      dispatch.experimentEditor.setExperimentByAppCode(experimentData);

      // 跳转到演练场景编辑器（不带id参数，表示新建模式）
      history.push('/chaos/experiment/editor');
    } catch (error) {
      Message.error('生成演练场景失败');
    }
  }, [selectedRisksForGenerate, selectedFaultsForGenerate, history, dispatch]);

  // 获取节点边框颜色
  const getNodeBorderColor = (node: RiskTopologyNode): string => {
    if (node.riskCount > 0) {
      return node.riskCount >= 2 ? statusColors.error.border : statusColors.warning.border;
    }
    return statusColors[node.status]?.border || statusColors.unknown.border;
  };

  // 获取关系类型样式
  const getRelationStyle = (type: K8sRelationType) => {
    return relationStyleConfig[type] || { stroke: '#d9d9d9', dashArray: '' };
  };

  // 启动边的流动动画
  const startEdgeAnimation = (graph: Graph, targetEdges: Edge[]) => {
    let offset = 0;
    const animate = () => {
      offset = (offset + 1) % 20;
      targetEdges.forEach(edge => {
        edge.attr('line/strokeDashoffset', -offset);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  };

  // 停止动画
  const stopEdgeAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  // 启动数据流动画（点击节点时）
  const startDataFlowAnimation = (graph: Graph, node: any) => {
    const nodeData = node.getData() as RiskTopologyNode;

    // 查找所有从该节点出发的边（outgoing edges）
    const outgoingEdges = graph.getEdges().filter(edge => edge.getSourceCellId() === nodeData.id);

    if (outgoingEdges.length === 0) {
      return; // 没有下游节点，不显示动画
    }

    // 保存原始样式
    const originalStyles = outgoingEdges.map(edge => ({
      edge,
      strokeDasharray: edge.attr('line/strokeDasharray'),
      strokeDashoffset: edge.attr('line/strokeDashoffset'),
      stroke: edge.attr('line/stroke'),
      strokeWidth: edge.attr('line/strokeWidth'),
    }));

    // 应用数据流动画样式
    outgoingEdges.forEach(edge => {
      edge.attr({
        line: {
          strokeDasharray: '10 5',
          stroke: '#3B82F6',
          strokeWidth: 3,
        },
      });
    });

    // 启动动画
    let offset = 0;
    let frameCount = 0;
    const maxFrames = 90; // 3秒 @ 30fps

    const animate = () => {
      offset = (offset + 1) % 15;
      outgoingEdges.forEach(edge => {
        edge.attr('line/strokeDashoffset', -offset);
      });

      frameCount++;
      if (frameCount < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        // 恢复原始样式
        originalStyles.forEach(({ edge, strokeDasharray, strokeDashoffset, stroke, strokeWidth }) => {
          (edge as any).attr('line/strokeDasharray', strokeDasharray);
          (edge as any).attr('line/strokeDashoffset', strokeDashoffset);
          (edge as any).attr('line/stroke', stroke);
          (edge as any).attr('line/strokeWidth', strokeWidth);
        });
      }
    };

    animate();
  };

  // 高亮节点及其依赖链路 - 显示数据流向动画
  const highlightNodeEdges = (graph: Graph, clickedNode: any) => {
    stopEdgeAnimation();
    const nodeData = clickedNode.getData() as RiskTopologyNode;
    const connectedEdges = graph.getConnectedEdges(clickedNode);
    const connectedNodeIds = new Set<string>([nodeData.id]);

    // 收集相关节点
    connectedEdges.forEach(edge => {
      connectedNodeIds.add(edge.getSourceCellId());
      connectedNodeIds.add(edge.getTargetCellId());
    });

    // 降低无关节点透明度
    graph.getNodes().forEach(node => {
      const nData = node.getData() as RiskTopologyNode;
      if (connectedNodeIds.has(nData.id)) {
        node.attr('body/opacity', 1);
        if (nData.id === nodeData.id) {
          node.attr('body/strokeWidth', 3);
          node.attr('body/stroke', '#1890ff');
        }
      } else {
        node.attr('body/opacity', 0.3);
      }
    });

    // 设置边的高亮和动画
    graph.getEdges().forEach(edge => {
      const isConnected = connectedEdges.includes(edge);
      if (isConnected) {
        edge.attr('line/strokeWidth', 3);
        edge.attr('line/stroke', '#1890ff');
        edge.attr('line/strokeDasharray', '10,5');
        edge.attr('line/opacity', 1);
      } else {
        edge.attr('line/opacity', 0.2);
      }
    });

    // 启动流动动画
    startEdgeAnimation(graph, connectedEdges);
  };

  // 清除高亮和动画
  const clearHighlights = (graph: Graph) => {
    stopEdgeAnimation();
    graph.getNodes().forEach(node => {
      const nodeData = node.getData() as RiskTopologyNode;
      node.attr('body/stroke', getNodeBorderColor(nodeData));
      node.attr('body/strokeWidth', 2);
      node.attr('body/opacity', 1);
    });
    graph.getEdges().forEach(edge => {
      const edgeData = edge.getData() as { type: K8sRelationType };
      const style = getRelationStyle(edgeData?.type);
      edge.attr('line/stroke', style.stroke);
      edge.attr('line/strokeWidth', 1.5);
      edge.attr('line/strokeDasharray', style.dashArray);
      edge.attr('line/strokeDashoffset', 0);
      edge.attr('line/opacity', 1);
    });
  };

  // 高亮并居中显示指定节点
  const highlightAndCenterNode = useCallback((nodeId: string) => {
    if (!graphRef.current) return;

    const graph = graphRef.current;
    const node = graph.getCellById(nodeId);

    if (!node || !node.isNode()) return;

    // 清除之前的高亮
    clearHighlights(graph);

    // 高亮节点及其相关边
    highlightNodeEdges(graph, node);

    // 居中显示节点
    const position = node.position();
    const size = node.size();
    const centerX = position.x + size.width / 2;
    const centerY = position.y + size.height / 2;

    // 使用 scrollToPoint 实现平滑滚动
    graph.centerPoint(centerX, centerY);

    // 设置为选中节点
    const nodeData = node.getData() as RiskTopologyNode;
    setSelectedNode(nodeData);
    setShowPanel(true);
  }, []);

  // 应用布局算法
  const applyLayout = (graph: Graph, type: LayoutType) => {
    const allNodes = graph.getNodes();
    const allEdges = graph.getEdges();

    if (allNodes.length === 0) return;

    if (type === 'force') {
      // 力导向布局 - 增大半径避免重叠
      const centerX = graph.getGraphArea().width / 2;
      const centerY = graph.getGraphArea().height / 2;
      const radius = 300;  // 从 200 增加到 300

      allNodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / allNodes.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        node.position(x, y);
      });
    } else if (type === 'dagre') {
      // 层次布局 - 从左到右的树形布局，体现 K8s 资源层次关系
      const layers: Map<string, number> = new Map();
      const visited = new Set<string>();

      // 计算每个节点的层级（从左到右）
      const calculateLayer = (nodeId: string, layer: number = 0): number => {
        if (visited.has(nodeId)) return layers.get(nodeId) || 0;
        visited.add(nodeId);

        const outgoingEdges = allEdges.filter(e => e.getSourceCellId() === nodeId);
        let maxChildLayer = layer;

        outgoingEdges.forEach(edge => {
          const targetId = edge.getTargetCellId();
          if (targetId) {
            const childLayer = calculateLayer(targetId, layer + 1);
            maxChildLayer = Math.max(maxChildLayer, childLayer);
          }
        });

        layers.set(nodeId, layer);
        return maxChildLayer;
      };

      // 找到根节点（没有入边的节点）- 通常是 Namespace
      const rootNodes = allNodes.filter(node => {
        const nodeId = node.id;
        return !allEdges.some(e => e.getTargetCellId() === nodeId);
      });

      rootNodes.forEach(node => calculateLayer(node.id, 0));

      // 处理孤立节点（既没有入边也没有出边）
      allNodes.forEach(node => {
        if (!layers.has(node.id)) {
          layers.set(node.id, 0);
        }
      });

      // 按层级分组
      const layerGroups: Map<number, string[]> = new Map();
      layers.forEach((layer, nodeId) => {
        if (!layerGroups.has(layer)) {
          layerGroups.set(layer, []);
        }
        layerGroups.get(layer)!.push(nodeId);
      });

      // 从左到右布局节点
      const layerWidth = 320;   // 层间距（水平方向）
      const nodeSpacing = 150;  // 同层节点间距（垂直方向）
      const startX = 100;       // 起始 X 坐标
      const startY = 100;       // 起始 Y 坐标

      layerGroups.forEach((nodeIds, layer) => {
        const x = startX + layer * layerWidth;  // 水平方向按层级排列
        const totalHeight = nodeIds.length * nodeSpacing;
        const layerStartY = Math.max(startY, (graph.getGraphArea().height - totalHeight) / 2 + nodeSpacing / 2);

        nodeIds.forEach((nodeId, index) => {
          const node = graph.getCellById(nodeId);
          if (node && node.isNode()) {
            const y = layerStartY + index * nodeSpacing;  // 垂直方向排列同层节点
            node.position(x, y);
          }
        });
      });
    } else if (type === 'grid') {
      // 网格布局 - 增大单元格尺寸
      const cols = Math.ceil(Math.sqrt(allNodes.length));
      const cellWidth = 350;   // 从 250 增加到 350
      const cellHeight = 180;  // 从 120 增加到 180
      const startX = 100;
      const startY = 100;

      allNodes.forEach((node, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = startX + col * cellWidth;
        const y = startY + row * cellHeight;
        node.position(x, y);
      });
    } else if (type === 'circular') {
      // 环形布局 - 增大半径
      const centerX = graph.getGraphArea().width / 2;
      const centerY = graph.getGraphArea().height / 2;
      const radius = Math.min(centerX, centerY) * 0.7;  // 从 0.6 增加到 0.7

      allNodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / allNodes.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        node.position(x, y);
      });
    }

    // 布局完成后自适应视图 - 优化参数
    setTimeout(() => {
      graph.zoomToFit({
        padding: 100,      // 从 60 增加到 100
        maxScale: 1.0,     // 从 1.2 降低到 1.0，避免过度放大
        minScale: 0.1      // 添加最小缩放，允许缩小到 10%
      });
    }, 100);
  };

  // 初始化图形
  const initGraph = useCallback(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      background: { color: '#F8FAFC' },
      grid: { visible: true, type: 'dot', size: 10, args: { color: '#E2E8F0' } },
      panning: { enabled: true },
      mousewheel: { enabled: true, zoomAtMousePosition: true, modifiers: 'ctrl', minScale: 0.1, maxScale: 5 },
      connecting: { anchor: 'center', connectionPoint: 'boundary' },
    } as any);

    // 节点点击事件
    graph.on('node:click', ({ node }) => {
      const nodeData = node.getData() as RiskTopologyNode;
      setSelectedNode(nodeData);
      setShowPanel(true);
      highlightNodeEdges(graph, node);

      // 启动数据流动画
      startDataFlowAnimation(graph, node);

      // 触发光点环绕动画
      triggerGlowAnimation(nodeData.id);
    });

    // 画布点击清除选择
    graph.on('blank:click', () => {
      setSelectedNode(null);
      setShowPanel(false);
      clearHighlights(graph);
    });

    // 节点悬停效果
    graph.on('node:mouseenter', ({ node }) => {
      node.attr('body/strokeWidth', 3);
      node.attr('body/filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))');
    });

    graph.on('node:mouseleave', ({ node }) => {
      // 移除悬停效果（不依赖 selectedNode 状态）
      node.attr('body/strokeWidth', 2);
      node.attr('body/filter', 'none');
    });

    graphRef.current = graph;
    return graph;
  }, []); // 移除 selectedNode 依赖，避免重新初始化

  // 添加光点环绕效果（初始化时创建，但默认隐藏）
  const addGlowingOrbitEffect = (cell: any, node: RiskTopologyNode) => {
    // 根据状态确定光效颜色
    let glowColor = '#3B82F6'; // 默认蓝色
    if (node.status === 'Running' || node.status === 'Ready' || node.status === 'Available') {
      glowColor = '#10B981'; // 绿色
    } else if (node.status === 'Error' || node.status === 'Failed' || node.status === 'CrashLoopBackOff') {
      glowColor = '#EF4444'; // 红色
    } else if (node.status === 'Warning' || node.status === 'Pending') {
      glowColor = '#F59E0B'; // 橙色
    }

    // 获取节点的 SVG <g> 元素
    const nodeView = graphRef.current?.findViewByCell(cell);
    if (!nodeView) return;

    const gElement = nodeView.container as SVGGElement;
    if (!gElement) return;

    // 查找或创建 defs 元素
    let defs = gElement.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      gElement.insertBefore(defs, gElement.firstChild);
    }

    // 创建径向渐变（光点效果）
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', `glow-gradient-${node.id}`);
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', glowColor);
    stop1.setAttribute('stop-opacity', '1');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', glowColor);
    stop2.setAttribute('stop-opacity', '0.8');
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', glowColor);
    stop3.setAttribute('stop-opacity', '0');
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);

    // 创建模糊滤镜（光晕效果）
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `glow-filter-${node.id}`);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '4');
    blur.setAttribute('result', 'coloredBlur');
    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeNode1.setAttribute('in', 'coloredBlur');
    const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeNode2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mergeNode1);
    merge.appendChild(mergeNode2);
    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);

    // 创建圆角矩形路径（用于光点沿边框运动）
    const width = 200;
    const height = 70;
    const rx = 8;
    // 创建圆角矩形路径 - 沿着边框外围
    const pathData = `
      M ${rx},0
      L ${width - rx},0
      Q ${width},0 ${width},${rx}
      L ${width},${height - rx}
      Q ${width},${height} ${width - rx},${height}
      L ${rx},${height}
      Q 0,${height} 0,${height - rx}
      L 0,${rx}
      Q 0,0 ${rx},0
    `;

    // 创建多个光点以增强效果
    for (let i = 0; i < 3; i++) {
      const orb = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      orb.setAttribute('r', '6');
      orb.setAttribute('fill', `url(#glow-gradient-${node.id})`);
      orb.setAttribute('filter', `url(#glow-filter-${node.id})`);
      orb.setAttribute('opacity', '0'); // 默认隐藏
      orb.setAttribute('class', `glow-orb-${node.id}`);
      orb.setAttribute('data-orb-index', String(i));

      // 创建动画（沿路径运动）
      const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      animateMotion.setAttribute('dur', '2s');
      animateMotion.setAttribute('begin', `${i * 0.66}s`); // 错开起始时间
      animateMotion.setAttribute('repeatCount', 'indefinite');
      animateMotion.setAttribute('path', pathData);

      orb.appendChild(animateMotion);
      gElement.appendChild(orb);
    }
  };

  // 触发光点环绕动画（点击节点时调用）
  const triggerGlowAnimation = (nodeId: string) => {
    const orbs = document.querySelectorAll(`.glow-orb-${nodeId}`);
    if (orbs.length === 0) return;

    // 显示所有光点并增强效果
    orbs.forEach((orb) => {
      orb.setAttribute('opacity', '0.9');
      orb.setAttribute('r', '7');
    });

    // 3秒后淡出
    setTimeout(() => {
      orbs.forEach((orb) => {
        orb.setAttribute('opacity', '0');
        orb.setAttribute('r', '6');
      });
    }, 3000);
  };

  // 渲染拓扑
  const renderTopology = useCallback(() => {
    if (!graphRef.current || filteredNodes.length === 0) return;
    const graph = graphRef.current;
    graph.clearCells();

    // 添加节点 - 使用 rect 节点，增大尺寸以完全包含文字
    filteredNodes.forEach((node) => {
      const typeStyle = nodeStyleConfig[node.type] || { fill: '#f5f5f5', icon: 'ND', iconBg: '#999', domain: 'unknown' };
      const hasRisk = node.riskCount > 0;
      const borderColor = getNodeBorderColor(node);

      // 不截断名称，让节点自适应
      const displayName = node.name;

      graph.addNode({
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        width: 200,  // 增大宽度
        height: 70,  // 增大高度
        data: node,
        shape: 'rect',
        attrs: {
          body: {
            fill: typeStyle.fill,
            stroke: borderColor,
            strokeWidth: 2,
            rx: 8,
            ry: 8,
          },
        },
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'rect',
            selector: 'icon-bg',
          },
          {
            tagName: 'text',
            selector: 'icon-text',
          },
          {
            tagName: 'text',
            selector: 'name-text',
          },
          {
            tagName: 'text',
            selector: 'type-text',
          },
          ...(hasRisk ? [
            {
              tagName: 'circle',
              selector: 'risk-badge',
            },
            {
              tagName: 'text',
              selector: 'risk-count',
            },
          ] : []),
        ] as any,
      });

      // 更新节点的详细样式
      const cell = graph.getCellById(node.id);
      if (cell) {
        cell.attr({
          'icon-bg': {
            width: 40,
            height: 40,
            x: 15,
            y: 15,
            fill: typeStyle.iconBg,
            rx: 6,
            ry: 6,
          },
          'icon-text': {
            text: typeStyle.icon,
            fill: '#fff',
            fontSize: 13,
            fontWeight: 600,
            x: 35,
            y: 35,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            refX: null,  // 移除默认的 refX
            refY: null,  // 移除默认的 refY
          },
          'name-text': {
            text: displayName,
            fill: '#1a1a1a',
            fontSize: 13,
            fontWeight: 500,
            x: 65,
            y: 28,
            textAnchor: 'start',
            refX: null,  // 移除默认的 refX
            refY: null,  // 移除默认的 refY
          },
          'type-text': {
            text: node.type,
            fill: '#666',
            fontSize: 11,
            x: 65,
            y: 45,
            textAnchor: 'start',
            refX: null,  // 移除默认的 refX
            refY: null,  // 移除默认的 refY
          },
        });

        if (hasRisk) {
          cell.attr({
            'risk-badge': {
              cx: 185,
              cy: 15,
              r: 10,
              fill: node.riskCount >= 2 ? '#EF4444' : '#F59E0B',
              stroke: '#fff',
              strokeWidth: 2,
            },
            'risk-count': {
              text: String(node.riskCount),
              fill: '#fff',
              fontSize: 11,
              fontWeight: 600,
              x: 185,
              y: 15,
              textAnchor: 'middle',
              textVerticalAnchor: 'middle',
            },
          });
        }

        // 添加光点环绕效果
        addGlowingOrbitEffect(cell, node);
      }
    });

    // 添加边 - 使用流线型线条（smooth connector）
    filteredEdges.forEach((edge) => {
      const style = getRelationStyle(edge.type);
      graph.addEdge({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: { type: edge.type, label: edge.label },
        attrs: {
          line: {
            stroke: style.stroke,
            strokeWidth: 2,
            strokeDasharray: style.dashArray,
            targetMarker: {
              name: 'block',
              size: 8,
              fill: style.stroke,
            },
          },
        },
        labels: edge.label ? [{
          attrs: {
            label: {
              text: edge.label,
              fontSize: 11,
              fill: '#666',
            },
            body: {
              fill: '#fff',
              stroke: '#e8e8e8',
              strokeWidth: 1,
              rx: 4,
              ry: 4,
            },
          },
          position: 0.5,
        }] : [],
        router: { name: 'normal' },  // 使用 normal router 而不是 manhattan
        connector: { name: 'smooth', args: { radius: 20 } },  // 使用 smooth connector 实现流线型
      });
    });

    // 应用布局算法
    applyLayout(graph, layoutType);
  }, [filteredNodes, filteredEdges, layoutType]);

  // 缩放操作
  const handleZoomIn = () => graphRef.current?.zoom(0.1);
  const handleZoomOut = () => graphRef.current?.zoom(-0.1);
  const handleFitView = () => graphRef.current?.zoomToFit({ padding: 40, maxScale: 1 });

  // 切换布局
  const handleLayoutChange = (type: LayoutType) => {
    setLayoutType(type);
    if (graphRef.current) {
      applyLayout(graphRef.current, type);
    }
  };

  useEffect(() => {
    initGraph();
    loadTopologyData();
    return () => graphRef.current?.dispose();
  }, [initGraph, loadTopologyData]);

  useEffect(() => {
    renderTopology();
  }, [renderTopology]);

  // 侧边栏拖拽处理
  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const handleDetailMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingDetail(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        // 修复：使用 e.clientX 作为新宽度（支持双向拖拽）
        const newWidth = Math.max(200, Math.min(600, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingDetail) {
        const newWidth = Math.max(300, Math.min(800, window.innerWidth - e.clientX));
        setDetailPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizingSidebar) {
        setIsResizingSidebar(false);
        localStorage.setItem('riskTopology_sidebarWidth', sidebarWidth.toString());
      }
      if (isResizingDetail) {
        setIsResizingDetail(false);
        localStorage.setItem('riskTopology_detailPanelWidth', detailPanelWidth.toString());
      }
    };

    if (isResizingSidebar || isResizingDetail) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar, isResizingDetail, sidebarWidth, detailPanelWidth]);

  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current && containerRef.current) {
        graphRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);

        // 重新适应视图
        setTimeout(() => {
          graphRef.current?.zoomToFit({
            padding: 100,
            maxScale: 1.0,
            minScale: 0.1
          });
        }, 100);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 监听边栏折叠状态变化，重新适应视图
  useEffect(() => {
    if (graphRef.current && containerRef.current) {
      setTimeout(() => {
        const width = containerRef.current!.clientWidth;
        const height = containerRef.current!.clientHeight;
        graphRef.current!.resize(width, height);

        graphRef.current?.zoomToFit({
          padding: 100,
          maxScale: 1.0,
          minScale: 0.1
        });
      }, 350); // 等待边栏折叠动画完成（0.3s + 50ms buffer）
    }
  }, [sidebarCollapsed]);

  // 切换侧边栏折叠状态
  const toggleSidebar = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('riskTopology_sidebarCollapsed', String(collapsed));
  }, []);

  // 渲染左侧边栏
  const renderSidebar = () => {
    if (sidebarCollapsed) {
      return (
        <div className={styles.sidebarCollapsed}>
          <Button
            text
            size="small"
            onClick={() => toggleSidebar(false)}
            className={styles.collapseBtn}
          >
            <Icon type="arrow-right" />
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.sidebar} style={{ width: sidebarWidth }}>
        {/* 头部标题 */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logoTitle}>
            <span className={styles.logoText}>资源拓扑</span>
          </div>
          <Button
            text
            size="small"
            onClick={() => toggleSidebar(true)}
            className={styles.collapseBtn}
          >
            <Icon type="arrow-left" />
          </Button>
        </div>

        {/* Tab 切换 */}
        <div className={styles.tabBar}>
          {['概览', '域视图', '过滤器'].map((tab, index) => (
            <div
              key={tab}
              className={`${styles.tabItem} ${activeTab === ['overview', 'domain', 'filter'][index] ? styles.tabItemActive : ''}`}
              onClick={() => setActiveTab(['overview', 'domain', 'filter'][index] as any)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* 根据 activeTab 显示不同内容 */}
        {activeTab === 'overview' && (
          <>
            {/* 资源统计 */}
            <div className={styles.statsSection}>
              <div className={styles.statsSectionTitle}>资源统计</div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{statistics.totalNodes}</div>
                  <div className={styles.statLabel}>节点总数</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{statistics.totalEdges}</div>
                  <div className={styles.statLabel}>关系总数</div>
                </div>
              </div>
            </div>

            {/* 状态分布 */}
            <div className={styles.statsSection}>
              <div className={styles.statsSectionTitle}>状态分布</div>
              <div className={styles.statusList}>
                {Object.entries(statistics.statusStats).map(([status, count]) => (
                  <div key={status} className={styles.statusItem}>
                    <span className={styles.statusDot} style={{ background: statusColors[status]?.border || '#6B7280' }} />
                    <span className={styles.statusLabel}>{statusColors[status]?.label || status}</span>
                    <span className={styles.statusCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 域分布 */}
            <div className={styles.statsSection}>
              <div className={styles.statsSectionTitle}>域分布</div>
              <div className={styles.domainList}>
                {Object.entries(statistics.domainStats).map(([domain, count]) => (
                  <div key={domain} className={styles.domainItem}>
                    <span
                      className={styles.domainIcon}
                      style={{ background: domainConfig[domain]?.color || '#6B7280' }}
                    />
                    <span className={styles.domainName}>{domainConfig[domain]?.name || domain}</span>
                    <span className={styles.domainCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 命名空间分布 */}
            <div className={styles.statsSection}>
              <div className={styles.statsSectionTitle}>命名空间分布</div>
              <div className={styles.namespaceList}>
                {Object.entries(statistics.namespaceStats).map(([ns, count]) => (
                  <div key={ns} className={styles.namespaceItem}>
                    <span className={styles.namespaceName}>{ns}</span>
                    <span className={styles.namespaceCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 域视图 Tab */}
        {activeTab === 'domain' && (
          <div className={styles.domainViewSection}>
            {Object.entries(domainConfig).map(([domainKey, domainInfo]) => {
              const domainNodes = nodesByDomain[domainKey] || [];
              const isExpanded = expandedDomains.has(domainKey);

              return (
                <div key={domainKey} className={styles.domainGroup}>
                  {/* 域标题 */}
                  <div
                    className={styles.domainGroupHeader}
                    onClick={() => {
                      setExpandedDomains(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(domainKey)) {
                          newSet.delete(domainKey);
                        } else {
                          newSet.add(domainKey);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <Icon type={isExpanded ? 'arrow-down' : 'arrow-right'} size="xs" />
                    <span
                      className={styles.domainIcon}
                      style={{ background: domainInfo.color }}
                    />
                    <span className={styles.domainGroupName}>{domainInfo.name}</span>
                    <span className={styles.domainGroupCount}>({domainNodes.length})</span>
                  </div>

                  {/* 域下的资源列表 */}
                  {isExpanded && (
                    <div className={styles.domainResourceList}>
                      {domainNodes.length === 0 ? (
                        <div className={styles.emptyResourceList}>暂无资源</div>
                      ) : (
                        domainNodes.map(node => {
                          const nodeStyle = nodeStyleConfig[node.type];
                          return (
                            <div
                              key={node.id}
                              className={styles.resourceItem}
                              onClick={() => highlightAndCenterNode(node.id)}
                            >
                              <div
                                className={styles.resourceIcon}
                                style={{ background: nodeStyle?.iconBg || '#3B82F6' }}
                              >
                                {nodeStyle?.icon || '?'}
                              </div>
                              <div className={styles.resourceInfo}>
                                <div className={styles.resourceName}>{node.name}</div>
                                <div className={styles.resourceType}>{node.type}</div>
                              </div>
                              {node.riskCount > 0 && (
                                <div className={styles.resourceRiskBadge}>
                                  {node.riskCount}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 过滤器 Tab */}
        {activeTab === 'filter' && (
          <div className={styles.filterSection}>
            {/* 域过滤 */}
            <div className={styles.filterGroup}>
              <div className={styles.filterGroupTitle}>域过滤</div>
              <div className={styles.filterCheckboxGroup}>
                {Object.entries(domainConfig).map(([key, config]) => (
                  <div key={key} className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      id={`domain-${key}`}
                      checked={filterConfig.domains.includes(key)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFilterConfig(prev => ({
                          ...prev,
                          domains: checked
                            ? [...prev.domains, key]
                            : prev.domains.filter(d => d !== key)
                        }));
                      }}
                    />
                    <label htmlFor={`domain-${key}`}>
                      <span className={styles.domainIcon} style={{ background: config.color }} />
                      {config.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 状态过滤 */}
            <div className={styles.filterGroup}>
              <div className={styles.filterGroupTitle}>状态过滤</div>
              <div className={styles.filterCheckboxGroup}>
                {Object.entries(statusColors).map(([status, config]) => (
                  <div key={status} className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      checked={filterConfig.statuses.includes(status)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFilterConfig(prev => ({
                          ...prev,
                          statuses: checked
                            ? [...prev.statuses, status]
                            : prev.statuses.filter(s => s !== status)
                        }));
                      }}
                    />
                    <label htmlFor={`status-${status}`}>
                      <span className={styles.statusDot} style={{ background: config.border }} />
                      {config.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 命名空间过滤 */}
            <div className={styles.filterGroup}>
              <div className={styles.filterGroupTitle}>命名空间</div>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="选择命名空间"
                value={filterConfig.namespaces}
                onChange={(value) => setFilterConfig(prev => ({ ...prev, namespaces: value as string[] }))}
                dataSource={Object.keys(statistics.namespaceStats).map(ns => ({ label: ns, value: ns }))}
              />
            </div>

            {/* 搜索 */}
            <div className={styles.filterGroup}>
              <div className={styles.filterGroupTitle}>搜索</div>
              <Input
                placeholder="搜索资源名称"
                value={searchText}
                onChange={(value) => setSearchText(value)}
                hasClear
              />
            </div>

            {/* 重置按钮 */}
            <div className={styles.filterActions}>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setFilterConfig({
                    resourceTypes: [],
                    namespaces: [],
                    statuses: [],
                    hasRisk: null,
                    domains: [],
                  });
                  setSearchText('');
                }}
              >
                重置过滤器
              </Button>
            </div>
          </div>
        )}

        {/* 拖拽手柄 */}
        <div
          className={styles.resizeHandle}
          onMouseDown={handleSidebarMouseDown}
        />
      </div>
    );
  };

  // 渲染右侧详情面板
  const renderDetailPanel = () => {
    if (!selectedNode) return null;

    const typeStyle = nodeStyleConfig[selectedNode.type];
    const status = statusColors[selectedNode.status] || statusColors.unknown;
    const isService = selectedNode.type === 'SERVICE';

    return (
      <div className={styles.detailPanel} style={{ width: detailPanelWidth }}>
        {/* 拖拽手柄 */}
        <div
          className={styles.resizeHandle}
          style={{ left: 0 }}
          onMouseDown={handleDetailMouseDown}
        />

        <div className={styles.detailHeader}>
          <div className={styles.detailTabs}>
            <span
              className={detailTab === 'detail' ? styles.detailTabActive : styles.detailTab}
              onClick={() => setDetailTab('detail')}
            >
              详情
            </span>
            <span
              className={detailTab === 'relations' ? styles.detailTabActive : styles.detailTab}
              onClick={() => setDetailTab('relations')}
            >
              关系
            </span>
            {isService && (
              <span
                className={detailTab === 'trace' ? styles.detailTabActive : styles.detailTab}
                onClick={() => setDetailTab('trace')}
              >
                Trace
              </span>
            )}
          </div>
          <Button text onClick={() => { setShowPanel(false); setSelectedNode(null); setDetailTab('detail'); if (graphRef.current) clearHighlights(graphRef.current); }}>
            <Icon type="close" />
          </Button>
        </div>
        <div className={styles.detailContent}>
          {/* 详情 Tab */}
          {detailTab === 'detail' && (
            <>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>名称</span>
                <span className={styles.detailValue}>{selectedNode.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>类型</span>
                <span className={styles.detailValue}>{selectedNode.type}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>域</span>
                <Tag size="small" style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none' }}>
                  {typeStyle?.domain || 'unknown'}
                </Tag>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>命名空间</span>
                <Tag size="small" style={{ background: '#EFF6FF', color: '#3B82F6', border: 'none' }}>
                  {selectedNode.namespace || 'default'}
                </Tag>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>状态</span>
                <span className={styles.detailValue}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: status.border }} />
                    {status.label}
                  </span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>ID</span>
                <span className={styles.detailValueSmall}>{selectedNode.id}</span>
              </div>

              {selectedNode.labels && Object.keys(selectedNode.labels).length > 0 && (
                <>
                  <div className={styles.detailDivider} />
                  <div className={styles.detailSectionTitle}>标签</div>
                  <div className={styles.labelGrid}>
                    {Object.entries(selectedNode.labels).slice(0, 5).map(([key, value]) => (
                      <div key={key} className={styles.labelItem}>
                        <span className={styles.labelKey}>{key}</span>
                        <span className={styles.labelValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedNode.metadata && (
                <>
                  <div className={styles.detailDivider} />
                  <div className={styles.detailSectionTitle}>属性</div>
                  <div className={styles.propsGrid}>
                    {Object.entries(selectedNode.metadata).map(([key, value]) => (
                      <div key={key} className={styles.propsRow}>
                        <span className={styles.propsKey}>{key}</span>
                        <span className={styles.propsValue}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* 关系 Tab */}
          {detailTab === 'relations' && (
            <div className={styles.relationsTab}>
              <div className={styles.detailSectionTitle}>相关资源</div>
              <div className={styles.relationsList}>
                {edges
                  .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                  .map(edge => {
                    const isSource = edge.source === selectedNode.id;
                    const relatedNodeId = isSource ? edge.target : edge.source;
                    const relatedNode = nodes.find(n => n.id === relatedNodeId);
                    if (!relatedNode) return null;

                    return (
                      <div
                        key={edge.id}
                        className={styles.relationItem}
                        onClick={() => highlightAndCenterNode(relatedNode.id)}
                      >
                        <div className={styles.relationIcon}>
                          {nodeStyleConfig[relatedNode.type]?.icon || '?'}
                        </div>
                        <div className={styles.relationInfo}>
                          <div className={styles.relationName}>{relatedNode.name}</div>
                          <div className={styles.relationType}>
                            {isSource ? '→' : '←'} {edge.type}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Trace Tab (仅 Service 类型) */}
          {detailTab === 'trace' && isService && (
            <TracePanel serviceId={selectedNode.id} serviceName={selectedNode.name} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* 左侧边栏 */}
      {renderSidebar()}

      {/* 中间画布区 */}
      <div className={styles.mainArea}>
        {/* 顶部搜索栏 */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <Select
              size="small"
              value="生产集群"
              style={{ width: 120 }}
              disabled
            />
            <Tag size="small" style={{ marginLeft: 8 }}>
              {Object.keys(statistics.namespaceStats)[0] || 'default'}
            </Tag>
          </div>
          <div className={styles.topBarRight}>
            <Button
              type="primary"
              size="small"
              onClick={handleRiskAnalysis}
              style={{ marginRight: 12 }}
            >
              <Icon type="chart-bar" style={{ marginRight: 4 }} />
              风险分析
            </Button>
            <Input
              size="small"
              placeholder="搜索资源..."
              value={searchText}
              onChange={(v: any) => setSearchText(v)}
              style={{ width: 180 }}
              innerBefore={<Icon type="search" style={{ marginLeft: 8 }} />}
            />
          </div>
        </div>

        {/* 画布 */}
        <div className={styles.canvasWrapper}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <Loading tip="加载拓扑数据中..." />
            </div>
          )}
          <div ref={containerRef} className={styles.canvas} />

          {/* 底部工具栏 */}
          <div className={styles.bottomToolbar}>
            <Select
              size="small"
              value={layoutType}
              onChange={(v: any) => handleLayoutChange(v)}
              style={{ width: 100 }}
            >
              <Select.Option value="force">力导向布局</Select.Option>
              <Select.Option value="dagre">层次布局</Select.Option>
              <Select.Option value="grid">网格布局</Select.Option>
              <Select.Option value="circular">环形布局</Select.Option>
            </Select>
            <div className={styles.zoomControls}>
              <Button size="small" onClick={handleZoomIn}><Icon type="add" /></Button>
              <Button size="small" onClick={handleZoomOut}><Icon type="minus" /></Button>
              <Button size="small" onClick={handleFitView}><Icon type="ashbin" /></Button>
            </div>
            <Button size="small" onClick={loadTopologyData} disabled={loading}>
              <Icon type="download" style={{ marginRight: 4 }} />
              导出
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧详情面板 */}
      {showPanel && renderDetailPanel()}

      {/* 风险分析抽屉 */}
      <RiskAnalysisDrawer
        visible={riskAnalysisVisible}
        loading={riskAnalysisLoading}
        risks={analyzedRisks}
        onClose={() => setRiskAnalysisVisible(false)}
        onGenerateExperiment={handleGenerateExperiment}
      />

      {/* 生成演练场景模态框 */}
      <GenerateExperimentModal
        visible={generateModalVisible}
        risks={selectedRisksForGenerate}
        faults={Array.from(selectedFaultsForGenerate.entries()).flatMap(([riskId, faultCodes]) => {
          const risk = selectedRisksForGenerate.find(r => r.id === riskId);
          return faultCodes.map(faultCode => {
            const fault = risk?.recommendedFaults.find(f => f.faultCode === faultCode);
            return {
              riskPointId: riskId,
              faultCode,
              faultName: fault?.faultName || '',
              parameters: fault?.parameters || {},
            };
          });
        })}
        onCancel={() => setGenerateModalVisible(false)}
        onConfirm={handleConfirmGenerate}
      />
    </div>
  );
};

export default RiskTopology;
