import React, { memo, useEffect, useState } from 'react';

import styles from './index.css';

import { Button, Checkbox, Message } from '@alicloud/console-components';

import { useDispatch } from 'utils/libs/sre-utils-dva';

import CloudForm from './CloudForm';
import DbForm from './DBForm';

// import { IConfigInfo } from 'config/interfaces/Chaos/migration';

interface Props {
  onChangeStep: (step: number) => void;
}

const Setting: React.FC<Props> = props => {
  const { onChangeStep } = props;
  const dispatch = useDispatch();
  const [ configInfo, setConfigInfo ] = useState<any|{}>({ cloudInfo: null, dbInfo: null, experiment_flag: false, expertise_flag: false });
  const [ loading, setLoading ] = useState(false);
  useEffect(() => {
    getConf();
  }, []);
  const getConf = async () => {
    const res = await dispatch.migration.getMigrationConf();
    if (res) {
      const info = {
        cloudInfo: {
          account: res.cloudAccount,
          password: res.cloudPassword,
        },
        dbInfo: {
          account: res.dbAccount,
          password: res.dbPassword,
          host: res.dbHost,
          port: res.dbPort,
        },
        experiment_flag: res.experimentFlag,
        expertise_flag: res.expertiseFlag,
      };
      setConfigInfo(info);
    } else {
      Message.error('获取配置信息失败!');
    }
  };
  const onSubmit = async () => {
    const { cloudInfo, dbInfo, experiment_flag, expertise_flag } = configInfo || {};
    if (cloudInfo === null) {
      return Message.error('请填写公有云账号！');
    }
    if (!cloudInfo) {
      return Message.error('公有云账号校验未通过！');
    }
    if (!experiment_flag && !expertise_flag) {
      return Message.error('请选择迁移选项！');
    }
    if (!dbInfo === null) {
      return Message.error('请填写Mysql配置！');
    }
    if (!dbInfo.hasOwnProperty('pass')) {
      return Message.error('请填写Mysql并校验配置！');
    }
    if (!dbInfo?.pass) {
      return Message.error('Mysql配置校验未通过！');
    }
    const params = {
      cloud_account: cloudInfo.account,
      cloud_password: cloudInfo.password,
      experiment_flag,
      expertise_flag,
      db_account: dbInfo.account,
      db_password: dbInfo.password,
      db_host: dbInfo.host,
      db_port: dbInfo.port,
    };
    setLoading(true);
    const res = await dispatch.migration.saveMigrationConf(params);
    if (res) {
      const res = await dispatch.migration.startMigration({ migration_flag: '' });
      if (res) {
        Message.success('配置数据保存成功，开始迁移！');
        onChangeStep(1);
        setLoading(false);
      } else {
        Message.error('迁移失败！');
        setLoading(false);
      }
    } else {
      Message.error('配置数据保存失败！');
      setLoading(false);
    }
  };

  return (
    <div className={styles.setting}>
      <div className={styles.header}>公有云账号AK/SK绑定<span style={{ fontSize: 12, color: '#666', marginLeft: 8, fontWeight: 400 }}>没有账号，<a style={{ color: '#0070cc' }} href="https://account.aliyun.com/register/register.htm" target="_blank">立即注册！</a></span></div>
      <CloudForm info={configInfo.cloudInfo} onChange={params => setConfigInfo({ ...configInfo, cloudInfo: params })} />
      <div className={styles.header}>迁移选项</div>
      <div className={styles.content}>
        <div className={styles.formItem}>
          <div className={styles.label}>迁移演练数据</div>
          <Checkbox checked={configInfo.experiment_flag} onChange={checked => setConfigInfo({ ...configInfo, experiment_flag: checked })} />
        </div>
        {/* <div className={styles.formItem}>
          <div className={styles.label}>迁移演练经验库</div>
          <Checkbox checked={configInfo.expertise_flag} onChange={checked => setConfigInfo({ ...configInfo, expertise_flag: checked })} />
        </div> */}
      </div>
      {(configInfo.experiment_flag || configInfo.expertise_flag) &&
        <>
          <div className={styles.header}>Mysql配置</div>
          <DbForm info={configInfo.dbInfo} onChange={params => setConfigInfo({ ...configInfo, dbInfo: params })} />
        </>
      }
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" loading={loading} onClick={() => onSubmit()}>确定迁移数据</Button>
      </div>
    </div>
  );
};

export default memo(Setting);
