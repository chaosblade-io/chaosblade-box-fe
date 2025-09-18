import React from 'react';
import { Card, Descriptions, Tag, Progress, Divider, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import type { XFlowNodeData, XFlowEdgeData } from '../../types/xflow';

interface PropertyPanelProps {
  selectedNode?: {
    id: string;
    data: XFlowNodeData;
  } | null;
  selectedEdge?: {
    id: string;
    data: XFlowEdgeData;
  } | null;
  onClose?: () => void;
}

/**
 * 属性面板组件
 * 显示选中节点或边的详细信息
 */
export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
}) => {
  const { t } = useTranslation();
  const renderNodeDetails = (node: { id: string; data: XFlowNodeData }) => {
    const { data } = node;

    // 处理虚拟节点的特殊情况
    if (data.isVirtual) {
      return (
        <Card
          size="small"
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>🌐</span>
              {t('Virtual Node Details')}
            </div>
          }
          style={{ marginBottom: '16px' }}
        >
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="ID">
              <code style={{ fontSize: '11px' }}>{node.id}</code>
            </Descriptions.Item>

            <Descriptions.Item label={t('Type')}>
              <Tag color="purple">{t('VIRTUAL')}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('Description')}>
              {t('Represents collapsed RPC node group')}
            </Descriptions.Item>

            <Descriptions.Item label={t('Contains RPC nodes')}>
              <Tag color="blue">
                {data.downstreamRpcNodes?.length || 0} {t('RPC nodes')}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('Associated Service Node')}>
              <code style={{ fontSize: '11px' }}>{data.serviceNodeId}</code>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    // 处理普通节点
    const { entity, redMetrics, status } = data;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'success': return 'success';
        case 'warning': return 'warning';
        case 'error': return 'error';
        default: return 'default';
      }
    };

    const getEntityTypeIcon = (entityType: string) => {
      switch (entityType) {
        case 'SERVICE': return '🏢';
        case 'NAMESPACE': return '🏗️';
        case 'RPC': return '📡';
        case 'RPC_GROUP': return '🌐';
        case 'HOST': return '🖥️';
        default: return '📦';
      }
    };

    return (
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>
              {getEntityTypeIcon(data.entityType)}
            </span>
            {t('Node Details')}
          </div>
        }
        style={{ marginBottom: '16px' }}
      >
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="ID">
            <code style={{ fontSize: '11px' }}>{node.id}</code>
          </Descriptions.Item>

          <Descriptions.Item label={t('Name')}>
            {entity.displayName}
          </Descriptions.Item>

          <Descriptions.Item label={t('Type')}>
            <Tag color="blue">{data.entityType}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label={t('Status')}>
            <Tag color={getStatusColor(status)}>
              {status === 'success' ? t('Normal') :
                status === 'warning' ? t('Warning') :
                  status === 'error' ? t('Error') : t('Unknown')}
            </Tag>
          </Descriptions.Item>

          {entity.regionId && (
            <Descriptions.Item label={t('Region')}>
              {entity.regionId}
            </Descriptions.Item>
          )}

          {entity.appId && (
            <Descriptions.Item label={t('Application ID')}>
              <code style={{ fontSize: '11px' }}>{entity.appId}</code>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider orientation="left" orientationMargin={0}>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
            📊 {t('RED Metrics')}
          </span>
        </Divider>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>{t('Success Rate')}:</span>
            <Progress
              percent={redMetrics.successRate}
              size="small"
              strokeColor={redMetrics.successRate >= 95 ? '#52c41a' :
                redMetrics.successRate >= 90 ? '#faad14' : '#ff4d4f'}
              style={{ marginLeft: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>{t('Error Rate')}:</span>
            <Progress
              percent={redMetrics.errorRate}
              size="small"
              strokeColor="#ff4d4f"
              style={{ marginLeft: '8px' }}
            />
          </div>
        </div>

        <Descriptions size="small" column={2}>
          <Descriptions.Item label={t('Total Requests')}>
            <Tag>{redMetrics.count}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label={t('Error Count')}>
            <Tag color={redMetrics.error > 0 ? 'red' : 'green'}>
              {redMetrics.error}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label={t('Response Time')}>
            <Tag color={redMetrics.rt > 1000 ? 'red' :
              redMetrics.rt > 500 ? 'orange' : 'green'}>
              {redMetrics.rt}ms
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label={t('Health Status')}>
            <Tag color={redMetrics.healthy ? 'success' : 'error'}>
              {redMetrics.healthy ? t('Healthy') : t('Unhealthy')}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {entity.attributes && Object.keys(entity.attributes).length > 0 && (
          <>
            <Divider orientation="left" orientationMargin={0}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                🏷️ {t('Attribute Information')}
              </span>
            </Divider>
            <Descriptions size="small" column={1}>
              {Object.entries(entity.attributes).map(([ key, value ]) => (
                <Descriptions.Item key={key} label={key}>
                  <code style={{ fontSize: '11px' }}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </code>
                </Descriptions.Item>
              ))}
            </Descriptions>
          </>
        )}

        <Divider orientation="left" orientationMargin={0}>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
            ⏰ {t('Time Information')}
          </span>
        </Divider>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label={t('First Seen')}>
            {new Date(entity.firstSeen).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label={t('Last Seen')}>
            {new Date(entity.lastSeen).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  const renderEdgeDetails = (edge: { id: string; data: XFlowEdgeData }) => {
    const { data } = edge;
    const { redMetrics } = data;

    const getRelationIcon = (type: string) => {
      switch (type) {
        case 'DEPENDS_ON': return '🔗';
        case 'CONTAINS': return '📦';
        case 'INVOKES': return '📞';
        default: return '🔄';
      }
    };

    const getRelationName = (type: string) => {
      switch (type) {
        case 'DEPENDS_ON': return t('Dependency Relationship');
        case 'CONTAINS': return t('Contains Relationship');
        case 'INVOKES': return t('Invocation Relationship');
        case 'RUNS_ON': return t('Running Relationship');
        default: return t('Unknown Relationship');
      }
    };

    return (
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>
              {getRelationIcon(data.type)}
            </span>
            {t('Edge Details')}
          </div>
        }
        style={{ marginBottom: '16px' }}
      >
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="ID">
            <code style={{ fontSize: '11px' }}>{edge.id}</code>
          </Descriptions.Item>

          <Descriptions.Item label={t('Relationship Type')}>
            <Tag color="purple">{getRelationName(data.type)}</Tag>
          </Descriptions.Item>
        </Descriptions>

        {redMetrics && (
          <>
            <Divider orientation="left" orientationMargin={0}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                📊 {t('Call Metrics')}
              </span>
            </Divider>

            <Descriptions size="small" column={2}>
              <Descriptions.Item label={t('Call Count')}>
                <Tag>{redMetrics.count}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label={t('Error Count')}>
                <Tag color={redMetrics.error > 0 ? 'red' : 'green'}>
                  {redMetrics.error}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={t('Average Response Time')}>
                <Tag color={redMetrics.rt > 1000 ? 'red' :
                  redMetrics.rt > 500 ? 'orange' : 'green'}>
                  {redMetrics.rt}ms
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label={t('Success Rate')}>
                <Tag color={redMetrics.successRate >= 95 ? 'success' :
                  redMetrics.successRate >= 90 ? 'warning' : 'error'}>
                  {redMetrics.successRate}%
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    );
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div
        style={{
          width: '300px',
          height: '100%',
          backgroundColor: '#fafafa',
          borderLeft: '1px solid #f0f0f0',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty
          description={t('Select nodes or edges to view details')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '300px',
        height: '100%',
        backgroundColor: '#fafafa',
        borderLeft: '1px solid #f0f0f0',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      {selectedNode && renderNodeDetails(selectedNode)}
      {selectedEdge && renderEdgeDetails(selectedEdge)}
    </div>
  );
};
