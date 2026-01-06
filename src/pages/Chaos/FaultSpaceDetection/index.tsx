import React, { FC, lazy } from 'react';
import { router } from 'dva';

const DetectionTasks = lazy(() => import('./DetectionTasks'));
const AddDetection = lazy(() => import('./AddDetection'));
const DetectionRecords = lazy(() => import('./DetectionRecords'));
const TaskDetail = lazy(() => import('./TaskDetail'));
const DrillRecord = lazy(() => import('./DrillRecord'));

const { Switch, Route, useRouteMatch } = router;

const FaultSpaceDetection: FC = () => {
  const { path = '/chaos/fault-space-detection' } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/records/:runId`} component={DrillRecord} />
      <Route exact path={`${path}/tasks/:taskId`} component={TaskDetail} />
      <Route exact path={`${path}/tasks`} component={DetectionTasks} />
      <Route exact path={`${path}/add`} component={AddDetection} />
      <Route exact path={`${path}/records`} component={DetectionRecords} />
      {/* 默认重定向到任务列表 */}
      <Route exact path={path} component={DetectionTasks} />
    </Switch>
  );
};

export default FaultSpaceDetection;
