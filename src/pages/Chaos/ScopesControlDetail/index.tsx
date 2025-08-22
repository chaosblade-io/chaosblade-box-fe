
import HeatMap from './HeatmapChart';
import React, { FC, memo, useEffect, useState } from 'react';
import RingChart from './RingChart';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import classnames from 'classnames';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { AGENT_STATUS, SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IScopeContorlDetailExperimentRecord, IScopeContorlInfo } from 'config/interfaces/Chaos/scopesControl';
import { Icon, Pagination, Table } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';


const ScopesControlDetail: FC = () => {
  const id = useQuery('id');
  const type = useQuery('type');
  const dispatch = useDispatch();
  const history = useHistory();
  const [ dataSource, setDataSource ] = useState<IScopeContorlDetailExperimentRecord[]>([]);
  const [ dataSourcePod, setDataSourcePod ] = useState([]);
  const [ page, setPage ] = useState(1);
  const [ pagePod, setPagePod ] = useState(1);
  const [ total, setTotal ] = useState(0);
  const [ totalPod, setTotalPod ] = useState(0);
  const [ info, setInfo ] = useState<IScopeContorlInfo>();
  const { loading } = useSelector(state => {
    return {
      loading: state.loading.effects['scopesControl/getExperimentTaskScopes'],
    };
  });

  useEffect(() => {
    dispatch.pageHeader.setTitle(info && info.hostname);
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'experiment_scope_control',
        value: i18n.t('Probe Management'),
        path: '/chaos/experiment/scope/control',
      },
      {
        key: 'scopes_detail',
        value: i18n.t('Resource Details'),
        path: '/chaos/scope/detail',
      },
    ]));
    dispatch.pageHeader.showBackArrow(true);
  }, [ info ]);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.scopesControl.getScopeInfo({ configuration_id: id, scope_type: 0 });
      if (Data) {
        setInfo(Data);
      }
    })();
  }, []);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.scopesControl.getExperimentTaskScopes({
        configuration_id: id,
        page,
        size: 10,
      });
      if (Data) {
        setDataSource(_.get(Data, 'data', []));
        setTotal(_.get(Data, 'total', 0));
      }
    })();
  }, [ page ]);

  useEffect(() => {
    if (type) {
      (async function() {
        const { Data = false } = await dispatch.scopesControl.getSearchExperimentPodsByNode({
          node_configuration_id: id,
          page: pagePod,
          size: 10,
          key: '',
          kub_namespace: [],
        });
        if (Data) {
          setDataSourcePod(_.get(Data, 'data', []));
          setTotalPod(_.get(Data, 'total', 0));
        }
      })();
    }
  }, [ pagePod ]);

  if (!dataSource) {
    return null;
  }

  if (!dataSourcePod) {
    return null;
  }

  const renderStatus: any = (value: number, index: number, record: IScopeContorlDetailExperimentRecord) => {
    const { state, result } = record;
    if (state === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS) {
        return <span><Icon type="select" className={classnames(styles.onLineState, styles.icon)} /><Translation>Success</Translation></span>;
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED) {
        return <span><Icon type="exclamationcircle-f" className={classnames(styles.icon, styles.offLineState)} /><Translation>Not as expected</Translation></span>;
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR) {
        return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.notInstall)} /><Translation>Abnormal</Translation></span>;
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED) {
        return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.interrupt)} /><Translation>Interrupt</Translation></span>;
      }
    }
    return <span><Icon type="loading" className={classnames(styles.icon, styles.loading)} /><Translation>In execution</Translation></span>;
  };

  const renderName: any = (value: string, index: number, record: IScopeContorlDetailExperimentRecord) => {
    const { experiment_id } = record;
    return <a className={styles.linkHref} onClick={() => {
      pushUrl(history, '/chaos/experiment/detail', {
        id: experiment_id,
      });
    }}>{value}</a>; // 去往演练详情页
  };

  const renderAction: any = (value: string, index: number, record: IScopeContorlDetailExperimentRecord) => {
    const { task_id } = record;
    return <a className={styles.linkHref} onClick={() => {
      pushUrl(history, '/chaos/experiment/task', {
        id: task_id,
      });
    }}><Translation>See details</Translation></a>; // 去往执行页
  };

  function handlePageChange(current: number, type: string) {
    if (!type) {
      setPage(current);
    } else {
      setPagePod(current);
    }
  }

  function handleHrefApp(id: string | undefined) {
    pushUrl(history, '/chaos/application/detail', {
      appId: id,
    });
  }

  function renderApp() {
    if (info && info.app_info) {
      return <div className={styles.href} onClick={() => handleHrefApp(info && info.app_info!.app_id)}>{info && info.app_info!.app_name}</div>;
    }
    return <Translation>None</Translation>;
  }

  function renderIpInfo() {
    return (
      <div>
        <div className={styles.title}><Translation>Host information</Translation></div>
        <div className={!type ? styles.info : styles.around}>
          <div className={styles.left}>
            <div className={styles.item}>
              <div className={styles.label}><Translation>name</Translation>:</div>
              <div className={styles.value} title={info && info.hostname}>{info && info.hostname}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}><Translation>Number of drills</Translation>:</div>
              <div className={styles.value}>{info && info.running_info && info.running_info.total}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}><Translation>Public IP</Translation>:</div>
              <div className={styles.value}>{info && info.public_ip}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}><Translation>Probe version</Translation>:</div>
              <div className={styles.value}>{info && info.agent_version}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}><Translation>Start Time</Translation>:</div>
              <div className={styles.value}>{formatDate(_.get(info, 'collect_time', 0))}</div>
            </div>
          </div>
          <div className={styles.right}>
            {type && <div className={styles.item}>
              <div className={styles.label}> <Translation>Cluster name</Translation>:</div>
              <div className={styles.value}>{info && info.cluster_info && info.cluster_info.cluster_name}</div>
            </div>}
            <div className={styles.item}>
              <div className={styles.label}> <Translation>Operating system</Translation>:</div>
              <div className={styles.value}>{info && info.os_version}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}><Translation>Private IP</Translation>:</div>
              <div className={styles.value}>{info && info.private_ip}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}><Translation>Probe Status</Translation>:</div>
              <div className={styles.value}>{renderAgentStatus(info && info.agent_status)}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}><Translation>Owning application</Translation>:</div>
              <div className={styles.value}>{renderApp()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAgentStatus(value: number | undefined) {
    if (value === AGENT_STATUS.ONLINE) {
      return <span><Icon type="select" className={classnames(styles.onLineState, styles.icon)} /><Translation>Online</Translation></span>;
    }
    if (value === AGENT_STATUS.WAIT_INSTALL) {
      return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.notInstall)} /><Translation>Not Installed</Translation></span>;
    }

    if (value === AGENT_STATUS.OFFLINE) {
      return <span><Icon type="exclamationcircle-f" className={classnames(styles.icon, styles.offLineState)} /><Translation>Offline</Translation></span>;
    }
  }

  function renderScopeDetail() {
    return (
      <>
        <div className={styles.title}><Translation>Drill data</Translation></div>
        <div className={styles.info}>
          <div className={styles.heatmap}>
            <HeatMap />
          </div>
          <div className={styles.ringChart}>
            <RingChart />
          </div>
        </div>
      </>
    );
  }

  const renderPodApp: any = (value: string, index: number, record: any) => {
    if (!_.isEmpty(record)) {
      const { app_id } = record;
      return <span className={styles.href} onClick={() => {
        pushUrl(history, '/chaos/application/detail', {
          appId: app_id,
        });
      }}>{value}</span>;
    }
  };

  function renderPodTable() {
    return <div className={styles.taskHistory}>
      <div className={styles.title}><Translation>Pod information</Translation></div>
      <Table
        dataSource={dataSourcePod}
        hasBorder={false}
        loading={loading}
        locale={locale().Table}
      >
        <Table.Column title='PodIP' dataIndex="pod_ip" width='15%' />
        <Table.Column title={i18n.t('PodIP').toString()} dataIndex="pod_name" />
        <Table.Column title={i18n.t('Cluster namespace').toString()} dataIndex="kub_namespace" />
        <Table.Column title={i18n.t('The application where the Pod is located').toString()} dataIndex="app_name" cell={renderPodApp} />
        <Table.Column title={i18n.t('Last heartbeat time').toString()} dataIndex="last_heart_time" cell={formatDate} />
      </Table>
      <Pagination
        className={styles.pagination}
        current={pagePod}
        total={totalPod}
        locale={locale().Pagination}
        onChange={current => handlePageChange(current, 'pod')}
      />
    </div>;
  }

  return (
    <div className={styles.warp}>
      <div className={styles.topContent}>
        <div className={styles.ipInfo}>{renderIpInfo()}</div>
        <div className={styles.taskData}>{renderScopeDetail()}</div>
      </div>
      {parseInt(type) === SCOPE_TYPE.K8S && renderPodTable()}
      <div className={styles.taskHistory}>
        <div className={styles.title}><Translation>Exercise record</Translation></div>
        <Table
          dataSource={dataSource}
          hasBorder={false}
          loading={loading}
          locale={locale().Table}
        >
          <Table.Column title={i18n.t('Drill name').toString()} dataIndex="name" width='37%' cell={renderName} />
          <Table.Column title={i18n.t('Start time').toString()} dataIndex="startTime" cell={formatDate} />
          <Table.Column title={i18n.t('End Time').toString()} dataIndex="endTime" cell={formatDate} />
          <Table.Column title={i18n.t('State').toString()} dataIndex="state" cell={renderStatus} />
          <Table.Column title={i18n.t('Operation').toString()} cell={renderAction} />
        </Table>
        <Pagination
          className={styles.pagination}
          current={page}
          total={total}
          locale={locale().Pagination}
          onChange={current => handlePageChange(current, '')}
        />
      </div>
    </div>
  );

};

export default memo(ScopesControlDetail);
