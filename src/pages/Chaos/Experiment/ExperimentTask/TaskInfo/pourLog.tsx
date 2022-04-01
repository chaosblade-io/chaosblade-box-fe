import React, { memo, useState } from 'react';
import formatDate from 'pages/Chaos/lib/DateUtil';
import styles from './index.css';
import { Icon, Pagination } from '@alicloud/console-components';

interface Props {
  datas: any[];
  ip: string;
  expId: string;
}

const PourLog: React.FC<Props> = props => {
  const { datas, ip, expId } = props;
  const pageSize = 10;
  const [ page, setPage ] = useState(1);
  const showData = datas.length > pageSize ? datas.slice((page - 1) * pageSize, page * pageSize) : datas;
  return (
    <div className={styles.pourLogs}>
      <div className={styles.logHeader}><strong>IP:</strong> {ip} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>执行ID:</strong> {expId}
        <span className={styles.pullRight} style={{ color: '#5a5a5a', lineHeight: '22px' }}><Icon type="warning" size='xs'/> 需要开启debug模式才能查看！</span>
      </div>
      <div className={styles.logContent}>
        {showData?.length > 0 &&
          showData.map(item => {
            const { type, injectionTime, pid, detailMessage } = item || {};
            return (
              <div key={injectionTime}>
                <div className={styles.logTitle} >
                  <strong><strong>类型：</strong>{type}</strong>
                  <div className={styles.pullRight}>注入时间：{formatDate(Number(injectionTime))}</div>
                </div>
                <div className={styles.logDesp}>
                  <strong>进程ID：</strong>{pid || '未知'}<br/>
                  <strong>错误：</strong>{detailMessage}
                </div>
              </div>
            );
          })
        }
      </div>
      { datas.length > pageSize &&
        <Pagination
          className="custom-pagination"
          total={datas?.length || 0}
          totalRender={total => `总数: ${total}`}
          showJump={false}
          onChange={currPage => setPage(currPage)}
        />
      }
    </div>
  );
};

export default memo(PourLog);
