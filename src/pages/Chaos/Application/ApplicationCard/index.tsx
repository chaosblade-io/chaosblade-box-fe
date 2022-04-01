import React, { FC } from 'react';
import styles from './index.css';
import { SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';

interface IProps {
  data: any;
  onClick: (data: any) => void;
}

const ApplicationCard: FC<IProps> = props => {
  const { data } = props;

  function renderType() {
    const { app_type } = data;
    if (app_type === SCOPE_TYPE.HOST) {
      return '主机';
    }
    return 'Kubernetes';
  }

  return (
    <div className={styles.card} onClick={() => props.onClick(props.data)}>
      <div className={styles.topContent}>
        <div className={styles.cardTitle} title={data && data.app_name}>
          {data && data.app_name}
        </div>
        <div className={styles.typeTip}>类型：{renderType()}</div>
      </div>
      <div className={styles.bottomContent}>
        <div className={styles.item}>
          <div className={styles.label}>机器</div>
          <div className={styles.value}>{data && data.machine_count}<span className={styles.unit}>台</span></div>
        </div>
        <div className={styles.item}>
          <div className={styles.label}>演练执行</div>
          <div className={styles.value}>{parseInt(data && data.experiment_task_count).toLocaleString()}<span className={styles.unit}>次</span></div>
        </div>
        {/* <div className={styles.item}>
          <div className={styles.label}>演练场景</div>
          <div className={styles.value}>{parseInt(data && data.scene_function_count).toLocaleString()}<span className={styles.unit}>个</span></div>
        </div> */}
      </div>
    </div>
  );
};

export default ApplicationCard;
