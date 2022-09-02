import InvalidHostsDialog from './InvalidHostsDialog';
import ListSelect from 'pages/Chaos/common/ListSelect';
import React, { FC, useEffect, useRef, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import i18n from '../../../../../../../i18n';
import locale from 'utils/locale';
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
    label: i18n.t('By machine IP').toString(),
  },
  tag: {
    label: i18n.t('By Machine Label').toString(),
  },
  namespace: {
    label: i18n.t('By namespace').toString(),
  },
  clusterNames: {
    label: i18n.t('Filter by cluster').toString(),
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
  const { scopesByApp, scopesNoApp } = useSelector(state => {
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
    if (osType === OS_TYPE.LINUX) return osType;
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
    const { scopeType, isApp, appId, appGroup, osType } = props;
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
      } else {
        await dispatch.experimentDataSource.getScopeNoApplication({
          ...params,
          scopeType,
          osType: scopesOsType,
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
    return handleScope(scopesNoApp.data);
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
            <p><Translation>If you encounter problems, please check in the following order</Translation>:</p>
            <li>1. <Translation>Go to</Translation><a onClick={handleHref}><Translation>Probe Management</Translation></a>，<Translation>Verify that the machine's fault drill probe is functioning properly</Translation></li>
            <li>2. <Translation>If the probe installation fails or has expired, please re-install</Translation><a onClick={handleHref}><Translation>Install the probe</Translation></a></li>
            <li>3. <Translation>If the probe is installed normally, please confirm that the machine type is selected correctly. If the probe type is Kubernetes, please select Kubernetes for the machine type, otherwise please select the host</Translation></li>
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
          <FormItem label={i18n.t('Host system').toString()}>
            <RadioGroup
              value={scopesOsType}
              defaultValue={OS_TYPE.LINUX}
              onChange={value => {
                setScopesOsType(Number(value));
                props.osTypeChange!(Number(value));
              }}
            >
              <Radio value={OS_TYPE.LINUX} disabled={disabled}><Translation>linux</Translation></Radio>
              {props.experimentObj === 0 && <Radio value={3} disabled={disabled}><Translation>By namespace</Translation></Radio>}
            </RadioGroup>
          </FormItem>
        }
        <FormItem label={i18n.t('Search method').toString()}>
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
          <FormItem label={i18n.t('Machine IP').toString()} {...formItemLayout}>
            <Input placeholder={i18n.t('Please input the machine ip').toString()} value={searchTypeInfo.key} disabled={disabled} onChange={(value: string) => changeSearchs('key', value)} hasClear/>
          </FormItem>
        }
        {searchType === 'tag' &&
          <FormItem label={i18n.t('Tag').toString()}>
            <Select placeholder={i18n.t('Please enter a tag keyword').toString()} disabled={disabled} dataSource={searchTypeOption?.tagLs || []} mode="tag" onChange={(value: string[]) => changeSearchs('tags', value)} style={{ width: '100%' }} value={searchTypeInfo.tags} locale={locale().Select}/>
          </FormItem>
        }
        {searchType === 'namespace' &&
          <FormItem label={i18n.t('Namespaces').toString()}>
            <Select placeholder={i18n.t('Please select a namespace').toString()} disabled={disabled} dataSource={searchTypeOption?.namespaceLs || []} mode="tag" onChange={(value: string[]) => changeSearchs('namespaces', value)} style={{ width: '100%' }} value={searchTypeInfo.namespaces} locale={locale().Select}/>
          </FormItem>
        }
        {searchType === 'clusterNames' &&
          <FormItem label={i18n.t('Cluster name').toString()}>
            <Select placeholder={i18n.t('Please select a cluster name').toString()} disabled={disabled} dataSource={searchTypeOption?.clusterNameLs || []} mode="tag" onChange={(value: string[]) => changeSearchs('clusterNames', value)} style={{ width: '100%' }} value={searchTypeInfo.clusterNames} locale={locale().Select}/>
          </FormItem>
        }
        <div style={{ width: '100%' }}>
          <Button.Group style={{ float: 'right' }}>
            <Button type='primary' style={{ marginRight: 8 }} disabled={disabled} onClick={handleSubmitSearch}><Translation>Confirm</Translation></Button>
            <Button onClick={() => { setDropDownVisible(false); }}><Translation>cancel</Translation></Button>
          </Button.Group>
        </div>
      </Form>
    </div>;
  }

  function renderSelected() {
    return <div className={styles.selectIps}>
      <div className={styles.actionContent}>
        <div className={styles.title}>{`${i18n.t('Machine selected').toString()}(${selectedRowKeys.length!})`}</div>
        {selectedIps.length > 0 && <span className={styles.deleteAll} onClick={handleDeleteAll}><Translation>Remove all</Translation></span>}
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
                <Translation>Advanced Search</Translation> <Icon type="arrow-down1" size="xs" style={{ color: 'inherit' }} />
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
          {k8s && <p><strong><Translation>Machine information</Translation></strong></p>}
          <ul className={styles.deviceInfo}>
            {disabled && authMessage && <li style={{ color: 'red' }}><strong><Translation>Unavailable reason</Translation>: {authMessage || 'test'}</strong></li>}
            {k8s && clusterId && <li><strong><Translation>Cluster ID</Translation>: </strong>{clusterId}</li>}
            {k8s && clusterName && <li><strong><Translation>Cluster name</Translation>: </strong>{clusterName}</li>}
            {k8s && kubNamespace && <li><strong><Translation>Cluster namespace</Translation>: </strong>{kubNamespace}</li>}
          </ul>
          {deviceConfigurationId && <a href={`${location.origin}/chaos/experiment/scope/detail?id=${deviceConfigurationId}`} target="_blank"
            // onClick={() => {
            //   pushUrl(history, '/chaos/experiment/scope/detail', { id: deviceConfigurationId });
            // }}
          ><Translation>See more</Translation></a>}
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
