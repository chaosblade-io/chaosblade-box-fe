import React, { memo, useState } from 'react';
import Translation from 'components/Translation';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
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
      <div className={styles.logHeader}><strong>IP:</strong> {ip} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong><Translation>Execution ID</Translation>: </strong> {expId}
        <span className={styles.pullRight} style={{ color: '#5a5a5a', lineHeight: '22px' }}><Icon type="warning" size='xs'/><Translation>Need to enable debug mode to view</Translation></span>
      </div>
      <div className={styles.logContent}>
        {showData?.length > 0 &&
          showData.map(item => {
            const { type, injectionTime, pid, detailMessage } = item || {};
            return (
              <div key={injectionTime}>
                <div className={styles.logTitle} >
                  <strong><strong><Translation>Type</Translation>: </strong>{type}</strong>
                  <div className={styles.pullRight}><Translation>Injection time</Translation>: {formatDate(Number(injectionTime))}</div>
                </div>
                <div className={styles.logDesp}>
                  <strong><Translation>Process ID</Translation>: </strong>{pid || i18n.t('Unknown')}<br/>
                  <strong><Translation>Mistake</Translation>: </strong>{detailMessage}
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
          locale={locale().Pagination}
          showJump={false}
          onChange={currPage => setPage(currPage)}
        />
      }
    </div>
  );
};

export default memo(PourLog);
