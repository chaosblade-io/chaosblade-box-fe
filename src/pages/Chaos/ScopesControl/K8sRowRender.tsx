import React, { memo, useCallback, useRef, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import classnames from 'classnames';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';

import Actions, { LinkButton } from '@alicloud/console-components-actions';
import ManualDialog from 'pages/Manage/AgentSetting/common/ManualDialog';
import { AGENT_STATUS, SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { IK8sRecord, IAppLicationScopeOrContorlRecord as SubRecord } from 'config/interfaces/Chaos/application';
import { Icon, Message, Table } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const v_a_b_r = classnames({ [styles.v_a_b]: true, [styles.mr10]: true });
const v_a_b_r_r = classnames({ [styles.v_a_b]: true, [styles.mr10]: true, [styles.red]: true });

interface IK8sRowRenderProps {
  data: IK8sRecord;
  getData: () => void;
}

function K8sRowRender(props: IK8sRowRenderProps) {
  const history = useHistory();
  const dispatch = useDispatch();

  const uninstallStatusLoopInterval = useRef<{[key: string]: any}>({});
  const installStatusLoopInterval = useRef<{[key: string]: any}>({});
  const [ showManualDialog, setShowManualDialog ] = useState<boolean>(false); // 手动卸载弹框
  const [ pluginType, setPluginType ] = useState<string>('');
  const [ isUninstall, setIsUninstall ] = useState<boolean>(false);
  const [ configurationId, setConfigurationId ] = useState<string>('');
  const [ ostype, setOsType ] = useState(NaN);

  const [ dataSource, setDataSource ] = useState(() => {
    const { partNodes = [] } = props.data;
    return partNodes || [];
  });

  // const [ total, setTotal ] = useState(() => {
  //   const { nodeCount = 0 } = props.data;
  //   return nodeCount || 0;
  // });

  // const [ page, setPage ] = useState(1);
  const { getData } = props;

  const renderStatus: any = (value: number) => {
    if (value === AGENT_STATUS.ONLINE) {
      return <span><Icon type="select" className={classnames(styles.onLineState, styles.icon)} /><Translation>Online</Translation></span>;
    }
    if (value === AGENT_STATUS.WAIT_INSTALL) {
      return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.notInstall)} /><Translation>Not Installed</Translation></span>;
    }

    if (value === AGENT_STATUS.OFFLINE) {
      return <span><Icon type="exclamationcircle-f" className={classnames(styles.icon, styles.offLineState)} /><Translation>Offline</Translation></span>;
    }
  };

  const renderNodeIp: any = (value: string, index: number, record: SubRecord) => {
    return <span className={styles.href} onClick={() => {
      pushUrl(history, '/chaos/experiment/scope/detail', {
        id: record.configurationId,
        type: SCOPE_TYPE.K8S,
      });
    }}>{value}</span>;
  };

  // function handlePageChange(current: number) {
  //   const { clusterId = '' } = props.data;
  //   setPage(current);
  //   (async function() {
  //     const { Data = false } = await dispatch.scopesControl.getListExperimentNodesByCluster({
  //       cluster_id: clusterId,
  //       page,
  //       size: 10,
  //     });
  //     setDataSource(Data && Data.data);
  //     setTotal(Data && Data.total);
  //   })();
  // }

  // 卸载
  const handleUninstall = useCallback(async (configurationId: string, deviceId: string) => {
    const { Data = false } = await dispatch.agentSetting.getUninstallPlugin({
      ConfigurationId: configurationId,
    });
    if (Data) {
      const _dataSource = _.cloneDeep(dataSource);
      _dataSource.forEach(item => {
        if (item.deviceId === deviceId) {
          item.pluginStatus = 4;
        }
      });
      // 更新状态为卸载中
      setDataSource(_dataSource);
      uninstallStatusLoopInterval.current[deviceId] = setInterval(() => {
        handleStatusLoop(dataSource, deviceId);
      }, 2000);

      setTimeout(() => {
        handleUninstallOvertime(dataSource, deviceId);
      }, 61000);
    }
  }, [ dataSource ]);
  // 卸载超时
  const handleUninstallOvertime = (_dataSource: any[], deviceId: string) => {
    if (!uninstallStatusLoopInterval.current[deviceId]) return;

    // 超时码999
    handleUninstallFailed(_dataSource, deviceId, 999);

    clearInterval(uninstallStatusLoopInterval.current[deviceId]);
    clearInterval(installStatusLoopInterval.current[deviceId]);
  };
  // 卸载失败
  const handleUninstallFailed = (dataSource: any[], deviceId: string, status?: number) => {
    const _dataSource: any[] = _.cloneDeep(dataSource);
    const pluginStatus = status || -1;

    _dataSource.forEach(item => {
      if (item.deviceId === deviceId) {
        item.pluginStatus = pluginStatus;
      }
    });

    setDataSource(_dataSource);
  };
  // 循环
  const handleStatusLoop = async (dataSource: any[], deviceId: string) => {
    const { Data = {} } = await dispatch.agentSetting.getQueryPluginStatus({
      Loop: true,
      InstanceId: deviceId,
    });
    if (!_.isEmpty(Data)) {
      const data = Data;
      const _dataSource: any[] = _.cloneDeep(dataSource);
      _dataSource.forEach(pluginItem => {
        if (pluginItem.deviceId === data.deviceId) {
          pluginItem.pluginStatus = data.pluginStatus;
        }
      });
      setDataSource(_dataSource);
      if (data.pluginStatus === 0) {
        clearInterval(uninstallStatusLoopInterval.current[deviceId]);
        uninstallStatusLoopInterval.current[deviceId] = null;
      }
      if (data.pluginStatus === 2 || data.pluginStatus === -1) {
        clearInterval(installStatusLoopInterval.current[deviceId]);
        installStatusLoopInterval.current[deviceId] = null;
        getData();
      }
    }
  };

  // 手动卸载
  const toggleManualDialog = (pluginType: string, isUninstall: boolean, configurationId: string, ostype?: number | undefined) => {
    setShowManualDialog(!showManualDialog);
    setPluginType(pluginType);
    setIsUninstall(isUninstall);
    setConfigurationId(configurationId);
    setOsType(ostype!);
  };
  // 安装
  const handleInstall = useCallback(async (deviceId: string) => {
    const { Data = false, Code = '' } = await dispatch.agentSetting.getInstallPlugin({
      InstanceId: deviceId,
    });

    if (Data) {
      const _dataSource: any[] = _.cloneDeep(dataSource);
      _dataSource.forEach(item => {
        if (item.deviceId === deviceId) {
          item.pluginStatus = 1;
        }
      });

      // 更新状态为安装中
      setDataSource(_dataSource);

      installStatusLoopInterval.current[deviceId] = setInterval(() => {
        handleStatusLoop(dataSource, deviceId);
      }, 2000);

    } else {
      let msg = i18n.t('Operation failed');
      if (Code === 'plugin.instance.not.exist') {
        msg = i18n.t('The current instance does not exist, please select an available instance');
      }
      Message.error(msg);
    }
  }, [ dataSource ]);
  // 开始 停止
  // const handleEnableSwitch = useCallback(async (record: any, index: number) => {
  //   const action = record.enable ? 'StopPlugin' : 'StartPlugin';
  //   const msg = record.enable ? '停止成功' : '开启成功';
  //   const msgError = record.enable ? '停止失败' : '开启失败';
  //   const { Data = false } = await dispatch.agentSetting.getStopAndStartPlugin(action, {
  //     PluginType: record.pluginType,
  //     ConfigurationId: record.configurationId,
  //   });
  //   if (Data === true) {
  //     Message.success(msg);
  //     record.enable = !record.enable;
  //     const _dataSource: any[] = _.cloneDeep(dataSource);
  //     _dataSource[index] = record;
  //     setDataSource(_dataSource);
  //   } else {
  //     Message.error(msgError);
  //   }
  // }, [ dataSource ]);

  const renderOption: any = (value: string, index: number, record: SubRecord) => {
    const { osType, pluginStatus, configurationId, pluginType, deviceId, canAutoInstall } = record;
    const btns: {[key: string]: JSX.Element} = {
      // clickUninstallBtn: <LinkButton onClick={() => toggleManualDialog(pluginType, true, configurationId, osType)}>手动卸载</LinkButton>,
      // autoUninstallBtn: <LinkButton onClick={() => handleUninstall(configurationId, deviceId)}>卸载</LinkButton>,
      // startOrStopBtn: <LinkButton onClick={() => handleEnableSwitch(record, index)}>{ enable ? '停止' : '开启' }</LinkButton>,
      installBtn: <span className={styles.red}><a className={styles.ml10} onClick={() => handleInstall(deviceId)} style={{ cursor: 'pointer' }}><Translation>Click install</Translation></a></span>,
      clinkInstallBtn: <span className={styles.red}><a className={styles.ml10} onClick={() => toggleManualDialog(pluginType, false, configurationId, osType) } style={{ cursor: 'pointer' }} ><Translation>Manual installation</Translation></a></span>,
      tryBtn: <LinkButton onClick={() => handleUninstall(configurationId, deviceId)}><Translation>Retry</Translation></LinkButton>,
      uninstallSuccess: <span className={v_a_b_r}><Translation>Uninstalled successfully</Translation> <Icon type={'success'} size="small" /></span>,
      installLoading: <span className={styles.mr10}><Translation>Installing</Translation> <Icon type={'loading'} size='small' /></span>,
      uninstallLoading: <span className={v_a_b_r}><Translation>Uninstalling</Translation> <Icon type={'loading'} size='small' /></span>,
      uninstallFault: <span className={v_a_b_r_r} ><Translation>Uninstall failed</Translation> <Icon type={'error'} size='small' /></span>,
      outTime: <span className={v_a_b_r_r}><Translation>Uninstall Timeout</Translation> <Icon type={'error'} size='small' /></span>,
    };
    let btnKeys: string[] = [];
    switch (pluginStatus) {
      case 0:
        btnKeys = [ 'monitorBtn', 'uninstallSuccess' ];
        break;
      case 1:
        btnKeys = [ 'monitorBtn', 'installLoading' ];
        break;
      case 2:
        btnKeys = [ 'monitorBtn' ];
        if (/CHAOS_AGENT/i.test(pluginType)) {
          btnKeys.push('startOrStopBtn');
        }
        btnKeys.push(canAutoInstall ? 'autoUninstallBtn' : 'clickUninstallBtn');
        break;
      case 3:
        btnKeys = [ 'monitorBtn' ];
        btnKeys.push(canAutoInstall ? 'installBtn' : 'clinkInstallBtn');
        break;
      case 4:
        btnKeys = [ 'monitorBtn', 'uninstallLoading' ];
        break;
      case 5:
        btnKeys = [ 'monitorBtn', 'uninstallFault', 'tryBtn', 'clickUninstallBtn' ];
        break;
      case 999:
        btnKeys = [ 'monitorBtn', 'outTime', 'tryBtn', 'clickUninstallBtn' ];
        break;
      case -1:
        btnKeys = [ 'monitorBtn', 'uninstallFault', 'tryBtn', 'clinkInstallBtn' ];
        break;
      default:
        break;
    }
    return (
      <Actions style={{ justifyContent: 'center' }}>
        {btnKeys.map(item => btns[item])}
      </Actions>
    );
  };

  return <>
    <Table
      dataSource={dataSource}
      hasBorder={false}
      locale={locale().Table}
    >
      <Table.Column title="" dataIndex="deviceId" width={50} cell={null}/>
      <Table.Column title={i18n.t('Node IP').toString()} dataIndex="privateIp" cell={renderNodeIp}/>
      <Table.Column title={i18n.t('Node connection time').toString()} dataIndex="connectTime" cell={formatDate}/>
      <Table.Column title={i18n.t('Device ID').toString()} dataIndex="configurationId" />
      <Table.Column title={i18n.t('Node Probe Version').toString()} dataIndex="agentVersion" />
      <Table.Column title={i18n.t('Node Probe Status').toString()} dataIndex="agentStatus" cell={renderStatus}/>
      {/* 操作  先去掉 */}
      <Table.Column title="" lock="right" align={'center'} width={160} cell={renderOption} />
    </Table>
    {/* <Pagination
      className={styles.paginationK8s}
      current={page}
      pageSize={10}
      total={total}
      totalRender={() => `共有${total}条`}
      onChange={handlePageChange}
    /> */}
    {showManualDialog && (
      <ManualDialog
        pluginType={pluginType}
        isUninstall={isUninstall}
        configurationId={configurationId}
        onClose={() => setShowManualDialog(false)}
        ostype={ostype}
      />
    )}
  </>;
}

export default memo(K8sRowRender)
;
