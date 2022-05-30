import React, { useEffect, useState } from 'react';
import i18n from '../../../../i18n';
import {
  Axis,
  Chart,
  Geom,
  Legend,
  Tooltip,
} from 'bizcharts';
import { IExperimentSummaryInfo } from 'config/interfaces/Chaos/workspace';

interface IProps {
  data: IExperimentSummaryInfo[];
}

interface IDataSource {
  type: string;
  content: number;
  date: string;
}

const TaskChart = (props: IProps) => {
  const [ dataSource, setDataSource ] = useState<IDataSource[]>([]);

  useEffect(() => {
    handleDisposeChartData(props.data);
  }, [ props.data ]);

  function handleDisposeChartData(data: IExperimentSummaryInfo[]) {
    const list: IDataSource[] = [];
    data.forEach((item: any) => {
      list.push({
        type: i18n.t('Number of drills per day'),
        content: item.totalSize,
        date: item.date,
      });
      list.push({
        type: i18n.t('Number of successes per day'),
        content: item.successSize,
        date: item.date,
      });
      list.push({
        type: i18n.t('A single day does not meet expectations'),
        content: item.unexpectedSize,
        date: item.date,
      });
    });
    setDataSource(list);
  }

  return (
    <div style={{ marginTop: 18 }}>
      <Chart
        height={230}
        data={dataSource}
        forceFit
        padding={'auto'}
      >
        <Legend marker="circle" />
        <Axis name="date" />
        <Axis
          name="content"
        />
        <Tooltip
          crosshairs={{
            type: 'y',
          }}
        />
        <Geom
          type="line"
          position="date*content"
          size={2}
          color={'type'}
        />
        <Geom
          type="point"
          position="date*content"
          size={4}
          shape={'circle'}
          color={'type'}
          style={{
            stroke: '#fff',
            lineWidth: 1,
          }}
        />
      </Chart>
    </div>
  );
};

export default TaskChart;
