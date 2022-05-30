import React, { FC, memo } from 'react';
import i18n from '../../../../../../i18n';
import { Step } from '@alicloud/console-components';

interface IPorps {
  step: number;
  handleSelectStep: (idx: number) => void;
}

const SettingStep: FC<IPorps> = ({ step, handleSelectStep }) => {
  return (
    <div style={{ marginBottom: '8px' }}>
      <Step current={step} shape={'arrow'}>
        <Step.Item
          title={i18n.t('Select environment').toString()}
          onClick={() => handleSelectStep(0)}
        />
        <Step.Item
          title={i18n.t('Install the Application High Availability Plugin').toString()}
          onClick={() => handleSelectStep(1)}
          disabled={step < 1}
        />
      </Step>
    </div>
  );
};

export default memo(SettingStep);
