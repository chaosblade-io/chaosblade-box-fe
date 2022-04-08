import Actions, { LinkButton } from '@alicloud/console-components-actions';
import ManualDialog from 'pages/Manage/AgentSetting/common/ManualDialog';
import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './index.css';
import { Balloon, Icon, Message, Table, Tag } from '@alicloud/console-components';
import {
  IQueryPluginStatusResult,
  IQueryPluginsResultDatas,
} from 'config/interfaces';
import { OS_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

interface IProps {
  dataSource: IQueryPluginsResultDatas[];
  agentType: number;
  isLoading: boolean;
  statusType: string;
  style?: any;
  handleDataSource: (data: IQueryPluginsResultDatas[]) => void;
  handleSetStatusType: (status: string) => void;
}

const filterList = [
  { label: '在线', value: 2 },
  { label: '离线', value: 3 },
];

const v_a_b_r = classnames({ [styles.v_a_b]: true, [styles.mr10]: true });
const v_a_b_r_r = classnames({ [styles.v_a_b]: true, [styles.mr10]: true, [styles.red]: true });

const TableList: FC<IProps> = props => {
  const history = useHistory();
  const {
    dataSource,
    agentType,
    isLoading,
    statusType,
    handleDataSource,
    handleSetStatusType,
  } = props;
  const dispatch = useDispatch();

  const [ showManualDialog, setShowManualDialog ] = useState<boolean>(false);
  const [ pluginType, setPluginType ] = useState<string>('');
  const [ isUninstall, setIsUninstall ] = useState<boolean>(false);
  const [ configurationId, setConfigurationId ] = useState<string>('');
  const [ ostype, setOsType ] = useState(NaN);

  const uninstallStatusLoopInterval = useRef<{[key: string]: any}>({});
  const installStatusLoopInterval = useRef<{[key: string]: any}>({});

  useEffect(() => {
    return () => {
      Object.keys(installStatusLoopInterval).forEach(item => {
        clearInterval(installStatusLoopInterval.current[item]);
      });

      Object.keys(uninstallStatusLoopInterval).forEach(item => {
        clearInterval(uninstallStatusLoopInterval.current[item]);
      });
    };
  }, []);

  // 实例名称
  const renderInstanceName: any = (value: string, index: number, record: IQueryPluginsResultDatas) => {
    if (record.link) {
      return (
        <a href={record.link} target="_blank">
          {value}
        </a>
      );
    }

    return value;
  };

  // 开始 停止
  const handleEnableSwitch = useCallback(async (record: IQueryPluginsResultDatas, idx: number) => {
    const action = record.enable ? 'StopPlugin' : 'StartPlugin';
    const msg = record.enable ? '停止成功' : '开启成功';
    const msgError = record.enable ? '停止失败' : '开启失败';

    const { Data = false } = await dispatch.agentSetting.getStopAndStartPlugin(action, {
      PluginType: record.pluginType,
      ConfigurationId: record.configurationId,
    });

    if (Data === true) {
      Message.success(msg);
      record.enable = !record.enable;
      const _dataSource: IQueryPluginsResultDatas[] = _.cloneDeep(dataSource);
      _dataSource[idx] = record;
      handleDataSource(_dataSource);
    } else {
      Message.error(msgError);
    }
  }, [ dataSource ]);

  // 安装
  const handleInstall = useCallback(async (instanceId: string) => {
    const { Data = false, Code = '' } = await dispatch.agentSetting.getInstallPlugin({
      InstanceId: instanceId,
    });

    if (Data) {
      const _dataSource: IQueryPluginsResultDatas[] = _.cloneDeep(dataSource);
      _dataSource.forEach(item => {
        if (item.instanceId === instanceId) {
          item.pluginStatus = 1;
        }
      });

      // 更新状态为安装中
      handleDataSource(_dataSource);

      installStatusLoopInterval.current[instanceId] = setInterval(() => {
        handleStatusLoop(dataSource, instanceId);
      }, 2000);

    } else {
      let msg = '操作失败';
      if (Code === 'plugin.instance.not.exist') {
        msg = '当前的实例不存在，请选择可用的实例';
      }
      Message.error(msg);
    }
  }, [ dataSource ]);

  // 卸载
  const handleUninstall = useCallback(async (configurationId: string, instanceId: string) => {
    const { Data = false } = await dispatch.agentSetting.getUninstallPlugin({
      ConfigurationId: configurationId,
    });

    if (Data) {
      const _dataSource: IQueryPluginsResultDatas[] = _.cloneDeep(dataSource);

      _dataSource.forEach(item => {
        if (item.instanceId === instanceId) {
          item.pluginStatus = 4;
        }
      });

      // 更新状态为卸载中
      handleDataSource(_dataSource);

      uninstallStatusLoopInterval.current[instanceId] = setInterval(() => {
        handleStatusLoop(dataSource, instanceId);
      }, 2000);

      setTimeout(() => {
        handleUninstallOvertime(dataSource, instanceId);
      }, 61000);
    } else {
      handleUninstallFailed(dataSource, instanceId);
    }
  }, [ dataSource ]);

  // 循环
  const handleStatusLoop = async (dataSource: IQueryPluginsResultDatas[], instanceId: string) => {
    const { Data = {} } = await dispatch.agentSetting.getQueryPluginStatus({
      Loop: true,
      InstanceId: instanceId,
    });
    if (!_.isEmpty(Data)) {
      const data = Data as IQueryPluginStatusResult;
      const _dataSource: IQueryPluginsResultDatas[] = _.cloneDeep(dataSource);

      _dataSource.forEach(pluginItem => {
        if (pluginItem.instanceId === data.instanceId) {
          pluginItem.pluginStatus = data.pluginStatus;
        }
      });

      if (data.pluginStatus === 0) {
        clearInterval(uninstallStatusLoopInterval.current[instanceId]);
        uninstallStatusLoopInterval.current[instanceId] = null;
      }

      if (data.pluginStatus === 2 || data.pluginStatus === -1) {
        clearInterval(installStatusLoopInterval.current[instanceId]);
        installStatusLoopInterval.current[instanceId] = null;
      }

      handleDataSource(_dataSource);
    }
  };

  // 卸载超时
  const handleUninstallOvertime = (dataSource: IQueryPluginsResultDatas[], instanceId: string) => {
    if (!uninstallStatusLoopInterval.current[instanceId]) return;

    // 超时码999
    handleUninstallFailed(dataSource, instanceId, 999);

    clearInterval(uninstallStatusLoopInterval.current[instanceId]);
    clearInterval(installStatusLoopInterval.current[instanceId]);
  };

  // 卸载失败
  const handleUninstallFailed = (dataSource: IQueryPluginsResultDatas[], instanceId: string, status?: number) => {
    const _dataSource: IQueryPluginsResultDatas[] = _.cloneDeep(dataSource);
    const pluginStatus = status || -1;

    _dataSource.forEach(item => {
      if (item.instanceId === instanceId) {
        item.pluginStatus = pluginStatus;
      }
    });

    handleDataSource(_dataSource);
  };
  // 手动卸载
  const toggleManualDialog = (pluginType: string, isUninstall: boolean, configurationId: string, ostype?: number | undefined) => {
    setShowManualDialog(!showManualDialog);
    setPluginType(pluginType);
    setIsUninstall(isUninstall);
    setConfigurationId(configurationId);
    setOsType(ostype!);
  };

  // 渲染
  const render: any = (value: string, index: number, record: IQueryPluginsResultDatas) => {
    const osType = _.get(record, 'osType', NaN);
    let label: any;
    if (osType === OS_TYPE.WINDOWS) {
      if (record && record.pluginStatus === 0) {
        return '卸载成功';
      }
      if ((record && record.pluginStatus === 2) || (record && record.pluginStatus === 3) || (record && record.pluginStatus === 5)) {
        return <LinkButton
          onClick={() => toggleManualDialog(record.pluginType, true, record.configurationId, osType)}
        >
          手动卸载
        </LinkButton>;
      }
    }
    switch (record.pluginStatus) {
      case 0:
        label = (
          <>
            <span>
              <span className={v_a_b_r}>
              卸载成功
              </span>
              <Icon type={'success'} size="small" />
            </span>
          </>
        );
        break;
      case 2:
        label = (
          <>
            {record.pluginType.toUpperCase() === 'CHAOS_AGENT' && (
              <LinkButton
                onClick={() => handleEnableSwitch(record, index)}
              >
                { record.enable ? '停止' : '开启' }
              </LinkButton>
            )}

            {record.canAutoInstall ? (
              <LinkButton
                onClick={() => handleUninstall(record.configurationId, record.instanceId)}
              >
                卸载
              </LinkButton>
            ) : (
              <LinkButton
                onClick={() => toggleManualDialog(record.pluginType, true, record.configurationId)}
              >
              手动卸载
              </LinkButton>
            )}
          </>
        );
        break;
      case 3:
        label = (
          <>
            <span className={styles.red}>
              {record.canAutoInstall ? (
                <a
                  className={styles.ml10}
                  onClick={() => handleInstall(record.instanceId)}
                  data-spm-click="gostr=/aliyun;locaid=d_SettingInstalled_plugin_install"
                  style={{ cursor: 'pointer' }}
                >
                  单击安装
                </a>
              ) : (
                <a
                  className={styles.ml10}
                  onClick={() =>
                    toggleManualDialog(record.pluginType, false, record.configurationId, record.osType)
                  }
                  style={{ cursor: 'pointer' }}
                >
                  手动安装
                </a>
              )}
            </span>
          </>
        );
        break;
      case 4:
        label = (
          <>
            <span>
              <span className={v_a_b_r}>
                卸载中
              </span>
              <Icon type={'loading'} size='small' />
            </span>
          </>
        );
        break;
      case 5:
        label = (
          <>
            <span>
              <span className={v_a_b_r_r} >
              卸载失败
              </span>
              <Icon type={'error'} size='small' />
            </span>
            <LinkButton
              onClick={() => handleUninstall(record.configurationId, record.instanceId)}
            >
              重试
            </LinkButton>
            <LinkButton
              onClick={() =>
                toggleManualDialog(record.pluginType, true, record.configurationId)
              }
            >
              手动卸载
            </LinkButton>
          </>
        );
        break;
      case 999:
        label = (
          <>
            <span>
              <span className={v_a_b_r_r}>
              卸载超时
              </span>
              <Icon type={'error'} size='small' />
            </span>
            <LinkButton
              onClick={() => handleUninstall(record.configurationId, record.instanceId)}
            >
              重试
            </LinkButton>
            <LinkButton
              onClick={() =>
                toggleManualDialog(record.pluginType, true, record.configurationId)
              }
            >
              手动卸载
            </LinkButton>
          </>
        );
        break;
      case -1:
        label = (
          <>
            <span>
              <span className={v_a_b_r_r}>
              安装失败
              </span>
              <Icon type={'error'} size='small' />
            </span>
            <LinkButton
              onClick={() => handleInstall(record.instanceId)}>
              重试
            </LinkButton>
            <LinkButton
              onClick={() =>
                toggleManualDialog(record.pluginType, false, record.configurationId)
              }
            >
              手动安装
            </LinkButton>
          </>
        );
        break;
      case 1:
        label = (
          <>
            <span>
              <span className={styles.mr10}>
              安装中
              </span>
              <Icon type={'loading'} size='small' />
            </span>
          </>
        );
        break;
      default:
        break;
    }

    return (
      <Actions style={{ justifyContent: 'center' }}>
        {label}
        <LinkButton onClick={() => {
          pushUrl(history, location.pathname === '/manage/setting' ? 'setting/tools' : 'tools', { id: record.configurationId, mode: record.installMode });
        }}>安装演练工具</LinkButton>
      </Actions>
    );
  };
  // 版本
  const renderVersion: any = (value: string, index: number, record: IQueryPluginsResultDatas) => {
    if (record.upgrade && (agentType === 1 || agentType === 3)) {
      return <Balloon
        trigger={
          (<span>
            <Icon type="star-circle1" size='xs' className="text-warning" style={{ marginRight: '4px' }} />
            <span className="text-primary vertical-align-middle cursor-default">{record.version}</span>
          </span>)
        }
        triggerType="hover"
      >
        <span style={{ color: 'black' }}>
        可升级到版本 {record.upgradeVersion}
        </span>
      </Balloon>;
    }
    return <span>{record.version}</span>;
  };

  const renderOsType: any = (value: number) => {
    if (value === 0) return 'linux';
    if (value === 1) return 'windows';
    return;
  };

  const renderTools: any = (value: string[]) => {
    return <div>
      {value?.length > 0 &&
        value.map(it => {
          return <Tag key={it} style={{ marginRight: '2px', marginTop: '2px' }}>{it}</Tag>;
        })
      }
    </div>;
  };

  const statusFilter = (filterParams: any) => {
    const { pluginStatusShow = {} } = filterParams;
    const { selectedKeys = {} } = pluginStatusShow;
    const [ pluginType = '' ] = selectedKeys;

    handleSetStatusType(pluginType);
  };
  return (
    <div style={props.style ? props.style : { padding: '8px' }}>
      <Table
        dataSource={dataSource}
        primaryKey={'instanceId'}
        loading={isLoading}
        onFilter={statusFilter}
        filterParams={{ pluginStatusShow: { selectedKeys: [ statusType ] } }}
        className={styles.content}
        hasBorder={false}
      >
        <Table.Column
          title={
            agentType === 1 ? '应用名称' : '主机名'
          }
          dataIndex={'instanceName'}
          align={'center'}
          lock
          cell={renderInstanceName}
          width={280}
        />
        <Table.Column title={'插件类型'} width={140} dataIndex={'pluginType'} align={'center'} />
        <Table.Column title={'IP'} dataIndex={'ip'} width={160} align={'center'} />
        <Table.Column
          title={'探针版本'}
          cell={renderVersion}
          align={'center'}
          width={100}
        />
        {agentType !== 2 && [
          <Table.Column title={'安装环境'} width={100} key={'installMode'} dataIndex={'installMode'} align={'center'} />,
          <Table.Column title={'操作系统'} width={100} key={'osType'} dataIndex={'osType'} align={'center'} cell={renderOsType}/>,
          <Table.Column title='已安装工具' width={200} key={'chaosTools'} dataIndex={'chaosTools'} align={'center'} cell={renderTools}/>,
        ]}
        <Table.Column title={'启动时间'} width={160} dataIndex={'connectTime'} align={'center'} />
        <Table.Column
          title={'插件状态'}
          dataIndex={'pluginStatusShow'}
          align={'center'}
          width={120}
          filters={filterList}
          filterMode={'single'}
        />
        <Table.Column
          title={'操作'}
          cell={render}
          width={200}
          lock="right"
          align={'center'}
        />
      </Table>
      {showManualDialog && (
        <ManualDialog
          pluginType={pluginType}
          isUninstall={isUninstall}
          configurationId={configurationId}
          onClose={() => setShowManualDialog(false)}
          ostype={ostype}
          // status={status}
        />
      )}
    </div>
  );
};

export default memo(TableList);

