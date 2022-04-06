import React, { FC, memo, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import styles from './index.css';
import { Message } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const Public: FC = () => {
  const dispatch = useDispatch();
  const [ installCmd, setInstallCmd ] = useState<string>('');


  // public
  useEffect(() => {
    (async function() {
      const { Data = { command_install: '' } } = await dispatch.agentSetting.getQueryUninstallAndInstallCommand('QueryInstallCommand', { Mode: 'host', OsType: 0 });
      setInstallCmd(Data && Data.command_install);
    })();
  }, []);

  const copyManualCmd = () => {
    copy(installCmd);
    Message.success('复制成功');
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h1>Linux主机</h1>
      <div className={styles.content}>
        <p style={{ fontSize: '16px' }}>登陆主机，使用root用户执行以下命令</p>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{installCmd}</pre>
        <a onClick={copyManualCmd} style={{ textDecoration: 'none' }}>
        复制命令
        </a>
      </div>
    </div>
  );
};

export default memo(Public);
