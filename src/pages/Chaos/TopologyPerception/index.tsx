import React, { FC } from 'react';
import Translation from 'components/Translation';
import XFlow from 'components/XFlow';

const TopologyPerception: FC = () => {
  return (
    <div style={{ height: 'calc(100vh - 100px)', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2><Translation>拓扑感知</Translation></h2>
        <p><Translation>查看和分析系统拓扑结构</Translation></p>
      </div>

      <div style={{ height: 'calc(100% - 60px)', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
        <XFlow />
      </div>
    </div>
  );
};

export default TopologyPerception;
