import InvalidHostsDialog from './InvalidHostsDialog';
import ListSelect from 'pages/Chaos/common/ListSelect';
import React, { FC, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styles from './index.css';
import { APPLICATION_TYPE, OS_TYPE, SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { Balloon, Button, Dropdown, Form, Icon, Input, Radio, Select, Tag } from '@alicloud/console-components';
import { IHost } from 'config/interfaces/Chaos/experiment';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const { Item: FormItem } = Form;
const { Group: RadioGroup } = Radio;

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const searchTypeConf:any = {
  ip: {
    label: '按机器IP',
  },
  tag: {
    label: '按机器标签',
  },
  namespace: {
    label: '按命名空间',
  },
  clusterNames: {
    label: '按集群筛选',
  },
};

interface IProps {
  value: IHost[];
  isApp: boolean;
  onChange: (value: IHost[]) => void;
  appId?: string;
  appGroup?: string[];
  scopeType?: number | string; // 资源类型
  type?: string;
  listTips: string;
  noSearch?: boolean
  experimentObj?: number | string; // 演练对象
  osTypeChange?: (val: number) => void;
  osType?: number;
}
const defaultSearchInfo = {
  key: '',
  tags: [],
  namespace: [],
  cloudKey: '',
};
const ScopeList: FC<IProps> = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { scopesByApp, scopesNoApp, cloudInstanceList } = useSelector(state => {
    return {
      ...state.experimentDataSource.scopes,
      isAppLoading: state.loading.effects['experimentDataSource/getScopeByApplication'],
      noAppLoading: state.loading.effects['experimentDataSource/getScopeNoApplication'],
    };
  });
  const [ page, setPage ] = useState(1);
  const [ pageSize, setPageSize ] = useState(10);
  const [ total, setTotal ] = useState(1);
  const [ hostsValue, setHostsValue ] = useState<(string | undefined)[]>([]);
  const [ invalidHosts, setInvalidHosts ] = useState<any[]>([]);
  const [ invalidVisible, setInvalidVisible ] = useState(false);
  const [ selectedRowKeys, setSelectedRowKeys ] = useState<any[]>([]); // 列表选择
  const [ selectedIps, setSelectedIps ] = useState<any[]>([]); // 已选择
  const [ searchType, setSearchType ] = useState('ip');
  const [ searchTypeInfo, setSearchTypeInfo ] = useState<any>(_.cloneDeep(defaultSearchInfo)); // 高级查询 查询条件
  const [ searchTypeOption, setSearchTypeOption ] = useState<any>({}); // 高级查询的 options
  const [ dropDownVisible, setDropDownVisible ] = useState(false);
  const [ updateScopes, setUpdateScopes ] = useState(false);
  const [ scopesOsType, setScopesOsType ] = useState(() => {
    const { osType } = props;
    if (osType === OS_TYPE.LINUX || osType === OS_TYPE.WINDOWS) return osType;
    return OS_TYPE.LINUX;
  });
  const isMountedRef = useRef(0);
  const setDatas = (res: any) => {
    if (!_.isEmpty(res)) {
      setTotal(res && res.total);
      setPage(res && res.page);
      setPageSize(res && res.pageSize);
    }
  };
  useEffect(() => {
    if (props.appId || props.appGroup?.length === 0) {
      setSearchTypeInfo(_.cloneDeep(defaultSearchInfo));
    }
    setDropDownVisible(false);
  }, [ props.appGroup, props.appId ]);
  useEffect(() => {
    const { isApp, appId, appGroup, osType } = props;
    setTotal(0);
    const { key = '', tags = [], namespaces = [], clusterNames = [] } = searchTypeInfo;
    isMountedRef.current = 1;
    const params = {
      page,
      size: pageSize,
      key,
      tags,
      kubNamespaces: namespaces,
      clusterIds: clusterNames,
    };
    const getDatas = async () => {
      if (isApp) {
        await dispatch.experimentDataSource.getScopeByApplication({
          ...params,
          app_id: appId,
          app_group: appGroup,
          osType,
        }, res => setDatas(res));
      }
    };
    isMountedRef.current && getDatas();
    return () => { isMountedRef.current = 0; };
  }, [ props.scopeType, props.appGroup, props.appId, page, updateScopes ]);

  useEffect(() => {
    setHostsValue([]);
  }, [ props.scopeType ]);

  useEffect(() => {
    handleDateNoChange();
  }, [ props.value ]);

  useEffect(() => {
    if (!_.isEmpty(invalidHosts)) {
      setInvalidVisible(true);
    }
  }, [ invalidHosts ]);

  // 弹层展示or取消数据一致性
  function handleDateNoChange() {
    const { value, isApp } = props;
    let newHosts: any = [];
    let invalidHostsList: any = [];
    invalidHostsList = value && value.filter((v: IHost) => v.invalid);
    if (isApp) {
      newHosts = value && value.map((v: IHost) => v.appConfigurationId);
    } else {
      newHosts = value && value.map((v: IHost) => v.deviceConfigurationId);
    }
    if (_.isEmpty(newHosts)) {
      setHostsValue([]);
      setSelectedRowKeys([]);
      setSelectedIps(handleScope([]));
    } else {
      if (_.isEmpty(hostsValue)) {
        setHostsValue(newHosts);
        setSelectedRowKeys(newHosts);
        setSelectedIps(handleScope(value));
      } else {
        setHostsValue(_.intersection(hostsValue, newHosts));
        setSelectedRowKeys(_.intersection(hostsValue, newHosts));
        // setSelectedIps(handleScope(_.intersection(hostsValue, value)));
      }
    }
    if (!_.isEmpty(invalidHostsList)) {
      setInvalidHosts(invalidHostsList);
      setSelectedIps(handleScope(_.concat(invalidHostsList, hostsValue as [])));
    }
  }

  function handleConfirm(value: string[]) { // 数据提交
    const { scopeType, onChange, isApp } = props;
    setHostsValue(value);
    const newScopes: any[] = [];
    _.forEach(value, (val: string) => {
      let newValue;
      if (isApp) {
        newValue = _.find(scopesByApp.data, (so: IHost) => so.appConfigurationId === val); // 拿出接口返回的数据源的id和选中的数据id对比
        if (!newValue) {
          newValue = _.find(props.value, (h: IHost) => h.appConfigurationId === val);
        }
        newScopes.push({
          ...newValue,
        });
      } else {
        newValue = _.find(scopesNoApp.data, (so: IHost) => so.deviceConfigurationId === val);
        if (!newValue) {
          newValue = _.find(props.value, (h: IHost) => h.deviceConfigurationId === val);
        }
        newScopes.push({
          ...newValue,
          scopeType,
        });
      }
    });
    setSelectedIps(handleScope(_.filter(newScopes, (h: IHost) => !_.isEmpty(h))));
    onChange && onChange(_.filter(newScopes, (h: IHost) => !_.isEmpty(h)));
  }

  function handleScope(values: any) { // 处理机器列表数据
    const { scopeType, isApp } = props;
    let label;
    if (_.isEmpty(values)) {
      return [];
    }
    return !_.isEmpty(values) && values.map((val: IHost) => {
      const { ip, deviceName, clusterName, clusterId, appConfigurationId, deviceConfigurationId, allow, invalid, authMessage, k8s } = val;
      if (scopeType === SCOPE_TYPE.HOST || isApp) {
        label = `${ip}[${deviceName}]`;
      } else {
        if (val && !_.isEmpty(clusterName)) {
          label = `[K8S] ${clusterName}`;
        } else {
          label = `[K8S] ${clusterId}`;
        }
      }
      return {
        value: isApp ? appConfigurationId : deviceConfigurationId,
        label,
        disabled: !allow,
        invalid,
        authMessage,
        k8s,
        clusterId,
        clusterName,
        deviceConfigurationId,
      };
    });
  }

  function handleIsAppOrNoApp() { // 通过isApp分为应用和非应用模式
    const { isApp, appGroup } = props;
    if (appGroup?.length === 0) {
      return [];
    }
    if (isApp) {
      return handleScope(scopesByApp.data);
    }
    return handleScope(cloudInstanceList && cloudInstanceList.data || []);
  }

  function handleHref() {
    pushUrl(history, '/manage/setting');
  }

  function renderTitle() {
    return (
      <div className={styles.scopeBalloon}>
        <Balloon align="r" trigger={
          // <span className={styles.tipWord}>遇到问题点我查看？</span>
          <span><Icon type="question-circle-fill" size="xs" className={styles.tipWord}/></span>

        } triggerType="hover" popupClassName={styles.scopeBalloon}>
          <ul>
            <p>若遇到问题，请按照下面顺序排查:</p>
            <li>1. 前往<a onClick={handleHref}>探针管理</a>，确认机器的故障演练探针运行正常。</li>
            <li>2. 如果探针安装失败或者已失效，请重新<a onClick={handleHref}>安装探针</a>。</li>
            <li>3. 如果探针正常安装,请确认机器类型选择正确，如果探针类型是Kubernetes，机器类型请选择Kubernetes，否则请选择主机。</li>
            <li>4. 如果是子账号，请配置主机的演练创建权限。</li>
          </ul>
        </Balloon>
      </div>
    );
  }

  function onClose() {
    setInvalidVisible(false);
  }

  function handleDelete() {
    const { onChange, value } = props;
    setHostsValue(_.differenceBy(value, invalidHosts));
    setInvalidVisible(false);
    setInvalidHosts([]);
    setSelectedIps(_.filter(selectedIps, handleScope(value)));
    onChange && onChange(_.differenceBy(value, invalidHosts));
  }

  // 多选
  function handleSelect(keys: any[]) {
    setSelectedRowKeys(keys);
    handleConfirm(keys);
  }

  // 删除
  function handleDeleteSelected(ip: any) {
    if (ip) {
      handleConfirm(_.pull(selectedRowKeys, ip && ip.value));
      setSelectedRowKeys(_.pull(selectedRowKeys, ip && ip.value));
    }
  }

  // 移除全部
  function handleDeleteAll() {
    handleConfirm([]);
    setSelectedRowKeys([]);
  }

  const getSearchOptions = async (type: string, params: any) => {
    if (type === 'tag') {
      await dispatch.experimentDataSource.getSearchDeviceTags(params, res => {
        setSearchTypeOption({ searchTypeOption, tagLs: res! });
      });
    } else if (type === 'namespace') {
      await dispatch.experimentDataSource.getSearchK8sNamespaceTags(params, res => {
        setSearchTypeOption({ searchTypeOption, namespaceLs: res! });
      });
    } else if (type === 'clusterNames') {
      await dispatch.experimentDataSource.getSearchClusterNameTags(params, res => {
        setSearchTypeOption({ searchTypeOption, clusterNameLs: res! });
      });
    }
  };

  function handleSearchTypeChange(type: any) {
    const { appId, appGroup = [], isApp } = props;
    setPage(1);
    setSearchType(type);
    setSearchTypeOption({});
    const params:any = { key: '' };
    if (isApp) {
      params.groupNames = appGroup!;
      params.appId = appId;
    }
    if (appId && appGroup?.length > 0) {
      if ([ 'tag', 'namespace', 'clusterNames' ].includes(type)) {
        getSearchOptions(type, params);
      }
    }
  }

  const changeSearchs = (_key: string, _value: any) => {
    setPage(1);
    setSearchTypeInfo({ searchTypeInfo, [_key]: _value });
  };

  function handleSubmitSearch() {
    setUpdateScopes(!updateScopes);
    setDropDownVisible(false);
  }
  function renderSearchDropdown() {
    const { appId, appGroup, isApp, scopeType, experimentObj } = props;
    let disabled = false;
    if (isApp) {
      disabled = !(appId && !_.isEmpty(appGroup));
    }
    return <div className={styles.searchContent}>
      <Form {...formItemLayout}>
        {/* 主机 + 非应用 => 显示主机系统筛选条件 */}
        {scopeType === SCOPE_TYPE.HOST && experimentObj === APPLICATION_TYPE.HOSTS &&
          <FormItem label="主机系统">
            <RadioGroup
              value={scopesOsType}
              defaultValue={OS_TYPE.LINUX}
              onChange={value => {
                setScopesOsType(Number(value));
                props.osTypeChange!(Number(value));
              }}
            >
              <Radio value={OS_TYPE.LINUX} disabled={disabled}>linux</Radio>
              <Radio value={OS_TYPE.WINDOWS} disabled={disabled}>windows</Radio>
              {props.experimentObj === 0 && <Radio value={3} disabled={disabled}>按命名空间</Radio>}
            </RadioGroup>
          </FormItem>
        }
        <FormItem label="搜索方式">
          <RadioGroup
            value={searchType}
            onChange={handleSearchTypeChange as any}
          >
            {Object.keys(searchTypeConf).map((key:any) => {
              if (key === 'tag' && (!isApp && scopeType !== SCOPE_TYPE.HOST)) {
                return null;
              }
              if (([ 'namespace', 'clusterNames' ].includes(key) && (experimentObj !== 0 || scopeType !== SCOPE_TYPE.K8S))) {
                return null;
              }
              return (
                <Radio key={key} value={key} disabled={disabled}>{searchTypeConf[key].label}</Radio>
              );
            })}
          </RadioGroup>
        </FormItem>
        {searchType === 'ip' &&
          <FormItem label="机器IP" {...formItemLayout}>
            <Input placeholder="请输入机器IP" value={searchTypeInfo.key} disabled={disabled} onChange={(value: string) => changeSearchs('key', value)} hasClear/>
          </FormItem>
        }
        {searchType === 'tag' &&
          <FormItem label="标签">
            <Select placeholder="请输入标签关键词" disabled={disabled} dataSource={searchTypeOption?.tagLs || []} mode="tag" onChange={(value: string[]) => changeSearchs('tags', value)} style={{ width: '100%' }} value={searchTypeInfo.tags}/>
          </FormItem>
        }
        {searchType === 'namespace' &&
          <FormItem label="命名空间">
            <Select placeholder="请选择命名空间" disabled={disabled} dataSource={searchTypeOption?.namespaceLs || []} mode="tag" onChange={(value: string[]) => changeSearchs('namespaces', value)} style={{ width: '100%' }} value={searchTypeInfo.namespaces}/>
          </FormItem>
        }
        {searchType === 'clusterNames' &&
          <FormItem label="集群名称">
            <Select placeholder="请选择集群称" disabled={disabled} dataSource={searchTypeOption?.clusterNameLs || []} mode="tag" onChange={(value: string[]) => changeSearchs('clusterNames', value)} style={{ width: '100%' }} value={searchTypeInfo.clusterNames}/>
          </FormItem>
        }
        <div style={{ width: '100%' }}>
          <Button.Group style={{ float: 'right' }}>
            <Button type='primary' style={{ marginRight: 8 }} disabled={disabled} onClick={handleSubmitSearch}>确认</Button>
            <Button onClick={() => { setDropDownVisible(false); }}>取消</Button>
          </Button.Group>
        </div>
      </Form>
    </div>;
  }

  function renderSelected() {
    return <div className={styles.selectIps}>
      <div className={styles.actionContent}>
        <div className={styles.title}>{`已选择机器(${selectedRowKeys.length!})`}</div>
        {selectedIps.length > 0 && <span className={styles.deleteAll} onClick={handleDeleteAll}>全部移除</span>}
      </div>
      <span >
        {selectedIps.length > 0 && selectedIps.map((it: any) => {
          return (
            <Tag className={styles.closeTag} type='primary' key={it && it.value} style={it && it.invalid && { background: '#FFF7D1', border: '#FFF7D1', color: '#DDA200' }}>
              <span className={styles.tagContent}>{it && it.label}</span>
              <span className={styles.closeIcon} onClick={() => handleDeleteSelected(it)}><Icon type="close" /></span>
            </Tag>
          );
        })}
      </span>
    </div>;
  }

  const tableProps = {
    dataSource: handleIsAppOrNoApp(),
    primaryKey: 'value',
    hasBorder: false,
    rowSelection: {
      onChange: (keys: any[]) => handleSelect(keys),
      selectedRowKeys,
      getProps: (record: any) => {
        return {
          disabled: record && record.disabled,
        };
      },
    },
  };

  const paginationProps = {
    current: page,
    pageSize,
    total,
    pageShowCount: 2,
    hideOnlyOnePage: true,
    size: 'small',
    shape: 'arrow-only',
    onChange: (current: number) => { setPage(current); },
    totalRender: () => `共有: ${total}条`,
  };

  const tableColumnProps = {
    title: <span className={styles.titleContent}>
      <span style={{ display: 'flex' }}>
        {props.listTips}&nbsp;
        {!props.noSearch && renderTitle()}
      </span>
      <span>
        {!props.noSearch &&
          <Dropdown
            triggerType="click"
            visible={dropDownVisible}
            align="tr br"
            trigger={
              <span
                className={styles.tipWord}
                style={{ height: '28px', lineHeight: '28px', display: 'inline-block' }}
                onClick={() => {
                  setDropDownVisible(!dropDownVisible);
                  // 判断是否查询条件和资源类型是否对应，如果不对应，初始化查询条件
                  if (props.scopeType !== SCOPE_TYPE.K8S && searchType === 'namespace') {
                    setSearchTypeInfo(_.cloneDeep(defaultSearchInfo));
                    setSearchType('ip');
                  } else {
                    handleSearchTypeChange(searchType);
                  }
                }}
              >
                高级查询 <Icon type="arrow-down1" size="xs" style={{ color: 'inherit' }} />
              </span>
            }
          >
            {renderSearchDropdown()}
          </Dropdown>
        }
      </span>
    </span>,
    dataIndex: 'label',
    cell: (text:string, index:number, record: any) => {
      const { k8s, clusterId, clusterName, kubNamespace, deviceConfigurationId, disabled, authMessage } = record;
      // 判断如果是云实例不需要弹框
      if (props.scopeType === 3) {
        return text;
      }
      return (
        <Balloon trigger={text} triggerType="hover" align="r" popupClassName={styles.deviceBalloon} closable={false}>
          {k8s && <p><strong>机器信息</strong></p>}
          <ul className={styles.deviceInfo}>
            {disabled && authMessage && <li style={{ color: 'red' }}><strong>不可用原因: {authMessage || 'test'}</strong></li>}
            {k8s && clusterId && <li><strong>集群ID: </strong>{clusterId}</li>}
            {k8s && clusterName && <li><strong>集群名称: </strong>{clusterName}</li>}
            {k8s && kubNamespace && <li><strong>集群命名空间: </strong>{kubNamespace}</li>}
          </ul>
          {deviceConfigurationId && <a href={`${location.origin}/chaos/experiment/scope/detail?id=${deviceConfigurationId}`} target="_blank"
            // onClick={() => {
            //   pushUrl(history, '/chaos/experiment/scope/detail', { id: deviceConfigurationId });
            // }}
          >查看更多</a>}
        </Balloon>
      );
      return text;
    },
    style: { height: 36 },
  };

  return (
    <div className={styles.scopeContent}>
      <ListSelect
        width='100%'
        height='100%'
        tableProps={tableProps}
        paginationProps={paginationProps}
        selectedContent={renderSelected()}
        tableColumnProps={tableColumnProps}
      />
      <InvalidHostsDialog
        visible={invalidVisible}
        onClose={onClose}
        data={handleScope(invalidHosts)}
        deleteHosts={handleDelete}
      />
    </div>
  );
};

export default ScopeList;
