import React, { FC, memo, useEffect, useMemo, useState } from 'react';

import copy from 'copy-to-clipboard';
import styles from './index.css';
import { Icon, Message, Step } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const K8s: FC = () => {
  const dispatch = useDispatch();
  const [ v2, setV2 ] = useState<string>('');
  const [ v3, setV3 ] = useState<string>('');
  const [ installHelmPackageAddr, setInstallHelmPackageAddr ] = useState<string>('');

  // k8s
  useEffect(() => {
    fetchCmd('v2');
    fetchCmd('v3');
    fetchHelmPackageAddress();
  }, []);

  async function fetchCmd(verison: string) {
    const { Data = {} } = await dispatch.agentSetting.getQueryUninstallAndInstallCommand('QueryInstallCommand', {
      Mode: 'k8s_helm',
      helmVersion: verison,
    });
    if (verison === 'v2') {
      setV2(Data && Data.command_install);
    } else {
      setV3(Data && Data.command_install);
    }
  }

  async function fetchHelmPackageAddress() {
    const { Data = '' } = await dispatch.agentSetting.getQueryHelmPackageAddress();
    setInstallHelmPackageAddr(Data);
  }

  function copyManualCmd(verison?: string, code?: string) {
    if (!verison && code) {
      copy(code);
      Message.success('复制成功');
      return;
    }
    const cmdCopy = verison === 'v2' ? v2 : v3;

    copy(cmdCopy);
    Message.success('复制成功');
  }

  const renderFirstStep = useMemo(() => {
    const [ , addrFormat = '' ] = installHelmPackageAddr.split(' ');
    return (
      <div>
        <div>
          <p>
            Helm chart包
            <a href={addrFormat?.replace(/http:\/\//, 'https://')}>
              手动下载
            </a>
          </p>
          <p>或</p>
          <p>
            Helm chart包wget方式下载，注意不同 region 的下载地址不一样：
            <div className={styles.codeBox}>
              <p>{installHelmPackageAddr}</p>
              <div className={styles.codeCopy} onClick={() => copyManualCmd(undefined, installHelmPackageAddr)}>
                <Icon type="copy" className={styles.copyIcon} />
              </div>
            </div>
          </p>
        </div>
      </div>
    );
  }, [ installHelmPackageAddr ]);

  const renderSecondStep = useMemo(() => {
    return (
      <>
        <div>
          <p>Helm v2 安装探针</p>
          <div className={styles.codeBox}>
            <p>{v2}</p>
            <div className={styles.codeCopy} onClick={() => copyManualCmd('v2')}>
              <Icon type="copy" className={styles.copyIcon} />
            </div>
          </div>
        </div>
        <div>
          <p>Helm v3 安装探针</p>
          <div className={styles.codeBox}>
            <p>{v3}</p>
            <div className={styles.codeCopy} onClick={() => copyManualCmd('v3')}>
              <Icon type="copy" className={styles.copyIcon} />
            </div>
          </div>
        </div>
      </>
    );
  }, [ v2, v3 ]);


  const renderStep = useMemo(() => {
    const steps = [
      { title: '步骤一', content: renderFirstStep },
      { title: '步骤二', content: renderSecondStep },
    ];
    return steps.map((v, i) => <Step.Item status='process' key={i} title={v.title} content={v.content} />);
  }, [ renderFirstStep, renderSecondStep ]);

  return (
    <div className={styles.content}>
      <Step
        direction="ver"
        shape="circle"
        animation={false}
        readOnly={true}
      >
        {renderStep}
      </Step>
    </div>
  );
};

export default memo(K8s);
