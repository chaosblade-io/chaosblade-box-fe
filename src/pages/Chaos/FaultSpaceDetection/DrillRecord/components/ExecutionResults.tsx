import React, { FC, useState, useRef, useEffect } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import {
  Table,
  Button,
  Icon,
  Tag,
  MenuButton,
  Message,
  Balloon
} from '@alicloud/console-components';
import formatDate from '../../../lib/DateUtil';

interface ChainFailure {
  id: string;
  number: number;
  responseStatus: number;
  errorRate: number;
  timestamp: string;
  faultCombination: Array<{
    serviceId: string;
    serviceName: string;
    faultType: string;
    faultParameters: Record<string, any>;
  }>;
  traceId: string;
  curlCommand: string;
}

interface ChainHighLatency {
  id: string;
  number: number;
  responseStatus: number;
  p95Latency: number;
  p99Latency: number;
  timestamp: string;
  faultCombination: Array<{
    serviceId: string;
    serviceName: string;
    faultType: string;
    faultParameters: Record<string, any>;
  }>;
  traceId: string;
}

interface ExecutionPlan {
  layer: number;
  services: Array<{
    serviceId: string;
    serviceName: string;
    faults: Array<{
      faultId: string;
      faultType: string;
      faultName: string;
      status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
      startTime?: string;
      endTime?: string;
      parameters: Record<string, any>;
    }>;
  }>;
}

interface Metrics {
  current: {
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    rps: number;
    sampleCount: number;
  };
  baseline: {
    p50: number;
    p95: number;
    p99: number;
    errorRate: number;
    rps: number;
  };
}

interface ExecutionResultsProps {
  chainFailures: ChainFailure[];
  chainHighLatencies: ChainHighLatency[];
  executionPlan: ExecutionPlan[];
  metrics: Metrics;
  onExport: (format: 'HTML' | 'CSV' | 'JSON') => void;
}

