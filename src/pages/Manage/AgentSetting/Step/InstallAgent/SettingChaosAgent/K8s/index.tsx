import React, { FC, memo, useEffect, useMemo, useState } from 'react';
import Translation from 'components/Translation';
import copy from 'copy-to-clipboard';
import i18n from '../../../../../../../i18n';
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
      Message.success(i18n.t('Copy successfully'));
      return;
    }
    const cmdCopy = verison === 'v2' ? v2 : v3;

    copy(cmdCopy);
    Message.success(i18n.t('Copy successfully'));
  }

  const renderFirstStep = useMemo(() => {
    const [ , addrFormat = '' ] = installHelmPackageAddr.split(' ');
    return (
      <div>
        <div>
          <p>
            <Translation>Helm chart package</Translation>
            <a href={addrFormat?.replace(/http:\/\//, 'https://')}>
              <Translation>Manual download</Translation>
            </a>
          </p>
          <p>
            <Translation>Or</Translation>
          </p>
          <p>
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
          <p><Translation>Helm v2 install probe</Translation></p>
          <div className={styles.codeBox}>
            <p>{v2}</p>
            <div className={styles.codeCopy} onClick={() => copyManualCmd('v2')}>
              <Icon type="copy" className={styles.copyIcon} />
            </div>
          </div>
        </div>
        <div>
          <p><Translation>Helm v3 install probe</Translation></p>
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
      { title: i18n.t('Step one').toString(), content: renderFirstStep },
      { title: i18n.t('Step two').toString(), content: renderSecondStep },
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
