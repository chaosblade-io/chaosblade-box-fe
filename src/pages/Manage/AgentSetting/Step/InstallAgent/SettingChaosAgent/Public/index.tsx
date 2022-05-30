import React, { FC, memo, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import copy from 'copy-to-clipboard';
import i18n from '../../../../../../../i18n';
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
    Message.success(i18n.t('Copy successfully'));
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h1><Translation>Linux host</Translation></h1>
      <div className={styles.content}>
        <p style={{ fontSize: '16px' }}><Translation>Log in to the host and use the root user to execute the following command</Translation></p>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{installCmd}</pre>
        <a onClick={copyManualCmd} style={{ textDecoration: 'none' }}>
          <Translation>copy the command</Translation>
        </a>
      </div>
    </div>
  );
};

export default memo(Public);
