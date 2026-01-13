import React, { FC, memo, useEffect, useMemo, useState } from 'react';
import Translation from 'components/Translation';
import copy from 'copy-to-clipboard';
import i18n from '../../../../../../../i18n';
import styles from './index.css';
import { Icon, Message, Radio, Step } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

type ArchType = 'amd64' | 'arm64';

const K8s: FC = () => {
  const dispatch = useDispatch();
  const [ v2, setV2 ] = useState<string>('');
  const [ v3, setV3 ] = useState<string>('');
  const [ v2Arm64, setV2Arm64 ] = useState<string>('');
  const [ v3Arm64, setV3Arm64 ] = useState<string>('');
  const [ installHelmPackageAddr, setInstallHelmPackageAddr ] = useState<string>('');
  const [ installHelmPackageAddrArm64, setInstallHelmPackageAddrArm64 ] = useState<string>('');
  const [ selectedArch, setSelectedArch ] = useState<ArchType>('amd64');

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
    const cmd = Data && Data.command_install;
    if (verison === 'v2') {
      setV2(cmd);
      // Generate arm64 command by replacing image version tag
      // For arm64 architecture, add -arm64 suffix to version tag
      // Repository name remains the same: ghcr.io/chaosblade-io/chaosblade-box-agent
      if (cmd) {
        const arm64Cmd = cmd
          // Replace --set images.chaos.version= pattern
          .replace(/--set images\.chaos\.version=([^,\s]+)/g, (match, version) => {
            // Add -arm64 suffix to version for arm64 architecture, but avoid duplicate suffix
            const versionWithoutSuffix = version.replace(/-arm64$/, '');
            return `--set images.chaos.version=${versionWithoutSuffix}-arm64`;
          })
          // Replace ,images.chaos.version= pattern (for helm v3 style)
          .replace(/,images\.chaos\.version=([^,\s]+)/g, (match, version) => {
            // Add -arm64 suffix to version for arm64 architecture, but avoid duplicate suffix
            const versionWithoutSuffix = version.replace(/-arm64$/, '');
            return `,images.chaos.version=${versionWithoutSuffix}-arm64`;
          });
        setV2Arm64(arm64Cmd);
      }
    } else {
      setV3(cmd);
      // Generate arm64 command by replacing image version tag
      // For arm64 architecture, add -arm64 suffix to version tag
      // Repository name remains the same: ghcr.io/chaosblade-io/chaosblade-box-agent
      if (cmd) {
        const arm64Cmd = cmd
          // Replace --set images.chaos.version= pattern
          .replace(/--set images\.chaos\.version=([^,\s]+)/g, (match, version) => {
            // Add -arm64 suffix to version for arm64 architecture, but avoid duplicate suffix
            const versionWithoutSuffix = version.replace(/-arm64$/, '');
            return `--set images.chaos.version=${versionWithoutSuffix}-arm64`;
          })
          // Replace ,images.chaos.version= pattern (for helm v3 style)
          .replace(/,images\.chaos\.version=([^,\s]+)/g, (match, version) => {
            // Add -arm64 suffix to version for arm64 architecture, but avoid duplicate suffix
            const versionWithoutSuffix = version.replace(/-arm64$/, '');
            return `,images.chaos.version=${versionWithoutSuffix}-arm64`;
          });
        setV3Arm64(arm64Cmd);
      }
    }
  }

  async function fetchHelmPackageAddress() {
    const { Data = '' } = await dispatch.agentSetting.getQueryHelmPackageAddress();
    setInstallHelmPackageAddr(Data);
    // Generate arm64 helm package address by replacing architecture suffix
    // Replace -helm_amd64.tgz with -helm_arm64.tgz in both URL and output filename
    if (Data) {
      const arm64Addr = Data
        .replace(/-helm_amd64\.tgz/g, '-helm_arm64.tgz')
        .replace(/chaosblade-box-agent-([\d.]+)-helm_amd64\.tgz/g, 'chaosblade-box-agent-$1-helm_arm64.tgz');
      setInstallHelmPackageAddrArm64(arm64Addr);
    } else {
      setInstallHelmPackageAddrArm64(Data);
    }
  }

  function copyManualCmd(verison?: string, code?: string) {
    if (!verison && code) {
      copy(code);
      Message.success(i18n.t('Copy successfully'));
      return;
    }
    let cmdCopy: string;
    if (verison === 'v2') {
      cmdCopy = selectedArch === 'amd64' ? v2 : v2Arm64;
    } else {
      cmdCopy = selectedArch === 'amd64' ? v3 : v3Arm64;
    }

    copy(cmdCopy);
    Message.success(i18n.t('Copy successfully'));
  }

  const handleArchChange = (value: string | number | boolean) => {
    setSelectedArch(value as ArchType);
  };

  const renderFirstStep = useMemo(() => {
    const currentHelmAddr = selectedArch === 'amd64' ? installHelmPackageAddr : installHelmPackageAddrArm64;
    const [ , addrFormat = '' ] = currentHelmAddr.split(' ');
    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 'bold' }}>
            <Translation>Select architecture</Translation>:
          </p>
          <Radio.Group value={selectedArch} onChange={handleArchChange}>
            <Radio value="amd64"><Translation>AMD64 (x86_64)</Translation></Radio>
            <Radio value="arm64"><Translation>ARM64 (aarch64)</Translation></Radio>
          </Radio.Group>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            <Translation>Please select the architecture that matches your Kubernetes cluster nodes</Translation>
          </p>
        </div>
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
              <p>{currentHelmAddr}</p>
              <div className={styles.codeCopy} onClick={() => copyManualCmd(undefined, currentHelmAddr)}>
                <Icon type="copy" className={styles.copyIcon} />
              </div>
            </div>
          </p>
        </div>
      </div>
    );
  }, [ installHelmPackageAddr, installHelmPackageAddrArm64, selectedArch ]);

  const renderSecondStep = useMemo(() => {
    const currentV2 = selectedArch === 'amd64' ? v2 : v2Arm64;
    const currentV3 = selectedArch === 'amd64' ? v3 : v3Arm64;
    return (
      <>
        <div>
          <p><Translation>Helm v2 install probe</Translation></p>
          <div className={styles.codeBox}>
            <p>{currentV2}</p>
            <div className={styles.codeCopy} onClick={() => copyManualCmd('v2')}>
              <Icon type="copy" className={styles.copyIcon} />
            </div>
          </div>
        </div>
        <div>
          <p><Translation>Helm v3 install probe</Translation></p>
          <div className={styles.codeBox}>
            <p>{currentV3}</p>
            <div className={styles.codeCopy} onClick={() => copyManualCmd('v3')}>
              <Icon type="copy" className={styles.copyIcon} />
            </div>
          </div>
        </div>
      </>
    );
  }, [ v2, v3, v2Arm64, v3Arm64, selectedArch ]);


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
