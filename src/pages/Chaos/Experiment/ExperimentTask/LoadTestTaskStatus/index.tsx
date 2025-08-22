import React, { FC } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { Button, Card, Icon, Tag, Progress } from '@alicloud/console-components';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import { ILoadTestTask, ILoadTestMetrics } from 'config/interfaces/Chaos/experimentTask';

interface LoadTestTaskStatusProps {
  tasks: ILoadTestTask[];
  metrics: ILoadTestMetrics | null;
  onStopTask: (taskId: string) => void;
  onViewResults: (taskId: string) => void;
}

const LoadTestTaskStatus: FC<LoadTestTaskStatusProps> = ({ tasks, metrics, onStopTask, onViewResults }) => {

  // 渲染任务状态
  const renderTaskStatus = (task: ILoadTestTask) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'RUNNING': return 'blue';
        case 'COMPLETED': return 'green';
        case 'FAILED': return 'red';
        case 'STOPPED': return 'orange';
        case 'PENDING': return 'yellow';
        default: return 'gray';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'RUNNING': return i18n.t('Running').toString();
        case 'COMPLETED': return i18n.t('Completed').toString();
        case 'FAILED': return i18n.t('Failed').toString();
        case 'STOPPED': return i18n.t('Stopped').toString();
        case 'PENDING': return i18n.t('Pending').toString();
        default: return status;
      }
    };

    const isRunning = task.status === 'RUNNING';
    const isCompleted = task.status === 'COMPLETED' || task.status === 'FAILED' || task.status === 'STOPPED';

    return (
      <Card key={task.taskId} className={styles.taskCard}>
        <div className={styles.taskHeader}>
          <div className={styles.taskInfo}>
            <h4><Translation>Load Test Task</Translation></h4>
            <div className={styles.taskMeta}>
              <span><Translation>Task ID</Translation>: {task.taskId}</span>
              <span><Translation>Execution ID</Translation>: {task.executionId || '-'}</span>
            </div>
          </div>
          <div className={styles.taskActions}>
            <Tag color={getStatusColor(task.status)} size="small">
              {getStatusText(task.status)}
            </Tag>
            {isRunning && (
              <Button
                type="primary"
                size="small"
                onClick={() => onStopTask(task.experimentTaskId)}
                style={{ marginLeft: 8 }}
              >
                <Translation>Stop</Translation>
              </Button>
            )}
            {isCompleted && (
              <Button
                type="normal"
                size="small"
                onClick={() => onViewResults(task.experimentTaskId)}
                style={{ marginLeft: 8 }}
              >
                <Translation>View Results</Translation>
              </Button>
            )}
          </div>
        </div>

        <div className={styles.taskDetails}>
          <div className={styles.timeInfo}>
            <span><Translation>Start Time</Translation>: {moment(task.startTime).format('YYYY-MM-DD HH:mm:ss')}</span>
            <span><Translation>Created At</Translation>: {moment(task.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
          </div>
          <div className={styles.statusDescription}>
            {task.statusDescription}
          </div>
        </div>
      </Card>
    );
  };

  // 渲染指标图表
  const renderMetricsCharts = () => {
    if (!metrics) {
      return (
        <Card className={styles.metricsCard}>
          <div className={styles.noMetrics}>
            <Icon type="loading" size="large" />
            <p><Translation>Loading metrics...</Translation></p>
          </div>
        </Card>
      );
    }

    // 准备延迟数据
    const latencyData = [
      ...metrics.avgLatency.map(([ time, value ]) => ({ time, value, type: 'Average' })),
      ...metrics.minLatency.map(([ time, value ]) => ({ time, value, type: 'Minimum' })),
      ...metrics.maxLatency.map(([ time, value ]) => ({ time, value, type: 'Maximum' })),
      ...metrics.p90.map(([ time, value ]) => ({ time, value, type: 'P90' })),
      ...metrics.p95.map(([ time, value ]) => ({ time, value, type: 'P95' })),
      ...metrics.p99.map(([ time, value ]) => ({ time, value, type: 'P99' })),
    ];

    // 准备成功率数据
    const successRateData = metrics.successRate.map(([ time, value ]) => ({
      time: moment(time).format('HH:mm:ss'),
      value,
    }));

    // 准备吞吐量数据
    const throughputData = [
      ...metrics.throughputReceived.map(([ time, value ]) => ({
        time: moment(time).format('HH:mm:ss'),
        value,
        type: 'Received',
      })),
      ...metrics.throughputSent.map(([ time, value ]) => ({
        time: moment(time).format('HH:mm:ss'),
        value,
        type: 'Sent',
      })),
    ];

    return (
      <div className={styles.metricsContainer}>
        <Card className={styles.metricsCard}>
          <h4><Translation>Response Time (ms)</Translation></h4>
          <Chart height={300} data={latencyData} autoFit>
            <Axis name="time" />
            <Axis name="value" />
            <Tooltip />
            <Legend />
            <Geom type="line" position="time*value" color="type" />
          </Chart>
        </Card>

        <Card className={styles.metricsCard}>
          <h4><Translation>Success Rate (%)</Translation></h4>
          <Chart height={200} data={successRateData} autoFit>
            <Axis name="time" />
            <Axis name="value" />
            <Tooltip />
            <Geom type="line" position="time*value" />
          </Chart>
        </Card>

        <Card className={styles.metricsCard}>
          <h4><Translation>Throughput (req/s)</Translation></h4>
          <Chart height={200} data={throughputData} autoFit>
            <Axis name="time" />
            <Axis name="value" />
            <Tooltip />
            <Legend />
            <Geom type="line" position="time*value" color="type" />
          </Chart>
        </Card>
      </div>
    );
  };

  if (tasks.length === 0) {
    return (
      <div className={styles.noTasks}>
        <Icon type="loading" size="large" />
        <p><Translation>No load test tasks found</Translation></p>
      </div>
    );
  }

  return (
    <div className={styles.loadTestStatus}>
      <div className={styles.tasksSection}>
        <h3><Translation>Load Test Tasks</Translation></h3>
        {tasks.map(renderTaskStatus)}
      </div>

      {metrics && (
        <div className={styles.metricsSection}>
          <h3><Translation>Performance Metrics</Translation></h3>
          {renderMetricsCharts()}
        </div>
      )}
    </div>
  );
};

export default LoadTestTaskStatus;
