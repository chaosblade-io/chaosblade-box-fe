import React, { FC, useState, useEffect, useRef } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { Icon, Progress, Select, Switch, Button } from '@alicloud/console-components';
import formatDate from '../../../lib/DateUtil';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  category: 'STEP' | 'INJECTION' | 'ASSERTION' | 'ALERT' | 'SYSTEM';
  message: string;
  details?: Record<string, any>;
  serviceId?: string;
  faultId?: string;
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

interface Progress {
  completed: number;
  total: number;
  eta: string;
}

interface ExecutionLogsProps {
  runId: string;
  executionPlan: ExecutionPlan[];
  progress: Progress;
  currentStep: string;
  isRealTime: boolean;
}

const ExecutionLogs: FC<ExecutionLogsProps> = ({
  runId,
  executionPlan,
  progress,
  currentStep,
  isRealTime,
}) => {
  const [ logs, setLogs ] = useState<LogEntry[]>([]);
  const [ filteredLogs, setFilteredLogs ] = useState<LogEntry[]>([]);
  const [ logFilter, setLogFilter ] = useState<string>('');
  const [ autoScroll, setAutoScroll ] = useState(true);
  const [ expandedServices, setExpandedServices ] = useState<string[]>([]);

  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with mock logs
    const mockLogs: LogEntry[] = [
      {
        id: 'log_1',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        level: 'INFO',
        category: 'STEP',
        message: 'Drill execution started',
        details: { runId, totalSteps: progress.total },
      },
      {
        id: 'log_2',
        timestamp: new Date(Date.now() - 1700000).toISOString(),
        level: 'INFO',
        category: 'STEP',
        message: 'Step 1/12: Initializing baseline measurement',
      },
      {
        id: 'log_3',
        timestamp: new Date(Date.now() - 1600000).toISOString(),
        level: 'SUCCESS',
        category: 'STEP',
        message: 'Baseline measurement completed - P95: 156ms, Error Rate: 0.2%',
      },
      {
        id: 'log_4',
        timestamp: new Date(Date.now() - 1500000).toISOString(),
        level: 'INFO',
        category: 'INJECTION',
        message: 'Injecting network delay fault to User Service',
        serviceId: 'user-service',
        faultId: 'fault_1',
        details: { delay: 200, variance: 10 },
      },
      {
        id: 'log_5',
        timestamp: new Date(Date.now() - 1400000).toISOString(),
        level: 'SUCCESS',
        category: 'INJECTION',
        message: 'Network delay fault injection successful',
        serviceId: 'user-service',
        faultId: 'fault_1',
      },
      {
        id: 'log_6',
        timestamp: new Date(Date.now() - 1300000).toISOString(),
        level: 'WARN',
        category: 'ASSERTION',
        message: 'P95 latency exceeded threshold: 234ms > 200ms',
        details: { threshold: 200, actual: 234 },
      },
      {
        id: 'log_7',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        level: 'INFO',
        category: 'INJECTION',
        message: 'Revoking network delay fault from User Service',
        serviceId: 'user-service',
        faultId: 'fault_1',
      },
      {
        id: 'log_8',
        timestamp: new Date(Date.now() - 1100000).toISOString(),
        level: 'SUCCESS',
        category: 'INJECTION',
        message: 'Network delay fault revoked successfully',
        serviceId: 'user-service',
        faultId: 'fault_1',
      },
      {
        id: 'log_9',
        timestamp: new Date(Date.now() - 1000000).toISOString(),
        level: 'INFO',
        category: 'INJECTION',
        message: 'Injecting CPU stress fault to User Service',
        serviceId: 'user-service',
        faultId: 'fault_2',
        details: { cpuPercent: 80, duration: 60 },
      },
      {
        id: 'log_10',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'ERROR',
        category: 'ASSERTION',
        message: 'Response assertion failed: Expected status 200, got 500',
        details: { expected: 200, actual: 500, traceId: 'trace_12345' },
      },
      {
        id: 'log_11',
        timestamp: new Date(Date.now() - 800000).toISOString(),
        level: 'WARN',
        category: 'ALERT',
        message: 'High error rate detected: 5.2% > 1.0% threshold',
        details: { threshold: 1.0, actual: 5.2 },
      },
      {
        id: 'log_12',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'INFO',
        category: 'STEP',
        message: 'Step 8/12: Executing fault injection - User Service',
      },
    ];

    setLogs(mockLogs);
  }, [ runId, progress.total ]);

  useEffect(() => {
    // Filter logs based on selected filter
    let filtered = logs;

    if (logFilter === 'FAILED') {
      filtered = logs.filter(log => log.level === 'ERROR');
    } else if (logFilter === 'CURRENT_LAYER') {
      // Filter by current layer (simplified logic)
      filtered = logs.filter(log => log.category === 'INJECTION' || log.category === 'STEP');
    } else if (logFilter.startsWith('SERVICE_')) {
      const serviceId = logFilter.replace('SERVICE_', '');
      filtered = logs.filter(log => log.serviceId === serviceId);
    }

    setFilteredLogs(filtered);
  }, [ logs, logFilter ]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [ filteredLogs, autoScroll ]);

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev =>
      (prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [ ...prev, serviceId ]),
    );
  };

  const getLogLevelClass = (level: string) => {
    const levelClasses = {
      INFO: styles.logLevelInfo,
      WARN: styles.logLevelWarn,
      ERROR: styles.logLevelError,
      SUCCESS: styles.logLevelSuccess,
    };
    return levelClasses[level as keyof typeof levelClasses] || styles.logLevelInfo;
  };

  const getFaultStatusIcon = (status: string) => {
    const statusIcons = {
      PENDING: '⏳',
      RUNNING: '⏳',
      COMPLETED: '✓',
      FAILED: '✗',
      SKIPPED: '↷',
    };
    return statusIcons[status as keyof typeof statusIcons] || '⏳';
  };

  const getFaultStatusClass = (status: string) => {
    const statusClasses = {
      PENDING: styles.statusPending,
      RUNNING: styles.statusRunning,
      COMPLETED: styles.statusCompleted,
      FAILED: styles.statusFailed,
      SKIPPED: styles.statusSkipped,
    };
    return statusClasses[status as keyof typeof statusClasses] || styles.statusPending;
  };

  const renderLogEntry = (log: LogEntry) => (
    <div key={log.id} className={styles.logEntry}>
      <div className={styles.logTimestamp}>
        {new Date(log.timestamp).toLocaleTimeString()}
      </div>
      <div className={`${styles.logLevel} ${getLogLevelClass(log.level)}`}>
        {log.level}
      </div>
      <div className={styles.logMessage}>
        {log.message}
        {log.details && (
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
            {Object.entries(log.details).map(([ key, value ]) => (
              <span key={key} style={{ marginRight: 12 }}>
                {key}: {JSON.stringify(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProgressTree = () => (
    <div className={styles.progressTree}>
      {executionPlan.map(layer => (
        <div key={layer.layer} className={styles.treeLayer}>
          <div className={styles.layerTitle}>
            <Translation>Layer</Translation> {layer.layer}
          </div>
          {layer.services.map(service => (
            <div key={service.serviceId} className={styles.treeService}>
              <div
                className={styles.serviceName}
                onClick={() => toggleServiceExpansion(service.serviceId)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Icon
                  type={expandedServices.includes(service.serviceId) ? 'arrow-down' : 'arrow-right'}
                  size="xs"
                />
                {service.serviceName}
              </div>
              {expandedServices.includes(service.serviceId) && (
                <div style={{ paddingLeft: 16 }}>
                  {service.faults.map(fault => (
                    <div key={fault.faultId} className={styles.treeFault}>
                      <div className={`${styles.faultStatus} ${getFaultStatusClass(fault.status)}`}>
                        {getFaultStatusIcon(fault.status)}
                      </div>
                      <div className={styles.faultName}>
                        {fault.faultName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="list" />
          <Translation>Execution Logs & Progress</Translation>
        </div>
      </div>

      <div className={styles.sectionContent}>
        <div className={styles.progressContainer}>
          {/* Real-time Logs */}
          <div className={styles.logsContainer}>
            <div className={styles.logsHeader}>
              <div className={styles.logsTitle}>
                <Translation>Real-time Execution Logs</Translation>
                {isRealTime && (
                  <Icon type="loading" size="xs" style={{ marginLeft: 8, color: '#52c41a' }} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Select
                  placeholder={i18n.t('Filter logs').toString()}
                  value={logFilter}
                  onChange={setLogFilter}
                  style={{ width: 150 }}
                  size="small"
                  hasClear
                >
                  <Select.Option value="">All Logs</Select.Option>
                  <Select.Option value="FAILED">Failed Only</Select.Option>
                  <Select.Option value="CURRENT_LAYER">Current Layer</Select.Option>
                  {executionPlan.flatMap(layer =>
                    layer.services.map(service => (
                      <Select.Option key={service.serviceId} value={`SERVICE_${service.serviceId}`}>
                        {service.serviceName}
                      </Select.Option>
                    )),
                  )}
                </Select>
                <Switch
                  checked={autoScroll}
                  onChange={setAutoScroll}
                  size="small"
                />
                <span style={{ fontSize: 12, color: '#666' }}>
                  <Translation>Auto Scroll</Translation>
                </span>
              </div>
            </div>
            <div
              ref={logsContainerRef}
              className={styles.logsContent}
            >
              {filteredLogs.map(renderLogEntry)}
            </div>
          </div>

          {/* Progress Tree */}
          <div className={styles.progressTreeContainer}>
            <div className={styles.progressHeader}>
              <div className={styles.progressSummary}>
                <Translation>Overall Progress</Translation>
              </div>
              <Progress
                percent={Math.round((progress.completed / progress.total) * 100)}
                className={styles.progressBar}
                size="small"
              />
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                {Math.round(progress.completed)}/{progress.total} <Translation>steps completed</Translation>
              </div>
              <div className={styles.etaInfo}>
                <Translation>ETA</Translation>: {formatDate(new Date(progress.eta).getTime())}
              </div>
            </div>
            {renderProgressTree()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionLogs;
