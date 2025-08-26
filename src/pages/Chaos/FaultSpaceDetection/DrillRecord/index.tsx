import React, { FC, useEffect, useState, useRef } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { 
  Button, 
  Message, 
  Icon,
  Tag,
  Progress,
  Dialog,
  Balloon,
  Card,
  Loading
} from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory, useParams } from 'dva';
import formatDate from '../../lib/DateUtil';

// Import section components
import ExecutionBasicInfo from './components/ExecutionBasicInfo';
import ExecutionLogs from './components/ExecutionLogs';
import RealTimeStatus from './components/RealTimeStatus';
import ExecutionResults from './components/ExecutionResults';

// TypeScript interfaces
interface DrillRecordData {
  runId: string;
  taskId: string;
  taskName: string;
  applicationSystem: string;
  environment: string;
  apiInfo: {
    method: string;
    path: string;
    summary: string;
  };
  initiator: string;
  startTime: string;
  endTime?: string;
  status: 'RUNNING' | 'PAUSED' | 'SUCCESS' | 'FAILED' | 'TERMINATED';
  duration: number;
  currentStep: string;
  progress: {
    completed: number;
    total: number;
    eta: string;
  };
  safetyInfo?: {
    isProduction: boolean;
    grayPercentage: number;
    maxConcurrentInjections: number;
  };
  metrics: {
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
  };
  executionPlan: Array<{
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
  }>;
  chainFailures: Array<{
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
  }>;
  chainHighLatencies: Array<{
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
  }>;
}

interface DrillRecordParams {
  runId: string;
}

