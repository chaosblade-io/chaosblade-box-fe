import React from 'react';
import { Button, Space, Tooltip, Divider } from 'antd';
import {
  ReloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ExpandOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
  onToggleLegend: () => void;
  onNodeSelect: (nodeId: string) => void;
  graph: Graph | null;
  loading?: boolean;
  statistics?: {
    nodeCount: number;
    edgeCount: number;
  };
  isLegendVisible: boolean;
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
  onToggleLegend,
  onNodeSelect,
  graph,
  loading = false,
  statistics,
  isLegendVisible,
}) => {
  const { t } = useTranslation();
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
        <Tooltip title={t('Refresh data')}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            size="small"
          >
            {t('Refresh')}
          </Button>
        </Tooltip>

        <Divider type="vertical" />

        {/* 视图操作 */}
        <Tooltip title={t('Zoom in')}>
          <Button
            icon={<ZoomInOutlined />}
            onClick={onZoomIn}
            size="small"
          />
        </Tooltip>

        <Tooltip title={t('Zoom out')}>
          <Button
            icon={<ZoomOutOutlined />}
            onClick={onZoomOut}
            size="small"
          />
        </Tooltip>

        <Tooltip title={t('Fit view')}>
          <Button
            icon={<ExpandOutlined />}
            onClick={onFitView}
            size="small"
          />
        </Tooltip>

        <Tooltip title={t('Fullscreen')}>
          <Button
            icon={<FullscreenOutlined />}
            onClick={onFullscreen}
            size="small"
          />
        </Tooltip>
      </Space>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
        {/* 过滤搜索 */}
        <FilterPanel graph={graph} onNodeSelect={onNodeSelect} />

        {/* 统计信息按钮 */}
        <Tooltip title={t('View statistics')}>
          <Button
            icon={<InfoCircleOutlined />}
            onClick={onShowStatistics}
            size="small"
            style={{ marginLeft: '8px' }}
          >
            {t('Statistics')}
          </Button>
        </Tooltip>

        {/* 图例切换按钮 */}
        <Tooltip title={isLegendVisible ? t('Hide legend') : t('Show legend')}>
          <Button
            icon={isLegendVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={onToggleLegend}
            size="small"
            style={{ marginLeft: '8px' }}
          />
        </Tooltip>
      </div>

      {/* 注释掉统计信息显示 */}
      {/* {statistics && (
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
      )} */}
    </div>
  );
};
