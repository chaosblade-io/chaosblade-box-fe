import React, { FC, useState } from 'react';

import { Balloon, Button } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

import styles from './index.css';

const MyHeader: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const loginInfo = useSelector(({ loginUser }) => loginUser);

  const [ visible, setVisible ] = useState<boolean>(false);

  const logout = async () => {
    const res = await dispatch.loginUser.onLoginout();
    if (res) {
      pushUrl(history, '/login');
    }
  };
  const notLogin = location.pathname === '/login' || !loginInfo?.userName;
  return (
    <div className={styles.myHeader}>
      <div className={ styles.mhContent}>
        <div className={styles.logo}><img src={require('../../imgs/logo.png')}/></div>
        <div>
          <Balloon
            align="bl"
            visible={visible}
            trigger={<div className={styles.userInfo}>{notLogin ? '未登录' : loginInfo?.userName || '未登录'}</div>}
            triggerType="hover"
            onClose={() => setVisible(false)}
            onVisibleChange={setVisible}
          >
            <div style={{ width: '266px' }}>
              <div>用户名</div>
              <br />
              <Button type="primary" style={{ width: '266px' }} onClick={logout}>退出登录</Button>
            </div>
          </Balloon>
        </div>
      </div>
    </div>
  );
};

export default MyHeader;
