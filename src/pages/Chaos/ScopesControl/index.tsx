import React, { FC, useEffect, useState } from 'react';
import styles from './index.css';
import { Button, Tab } from '@alicloud/console-components';
import { SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { getParams, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

import HostTable from './hostTable';
import KubTable from './kubTable';

import AutoInstallDialog from '../../Manage/AutoInstall';

const ScopesControl: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const type = getParams('type') ?? SCOPE_TYPE.HOST;
  const [ totalInfo, setTotalInfo ] = useState<any>({});
  const [ isAutoInstall, setIsAutoInstall ] = useState<boolean>(false);
  useEffect(() => {
    dispatch.pageHeader.setTitle('探针管理页');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'scope_control',
        value: '探针管理',
        path: '/chaos/scope/control',
      },
    ]));
  }, []);

  // useEffect(() => {
  //   setTab(Number(type) || 0);
  // }, [ type ]);
  function handleTabChange(type: string | number) {
    pushUrl(history, '/chaos/experiment/scope/control', { type });
  }
  /** 跳转到探针安装页面 */
  function skipAgentManage() {
    pushUrl(history, '/chaos/agentmanage/setting/step', {
      iis: 1,
    });
  }
  function renderExtra() {
    return <div className={styles.extra}>
      <div>
        在线探针数/总{Number(type) === SCOPE_TYPE.HOST ? 'ECS' : 'Kubernetes节点'}数：{totalInfo[type] || '0/0'}
      </div>
      <div style={{ marginTop: '-4px' }}>
        <Button
          type={'primary'}
          onClick={() => setIsAutoInstall(true)}
        >
          自动安装探针
        </Button>
        &nbsp;&nbsp;
        <Button
          type={'primary'}
          onClick={() => pushUrl(history, '/chaos/agentmanage/setting/step', { iis: '1' })}
        >
          手动安装探针
        </Button>
      </div>
    </div>;
  }
  /** table 空数据展示信息 */
  const emptyTable = <div>当前暂无探针，<span className={styles.href} onClick={skipAgentManage}>立即接入</span></div>;
  /** 更新 统计信息 */
  const changeSuccessNumber = (flag: number, info: string) => {
    const newInfo = { ...totalInfo, [flag]: info };
    setTotalInfo(newInfo);
  };
  const tableProps = {
    currTab: Number(type) || 0,
    changeSuccessNumber,
    empty: emptyTable,
  };
  return (
    <div className={styles.warp}>
      <Tab
        activeKey={type}
        shape="wrapped"
        onChange={handleTabChange}
        extra={renderExtra()}
        navClassName={styles.tabStyle}
      >
        <Tab.Item title="主机" key={SCOPE_TYPE.HOST}><HostTable {...tableProps} /></Tab.Item>
        <Tab.Item title="Kubernetes" key={SCOPE_TYPE.K8S}><KubTable {...tableProps} /></Tab.Item>
      </Tab>
      {isAutoInstall && <AutoInstallDialog onClose={() => setIsAutoInstall(false)} />}
    </div>
  );
};

export default ScopesControl;
