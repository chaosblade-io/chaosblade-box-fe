import React, { FC } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import {
  NumberPicker,
  Icon
} from '@alicloud/console-components';

interface ExecutionConfigData {
  concurrency: number;
}

interface ExecutionConfigurationSectionProps {
  data: ExecutionConfigData;
  errors?: string[];
  onChange: (data: Partial<ExecutionConfigData>) => void;
}

const ExecutionConfigurationSection: FC<ExecutionConfigurationSectionProps> = ({ data, errors, onChange }) => {
  const updateConcurrency = (value: number) => {
    onChange({ concurrency: value });
  };



  const renderConcurrencyConfig = () => (
    <div>
      <h5 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        <Translation>Concurrency Configuration</Translation>
      </h5>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <label className={`${styles.fieldLabel} ${styles.required}`}>
            <Translation>Concurrency</Translation>
          </label>
          <NumberPicker
            value={data?.concurrency || 5}
            onChange={updateConcurrency}
            min={1}
            max={100}
            step={1}
            style={{ width: '100%' }}
          />
          <div className={styles.fieldDescription}>
            <Translation>Number of concurrent requests to maintain during test execution</Translation>
          </div>
          {errors?.concurrency && (
            <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
              {errors.concurrency}
            </div>
          )}
        </div>
      </div>
    </div>
  );









  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>5</span>
            <Translation>Test Case Execution Configuration</Translation>
          </div>
          <div className={styles.sectionDescription}>
            <Translation>Configure concurrency for test execution</Translation>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <div className={styles.errorList}>
          {Object.entries(errors).map(([field, error], index) => (
            <div key={index} className={styles.errorItem}>
              <Icon type="exclamation-circle" size="xs" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Concurrency Configuration */}
      <div style={{ marginBottom: 32 }}>
        {renderConcurrencyConfig()}
      </div>
    </div>
  );
};

export default ExecutionConfigurationSection;
