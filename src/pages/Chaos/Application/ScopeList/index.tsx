import React, { FC, useEffect, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import formatDate from 'pages/Chaos/lib/DateUtil';
import styles from './index.css';
import { AGENT_STATUS } from 'pages/Chaos/lib/FlowConstants';
import { Button, Dialog, Icon, Message, Pagination, Search, Select, Table, Tag } from '@alicloud/console-components';
import { IAppLicationScopeOrContorlRecord } from 'config/interfaces/Chaos/application';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';

const ScopeList: FC = () => {
  const dispatch = useDispatch();
  const appId = useQuery('appId');
  const appType = useQuery('appType');
  const [ dataSource, setDataSource ] = useState<IAppLicationScopeOrContorlRecord[]>([]);
  const [ page, setPage ] = useState(1);
  const [ total, setTotal ] = useState(1);
  const [ filterValue, setFilterValue ] = useState('全部分组');
  const [ groups, setGroups ] = useState<string[]>([]);
  const [ key, setKey ] = useState('');
  const [ searchFlag, setSearchFlag ] = useState(false);
  const [ visible, setVisible ] = useState(false);
  const [ tags, setTags ] = useState<string[]>([]);
  const [ hosts, setHosts ] = useState<string[]>([]);
  const [ groupName, setGroupName ] = useState(''); // 分组名称
  const [ selectedRowKeys, setSelectedRowKeys ] = useState<string[]>([]);
  const [ update, setUpdate ] = useState(false); // 是否更新数据
  const [ batch, setBatch ] = useState(false); // 是否批量添加
  const { loading } = useSelector(state => {
    return {
      loading: state.loading.effects['application/getApplicationHosts'] || state.loading.effects['application/searchApplicationHosts'],
    };
  });

  useEffect(() => {
    dispatch.pageHeader.setTitle('机器列表');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'application',
        value: '应用管理',
        path: '/chaos/application',
      },
      {
        key: 'applicationScopeList',
        value: '机器列表',
        path: '/chaos/application/scopelist',
      },
    ]));
  }, []);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.application.getApplicationHosts({ app_id: appId, page, size: 20 });
      if (Data) {
        const { data, total } = Data;
        setDataSource(data);
        setTotal(total);
      }
    })();
  }, [ page, update ]);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.application.getApplicationGroup({ app_id: appId });
      if (Data) {
        setGroups(Data);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchFlag) {
      (async function() {
        const { Data = false } = await dispatch.application.searchApplicationHosts({
          app_id: appId,
          key,
          group: filterValue === '全部分组' ? '' : filterValue,
          page,
          size: 10,
        });
        if (Data) {
          const { data, total } = Data;
          setDataSource(data);
          setTotal(total);
        }
      })();
    }
  }, [ filterValue, key ]);

  function handleFilterChange(value: any) {
    setFilterValue(value);
    setSearchFlag(true);
  }

  function handleSearch(value: string) {
    setKey(value);
    setSearchFlag(true);
  }

  function renderTitle() {
    if (appType === '1') {
      return 'pod名';
    }
    return '主机名';
  }

  const renderName: any = (value: string, index: number, record: IAppLicationScopeOrContorlRecord) => {
    if (appType) {
      return <span>{record.deviceName}</span>;
    }
  };

  const renderIp: any = (value: string, index: number, record: IAppLicationScopeOrContorlRecord) => {
    if (!_.isEmpty(record)) {
      const { privateIp, publicIp } = record;
      return <div>
        {publicIp && <div style={{ lineHeight: '22px' }}>{publicIp}(公)</div>}
        {privateIp && <div style={{ lineHeight: '22px' }}>{privateIp}(私)</div>}
      </div>;
    }
    return '-';
  };

  const renderGroup: any = (value: string[]) => {
    if (!_.isEmpty(value)) {
      return value.map((group: string, index: number) => {
        return <Tag type="primary" size="small" style={{ marginRight: 8 }} key={`${group}${index}`}>{group}</Tag>;
      });
    }
    return '-';
  };
  const renderStatus: any = (value: number) => {
    if (value === AGENT_STATUS.ONLINE) {
      return <span><Icon type="select" className={classnames(styles.onLineState, styles.icon)} />在线</span>;
    }
    if (value === AGENT_STATUS.WAIT_INSTALL) {
      return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.notInstall)} />未安装</span>;
    }

    if (value === AGENT_STATUS.OFFLINE) {
      return <span><Icon type="exclamationcircle-f" className={classnames(styles.icon, styles.offLineState)} />离线</span>;
    }
  };

  const renderTags: any = (value: boolean, index: number, record: IAppLicationScopeOrContorlRecord) => {
    const tags = _.get(record, 'deviceTags', []);
    if (tags.length > 0) {
      return _.map(tags, (tag: string, idx: number) => <Tag key={idx} style={{ marginRight: 3, marginBottom: 2 }}>{tag}</Tag>);
    }
    return;
  };

  const renderAction: any = (value: boolean, index: number, record: IAppLicationScopeOrContorlRecord) => {
    return <span className={styles.action} onClick={() => handleRecord(record)}>编辑标签</span>;
  };

  function handleRecord(record: IAppLicationScopeOrContorlRecord) {
    setBatch(false);
    setHosts([ record && record.configurationId ]);
    setTags(record && record.deviceTags);
    setGroupName(record && record.groups![0]);
    setVisible(true);
  }

  function handleTagsChange(value: string[]) {
    if (value.length <= 5) {
      value.forEach((i: string, idx: number) => {
        if (i.length > 30) {
          value[idx] = i.substring(0, 29);
        }
      });
      setTags(value);
    } else {
      return;
    }
  }

  function handleSubmitTags() {
    if (batch) {
      (async function name() {
        await dispatch.application.batchAddApplicationTag({ appId, configurationIds: hosts, tags }, res => {
          if (res) {
            Message.success('操作成功！');
            setUpdate(!update);
            setVisible(false);
            setSelectedRowKeys([]);
          }
        });
      })();
    } else {
      (async function name() {
        await dispatch.application.updateApplicationTag({ appId, groupName, configurationIds: hosts, tags }, res => {
          if (res) {
            Message.success('操作成功！');
            setUpdate(!update);
            setVisible(false);
          }
        });
      })();
    }
  }

  function handleChange(keys: any[]) {
    setHosts(keys);
    setSelectedRowKeys(keys);
  }

  return (
    <div className={styles.warp}>
      <div className={styles.actionContent}>
        <Search
          shape="simple"
          placeholder='请输入分组名称'
          className={styles.searchContent}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          filter={groups}
          filterValue={filterValue}
        />
      </div>
      <Table
        dataSource={dataSource}
        hasBorder={false}
        style={{ marginTop: 8 }}
        loading={loading}
        rowSelection={{
          onChange: (keys: any[]) => handleChange(keys),
          selectedRowKeys,
        }}
        primaryKey='configurationId'
      >
        <Table.Column title={renderTitle} width='15%' cell={renderName} />
        {appType === '1' && <Table.Column title='集群' dataIndex='clusterName' />}
        <Table.Column title="IP" dataIndex="publicIp" cell={renderIp} width='140px'/>
        <Table.Column title="分组" dataIndex="groups" cell={renderGroup} />
        <Table.Column title="标签" dataIndex="deviceTags" cell={renderTags} />
        <Table.Column title="版本" dataIndex="agentVersion" width='68px'/>
        <Table.Column title="启动时间" dataIndex="connectTime" cell={formatDate} width='160px'/>
        <Table.Column title="状态" dataIndex='agentStatus' width='90px' cell={renderStatus} />
        <Table.Column title="操作" cell={renderAction} />
      </Table>
      <div className={styles.actionContent}>
        <Button
          type='primary'
          onClick={() => { setVisible(true); setBatch(true); setTags([]); }}
          disabled={_.isEmpty(selectedRowKeys)}
        >批量添加标签</Button>
        <Pagination
          current={page}
          total={total}
          totalRender={() => `共有${total}条`}
          hideOnlyOnePage
          onChange={current => { setPage(current); }}
        />
      </div>
      <Dialog
        title='编辑标签'
        visible={visible}
        onClose={() => { setVisible(!visible); setTags([]); }}
        onCancel={() => { setVisible(!visible); setTags([]); }}
        onOk={handleSubmitTags}
      >
        <div className={styles.dialogSty}>
          <div className={styles.formItem}>
            <div className={styles.label}>标签：</div>
            <Select
              mode='tag'
              value={tags}
              onChange={handleTagsChange}
              className={styles.select}
              placeholder='请输入完整标签并按下回车键'
            ></Select>
          </div>
          <div className={styles.tips}>最多可添加5个标签，标签不超过30个字符，如需修改标签请删除该标签后重新添加。</div>
          {/* {more && <span className={styles.moreTip}>每个标签不超过30个字符</span>} */}
        </div>
      </Dialog>
    </div>
  );
};

export default ScopeList;
