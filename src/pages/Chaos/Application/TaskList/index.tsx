import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import classnames from 'classnames';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IAppLicationBasicTask } from 'config/interfaces/Chaos/application';
import { Icon, Pagination, Table } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';


const TaskList: FC = () => {
  const appId = useQuery('appId');
  const dispatch = useDispatch();
  const history = useHistory();
  const [ dataSource, setDataSource ] = useState<IAppLicationBasicTask[]>([]);
  const [ page, setPage ] = useState(1);
  const [ total, setTotal ] = useState(0);
  const { loading } = useSelector(state => {
    return {
      loading: state.loading.effects['application/getApplicationTask'],
    };
  });

  useEffect(() => {
    dispatch.pageHeader.setTitle(<Translation>Exercise recode</Translation>);
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'application',
        value: i18n.t('Application Management'),
        path: '/chaos/application',
      },
      {
        key: 'applicationTaskList',
        value: i18n.t('Application Overview'),
        path: '/chaos/application/tasklist',
      },
    ]));
  }, []);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.application.getApplicationTask({ app_id: appId, page, size: 10 });
      if (Data) {
        const { data, total } = Data;
        setDataSource(data);
        setTotal(total);
      }
    })();
  }, [ page ]);

  const renderName: any = (value: string, index: number, record: IAppLicationBasicTask) => {
    const { experimentId } = record;
    return (
      <a onClick={() => pushUrl(history, '/chaos/experiment/detail', { id: experimentId })}>
        <span>{value}</span>
      </a>
    );
  };

  const renderStatus: any = (value: string, index: number, record: IAppLicationBasicTask) => {
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
    return <span><Icon type="loading" className={classnames(styles.icon)} /><Translation>In execution</Translation></span>;
  };

  const renderAction: any = (value: string, index: number, record: IAppLicationBasicTask) => {
    const { taskId } = record;
    return (
      <a onClick={() => pushUrl(history, '/chaos/experiment/task', { id: taskId })}>
        <span><Translation>View details</Translation></span>
      </a>
    );
  };

  return (
    <div className={styles.warp}>
      <Table
        dataSource={dataSource}
        hasBorder={false}
        loading={loading}
        locale={locale().Table}
      >
        <Table.Column title={<Translation>Drill name</Translation>} dataIndex='experimentName' width='30%' cell={renderName} />
        <Table.Column title={<Translation>Start time</Translation>} dataIndex="startTime" width='20%' cell={formatDate} />
        <Table.Column title={<Translation>End time</Translation>} dataIndex="endTime" width='20%' cell={formatDate} />
        <Table.Column title={<Translation>Status</Translation>} width='15%' cell={renderStatus} />
        <Table.Column title={<Translation>Operation</Translation>} cell={renderAction} width='15%' />
      </Table>
      <Pagination
        className={styles.pagination}
        current={page}
        total={total}
        locale={locale().Pagination}
        hideOnlyOnePage
        onChange={current => { setPage(current); }}
      />
    </div>
  );
};
export default TaskList;