const ExecutionResults: FC<ExecutionResultsProps> = ({
  chainFailures,
  chainHighLatencies,
  executionPlan,
  metrics,
  onExport,
}) => {
  const [chartType, setChartType] = useState<'performance' | 'timeline' | 'success-rate'>('performance');
  const [faultDetailVisible, setFaultDetailVisible] = useState(false);
  const [selectedFaultCombination, setSelectedFaultCombination] = useState<ChainFailure | ChainHighLatency | null>(null);
  const performanceCanvasRef = useRef<HTMLCanvasElement>(null);
  const timelineCanvasRef = useRef<HTMLCanvasElement>(null);
  const successRateCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    switch (chartType) {
      case 'performance':
        drawPerformanceComparison();
        break;
      case 'timeline':
        drawTimelineChart();
        break;
      case 'success-rate':
        drawSuccessRateChart();
        break;
    }
  }, [chartType, executionPlan, metrics]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      Message.success(i18n.t('Copied to clipboard').toString());
    }).catch(() => {
      Message.error(i18n.t('Failed to copy to clipboard').toString());
    });
  };

  const handleViewFaultDetails = (record: ChainFailure | ChainHighLatency) => {
    setSelectedFaultCombination(record);
    setFaultDetailVisible(true);
  };

  const drawPerformanceComparison = () => {
    const canvas = performanceCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Performance metrics comparison chart
    const metrics_data = [
      { label: 'P50 Latency', baseline: metrics.baseline.p50, current: metrics.current.p50, unit: 'ms' },
      { label: 'P95 Latency', baseline: metrics.baseline.p95, current: metrics.current.p95, unit: 'ms' },
      { label: 'P99 Latency', baseline: metrics.baseline.p99, current: metrics.current.p99, unit: 'ms' },
      { label: 'Error Rate', baseline: metrics.baseline.errorRate, current: metrics.current.errorRate, unit: '%' },
      { label: 'RPS', baseline: metrics.baseline.rps, current: metrics.current.rps, unit: '' }
    ];

    const margin = 60;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    const barHeight = chartHeight / metrics_data.length / 2.5;
    const barSpacing = chartHeight / metrics_data.length;

    // Find max value for scaling
    const maxValue = Math.max(...metrics_data.flatMap(m => [m.baseline, m.current]));
    const scale = chartWidth / maxValue;

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Performance Comparison: Baseline vs Current', width / 2, 30);

    // Draw legend
    ctx.font = '12px Arial';
    ctx.fillStyle = '#52c41a';
    ctx.fillRect(width - 200, 50, 15, 15);
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText('Baseline', width - 180, 62);

    ctx.fillStyle = '#1890ff';
    ctx.fillRect(width - 100, 50, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Current', width - 80, 62);

    // Draw bars
    metrics_data.forEach((metric, index) => {
      const y = margin + index * barSpacing;

      // Draw metric label
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(metric.label, margin - 10, y + barHeight / 2 + 4);

      // Draw baseline bar
      ctx.fillStyle = '#52c41a';
      ctx.fillRect(margin, y, metric.baseline * scale, barHeight / 2);

      // Draw current bar
      ctx.fillStyle = '#1890ff';
      ctx.fillRect(margin, y + barHeight / 2 + 2, metric.current * scale, barHeight / 2);

      // Draw values
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${metric.baseline.toFixed(1)}${metric.unit}`, margin + metric.baseline * scale + 5, y + barHeight / 4 + 3);
      ctx.fillText(`${metric.current.toFixed(1)}${metric.unit}`, margin + metric.current * scale + 5, y + barHeight * 3/4 + 5);

      // Draw percentage change
      const change = ((metric.current - metric.baseline) / metric.baseline * 100);
      const changeColor = change > 0 ? '#ff4d4f' : '#52c41a';
      ctx.fillStyle = changeColor;
      ctx.textAlign = 'right';
      ctx.fillText(`${change > 0 ? '+' : ''}${change.toFixed(1)}%`, width - margin, y + barHeight / 2 + 4);
    });
  };

  const drawTimelineChart = () => {
    const canvas = timelineCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Timeline chart showing fault injection progress
    const margin = 60;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    // Generate timeline data
    const services = executionPlan.flatMap(layer => layer.services);
    const timelineData = services.map((service, index) => ({
      serviceName: service.serviceName,
      faults: service.faults.map(fault => ({
        name: fault.faultType,
        status: fault.status,
        startTime: fault.startTime ? new Date(fault.startTime).getTime() : Date.now() + index * 60000,
        endTime: fault.endTime ? new Date(fault.endTime).getTime() : Date.now() + (index + 1) * 60000,
      }))
    }));

    // Find time range
    const allTimes = timelineData.flatMap(s => s.faults.flatMap(f => [f.startTime, f.endTime]));
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    const timeRange = maxTime - minTime;
    const timeScale = chartWidth / timeRange;

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fault Injection Timeline', width / 2, 30);

    // Draw timeline
    timelineData.forEach((service, serviceIndex) => {
      const y = margin + serviceIndex * (chartHeight / timelineData.length);
      const rowHeight = chartHeight / timelineData.length * 0.8;

      // Draw service name
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(service.serviceName, margin - 10, y + rowHeight / 2);

      // Draw fault bars
      service.faults.forEach((fault, faultIndex) => {
        const x = margin + (fault.startTime - minTime) * timeScale;
        const barWidth = (fault.endTime - fault.startTime) * timeScale;
        const barHeight = rowHeight / service.faults.length * 0.8;
        const barY = y + faultIndex * (rowHeight / service.faults.length);

        // Color based on status
        const statusColors = {
          COMPLETED: '#52c41a',
          RUNNING: '#1890ff',
          FAILED: '#ff4d4f',
          PENDING: '#d9d9d9',
          SKIPPED: '#faad14'
        };

        ctx.fillStyle = statusColors[fault.status] || '#d9d9d9';
        ctx.fillRect(x, barY, barWidth, barHeight);

        // Draw fault name
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        if (barWidth > 50) {
          ctx.fillText(fault.name, x + barWidth / 2, barY + barHeight / 2 + 3);
        }
      });
    });

    // Draw time axis
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();
  };

  const drawSuccessRateChart = () => {
    const canvas = successRateCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Success rate chart by service
    const margin = 60;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    const services = executionPlan.flatMap(layer => layer.services);
    const successRateData = services.map(service => {
      const totalFaults = service.faults.length;
      const completedFaults = service.faults.filter(f => f.status === 'COMPLETED').length;
      const failedFaults = service.faults.filter(f => f.status === 'FAILED').length;
      const successRate = totalFaults > 0 ? (completedFaults / totalFaults) * 100 : 0;
      const failureRate = totalFaults > 0 ? (failedFaults / totalFaults) * 100 : 0;

      return {
        serviceName: service.serviceName,
        successRate,
        failureRate,
        pendingRate: 100 - successRate - failureRate
      };
    });

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Success/Failure Rates by Service', width / 2, 30);

    // Draw legend
    ctx.font = '12px Arial';
    const legendItems = [
      { label: 'Success', color: '#52c41a' },
      { label: 'Failure', color: '#ff4d4f' },
      { label: 'Pending', color: '#d9d9d9' }
    ];

    legendItems.forEach((item, index) => {
      const x = width - 200 + index * 60;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, 50, 15, 15);
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 20, 62);
    });

    // Draw bars
    const barWidth = chartWidth / successRateData.length * 0.8;
    const barSpacing = chartWidth / successRateData.length;

    successRateData.forEach((data, index) => {
      const x = margin + index * barSpacing + (barSpacing - barWidth) / 2;
      const maxBarHeight = chartHeight - 40;

      // Draw success portion
      const successHeight = (data.successRate / 100) * maxBarHeight;
      ctx.fillStyle = '#52c41a';
      ctx.fillRect(x, height - margin - successHeight, barWidth, successHeight);

      // Draw failure portion
      const failureHeight = (data.failureRate / 100) * maxBarHeight;
      ctx.fillStyle = '#ff4d4f';
      ctx.fillRect(x, height - margin - successHeight - failureHeight, barWidth, failureHeight);

      // Draw pending portion
      const pendingHeight = (data.pendingRate / 100) * maxBarHeight;
      ctx.fillStyle = '#d9d9d9';
      ctx.fillRect(x, height - margin - successHeight - failureHeight - pendingHeight, barWidth, pendingHeight);

      // Draw service name
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x + barWidth / 2, height - margin + 15);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(data.serviceName, 0, 0);
      ctx.restore();

      // Draw percentage
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${data.successRate.toFixed(0)}%`, x + barWidth / 2, height - margin - maxBarHeight - 10);
    });
  };

  const chainFailureColumns = [
    {
      title: i18n.t('Number').toString(),
      dataIndex: 'number',
      width: '10%',
      cell: (value: number) => (
        <span style={{ fontWeight: 600 }}>#{value}</span>
      ),
    },
    {
      title: i18n.t('Response Status').toString(),
      dataIndex: 'responseStatus',
      width: '15%',
      cell: (value: number) => (
        <Tag color={value >= 400 ? '#ff4d4f' : '#52c41a'}>
          {value}
        </Tag>
      ),
    },
    {
      title: i18n.t('Error Rate').toString(),
      dataIndex: 'errorRate',
      width: '15%',
      cell: (value: number) => (
        <span style={{ color: value > 5 ? '#ff4d4f' : value > 1 ? '#faad14' : '#52c41a' }}>
          {value.toFixed(2)}%
        </span>
      ),
    },
    {
      title: i18n.t('Actions').toString(),
      width: '60%',
      cell: (value: any, index: number, record: ChainFailure) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type="primary"
            size="small"
            onClick={() => handleViewFaultDetails(record)}
          >
            <Icon type="eye" style={{ marginRight: 4 }} />
            <Translation>View Details</Translation>
          </Button>
          <Balloon
            trigger={
              <Button
                type="link"
                size="small"
                onClick={() => copyToClipboard(record.curlCommand)}
              >
                <Icon type="copy" />
              </Button>
            }
            align="t"
            triggerType="hover"
          >
            <Translation>Copy cURL command for reproduction</Translation>
          </Balloon>
          <div style={{ fontSize: 12, color: '#666' }}>
            <Translation>Fault Combination</Translation>: {record.faultCombination.length} services affected
          </div>
        </div>
      ),
    },
  ];

  const chainLatencyColumns = [
    {
      title: i18n.t('Number').toString(),
      dataIndex: 'number',
      width: '10%',
      cell: (value: number) => (
        <span style={{ fontWeight: 600 }}>#{value}</span>
      ),
    },
    {
      title: i18n.t('Response Status').toString(),
      dataIndex: 'responseStatus',
      width: '15%',
      cell: (value: number) => (
        <Tag color={value >= 400 ? '#ff4d4f' : '#52c41a'}>
          {value}
        </Tag>
      ),
    },
    {
      title: i18n.t('P95 Latency').toString(),
      dataIndex: 'p95Latency',
      width: '15%',
      cell: (value: number) => (
        <span style={{ color: value > 1000 ? '#ff4d4f' : value > 500 ? '#faad14' : '#52c41a' }}>
          {value}ms
        </span>
      ),
    },
    {
      title: i18n.t('P99 Latency').toString(),
      dataIndex: 'p99Latency',
      width: '15%',
      cell: (value: number) => (
        <span style={{ color: value > 2000 ? '#ff4d4f' : value > 1000 ? '#faad14' : '#52c41a' }}>
          {value}ms
        </span>
      ),
    },
    {
      title: i18n.t('Actions').toString(),
      width: '45%',
      cell: (value: any, index: number, record: ChainHighLatency) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type="primary"
            size="small"
            onClick={() => handleViewFaultDetails(record)}
          >
            <Icon type="eye" style={{ marginRight: 4 }} />
            <Translation>View Details</Translation>
          </Button>
          <div style={{ fontSize: 12, color: '#666' }}>
            <Translation>Fault Combination</Translation>: {record.faultCombination.length} services affected
          </div>
        </div>
      ),
    },
  ];

  const renderFaultDetailModal = () => {
    if (!selectedFaultCombination || !faultDetailVisible) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          maxWidth: 800,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              <Translation>Chain Fault Combination Details</Translation> - #{selectedFaultCombination.number}
            </h3>
            <Button
              size="small"
              onClick={() => setFaultDetailVisible(false)}
            >
              <Icon type="close" />
            </Button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              <Translation>Injected Fault Scenarios</Translation>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedFaultCombination.faultCombination.map((fault, index) => (
                <div key={index} style={{
                  background: '#f8f9fa',
                  border: '1px solid #e8e8e8',
                  borderRadius: 6,
                  padding: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Tag color="#1890ff" size="medium">
                      {fault.serviceName}
                    </Tag>
                    <span style={{ fontWeight: 600 }}>{fault.faultType}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <Translation>Parameters</Translation>:
                    {Object.entries(fault.faultParameters).map(([key, value]) => (
                      <span key={key} style={{ marginLeft: 8, marginRight: 12 }}>
                        {key}: <code>{JSON.stringify(value)}</code>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              <Translation>Chain Impact Summary</Translation>
            </h4>
            <div style={{
              background: '#fff',
              border: '1px solid #e8e8e8',
              borderRadius: 6,
              padding: 16
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <Translation>Response Status</Translation>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    <Tag color={selectedFaultCombination.responseStatus >= 400 ? '#ff4d4f' : '#52c41a'}>
                      {selectedFaultCombination.responseStatus}
                    </Tag>
                  </div>
                </div>
                {'errorRate' in selectedFaultCombination && (
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <Translation>Error Rate</Translation>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#ff4d4f' }}>
                      {selectedFaultCombination.errorRate.toFixed(2)}%
                    </div>
                  </div>
                )}
                {'p95Latency' in selectedFaultCombination && (
                  <>
                    <div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        <Translation>P95 Latency</Translation>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#faad14' }}>
                        {selectedFaultCombination.p95Latency}ms
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        <Translation>P99 Latency</Translation>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#faad14' }}>
                        {selectedFaultCombination.p99Latency}ms
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <Translation>Timestamp</Translation>
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {formatDate(new Date(selectedFaultCombination.timestamp).getTime())}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => setFaultDetailVisible(false)}>
              <Translation>Close</Translation>
            </Button>
            <Button
              type="primary"
              onClick={() => copyToClipboard(selectedFaultCombination.traceId)}
            >
              <Icon type="copy" style={{ marginRight: 4 }} />
              <Translation>Copy Trace ID</Translation>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="chart" />
          <Translation>Execution Results</Translation>
        </div>
        <MenuButton 
          label={
            <span>
              <Icon type="download" style={{ marginRight: 4 }} />
              <Translation>Export Results</Translation>
            </span>
          }
          popupProps={{ align: 'tr br' }}
        >
          <MenuButton.Item onClick={() => onExport('HTML')}>
            <Icon type="file-text" style={{ marginRight: 4 }} />
            <Translation>HTML Report</Translation>
          </MenuButton.Item>
          <MenuButton.Item onClick={() => onExport('CSV')}>
            <Icon type="table" style={{ marginRight: 4 }} />
            <Translation>CSV Data</Translation>
          </MenuButton.Item>
          <MenuButton.Item onClick={() => onExport('JSON')}>
            <Icon type="code" style={{ marginRight: 4 }} />
            <Translation>JSON API</Translation>
          </MenuButton.Item>
        </MenuButton>
      </div>

      <div className={styles.sectionContent}>
        {/* Chain Failure List */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
            <Icon type="close" style={{ marginRight: 8, color: '#ff4d4f' }} />
            <Translation>Failure List</Translation>
            <Tag color="#ff4d4f" style={{ marginLeft: 8 }}>
              {chainFailures.length}
            </Tag>
          </h4>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            <Translation>Chain-level failures caused by fault combinations across multiple services</Translation>
          </div>

          <Table
            dataSource={chainFailures}
            columns={chainFailureColumns}
            hasBorder={false}
            emptyContent={
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                <Icon type="success" size="large" style={{ color: '#52c41a', marginBottom: 16 }} />
                <div><Translation>No chain failures detected</Translation></div>
              </div>
            }
          />
        </div>

        {/* Chain High Latency List */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
            <Icon type="clock" style={{ marginRight: 8, color: '#faad14' }} />
            <Translation>High Latency List</Translation>
            <Tag color="#faad14" style={{ marginLeft: 8 }}>
              {chainHighLatencies.length}
            </Tag>
          </h4>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            <Translation>Chain-level high latency incidents caused by fault combinations across multiple services</Translation>
          </div>

          <Table
            dataSource={chainHighLatencies}
            columns={chainLatencyColumns}
            hasBorder={false}
            emptyContent={
              <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
                <Icon type="success" size="large" style={{ color: '#52c41a', marginBottom: 16 }} />
                <div><Translation>No chain high latency incidents detected</Translation></div>
              </div>
            }
          />
        </div>


      </div>

      {/* Fault Detail Modal */}
      {renderFaultDetailModal()}
    </div>
  );
};

export default ExecutionResults;
