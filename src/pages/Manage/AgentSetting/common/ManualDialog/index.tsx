import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import copy from 'copy-to-clipboard';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Dialog, Message } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

interface IPorps {
  pluginType?: string;
  isUninstall?: boolean;
  configurationId?: string;
  onClose: () => void;
  isInstall?: boolean; // 安装高可用探针区分
  isClusterUninstall?: boolean; // 集群探针卸载
  ostype?: number;
  status?: number; // 探针状态，来区分windows操作
}

const ManualDialog: FC<IPorps> = ({ pluginType, isUninstall, configurationId, onClose, isInstall, isClusterUninstall, ostype }) => {
  const dispatch = useDispatch();
  const [ manualCmd, setManualCmd ] = useState<any>('');
  const [ dowloadUrl, setDowloadUrl ] = useState('');

  const fetchManualCmd = useCallback(async () => {
    let action: string;
    const params: any = { Mode: 'host', OsType: ostype };
    if (isUninstall) {
      action = 'QueryUninstallCommand';
    } else {
      action = 'QueryInstallCommand';
    }
    if (!isInstall) {
      params.ConfigurationId = configurationId;
    }
    if (isClusterUninstall) {
      setManualCmd('helm delete --purge agent');
    } else {
      const { Data } = await dispatch.agentSetting.getQueryUninstallAndInstallCommand(action, params);
      // 安装接口返回数据
      Data && Data.command_install && setManualCmd(Data && Data.command_install);
      // 卸载接口返回数据
      Data && Data.command_uninstall && setManualCmd(Data && Data.command_uninstall);
      // windows安装数据
      Data && Data.command_file_download && setDowloadUrl(Data && Data.command_file_download);

    }
  }, [ pluginType, isUninstall, configurationId, isClusterUninstall ]);

  useEffect(() => {
    if (pluginType?.toUpperCase() === 'CHAOS_AGENT' || isInstall) {
      fetchManualCmd();
    }
  }, [ fetchManualCmd ]);

  function renderContent() {
    if (!isUninstall) {
      return <div>
        <div className={styles.title}><Translation>Before. If probes were installed</Translation></div>
        <div className={styles.title}>1. <Translation>Download</Translation></div>
        <div className={styles.item}><Translation>Download link:</Translation> <a href={dowloadUrl} download target='_blank'>{dowloadUrl}</a></div>
        <div className={styles.title}>2. <Translation>Decompress</Translation></div>
        <div className={styles.title}>3. <Translation>Start the probe</Translation></div>
        <div className={styles.code}>{manualCmd}</div>
        <div className={styles.title}><Translation>Parameter Description</Translation>:</div>
        <div className={styles.item}>· appInstance：<Translation>Application name, you can customize</Translation></div>
        <div className={styles.item}>· appGroup： <Translation>Application group name, you can customize it</Translation></div>

        <div className={styles.code}>
          <div className={styles.command}>
            <span>5928 RDP-Tcp#16</span>
            <span>2&emsp;&emsp;&emsp;23,428 K</span>
          </div>
        </div>
      </div>;
    }
    if (isInstall || (isUninstall && !isClusterUninstall)) {
      return (
        <div style={{ position: 'relative' }}>
          <div className={styles.copyBtn}>
            <a onClick={() => onCopy(manualCmd)} ><Translation>Click to copy</Translation></a>
          </div>
          <div style={{ paddingTop: 20 }}>
            {manualCmd}
          </div>
        </div>
      );
    }
    const cmdLong = `blades=($(kubectl get blade | grep -v NAME | awk '{print $1}' | tr '\n' ' ')) && kubectl patch blade $blades --type merge -p '{"metadata":{"finalizers":[]}}'`; // eslint-disable-line
    return (
      <div>
        <div className={styles.item}>1. <Translation>Execute the following Helm command to uninstall the probe</Translation></div>
        {renderCode('helm un agent -n chaosblade', true)}
        <div className={styles.item}>2. <Translation>After the uninstallation is complete, execute the following command to check whether the probe pod in the command space has been uninstalled</Translation></div>
        {renderCode('kubectl get pods -n chaosblade', true)}
        <div className={styles.item}>3. <Translation>If the uninstallation is abnormal, after ensuring that all the drills have been terminated, execute the following command to delete the drill in the abnormal state</Translation></div>
        {renderCode(cmdLong, true)}
        <div className={styles.item}>4. <Translation>After execution, execute the following command to confirm that all chaosblade resources are deleted</Translation><a href={dowloadUrl} download target='_blank'>{dowloadUrl}</a></div>
        {renderCode('kubectl get chaosblade', true)}
      </div>
    );
  }
  const renderCode = (cmd: string, withCopy: boolean) => {
    return (
      <div className={styles.code}>
        {withCopy &&
          <div className={styles.copyBtn}>
            <a onClick={() => onCopy(cmd)} ><Translation>Click to copy</Translation></a>
          </div>
        }
        {cmd}
      </div>
    );
  };
  const onCopy = (cmd: string) => {
    copy(cmd);
    Message.success(i18n.t('Copy successfully'));
  };

  return (
    <Dialog
      visible={true}
      title={isUninstall ? i18n.t('Manually uninstall the plug-in').toString() : i18n.t('Manually install the plug-in on a single machine').toString()}
      footerActions={[ 'cancel' ]}
      style={{ minWidth: '600px' }}
      onClose={onClose}
      onCancel={onClose}
      shouldUpdatePosition
      locale={locale().Dialog}
    >
      <div className={styles.content}>
        {renderContent()}
      </div>
    </Dialog>
  );
};

export default memo(ManualDialog);

