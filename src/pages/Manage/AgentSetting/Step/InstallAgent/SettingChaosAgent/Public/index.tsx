import React, { FC, memo, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import copy from 'copy-to-clipboard';
import i18n from '../../../../../../../i18n';
import styles from './index.css';
import { Message, Radio } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

type ArchType = 'amd64' | 'arm64';

const Public: FC = () => {
  const dispatch = useDispatch();
  const [ installCmd, setInstallCmd ] = useState<string>('');
  const [ selectedArch, setSelectedArch ] = useState<ArchType>('amd64');
  const [ installCmdAmd64, setInstallCmdAmd64 ] = useState<string>('');
  const [ installCmdArm64, setInstallCmdArm64 ] = useState<string>('');

  // Fetch installation commands for both architectures
  useEffect(() => {
    (async function() {
      // Fetch amd64 command (default)
      const { Data: DataAmd64 = { command_install: '' } } = await dispatch.agentSetting.getQueryUninstallAndInstallCommand('QueryInstallCommand', { Mode: 'host', OsType: 0 });
      const amd64Cmd = DataAmd64 && DataAmd64.command_install;
      setInstallCmdAmd64(amd64Cmd);

      // Generate arm64 command by replacing URL in the command
      // Replace the download URL from amd64 to arm64 format
      if (amd64Cmd) {
        // Replace patterns like: chaosagent-{version}-linux_amd64.tar.gz -> chaosagent-{version}-linux_arm64.tar.gz
        const arm64Cmd = amd64Cmd
          .replace(/chaosagent-[\d.]+-linux_amd64\.tar\.gz/g, match => match.replace('linux_amd64', 'linux_arm64'))
          .replace(/linux_amd64/g, 'linux_arm64');
        setInstallCmdArm64(arm64Cmd);
      }
    })();
  }, []);

  // Update displayed command when architecture changes
  useEffect(() => {
    if (selectedArch === 'amd64') {
      setInstallCmd(installCmdAmd64 || '');
    } else {
      setInstallCmd(installCmdArm64 || '');
    }
  }, [ selectedArch, installCmdAmd64, installCmdArm64 ]);

  const copyManualCmd = () => {
    copy(installCmd);
    Message.success(i18n.t('Copy successfully'));
  };

  const handleArchChange = (value: string | number | boolean) => {
    setSelectedArch(value as ArchType);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h1><Translation>Linux host</Translation></h1>
      <div className={styles.content}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
            <Translation>Select architecture</Translation>:
          </p>
          <Radio.Group value={selectedArch} onChange={handleArchChange}>
            <Radio value="amd64"><Translation>AMD64 (x86_64)</Translation></Radio>
            <Radio value="arm64"><Translation>ARM64 (aarch64)</Translation></Radio>
          </Radio.Group>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            <Translation>Please select the architecture that matches your host system</Translation>
          </p>
        </div>
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
