import React, { FC, memo } from 'react';
import Translation from 'components/Translation';
import { Button } from '@alicloud/console-components';

interface IPorps {
  step: number;
  handleComplete: () => void;
  handlePrevOrNextStep: (isNext: boolean) => void;
}

// 探针管理步骤条操作按钮部分
const BottomBtn: FC<IPorps> = ({ step, handleComplete, handlePrevOrNextStep }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 25 }}>
      {step > 0 && step !== 3 && (
        <Button
          type={'primary'}
          onClick={() => handlePrevOrNextStep(false)}
        >
          <Translation>Pervious</Translation>
        </Button>
      )}
      {step > 0 && step !== 2 && (
        <Button
          style={{ marginLeft: '10px' }}
          onClick={handleComplete}
        >
          <Translation>cancel</Translation>
        </Button>
      )}
    </div>
  );
};

export default memo(BottomBtn);
