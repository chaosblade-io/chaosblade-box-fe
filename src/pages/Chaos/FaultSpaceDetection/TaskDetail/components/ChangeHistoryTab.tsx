import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import {
  Button,
  Message,
  Icon,
  Search,
  Timeline,
  Tag,
  Collapse,
  MenuButton,
} from '@alicloud/console-components';
import formatDate from '../../../lib/DateUtil';

const { Panel } = Collapse;

interface ChangeEvent {
  id: string;
  type: 'CREATED' | 'UPDATED' | 'EXECUTED' | 'TERMINATED' | 'PAUSED' | 'RESUMED';
  timestamp: string;
  user: string;
  userAvatar?: string;
  title: string;
  description: string;
  details?: {
    before?: any;
    after?: any;
    changes?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    metadata?: Record<string, any>;
  };
}

interface ChangeHistoryTabProps {
  taskId: string;
}

const ChangeHistoryTab: FC<ChangeHistoryTabProps> = ({ taskId }) => {
  const [ events, setEvents ] = useState<ChangeEvent[]>([]);
  const [ loading, setLoading ] = useState(false);
  const [ searchKey, setSearchKey ] = useState('');
  const [ filteredEvents, setFilteredEvents ] = useState<ChangeEvent[]>([]);
  const [ expandedEvents, setExpandedEvents ] = useState<string[]>([]);

  useEffect(() => {
    loadChangeHistory();
  }, [ taskId ]);

  useEffect(() => {
    filterEvents();
  }, [ events, searchKey ]);

  const loadChangeHistory = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const result = await dispatch.faultSpaceDetection.getChangeHistory({ taskId });

      // Mock data for development
      const mockEvents: ChangeEvent[] = [
        {
          id: 'event_1',
          type: 'CREATED',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          user: 'admin',
          title: '任务创建',
          description: '创建了新的故障空间检测任务',
          details: {
            metadata: {
              taskName: '用户登录API故障空间探测',
              targetSystem: '用户中心',
              environment: '生产环境',
            },
          },
        },
        {
          id: 'event_2',
          type: 'UPDATED',
          timestamp: new Date(Date.now() - 82800000).toISOString(),
          user: 'admin',
          title: '配置更新',
          description: '修改了SLO配置参数',
          details: {
            changes: [
              {
                field: 'sloConfig.performanceTargets.p95Limit',
                oldValue: 150,
                newValue: 200,
              },
              {
                field: 'sloConfig.performanceTargets.errorRateLimit',
                oldValue: 2.0,
                newValue: 1.0,
              },
            ],
          },
        },
        {
          id: 'event_3',
          type: 'EXECUTED',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'user1',
          title: '开始执行',
          description: '启动了故障注入测试',
          details: {
            metadata: {
              runId: 'RUN_20241224_003',
              totalRequests: 100,
              concurrency: 10,
              estimatedDuration: '10m 30s',
            },
          },
        },
        {
          id: 'event_4',
          type: 'TERMINATED',
          timestamp: new Date(Date.now() - 6900000).toISOString(),
          user: 'user1',
          title: '执行终止',
          description: '手动终止了正在运行的测试',
          details: {
            metadata: {
              runId: 'RUN_20241224_003',
              reason: '目标服务响应异常',
              completedRequests: 45,
              duration: '5m 12s',
            },
          },
        },
        {
          id: 'event_5',
          type: 'UPDATED',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'admin',
          title: '故障配置更新',
          description: '调整了网络延迟故障参数',
          details: {
            changes: [
              {
                field: 'traceConfig.faultConfigurations[0].faultTemplates[0].parameters.delay',
                oldValue: 100,
                newValue: 200,
              },
              {
                field: 'traceConfig.faultConfigurations[0].faultTemplates[0].parameters.variance',
                oldValue: 5,
                newValue: 10,
              },
            ],
          },
        },
        {
          id: 'event_6',
          type: 'EXECUTED',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          user: 'admin',
          title: '重新执行',
          description: '使用更新后的配置重新执行测试',
          details: {
            metadata: {
              runId: 'RUN_20241225_001',
              totalRequests: 100,
              concurrency: 10,
              estimatedDuration: '10m 30s',
            },
          },
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load change history:', error);
      Message.error(i18n.t('Failed to load change history').toString());
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!searchKey.trim()) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchKey.toLowerCase()) ||
      event.description.toLowerCase().includes(searchKey.toLowerCase()) ||
      event.user.toLowerCase().includes(searchKey.toLowerCase()),
    );

    setFilteredEvents(filtered);
  };

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents(prev =>
      (prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [ ...prev, eventId ]),
    );
  };

  const handleExportTimeline = async (format: 'CSV' | 'JSON') => {
    try {
      // TODO: Implement export functionality
      // await dispatch.faultSpaceDetection.exportChangeHistory({ taskId, format });

      Message.success(i18n.t(`Timeline exported as ${format} successfully`).toString());
    } catch (error) {
      console.error('Failed to export timeline:', error);
      Message.error(i18n.t('Failed to export timeline').toString());
    }
  };

  const getEventIcon = (type: string) => {
    const iconMap = {
      CREATED: 'add',
      UPDATED: 'edit',
      EXECUTED: 'play',
      TERMINATED: 'stop',
      PAUSED: 'pause',
      RESUMED: 'play',
    };
    return iconMap[type as keyof typeof iconMap] || 'clock';
  };

  const getEventColor = (type: string) => {
    const colorMap = {
      CREATED: '#52c41a',
      UPDATED: '#1890ff',
      EXECUTED: '#722ed1',
      TERMINATED: '#ff4d4f',
      PAUSED: '#faad14',
      RESUMED: '#52c41a',
    };
    return colorMap[type as keyof typeof colorMap] || '#666';
  };

  const renderEventDetails = (event: ChangeEvent) => {
    if (!event.details) return null;

    return (
      <div style={{ marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 4 }}>
        {/* Changes */}
        {event.details.changes && event.details.changes.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              <Translation>Configuration Changes</Translation>:
            </div>
            {event.details.changes.map((change, index) => (
              <div key={index} style={{
                marginBottom: 8,
                padding: 8,
                background: '#fff',
                borderRadius: 4,
                border: '1px solid #e8e8e8',
              }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  <code>{change.field}</code>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '2px 6px',
                    background: '#fff2f0',
                    color: '#ff4d4f',
                    borderRadius: 2,
                    fontSize: 12,
                    fontFamily: 'Monaco, Consolas, monospace',
                  }}>
                    {JSON.stringify(change.oldValue)}
                  </span>
                  <Icon type="arrow-right" size="xs" />
                  <span style={{
                    padding: '2px 6px',
                    background: '#f6ffed',
                    color: '#52c41a',
                    borderRadius: 2,
                    fontSize: 12,
                    fontFamily: 'Monaco, Consolas, monospace',
                  }}>
                    {JSON.stringify(change.newValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        {event.details.metadata && Object.keys(event.details.metadata).length > 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              <Translation>Additional Information</Translation>:
            </div>
            <div style={{
              background: '#fff',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #e8e8e8',
            }}>
              {Object.entries(event.details.metadata).map(([ key, value ]) => (
                <div key={key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  fontSize: 12,
                }}>
                  <span style={{ color: '#666' }}>{key}:</span>
                  <span style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
                    {JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTimelineItem = (event: ChangeEvent) => {
    const isExpanded = expandedEvents.includes(event.id);
    const hasDetails = event.details && (
      (event.details.changes && event.details.changes.length > 0) ||
      (event.details.metadata && Object.keys(event.details.metadata).length > 0)
    );

    return (
      <Timeline.Item
        key={event.id}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon
                type={getEventIcon(event.type)}
                style={{ color: getEventColor(event.type) }}
              />
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                {event.title}
              </span>
              <Tag
                size="small"
                color={getEventColor(event.type)}
                style={{ fontSize: 10 }}
              >
                {event.type}
              </Tag>
            </div>

            {hasDetails && (
              <Button
                type="link"
                size="small"
                onClick={() => toggleEventDetails(event.id)}
                style={{ padding: 5, fontSize: 12 }}
              >
                <Icon type={isExpanded ? 'arrow-up' : 'arrow-down'} size="xs" />
                <Translation>{isExpanded ? 'Hide Details' : 'Show Details'}</Translation>
              </Button>
            )}
          </div>
        }
        content={
          <div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>
                {event.description}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <Icon type="user" size="xs" style={{ marginRight: 4 }} />
                {event.user} • {formatDate(new Date(event.timestamp).getTime())}
              </div>
            </div>

            {isExpanded && renderEventDetails(event)}
          </div>
        }
      />
    );
  };

  return (
    <div>
      {/* Search and Export */}
      <div style={{
        background: '#fff',
        padding: 16,
        marginBottom: 16,
        borderRadius: 6,
        border: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Search
          placeholder={i18n.t('Search change events...').toString()}
          value={searchKey}
          onChange={setSearchKey}
          style={{ width: 300 }}
          hasClear
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <MenuButton
            label={
              <span>
                <Icon type="download" style={{ marginRight: 4 }} />
                <Translation>Export Timeline</Translation>
              </span>
            }
            popupProps={{ align: 'tr br' }}
          >
            <MenuButton.Item onClick={() => handleExportTimeline('CSV')}>
              <Translation>Export as CSV</Translation>
            </MenuButton.Item>
            <MenuButton.Item onClick={() => handleExportTimeline('JSON')}>
              <Translation>Export as JSON</Translation>
            </MenuButton.Item>
          </MenuButton>
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: '#fff',
        padding: 24,
        borderRadius: 6,
        border: '1px solid #e8e8e8',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon type="loading" size="large" />
            <div style={{ marginTop: 16, color: '#666' }}>
              <Translation>Loading change history...</Translation>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <Icon type="inbox" size="large" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, marginBottom: 8 }}>
              {searchKey ? (
                <Translation>No matching change events found</Translation>
              ) : (
                <Translation>No change history available</Translation>
              )}
            </div>
            {searchKey && (
              <div style={{ fontSize: 14 }}>
                <Translation>Try adjusting your search criteria</Translation>
              </div>
            )}
          </div>
        ) : (
          <Timeline>
            {filteredEvents.map(renderTimelineItem)}
          </Timeline>
        )}
      </div>

      {/* Summary */}
      {!loading && filteredEvents.length > 0 && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae7ff',
          borderRadius: 6,
          padding: 16,
          marginTop: 16,
          fontSize: 14,
          color: '#666',
        }}>
          <Translation>Showing</Translation> {filteredEvents.length} <Translation>change events</Translation>
          {searchKey && (
            <span>
              {' '}<Translation>matching</Translation> "{searchKey}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChangeHistoryTab;
