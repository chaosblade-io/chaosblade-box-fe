import React, { FC } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { Button, Icon, Tag, Balloon } from '@alicloud/console-components';
import formatDate from '../../../lib/DateUtil';

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
  safetyInfo?: {
    isProduction: boolean;
    grayPercentage: number;
    maxConcurrentInjections: number;
  };
}

interface ExecutionBasicInfoProps {
  data: DrillRecordData;
  onPauseResume: () => void;
  onTerminate: () => void;
  onExport: () => void;
}

const ExecutionBasicInfo: FC<ExecutionBasicInfoProps> = ({
  data,
  onPauseResume,
  onTerminate,
  onExport,
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      RUNNING: { className: styles.statusRunning, icon: 'loading', text: i18n.t('Running').toString() },
      PAUSED: { className: styles.statusPaused, icon: 'pause', text: i18n.t('Paused').toString() },
      SUCCESS: { className: styles.statusSuccess, icon: 'success', text: i18n.t('Success').toString() },
      FAILED: { className: styles.statusFailed, icon: 'close', text: i18n.t('Failed').toString() },
      TERMINATED: { className: styles.statusTerminated, icon: 'stop', text: i18n.t('Terminated').toString() },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.RUNNING;
    
    return (
      <div className={`${styles.statusTag} ${config.className}`}>
        <Icon type={config.icon} size="xs" />
        {config.text}
      </div>
    );
  };

  const canPauseResume = data.status === 'RUNNING' || data.status === 'PAUSED';
  const canTerminate = data.status === 'RUNNING' || data.status === 'PAUSED';
  const isRunning = data.status === 'RUNNING';

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="play" />
          <Translation>Execution Basic Information</Translation>
        </div>
        <div className={styles.controlButtons}>
          {canPauseResume && (
            <Button 
              type={isRunning ? "normal" : "primary"}
              onClick={onPauseResume}
            >
              <Icon type={isRunning ? "pause" : "play"} />
              <Translation>{isRunning ? 'Pause' : 'Resume'}</Translation>
            </Button>
          )}
          
          {canTerminate && (
            <Balloon 
              trigger={
                <Button type="normal" warning onClick={onTerminate}>
                  <Icon type="stop" />
                  <Translation>Terminate</Translation>
                </Button>
              }
              align="t"
              triggerType="hover"
            >
              <Translation>Immediately revoke current faults and stop subsequent execution</Translation>
            </Balloon>
          )}
          
          <Button onClick={onExport}>
            <Icon type="download" />
            <Translation>Export Report</Translation>
          </Button>
        </div>
      </div>

      <div className={styles.sectionContent}>
        {/* Safety Warning for Production Environment */}

        {/* Run Overview */}
        <div className={styles.basicInfoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Run ID</Translation>
            </div>
            <div className={styles.infoValue} style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
              {data.runId}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Task Name</Translation>
            </div>
            <div className={styles.infoValue}>
              {data.taskName}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Application / Environment</Translation>
            </div>
            <div className={styles.infoValue}>
              {data.applicationSystem} / {data.environment}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>API</Translation>
            </div>
            <div className={styles.infoValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Tag color="#1890ff" style={{ fontWeight: 600, fontSize: 11 }}>
                  {data.apiInfo.method}
                </Tag>
                <code style={{ fontSize: 12 }}>{data.apiInfo.path}</code>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {data.apiInfo.summary}
              </div>
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Initiator</Translation>
            </div>
            <div className={styles.infoValue}>
              <Icon type="user" size="xs" style={{ marginRight: 4 }} />
              {data.initiator}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Start Time</Translation>
            </div>
            <div className={styles.infoValue}>
              {formatDate(new Date(data.startTime).getTime())}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Current Status</Translation>
            </div>
            <div className={styles.infoValue}>
              {getStatusTag(data.status)}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Cumulative Duration</Translation>
            </div>
            <div className={styles.infoValue} style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
              {formatDuration(data.duration)}
            </div>
          </div>

          {data.status === 'RUNNING' && (
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Translation>Current Step</Translation>
              </div>
              <div className={styles.infoValue}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon type="loading" size="xs" style={{ color: '#1890ff' }} />
                  {data.currentStep}
                </div>
              </div>
            </div>
          )}

          {data.endTime && (
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <Translation>End Time</Translation>
              </div>
              <div className={styles.infoValue}>
                {formatDate(new Date(data.endTime).getTime())}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionBasicInfo;
