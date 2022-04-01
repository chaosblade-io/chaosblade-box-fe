import DrillTotalStatistics from './DrillTotalStatistics';
import React, { useEffect } from 'react';
import TaskInfoDistribute from './TaskInfoDistribute';
import styles from './index.css';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { removeParams } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const WorkSpace = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch.pageHeader.setTitle('空间管理');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'expertise_admin',
        value: '空间管理',
        path: '/chaos/workspace/list',
      },
    ]));
  }, []);

  useEffect(() => {
    removeParams('workspaceId');
  }, []);

  return (
    <div style={{ marginBottom: 16 }}>
      <div className={styles.top}>
        <TaskInfoDistribute />
        <DrillTotalStatistics />
      </div>
    </div>
  );
};

export default WorkSpace;
