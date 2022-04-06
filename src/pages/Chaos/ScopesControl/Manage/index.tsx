import React, { FC, lazy, useEffect } from 'react';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { router } from 'dva';
import { useDispatch } from 'utils/libs/sre-utils-dva';
const AgentSettingList = lazy(() => import('pages/Manage/AgentSetting/List'));
const AgentSettingStep = lazy(() => import('pages/Manage/AgentSetting/Step'));
const AgentSettingTools = lazy(() => import('pages/Manage/AgentSetting/Tools'));
const { Switch, Route, useRouteMatch } = router;

import _ from 'lodash';

const Manage: FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const _breadCrumbLs = _.cloneDeep(chaosDefaultBreadCrumb);
    _breadCrumbLs.push({
      key: 'scope_control',
      value: '探针管理',
      path: '/chaos/experiment/scope/control',
    });
    if (/\agentmanage\/setting\/step/.test(location.pathname)) {
      _breadCrumbLs.push({
        key: 'agentmanage_setting',
        value: '探针接入',
        path: location.pathname,
      });
    }
    if (/\agentmanage\/setting\/tools/.test(location.pathname)) {
      _breadCrumbLs.push({
        key: 'setting/tools',
        value: '工具管理',
        path: location.pathname,
      });
    }
    dispatch.pageHeader.setBreadCrumbItems(_breadCrumbLs);
  }, []);
  const { path = '/agentmanage/setting' } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}`} component={AgentSettingList}/>
      <Route exact path={`${path}/k8sHost`} component={AgentSettingList}/>
      <Route exact path={`${path}/step`} component={AgentSettingStep}/>
      <Route exact path={`${path}/tools`} component={AgentSettingTools}/>
    </Switch>
  );
};

export default Manage;
