import React, { FC } from 'react';
import Translation from 'components/Translation';
import styles from '../index.css';
import { Icon } from '@alicloud/console-components';
import formatDate from '../../../lib/DateUtil';

interface SimpleLogEntry {
  id?: string | number;
  timestamp?: string;
  level?: string;
  message?: string;
  [key: string]: any;
}

interface ExecutionLogsProps {
  logs?: SimpleLogEntry[];
  title?: string;
}

const ExecutionLogs: FC<ExecutionLogsProps> = ({ logs = [], title }) => {
  const isEmpty = !logs || logs.length === 0;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="list" />
          <Translation>{title || 'Execution Logs'}</Translation>
        </div>
      </div>

      <div className={styles.sectionContent}>
        {isEmpty ? (
          <div style={{ padding: 24, color: '#999' }}>
            <Translation>No logs available</Translation>
          </div>
        ) : (
          <div className={styles.logsContent}>
            {logs.map((log, idx) => (
              <div key={log.id || idx} className={styles.logEntry}>
                <div className={styles.logTimestamp}>
                  {log.timestamp ? formatDate(new Date(log.timestamp).getTime()) : '-'}
                </div>
                <div className={styles.logLevel}>
                  {log.level || 'INFO'}
                </div>
                <div className={styles.logMessage}>
                  {log.message || JSON.stringify(log)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionLogs;
