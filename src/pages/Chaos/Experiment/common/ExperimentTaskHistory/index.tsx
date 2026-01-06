import Iconfont from 'pages/Chaos/common/Iconfont';
import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import moment from 'moment';
import styles from './index.css';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { Icon, Pagination, Table } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';


const { Column } = Table;

interface ExperimentTaskHistoryProps{
  experimentId: string;
}

export default function ExperimentTaskHistory(props: ExperimentTaskHistoryProps) {
  const dispatch = useDispatch();
  const history = useHistory();

  const [ dataSource, setDataSource ] = useState([]);
  const [ current, setCurrent ] = useState(1);
  const [ total, setTotal ] = useState(0);

  useEffect(() => {
    const { experimentId } = props;
    (async function() {
      await dispatch.experimentDetail.getExperimentTaskPageable({ experimentId, page: current, size: 10 }, (res: any) => {
        if (res && res.content) {
          setDataSource(res && res.content);
          setTotal(res && res.total);
        }
      });
    })();
  }, [ current ]);

  function handlePageChange(current: number) {
    current && setCurrent(current);
  }

  const renderDate: any = (value: number | string) => {
    if (_.isString(value) && !_.isEmpty(value)) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }

    if (_.isNumber(value) && value) {
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }

    return value;
  };

  const renderStatus: any = (value: string, index: number, record: any) => {
    const { result } = record;

    let icon;
    let text = '';

    if (value === ExperimentConstants.EXPERIMENT_TASK_STATE_STOPPING) {
      icon = <Icon type="loading" size="small" style={{ marginRight: 5 }} />;
      text = i18n.t('Stopping');
    } else if (value === ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING) {
      icon = <Icon type="loading" size="small" style={{ marginRight: 5 }} />;
      text = i18n.t('In execution');
    } else if (value === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS) {
        icon = <Icon type="select" style={{ color: '#1E8E3E', marginRight: 8 }} size="xs" />;
        text = i18n.t('Success');
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED) {
        icon = <Iconfont className={styles.icon} type="icon-yichang" />;
        text = i18n.t('Not as expected');
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR) {
        icon = <Iconfont className={styles.icon} type="icon-yichang" />;
        text = i18n.t('Abnormal');
      }
      if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED || result === ExperimentConstants.EXPERIMENT_TASK_RESULT_REJECTED) {
        icon = <Iconfont className={styles.icon} type="icon-zhongduan" />;
        text = i18n.t('Interrupt');
      }
    }

    return (
      <div className={styles.status}>
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  function handleHref(value: string) {
    value && pushUrl(history, '/chaos/experiment/task', { id: value });
  }

  const renderOperations: any = (value: string) => {
    return (
      <div className={styles.optGroup}>
        <a className={styles.opt} target="_blank" rel="noopener noreferrer" onClick={() => handleHref(value)}><Translation>View details</Translation></a>
      </div>
    );
  };

  return (
    <div>
      <Table
        className={styles.body}
        // dataSource={loading[ experimentId ] ? [] : _.defaultTo(content, [])}
        dataSource={dataSource}
        isZebra
        primaryKey="taskId"
        hasBorder={false}
        emptyContent={i18n.t('There is no execution record for the drill').toString()}
        // loading={loading[ experimentId ]}
        locale={locale().Table}
      >
        <Column title={i18n.t('Exercise name').toString()} dataIndex="experimentName" width="25%"/>
        <Column title={i18n.t('Start time').toString()} dataIndex="startTime" cell={renderDate} width="15%"/>
        <Column title={i18n.t('End Time').toString()} dataIndex="endTime" cell={renderDate} width="15%"/>
        <Column title={i18n.t('State').toString()} dataIndex="state" cell={renderStatus} width="10%"/>
        {/* <Column title="消耗次数" dataIndex="amount" width="10%"/> */}
        <Column title={i18n.t('Operation').toString()} dataIndex="taskId" cell={renderOperations} width="15%"/>
      </Table>
      <div className={styles.pagination}>
        <Pagination
          current={current}
          total={total}
          pageSize={10}
          onChange={handlePageChange}
          hideOnlyOnePage={true}
          locale={locale().Pagination}
        />
      </div>
    </div>
  );
}
