import DataSet from '@antv/data-set';
import React, { memo, useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Axis,
  Chart,
  Coord,
  Geom,
  Guide,
  Label,
  Legend,
  Tooltip,
} from 'bizcharts';
import { IScopeControlRingChartData } from 'config/interfaces/Chaos/scopesControl';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';


function RingChart() {
  const id = useQuery('id');
  const dispatch = useDispatch();
  const [ dataSource, setDataSource ] = useState<IScopeControlRingChartData[]>([]);


  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.scopesControl.getScopeSceneFunctionCount({ configuration_id: id });
      if (Data) {
        setDataSource(Data);
      }
    })();
    return () => { setDataSource([]); };
  }, []);

  if (_.isEmpty(dataSource)) {
    return null;
  }

  function handleNumber(val: number | string) {
    const preValue = val as number * 100;
    val = preValue.toFixed(2) + '%';
    return val;
  }

  const { DataView } = DataSet;
  const { Html } = Guide;
  const dv = new DataView();
  dv.source(dataSource).transform({
    type: 'percent',
    field: 'count',
    dimension: 'name',
    as: 'percent',
  });
  const cols = {
    percent: {
      formatter: (val: string | number) => handleNumber(val),
    },
  };

  return (
    <div>
      <Chart
        height={145}
        data={dv}
        scale={cols}
        padding={[ 0, 0, 0, 0 ]}
        forceFit
      >
        <Coord type={'theta'} radius={0.7} innerRadius={0.62} />
        <Axis name="percent" />
        <Legend
          position="right"
          offsetY={5}
          offsetX={-40}
          useHtml={true}
          scroll={true}
          itemTpl={'<li class="g2-legend-list-item item-{index} {checked}" data-color="{originColor}" data-value="{originValue}" style="cursor: pointer;font-size: 12px;overflow:hidden;text-overflow: ellipsis;width: 100px;white-space: nowrap;height: 16px" title={value}>'
            + '<i class="g2-legend-marker" style="width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:10px;background-color: {color};"></i>'
            + '<span class="g2-legend-text" style="width:84px;">{value}</span>'
            + '</li>'}
        />
        <Tooltip
          showTitle={false}
          itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
        />
        <Guide>
          <Html
            position={[ '50%', '50%' ]}
            html="<div style=&quot;color:#333;font-size:12px;text-align: center;&quot;>近三月<br><span style=&quot;color:#333;font-size:12px&quot;>演练情况</span></div>"
            alignX="middle"
            alignY="middle"
          />
        </Guide>
        {/* @ts-ignore */}
        <Geom
          type="intervalStack"
          position="percent"
          color="name"
          tooltip={[
            'name*percent',
            (name, percent) => {
              return {
                name,
                value: handleNumber(percent),
              };
            },
          ]}
          style={{
            lineWidth: 1,
            stroke: '#fff',
          }}
        >
          <Label
            content="percent"
          />
        </Geom>
      </Chart>
    </div>
  );
}

export default memo(RingChart);
