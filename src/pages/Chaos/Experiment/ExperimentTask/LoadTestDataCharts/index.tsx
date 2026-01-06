import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { Button, Dialog, Icon, Select, Tag, Message } from '@alicloud/console-components';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { ILoadTestTask, ILoadTestMetrics } from 'config/interfaces/Chaos/experimentTask';

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

interface LoadTestResults {
  endpoint: string;
  executionId: string;
  logPath: string;
  reportPath: string;
  reportUrl: string;
  resultPath: string;
  resultUrl: string;
  status: string;
}

const LoadTestDataCharts: FC<LoadTestDataChartsProps> = ({ taskId }) => {
  const dispatch = useDispatch();
  const { definitions: _definitions } = useSelector((state: any) => state.loadTestDefinition);

  const [ metrics, setMetrics ] = useState<LoadTestMetrics | null>(null);
  const [ realMetrics, setRealMetrics ] = useState<ILoadTestMetrics | null>(null);
  const [ loadTestTasks, setLoadTestTasks ] = useState<ILoadTestTask[]>([]);
  const [ loading, setLoading ] = useState(false);
  const [ , _setTimeRange ] = useState<[ Date, Date ] | null>(null);
  const [ percentileConfig, setPercentileConfig ] = useState([ 'P90', 'P95', 'P99' ]);
  const [ _selectedDefinitions, _setSelectedDefinitions ] = useState<string[]>([]);
  const [ loadTestStatus, setLoadTestStatus ] = useState<LoadTestStatus>({
    status: 'stopped',
    duration: 0,
    concurrency: 0,
    errorRate: 0,
    startTime: undefined,
  });
  const [ stopConfirmVisible, setStopConfirmVisible ] = useState(false);
  const [ stopping, setStopping ] = useState(false);
  const [ pollingInterval, setPollingInterval ] = useState<NodeJS.Timeout | null>(null);

  // 压测结果相关状态
  const [ loadTestResults, setLoadTestResults ] = useState<LoadTestResults | null>(null);
  const [ resultsLoading, setResultsLoading ] = useState(false);
  const [ downloadConfirmVisible, setDownloadConfirmVisible ] = useState(false);
  const [ downloadUrl, setDownloadUrl ] = useState('');
  const [ downloadType, setDownloadType ] = useState('');

  const [ actionMode, setActionMode ] = useState<'download' | 'view'>('download');

  useEffect(() => {
    if (taskId) {
      // 只调用 fetchLoadTestData，它会内部调用 fetchLoadTestTasks
      fetchLoadTestData();
    }
  }, [ taskId ]);

  useEffect(() => {
    // 加载压测定义列表
    dispatch.loadTestDefinition.listAllLoadTestDefinitions({});
  }, []);

  // 监听 realMetrics 的变化，确保数据更新时图表能正确渲染
  useEffect(() => {
    if (realMetrics) {
      const convertedMetrics = convertRealMetricsToChartData(realMetrics);
      setMetrics(convertedMetrics);
    } else {
      setMetrics(null);
    }
  }, [ realMetrics ]);

  // 监听 loadTestStatus 的变化，当状态变为停止时获取压测结果
  useEffect(() => {
    console.log('loadTestStatus useEffect triggered');
    console.log('loadTestStatus:', loadTestStatus);
    console.log('loadTestTasks:', loadTestTasks);
    console.log('loadTestResults:', loadTestResults);
    console.log('resultsLoading:', resultsLoading);

    // 使用压测任务的真实 taskId，而不是 experimentTaskId
    const loadTestTaskId = loadTestTasks.length > 0 ? loadTestTasks[0].taskId : null;
    console.log('loadTestTaskId:', loadTestTaskId);

    if (loadTestStatus.status === 'stopped' && loadTestTaskId && !loadTestResults && !resultsLoading) {
      console.log('Conditions met, fetching load test results...');
      fetchLoadTestResults(loadTestTaskId);
    } else {
      console.log('Conditions not met for fetching results:');
      console.log('- status === stopped:', loadTestStatus.status === 'stopped');
      console.log('- loadTestTaskId exists:', !!loadTestTaskId);
      console.log('- no loadTestResults:', !loadTestResults);
      console.log('- not loading:', !resultsLoading);
    }
  }, [ loadTestStatus.status, loadTestTasks, loadTestResults, resultsLoading ]);

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [ pollingInterval ]);

  // 获取压测任务状态
  const fetchLoadTestTasks = async () => {
    try {
      console.log('Fetching load test tasks for taskId:', taskId);
      const task = await dispatch.loadTestDefinition.getLoadTestTask({ taskId });
      if (task) {
        console.log('Load test task found:', task);
        setLoadTestTasks([ task ]);

        // 更新状态
        const status = mapTaskStatusToLoadTestStatus(task.status);
        setLoadTestStatus({
          status,
          duration: task.startTime ? Math.floor((Date.now() - task.startTime) / 1000) : 0,
          concurrency: 100, // 可以从任务配置中获取
          errorRate: 0, // 可以从指标中计算
          startTime: task.startTime,
        });

        // 如果任务正在运行，开始轮询
        if (task.status === 'RUNNING' || task.status === 'PENDING') {
          console.log('Task is running, starting polling');
          startPolling(task);
        } else {
          console.log('Task is not running, status:', task.status);
          stopPolling();
          // 注意：不在这里调用 fetchLoadTestResults，
          // 让 useEffect 监听 loadTestStatus 变化来处理
        }

        // 如果有executionId，获取指标数据
        if (task.executionId) {
          await fetchLoadTestMetrics(task.executionId);
        }
      } else {
        console.log('No load test task found for taskId:', taskId);
        setLoadTestTasks([]);
        setLoadTestStatus({
          status: 'stopped',
          duration: 0,
          concurrency: 0,
          errorRate: 0,
          startTime: undefined,
        });
      }
    } catch (error) {
      console.error('Failed to fetch load test tasks:', error);
      if (error.message && error.message.includes('404')) {
        console.log('No load test tasks found (404), this is normal');
        setLoadTestTasks([]);
      }
    }
  };

  // 获取压测指标数据
  const fetchLoadTestMetrics = async (executionId: string) => {
    try {
      const metricsData = await dispatch.loadTestDefinition.getLoadTestMetrics({ executionId });

      if (metricsData) {
        setRealMetrics(metricsData);
        // 注意：不在这里设置 metrics，让 useEffect 来处理转换和设置
      } else {
        setRealMetrics(null);
      }
    } catch (error) {
      console.error('Failed to fetch load test metrics:', error);
      setRealMetrics(null);
    }
  };

  // 获取压测结果
  const fetchLoadTestResults = async (taskId: string) => {
    try {
      setResultsLoading(true);
      console.log('Starting to fetch load test results for taskId:', taskId);

      const resultsData = await dispatch.loadTestDefinition.getLoadTestResults({ taskId });
      console.log('Load test results API call completed, received:', resultsData);

      if (resultsData) {
        console.log('Results data is valid, setting to state:', resultsData);
        setLoadTestResults(resultsData);
        console.log('Load test results state updated successfully');
      } else {
        console.log('No load test results data received, resultsData is:', resultsData);
        setLoadTestResults(null);
      }
    } catch (error) {
      console.error('Failed to fetch load test results:', error);
      setLoadTestResults(null);
    } finally {
      setResultsLoading(false);
      console.log('fetchLoadTestResults completed, resultsLoading set to false');
    }
  };

  // 处理下载/查看 确认
  const handleDownloadConfirm = (url: string, type: string, mode: 'download' | 'view' = 'download') => {
    setDownloadUrl(url);
    setDownloadType(type);
    setActionMode(mode);
    setDownloadConfirmVisible(true);
  };

  // 执行下载
  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      setDownloadConfirmVisible(false);
      setDownloadUrl('');
      setDownloadType('');
    }
  };

  // 取消下载
  const handleDownloadCancel = () => {
    setDownloadConfirmVisible(false);
    setDownloadUrl('');
    setDownloadType('');
  };

  // 渲染压测结果部分
  const renderLoadTestResults = () => {
    console.log('renderLoadTestResults called');
    console.log('loadTestStatus.status:', loadTestStatus.status);
    console.log('loadTestResults:', loadTestResults);
    console.log('resultsLoading:', resultsLoading);

    // 如果压测正在运行，不显示结果
    if (loadTestStatus.status === 'running') {
      console.log('Load test is running, not showing results');
      return null;
    }

    // 如果正在加载结果，显示加载状态
    if (resultsLoading) {
      console.log('Results are loading, showing loading state');
      return (
        <div className={styles.resultsSection}>
          <div className={styles.resultsSectionHeader}>
            <Icon type="download" />
            <span className={styles.resultsSectionTitle}>
              <Translation>Load Test Results</Translation>
            </span>
            <Icon type="loading" size="small" style={{ marginLeft: 8 }} />
          </div>
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <Translation>Loading results...</Translation>
          </div>
        </div>
      );
    }

    // 如果没有结果数据，不显示
    if (!loadTestResults) {
      console.log('No load test results available');
      return null;
    }

    const { endpoint, logPath, reportUrl, reportPath, resultUrl } = loadTestResults;
    console.log('Rendering results with:', { endpoint, logPath, reportUrl, reportPath, resultUrl });

    return (
      <div className={styles.resultsSection}>
        <div className={styles.resultsSectionHeader}>
          <Icon type="download" />
          <span className={styles.resultsSectionTitle}>
            <Translation>Load Test Results</Translation>
          </span>
          {resultsLoading && <Icon type="loading" size="small" style={{ marginLeft: 8 }} />}
        </div>
        <div className={styles.resultsGrid}>
          <div className={styles.resultItem}>
            <div className={styles.resultLabel}>
              <Icon type="file-text" />
              <Translation>Test Log</Translation>
            </div>
            <Button
              type="primary"
              size="small"
              onClick={() => handleDownloadConfirm(`${endpoint}/${logPath}`, 'Test Log')}
            >
              <Icon type="download" />
              <Translation>Download</Translation>
            </Button>
          </div>
          <div className={styles.resultItem}>
            <div className={styles.resultLabel}>
              <Icon type="bar-chart" />
              <Translation>Test Report</Translation>
            </div>
            <Button
              type="primary"
              size="small"
              onClick={() => handleDownloadConfirm(`${endpoint}${reportUrl}`, 'Test Report', 'view')}
            >
              <Icon type="eye" />
              <Translation>View Report</Translation>
            </Button>
          </div>
          <div className={styles.resultItem}>
            <div className={styles.resultLabel}>
              <Icon type="table" />
              <Translation>Raw Results</Translation>
            </div>
            <Button
              type="primary"
              size="small"
              onClick={() => handleDownloadConfirm(`${endpoint}${resultUrl}`, 'Raw Results')}
            >
              <Icon type="download" />
              <Translation>Download</Translation>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // 开始轮询
  const startPolling = (_task: ILoadTestTask) => {
    if (pollingInterval) return; // 避免重复轮询

    const interval = setInterval(async () => {
      try {
        const updatedTask = await dispatch.loadTestDefinition.getLoadTestTask({ taskId });
        if (updatedTask) {
          setLoadTestTasks([ updatedTask ]);

          const status = mapTaskStatusToLoadTestStatus(updatedTask.status);
          setLoadTestStatus(prev => ({
            ...prev,
            status,
            duration: updatedTask.startTime ? Math.floor((Date.now() - updatedTask.startTime) / 1000) : 0,
          }));

          // 如果任务完成，停止轮询
          if (updatedTask.status !== 'RUNNING' && updatedTask.status !== 'PENDING') {
            stopPolling();
          }

          // 获取实时指标
          if (updatedTask.status === 'RUNNING' && updatedTask.executionId) {
            await fetchLoadTestMetrics(updatedTask.executionId);
          }
        }
      } catch (error) {
        console.error('Load test polling error:', error);
      }
    }, 5000); // 5秒轮询一次

    setPollingInterval(interval);
  };

  // 停止轮询
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // 映射任务状态
  const mapTaskStatusToLoadTestStatus = (status: string): LoadTestStatus['status'] => {
    switch (status) {
      case 'RUNNING': return 'running';
      case 'PENDING': return 'preparing';
      case 'COMPLETED':
      case 'STOPPED': return 'stopped';
      case 'FAILED': return 'failed';
      default: return 'stopped';
    }
  };

  // 转换真实指标数据为图表数据格式
  const convertRealMetricsToChartData = (realMetrics: ILoadTestMetrics): LoadTestMetrics => {
    console.log('Converting real metrics to chart data:', realMetrics);

    // 根据API返回的数据结构进行转换
    const timestamps = realMetrics.avgLatency?.map(([ timestamp ]) => timestamp) || [];

    const convertedData = {
      latency: {
        avg: realMetrics.avgLatency?.map(([ , value ]) => value) || [],
        min: realMetrics.minLatency?.map(([ , value ]) => value) || [],
        max: realMetrics.maxLatency?.map(([ , value ]) => value) || [],
        median: realMetrics.avgLatency?.map(([ , value ]) => value * 0.8) || [], // 估算中位数
        p90: realMetrics.p90?.map(([ , value ]) => value) || [],
        p95: realMetrics.p95?.map(([ , value ]) => value) || [],
        p99: realMetrics.p99?.map(([ , value ]) => value) || [],
      },
      successRate: realMetrics.successRate?.map(([ , value ]) => value) || [],
      throughput: {
        received: realMetrics.throughputReceived?.map(([ , value ]) => value) || [],
        sent: realMetrics.throughputSent?.map(([ , value ]) => value) || [],
      },
      timestamps,
    };

    console.log('Converted chart data:', convertedData);
    return convertedData;
  };

  async function fetchLoadTestData() {
    setLoading(true);
    try {
      // 首先获取压测任务状态
      await fetchLoadTestTasks();

      // 注意：fetchLoadTestTasks 中会调用 fetchLoadTestMetrics，
      // 那里会设置 realMetrics 和 metrics，所以这里不需要重复处理
      // fetchLoadTestResults 的调用已经移到 fetchLoadTestTasks 中
      console.log('Load test data fetch completed');
    } catch (error) {
      console.error('Failed to fetch load test data:', error);
      // 出错时清空数据，不使用模拟数据
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleStopLoadTest() {
    setStopping(true);
    try {
      // 获取当前运行的压测任务
      const currentTask = loadTestTasks.find(task => task.status === 'RUNNING' || task.status === 'PENDING');

      if (!currentTask) {
        Message.error(i18n.t('No running load test task found').toString());
        return;
      }

      // 使用 ILoadTestTask 的 taskId 来停止压测任务
      console.log('Stopping load test for task:', currentTask);
      console.log('Using taskId:', currentTask.taskId);

      await dispatch.loadTestDefinition.stopLoadTestTask({ taskId: currentTask.taskId });

      Message.success(i18n.t('Load test task stopped successfully').toString());

      // 更新状态
      setLoadTestStatus(prev => ({
        ...prev,
        status: 'stopped',
      }));

      // 停止轮询
      stopPolling();

      // 重新获取任务状态
      await fetchLoadTestTasks();

      setStopConfirmVisible(false);
    } catch (error) {
      console.error('Failed to stop load test:', error);
      Message.error(i18n.t('Failed to stop load test task').toString());
    } finally {
      setStopping(false);
    }
  }

  async function handleStartLoadTest() {
    setStopping(true);
    try {
      // 注意：启动压测通常需要通过实验任务来触发，而不是直接启动压测任务
      // 这里可能需要调用重新运行实验的API
      console.log('Starting load test is typically triggered by experiment execution');
      Message.notice(i18n.t('Load test will be started when experiment runs').toString());

      // 如果有专门的启动压测API，可以在这里调用
      // await dispatch.loadTestDefinition.startLoadTestTask({ taskId });

      // 暂时使用模拟启动
      setLoadTestStatus({
        status: 'preparing',
        duration: 0,
        concurrency: 100,
        errorRate: 0,
        startTime: Date.now(),
      });

      // 模拟准备阶段
      setTimeout(() => {
        setLoadTestStatus(prev => ({
          ...prev,
          status: 'running',
        }));
      }, 3000);

    } catch (error) {
      console.error('Failed to start load test:', error);
      Message.error(i18n.t('Failed to start load test').toString());
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
    // 如果没有压测任务，显示无压测任务状态
    if (loadTestTasks.length === 0) {
      return (
        <div className={styles.statusControls}>
          <div className={styles.statusInfo}>
            <Tag color="default" className={styles.statusTag}>
              <Translation>No Load Test</Translation>
            </Tag>
            <div className={styles.statusDetails}>
              <span className={styles.statusDetail}>
                <Translation>No load test tasks found for this experiment</Translation>
              </span>
            </div>
          </div>
        </div>
      );
    }

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
    const currentTask = loadTestTasks[0]; // 获取当前任务信息
    return (
      <div className={styles.statusControls}>
        <div className={styles.statusInfo}>
          <Tag color={statusConfig.color} className={styles.statusTag}>
            {statusConfig.icon}
            {statusConfig.text}
          </Tag>

          {/* 显示任务基本信息 */}
          <div className={styles.statusDetails}>
            <span className={styles.statusDetail}>
              <Translation>Task ID</Translation>: {currentTask.taskId}
            </span>
            {currentTask.executionId && (
              <span className={styles.statusDetail}>
                <Translation>Execution ID</Translation>: {currentTask.executionId}
              </span>
            )}
          </div>

          {loadTestStatus.status === 'running' && (
            <div className={styles.statusDetails}>
              <span className={styles.statusDetail}>
                <Translation>Duration</Translation>: {formatDuration(loadTestStatus.duration)}
              </span>
              <span className={styles.statusDetail}>
                <Translation>Start Time</Translation>: {currentTask.startTime ? moment(currentTask.startTime).format('HH:mm:ss') : 'N/A'}
              </span>
              {currentTask.statusDescription && (
                <span className={styles.statusDetail}>
                  {currentTask.statusDescription}
                </span>
              )}
            </div>
          )}

          {(loadTestStatus.status === 'stopped' || loadTestStatus.status === 'failed') && (
            <div className={styles.statusDetails}>
              <span className={styles.statusDetail}>
                <Translation>Last run</Translation>: {loadTestStatus.duration > 0 ? formatDuration(loadTestStatus.duration) : i18n.t('N/A').toString()}
              </span>
              <span className={styles.statusDetail}>
                <Translation>Created At</Translation>: {moment(currentTask.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </span>
              {currentTask.statusDescription && (
                <span className={styles.statusDetail}>
                  {currentTask.statusDescription}
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
            disabled={true} // 通常压测任务不能直接重启，需要通过实验重新执行
          >
            <Icon type="play" />
            <Translation>Restart Experiment</Translation>
          </Button>
        )}
      </div>
    );
  }

  // 已禁用：不再使用模拟数据，只使用真实API数据
  function _generateRealisticMockData(): LoadTestMetrics {
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
    if (!metrics) {
      return null;
    }

    if (!metrics.timestamps || metrics.timestamps.length === 0) {
      return (
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <Translation>Latency Metrics</Translation>
            </div>
          </div>
          <div style={{ padding: 20, textAlign: 'center' }}>
            <Translation>No data available</Translation>
          </div>
        </div>
      );
    }

    const chartData = metrics.timestamps.map((timestamp, index) => {
      const data = [
        { timestamp, value: metrics.latency.avg[index] || 0, type: 'Avg' },
        { timestamp, value: metrics.latency.min[index] || 0, type: 'Min' },
        { timestamp, value: metrics.latency.max[index] || 0, type: 'Max' },
        { timestamp, value: metrics.latency.median[index] || 0, type: 'Median' },
      ];

      if (percentileConfig.includes('P90')) {
        data.push({ timestamp, value: metrics.latency.p90[index] || 0, type: 'P90' });
      }
      if (percentileConfig.includes('P95')) {
        data.push({ timestamp, value: metrics.latency.p95[index] || 0, type: 'P95' });
      }
      if (percentileConfig.includes('P99')) {
        data.push({ timestamp, value: metrics.latency.p99[index] || 0, type: 'P99' });
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
            {/* <Translation>Fault injection period: 20-35 minutes</Translation> */}
          </div>
        </div>
        <div className={styles.sectionControls}>
          <div className={styles.controlGroup}>
            {renderLoadTestStatusControls()}
            <Button onClick={fetchLoadTestData} loading={loading}>
              <Icon type="refresh" />
              <Translation>Refresh</Translation>
            </Button>

          </div>
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
        <>
          <div className={styles.chartsGrid}>
            {renderLatencyChart()}
            {renderSuccessRateChart()}
            {renderThroughputChart()}
          </div>
          {/* 压测结果部分 - 只在压测停止时显示 */}
          {renderLoadTestResults()}
        </>
      )}

      {/* 下载确认对话框 */}
      <Dialog
        title={actionMode === 'view' ? i18n.t('Confirm View').toString() : i18n.t('Confirm Download').toString()}
        visible={downloadConfirmVisible}
        onOk={handleDownload}
        onCancel={handleDownloadCancel}
        onClose={handleDownloadCancel}
        okProps={{ children: actionMode === 'view' ? i18n.t('View').toString() : i18n.t('Download').toString() }}
        cancelProps={{ children: i18n.t('Cancel').toString() }}
      >
        <p>
          {actionMode === 'view'
            ? i18n.t('Are you sure you want to open the {type}?', { type: downloadType }).toString()
            : i18n.t('Are you sure you want to download the {type}?', { type: downloadType }).toString()
          }
        </p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
          {actionMode === 'view'
            ? i18n.t('The report will open in a new tab.').toString()
            : i18n.t('The file will open in a new tab for download.').toString()
          }
        </p>
      </Dialog>

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
        {loadTestTasks.length > 0 && (
          <>
            <p>{i18n.t('Current task information').toString()}:</p>
            <ul>
              <li>{i18n.t('Task ID').toString()}: {loadTestTasks[0].taskId}</li>
              <li>{i18n.t('Execution ID').toString()}: {loadTestTasks[0].executionId || 'N/A'}</li>
              <li>{i18n.t('Duration').toString()}: {formatDuration(loadTestStatus.duration)}</li>
              <li>{i18n.t('Status').toString()}: {loadTestTasks[0].status}</li>
            </ul>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default LoadTestDataCharts;
