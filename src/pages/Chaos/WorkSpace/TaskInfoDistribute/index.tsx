import React, { useEffect, useState } from 'react';
import TaskChart from './TaskChart';
import Translation from 'components/Translation';
import _ from 'lodash';
import styles from './index.css';
import { IExperimentSummaryInfo } from 'config/interfaces/Chaos/workspace';
import { useDispatch } from 'utils/libs/sre-utils-dva';


const TaskInfoDistribute = () => {
  const dispatch = useDispatch();
  const [ experimentSummaryInfoList, setExperimentSummaryInfoList ] = useState<IExperimentSummaryInfo[]>([]);
  const [ successSize, setSuccessSize ] = useState(0);
  const [ totalSize, setTotalSize ] = useState(0);
  const [ unexpectedSize, setUnexpectedSize ] = useState(0);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.workspace.getExperimentSummaryDays();
      if (Data) {
        setExperimentSummaryInfoList((Data as any)?.experimentSummaryInfoList ?? []);
        setSuccessSize((Data as any)?.successSize ?? 0);
        setTotalSize((Data as any)?.totalSize ?? 0);
        setUnexpectedSize((Data as any)?.unexpectedSize ?? 0);
      }
    })();
  }, []);


  return (
    <div className={styles.left}>
      <div className={styles.top}>
        <div className={styles.header}><Translation>Exercise Execution Distribution (Last 30 Days)</Translation></div>
        <div className={styles.total}>
          <span className={styles.itemLeft}><Translation>Total</Translation></span>
          <span className={styles.itemRight}>{totalSize}</span>
          <span className={styles.itemLeft} style={{ width: 45 }}><Translation>Number of successes</Translation></span>
          <span className={styles.itemRight}>{successSize}</span>
          <span className={styles.itemLeft} style={{ width: 80 }}><Translation>Not as expected</Translation></span>
          <span className={styles.itemRight}>{unexpectedSize}</span>
        </div>
      </div>
      { _.isEmpty(experimentSummaryInfoList) ?
        <div className={styles.empty}>
          <img src={'https://img.alicdn.com/tfs/TB1fN8awFY7gK0jSZKzXXaikpXa-268-258.png'} />
          <div className={styles.info}><Translation>No drills performed within 30 days</Translation></div>
        </div> :
        <div style={{ height: 200 }}>
          <TaskChart data={experimentSummaryInfoList} />
        </div>
      }
    </div>
  );
};

export default TaskInfoDistribute;
