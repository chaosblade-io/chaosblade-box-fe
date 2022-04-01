import React, { FC } from 'react';
import styles from './index.css';
import { Icon } from '@alicloud/console-components';


interface IProps {
  statisitcInfo: any;
}

const Statistic: FC<IProps> = props => {

  const { statisitcInfo = {} } = props;
  const { total, active, running, failure, success, idle } = statisitcInfo;


  function renderSvgTip() {
    return (
      <svg width="70px" height="18px" viewBox="0 0 70 18" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="故障演练列表" transform="translate(-639.000000, -154.000000)">
            <g id="演练状态" transform="translate(639.000000, 154.000000)">
              <path d="M-1.42108547e-14,0 L70,0 L65.813729,15.0705755 C65.3328182,16.8018545 63.7564886,18 61.9596574,18 L8.0403426,18 C6.24351138,18 4.66718181,16.8018545 4.18627096,15.0705755 L-1.42108547e-14,0 L-1.42108547e-14,0 Z" id="Rectangle" fill="#A5C3DE"></path>
              <text fontFamily="PingFangSC-Regular, PingFang SC" fontSize="12" fontWeight="normal" fill="#FFFFFF">
                <tspan x="11" y="14">演练状态</tspan>
              </text>
            </g>
          </g>
        </g>
      </svg>
    );
  }


  return (
    <div className={styles.wrapper}>
      <div className={styles.statisticDone}>
        <div className={styles.doneBox}>
          <div className={styles.title}>执行过的演练</div>
          <span className={styles.number}>{active}</span>
        </div>
        <div className={styles.separator}></div>
        <div className={styles.detailBox}>
          <div className={styles.topTip}>
            {renderSvgTip()}
          </div>
          <div className={styles.failedBox}>
            <Icon type="exclamation-circle" className={styles.icon} size="small" />
            <span>失败：</span>
            <span className={styles.detailFont}>{failure}</span>
          </div>
          <div className={styles.runningBox}>
            <Icon type="clock" className={styles.icon} size="small" />
            <span>运行中：</span>
            <span className={styles.detailFont}>{running}</span>
          </div>
          <div className={styles.successBox}>
            <Icon type="check-circle" className={styles.icon} size="small" />
            <span>成功：</span>
            <span className={styles.detailFont}>{success}</span>
          </div>
        </div>
      </div>
      <div className={styles.statisticUnDone}>
        <div className={styles.title}>未执行的演练</div>
        <span className={styles.number}>{idle}</span>
      </div>
      <div className={styles.statisticTotal}>
        <div className={styles.title}>总演练数</div>
        <span className={styles.number}>{total}</span>
      </div>
    </div>
  );
};

export default Statistic;
