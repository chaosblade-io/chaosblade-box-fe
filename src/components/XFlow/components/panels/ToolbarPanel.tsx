import React from 'react';
import { Button, Space, Tooltip, Divider } from 'antd';
import {
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ExpandOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { LayoutAlgorithm, LayoutDirection } from '../../types/xflow';
import { FilterPanel } from './FilterPanel';
import type { Graph } from '@antv/x6';

interface ToolbarPanelProps {
  onRefresh: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onFullscreen: () => void;
  onShowStatistics: () => void;
  onNodeSelect: (nodeId: string) => void;
  graph: Graph | null;
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
  onShowStatistics,
  onNodeSelect,
  graph,
  loading = false,
  statistics,
}) => {
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

        {/* 过滤搜索 */}
        <FilterPanel graph={graph} onNodeSelect={onNodeSelect} />

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
      </Space>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
        {/* 统计信息按钮移到最右侧 */}
        <Tooltip title="查看统计信息">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={onShowStatistics}
            size="small"
          >
            统计
          </Button>
        </Tooltip>
      </div>

      {/* 右侧统计信息 */}
      {statistics && (
        <div
          style={{
            marginLeft: '16px',
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