import HeatmapChartItem from './HeatmapChartItem';
import React, { memo, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import moment from 'moment';
import styles from './index.css';
import { IScopeControlHeatmapChartData } from 'config/interfaces/Chaos/scopesControl';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';

function HeatmapChart() {
  const dispatch = useDispatch();
  const id = useQuery('id');
  const [ dataSource, setDataSource ] = useState<IScopeControlHeatmapChartData[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current && (async function() {
      const { Data = false } = await dispatch.scopesControl.getScopeInvocation({ configuration_id: id });
      if (Data) {
        setDataSource(setData(Data));
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (_.isEmpty(dataSource)) {
    return null;
  }

  function setData(data: IScopeControlHeatmapChartData[]) {
    const heatMap: IScopeControlHeatmapChartData[] = [];
    if (!_.isEmpty(data)) {
      // 排序保证后续月份展示的正确性
      _.sortBy(data, 'time').forEach((item: IScopeControlHeatmapChartData) => {
        heatMap.push({
          total: item.total,
          time: item.time,
          year: moment(item.time).get('year'),
          day: moment(item.time).format('d') as any,
          month: moment(item.time).get('month') + 1,
          date: moment(item.time).format('YYYY-MM-DD'),
        });
      });
    }
    return heatMap;
  }

  const monthData = _.groupBy(dataSource, 'month');
  const key = _.sortBy(Object.keys(monthData));
  let firstMonth: IScopeControlHeatmapChartData[] = [];
  let sedMonth: IScopeControlHeatmapChartData[] = [];
  let thirdMonth: IScopeControlHeatmapChartData[] = [];
  _.forEach(monthData, () => {
    firstMonth = _.concat(monthData[key[0]]);
    sedMonth = _.concat(monthData[key[1]]);
    thirdMonth = _.concat(monthData[key[2]]);
  });

  return (
    <>
      <div className={styles.heatMapContent}>
        <div className={styles.week}>
          <div className={styles.weekDay}>周日</div>
          <div className={styles.weekDay}>周三</div>
          <div className={styles.weekDay}>周六</div>
        </div>
        <HeatmapChartItem data={firstMonth}/>
        <HeatmapChartItem data={sedMonth}/>
        <HeatmapChartItem data={thirdMonth}/>
      </div>
      <div className={styles.legendContent}>
        <div className={styles.itemBlock}>
          <i className={classnames(styles.block, styles.manyTotal)}></i>
          <div>50</div>
        </div>
        <div className={styles.itemBlock}>
          <i className={classnames(styles.block, styles.middleTotal)}></i>
          <div>21~50</div>
        </div>
        <div className={styles.itemBlock}>
          <i className={classnames(styles.block, styles.littleTotal)}></i>
          <div>1~20</div>
        </div>
        <div className={styles.itemBlock}>
          <i className={classnames(styles.block, styles.noTotal)}></i>
          <div>0</div>
        </div>
      </div>
    </>
  );
}

export default memo(HeatmapChart);
