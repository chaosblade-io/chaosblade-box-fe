import ClusterTableList from './ClusterTableList';
import HeadHandler from './HeadHandler';
import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import TableList from './TableList';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import moment from 'moment';
import styles from './index.css';
import { AGENT_SCOPE_TYPE, DEFAULT_BREADCRUMB_ITEM as defaultBreadCrumbItem } from 'config/constants';
import { Badge, Pagination, Tab } from '@alicloud/console-components';
import { IListKubernetesClusterResult, IListKubernetesClusterResultDatas, IQueryPluginsResult, IQueryPluginsResultDatas } from 'config/interfaces';
import { getParams, removeParams } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const List: FC = () => {
  const dispatch = useDispatch();
  const [ dataSource, setDataSource ] = useState<IQueryPluginsResultDatas[]>([]);
  const [ clustersDataSource, setClustersDataSource ] = useState<IListKubernetesClusterResultDatas[]>([]);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ page, setPage ] = useState<number>(1);
  const [ searchKeyword, setSearchKeyword ] = useState<string>('');
  const [ totalCount, setTotalCount ] = useState<number>(0);
  const [ agentType, setAgentType ] = useState<number>(3);
  const [ statusType, setStatusType ] = useState<string>('2');
  const [ ecsNumber, setEcsNumber ] = useState<'' | number>('');
  const [ onLinePluginNumber, setOnLinePluginNumber ] = useState<'' | number>('');
  const [ pageSize, setPageSize ] = useState<number>(10);
  const [ tab, setTab ] = useState(AGENT_SCOPE_TYPE.HOST);
  const [ K8SHost, setK8SHost ] = useState(false);

  const timer = useRef<any>();

  useEffect(() => {
    if (location.pathname && location.pathname === '/manage/setting') {
      removeParams('clusterId');
      setK8SHost(false);
      dispatch.pageHeader.setTitle(i18n.t('Probe Management').toString());
      dispatch.pageHeader.setBreadCrumbItems(
        [ defaultBreadCrumbItem ].concat({
          key: 'setting',
          value: i18n.t('Probe Management').toString(),
          path: location.pathname,
        }),
      );
    } else {
      setK8SHost(true);
      setTab(AGENT_SCOPE_TYPE.K8S);
      dispatch.pageHeader.setTitle(i18n.t('Cluster probe').toString());
      dispatch.pageHeader.setBreadCrumbItems(
        [ defaultBreadCrumbItem ].concat({
          key: 'setting',
          value: i18n.t('Probe Management').toString(),
          path: '/manage/setting',
        }, {
          key: 'setting/k8sHost',
          value: i18n.t('Cluster probe').toString(),
          path: location.pathname,
        }),
      );
    }
  }, [ location.pathname ]);

  const getQueryPlugins = async (pageIndex?: number) => {
    try {
      setIsLoading(true);
      const params: any = {
        PageIndex: pageIndex ?? page,
        PageSize: pageSize,
        InstanceName: searchKeyword,
        PluginType: agentType,
        PluginStatus: statusType,
      };
      if (K8SHost) {
        params.ClusterId = getParams('clusterId');
      }
      const { Data = {} } = await dispatch.agentSetting.getQueryPlugins(params);
      const { totalItem, result } = Data as IQueryPluginsResult;
      handleFormat(result);
      setTotalCount(totalItem);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const getListKubernetesCluster = async (pageIndex?: number) => {
    try {
      setIsLoading(true);
      const params = {
        PageIndex: pageIndex ?? page,
        PageSize: pageSize,
        ClusterName: searchKeyword,
      };
      const { Data = {} } = await dispatch.agentSetting.getListKubernetesCluster(params);
      const { TotalItem, Result } = Data as IListKubernetesClusterResult;
      setClustersDataSource(Result);
      setTotalCount(TotalItem);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const fetchTableList = useCallback(async (pageIndex?: number) => {
    try {
      if (tab === AGENT_SCOPE_TYPE.K8S && !K8SHost) {
        getListKubernetesCluster(pageIndex);
      } else {
        getQueryPlugins(pageIndex);
      }
    } catch (err) {
      setIsLoading(false);
    }
  }, [ page, searchKeyword, agentType, statusType, pageSize, tab, K8SHost ]);

  const handleFormat = (data: IQueryPluginsResultDatas[]) => {
    const dataSource: IQueryPluginsResultDatas[] = [];
    data.forEach(item => {
      let ip: any;
      let pluginStatusShow: any = '';
      let publicIpShow: any;

      if (item.pluginType === 'CHAOS_AGENT') {
        publicIpShow = i18n.t('Public');
      } else {
        publicIpShow = i18n.t('HostMachine');
      }

      if (item.publicIp && item.privateIp) {
        ip = (
          <span>
            {item.publicIp + publicIpShow}
            <br />
            {item.privateIp + i18n.t('Private')}
          </span>
        );
      } else if (!item.publicIp && item.privateIp) {
        ip = (
          <span>
            {item.privateIp + i18n.t('Private')}
          </span>
        );
      } else if (item.publicIp && !item.privateIp) {
        ip = <span> {item.publicIp + publicIpShow}</span>;
      }

      switch (item.pluginStatus) {
        case 0:
          pluginStatusShow = i18n.t('To be installed');
          break;
        case 1:
          pluginStatusShow = i18n.t('Installing');
          break;
        case -1:
          pluginStatusShow = i18n.t('Installation failed');
          break;
        case 2:
          pluginStatusShow = (
            <span>
              <Badge dot style={{ margin: '-2px 3px 0 0', background: 'green', zIndex: 1 }} />
              <Translation>Online</Translation>
            </span>
          );
          break;
        case 3:
          pluginStatusShow = (
            <span>
              <Badge dot style={{ margin: '-2px 3px 0 0', background: 'red', zIndex: 1 }} />
              <Translation>Offline</Translation>
            </span>
          );
          break;
        case 4:
          pluginStatusShow = i18n.t('Uninstalling');
          break;
        case 5:
          pluginStatusShow = i18n.t('Uninstall failed');
          break;
        default:
          break;
      }

      dataSource.push({
        instanceId: item.instanceId,
        instanceName: item.instanceName,
        pluginStatus: item.pluginStatus,
        pluginStatusShow,
        ip,
        version: item.version,
        pluginType: item.pluginType,
        configurationId: item.configurationId,
        canAutoInstall: item.canAutoInstall,
        chaosTools: item.chaosTools,
        enable: item.enable,
        connectTime: item.connectTime
          ? moment(item.connectTime).format('YYYY-MM-DD HH:mm:ss')
          : '',
        installMode: item.installMode || '',
        link: item.link,
        upgrade: item.upgrade,
        upgradeVersion: item.upgradeVersion,
        osType: item.osType,
      });
    });

    setDataSource(dataSource);
  };

  useEffect(() => {
    fetchTableList();
    return () => clearTimeout(timer.current);
  }, [ fetchTableList ]);

  const fetchPluginRate = useCallback(async () => {
    const { Data: res = {} } = await dispatch.agentSetting.getDescribePluginRate({
      PluginType: agentType,
    });
    const { ecsNumber = 0, onLinePluginNumber = 0 } = res;
    setEcsNumber(ecsNumber);
    setOnLinePluginNumber(onLinePluginNumber);
  }, [ agentType ]);

  useEffect(() => {
    fetchPluginRate();
  }, [ fetchPluginRate ]);

  const handlePaginationChange = (pageIndex: number) => {
    setPage(pageIndex);
  };

  const handleDataSource = (data: IQueryPluginsResultDatas[]) => {
    setDataSource(data);
  };

  const handleSetStatusType = (status: string) => {
    setStatusType(status);
  };

  const handleAgentType = (agentType: number) => {
    setAgentType(agentType);
  };

  const handleSearchKeyword = (keyword: string) => {
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearchKeyword(keyword);
    }, 100);
  };

  const handleOnPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
  };

  function handleTabChange(key: string | number) {
    setTab(Number(key));
  }
  console.log('agentType', agentType);
  return (
    <div className={styles.content}>
      <HeadHandler
        ecsNumber={ecsNumber}
        onLinePluginNumber={onLinePluginNumber}
        agentType={agentType}
        searchKeyword={searchKeyword}
        K8SHost={K8SHost}
        tab={tab}
        handleAgentType={handleAgentType}
        handleSearchKeyword={handleSearchKeyword}
      />
      {(agentType === 1 || agentType === 3) && (!K8SHost ? <Tab
        shape="wrapped"
        activeKey={tab}
        onChange={handleTabChange}
      >
        <Tab.Item title={i18n.t('Host').toString()} key={AGENT_SCOPE_TYPE.HOST}>
          <TableList
            dataSource={dataSource}
            agentType={agentType}
            isLoading={isLoading}
            statusType={statusType}
            handleDataSource={handleDataSource}
            handleSetStatusType={handleSetStatusType}
          />
        </Tab.Item>
        <Tab.Item title={i18n.t('Kubernetes').toString()} key={AGENT_SCOPE_TYPE.K8S}>
          <ClusterTableList
            dataSource={clustersDataSource}
            agentType={agentType}
            isLoading={isLoading}
            statusType={statusType}
            handleDataSource={(data: any) => { console.log(data); }}
            handleSetStatusType={handleSetStatusType}
          />
        </Tab.Item>
      </Tab> : <TableList
        style={{ padding: '0' }}
        dataSource={dataSource}
        agentType={agentType}
        isLoading={isLoading}
        statusType={statusType}
        handleDataSource={handleDataSource}
        handleSetStatusType={handleSetStatusType}
      />)}
      {agentType === 2 && <TableList
        style={{ padding: '0' }}
        dataSource={dataSource}
        agentType={agentType}
        isLoading={isLoading}
        statusType={statusType}
        handleDataSource={handleDataSource}
        handleSetStatusType={handleSetStatusType}
      />}
      <Pagination
        total={totalCount}
        pageSize={pageSize}
        defaultCurrent={1}
        onChange={handlePaginationChange}
        onPageSizeChange={handleOnPageSizeChange}
        pageSizeSelector='dropdown'
        pageSizeList={[ 10, 20, 50, 100 ]}
        className={styles.pagination}
        locale={locale().Pagination}
      />
    </div>
  );
};

export default memo(List);

