import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Pagination, Table } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';


const { Column } = Table;

interface ExperimentChangeHistoryProps{
  experimentId: string;
}

function ExperimentChangeHistory(props: ExperimentChangeHistoryProps) {
  const history = useHistory();
  const dispatch = useDispatch();

  const [ dataSource, setDataSource ] = useState([]);
  const [ page, setPage ] = useState(1);
  const [ total, setTotal ] = useState(1);
  const [ size, setSize ] = useState(10);

  useEffect(() => {
    const { experimentId } = props;
    (async function() {
      dispatch.experimentDetail.getListOperationLogs({ experimentId, page, size }, (res: any) => {
        if (!_.isEmpty(res)) {
          setDataSource(res && res.data);
          setTotal(res && res.total);
          setSize(res && res.pageSize);
        }
      });
    })();
  }, [ page ]);

  function handlePageChange(current: number) {
    current && setPage(current);
  }

  const renderChangeDescription:any = (value: string, index: number, record: any) => {
    const { change_type, change_desc, property_id } = record;
    if (change_type === i18n.t('Run') || change_type === i18n.t('Stop')) {
      return <div >
        {change_desc}
        <span className={styles.hrefId} onClick={() => handleGoTask(record)}>
          {property_id}
        </span>
      </div>;
    }
    return <span>{change_desc}</span>;
  };

  function handleGoTask(record: any) {
    const { property_id } = record;
    if (property_id) {
      pushUrl(history, '/chaos/experiment/task', { id: property_id });
    }
  }

  return <div>
    <Table
      className={styles.body}
      dataSource={dataSource}
      isZebra
      primaryKey="taskId"
      hasBorder={false}
      emptyContent={i18n.t('No record of changes to the drill').toString()}
      locale={locale().Table}
      // loading={[ props.experimentId ]}
    >
      <Column title={i18n.t('Operator').toString()} dataIndex="operator"/>
      <Column title={i18n.t('Operation time').toString()} dataIndex="time" cell={formatDate}/>
      <Column title={i18n.t('Change type').toString()} dataIndex="change_type"/>
      <Column title={i18n.t('Change description').toString()} dataIndex="change_desc" cell={renderChangeDescription}/>
    </Table>
    <div className={styles.pagination}>
      <Pagination
        current={page}
        total={total}
        pageSize={size}
        onChange={handlePageChange}
        hideOnlyOnePage={true}
        locale={locale().Pagination}
      />
    </div>
  </div>;
}

export default ExperimentChangeHistory;
