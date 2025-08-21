import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import i18n from '../../../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { Button, Dialog, Icon, Select, Tag } from '@alicloud/console-components';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';

const { Option } = Select;
// const { RangePicker } = DatePicker;

interface LoadTestDataChartsProps {
  taskId: string;
}

interface LoadTestMetrics {
  latency: {
    avg: number[];
    min: number[];
    max: number[];
    median: number[];
    p90: number[];
    p95: number[];
    p99: number[];
  };
  successRate: number[];
  throughput: {
    received: number[];
    sent: number[];
  };
  timestamps: number[];
}

interface LoadTestStatus {
  status: 'running' | 'stopped' | 'failed' | 'preparing';
  duration: number; // 运行时长（秒）
  concurrency: number; // 当前并发数
  errorRate: number; // 错误率（百分比）
  startTime?: number; // 开始时间戳
}

const LoadTestDataCharts: FC<LoadTestDataChartsProps> = ({ taskId }) => {
  const [ metrics, setMetrics ] = useState<LoadTestMetrics | null>(null);
  const [ loading, setLoading ] = useState(false);
  const [ , _setTimeRange ] = useState<[ Date, Date ] | null>(null);
  const [ percentileConfig, setPercentileConfig ] = useState([ 'P90', 'P95', 'P99' ]);
  const [ loadTestStatus, setLoadTestStatus ] = useState<LoadTestStatus>(() => {
    // 随机生成初始状态，让演示更有趣
    const statuses: LoadTestStatus['status'][] = [ 'running', 'stopped', 'preparing' ];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status: randomStatus,
      duration: randomStatus === 'running' ? Math.floor(Math.random() * 1800) : 0, // 0-30分钟
      concurrency: 80 + Math.floor(Math.random() * 40), // 80-120
      errorRate: Math.random() * 5, // 0-5%
      startTime: randomStatus === 'running' ? Date.now() - Math.floor(Math.random() * 1800000) : undefined,
    };
  });
  const [ stopConfirmVisible, setStopConfirmVisible ] = useState(false);
  const [ stopping, setStopping ] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchLoadTestData();
    }
  }, [ taskId ]);

  // 实时更新压测状态
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loadTestStatus.status === 'running' && loadTestStatus.startTime) {
      timer = setInterval(() => {
        const currentDuration = Math.floor((Date.now() - loadTestStatus.startTime!) / 1000);
        setLoadTestStatus(prev => ({
          ...prev,
          duration: currentDuration,
          // 模拟错误率的小幅波动
          errorRate: Math.max(0, Math.min(10, prev.errorRate + (Math.random() - 0.5) * 0.5)),
        }));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [ loadTestStatus.status, loadTestStatus.startTime ]);

  async function fetchLoadTestData() {
    setLoading(true);
    try {
      // TODO: 替换为真实API调用
      // const response = await dispatch.experimentTask.getLoadTestMetrics({ taskId, timeRange });

      // 使用真实场景的模拟数据
      const mockData = generateRealisticMockData();
      setMetrics(mockData);
    } catch (error) {
      console.error('Failed to fetch load test data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStopLoadTest() {
    setStopping(true);
    try {
      // TODO: 替换为真实API调用
      // await dispatch.experimentTask.stopLoadTest({ taskId });

      // 模拟停止操作
      await new Promise(resolve => setTimeout(resolve, 2000));

      setLoadTestStatus(prev => ({
        ...prev,
        status: 'stopped',
      }));

      setStopConfirmVisible(false);
    } catch (error) {
      console.error('Failed to stop load test:', error);
      // TODO: 显示错误提示
    } finally {
      setStopping(false);
    }
  }

  async function handleStartLoadTest() {
    setStopping(true);
    try {
      // TODO: 替换为真实API调用
      // await dispatch.experimentTask.startLoadTest({ taskId });

      // 模拟启动操作
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLoadTestStatus({
        status: 'running',
        duration: 0,
        concurrency: 80 + Math.floor(Math.random() * 40),
        errorRate: Math.random() * 2,
        startTime: Date.now(),
      });
    } catch (error) {
      console.error('Failed to start load test:', error);
    } finally {
      setStopping(false);
    }
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  function renderLoadTestStatusControls() {
    const getStatusConfig = () => {
      switch (loadTestStatus.status) {
        case 'running':
          return {
            color: 'green',
            text: i18n.t('Running').toString(),
            icon: <Icon type="loading" style={{ marginRight: 4 }} />,
          };
        case 'stopped':
          return {
            color: 'default',
            text: i18n.t('Stopped').toString(),
            icon: null,
          };
        case 'failed':
          return {
            color: 'red',
            text: i18n.t('Failed').toString(),
            icon: null,
          };
        case 'preparing':
          return {
            color: 'orange',
            text: i18n.t('Preparing').toString(),
            icon: <Icon type="loading" style={{ marginRight: 4 }} />,
          };
        default:
          return {
            color: 'default',
            text: i18n.t('Unknown').toString(),
            icon: null,
          };
      }
    };

    const statusConfig = getStatusConfig();

    return (
      <div className={styles.statusControls}>
        <div className={styles.statusInfo}>
          <Tag color={statusConfig.color} className={styles.statusTag}>
            {statusConfig.icon}
            {statusConfig.text}
          </Tag>

          {loadTestStatus.status === 'running' && (
            <div className={styles.statusDetails}>
              <span className={styles.statusDetail}>
                <Translation>Duration</Translation>: {formatDuration(loadTestStatus.duration)}
              </span>
              <span className={styles.statusDetail}>
                <Translation>Concurrency</Translation>: {loadTestStatus.concurrency}
              </span>
              <span className={styles.statusDetail}>
                <Translation>Error Rate</Translation>: {loadTestStatus.errorRate.toFixed(1)}%
              </span>
            </div>
          )}

          {(loadTestStatus.status === 'stopped' || loadTestStatus.status === 'failed') && (
            <div className={styles.statusDetails}>
              <span className={styles.statusDetail}>
                <Translation>Last run</Translation>: {loadTestStatus.duration > 0 ? formatDuration(loadTestStatus.duration) : i18n.t('N/A').toString()}
              </span>
              {loadTestStatus.status === 'failed' && (
                <span className={styles.statusDetail} style={{ color: '#ff4d4f' }}>
                  <Translation>Error Rate</Translation>: {loadTestStatus.errorRate.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>

        {loadTestStatus.status === 'running' && (
          <Button
            type="primary"
            warning
            size="small"
            onClick={() => setStopConfirmVisible(true)}
            className={styles.stopButton}
          >
            <Icon type="stop" />
            <Translation>Stop Load Test</Translation>
          </Button>
        )}

        {(loadTestStatus.status === 'stopped' || loadTestStatus.status === 'failed') && (
          <Button
            type="primary"
            size="small"
            onClick={handleStartLoadTest}
            loading={stopping}
            className={styles.startButton}
          >
            <Icon type="play" />
            <Translation>Start Load Test</Translation>
          </Button>
        )}
      </div>
    );
  }

  function generateRealisticMockData(): LoadTestMetrics {
    const now = Date.now();
    const totalMinutes = 60;
    const timestamps = Array.from({ length: totalMinutes }, (_, i) => now - (totalMinutes - 1 - i) * 60000);

    // 模拟故障注入场景：
    // 0-20分钟：正常运行
    // 20-35分钟：故障注入期间
    // 35-60分钟：故障恢复期间
    const faultStartIndex = 20;
    const faultEndIndex = 35;

    const generateLatencyData = (baseValue: number, faultMultiplier: number) => {
      const rawData = timestamps.map((_, index) => {
        let value = baseValue;
        const noise = (Math.random() - 0.5) * baseValue * 0.08; // 8% 噪声

        if (index >= faultStartIndex && index < faultEndIndex) {
          // 故障期间：延迟飙升，添加一些波动
          const faultProgress = (index - faultStartIndex) / (faultEndIndex - faultStartIndex);
          const faultIntensity = 0.5 + 0.5 * Math.sin(faultProgress * Math.PI); // 故障强度曲线
          value = baseValue * (1 + (faultMultiplier - 1) * faultIntensity) + Math.random() * baseValue * 0.3;
        } else if (index >= faultEndIndex && index < faultEndIndex + 10) {
          // 恢复期间：逐渐恢复正常，带有一些反弹
          const recoveryProgress = (index - faultEndIndex) / 10;
          const smoothRecovery = 1 - Math.pow(1 - recoveryProgress, 2); // 平滑恢复曲线
          value = baseValue * faultMultiplier * (1 - smoothRecovery) + baseValue * smoothRecovery;
          // 添加一些恢复期的小波动
          value += Math.sin(recoveryProgress * Math.PI * 3) * baseValue * 0.1;
        }

        return Math.max(value + noise, baseValue * 0.2);
      });

      // 应用简单的移动平均来平滑数据
      return rawData.map((value, index) => {
        if (index === 0 || index === rawData.length - 1) return value;
        return (rawData[index - 1] + value + rawData[index + 1]) / 3;
      });
    };

    const generateSuccessRateData = () => {
      const rawData = timestamps.map((_, index) => {
        let rate = 97.5; // 正常成功率
        const noise = (Math.random() - 0.5) * 1.5; // 小幅波动

        if (index >= faultStartIndex && index < faultEndIndex) {
          // 故障期间：成功率下降，模拟真实的故障模式
          const faultProgress = (index - faultStartIndex) / (faultEndIndex - faultStartIndex);
          const minRate = 72 + Math.sin(faultProgress * Math.PI * 2) * 8; // 72-80% 波动
          rate = minRate + Math.random() * 8;
        } else if (index >= faultEndIndex && index < faultEndIndex + 12) {
          // 恢复期间：逐渐恢复，可能有一些反弹
          const recoveryProgress = (index - faultEndIndex) / 12;
          const smoothRecovery = Math.pow(recoveryProgress, 0.7); // 较快的初期恢复
          const faultRate = 75 + Math.random() * 8;
          rate = faultRate * (1 - smoothRecovery) + 97.5 * smoothRecovery;

          // 恢复期可能有短暂的超调
          if (recoveryProgress > 0.6 && recoveryProgress < 0.9) {
            rate += Math.sin((recoveryProgress - 0.6) * Math.PI / 0.3) * 1.5;
          }
        }

        return Math.min(Math.max(rate + noise, 0), 100);
      });

      // 平滑处理
      return rawData.map((value, index) => {
        if (index === 0 || index === rawData.length - 1) return value;
        return (rawData[index - 1] + value + rawData[index + 1]) / 3;
      });
    };

    const generateThroughputData = (baseValue: number) => {
      const rawData = timestamps.map((_, index) => {
        let value = baseValue;
        const noise = (Math.random() - 0.5) * baseValue * 0.12; // 12% 噪声

        if (index >= faultStartIndex && index < faultEndIndex) {
          // 故障期间：吞吐量显著下降
          const faultProgress = (index - faultStartIndex) / (faultEndIndex - faultStartIndex);
          const degradationFactor = 0.25 + 0.25 * Math.cos(faultProgress * Math.PI); // 25-50% 的吞吐量
          value = baseValue * degradationFactor + Math.random() * baseValue * 0.1;
        } else if (index >= faultEndIndex && index < faultEndIndex + 15) {
          // 恢复期间：逐渐恢复，可能有超调
          const recoveryProgress = (index - faultEndIndex) / 15;
          const smoothRecovery = 1 - Math.exp(-recoveryProgress * 3); // 指数恢复曲线
          const faultValue = baseValue * 0.35;
          value = faultValue * (1 - smoothRecovery) + baseValue * smoothRecovery;

          // 恢复期可能有轻微的超调现象
          if (recoveryProgress > 0.7 && recoveryProgress < 0.95) {
            value += Math.sin((recoveryProgress - 0.7) * Math.PI / 0.25) * baseValue * 0.08;
          }
        }

        return Math.max(value + noise, baseValue * 0.15);
      });

      // 平滑处理
      return rawData.map((value, index) => {
        if (index === 0 || index === rawData.length - 1) return value;
        return (rawData[index - 1] + value + rawData[index + 1]) / 3;
      });
    };

    return {
      latency: {
        avg: generateLatencyData(120, 3.5),
        min: generateLatencyData(45, 2.0),
        max: generateLatencyData(280, 5.0),
        median: generateLatencyData(100, 3.0),
        p90: generateLatencyData(200, 4.0),
        p95: generateLatencyData(250, 4.5),
        p99: generateLatencyData(400, 6.0),
      },
      successRate: generateSuccessRateData(),
      throughput: {
        received: generateThroughputData(850),
        sent: generateThroughputData(650),
      },
      timestamps,
    };
  }

  function renderLatencyChart() {
    if (!metrics) return null;

    const chartData = metrics.timestamps.map((timestamp, index) => {
      const data = [
        { timestamp, value: metrics.latency.avg[index], type: 'Avg' },
        { timestamp, value: metrics.latency.min[index], type: 'Min' },
        { timestamp, value: metrics.latency.max[index], type: 'Max' },
        { timestamp, value: metrics.latency.median[index], type: 'Median' },
      ];

      if (percentileConfig.includes('P90')) {
        data.push({ timestamp, value: metrics.latency.p90[index], type: 'P90' });
      }
      if (percentileConfig.includes('P95')) {
        data.push({ timestamp, value: metrics.latency.p95[index], type: 'P95' });
      }
      if (percentileConfig.includes('P99')) {
        data.push({ timestamp, value: metrics.latency.p99[index], type: 'P99' });
      }

      return data;
    }).flat();

    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <Translation>Latency Metrics</Translation>
          </div>
          <div className={styles.chartControls}>
            <Select
              mode="multiple"
              value={percentileConfig}
              onChange={setPercentileConfig}
              placeholder={i18n.t('Select percentiles').toString()}
              style={{ width: 200 }}
            >
              <Option value="P90">P90</Option>
              <Option value="P95">P95</Option>
              <Option value="P99">P99</Option>
            </Select>
          </div>
        </div>
        <Chart height={300} data={chartData} forceFit padding="auto">
          <Legend />
          <Tooltip />
          <Axis
            name="timestamp"
            label={{
              formatter: val => moment(parseInt(val)).format('HH:mm'),
            }}
          />
          <Axis
            name="value"
            label={{
              formatter: val => `${val}ms`,
            }}
          />
          <Geom
            type="line"
            position="timestamp*value"
            color={[ 'type', [ '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16', '#eb2f96' ]]}
            size={2}
            shape="smooth"
            tooltip={[ 'timestamp*value*type', (time, value, type) => ({
              title: moment(time).format('HH:mm:ss'),
              name: type,
              value: `${value.toFixed(2)}ms`,
            }) ]}
          />
          <Geom
            type="point"
            position="timestamp*value"
            color={[ 'type', [ '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa8c16', '#eb2f96' ]]}
            size={3}
            shape="circle"
            style={{
              stroke: '#fff',
              lineWidth: 1,
            }}
          />
        </Chart>
      </div>
    );
  }

  function renderSuccessRateChart() {
    if (!metrics) return null;

    const chartData = metrics.timestamps.map((timestamp, index) => ({
      timestamp,
      value: metrics.successRate[index],
    }));

    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <Translation>Success Rate</Translation>
          </div>
        </div>
        <Chart height={250} data={chartData} forceFit padding="auto">
          <Tooltip />
          <Axis
            name="timestamp"
            label={{
              formatter: val => moment(parseInt(val)).format('HH:mm'),
            }}
          />
          <Axis
            name="value"
            label={{
              formatter: val => `${val}%`,
            }}
          />
          <Geom
            type="line"
            position="timestamp*value"
            size={2}
            color="#1890ff"
            shape="smooth"
            tooltip={[ 'timestamp*value', (time, value) => ({
              title: moment(time).format('HH:mm:ss'),
              name: i18n.t('Success Rate').toString(),
              value: `${value.toFixed(2)}%`,
            }) ]}
          />
          <Geom
            type="point"
            position="timestamp*value"
            size={3}
            color="#1890ff"
            shape="circle"
            style={{
              stroke: '#fff',
              lineWidth: 1,
            }}
          />
        </Chart>
      </div>
    );
  }

  function renderThroughputChart() {
    if (!metrics) return null;

    const chartData = metrics.timestamps.map((timestamp, index) => [
      { timestamp, value: metrics.throughput.received[index], type: 'Received' },
      { timestamp, value: metrics.throughput.sent[index], type: 'Sent' },
    ]).flat();

    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <Translation>Throughput</Translation>
          </div>
        </div>
        <Chart height={250} data={chartData} forceFit padding="auto">
          <Legend />
          <Tooltip />
          <Axis
            name="timestamp"
            label={{
              formatter: val => moment(parseInt(val)).format('HH:mm'),
            }}
          />
          <Axis
            name="value"
            label={{
              formatter: val => `${val} KB/s`,
            }}
          />
          <Geom
            type="line"
            position="timestamp*value"
            color={[ 'type', [ '#52c41a', '#faad14' ]]}
            size={2}
            shape="smooth"
            tooltip={[ 'timestamp*value*type', (time, value, type) => ({
              title: moment(time).format('HH:mm:ss'),
              name: type,
              value: `${value.toFixed(2)} KB/s`,
            }) ]}
          />
          <Geom
            type="point"
            position="timestamp*value"
            color={[ 'type', [ '#52c41a', '#faad14' ]]}
            size={3}
            shape="circle"
            style={{
              stroke: '#fff',
              lineWidth: 1,
            }}
          />
        </Chart>
      </div>
    );
  }

  return (
    <div className={styles.loadTestDataSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Translation>Load Test Data</Translation>
          <div className={styles.sectionSubtitle}>
            <Translation>Fault injection period: 20-35 minutes</Translation>
          </div>
        </div>
        <div className={styles.sectionControls}>
          {renderLoadTestStatusControls()}
          <Button onClick={fetchLoadTestData} loading={loading}>
            <Icon type="refresh" />
            <Translation>Refresh</Translation>
          </Button>
        </div>
      </div>
      {loading ? (
        <div className={styles.loadingContainer}>
          <Icon type="loading" size="xl" />
          <div style={{ marginLeft: 12 }}>
            <Translation>Loading load test data...</Translation>
          </div>
        </div>
      ) : (
        <div className={styles.chartsGrid}>
          {renderLatencyChart()}
          {renderSuccessRateChart()}
          {renderThroughputChart()}
        </div>
      )}

      {/* 停止压测确认对话框 */}
      <Dialog
        title={i18n.t('Confirm Stop Load Test').toString()}
        visible={stopConfirmVisible}
        onOk={handleStopLoadTest}
        onCancel={() => setStopConfirmVisible(false)}
        onClose={() => setStopConfirmVisible(false)}
        okProps={{ loading: stopping, children: i18n.t('Stop').toString() }}
        cancelProps={{ children: i18n.t('Cancel').toString() }}
      >
        <p>{i18n.t('Are you sure you want to stop the running load test? This action cannot be undone.').toString()}</p>
        <p>{i18n.t('Current status').toString()}:</p>
        <ul>
          <li>{i18n.t('Duration').toString()}: {formatDuration(loadTestStatus.duration)}</li>
          <li>{i18n.t('Concurrency').toString()}: {loadTestStatus.concurrency}</li>
          <li>{i18n.t('Error Rate').toString()}: {loadTestStatus.errorRate.toFixed(1)}%</li>
        </ul>
      </Dialog>
    </div>
  );
};

export default LoadTestDataCharts;
