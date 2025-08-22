import React from 'react';

import * as _ from 'lodash';
import { Chart, Geom, Tooltip } from 'bizcharts';

import ChartContainer from './ChartContainer';

interface HitsChartProps{
  [key: string]: any;
}

export default function HitsChart(props: HitsChartProps) {
  const { width, height, data } = props || {};

  function renderChart() {
    return (
      <Chart
        height={_.isNumber(height) && height > 0 ? height : 320}
        width={_.isNumber(width) && width > 0 ? width : 350}
        autoFit
        data={data}
        padding='auto'

      >
        <Geom type='interval' position="host*value"/>
        <Tooltip shared />
      </Chart>
    );
  }

  return (
    <ChartContainer
      {...props}
      convertChartData={data}
      renderChart={renderChart}
    />
  );

}
