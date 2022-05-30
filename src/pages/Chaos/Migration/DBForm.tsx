import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../i18n';
import styles from './index.css';

import { Button, Input, Message } from '@alicloud/console-components';

import { useDispatch } from 'utils/libs/sre-utils-dva';

interface Props {
  info: any;
  onChange: (params) => void;
}

const DBForm: React.FC<Props> = props => {
  const { info, onChange } = props;
  const dispatch = useDispatch();
  const [ dbInfo, setDbInfo ] = useState<any>(info || {});
  const [ resultInfo, setResultInfo ] = useState<any>(null);

  useEffect(() => {
    if (info) {
      setDbInfo(info);
    }
  }, [ info ]);
  useEffect(() => {
    onChange(dbInfo);
  }, [ dbInfo ]);
  // 检测数据库账号
  const checkDb = async () => {
    const { account, password, host, port } = dbInfo;
    if (!account) {
      return Message.error(i18n.t('Please enter Mysql username'));
    }
    if (!password) {
      return Message.error(i18n.t('Please enter Mysql password'));
    }
    if (!host) {
      return Message.error(i18n.t('Please enter Mysql IP address'));
    }
    if (!port) {
      return Message.error(i18n.t('Please enter Mysql port'));
    }
    const res = await dispatch.migration.checkDbAccount(dbInfo);
    if (res) {
      onChange({ ...dbInfo, pass: true });
      setResultInfo({ pass: true, msg: i18n.t('Verified') });
    } else {
      onChange({ ...dbInfo, pass: false });
      setResultInfo({ pass: false, msg: i18n.t('Verification failed') });
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.formItem}>
        <div className={styles.label}><Translation>Username</Translation></div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.account} onChange={val => setDbInfo({ ...dbInfo, account: val })} />
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}><Translation>Password</Translation></div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.password} onChange={val => setDbInfo({ ...dbInfo, password: val })}/>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}><Translation>IP address</Translation></div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.host} onChange={val => setDbInfo({ ...dbInfo, host: val })}/>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}><Translation>port</Translation></div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.port} onChange={val => setDbInfo({ ...dbInfo, port: val })}/>
      </div>
      <div style={{ textAlign: 'right', marginBottom: 42 }}>
        {resultInfo && <span style={{ color: resultInfo.pass ? 'green' : 'red' }}>{resultInfo.msg}</span>}
        <Button type="primary" size="small" onClick={() => checkDb()}><Translation>Verify connection</Translation></Button>
      </div>
    </div>
  );
};

export default DBForm;
