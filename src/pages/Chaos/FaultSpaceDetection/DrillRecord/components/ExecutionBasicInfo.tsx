import React, { FC } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { Button, Icon } from '@alicloud/console-components';
import formatDate from '../../../lib/DateUtil';

interface BasicInfoData {
  id: number | string;
  taskName: string;
  apiSummary: string;
  initiator: string;
  startTime: string;
  currentStatus: string;
  cumulativeDuration: number;
}

interface ExecutionBasicInfoProps {
  data: BasicInfoData;
  onPauseResume?: () => void; // optional in new design
  onTerminate: () => void;
  onExport: () => void;
}

const ExecutionBasicInfo: FC<ExecutionBasicInfoProps> = ({
  data,
  onTerminate,
  onExport,
}) => {
  const formatDuration = (seconds: number) => {
    const sec = Number(seconds || 0);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="play" />
          {i18n.t('Execution Basic Information').toString()}
        </div>
        <div className={styles.controlButtons}>
          <Button onClick={onExport}>
            <Icon type="download" />
            <Translation>Export Report</Translation>
          </Button>
          <Button type="normal" warning onClick={onTerminate}>
            <Icon type="stop" />
            <Translation>Terminate</Translation>
          </Button>
        </div>
      </div>

      <div className={styles.sectionContent}>
        <div className={styles.basicInfoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>ID</Translation>
            </div>
            <div className={styles.infoValue} style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
              {String(data.id)}
            </div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Task Name</Translation>
            </div>
            <div className={styles.infoValue}>{data.taskName || '-'}</div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>API</div>
            <div className={styles.infoValue}>{data.apiSummary || '-'}</div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              {i18n.t('Initiator').toString()}
            </div>
            <div className={styles.infoValue}>{data.initiator || '-'}</div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              <Translation>Start Time</Translation>
            </div>
            <div className={styles.infoValue}>{data.startTime ? formatDate(new Date(data.startTime).getTime()) : '-'}</div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              {i18n.t('Current Status').toString()}
            </div>
            <div className={styles.infoValue}>{data.currentStatus || '-'}</div>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>
              {i18n.t('Cumulative Duration').toString()}
            </div>
            <div className={styles.infoValue} style={{ fontFamily: 'Monaco, Consolas, monospace' }}>
              {formatDuration(Number(data.cumulativeDuration || 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionBasicInfo;
