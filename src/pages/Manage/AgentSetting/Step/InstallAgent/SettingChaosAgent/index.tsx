import Ecs from './Ecs';
import K8s from './K8s';
import Public from './Public';
import React, { FC, memo } from 'react';

interface IPorps {
  installMode: string;
}

const ECS = 'ecs';
const K8S = 'k8s';
const PUBLIC = 'public';
const SettingChaosAgent: FC<IPorps> = ({ installMode }) => {

  return (
    <div
      style={{ marginBottom: '8px' }}
    >
      {installMode === ECS && <Ecs />}
      {installMode === K8S && <K8s />}
      {installMode === PUBLIC && <Public />}
    </div>
  );
};

export default memo(SettingChaosAgent);
