import React, { useEffect, useState } from 'react';
import TaskChart from './TaskChart';
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
        setExperimentSummaryInfoList(_.get(Data, 'experimentSummaryInfoList', []));
        setSuccessSize(_.get(Data, 'successSize', 0));
        setTotalSize(_.get(Data, 'totalSize', 0));
        setUnexpectedSize(_.get(Data, 'unexpectedSize', 0));
      }
    })();
  }, []);


  return (
    <div className={styles.left}>
      <div className={styles.top}>
        <div className={styles.header}>演练执行分布（近30天）</div>
        <div className={styles.total}>
          <span className={styles.itemLeft}>总数</span>
          <span className={styles.itemRight}>{totalSize}</span>
          <span className={styles.itemLeft} style={{ width: 45 }}>成功数</span>
          <span className={styles.itemRight}>{successSize}</span>
          <span className={styles.itemLeft} style={{ width: 80 }}>不符合预期数</span>
          <span className={styles.itemRight}>{unexpectedSize}</span>
        </div>
      </div>
      { _.isEmpty(experimentSummaryInfoList) ?
        <div className={styles.empty}>
          <img src={'https://img.alicdn.com/tfs/TB1fN8awFY7gK0jSZKzXXaikpXa-268-258.png'} />
          <div className={styles.info}>30天内未执行过演练</div>
        </div> :
        <div style={{ height: 200 }}>
          <TaskChart data={experimentSummaryInfoList} />
        </div>
      }
    </div>
  );
};

export default TaskInfoDistribute;
