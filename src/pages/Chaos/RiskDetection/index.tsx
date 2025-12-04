import React, { FC, lazy } from 'react';
import { router } from 'dva';

const RiskTopology = lazy(() => import('./components/RiskTopology'));
const RiskAnalysis = lazy(() => import('./components/RiskAnalysis'));
const DrillResults = lazy(() => import('./components/DrillResults'));

const { Switch, Route, useRouteMatch } = router;

const RiskDetection: FC = () => {
  const { path = '/chaos/risk-detection' } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}`} component={RiskTopology} />
      <Route exact path={`${path}/analysis`} component={RiskAnalysis} />
      <Route exact path={`${path}/drill-results`} component={DrillResults} />
    </Switch>
  );
};

export default RiskDetection;

