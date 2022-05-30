import React, { memo, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../i18n';
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
  // useEffect(() => {
  //   getConf();
  // }, []);
  // const getConf = async () => {
  //   const res = await dispatch.migration.getMigrationConf();
  //   if (res) {
  //     const info = {
  //       cloudInfo: {
  //         account: res.cloudAk,
  //         password: res.cloudSk,
  //       },
  //       dbInfo: {
  //         account: res.dbAccount,
  //         password: res.dbPassword,
  //         host: res.dbHost,
  //         port: res.dbPort,
  //       },
  //       experiment_flag: res.experimentFlag,
  //       expertise_flag: res.expertiseFlag,
  //     };
  //     setConfigInfo(info);
  //   } else {
  //     Message.error(i18n.t('Failed to get configuration information'));
  //   }
  // };
  const onSubmit = async () => {
    const { cloudInfo, dbInfo, experiment_flag, expertise_flag } = configInfo || {};
    if (cloudInfo === null) {
      return Message.error(i18n.t('Please fill in the public cloud account'));
    }
    if (!cloudInfo) {
      return Message.error(i18n.t('Public cloud account verification failed'));
    }
    if (!experiment_flag && !expertise_flag) {
      return Message.error(i18n.t('Please select a migration option'));
    }
    if (!dbInfo === null) {
      return Message.error(i18n.t('Please fill in Mysql configuration'));
    }
    if (!dbInfo.hasOwnProperty('pass')) {
      return Message.error(i18n.t('Please fill in Mysql and verify the configuration'));
    }
    if (!dbInfo?.pass) {
      return Message.error(i18n.t('Mysql configuration verification failed'));
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
        Message.success(i18n.t('Configuration data saved successfully, start migration'));
        onChangeStep(1);
        setLoading(false);
      } else {
        Message.error(i18n.t('Migration failed'));
        setLoading(false);
      }
    } else {
      Message.error(i18n.t('Failed to save configuration data'));
      setLoading(false);
    }
  };
  return (
    <div className={styles.setting}>
      <div className={styles.header}><Translation>Public cloud account AK/SK binding</Translation><span style={{ fontSize: 12, color: '#666', marginLeft: 8, fontWeight: 400 }}><Translation>No account</Translation>，<a style={{ color: '#0070cc' }} href="https://account.aliyun.com/register/register.htm" target="_blank"><Translation>Sign up now</Translation></a></span></div>
      <CloudForm info={configInfo.cloudInfo} onChange={params => setConfigInfo({ ...configInfo, cloudInfo: params })} />
      <div className={styles.header}><Translation>Migration options</Translation></div>
      <div className={styles.content}>
        <div className={styles.formItem}>
          <div className={styles.label}><Translation>Migrate drill data</Translation></div>
          <Checkbox checked={configInfo.experiment_flag} onChange={checked => setConfigInfo({ ...configInfo, experiment_flag: checked })} />
        </div>
        {/* <div className={styles.formItem}>
          <div className={styles.label}>迁移演练经验库</div>
          <Checkbox checked={configInfo.expertise_flag} onChange={checked => setConfigInfo({ ...configInfo, expertise_flag: checked })} />
        </div> */}
      </div>
      {(configInfo.experiment_flag || configInfo.expertise_flag) &&
        <>
          <div className={styles.header}><Translation>Mysql configuration</Translation></div>
          <DbForm info={configInfo.dbInfo} onChange={params => setConfigInfo({ ...configInfo, dbInfo: params })} />
        </>
      }
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" loading={loading} onClick={() => onSubmit()}><Translation>Determining Migration Data</Translation></Button>
      </div>
    </div>
  );
};

export default memo(Setting);
