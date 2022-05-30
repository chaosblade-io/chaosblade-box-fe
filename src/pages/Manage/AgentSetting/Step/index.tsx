import InstallAgent from './InstallAgent';
import React, { FC, memo, useEffect } from 'react';

import { getParams, removeParams } from 'utils/libs/sre-utils';

const Step: FC = () => {
  const install = getParams('iis') === '1'; // 架构感知或者故障演练安装探针

  useEffect(() => {
    return () => removeParams('iis');
  }, []);
  if (install) {
    return <InstallAgent/>;
  }
  return null;
};

export default memo(Step);
