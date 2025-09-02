import type { XFlowEdgeData } from '../types/xflow';
import { Graph } from '@antv/x6';

/**
 * 注册自定义边组件
 */
export const registerCustomEdges = () => {
  // 注册依赖关系边
  Graph.registerEdge('edge-dependency', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#1890ff',
        strokeWidth: 2,
        targetMarker: 'block',
      },
    },
  }, true);

  // 注册包含关系边
  Graph.registerEdge('edge-containment', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#52c41a',
        strokeWidth: 1,
        strokeDasharray: '5 5',
        targetMarker: 'block',
      },
    },
  }, true);

  // 注册调用关系边
  Graph.registerEdge('edge-invocation', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#1890ff',
        strokeWidth: 1.5,
        targetMarker: 'block',
      },
    },
  }, true);

  // 注册虚线连接边（用于虚拟节点）
  Graph.registerEdge('edge-virtual-connection', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#722ed1',
        strokeWidth: 1,
        strokeDasharray: '5 5',
        targetMarker: 'block',
      },
    },
  }, true);

  // 注册默认边
  Graph.registerEdge('edge-default', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#d9d9d9',
        strokeWidth: 1,
        targetMarker: 'block',
      },
    },
  }, true);
};

/**
 * 根据边类型获取边的形状
 */
export const getEdgeShape = (type: string): string => {
  switch (type) {
    case 'DEPENDS_ON':
      return 'edge-dependency';
    case 'CONTAINS':
      return 'edge-containment';
    case 'INVOKES':
      return 'edge-invocation';
    case 'VIRTUAL_CONNECTION':
      return 'edge-virtual-connection';
    default:
      return 'edge-default';
  }
};

/**
 * 创建边标签
 */
export const createEdgeLabel = (text: string, redMetrics?: any) => {
  // 如果有RED指标，显示成功率
  if (redMetrics) {
    return {
      text: `${text}\n${redMetrics.successRate}%`,
      fontSize: 10,
      fill: redMetrics.successRate >= 95 ? '#52c41a' :
        redMetrics.successRate >= 90 ? '#faad14' : '#ff4d4f',
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      refX: 0.5,
      refY: 0.5,
    };
  }

  return {
    text,
    fontSize: 10,
    fill: '#666',
    textAnchor: 'middle',
    textVerticalAnchor: 'middle',
    refX: 0.5,
    refY: 0.5,
  };
};

/**
 * 创建边的属性配置
 */
export const createEdgeAttrs = (type: string, redMetrics?: any) => {
  const baseAttrs = {
    line: {
      strokeWidth: 1,
      targetMarker: 'block',
    },
  };

  // 根据关系类型设置不同的样式
  switch (type) {
    case 'DEPENDS_ON':
      return {
        ...baseAttrs,
        line: {
          ...baseAttrs.line,
          stroke: redMetrics?.successRate >= 95 ? '#1890ff' :
                 redMetrics?.successRate >= 90 ? '#faad14' : '#ff4d4f',
          strokeWidth: redMetrics ? Math.max(1, redMetrics.count / 100) : 2,
        },
      };

    case 'CONTAINS':
      return {
        ...baseAttrs,
        line: {
          ...baseAttrs.line,
          stroke: '#52c41a',
          strokeWidth: 1,
          strokeDasharray: '5 5', // 虚线表示包含关系
        },
      };

    case 'INVOKES':
      return {
        ...baseAttrs,
        line: {
          ...baseAttrs.line,
          stroke: redMetrics?.successRate >= 95 ? '#1890ff' :
                 redMetrics?.successRate >= 90 ? '#faad14' : '#ff4d4f',
          strokeWidth: redMetrics ? Math.max(1, redMetrics.count / 50) : 1.5,
        },
      };

    case 'VIRTUAL_CONNECTION':
      return {
        ...baseAttrs,
        line: {
          ...baseAttrs.line,
          stroke: '#722ed1',
          strokeWidth: 1,
          strokeDasharray: '5 5', // 虚线表示虚拟连接
        },
      };

    default:
      return {
        ...baseAttrs,
        line: {
          ...baseAttrs.line,
          stroke: '#d9d9d9',
        },
      };
  }
};