import dagre from 'dagre';
import type {
  XFlowData,
  XFlowNode,
  XFlowEdge,
  XFlowCombo,
  LayoutDirection,
} from '../types/xflow';

export class LayoutService {
  /**
   * 应用Dagre布局算法
   * @param data XFlow数据
   * @param direction 布局方向 (TB:上到下, BT:下到上, LR:左到右, RL:右到左)
   * @param options 布局选项
   * @return 应用布局后的数据
   */
  static applyDagreLayout(
    data: XFlowData,
    direction: LayoutDirection = 'TB',
    options?: {
      nodeSpacing?: number;
      rankSpacing?: number;
      marginX?: number;
      marginY?: number;
    },
  ): XFlowData {
    if (!data || !data.nodes || !data.edges) {
      return data;
    }

    // 默认选项
    const defaultOptions = {
      nodeSpacing: 80,
      rankSpacing: 100,
      marginX: 50,
      marginY: 50,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // 创建一个新的dagre图
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: direction,
      nodesep: finalOptions.nodeSpacing,
      ranksep: finalOptions.rankSpacing,
      marginx: finalOptions.marginX,
      marginy: finalOptions.marginY,
      align: 'UL', // 上左对齐
      ranker: 'network-simplex',
    });

    // 默认边
    g.setDefaultEdgeLabel(() => ({}));

    // 添加节点到图
    data.nodes.forEach((node: XFlowNode) => {
      // 使用id作为节点标识
      const nodeId = node.id || '';
      g.setNode(nodeId, {
        width: node.width || 150,
        height: node.height || 60,
      });
    });

    // 添加边到图
    data.edges.forEach((edge: XFlowEdge) => {
      // 使用id作为边标识
      const edgeId = edge.id || '';
      g.setEdge(edge.source, edge.target);
    });

    // 执行布局
    dagre.layout(g);

    // 更新节点位置
    const result = {
      ...data,
      nodes: data.nodes.map((node: XFlowNode) => {
        const nodeId = node.id || '';
        const dNode = g.node(nodeId);
        if (dNode) {
          return {
            ...node,
            x: dNode.x,
            y: dNode.y,
          };
        }
        return node;
      }),
    };

    return result;
  }

  /**
   * 检测布局是否需要优化
   * 当节点分布过于分散时，返回true
   */
  static layoutNeedsOptimization(data: XFlowData): boolean {
    if (!data || !data.nodes || data.nodes.length < 2) {
      return false;
    }

    // 计算x坐标范围
    const xValues = data.nodes.map(node => node.x || 0);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xRange = xMax - xMin;

    // 如果x坐标范围超过1600，认为布局需要优化
    return xRange > 1600;
  }

  /**
   * 应用网格布局
   */
  static applyGridLayout(data: XFlowData): XFlowData {
    if (!data || !data.nodes) {
      return data;
    }

    const cols = Math.ceil(Math.sqrt(data.nodes.length));
    const cellWidth = 250;
    const cellHeight = 150;

    const result = {
      ...data,
      nodes: data.nodes.map((node: XFlowNode, index: number) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        return {
          ...node,
          x: col * cellWidth + 100,
          y: row * cellHeight + 100,
        };
      }),
    };

    return result;
  }
}
