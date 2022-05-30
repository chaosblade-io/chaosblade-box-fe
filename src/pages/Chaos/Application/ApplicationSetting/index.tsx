import React, { FC, useEffect, useState } from 'react';
import SettingDetail from './SettingDetail';
import Translation from 'components/Translation';
import _ from 'lodash';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Balloon, Message, Table, Tag } from '@alicloud/console-components';
import { IApplicationConfigRecordScope, IApplicationConfigurationRecordAndReq } from 'config/interfaces/Chaos/application';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';

const ApplicationSetting: FC = () => {
  const dispatch = useDispatch();
  const appId = useQuery('appId');
  const [ dataSource, setDataSource ] = useState<IApplicationConfigurationRecordAndReq[]>([]);
  const [ visible, setVisible ] = useState(false);
  const [ currentRecord, setCurrentRecord ] = useState<IApplicationConfigurationRecordAndReq | null>(null);
  const [ updateDataSource, setUpdateDataSource ] = useState(false);
  const { loading } = useSelector(state => {
    return {
      loading: state.loading.effects['application/getListApplicationConfigurations'],
    };
  });

  useEffect(() => {
    dispatch.pageHeader.setTitle(<Translation>Application configuration</Translation>);
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
      const { Data = false } = await dispatch.application.getListApplicationConfigurations({ app_id: appId });
      if (Data) {
        setDataSource(Data);
      }
    })();
  }, [ updateDataSource ]);


  function handleDialog(record: IApplicationConfigurationRecordAndReq) {
    setVisible(true);
    setCurrentRecord(record);
  }

  function handleClose() {
    setVisible(false);
    setCurrentRecord(null);
  }

  async function handleSubmit() {
    if (currentRecord) {
      const res = await dispatch.application.updateApplicationConfiguration({
        ...currentRecord,
        app_id: appId,
      });
      if (res.success) {
        setVisible(false);
        Message.success(<Translation>Operation successful</Translation>);
        setUpdateDataSource(!updateDataSource);
      }
    }
  }

  const renderDesctiption: any = (value: string) => {
    return (
      <Balloon trigger={<div className={styles.description}>{value}</div>} closable={false}>
        <div>{value}</div>
      </Balloon>
    );
  };

  function renderPriority(value: number) {
    if (value === 0) {
      return <Translation>High</Translation>;
    }
    if (value === 1) {
      return <Translation>Normal</Translation>;
    }
    return <Translation>Low</Translation>;
  }

  function renderNodeGroup(value: IApplicationConfigRecordScope) {
    const nodeGroups: string[] = _.get(value, 'nodeGroups', []);
    return nodeGroups.map((it: string) => (
      <Tag type="primary" key={it} className={styles.nodeTags}>{it}</Tag>
    ));
  }

  function renderOverride(value: boolean) {
    if (value) {
      return <Translation>Yes</Translation>;
    }
    return <Translation>No</Translation>;
  }

  const renderAction: any = (value: IApplicationConfigurationRecordAndReq, index: number, record: IApplicationConfigurationRecordAndReq) => {
    const status = _.get(record, 'status', NaN);
    if (status === 1) {
      return <span><Translation>The configuration is invalid and cannot be edited</Translation></span>;
    }
    return <span className={styles.moreTag} onClick={() => handleDialog(record)}><Translation>Modify</Translation></span>;
  };

  function handleNodeGroupChange(value: string[]) {
    if (currentRecord) {
      setCurrentRecord({
        ...currentRecord,
        scope: {
          nodeGroups: value,
        },
      });
    }
  }

  function handleOverrideChange(value: boolean) {
    if (currentRecord) {
      setCurrentRecord({
        ...currentRecord,
        override: value,
      });
    }
  }

  function handleChange(id: string, type: string, alias: string, value: string) {
    if (currentRecord) {
      setCurrentRecord({
        ...currentRecord,
        component: {
          value,
        },
        value,
      });
    }
  }
  return (
    <>
      <div className={styles.warp}>
        <Table
          dataSource={dataSource}
          hasBorder={false}
          loading={loading}
          locale={locale().Table}
        >
          <Table.Column title={<Translation>Name</Translation>} dataIndex='name' width='15%' cell={renderDesctiption} />
          <Table.Column title={<Translation>Description</Translation>} dataIndex="description" width='20%' cell={renderDesctiption} />
          <Table.Column title={<Translation>Configure priority</Translation>} dataIndex="priority" cell={renderPriority as any} />
          <Table.Column title={<Translation>Applicable grouping</Translation>} dataIndex="scope" cell={renderNodeGroup as any} />
          <Table.Column title={<Translation>Configuration value</Translation>} dataIndex="value" width='5%' />
          <Table.Column title={<Translation>Overwrite user configuration</Translation>} dataIndex="override" cell={renderOverride as any} />
          <Table.Column title={<Translation>Modification time</Translation>} dataIndex="gmt_modified" cell={formatDate} />
          <Table.Column title={<Translation>Operation</Translation>} cell={renderAction} width='10%' />
        </Table>
      </div>
      <SettingDetail
        visible={visible}
        currentRecord={currentRecord}
        handleChange={handleChange}
        handleNodeGroupChange={handleNodeGroupChange}
        handleClose={handleClose}
        handleOverrideChange={handleOverrideChange}
        handleSubmit={handleSubmit}
      />
    </>
  );
};

export default ApplicationSetting;
