import AddExperiment from './AddExperiment';
import Experiments from './Experiments';
import ExpertiseCard from './ExpertiseCard';
import React, { useEffect, useState } from 'react';
import Statistic from './Statistic';
import TagsSearch from './TagsSearch';
import _ from 'lodash';
import styles from './index.css';
import { Button, Checkbox, Dialog, Dropdown, Icon, Menu, Message, Search, Select, Switch } from '@alicloud/console-components';
import { IStatisitcInfo } from 'config/interfaces/Chaos/experimentList';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { getParams, pushUrl } from 'utils/libs/sre-utils';

import { SearchOptDict } from 'config/constants/Chaos/ExperimentConstants';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';
import { useInterval } from 'utils/libs/sre-utils-hooks';

const ExperimentsList = (props: { workspaceName: string }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const workspaceId = getParams('workspaceId');
  const uStatus: string | any = getParams('_st'); // 状态

  const { chaosContext } = useSelector(state => {
    return {
      loading: state.loading.effects['experimentList/getExperimentList'],
      chaosContext: state.loginUser,
    };
  });

  const [ statisitcInfo, setStatisitcInfo ] = useState<IStatisitcInfo>();
  const [ searchKey, setSearchKey ] = useState('');
  const [ tempStatus, setTempStatus ] = useState(uStatus?.split(',') || []);
  const [ selStatus, setSelStatus ] = useState(uStatus?.split(',') || []);
  const [ page, setPage ] = useState(1);
  const [ searchTags, setSearchTags ] = useState<string[]>([]);
  const [ tagNames, setTagNames ] = useState<string[]>([]);
  const [ taskFlag, setTaskFlag ] = useState(false);
  const [ createFlag, setCreateFlag ] = useState(false);
  const [ visible, setVisible ] = useState(false);
  const [ permission, setPermission ] = useState<number>(7);
  const [ updateExperiment, setUpdateExperiment ] = useState(false); // 领取体验包后的数据更新
  const [ filterUserIdFlag, setFilterUserIdFlag ] = useState(false);
  const [ scheduler, setScheduler ] = useState(false); // 是否只展示 定时任务演练

  const [ showCreateMenu, setShowCreateMenu ] = useState(false);

  useEffect(() => {
    dispatch.pageHeader.setTitle('演练列表页');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'experimentlist',
        value: '演练列表',
        path: '/chaos',
      },
    ]));
  }, []);

  useEffect(() => {
    (async function() {
      await dispatch.expertises.getExpertiseBase({ page: 1, size: 10 });
    })();
  }, []);

  useEffect(() => {
    (async function() {
      if (!_.isEmpty(workspaceId)) {
        const { Data } = await dispatch.experimentList.getGeneralWorkSpaceStatInfo({ workspaceId });
        setStatisitcInfo(Data);
      } else {
        const { Data: data } = await dispatch.experimentList.getExperimentTaskStatistic();
        setStatisitcInfo(data);
      }
    })();
  }, [ taskFlag, workspaceId ]);

  useEffect(() => {
    const { status, results } = dealwithStatus();
    (async function() {
      if (!_.isEmpty(workspaceId) && !_.isEmpty(chaosContext)) {
        // 普通空间
        const params: any = {
          searchKey,
          states: status,
          results,
          page,
          size: 10,
          tagNames,
          workspaceId,
        };
        const { userId } = chaosContext;
        if (filterUserIdFlag) {
          params.filterUserId = userId;
        }
        const permission = await dispatch.experimentList.getPageableGeneralExperiments({ ...params });
        setPermission(permission);
      } else {
        // 我的空间
        await dispatch.experimentList.getExperimentList({ searchKey, states: status, results, page, size: 10, tagNames, scheduler });
      }
    })();
  }, [ searchKey, selStatus, page, tagNames, workspaceId, updateExperiment, filterUserIdFlag, scheduler ]);

  useInterval(() => {
    if (statisitcInfo && statisitcInfo.running) {
      getExperimentTotals();
    }
  }, (statisitcInfo && statisitcInfo.running) ? 5000 : null);

  const dealwithStatus = () => {
    if (selStatus.length === 0) {
      return { status: [], results: [] };
    }
    const statusLs: string[] = [];
    let resultLs: string[] = [];
    selStatus.map((item: string) => {
      const { status, results } = SearchOptDict[item] || {};
      statusLs.push(status);
      resultLs = [ ...resultLs, ...results ];
      return item;
    });
    return { status: Array.from(new Set(statusLs)), results: Array.from(new Set(resultLs)) };
  };
  async function getExperimentTotals() {
    const { status, results } = dealwithStatus();
    if (!_.isEmpty(workspaceId)) {
      // 从普通空间进入
      const params: any = {
        searchKey,
        states: status || [],
        results,
        page,
        size: 10,
        tagNames,
        workspaceId,
      };
      const { userId } = chaosContext;
      if (filterUserIdFlag) {
        params.filterUserId = userId;
      }
      const permission = await dispatch.experimentList.getPageableGeneralExperiments({ ...params });
      setPermission(permission);
      setTaskFlag(!taskFlag);
    } else {
      // 从我的空间进入
      await dispatch.experimentList.getExperimentList({ searchKey, states: status, results, page, size: 10, tagNames, scheduler });
      setTaskFlag(!taskFlag);
    }
  }

  async function getListExperimentTags() {
    if (!_.isEmpty(workspaceId)) {
      // 普通空间标签
      const { Data } = await dispatch.experimentList.listGeneralWorkspaceExperimentTags({ workspaceId });
      if (!_.isEmpty(Data)) {
        setSearchTags(Data);
      }
    } else {
      // 我的空间标签
      const { Data } = await dispatch.experimentList.getListExperimentTags();
      if (!_.isEmpty(Data)) {
        setSearchTags(Data);
      }
    }
  }
  useEffect(() => {
    setSelStatus(uStatus?.split(',') || []);
    setPage(1);
  }, [ uStatus ]);

  function handleSelectChange() {
    pushUrl(history, '/chaos/workspace/owner', { _st: tempStatus.join(',') });
  }

  function handleSearchChange(value: any) {
    setSearchKey(value);
    setPage(1);
  }

  function handlePageChange(value: number) {
    setPage(value);
  }

  function handleSearchTags(tags: any) {
    setTagNames(tags);
    setPage(1);
  }

  async function stopAllExperimentTasks() {
    const data = await dispatch.experimentList.stopAllExperimentTasks();
    if (data.Success) {
      getExperimentTotals();
    }
  }

  function handleClose() {
    dispatch.experimentEditor.setClearExperiment();
    setCreateFlag(!createFlag);
  }

  function handleEmptyCreate() {
    pushUrl(history, '/chaos/experiment/editor');
  }

  function handleChoseCreate(value: any) {
    const { expertise_id } = value;
    const scope_type = _.get(value, 'scope_type', []);
    const type: string[] = [];
    scope_type.forEach((item: number) => {
      if (item === 0) {
        type.push('主机');
      }
      if (item === 2) {
        type.push('Kubernetes');
      }
    });
    Message.show({
      type: 'notice',
      title: (<div>{`当前经验支持${type.join(',')}应用类型`}</div>),
    });
    pushUrl(history, '/chaos/experiment/editor', {
      expertiseId: expertise_id,
    });
  }

  function handleApplicationAccess() {
    pushUrl(history, '/chaos/freshapplication/access');
  }
  const onClickCreate = (key: string) => {
    dispatch.experimentEditor.setClearExperiment();
    if (key === '-1') {
      setCreateFlag(!createFlag);
    } else {
      // 判断 有无权限
      pushUrl(history, key);
    }
  };
  function renderOperations() {
    const running = statisitcInfo && statisitcInfo.running;
    return (
      <div className={styles.operations}>
        <div style={{ display: 'flex' }}>
          <Dropdown
            onVisibleChange={(visible: boolean) => setShowCreateMenu(visible)}
            trigger={
              <Button className={styles.createButton} type='primary' >
                新建演练 <Icon type={showCreateMenu ? 'angle-down' : 'angle-right'} />
              </Button>
            }>
            <Menu className={styles.createMenu} onItemClick={(key:string) => onClickCreate(key)}>
              <Menu.Item key="/chaos/experiment/editor">新建空白演练</Menu.Item>
              <Menu.Item key="-1">从经验库新建</Menu.Item>
            </Menu>
          </Dropdown>
          {workspaceId &&
            <Button style={{ marginLeft: 8 }} onClick={handleCancel} >
              添加演练
            </Button>
          }
          <Button
            className={styles.stopButton}
            warning
            disabled={running === 0}
            onClick={() => {
              Dialog.confirm({
                title: '停止所有演练',
                content: `当前有${running}个演练正在进行中，是否全部停止？`,
                locale: {
                  ok: '确定',
                  cancel: '取消',
                },
                onOk: () => stopAllExperimentTasks(),
              });
            }}
          >
            全部停止
          </Button>
          <Select
            placeholder="请选择状态"
            className={styles.select}
            mode="multiple"
            tagInline={true}
            maxTagPlaceholder={() => ''}
            onChange={values => setTempStatus(values)}
            onBlur={handleSelectChange}
            value={tempStatus}
          >
            {Object.keys(SearchOptDict).map((item:string) => {
              const { name } = SearchOptDict[item] || {};
              return <Select.Option key={item} value={item}>{name}</Select.Option>;
            })}
          </Select>
          <TagsSearch
            data={searchTags}
            onSubmit={handleSearchTags}
            tagNames={tagNames}
            onFocus={getListExperimentTags}
          />
          <Search
            shape={'simple'}
            className={styles.search}
            placeholder='请输入演练名称'
            onChange={handleSearchChange}
          />
          {workspaceId &&
            <div className={styles.switch}>
              <span>仅展示自己的演练</span>
              <Switch size='small' checked={filterUserIdFlag} onChange={value => setFilterUserIdFlag(value)} />
            </div>
          }
          <Checkbox className={styles.schedulerCb} checked={scheduler} onChange={(checked: boolean) => setScheduler(checked)}>只看定时演练</Checkbox>
        </div>
        <span>
          <Button type='primary' text onClick={handleApplicationAccess} >
            应用接入
          </Button>
        </span>
      </div>
    );
  }

  function handleCancel() {
    setVisible(!visible);
  }

  function getExperienceBag() {
    setUpdateExperiment(true);
  }

  function handleTagChange(tag: string) {
    if (!tagNames.includes(tag)) {
      setTagNames([ ...tagNames, tag ]);
    } else {
      const t = _.pull(tagNames, tag);
      setTagNames([ ...t ]);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <Statistic statisitcInfo={statisitcInfo} />
      {renderOperations()}
      <Experiments
        workspaceName={props.workspaceName}
        running={statisitcInfo && statisitcInfo.running}
        permission={permission}
        handlePageChange={handlePageChange}
        handleTagChange={handleTagChange}
        page={page}
        getExperimentTotals={getExperimentTotals}
        getExperienceBag={getExperienceBag}
      />
      <ExpertiseCard visible={createFlag} hideEmpty={true} handleClose={handleClose} onEmpty={handleEmptyCreate} handleChoseCreate={handleChoseCreate} />
      <AddExperiment getExperimentTotals={getExperimentTotals} visible={visible} onCancel={handleCancel} />
    </div>
  );
};

export default ExperimentsList;
