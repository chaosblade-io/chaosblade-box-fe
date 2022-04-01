import ChartContainer from './ChartContainer';
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Axis, Chart, Geom, Tooltip } from 'bizcharts';

const PERCENT_UNIT = '%';
interface MetricChartProps {
  width: number;
  height: number;
  data: any[];
  chartData: any[];
}

export default function MetricChart(props: MetricChartProps) {

  function getResponseItemValue(item: number, unit: string) {
    if (unit === PERCENT_UNIT && _.isNumber(item)) {
      return item * 100;
    }
    return item;
  }

  function getChartData() {
    const { data } = props;
    const chartData: any[] = [];
    if (!_.isEmpty(data)) {
      if (_.isEmpty(data)) {
        return [];
      }

      const response = _.orderBy(data, [ 'timestamp' ]);
      _.map(response, (val: any) => {
        val = {
          value: getResponseItemValue(val.value, val.unit),
          timestamp: val.timestamp,
          hostIp: val.host,
          unit: val.unit,
        };
        chartData.push(val);
      });

    }
    return chartData;
  }

  function renderChart(chartProps: any, fullscreen: boolean) {
    const { data, chartData } = props || {};
    const { width } = chartProps || {};
    let axisYUnit = '';
    if (!_.isEmpty(chartData)) {
      const item = chartData[ 0 ];
      if (_.isEmpty(item)) {
        axisYUnit = item.unit;
      }
    }

    return (
      <Chart
        height={fullscreen ? 300 : 175 }
        width={width && _.isNumber(width) && width > 0 ? width : 350}
        data={data}
        forceFit
        padding='auto'
      >
        <Tooltip />
        <Axis name="timestamp"
          label={{
            formatter: val => moment(parseInt(val)).format('HH:mm'),
          }}
        />
        <Axis name="value"
          label={{
            formatter: val => {
              let value: any = val;
              if (_.isNumber(val)) {
                value = parseInt(val).toFixed(1);
              }
              return `${value}${_.defaultTo(axisYUnit, '')}`;
            },
          }}
        />
        <Geom
          type="line"
          position="timestamp*value"
          size={2}
          color={[ 'group', [ '#7C6AF2', '#5C89FF' ]]}
          shape={'smooth'}
          tooltip={[ 'timestamp*value*group', (time, value, group) => {
            return {
              title: moment(time).format('HH:mm:ss'),
              name: group,
              value,
            };
          } ]}
        />
        <Geom
          type="point"
          position="timestamp*value"
          size={3}
          shape={'circle'}
          color={[ 'group', [ '#7C6AF2', '#5C89FF' ]]}
          style={{
            stroke: '#fff',
            lineWidth: 1,
          }}
          tooltip={[ 'timestamp*value*group', (time, value, group) => {
            return {
              title: moment(time).format('HH:mm:ss'),
              name: group,
              value,
            };
          } ]}
        />
      </Chart>
    );
  }

  return (
    <ChartContainer
      {...props}
      convertChartData={getChartData}
      renderChart={renderChart}
    />
  );
}
