import React, { FC } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { NumberPicker, Icon } from '@alicloud/console-components';

interface ExecutionConfigData {
  requestNum: number;
}

interface ExecutionConfigurationSectionProps {
  data: ExecutionConfigData;
  errors?: any;
  onChange: (data: Partial<ExecutionConfigData>) => void;
}

const ExecutionConfigurationSection: FC<ExecutionConfigurationSectionProps> = ({ data, errors, onChange }) => {
  const updateRequestNum = (value: number) => onChange({ requestNum: value });

  const renderRequestConfig = () => (
    <div>
      <h5 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
        <Translation>Request Configuration</Translation>
      </h5>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <label className={`${styles.fieldLabel} ${styles.required}`}>
            <Translation>Total Request Number</Translation>
          </label>
          <NumberPicker
            value={data?.requestNum || 20}
            onChange={updateRequestNum}
            min={1}
            max={100000}
            step={1}
            style={{ width: '100%' }}
          />
          <div className={styles.fieldDescription}>
            <Translation>Total number of requests to send in this probe task (payload requestNum)</Translation>
          </div>
          {errors?.requestNum && (
            <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
              {errors.requestNum}
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
            <Translation>Request Execution Configuration</Translation>
          </div>
          <div className={styles.sectionDescription}>
            <Translation>Configure total request number for this probe task</Translation>
          </div>
        </div>
      </div>

      {errors && Object.keys(errors).length > 0 && (
        <div className={styles.errorList}>
          {Object.entries(errors).map(([ field, error ]: any, index) => (
            <div key={index} className={styles.errorItem}>
              <Icon type="exclamation-circle" size="xs" />
              {error as any}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>{renderRequestConfig()}</div>
    </div>
  );
};

export default ExecutionConfigurationSection;
