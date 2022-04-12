import React, { memo, useEffect, useState } from 'react';

import styles from './index.css';

import { Button, Icon, Message, Step } from '@alicloud/console-components';

import { useDispatch } from 'utils/libs/sre-utils-dva';

const statusConf = {
  READY: {
    name: '准备中',
    value: 0,
    color: 'grey',
    icon: 'clock',
  },
  RUNNING: {
    name: '运行中',
    value: 1,
    color: '#0070cc',
    icon: 'loading',
  },
  FAILED: {
    name: '失败',
    value: 2,
    color: 'red',
    icon: 'times-circle',
  },
  SUCCESS: {
    name: '成功',
    value: 1,
    color: 'green',
    icon: 'check-circle',
  },
};

interface Props {
  onChangeStep: (step: number) => void;
}

const Index: React.FC<Props> = props => {
  const { onChangeStep } = props;

  const dispatch = useDispatch();
  const [ currStatus, setCurrentStatus ] = useState('');
  const [ progress, setProgress ] = useState([]);
  useEffect(() => {
    getData();
    const id = setInterval(() => getData(), 10 * 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  const getData = async () => {
    const res = await dispatch.migration.queryMigrationResult({ migration_flag: '' });
    if (res) {
      const { progress, status } = res;
      setProgress(progress);
      setCurrentStatus(status);
      if ([ 'SUCCESS' ].includes(status)) {
        onChangeStep(2);
      }
    }
  };

  const onRetry = async type => {
    const res = await dispatch.migration.startMigration({ migration_flag: type });
    if (res) {
      Message.success('重新迁移中！');
    }
  };

  // const renderStep1 = () => {
  //   return (
  //     <div>
  //       <div className={styles.proItem}>
  //         <div>演练数据迁移</div>
  //         <div style={{ color: 'green' }}><Icon type="check-circle" size="xs" /> 已完成</div>
  //       </div>
  //       <div className={styles.proItem}>
  //         <div>演练库数据迁移</div>
  //         <div style={{ color: '#0070cc' }}><Icon type="loading" size="xs" /> 迁移中</div>
  //       </div>
  //     </div>
  //   );
  // };

  const renderStepContent = items => {
    return (
      <div>
        {items?.map((temp, index) => {
          const { name, status, type } = temp;
          const statusInfo = statusConf[status] || {};
          return (
            <div className={styles.proItem} key={index}>
              <div>{name}</div>
              <div style={{ color: statusInfo.color }}>
                <Icon type={statusInfo.icon} size="xs" /> {statusInfo.name}
                { status === 'FAILED' &&
                  <Button type="primary" text style={{ marginLeft: 8 }} size="small" onClick={() => onRetry(type)}>重试</Button>
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.progress}>
      <div className={styles.tips}>
        <div className={styles.pHeader}>
          {currStatus === 'FAILED' && '数据迁移失败' || '数据迁移中'}
        </div>
        <div className={styles.desp}>数据迁移耗时较长，请耐心等待。</div>
        <div className={styles.error}>迁移过程如果出现失败，可以点重试，或联系系统管理员！</div>
        <div className={styles.error}>探针迁移，只针对host探针，k8s探针请手动替换成公有云探针，以防数据迁移失败！</div>
      </div>
      <Step direction="ver" shape="dot">
        {progress?.map((item, index) => {
          console.log(item, index);
          const { name, items } = item;
          return (
            <Step.Item status={'process'} key={index} title={name} content={renderStepContent(items)} />
          );
        })}
      </Step>
    </div>
  );
};

export default memo(Index);
