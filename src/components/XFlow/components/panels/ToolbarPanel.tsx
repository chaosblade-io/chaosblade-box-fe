import React from 'react';
import { Button, Space, Dropdown, Menu, Tooltip, Divider } from 'antd';
import {
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  LayoutOutlined,
  SaveOutlined,
  ExpandOutlined,
  CompressOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { LayoutAlgorithm, LayoutDirection } from '../../types/xflow';

interface ToolbarPanelProps {
  onRefresh: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onFullscreen: () => void;
  onLayout: (algorithm: LayoutAlgorithm, direction?: LayoutDirection) => void;
  onExport: () => void;
  onShowStatistics: () => void;
  loading?: boolean;
  statistics?: {
    nodeCount: number;
    edgeCount: number;
  };
}

/**
 * 工具栏面板组件
 * 提供拓扑图的各种操作功能
 */
export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  onRefresh,
  onZoomIn,
  onZoomOut,
  onFitView,
  onFullscreen,
  onLayout,
  onExport,
  onShowStatistics,
  loading = false,
  statistics,
}) => {
  // 布局菜单
  const layoutMenu = (
    <Menu>
      <Menu.SubMenu key="dagre" title="Dagre 布局">
        <Menu.Item key="dagre-tb" onClick={() => onLayout('dagre', 'TB')}>
          上下布局 (TB)
        </Menu.Item>
        <Menu.Item key="dagre-bt" onClick={() => onLayout('dagre', 'BT')}>
          下上布局 (BT)
        </Menu.Item>
        <Menu.Item key="dagre-lr" onClick={() => onLayout('dagre', 'LR')}>
          左右布局 (LR)
        </Menu.Item>
        <Menu.Item key="dagre-rl" onClick={() => onLayout('dagre', 'RL')}>
          右左布局 (RL)
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key="force" onClick={() => onLayout('force')}>
        力导向布局
      </Menu.Item>
      <Menu.Item key="grid" onClick={() => onLayout('grid')}>
        网格布局
      </Menu.Item>
      <Menu.Item key="circular" onClick={() => onLayout('circular')}>
        环形布局
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000,
      }}
    >
      <Space size="small">
        {/* 数据操作 */}
        <Tooltip title="刷新数据">
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            size="small"
          >
            刷新
          </Button>
        </Tooltip>

        <Divider type="vertical" />

        {/* 视图操作 */}
        <Tooltip title="放大">
          <Button
            icon={<ZoomInOutlined />}
            onClick={onZoomIn}
            size="small"
          />
        </Tooltip>

        <Tooltip title="缩小">
          <Button
            icon={<ZoomOutOutlined />}
            onClick={onZoomOut}
            size="small"
          />
        </Tooltip>

        <Tooltip title="适应视图">
          <Button
            icon={<ExpandOutlined />}
            onClick={onFitView}
            size="small"
          />
        </Tooltip>

        <Tooltip title="全屏">
          <Button
            icon={<FullscreenOutlined />}
            onClick={onFullscreen}
            size="small"
          />
        </Tooltip>

        <Divider type="vertical" />

        {/* 布局操作 */}
        <Tooltip title="应用默认布局（左右方向）">
          <Button
            type="primary"
            icon={<LayoutOutlined />}
            onClick={() => onLayout('dagre', 'LR')}
            size="small"
          >
            LR布局
          </Button>
        </Tooltip>

        <Dropdown overlay={layoutMenu} trigger={[ 'click' ]}>
          <Button
            icon={<LayoutOutlined />}
            size="small"
          >
            布局算法
          </Button>
        </Dropdown>

        <Divider type="vertical" />

        {/* 导出操作 */}
        <Tooltip title="导出图片">
          <Button
            icon={<SaveOutlined />}
            onClick={onExport}
            size="small"
          >
            导出
          </Button>
        </Tooltip>

        {/* 统计信息 */}
        <Tooltip title="查看统计信息">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={onShowStatistics}
            size="small"
          >
            统计
          </Button>
        </Tooltip>
      </Space>

      {/* 右侧统计信息 */}
      {statistics && (
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <Space size="large">
            <span>
              📊 节点: <strong>{statistics.nodeCount}</strong>
            </span>
            <span>
              🔗 边: <strong>{statistics.edgeCount}</strong>
            </span>
          </Space>
        </div>
      )}
    </div>
  );
};
