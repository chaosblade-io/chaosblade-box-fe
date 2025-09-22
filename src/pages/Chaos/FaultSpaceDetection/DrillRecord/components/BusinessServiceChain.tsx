import React, { FC } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';

import styles from '../index.css';
import { Icon } from '@alicloud/console-components';

// 根据真实数据结构更正定义
export interface RealtimeSummary {
  totalTestCases: number;
  completedTestCases: number;
  totalServices: number;
  completedServices: number;
  testingServices: number;
}

interface BusinessServiceChainProps {
  // 新结构为汇总对象，而非数组
  realtime?: RealtimeSummary | null;
}

const BusinessServiceChain: FC<BusinessServiceChainProps> = ({ realtime }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="share" />
          {i18n.t('Test Case Info').toString()}
        </div>
      </div>

      <div className={styles.sectionContent}>
        {!realtime ? (
          <div style={{ padding: 24, color: '#999' }}>
            <Translation>No realtime data</Translation>
          </div>
        ) : (
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}><Translation>Total Test Cases</Translation></div>
              <div className={styles.metricValue}>{Number(realtime.totalTestCases || 0)}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}><Translation>Completed Test Cases</Translation></div>
              <div className={styles.metricValue}>{Number(realtime.completedTestCases || 0)}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}><Translation>Total Services</Translation></div>
              <div className={styles.metricValue}>{Number(realtime.totalServices || 0)}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}><Translation>Completed Services</Translation></div>
              <div className={styles.metricValue}>{Number(realtime.completedServices || 0)}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}><Translation>Testing Services</Translation></div>
              <div className={styles.metricValue}>{Number(realtime.testingServices || 0)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessServiceChain;
