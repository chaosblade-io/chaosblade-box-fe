import React, { FC, useEffect, useState } from 'react';
import classnames from 'classnames';
import formatDate from 'pages/Chaos/lib/DateUtil';
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
    dispatch.pageHeader.setTitle('演练记录');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'application',
        value: '应用管理',
        path: '/chaos/application',
      },
      {
        key: 'applicationTaskList',
        value: '应用概览',
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

  function renderName(value: string, index: number, record: IAppLicationBasicTask) {
    const { experimentId } = record;
    return (
      <a onClick={() => pushUrl(history, '/chaos/experiment/detail', { id: experimentId })}>
        <span>{value}</span>
      </a>
    );
  }

  function renderStatus(value: string, index: number, record: IAppLicationBasicTask) {
    const { state, result } = record;
    if (state === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS) {
        return <span><Icon type="select" className={classnames(styles.onLineState, styles.icon)} />成功</span>;
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED) {
        return <span><Icon type="exclamationcircle-f" className={classnames(styles.icon, styles.offLineState)} />不符合预期</span>;
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR) {
        return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.notInstall)} />异常</span>;
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED) {
        return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.interrupt)} />中断</span>;
      }
    }
    return <span><Icon type="loading" className={classnames(styles.icon)} />执行中</span>;
  }

  function renderAction(value: string, index: number, record: IAppLicationBasicTask) {
    const { taskId } = record;
    return (
      <a onClick={() => pushUrl(history, '/chaos/experiment/task', { id: taskId })}>
        <span>查看详情</span>
      </a>
    );
  }

  return (
    <div className={styles.warp}>
      <Table
        dataSource={dataSource}
        hasBorder={false}
        loading={loading}
      >
        <Table.Column title='演练名' dataIndex='experimentName' width='30%' cell={renderName} />
        <Table.Column title="开始时间" dataIndex="startTime" width='20%' cell={formatDate} />
        <Table.Column title="结束时间" dataIndex="endTime" width='20%' cell={formatDate} />
        <Table.Column title="状态" width='15%' cell={renderStatus} />
        <Table.Column title="操作" cell={renderAction} width='15%' />
      </Table>
      <Pagination
        className={styles.pagination}
        current={page}
        total={total}
        totalRender={() => `共有${total}条`}
        hideOnlyOnePage
        onChange={current => { setPage(current); }}
      />
    </div>
  );
};
export default TaskList;
