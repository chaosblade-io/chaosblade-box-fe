import HitsChart from './HitsChart';
import MetricChart from './MetricChart';
import React from 'react';
import _ from 'lodash';

const CUSTOM_APP_CODE_PREFIX = 'mkapp';

const METRIC_CHART_CODES = [ 'mkapp.k8s.ingressCheck' ];
const METRIC_CHART_TYPES = [ 'metric' ];

const HITS_CHART_TYPES = [ 'hits' ];

const getPlugin = (code: string, props: any) => {
  if (_.indexOf(METRIC_CHART_CODES, code) !== -1) {
    return React.createElement(MetricChart, { refresh: false, ...props });
  }

  const codes = _.split(code, '.', 3);
  if (codes[ 0 ] === CUSTOM_APP_CODE_PREFIX && _.indexOf(METRIC_CHART_TYPES, codes[ 1 ]) !== -1) {
    return React.createElement(MetricChart, { refresh: true, ...props });
  }
  if (codes[ 0 ] === CUSTOM_APP_CODE_PREFIX && _.indexOf(HITS_CHART_TYPES, codes[ 1 ]) !== -1) {
    return React.createElement(HitsChart, { refresh: true, ...props });
  }
  return null;
};

export { getPlugin };

