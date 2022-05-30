import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import copy from 'copy-to-clipboard';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
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
    Message.success(i18n.t('Copy successfully'));
  }

  // 渲染footer
  const footer = (
    <Button
      type={'primary'}
      onClick={copyCodeToClipboard}
      disabled={!license}
    >
      <Translation>Copy Licenses</Translation>
    </Button>
  );

  return (
    <Dialog
      {...props}
      title={i18n.t('Tips').toString()}
      style={{ width: '600px' }}
      footer={footer}
      locale={locale().Dialog}
    >
      <div>
        <Translation>Current Environment License</Translation>&nbsp;:&nbsp;
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
