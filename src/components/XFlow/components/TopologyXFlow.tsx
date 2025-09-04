import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Graph } from '@antv/x6';
import { message, Modal, Spin } from 'antd';
import { ToolbarPanel } from './panels/ToolbarPanel';
import { PropertyPanel } from './panels/PropertyPanel';
import { LegendPanel } from './panels/LegendPanel';
import { registerCustomNodes, createGraphConfig } from '../config/nodeConfig';
import { registerCustomEdges, getEdgeShape, createEdgeLabel } from '../config/edgeConfig';
import { xflowApi } from '../services/xflowApi';
import { LayoutService } from '../services/layoutService';
import type {
  XFlowData,
  XFlowNode,
  XFlowEdge,
  LayoutAlgorithm,
  LayoutDirection,
} from '../types/xflow';

/**
 * 主要的 XFlow 拓扑组件
 */
export const TopologyXFlow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState<string | null>(null);
  const [ topologyData, setTopologyData ] = useState<XFlowData | null>(null);
  const [ selectedNode, setSelectedNode ] = useState<{ id: string; data: any } | null>(null);
  const [ selectedEdge, setSelectedEdge ] = useState<{ id: string; data: any } | null>(null);

  // 初始化图形
  const initGraph = useCallback(() => {
    if (!containerRef.current) return;

    // 注册自定义组件
    registerCustomNodes();
    registerCustomEdges();

    // 创建图形实例
    // @ts-ignore - 忽略类型错误，使用运行时支持的配置
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      ...createGraphConfig(),
    });

    // 增强滚轮缩放体验
    containerRef.current.addEventListener('wheel', e => {
      // 阻止原生滚动事件
      e.preventDefault();

      // 只有在按住 Ctrl 键时才进行缩放
      if (e.ctrlKey && graphRef.current) {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        graphRef.current.zoom(delta);
      }
    }, { passive: false });

    // 添加事件监听
    graph.on('node:click', ({ node, e }) => {
      // 高亮节点的所有入边和出边
      highlightNodeEdges(graph, node);

      setSelectedNode({
        id: node.id,
        data: node.getData(),
      });
      setSelectedEdge(null);
    });
    
    // 添加双击事件监听
    graph.on('node:dblclick', ({ node, e }) => {
      const nodeData = node.getData();
      
      // 如果双击的是 Service 节点，则折叠其下游的 RPC 节点
      if (nodeData && nodeData.entityType === 'SERVICE') {
        e.stopPropagation();
        
        // 查找该 Service 节点的所有下游 RPC 节点
        const downstreamRpcNodes = [];
        const edges = graph.getEdges();
        
        edges.forEach(edge => {
          if (edge.getSourceCellId() === node.id) {
            const targetNode = graph.getCellById(edge.getTargetCellId());
            if (targetNode && targetNode.getData()?.entityType === 'RPC') {
              downstreamRpcNodes.push(targetNode);
            }
          }
        });
        
        // 如果找到了下游 RPC 节点
        if (downstreamRpcNodes.length > 0) {
          // 隐藏所有下游 RPC 节点
          downstreamRpcNodes.forEach(childNode => {
            childNode.setVisible(false);
          });
          
          // 创建虚拟节点来代表这些被折叠的 RPC 节点
          const virtualNodeId = `virtual-${node.id}`;
          const nodePosition = node.getPosition();
          
          // 检查是否已经存在虚拟节点
          const existingVirtualNode = graph.getCellById(virtualNodeId);
          if (!existingVirtualNode) {
            graph.addNode({
              id: virtualNodeId,
              shape: 'rect',
              x: nodePosition.x + 150,
              y: nodePosition.y,
              width: 100,
              height: 40,
              label: `RPC组 (${downstreamRpcNodes.length})`,
              attrs: {
                body: {
                  fill: '#f0f0f0',
                  stroke: '#722ed1', // 紫色边框
                  strokeWidth: 2,
                },
                label: {
                  fontSize: 12,
                  fill: '#722ed1', // 紫色文字
                  textAnchor: 'middle',
                  textVerticalAnchor: 'middle',
                },
              },
              data: {
                isVirtual: true,
                entityType: 'VIRTUAL',
                downstreamRpcNodes: downstreamRpcNodes.map(n => n.id),
                serviceNodeId: node.id,
              },
            });
            
            // 创建虚线连接边
            const edgeId = `edge-${node.id}-${virtualNodeId}`;
            graph.addEdge({
              id: edgeId,
              source: node.id,
              target: virtualNodeId,
              attrs: {
                line: {
                  stroke: '#722ed1',
                  strokeWidth: 1,
                  strokeDasharray: '5 5', // 虚线
                  targetMarker: 'block',
                },
              },
              data: {
                type: 'VIRTUAL_CONNECTION',
              },
            });
          }
          
          message.info(`已折叠 ${downstreamRpcNodes.length} 个 RPC 节点`);
        }
        
        return;
      }
      
      // 如果双击的是虚拟节点，则展开其代表的 RPC 节点
      if (nodeData && nodeData.isVirtual) {
        e.stopPropagation();
        
        // 显示被折叠的 RPC 节点
        const downstreamRpcNodeIds = nodeData.downstreamRpcNodes || [];
        downstreamRpcNodeIds.forEach((nodeId: string) => {
          const rpcNode = graph.getCellById(nodeId);
          if (rpcNode) {
            rpcNode.setVisible(true);
          }
        });
        
        // 删除虚拟节点及其连接边
        const serviceNodeId = nodeData.serviceNodeId;
        if (serviceNodeId) {
          const edgeId = `edge-${serviceNodeId}-${node.id}`;
          const edge = graph.getCellById(edgeId);
          if (edge) {
            edge.remove();
          }
        }
        node.remove();
        
        message.info(`已展开 ${downstreamRpcNodeIds.length} 个 RPC 节点`);
        return;
      }
      
      // 对于其他节点的双击事件，仍然高亮节点
      highlightNodeEdges(graph, node);
      
      setSelectedNode({
        id: node.id,
        data: node.getData(),
      });
      setSelectedEdge(null);
    });

    graph.on('edge:click', ({ edge }) => {
      // 高亮边及其两个端点
      highlightEdgeAndNodes(graph, edge);

      setSelectedEdge({
        id: edge.id,
        data: edge.getData(),
      });
      setSelectedNode(null);
    });

    graph.on('blank:click', () => {
      // 清除所有高亮
      clearHighlights(graph);
      setSelectedNode(null);
      setSelectedEdge(null);
    });

    // 添加节点悬停效果
    graph.on('node:mouseenter', ({ node }) => {
      node.addTools([
        {
          name: 'boundary',
          args: {
            attrs: {
              fill: '#7c68fc',
              stroke: '#9254de',
              strokeWidth: 1,
              fillOpacity: 0.2,
            },
          },
        },
      ]);
    });

    graph.on('node:mouseleave', ({ node }) => {
      node.removeTools();
    });

    graphRef.current = graph;

    return graph;
  }, []);

  // 高亮节点的所有入边和出边
  const highlightNodeEdges = (graph: Graph, node: any) => {
    // 清除之前的高亮
    clearHighlights(graph);

    // 高亮节点本身
    node.attr('body/stroke', '#ff4d4f');
    node.attr('body/strokeWidth', 3);

    // 获取节点的所有入边和出边
    const edges = graph.getConnectedEdges(node);

    // 高亮所有连接的边
    edges.forEach(edge => {
      edge.attr('line/stroke', '#ff4d4f');
      edge.attr('line/strokeWidth', 3);

      // 高亮边的另一端节点
      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();

      if (sourceNode && sourceNode.id !== node.id) {
        sourceNode.attr('body/stroke', '#ff4d4f');
        sourceNode.attr('body/strokeWidth', 2);
      }

      if (targetNode && targetNode.id !== node.id) {
        targetNode.attr('body/stroke', '#ff4d4f');
        targetNode.attr('body/strokeWidth', 2);
      }
    });
  };

  // 高亮边及其两个端点
  const highlightEdgeAndNodes = (graph: Graph, edge: any) => {
    // 清除之前的高亮
    clearHighlights(graph);

    // 高亮边
    edge.attr('line/stroke', '#ff4d4f');
    edge.attr('line/strokeWidth', 3);

    // 高亮边的源节点和目标节点
    const sourceNode = edge.getSourceNode();
    const targetNode = edge.getTargetNode();

    if (sourceNode) {
      sourceNode.attr('body/stroke', '#ff4d4f');
      sourceNode.attr('body/strokeWidth', 2);
    }

    if (targetNode) {
      targetNode.attr('body/stroke', '#ff4d4f');
      targetNode.attr('body/strokeWidth', 2);
    }
  };

  // 清除所有高亮
  const clearHighlights = (graph: Graph) => {
    // 重置所有节点的样式
    const nodes = graph.getNodes();
    nodes.forEach(node => {
      // 恢复默认的节点边框样式
      node.attr('body/stroke', '#5F95FF');
      node.attr('body/strokeWidth', 1);
    });

    // 重置所有边的样式
    const edges = graph.getEdges();
    edges.forEach(edge => {
      // 恢复默认的边样式
      const edgeData = edge.getData();
      const edgeType = edgeData?.data?.type || 'default';

      // 根据边的类型恢复样式
      switch (edgeType) {
        case 'DEPENDS_ON':
          edge.attr('line/stroke', '#1890ff');
          edge.attr('line/strokeWidth', 2);
          break;
        case 'CONTAINS':
          edge.attr('line/stroke', '#52c41a');
          edge.attr('line/strokeWidth', 1);
          edge.attr('line/strokeDasharray', '5 5');
          break;
        case 'INVOKES':
          edge.attr('line/stroke', '#1890ff');
          edge.attr('line/strokeWidth', 1.5);
          break;
        case 'RUNS_ON':
          edge.attr('line/stroke', '#722ed1');
          edge.attr('line/strokeWidth', 2);
          edge.attr('line/strokeDasharray', '10 2');
          break;
        case 'VIRTUAL_CONNECTION':
          edge.attr('line/stroke', '#722ed1');
          edge.attr('line/strokeWidth', 1);
          edge.attr('line/strokeDasharray', '5 5');
          break;
        default:
          edge.attr('line/stroke', '#d9d9d9');
          edge.attr('line/strokeWidth', 1);
      }
    });
  };

  // 高亮指定节点
  const highlightNode = (graph: Graph, nodeId: string) => {
    // 清除之前的所有高亮
    clearHighlights(graph);
    
    // 查找并高亮指定节点
    const node = graph.getCellById(nodeId);
    if (node && node.isNode()) {
      // 高亮节点本身
      node.attr('body/stroke', '#ff4d4f');
      node.attr('body/strokeWidth', 3);
      
      // 获取节点的所有入边和出边
      const edges = graph.getConnectedEdges(node);
      
      // 高亮所有连接的边
      edges.forEach(edge => {
        edge.attr('line/stroke', '#ff4d4f');
        edge.attr('line/strokeWidth', 3);
        
        // 高亮边的另一端节点
        const sourceNode = edge.getSourceNode();
        const targetNode = edge.getTargetNode();
        
        if (sourceNode && sourceNode.id !== nodeId) {
          sourceNode.attr('body/stroke', '#ff4d4f');
          sourceNode.attr('body/strokeWidth', 2);
        }
        
        if (targetNode && targetNode.id !== nodeId) {
          targetNode.attr('body/stroke', '#ff4d4f');
          targetNode.attr('body/strokeWidth', 2);
        }
      });
      
      // 将视图滚动到节点位置并适当缩放
      const nodePosition = node.getPosition();
      
      // 使用更兼容的方式获取图形尺寸
      let width = 800;
      let height = 600;
      
      // 尝试多种方式获取图形尺寸
      try {
        // 方法1: 使用getContainer获取容器元素尺寸
        const container = graph.container;
        if (container) {
          width = container.clientWidth || width;
          height = container.clientHeight || height;
        }
      } catch (e) {
        console.warn('Failed to get graph container size, using default values', e);
      }
      
      // 如果还是获取不到，尝试使用节点的尺寸
      const nodeWidth = node.getSize().width || 120;
      const nodeHeight = node.getSize().height || 60;
      
      // 计算居中位置
      const centerX = nodePosition.x - width / 2 + nodeWidth / 2;
      const centerY = nodePosition.y - height / 2 + nodeHeight / 2;
      
      // 移动到节点位置
      graph.translate(-centerX, -centerY);
      
      // 设置合适的缩放级别
      try {
        const currentScale = graph.transform.getScale().sx;
        if (currentScale < 0.8) {
          graph.zoomTo(0.8);
        }
      } catch (e) {
        console.warn('Failed to zoom graph', e);
      }
      
      return true;
    }
    return false;
  };

  // 自动折叠所有RPC节点
  const autoCollapseRpcNodes = useCallback((graph: Graph, data: XFlowData) => {
    if (!graph || !data) return;

    // 获取所有Service节点
    const serviceNodes = graph.getNodes().filter(node => {
      const nodeData = node.getData();
      return nodeData && nodeData.entityType === 'SERVICE';
    });

    // 为每个Service节点折叠其下游的RPC节点
    serviceNodes.forEach(serviceNode => {
      // 查找该Service节点的所有下游RPC节点
      const downstreamRpcNodes = [];
      const edges = graph.getEdges();
      
      edges.forEach(edge => {
        if (edge.getSourceCellId() === serviceNode.id) {
          const targetNode = graph.getCellById(edge.getTargetCellId());
          if (targetNode && targetNode.getData()?.entityType === 'RPC') {
            downstreamRpcNodes.push(targetNode);
          }
        }
      });
      
      // 如果找到了下游RPC节点，则折叠它们
      if (downstreamRpcNodes.length > 0) {
        // 隐藏所有下游RPC节点
        downstreamRpcNodes.forEach(childNode => {
          childNode.setVisible(false);
        });
        
        // 创建虚拟节点来代表这些被折叠的RPC节点
        const virtualNodeId = `virtual-${serviceNode.id}`;
        const nodePosition = serviceNode.getPosition();
        
        // 检查是否已经存在虚拟节点
        const existingVirtualNode = graph.getCellById(virtualNodeId);
        if (!existingVirtualNode) {
          graph.addNode({
            id: virtualNodeId,
            shape: 'rect',
            x: nodePosition.x + 150,
            y: nodePosition.y,
            width: 100,
            height: 40,
            label: `RPC组 (${downstreamRpcNodes.length})`,
            attrs: {
              body: {
                fill: '#f0f0f0',
                stroke: '#722ed1', // 紫色边框
                strokeWidth: 2,
              },
              label: {
                fontSize: 12,
                fill: '#722ed1', // 紫色文字
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
              },
            },
            data: {
              isVirtual: true,
              entityType: 'VIRTUAL',
              downstreamRpcNodes: downstreamRpcNodes.map(n => n.id),
              serviceNodeId: serviceNode.id,
            },
          });
          
          // 创建虚线连接边
          const edgeId = `edge-${serviceNode.id}-${virtualNodeId}`;
          graph.addEdge({
            id: edgeId,
            source: serviceNode.id,
            target: virtualNodeId,
            attrs: {
              line: {
                stroke: '#722ed1',
                strokeWidth: 1,
                strokeDasharray: '5 5', // 虚线
                targetMarker: 'block',
              },
            },
            data: {
              type: 'VIRTUAL_CONNECTION',
            },
          });
        }
      }
    });
  }, []);

  // 加载拓扑数据
  const loadTopologyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await xflowApi.getTopology();
      setTopologyData(data);

      if (graphRef.current) {
        renderTopology(data);
      }

      message.success('拓扑数据加载成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载拓扑数据失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 渲染拓扑图
  const renderTopology = useCallback((data: XFlowData) => {
    if (!graphRef.current || !data) return;

    const graph = graphRef.current;

    // 清空现有内容
    graph.clearCells();

    // 确保数据存在
    if (!data.nodes || !data.edges) {
      console.warn('Invalid topology data structure');
      return;
    }

    // 始终使用 Dagre 的 LR 布局方向
    const layoutedData = LayoutService.applyDagreLayout(data, 'LR', {
      nodeSpacing: 60,
      rankSpacing: 100,
    });

    // 添加节点
    const nodes = layoutedData.nodes.map((nodeData: XFlowNode) => {
      // 使用id字段作为节点ID
      const nodeId = nodeData.id || '';

      // 确保必要字段存在
      const nodeShape = nodeData.shape || 'custom-service';
      const nodeWidth = nodeData.width || 120;
      const nodeHeight = nodeData.height || 60;
      const nodeX = nodeData.x || 0;
      const nodeY = nodeData.y || 0;

      return {
        id: nodeId,
        shape: nodeShape,
        x: nodeX,
        y: nodeY,
        width: nodeWidth,
        height: nodeHeight,
        data: nodeData.data || {
          entity: nodeData.entity,
          redMetrics: nodeData.redMetrics,
          entityType: nodeData.entityType,
          status: nodeData.redMetrics?.status || 'unknown',
          displayName: nodeData.label || '',
        },
        attrs: nodeData.attrs || {
          body: {
            fill: '#ffffff',
            stroke: '#5F95FF',
            strokeWidth: 1,
          },
          text: {
            fontSize: 12,
            fill: '#333333',
          },
        },
      };
    }).filter(node => node.id); // 过滤掉没有ID的节点

    // 添加边
    const edges = layoutedData.edges.map((edgeData: XFlowEdge) => {
      // 使用id字段作为边ID
      const edgeId = edgeData.id || '';

      // 确保源和目标存在
      if (!edgeData.source || !edgeData.target) {
        console.warn('Edge missing source or target:', edgeData);
        return null;
      }

      return {
        id: edgeId,
        source: edgeData.source,
        target: edgeData.target,
        shape: getEdgeShape(edgeData.data?.type || 'default'),
        data: edgeData.data || {
          type: edgeData.type || 'default',
          redMetrics: edgeData.redMetrics,
        },
        attrs: edgeData.attrs || {
          line: {
            stroke: '#d9d9d9',
            strokeWidth: 1,
            targetMarker: 'block',
          },
        },
        // 确保连接点在边界上
        connector: {
          name: 'normal', // 改为直线连接器
        },
        // 设置连接点类型
        sourceAnchor: 'center',
        targetAnchor: 'center',
        sourceConnectionPoint: 'boundary',
        targetConnectionPoint: 'boundary',
        labels: edgeData.label ? [ createEdgeLabel(
          edgeData.label.text,
          edgeData.data?.redMetrics,
        ) ] : [],
        router: {
          name: 'normal', // 改为直线路由
        },
      };
    }).filter(edge => edge !== null); // 过滤掉无效的边

    graph.addNodes(nodes);
    // @ts-ignore - 过滤后的边可能包含null值
    graph.addEdges(edges);

    // 自动折叠所有RPC节点
    autoCollapseRpcNodes(graph, layoutedData);

    // 适应视图
    setTimeout(() => {
      graph.zoomToFit({ padding: 20, maxScale: 1 });
    }, 100);
  }, [autoCollapseRpcNodes]);

  // 刷新数据
  const handleRefresh = useCallback(async () => {
    await loadTopologyData();
  }, [ loadTopologyData ]);

  // 处理节点选择
  const handleNodeSelect = useCallback((nodeId: string) => {
    if (graphRef.current) {
      const success = highlightNode(graphRef.current, nodeId);
      if (success) {
        // 设置选中的节点
        const node = graphRef.current.getCellById(nodeId);
        if (node && node.isNode()) {
          setSelectedNode({
            id: nodeId,
            data: node.getData(),
          });
          setSelectedEdge(null);
        }
      } else {
        message.warning('未找到指定节点');
      }
    }
  }, []);

  // 缩放操作
  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoom(0.1);
    }
  }, []);

  // 缩放操作
  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoom(-0.1);
    }
  }, []);

  // 适应视图
  const handleFitView = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit({ padding: 20, maxScale: 1 });
    }
  }, []);

  // 全屏操作
  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  // 显示统计信息
  const handleShowStatistics = useCallback(() => {
    if (!topologyData) return;

    Modal.info({
      title: '拓扑统计信息',
      width: 600,
      content: (
        <div>
          <p><strong>节点总数:</strong> {topologyData.statistics.nodeCount}</p>
          <p><strong>边总数:</strong> {topologyData.statistics.edgeCount}</p>

          <h4>节点类型分布:</h4>
          <ul>
            {Object.entries(topologyData.statistics.nodeTypeCount).map(([ type, count ]) => (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>

          <h4>关系类型分布:</h4>
          <ul>
            {Object.entries(topologyData.statistics.edgeTypeCount).map(([ type, count ]) => (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>

          <h4>元数据:</h4>
          <p><strong>标题:</strong> {topologyData.metadata.title}</p>
          <p><strong>描述:</strong> {topologyData.metadata.description}</p>
          <p><strong>版本:</strong> {topologyData.metadata.version}</p>
          <p><strong>创建时间:</strong> {new Date(topologyData.metadata.createdAt).toLocaleString()}</p>
        </div>
      ),
    });
  }, [ topologyData ]);

  // 窗口大小变化处理
  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current && containerRef.current) {
        graphRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight,
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 初始化
  useEffect(() => {
    const graph = initGraph();
    const initData = async () => {
      await loadTopologyData();
    };
    initData();

    return () => {
      if (graph) {
        graph.dispose();
      }
    };
  }, [ initGraph, loadTopologyData ]);

  // 数据加载后自动应用LR布局
  useEffect(() => {
    if (topologyData && !loading) {
      // 使用布局服务应用LR布局，而不是调用handleLayout
      // 这样避免触发额外的状态更新
      const layoutedData = LayoutService.applyDagreLayout(
        topologyData,
        'LR',
        {
          nodeSpacing: 60,
          rankSpacing: 100,
        },
      );
      renderTopology(layoutedData);
    }
  }, [ topologyData, loading, renderTopology ]);

  if (error) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#ff4d4f',
      }}>
        <h3>加载失败</h3>
        <p>{error}</p>
        <button onClick={handleRefresh}>重试</button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <ToolbarPanel
        onRefresh={handleRefresh}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onFullscreen={handleFullscreen}
        onShowStatistics={handleShowStatistics}
        onNodeSelect={handleNodeSelect}
        graph={graphRef.current}
        loading={loading}
        statistics={topologyData ? {
          nodeCount: topologyData.statistics.nodeCount,
          edgeCount: topologyData.statistics.edgeCount,
        } : undefined}
      />

      {/* 主要内容区域 */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* 图形容器 */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            backgroundColor: '#fafafa',
            position: 'relative',
          }}
        />

        {/* 加载遮罩 */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <Spin size="large" tip="加载中..." />
          </div>
        )}

        {/* 缩放提示 */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 100,
          }}
        >
          Ctrl + 滚轮缩放
        </div>

        {/* 图例面板 */}
        <LegendPanel />

        {/* 属性面板 */}
        <PropertyPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
        />
      </div>
    </div>
  );
};