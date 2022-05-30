import React, { memo, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../i18n';
import moment from 'moment';
import { Loading } from '@alicloud/console-components';
import { isEmpty } from 'lodash';
import { useDispatch } from 'utils/libs/sre-utils-dva';

import _ from 'lodash';

import styles from './index.css';
const months = [ i18n.t('January'), i18n.t('February'), i18n.t('March'), i18n.t('April'), i18n.t('May'), i18n.t('June'), i18n.t('July'), i18n.t('August'), i18n.t('September'), i18n.t('October'), i18n.t('November'), i18n.t('December') ];
const cols = {
  day: {
    type: 'cat',
    values: [ i18n.t('Sunday'), i18n.t('Monday'), i18n.t('Tuesday'), i18n.t('Wednesday'), i18n.t('Thursday'), i18n.t('Friday'), i18n.t('Saturday') ],
  },
  week: {
    type: 'cat',
  },
  commits: {
    sync: true,
  },
  date: {
    type: 'cat',
  },
};
const colorConf = [
  {
    color: '#54D6A8',
    label: i18n.t('Scheduled tasks to be executed > 0 times'),
  },
  {
    color: '#A3E7FF',
    label: i18n.t('Number of drills: 1-5 times'),
  },
  {
    color: '#50C1FA',
    label: i18n.t('Number of drills: 6-10 times'),
  },
  {
    color: '#0085E0',
    label: i18n.t('The number of drills ≥ 11 times'),
  },
];

interface Props {
  showGuide: boolean;
}
const LogChart: React.FC<Props> = () => {
  const dispatch = useDispatch();
  const [ lastTime, setLastTime ] = useState<string | null>(null);
  const [ charts, setCharts ] = useState<any>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ logData, setLogData ] = useState<any>([]);
  const _clientWidth = window.document.body.clientWidth;
  const [ chartHeight, setChartHeight ] = useState<number>(_clientWidth < 1500 ? 170 : 260);

  const dealwithDatas = (datas: any) => {
    const result: any = [];
    const firstItem = datas[0];
    const temp = moment(firstItem?.time);
    const firstWeekday = temp.weekday();
    const subDatas = datas.splice(7 - firstWeekday);
    const subWeeks = _.chunk(subDatas, 7);
    const allWeeks = [ datas, ...subWeeks ];
    for (const week in allWeeks) {
      const weekDatas = allWeeks[week];
      for (const i in weekDatas) {
        const item = weekDatas[i];
        const { time, totalCount } = item;
        const _moment = moment(time);
        const month = _moment.month();
        const info: any = { date: _moment.format('YYYY-MM-DD'), commits: totalCount, month, day: _moment.weekday(), week: week + '' };
        const diff = _moment.endOf('month').diff(moment(time), 'day');
        info.lastWeek = diff < 7;
        info.lastDay = diff === 0;
        result.push(info);
      }
    }
    judgeMonth(result);
  };
  const judgeMonth = (datas: any) => {
    const result: any = [];
    const hasMonth: any = [];
    const hasWeek: any = [];
    for (const i in datas) {
      const temp = datas[i];
      if (!hasMonth.includes(temp.month)) {
        hasMonth.push(temp.month);
        hasWeek.push(Number(temp.week) + 1);
      }
    }
    for (const i in datas) {
      const temp = datas[i];
      if (hasWeek.includes(Number(temp.week))) {
        temp.showMonth = true;
      } else {
        temp.showMonth = false;
      }
      result.push(temp);
    }
    setLogData(result);
    setLoading(false);
  };
  const handleResize = () => {
    const _clientWidth = window.document.body.clientWidth;
    setChartHeight(_clientWidth < 1500 ? 170 : 260);
  };
  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      const res = await dispatch.archIndex.getExperimentTrend();
      const { experimentTaskDayCountList = [], lastExperimentTaskTime } = res || {};
      setLastTime(lastExperimentTaskTime ? moment(lastExperimentTaskTime).format('YYYY-MM-DD HH:MM:ss') : '暂无');
      dealwithDatas(experimentTaskDayCountList);
      setLoading(false);
    };
    getData();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchBizcharts = async () => {
      const bizcharts = await import(/* webpackChunkName: 'bizcharts' */'bizcharts'/* webpackPrefetch: true */);
      setCharts(bizcharts);
    };
    fetchBizcharts();
  }, []);
  if (!charts) {
    return null;
  }
  const { Chart, Axis, Coord, Geom, Shape, Tooltip } = charts;
  Shape.registerShape('polygon', 'boundary-polygon', {
    draw(cfg:any, container:any) {
      if (!isEmpty(cfg.points)) {
        const attrs:any = {
          stroke: '#fff',
          lineWidth: 1,
          fill: cfg.color,
          fillOpacity: cfg.opacity,
        };
        const points = cfg.points;
        const path = [
          [ 'M', points[0].x, points[0].y ],
          [ 'L', points[1].x, points[1].y ],
          [ 'L', points[2].x, points[2].y ],
          [ 'L', points[3].x, points[3].y ],
          [ 'Z' ],
        ];
        attrs.path = this.parsePath(path);
        const polygon = container.addShape('path', { attrs });
        if (cfg.origin._origin.lastWeek) {
          const linePath = [
            [ 'M', points[2].x, points[2].y ],
            [ 'L', points[3].x, points[3].y ],
          ]; // 最后一周的多边形添加右侧边框
          container.addShape('path', {
            zIndex: 1,
            attrs: {
              path: this.parsePath(linePath),
              lineWidth: 1,
              stroke: '#c0c6cd',
            },
          });
          if (cfg.origin._origin.lastDay) {
            container.addShape('path', {
              zIndex: 1,
              attrs: {
                path: this.parsePath([
                  [ 'M', points[1].x, points[1].y ],
                  [ 'L', points[2].x, points[2].y ],
                ]),
                lineWidth: 1,
                stroke: '#c0c6cd',
              },
            });
          }
        }
        container.sort();
        return polygon;
      }
    },
  });
  return (
    <div className={styles.segment}>
      <div className={styles.header}>
        <div className={styles.title}><Translation>Exercise log</Translation>&nbsp;&nbsp;&nbsp;&nbsp;
          <span className={styles.desp}><Translation>Recent drills</Translation>:{lastTime}</span>
        </div>
      </div>
      <Loading style={{ display: 'block' }} visible={loading}>
        <Chart
          height={chartHeight}
          data={logData}
          scale={cols}
          forceFit
          padding={[ 10, 10, 30, 50 ]}
        >
          <Tooltip title='date'/>
          <Axis
            name='week'
            position='top'
            tickLine={null}
            line={null}
            label={{
              offset: 12,
              autoRotate: false,
              textStyle: {
                fontSize: 12,
                fill: '#666',
                textBaseline: 'top',
              },
              formatter: (val: number) => {
                const info = logData.find((item: any) => item.week === val) || {};
                return info.showMonth ? months[info.month] : null;
              },
            }}
          />
          <Axis name='day' grid={null} />
          <Geom
            type='polygon'
            position='week*day*date'
            shape='boundary-polygon'
            tooltip={[
              'commits', (date: string) => {
                return {
                  name: <Translation>Number of drills</Translation> + ':',
                  value: date,
                };
              },
            ]}
            color={[
              'commits', (cut: number) => {
                if (cut <= 0) {
                  return '#F1F1F2';
                } else if (cut === 1) {
                  return '#54D6A8';
                } else if (cut > 1 && cut <= 5) {
                  return '#A3E7FF';
                } else if (cut >= 6 && cut <= 10) {
                  return '#50C1FA';
                } else if (cut > 10) {
                  return '#0085E0';
                }
              },
            ]}
          />
          <Coord reflect='y' />
        </Chart>
        <div className={styles.chartLegend}>
          {colorConf.map((item, index) => {
            return <span key={index}><i style={{ background: item.color }}></i>{item.label}</span>;
          })}
        </div>
      </Loading>
    </div>
  );
};
export default memo(LogChart);
