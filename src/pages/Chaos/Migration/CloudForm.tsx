import React, { memo, useEffect, useState } from 'react';

import styles from './index.css';

import { Input } from '@alicloud/console-components';

// import { Button, Input, Message } from '@alicloud/console-components';

// import { useDispatch } from 'utils/libs/sre-utils-dva';

interface Props {
  info: any;
  onChange: (params) => void;
}

const CloudForm: React.FC<Props> = props => {
  const { info, onChange } = props;
  // const dispatch = useDispatch();
  const [ cloudInfo, setCloudInfo ] = useState<any>({});
  // const [ resultInfo, setResultInfo ] = useState<any>(null);

  useEffect(() => {
    if (info) {
      setCloudInfo(info);
    }
  }, [ info ]);
  useEffect(() => {
    onChange(cloudInfo);
  }, [ cloudInfo ]);
  // 检验公有云账号
  // const checkCloud = async () => {
  //   const { account, password } = cloudInfo;
  //   if (!account) {
  //     return Message.error('请输入公有云账号！');
  //   }
  //   if (!password) {
  //     return Message.error('请输入公有云密码！');
  //   }
  //   const res = await dispatch.migration.checkCloudAccount(cloudInfo);
  //   if (res) {
  //     setResultInfo({ pass: true, msg: '验证通过！' });
  //     onChange(cloudInfo);
  //   } else {
  //     onChange(false);
  //     setResultInfo({ pass: false, msg: '验证失败！' });
  //   }
  // };

  return (
    <div className={styles.content}>
      <div className={styles.formItem}>
        <div className={styles.label}>AK</div>
        <Input style={{ flexGrow: 1 }} value={cloudInfo.account} onChange={val => setCloudInfo({ ...cloudInfo, account: val })} />
      </div>
      <div className={styles.formItem}>
        <div className={styles.label}>SK</div>
        <Input style={{ flexGrow: 1 }} value={cloudInfo.password} onChange={val => setCloudInfo({ ...cloudInfo, password: val })} />
      </div>
      {/* <div style={{ textAlign: 'right', marginBottom: 32 }}>
        {resultInfo && <span style={{ color: resultInfo.pass ? 'green' : 'red' }}>{resultInfo.msg}</span>}
        <Button type="primary" size="small" onClick={() => checkCloud()}>验证账号</Button>
      </div> */}
    </div>
  );
};

export default memo(CloudForm);
