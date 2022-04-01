import React, { FC, memo } from 'react';
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
          title={'选择环境'}
          onClick={() => handleSelectStep(0)}
          data-spm-click="gostr=/aliyun;locaid=d_SettingStep_step_selectEnv"
        />
        <Step.Item
          title={'安装应用高可用插件'}
          onClick={() => handleSelectStep(1)}
          data-spm-click="gostr=/aliyun;locaid=d_SettingStep_step_installplugins"
          disabled={step < 1}
        />
        <Step.Item
          title={'查看数据'}
          onClick={() => handleSelectStep(2)}
          data-spm-click="gostr=/aliyun;locaid=d_SettingStep_step_installJavaAgent"
          disabled={step < 2}
        />
      </Step>
    </div>
  );
};

export default memo(SettingStep);
