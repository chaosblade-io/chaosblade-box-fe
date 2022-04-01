import React, { FC, lazy } from 'react';
import { router } from 'dva';
const AgentSettingList = lazy(() => import('pages/Manage/AgentSetting/List'));
const AgentSettingDetail = lazy(() => import('pages/Manage/AgentSetting/Detail'));
const AgentSettingStep = lazy(() => import('pages/Manage/AgentSetting/Step'));
const AgentSettingTools = lazy(() => import('pages/Manage/AgentSetting/Tools'));

const { Switch, Route, useRouteMatch } = router;

const Manage: FC = () => {
  const { path = '/manage' } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}/setting`} component={AgentSettingList}/>
      <Route exact path={`${path}/setting/k8sHost`} component={AgentSettingList}/>
      <Route exact path={`${path}/setting/detail`} component={AgentSettingDetail}/>
      <Route exact path={`${path}/setting/step`} component={AgentSettingStep}/>
      <Route exact path={`${path}/setting/tools`} component={AgentSettingTools}/>
    </Switch>
  );
};

export default Manage;