const DrillRecord: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams() as DrillRecordParams;
  const { runId } = params;
  
  const [drillData, setDrillData] = useState<DrillRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pauseDialogVisible, setPauseDialogVisible] = useState(false);
  const [terminateDialogVisible, setTerminateDialogVisible] = useState(false);
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  
  // Real-time updates
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (runId) {
      loadDrillRecord(runId);
      if (isRealTimeEnabled) {
        setupRealTimeUpdates(runId);
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [runId, isRealTimeEnabled]);

  useEffect(() => {
    if (drillData) {
      // Set page title and breadcrumb
      dispatch.pageHeader.setTitle(`${i18n.t('Drill Record').toString()} - ${drillData.runId}`);
      dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
        { key: 'fault_space_detection', value: i18n.t('Fault Space Detection').toString(), path: '/chaos/fault-space-detection/tasks' },
        { key: 'detection_tasks', value: i18n.t('Detection Tasks').toString(), path: '/chaos/fault-space-detection/tasks' },
        { key: 'task_detail', value: drillData.taskName, path: `/chaos/fault-space-detection/tasks/${drillData.taskId}` },
        { key: 'drill_record', value: drillData.runId, path: `/chaos/fault-space-detection/records/${runId}` },
      ]));
    }
  }, [drillData, runId]);

  const loadDrillRecord = async (id: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const result = await dispatch.faultSpaceDetection.getDrillRecord({ runId: id });
      
      // Mock data for development
      const mockDrillData: DrillRecordData = {
        runId: id,
        taskId: 'task_001',
        taskName: '用户登录API故障空间探测',
        applicationSystem: '用户中心',
        environment: '生产环境',
        apiInfo: {
          method: 'POST',
          path: '/api/v1/auth/login',
          summary: '用户登录',
        },
        initiator: 'admin',
        startTime: new Date(Date.now() - 1800000).toISOString(),
        status: Math.random() > 0.5 ? 'RUNNING' : 'SUCCESS',
        duration: 1800,
        currentStep: '执行故障注入 - User Service',
        progress: {
          completed: 8,
          total: 12,
          eta: new Date(Date.now() + 600000).toISOString(),
        },
        safetyInfo: {
          isProduction: true,
          grayPercentage: 5,
          maxConcurrentInjections: 2,
        },
        metrics: {
          current: {
            p50: 89,
            p95: 234,
            p99: 456,
            errorRate: 2.3,
            rps: 45.6,
            sampleCount: 1234,
          },
          baseline: {
            p50: 67,
            p95: 156,
            p99: 234,
            errorRate: 0.2,
            rps: 48.2,
          },
        },
        executionPlan: [
          {
            layer: 1,
            services: [
              {
                serviceId: 'user-service',
                serviceName: 'User Service',
                faults: [
                  {
                    faultId: 'fault_1',
                    faultType: 'network_delay',
                    faultName: '网络延迟',
                    status: 'COMPLETED',
                    startTime: new Date(Date.now() - 1500000).toISOString(),
                    endTime: new Date(Date.now() - 1200000).toISOString(),
                    parameters: { delay: 200, variance: 10 },
                  },
                  {
                    faultId: 'fault_2',
                    faultType: 'cpu_stress',
                    faultName: 'CPU压力',
                    status: 'RUNNING',
                    startTime: new Date(Date.now() - 600000).toISOString(),
                    parameters: { cpuPercent: 80, duration: 60 },
                  },
                ],
              },
            ],
          },
          {
            layer: 2,
            services: [
              {
                serviceId: 'auth-db',
                serviceName: 'Auth Database',
                faults: [
                  {
                    faultId: 'fault_3',
                    faultType: 'network_delay',
                    faultName: '网络延迟',
                    status: 'PENDING',
                    parameters: { delay: 50, variance: 5 },
                  },
                ],
              },
            ],
          },
        ],
        chainFailures: [
          {
            id: 'chain_failure_1',
            number: 1,
            responseStatus: 500,
            errorRate: 15.6,
            timestamp: new Date(Date.now() - 900000).toISOString(),
            faultCombination: [
              {
                serviceId: 'user-service',
                serviceName: 'User Service',
                faultType: 'Network Delay',
                faultParameters: { delay: 200, variance: 10 }
              },
              {
                serviceId: 'auth-db',
                serviceName: 'Auth Database',
                faultType: 'Connection Pool Exhaustion',
                faultParameters: { maxConnections: 5 }
              }
            ],
            traceId: 'trace_12345',
            curlCommand: 'curl -X POST "https://api.example.com/v1/auth/login" -H "Content-Type: application/json" -d \'{"username":"test","password":"test"}\'',
          },
          {
            id: 'chain_failure_2',
            number: 2,
            responseStatus: 503,
            errorRate: 8.2,
            timestamp: new Date(Date.now() - 600000).toISOString(),
            faultCombination: [
              {
                serviceId: 'order-service',
                serviceName: 'Order Service',
                faultType: 'CPU Stress',
                faultParameters: { cpuPercent: 90, duration: 60 }
              },
              {
                serviceId: 'mq',
                serviceName: 'Message Queue',
                faultType: 'Message Loss',
                faultParameters: { lossRate: 0.1 }
              }
            ],
            traceId: 'trace_67890',
            curlCommand: 'curl -X POST "https://api.example.com/v1/orders" -H "Content-Type: application/json" -d \'{"productId":"123","quantity":2}\'',
          },
        ],
        chainHighLatencies: [
          {
            id: 'chain_latency_1',
            number: 1,
            responseStatus: 200,
            p95Latency: 1250,
            p99Latency: 2100,
            timestamp: new Date(Date.now() - 450000).toISOString(),
            faultCombination: [
              {
                serviceId: 'user-service',
                serviceName: 'User Service',
                faultType: 'Memory Leak',
                faultParameters: { memoryMB: 512, rate: 10 }
              },
              {
                serviceId: 'cache',
                serviceName: 'Redis Cache',
                faultType: 'Slow Query',
                faultParameters: { delay: 500 }
              }
            ],
            traceId: 'trace_abc123',
          },
          {
            id: 'chain_latency_2',
            number: 2,
            responseStatus: 200,
            p95Latency: 890,
            p99Latency: 1450,
            timestamp: new Date(Date.now() - 300000).toISOString(),
            faultCombination: [
              {
                serviceId: 'order-service',
                serviceName: 'Order Service',
                faultType: 'Disk I/O Stress',
                faultParameters: { ioPercent: 80 }
              }
            ],
            traceId: 'trace_def456',
          },
        ],
      };

      setDrillData(mockDrillData);
    } catch (error) {
      console.error('Failed to load drill record:', error);
      Message.error(i18n.t('Failed to load drill record').toString());
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = (id: string) => {
    // TODO: Setup SSE connection for real-time updates
    // const eventSource = new EventSource(`/api/drill-records/${id}/events`);
    // eventSourceRef.current = eventSource;
    
    // eventSource.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   updateDrillData(data);
    // };
    
    // eventSource.onerror = (error) => {
    //   console.error('SSE connection error:', error);
    //   setIsRealTimeEnabled(false);
    // };

    // Mock real-time updates for development
    const interval = setInterval(() => {
      if (drillData && drillData.status === 'RUNNING') {
        setDrillData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            duration: prev.duration + 5,
            progress: {
              ...prev.progress,
              completed: Math.min(prev.progress.completed + Math.random() * 0.1, prev.progress.total),
            },
            metrics: {
              ...prev.metrics,
              current: {
                ...prev.metrics.current,
                p95: prev.metrics.current.p95 + (Math.random() - 0.5) * 10,
                errorRate: Math.max(0, prev.metrics.current.errorRate + (Math.random() - 0.5) * 0.5),
                rps: prev.metrics.current.rps + (Math.random() - 0.5) * 2,
                sampleCount: prev.metrics.current.sampleCount + Math.floor(Math.random() * 10),
              },
            },
          };
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const handlePauseResume = async () => {
    if (!drillData) return;
    
    try {
      if (drillData.status === 'RUNNING') {
        // TODO: Pause drill execution
        // await dispatch.faultSpaceDetection.pauseDrill({ runId });
        
        setDrillData(prev => prev ? { ...prev, status: 'PAUSED' } : prev);
        Message.success(i18n.t('Drill execution paused').toString());
      } else if (drillData.status === 'PAUSED') {
        // TODO: Resume drill execution
        // await dispatch.faultSpaceDetection.resumeDrill({ runId });
        
        setDrillData(prev => prev ? { ...prev, status: 'RUNNING' } : prev);
        Message.success(i18n.t('Drill execution resumed').toString());
      }
    } catch (error) {
      console.error('Failed to pause/resume drill:', error);
      Message.error(i18n.t('Failed to control drill execution').toString());
    }
  };

  const handleTerminate = async () => {
    try {
      // TODO: Terminate drill execution
      // await dispatch.faultSpaceDetection.terminateDrill({ runId });
      
      setDrillData(prev => prev ? { ...prev, status: 'TERMINATED', endTime: new Date().toISOString() } : prev);
      setTerminateDialogVisible(false);
      Message.success(i18n.t('Drill execution terminated').toString());
    } catch (error) {
      console.error('Failed to terminate drill:', error);
      Message.error(i18n.t('Failed to terminate drill execution').toString());
    }
  };

  const handleExportReport = async (format: 'HTML' | 'CSV' | 'JSON') => {
    try {
      // TODO: Export drill report
      // await dispatch.faultSpaceDetection.exportDrillReport({ runId, format });
      
      Message.success(i18n.t(`Report exported as ${format} successfully`).toString());
      setExportDialogVisible(false);
    } catch (error) {
      console.error('Failed to export report:', error);
      Message.error(i18n.t('Failed to export report').toString());
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading tip={i18n.t('Loading drill record...').toString()}>
          <div style={{ height: 400 }} />
        </Loading>
      </div>
    );
  }

  if (!drillData) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <Icon type="exclamation-circle" size="large" style={{ color: '#ff4d4f', marginBottom: 16 }} />
          <h3><Translation>Drill Record Not Found</Translation></h3>
          <p><Translation>The requested drill record could not be found or you don't have permission to view it.</Translation></p>
          <Button type="primary" onClick={() => pushUrl(history, '/chaos/fault-space-detection/tasks')}>
            <Translation>Back to Task List</Translation>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Section 1: Execution Basic Info + Control Buttons */}
      <ExecutionBasicInfo
        data={drillData}
        onPauseResume={handlePauseResume}
        onTerminate={() => setTerminateDialogVisible(true)}
        onExport={() => setExportDialogVisible(true)}
      />

      {/* Section 2: Execution Logs + Progress Display */}
      <ExecutionLogs
        runId={runId}
        executionPlan={drillData.executionPlan}
        progress={drillData.progress}
        currentStep={drillData.currentStep}
        isRealTime={isRealTimeEnabled}
      />

      {/* Section 3: Real-time Execution Status */}
      <RealTimeStatus
        testMetrics={{
          totalTestCases: drillData.executionPlan.reduce((total, layer) =>
            total + layer.services.reduce((serviceTotal, service) =>
              serviceTotal + service.faults.length, 0), 0),
          completedTestCases: drillData.executionPlan.reduce((total, layer) =>
            total + layer.services.reduce((serviceTotal, service) =>
              serviceTotal + service.faults.filter(fault => fault.status === 'COMPLETED').length, 0), 0),
          totalServices: drillData.executionPlan.reduce((total, layer) => total + layer.services.length, 0),
          completedServices: drillData.executionPlan.reduce((total, layer) =>
            total + layer.services.filter(service =>
              service.faults.every(fault => fault.status === 'COMPLETED')).length, 0),
          testingServices: drillData.executionPlan.reduce((total, layer) =>
            total + layer.services.filter(service =>
              service.faults.some(fault => fault.status === 'RUNNING')).length, 0),
          sampleCount: drillData.metrics.current.sampleCount
        }}
        status={drillData.status}
        currentStep={drillData.currentStep}
      />

      {/* Section 4: Execution Results */}
      <ExecutionResults
        chainFailures={drillData.chainFailures}
        chainHighLatencies={drillData.chainHighLatencies}
        executionPlan={drillData.executionPlan}
        metrics={drillData.metrics}
        onExport={handleExportReport}
      />

      {/* Dialogs */}
      <Dialog
        visible={terminateDialogVisible}
        title={i18n.t('Terminate Drill Execution').toString()}
        onClose={() => setTerminateDialogVisible(false)}
        onCancel={() => setTerminateDialogVisible(false)}
        onOk={handleTerminate}
        locale={locale().Dialog}
      >
        <div className={styles.terminateDialogContent}>
          <div className={styles.warningSection}>
            <Icon type="warning" style={{ color: '#faad14', marginRight: 8 }} />
            <span className={styles.warningText}>
              <Translation>This action will immediately terminate the drill execution</Translation>
            </span>
          </div>
          <div className={styles.impactSection}>
            <h4><Translation>Impact</Translation>:</h4>
            <ul>
              <li><Translation>All current fault injections will be immediately revoked</Translation></li>
              <li><Translation>Subsequent execution steps will be stopped</Translation></li>
              <li><Translation>Current data will be preserved for analysis</Translation></li>
            </ul>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={exportDialogVisible}
        title={i18n.t('Export Drill Report').toString()}
        onClose={() => setExportDialogVisible(false)}
        onCancel={() => setExportDialogVisible(false)}
        footer={null}
        locale={locale().Dialog}
      >
        <div className={styles.exportDialogContent}>
          <p><Translation>Choose the export format for the drill report</Translation>:</p>
          <div className={styles.exportOptions}>
            <Button 
              type="primary" 
              onClick={() => handleExportReport('HTML')}
              style={{ marginRight: 12, marginBottom: 12 }}
            >
              <Icon type="file-text" />
              <Translation>HTML Report</Translation>
              <div style={{ fontSize: 12, color: '#666' }}>
                <Translation>Complete report with charts and visualizations</Translation>
              </div>
            </Button>
            <Button 
              onClick={() => handleExportReport('CSV')}
              style={{ marginRight: 12, marginBottom: 12 }}
            >
              <Icon type="table" />
              <Translation>CSV Data</Translation>
              <div style={{ fontSize: 12, color: '#666' }}>
                <Translation>Raw data for further analysis</Translation>
              </div>
            </Button>
            <Button 
              onClick={() => handleExportReport('JSON')}
              style={{ marginBottom: 12 }}
            >
              <Icon type="code" />
              <Translation>JSON API</Translation>
              <div style={{ fontSize: 12, color: '#666' }}>
                <Translation>Structured data for API integration</Translation>
              </div>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DrillRecord;
