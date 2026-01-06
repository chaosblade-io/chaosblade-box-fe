import { Graph } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import { ServiceNode } from '../components/nodes/ServiceNode';
import { NamespaceNode } from '../components/nodes/NamespaceNode';
import { RpcNode } from '../components/nodes/RpcNode';
import { RpcGroupNode } from '../components/nodes/RpcGroupNode';
import { HostNode } from '../components/nodes/HostNode';

/**
 * 注册自定义节点组件
 */
export const registerCustomNodes = () => {
  // 注册服务节点
  register({
    shape: 'custom-service',
    width: 120,
    height: 60,
    component: ServiceNode,
    effect: [ 'data' ],
    inherit: 'rect',
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' },
      ],
    },
  });

  // 注册命名空间节点
  register({
    shape: 'custom-namespace',
    width: 160,
    height: 80,
    component: NamespaceNode,
    effect: [ 'data' ],
    inherit: 'rect',
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' },
      ],
    },
  });

  // 注册 RPC 节点
  register({
    shape: 'custom-rpc',
    width: 100,
    height: 40,
    component: RpcNode,
    effect: [ 'data' ],
    inherit: 'rect',
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#722ed1',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#722ed1',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#722ed1',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#722ed1',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' },
      ],
    },
  });

  // 注册 RPC 组节点
  register({
    shape: 'custom-rpc-group',
    width: 140,
    height: 50,
    component: RpcGroupNode,
    effect: [ 'data' ],
    inherit: 'rect',
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#ff4d4f',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#ff4d4f',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#ff4d4f',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#ff4d4f',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' },
      ],
    },
  });

  // 注册主机节点
  register({
    shape: 'custom-host',
    width: 100,
    height: 50,
    component: HostNode,
    effect: [ 'data' ],
    inherit: 'rect',
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#fa8c16',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#fa8c16',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#fa8c16',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#fa8c16',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'visible',
              },
            },
          },
        },
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' },
      ],
    },
  });
};

/**
 * 创建图形配置
 */
export const createGraphConfig = () => {
  return {
    grid: {
      size: 10,
      visible: true,
      type: 'mesh',
      args: {
        color: '#f0f0f0',
        thickness: 1,
      },
    },
    panning: {
      enabled: true,
      eventTypes: [ 'leftMouseDown', 'mouseWheel' ] as any,
    },
    mousewheel: {
      enabled: true,
      modifiers: '', // 移除ctrl修饰键限制，允许直接使用滚轮缩放
      factor: 1.1,
      maxScale: 1.5,
      minScale: 0.5,
    },
    connecting: {
      router: 'normal', // 改为直线路由
      connector: {
        name: 'normal', // 改为直线连接器
      },
      anchor: 'center',
      connectionPoint: 'boundary', // 修改为 boundary 确保连接点在边界上
      allowBlank: false,
      allowLoop: false,
      allowMultiple: true,
      // 禁用连接线创建
      validateMagnet: () => false,
      // 禁用拖动连接点创建边
      createEdge() {
        const tmpGraph = new Graph({
          grid: {
            size: 10,
            visible: true,
            type: 'mesh',
            args: {
              color: '#f0f0f0',
              thickness: 1,
            },
          },
        });

        // 创建边
        return tmpGraph.createEdge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        });
      },
      validateConnection(args: any) {
        return false; // 禁止创建连接
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#5F95FF',
            stroke: '#5F95FF',
          },
        },
      },
    },
    resizing: false, // 禁用节点大小调整以维持视觉一致性
    rotating: false,
    // 禁用节点移动
    translating: {
      restrict: true, // 限制节点不能被移动
    },
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
      pointerEvents: 'none', // 避免影响点击事件
    },
    snapline: true,
    keyboard: true,
    clipboard: true,
    background: {
      color: '#f8f9fa', // 设置浅色背景颜色
    },
    scroller: {
      enabled: true, // 启用画布滚动
      pannable: true,
      pageVisible: true,
      pageBreak: false,
    },
  };
};
