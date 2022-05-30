import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../i18n';
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
    const probeManagement = i18n.t('Probe Management');
    dispatch.pageHeader.setTitle(probeManagement);
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'scope_control',
        value: probeManagement,
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
        {
          Number(type) === SCOPE_TYPE.HOST ?
            <div>
              <Translation>Number of online probes/total number of ECS</Translation>:{totalInfo[type] || '0/0'}
            </div> :
            <div>
              <Translation>Number of online probes/total number of Kubernetes nodes</Translation>:{totalInfo[type] || '0/0'}
            </div>
        }
      </div>
      <div style={{ marginTop: '-4px' }}>
        <Button
          type={'primary'}
          onClick={() => setIsAutoInstall(true)}
        >
          <Translation>Automatically install probes</Translation>
        </Button>
        &nbsp;&nbsp;
        <Button
          type={'primary'}
          onClick={() => pushUrl(history, '/chaos/agentmanage/setting/step', { iis: '1' })}
        >
          <Translation>Manually install probes</Translation>
        </Button>
      </div>
    </div>;
  }
  /** table 空数据展示信息 */
  const emptyTable = <div><Translation>There are currently no probes</Translation>，<span className={styles.href} onClick={skipAgentManage}><Translation>Access now</Translation></span></div>;
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
        <Tab.Item title={i18n.t('Host').toString()} key={SCOPE_TYPE.HOST}><HostTable {...tableProps} /></Tab.Item>
        <Tab.Item title={i18n.t('Kubernetes').toString()} key={SCOPE_TYPE.K8S}><KubTable {...tableProps} /></Tab.Item>
      </Tab>
      {isAutoInstall && <AutoInstallDialog onClose={() => setIsAutoInstall(false)} />}
    </div>
  );
};

export default ScopesControl;
