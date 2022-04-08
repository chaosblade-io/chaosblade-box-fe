
import K8sRowRender from './K8sRowRender';
import React, { FC, useEffect, useState } from 'react';

import ManualDialog from 'pages/Manage/AgentSetting/common/ManualDialog';

import _ from 'lodash';
import classnames from 'classnames';

import styles from './index.css';

import Actions, { LinkButton } from '@alicloud/console-components-actions';

import { SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';

import { IK8sRecord } from 'config/interfaces/Chaos/application';
import { Icon, Table } from '@alicloud/console-components';

import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';

import { useDispatch } from 'utils/libs/sre-utils-dva';
interface IPorps {
  currTab: number; // 当前tab，切换时刷新数据
  empty: any; // table 无数据现实内容
  changeSuccessNumber: (tab: number, info: string) => void; // 更新统计信息
}
const KubTable: FC<IPorps> = props => {
  const { currTab, empty, changeSuccessNumber } = props;
  const dispatch = useDispatch();
  const [ loading, setLoading ] = useState(false);
  const [ dataSource, setDataSource ] = useState<IK8sRecord[]>([]);
  // const [ page, setPage ] = useState(1);
  const page = 1;
  const [ total, setTotal ] = useState(0);
  const [ openRowKeys, setOpenRowKeys ] = useState([] as string[]);

  const [ showManualDialog, setShowManualDialog ] = useState<boolean>(false);
  const [ pluginType, setPluginType ] = useState<string>('');
  const history = useHistory();

  useEffect(() => {
    if (currTab !== SCOPE_TYPE.K8S) {
      return;
    }
    getData();
  }, [ currTab, page ]);
  useEffect(() => {
    let total = 0;
    let success = 0;
    for (const i in dataSource) {
      const { nodeCount, onlineCount } = dataSource[i];
      total += nodeCount;
      success += onlineCount;
    }
    changeSuccessNumber(currTab, `${success}/${total}`);
  }, [ total ]);
  const getData = async () => {
    setLoading(true);
    const { Data = [] } = await dispatch.scopesControl.getListExperimentClusters();
    setDataSource(Data || []);
    const _len = Data?.length;
    setTotal(_len);
    setLoading(false);
    if (_.isEmpty(Data) && _len > 0) {
      handleRowExpanded(Data[0]);
    }
  };
  function handleRowExpanded(record: IK8sRecord) {
    const { clusterId: id } = record;
    // 如果有这行，则将它折叠
    if (openRowKeys.includes(id)) {
      setOpenRowKeys(openRowKeys.filter(key => key !== id));
    } else {
      openRowKeys.push(id);
      setOpenRowKeys([ ...openRowKeys ]);
    }
  }
  function expandedRowRender(record: any): JSX.Element {
    return <K8sRowRender data={record} getData={getData}></K8sRowRender>;
  }
  const renderAgentVersion: any = (value: boolean) => {
    if (value) {
      return <span><Icon type="select" className={classnames(styles.onLineState, styles.icon)} />一致</span>;
    }
    return <span><Icon type="exclamationcircle-f" className={classnames(styles.icon, styles.offLineState)} />不一致</span>;
  };

  // 手动卸载
  const toggleManualDialog = (pluginType: string) => {
    setShowManualDialog(!showManualDialog);
    setPluginType(pluginType);
  };
  const renderAction: any = (value: string, index: number, record: IK8sRecord) => {
    const { clusterId, onlineCount, pluginType, installMode } = record;
    const clickUninstallBtn = <LinkButton onClick={(e:any) => {
      toggleManualDialog(pluginType);
      e.stopPropagation();
    }}>手动卸载</LinkButton>;
    const toolBtn = <LinkButton onClick={(e:any) => {
      pushUrl(history, '/chaos/agentmanage/setting/tools', { id: clusterId, mode: installMode });
      e.stopPropagation();
    }}>安装演练工具</LinkButton>;
    return (
      <Actions>
        { onlineCount && onlineCount > 0 && clickUninstallBtn}
        {toolBtn}
      </Actions>
    );
  };
  return (
    <div className={styles.tabContent}>
      <Table
        dataSource={dataSource || []}
        hasBorder={false}
        emptyContent={empty}
        loading={loading}
        expandedIndexSimulate
        primaryKey='clusterId'
        openRowKeys={openRowKeys}
        expandedRowIndent={[ 0, 0 ]}
        onRowClick={handleRowExpanded}
        onRowOpen={(openRowKeys, currentRowKey, expanded, record) => {
          handleRowExpanded(record);
        }}
        expandedRowRender={expandedRowRender as any}
      >
        <Table.Column title='集群ID' dataIndex='clusterId' />
        <Table.Column title='集群名称' dataIndex='clusterName' />
        <Table.Column title="集群节点数目" dataIndex="nodeCount" />
        <Table.Column title="节点探针版本一致性" dataIndex="agentConsistency" cell={renderAgentVersion}/>
        <Table.Column title="操作" cell={renderAction}/>
      </Table>
      {/* <Pagination
        className={styles.pagination}
        current={page}
        total={total}
        totalRender={() => `共有${total}条`}
        onChange={current => setPage(current)}
      /> */}
      {showManualDialog && (
        <ManualDialog
          pluginType={pluginType}
          isUninstall={true}
          isClusterUninstall={true}
          onClose={() => setShowManualDialog(false)}
        />
      )}
    </div>
  );
};

export default KubTable;
