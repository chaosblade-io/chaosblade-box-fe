import React, { FC, lazy } from 'react';
import { router } from 'dva';
// const ExperimentList = lazy(() => import('./ExperimentList'));
const ExperimentEditor = lazy(() => import('./Experiment/ExperimentEditor'));
const ExperimentDetail = lazy(() => import('./Experiment/ExperimentDetail'));
const ExperimentTask = lazy(() => import('./Experiment/ExperimentTask'));
const BaseInfoEditor = lazy(() => import('./Experiment/ExperimentEditor/BaseInfoEditor'));
const ExpertiseAdmin = lazy(() => import('./ExpertiseAdmin'));
const ExpertiseList = lazy(() => import('./ExpertiseList'));
const ExpertiseDetail = lazy(() => import('./ExpertiseList/ExpertiseDetail'));
const ExpertiseEditor = lazy(() => import('./ExpertiseAdmin/ExpertiseEditor'));
const AppLication = lazy(() => import('./Application'));
const ApplicationDetail = lazy(() => import('./Application/ApplicationDetail'));
const ScopeList = lazy(() => import('./Application/ScopeList'));
const TaskList = lazy(() => import('./Application/TaskList'));
const ApplicationSetting = lazy(() => import('./Application/ApplicationSetting'));
/** 机器- 探针 管理 */
const ScopesControl = lazy(() => import('./ScopesControl'));
const ScopesControlDetail = lazy(() => import('./ScopesControlDetail'));
/** 机器页面 - 安装探针 */
const AgentManage = lazy(() => import('./ScopesControl/Manage'));
const ApplicationAccess = lazy(() => import('./Application/ApplicationAccess'));
const Category = lazy(() => import('./Category'));
/** 空间管理 */
const WorkSpace = lazy(() => import('./WorkSpace'));
/** 我的空间 */
const WorkspaceDetail = lazy(() => import('./WorkspaceDetail'));

const SceneFunction = lazy(() => import('./SceneFunction'));
const Overview = lazy(() => import('./Overview'));

const { Switch, Route, useRouteMatch } = router;
const Arch: FC = () => {
  const { path = '/chaos' } = useRouteMatch();

  return (
    <Switch>
      {/* <Route exact path={`${path}`} component={WorkspaceDetail} /> */}
      <Route exact path={`${path}`} component={Overview} />
      <Route exact path={`${path}/experiment/editor`} component={ExperimentEditor} />
      <Route exact path={`${path}/experiment/detail`} component={ExperimentDetail} />
      <Route exact path={`${path}/experiment/task`} component={ExperimentTask} />
      <Route exact path={`${path}/baseInfo/editor`} component={BaseInfoEditor} />
      <Route exact path={`${path}/expertise/admin`} component={ExpertiseAdmin} />
      <Route exact path={`${path}/expertise/editor`} component={ExpertiseEditor} />
      <Route exact path={`${path}/expertise/list`} component={ExpertiseList} />
      <Route exact path={`${path}/expertise/detail`} component={ExpertiseDetail} />
      <Route exact path={`${path}/application`} component={AppLication} />
      <Route exact path={`${path}/application/detail`} component={ApplicationDetail} />
      <Route exact path={`${path}/application/scopelist`} component={ScopeList} />
      <Route exact path={`${path}/application/tasklist`} component={TaskList} />
      <Route exact path={`${path}/application/setting`} component={ApplicationSetting} />
      <Route exact path={`${path}/experiment/scope/control`} component={ScopesControl} />
      <Route exact path={`${path}/experiment/scope/detail`} component={ScopesControlDetail} />
      <Route path={`${path}/agentmanage/setting`} component={AgentManage} />
      <Route exact path={`${path}/freshapplication/access`} component={ApplicationAccess} />
      <Route exact path={`${path}/category`} component={Category} />
      <Route exact path={`${path}/experiment/space`} component={WorkSpace} />
      <Route exact path={`${path}/workspace`} component={WorkSpace} />
      <Route exact path={`${path}/workspace/detail`} component={WorkspaceDetail} />
      <Route exact path={`${path}/workspace/owner`} component={WorkspaceDetail} />
      <Route exact path={`${path}/workspace/list`} component={WorkSpace} />
      <Route exact path={`${path}/expertises`} component={ExpertiseList} />
      <Route exact path={`${path}/scenes`} component={SceneFunction} />
      <Route exact path={`${path}/overview`} component={Overview} />
    </Switch>
  );
};

export default Arch;
