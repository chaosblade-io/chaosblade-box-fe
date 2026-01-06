import React, { FC, useState, useEffect } from 'react';
import { Select, Button, Table, Loading, Dialog, Tag } from '@alicloud/console-components';
import { TraceData, REDMetrics } from '../../types';
import { traceService } from '../../services/traceService';
import TraceWaterfall from './TraceWaterfall';
import styles from './index.css';

interface TracePanelProps {
  serviceId: string;
  serviceName: string;
}

const TracePanel: FC<TracePanelProps> = ({ serviceId, serviceName }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [traces, setTraces] = useState<TraceData[]>([]);
  const [redMetrics, setRedMetrics] = useState<REDMetrics | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<TraceData | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // 加载 Trace 数据
  const loadTraces = async () => {
    try {
      setLoading(true);
      const now = Date.now();
      const timeRanges: Record<string, number> = {
        '1h': 3600000,
        '6h': 21600000,
        '24h': 86400000,
      };

      const response = await traceService.getTracesByService(serviceId, {
        timeRange: {
          start: now - timeRanges[timeRange],
          end: now,
        },
      });

      setTraces(response.traces);
      setRedMetrics(response.redMetrics);
    } catch (error) {
      console.error('Failed to load traces:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraces();
  }, [serviceId, timeRange]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN');
  };

  // 格式化持续时间
  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)} μs`;
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  return (
    <div className={styles.tracePanel}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <Select
          value={timeRange}
          onChange={(value) => setTimeRange(value as string)}
          style={{ width: 150 }}
        >
          <Select.Option value="1h">最近 1 小时</Select.Option>
          <Select.Option value="6h">最近 6 小时</Select.Option>
          <Select.Option value="24h">最近 24 小时</Select.Option>
        </Select>
        <Button onClick={loadTraces} type="primary" size="small">
          刷新
        </Button>
      </div>

      {/* RED 指标 */}
      {redMetrics && (
        <div className={styles.redMetrics}>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>请求速率</div>
            <div className={styles.metricValue}>{redMetrics.rate.toFixed(2)} req/s</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>错误率</div>
            <div className={styles.metricValue}>
              {redMetrics.errorPercentage.toFixed(2)}%
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>P95 延迟</div>
            <div className={styles.metricValue}>{formatDuration(redMetrics.p95)}</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>P99 延迟</div>
            <div className={styles.metricValue}>{formatDuration(redMetrics.p99)}</div>
          </div>
        </div>
      )}

      {/* Trace 列表 */}
      <div className={styles.traceList}>
        <Loading visible={loading} style={{ display: 'block' }}>
          <Table dataSource={traces} size="small" hasBorder={false}>
            <Table.Column
              title="Trace ID"
              dataIndex="traceId"
              width={200}
              cell={(value: string, index: number, record: TraceData) => (
                <a
                  onClick={() => {
                    setSelectedTrace(record);
                    setDialogVisible(true);
                  }}
                  style={{ color: '#3B82F6', cursor: 'pointer' }}
                >
                  {value.substring(0, 16)}...
                </a>
              )}
            />
            <Table.Column
              title="开始时间"
              dataIndex="startTime"
              width={120}
              cell={(value: number) => formatTime(value)}
            />
            <Table.Column
              title="持续时间"
              dataIndex="duration"
              width={100}
              cell={(value: number) => formatDuration(value)}
            />
            <Table.Column
              title="Span 数量"
              dataIndex="spanCount"
              width={80}
              align="center"
            />
            <Table.Column
              title="状态"
              dataIndex="status"
              width={80}
              cell={(value: string) => (
                <Tag type={value === 'success' ? 'primary' : 'normal'} size="small">
                  {value === 'success' ? '成功' : '失败'}
                </Tag>
              )}
            />
          </Table>
        </Loading>
      </div>

      {/* Trace 详情 Dialog */}
      <Dialog
        visible={dialogVisible}
        title={`Trace 详情: ${selectedTrace?.traceId || ''}`}
        onClose={() => {
          setDialogVisible(false);
          setSelectedTrace(null);
        }}
        onCancel={() => {
          setDialogVisible(false);
          setSelectedTrace(null);
        }}
        footer={false}
        style={{ width: '90vw', height: '85vh' }}
        className={styles.traceDialog}
      >
        {selectedTrace && <TraceWaterfall trace={selectedTrace} />}
      </Dialog>
    </div>
  );
};

export default TracePanel;

