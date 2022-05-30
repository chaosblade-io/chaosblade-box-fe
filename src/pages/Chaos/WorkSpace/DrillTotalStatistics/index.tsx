import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import styles from './index.css';
import {
  Axis,
  Chart,
  Coord,
  Geom,
  Label,
} from 'bizcharts';
import { IExperimentSummaryInfo } from 'config/interfaces/Chaos/workspace';
import { useDispatch } from 'utils/libs/sre-utils-dva';

interface IDataSource {
  type: string;
  content: number;
}

const DrillTotalStatistics = () => {
  const dispatch = useDispatch();
  const [ data, setData ] = useState<IExperimentSummaryInfo>();
  const [ chartDataSource, setChartDataSource ] = useState<IDataSource[]>([]);

  useEffect(() => {
    (async function() {
      const { Data } = await dispatch.workspace.getExperimentSummary();
      if (Data) {
        setData(Data);
        handleDisposeChartData(Data);
      }
    })();
  }, []);

  function handleDisposeChartData(data: IExperimentSummaryInfo) {
    const list: any = [];
    list.push({
      type: i18n.t('Not as expected'),
      content: data.unexpectedSize,
    });
    list.push({
      type: i18n.t('Number of successes'),
      content: data.successSize,
    });
    list.push({
      type: i18n.t('Total'),
      content: data.totalSize,
    });
    setChartDataSource(list);
  }

  if (!data) {
    return null;
  }

  return (
    <div className={styles.right}>
      <div className={styles.header}>
        <Translation>Cumulative drill data statistics</Translation>
      </div>
      <div>
        <Chart data={chartDataSource} height={150} padding={[ 0, 60, 0, 90 ]} forceFit>
          <Coord transpose />
          <Axis name="type"/>
          <Axis name="content" visible={false} />
          {/* @ts-ignore */}
          <Geom type="interval" position="type*content" >
            <Label content='content' offset={5}/>
          </Geom>
        </Chart>
      </div>
      <div className={styles.bottom}>
        <div>
          <Translation>Cumulative success rate</Translation>
          <span className={styles.value}>{data && Number(data.successRatio * 100).toFixed()}%</span>
        </div>
        <div>
          <Translation>Cumulative non-compliance rate</Translation>
          <span className={styles.value}>{data && Number(data.unexpectedRatio * 100).toFixed()}%</span>
        </div>
      </div>
    </div>
  );
};

export default DrillTotalStatistics;
