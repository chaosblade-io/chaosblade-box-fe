import React, { FC, useEffect, useState } from 'react';
import SettingDetail from './SettingDetail';
import _ from 'lodash';
import formatDate from 'pages/Chaos/lib/DateUtil';
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
    dispatch.pageHeader.setTitle('应用配置');
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
        Message.success('操作成功');
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
      return '高';
    }
    if (value === 1) {
      return '普通';
    }
    return '低';
  }

  function renderNodeGroup(value: IApplicationConfigRecordScope) {
    const nodeGroups: string[] = _.get(value, 'nodeGroups', []);
    return nodeGroups.map((it: string) => (
      <Tag type="primary" key={it} className={styles.nodeTags}>{it}</Tag>
    ));
  }

  function renderOverride(value: boolean) {
    if (value) {
      return '是';
    }
    return '否';
  }

  const renderAction: any = (value: IApplicationConfigurationRecordAndReq, index: number, record: IApplicationConfigurationRecordAndReq) => {
    const status = _.get(record, 'status', NaN);
    if (status === 1) {
      return <span>配置失效无法编辑</span>;
    }
    return <span className={styles.moreTag} onClick={() => handleDialog(record)}>修改</span>;
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
        >
          <Table.Column title='名称' dataIndex='name' width='15%' cell={renderDesctiption} />
          <Table.Column title="描述" dataIndex="description" width='20%' cell={renderDesctiption} />
          <Table.Column title="配置优先级" dataIndex="priority" cell={renderPriority as any} />
          <Table.Column title="适用分组" dataIndex="scope" cell={renderNodeGroup as any} />
          <Table.Column title="配置值" dataIndex="value" width='5%' />
          <Table.Column title="是否覆盖用户配置内容" dataIndex="override" cell={renderOverride as any} />
          <Table.Column title="修改时间" dataIndex="gmt_modified" cell={formatDate} />
          <Table.Column title="操作" cell={renderAction} width='10%' />
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
