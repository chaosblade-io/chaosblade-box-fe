import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import moment from 'moment';
import styles from './index.css';
import { Axis, Chart, Geom, Legend, Tooltip } from 'bizcharts';
import { Dialog, Icon, Loading } from '@alicloud/console-components';
import { IMetrics } from 'config/interfaces/Chaos/experimentTask';

interface ChartCurvedProps{
  data: IMetrics | any;
  loadingVisible: boolean;
  id: number;
  width?: any;
  height?: any;
  className?: any;
  update: (data: any, id: number) => void;
}

export default function ChartCurved(props: ChartCurvedProps) {

  const [ visible, setVisible ] = useState(false);

  function handleLarge() {
    setVisible(true);
  }

  function renderChart(type: string) {
    const { width, height, data, id, className } = props;
    const { data: chartData = [], yName } = data;
    const chartStyle = { width: '100%' };
    const heightInit = type === 'small' ? (height ? height : 146) : 500;
    let tickCount;

    if (!_.isEmpty(chartData)) {
      if (chartData.length > 1) {
        if (type === 'small') {
          tickCount = chartData && chartData.length > 10 ? 10 : chartData.length;
        } else {
          tickCount = chartData && chartData.length > 20 ? 20 : chartData.length;
        }
      }
    }
    const cols = {
      timestamp: {
        tickCount,
      },
    };
    const bottom = type === 'small' && !yName ? 70 : 'auto';
    return (
      <div style={ width ? width : chartStyle} className={className}>
        <Chart
          height={heightInit}
          data={chartData}
          scale={cols}
          forceFit
          padding={[ 'auto', 'auto', bottom, 'auto' ]}
        >
          <Legend name="group" offsetY={type === 'small' ? -12 : -10 }/>
          <Tooltip />
          <div className={styles.chartAction}>
            {type === 'small' ?
              <div style={{ fontSize: 14, color: '#111' }}>
                {data && data.name}
                <div style={{ fontSize: 12, color: '#333', height: 15 }}>{data && data.subName}</div>
              </div>
              : <div></div>}
            {type === 'small' ? <div>
              <span className={styles.iconCon} onClick={() => { props.update(data, id); }}><Icon type='sync-alt'/></span>
              <span className={styles.iconCon} onClick={handleLarge}><Icon type='arrows-alt' className={styles.changeBig}/></span>
            </div>
              :
              <div>
                <span className={styles.iconConBig} onClick={() => { props.update(data, id); }}><Icon type='sync-alt'/></span>
              </div>
            }
          </div>
          <Axis name="timestamp"
            label={{
              // rotate: 0,
              autoRotate: !(chartData && chartData.length <= 6),
              formatter: val => moment(parseInt(val)).format('HH:mm:ss'),
            }}
          />
          <Axis name={yName || 'value'} label={{
            formatter: val => {
              return yName ? Number(val).toFixed(2) : val;
            },
          }}/>
          {yName &&
            <Geom
              type="line"
              position={`timestamp*${yName}`}
              shape={'smooth'}
              tooltip={[ `timestamp*${yName}`, (time, value) => {
                return {
                  title: i18n.t('Stability').toString(),
                  name: moment(time).format('HH:mm:ss'),
                  value: value.toFixed(2),
                };
              } ]}
            /> ||
            <Geom
              type="line"
              position={'timestamp*value*group'}
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
          }
          {yName &&
            <Geom
              type="point"
              position={`timestamp*${yName}`}
              size={3}
              shape={'circle'}
              style={{
                stroke: '#fff',
                lineWidth: 1,
              }}
              tooltip={[ `timestamp*${yName}`, (time, value) => {
                return {
                  title: i18n.t('Stability').toString(),
                  name: moment(time).format('HH:mm:ss'),
                  value: value.toFixed(2),
                };
              } ]}
            /> ||
            <Geom
              type="point"
              position={'timestamp*value*group'}
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
          }
        </Chart>
      </div>
    );
  }

  function onClose() {
    setVisible(false);
  }

  const { data, loadingVisible } = props;
  return (
    <Fragment>
      {visible && <Dialog
        style={{ width: '80%', height: '65%' }}
        title={<div>
          {data && data.name}
          <div style={{ fontSize: 12, color: '#333' }}>{data && data.subName}</div>
        </div> }
        visible={visible}
        onClose={onClose}
        footer={false}
        locale={locale().Dialog}
      >
        <Loading visible={loadingVisible} style={{ width: '100%' }}> {data && renderChart('big')} </Loading>
      </Dialog>}
      <Loading visible={loadingVisible} style={{ width: '25%' }}>
        {data && renderChart('small')}
      </Loading>
    </Fragment>
  );
}
