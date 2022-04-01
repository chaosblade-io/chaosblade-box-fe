import React, { memo, useState } from 'react';

import styles from './index.css';
import { Message } from '@alicloud/console-components';
import { notifyConf } from './constants';

/** 公告信息 */
const NotifyLs: React.FC = () => {
  const [ showMore, setShowMore ] = useState<string[]>([]);
  const onMoreMsg = (flag: string) => {
    if (showMore.includes(flag)) {
      setShowMore(showMore.filter(item => item !== flag));
    } else {
      setShowMore([ ...showMore, flag ]);
    }
  };
  const renderMsg = (flag: string) => {
    const datas = notifyConf[flag];
    return (
      <div className={styles.msgs}>
        {datas?.map((item:any, index: number) => {
          if (!showMore.includes(flag) && index > 5) {
            return;
          }
          const { name, url } = item;
          if (index === 0) {
            return (
              <Message type="notice" style={{ marginBottom: '12px' }} key={index}>
                <div><strong><a href={url} target={url ? '_blank' : ''} className={styles.moreLink} style={{ textDecoration: 'none' }}>{name}</a></strong></div>
              </Message>
            );
          }
          return (
            <div key={index} style={{ fontWeight: index === 0 ? 'bold' : 'unset' }}><a href={url} target="_blank" >{name}</a></div>
          );
        })}
        {datas?.length > 5 &&
          <div className={styles.moreLink} onClick={() => onMoreMsg(flag)}>查看更多</div>
        }
      </div>
    );
  };
  return (
    <>
      <div className={styles.segment}>
        <div className={styles.header}>
          <div className={styles.title}>消息通知</div>
        </div>
        {renderMsg('messageLs')}
      </div>
      <div className={styles.segment}>
        <div className={styles.header}>
          <div className={styles.title}>最佳实践</div>
        </div>
        {renderMsg('practiceLs')}
      </div>
    </>
  );
};

export default memo(NotifyLs);
