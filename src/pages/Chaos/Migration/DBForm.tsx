import React, { memo, useEffect, useState } from 'react';

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
  const [ dbInfo, setDbInfo ] = useState<any>({ });
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
      return Message.error('请输入Mysql用户名！');
    }
    if (!password) {
      return Message.error('请输入Mysql密码！');
    }
    if (!host) {
      return Message.error('请输入Mysql IP地址！');
    }
    if (!port) {
      return Message.error('请输入Mysql 端口！');
    }
    const res = await dispatch.migration.checkDbAccount(dbInfo);
    if (res) {
      onChange({ ...dbInfo, pass: true });
      setResultInfo({ pass: true, msg: '验证通过！' });
    } else {
      onChange({ ...dbInfo, pass: false });
      setResultInfo({ pass: false, msg: '验证失败！' });
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.formItem}>
        <div className={styles.label}>用户名</div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.account} onChange={val => setDbInfo({ ...dbInfo, account: val })} />
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>密码</div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.password} onChange={val => setDbInfo({ ...dbInfo, password: val })}/>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>IP地址</div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.host} onChange={val => setDbInfo({ ...dbInfo, host: val })}/>
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>端口</div>
        <Input style={{ flexGrow: 1 }} defaultValue={dbInfo.port} onChange={val => setDbInfo({ ...dbInfo, port: val })}/>
      </div>
      <div style={{ textAlign: 'right', marginBottom: 42 }}>
        {resultInfo && <span style={{ color: resultInfo.pass ? 'green' : 'red' }}>{resultInfo.msg}</span>}
        <Button type="primary" size="small" onClick={() => checkDb()}>验证连接</Button>
      </div>
    </div>
  );
};

export default memo(DBForm);
