/* tslint:disable */
import Layout from 'components/Layout';
import Loading from 'components/Loading';
import React, { Suspense } from 'react';
import { Router as IRouter, RouterAPI, router as dvaRouter } from 'dva';

import ChaosIndex from 'pages/Chaos';
import Login from 'pages/Login';
import Overview from 'pages/Chaos/Overview';

const { Route, Router, Switch, Redirect } = dvaRouter;
// eslint-disable-next-line
// @ts-ignore
const router: IRouter = (routerApi?: RouterAPI) => {

  const loading: any = <Loading />;
  if (!routerApi) return {};
  return (
    <Router history={routerApi.history}>
      <Layout>
        <Suspense fallback={loading}>
          <Switch>
            <Route path="/index" component={Overview} />
            <Route path="/chaos" component={ChaosIndex} />
            <Route path="/login" component={Login} />
            <Redirect to={'/index'} />
          </Switch>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default router;
