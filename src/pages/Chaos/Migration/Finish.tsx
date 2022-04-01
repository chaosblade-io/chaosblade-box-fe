import React, { memo } from 'react';

import styles from './index.css';

import { Button, Icon } from '@alicloud/console-components';

// import { useDispatch } from 'utils/libs/sre-utils-dva';

const Index: React.FC = () => {
  // const dispatch = useDispatch();

  return (
    <div className={styles.finish}>
      <div className={styles.tips}>
        <div className={styles.pHeader} style={{ color: 'green' }}><Icon type="check-circle" /> 数据迁移成功</div>
        <div className={styles.desp}>数据迁移成功后，可以跳转公有云查看！</div>
      </div>
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <a href="https://ahas.console.aliyun.com/index" target="_blank"><Button type="primary">登陆公共云</Button></a>
      </div>
    </div>
  );
};

export default memo(Index);
