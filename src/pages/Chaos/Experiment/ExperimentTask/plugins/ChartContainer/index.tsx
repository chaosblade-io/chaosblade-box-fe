
import React, { Fragment, useEffect, useRef, useState } from 'react';
import styles from './index.css';

import _ from 'lodash';
import classnames from 'classnames';
import { Dialog, Icon } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

export default function ChartContainer(props: any) {
  const dispatch = useDispatch();

  // const [ originalData, setOriginalData ] = useState(props.data);
  const [ chartData, setChartData ] = useState(props.convertChartData);
  const [ fullscreen, setFullscreen ] = useState(false);
  const [ stateKey, setStateKey ] = useState('');
  const [ reload, setReload ] = useState(false);
  const chart: any = useRef<any>();
  const refreshTask = useRef<any>();


  useEffect(() => {
    const { chartProps, data, renderChart } = props;
    chart.current = renderChart(data, chartData, chartProps);
    refreshTask.current = setInterval(() => handleRequestChartData('refreshing'), 5000);
    return () => {
      if (refreshTask) {
        clearInterval(refreshTask.current);
        refreshTask.current = null;
      }

      if (chart) {
        chart.current = null;
      }
    };
  }, [ ]);

  useEffect(() => {
    const { chartProps, data, renderChart } = props;
    chart.current = renderChart(chartProps, fullscreen, data, chartData);
  }, [ reload ]);

  function handleSwitchFullscreen() {
    setFullscreen(!fullscreen);
  }

  function handleRequestChartData(state: string) {
    _.throttle(() => {
      if (!stateKey) {
        setStateKey(state);
        handleRequest();
      }
    }, 800)();
  }

  function handleRequest() {
    const { id, convertChartData } = props;
    (async function() {
      await dispatch.experimentTask.getTaskMetric({ activityTaskId: id }, (res: any) => {
        res && setChartData(convertChartData(res));
        setStateKey('');
        // setOriginalData(res);
      });
    })();
  }

  const { chartProps, renderChart, data } = props;

  const { full, width, height } = chartProps || {};

  return (
    <Fragment>
      <div className={styles.root}>
        <div className={styles.tip}>数据查询有延迟，可点击“刷新”按钮进行查询</div>
        <div className={full ? classnames(styles.buttonGroup, styles.fullscreenMode) : styles.buttonGroup}>
          {
            !full
              ? (
                <span className={styles.fullscreenBtn} onClick={handleSwitchFullscreen}>
                  <span>全屏</span>
                  <Icon size="xs" type="arrows-alt"/>
                </span>
              ) : ''
          }
          <span className={styles.refreshBtn} onClick={() => { chart.current = null; handleRequestChartData('loading'); setReload(!reload); }}>
            <span>刷新</span>
            <Icon size="xs" type="refresh"/>
          </span>
        </div>
        <div className={styles.metric}>{chart}</div>
        {
          _.isEmpty(chartData)
            ? (
              <div className={styles.empty} style={{ width: width && width + 10, height }}>暂无可展示数据</div>
            ) : ''
        }
        {
          !chart && (
            <div
              className={classnames(styles.empty, styles.loading)}
              style={{ width: width + 10, height }}
            >
              <Icon size="medium" type="loading"/>
            </div>
          )
        }
      </div>
      <Dialog
        visible={fullscreen}
        onClose={handleSwitchFullscreen}
        footer={false}
        style={{ width: 650 }}
        className={styles.DialogContent}
      >
        {/* <ChartContainer
          {...props}
          data={originalData}
          height={500}
          chartProps={{
            full: true,
            width: 650,
            height: 360,
            tickCount: 10,
          }}
        /> */}
        <div className={styles.root}>
          <div className={styles.tip}>数据查询有延迟，可点击“刷新”按钮进行查询</div>
          <div className={full ? classnames(styles.buttonGroup, styles.fullscreenMode) : styles.buttonGroup}>
            <span className={styles.refreshBtn} onClick={() => { chart.current = null; handleRequestChartData('loading'); setReload(!reload); }}>
              <span>刷新</span>
              <Icon size="xs" type="refresh"/>
            </span>
          </div>
          <div className={styles.metric}>{renderChart(chartProps, fullscreen, data, chartData)}</div>
          {
            _.isEmpty(chartData)
              ? (
                <div className={styles.empty} style={{ width: width && width + 10, height }}>暂无可展示数据</div>
              ) : ''
          }
          {
            !chart && (
              <div
                className={classnames(styles.empty, styles.loading)}
                style={{ width: width + 10, height }}
              >
                <Icon size="medium" type="loading"/>
              </div>
            )
          }
        </div>
      </Dialog>
    </Fragment>
  );
}
