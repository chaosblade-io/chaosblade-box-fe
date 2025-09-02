import React from 'react';
import { Card, Descriptions, Tag, Progress, Divider, Empty } from 'antd';
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
              虚拟节点详情
            </div>
          }
          style={{ marginBottom: '16px' }}
        >
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="ID">
              <code style={{ fontSize: '11px' }}>{node.id}</code>
            </Descriptions.Item>
            
            <Descriptions.Item label="类型">
              <Tag color="purple">VIRTUAL</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="描述">
              代表被折叠的RPC节点组
            </Descriptions.Item>
            
            <Descriptions.Item label="包含节点数">
              <Tag color="blue">
                {data.downstreamRpcNodes?.length || 0} 个RPC节点
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="关联服务节点">
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
            节点详情
          </div>
        }
        style={{ marginBottom: '16px' }}
      >
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="ID">
            <code style={{ fontSize: '11px' }}>{node.id}</code>
          </Descriptions.Item>

          <Descriptions.Item label="名称">
            {entity.displayName}
          </Descriptions.Item>

          <Descriptions.Item label="类型">
            <Tag color="blue">{data.entityType}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(status)}>
              {status === 'success' ? '正常' :
                status === 'warning' ? '警告' :
                  status === 'error' ? '错误' : '未知'}
            </Tag>
          </Descriptions.Item>

          {entity.regionId && (
            <Descriptions.Item label="区域">
              {entity.regionId}
            </Descriptions.Item>
          )}

          {entity.appId && (
            <Descriptions.Item label="应用ID">
              <code style={{ fontSize: '11px' }}>{entity.appId}</code>
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider orientation="left" orientationMargin={0}>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
            📊 RED 指标
          </span>
        </Divider>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>成功率:</span>
            <Progress
              percent={redMetrics.successRate}
              size="small"
              strokeColor={redMetrics.successRate >= 95 ? '#52c41a' :
                redMetrics.successRate >= 90 ? '#faad14' : '#ff4d4f'}
              style={{ marginLeft: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>错误率:</span>
            <Progress
              percent={redMetrics.errorRate}
              size="small"
              strokeColor="#ff4d4f"
              style={{ marginLeft: '8px' }}
            />
          </div>
        </div>

        <Descriptions size="small" column={2}>
          <Descriptions.Item label="总请求">
            <Tag>{redMetrics.count}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="错误数">
            <Tag color={redMetrics.error > 0 ? 'red' : 'green'}>
              {redMetrics.error}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="响应时间">
            <Tag color={redMetrics.rt > 1000 ? 'red' :
              redMetrics.rt > 500 ? 'orange' : 'green'}>
              {redMetrics.rt}ms
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="健康状态">
            <Tag color={redMetrics.healthy ? 'success' : 'error'}>
              {redMetrics.healthy ? '健康' : '异常'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {entity.attributes && Object.keys(entity.attributes).length > 0 && (
          <>
            <Divider orientation="left" orientationMargin={0}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                🏷️ 属性信息
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
            ⏰ 时间信息
          </span>
        </Divider>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="首次发现">
            {new Date(entity.firstSeen).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新">
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
        case 'DEPENDS_ON': return '依赖关系';
        case 'CONTAINS': return '包含关系';
        case 'INVOKES': return '调用关系';
        case 'RUNS_ON': return '运行关系';
        default: return '未知关系';
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
            边详情
          </div>
        }
        style={{ marginBottom: '16px' }}
      >
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="ID">
            <code style={{ fontSize: '11px' }}>{edge.id}</code>
          </Descriptions.Item>

          <Descriptions.Item label="关系类型">
            <Tag color="purple">{getRelationName(data.type)}</Tag>
          </Descriptions.Item>
        </Descriptions>

        {redMetrics && (
          <>
            <Divider orientation="left" orientationMargin={0}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                📊 调用指标
              </span>
            </Divider>

            <Descriptions size="small" column={2}>
              <Descriptions.Item label="调用次数">
                <Tag>{redMetrics.count}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="错误次数">
                <Tag color={redMetrics.error > 0 ? 'red' : 'green'}>
                  {redMetrics.error}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="平均响应时间">
                <Tag color={redMetrics.rt > 1000 ? 'red' :
                  redMetrics.rt > 500 ? 'orange' : 'green'}>
                  {redMetrics.rt}ms
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="成功率">
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
          description="请选择节点或边查看详情"
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