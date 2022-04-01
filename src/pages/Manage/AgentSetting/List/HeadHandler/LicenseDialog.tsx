import React, { FC, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import { Button, Dialog, Message } from '@alicloud/console-components';
import { DialogProps } from '@alicloud/console-components/types/dialog';
import { useDispatch } from 'utils/libs/sre-utils-dva';

interface LicenseProps extends DialogProps {
  visible: boolean;
  onClose: () => void;
}

const SystemLicenseDialog: FC<LicenseProps> = props => {
  const dispatch = useDispatch();
  const { onClose } = props;
  const [ license, setLicense ] = useState<string>('');

  useEffect(() => {
    queryLicenseKey();
  }, []);

  // 请求license
  async function queryLicenseKey() {
    const { Data: licenseKey = '' } = await dispatch.agentSetting.getQueryLicenseKey({
      params: {},
      region: 'public',
    });
    setLicense(licenseKey);
  }

  // 复制license
  function copyCodeToClipboard() {
    copy(license);
    onClose();
    Message.success('复制成功');
  }

  // 渲染footer
  const footer = (
    <Button
      type={'primary'}
      onClick={copyCodeToClipboard}
      disabled={!license}
    >
      复制 Licenses
    </Button>
  );

  return (
    <Dialog
      {...props}
      title={'温馨提示'}
      style={{ width: '600px' }}
      footer={footer}
    >
      <div>当前环境 License&nbsp;:&nbsp;
        <span
          id="licenseVal"
          style={{ color: '#0070CC' }}
        >
          {license}
        </span>
      </div>
    </Dialog>
  );
};

export default SystemLicenseDialog;
