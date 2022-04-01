import DataSet from '@antv/data-set';
import React, { FC, memo, useEffect, useState } from 'react';
import styles from './index.css';

interface IMetricsChartProps {
  dataSource: IDataSource[];
}
interface IDataSource {
  MetricName: string;
  Desc: string;
  Unit: string;
  Items: IItems[];
}
interface IItems {
  Timestamp: number;
  Value: number;
}

const MetricsChart: FC<IMetricsChartProps> = (props: IMetricsChartProps) => {
  const { dataSource } = props;
  const [ component, setComponent ] = useState<any>(null);
  // bizchart 将近2MB，按需加载之
  useEffect(() => {
    (async function() {
      const bizcharts = await import(/* webpackChunkName: "bizcharts" */'bizcharts'/* webpackPrefetch: true */);
      setComponent(bizcharts);
    })();
  }, []);

  if (!component) {
    return null;
  }

  if (!dataSource || dataSource.length === 0) {
    return null;
  }

  const { Chart, Geom, Axis, Tooltip } = component;
  const { DataView } = DataSet;
  const scale = {
    Timestamp: {
      alias: '时间',
      type: 'time',
      mask: 'HH:mm:ss',
    },
  };
  const label = {
    formatter(text: any) {
      return text + '%';
    },
  };

  return (
    <div>
      <div className={styles.title}>监控信息</div>
      <div className={styles.chartsWrap}>
        {dataSource?.map((data, index) => {
          const items = (data.Items || []).map(item => {
            return {
              Value: Number(item.Value),
              Timestamp: item.Timestamp * 1000,
            };
          });
          const dv = new DataView();
          return <div key={index} className={styles.chart}>
            <h4>{data.Desc}（单位：{data.Unit}）</h4>
            <Chart
              height={300}
              width={500}
              scale={scale}
              data={dv.source(items)}
              padding={[ 'auto', 'auto', 'auto', 'auto' ]}
            >
              <Axis name="Timestamp" />
              <Axis name="Value" label={label}/>
              <Tooltip shared showCrosshairs />
              <Geom type="line" position="Timestamp*Value" size={2} />
            </Chart>
          </div>;
        })}
      </div>
    </div>
  );
};

export default memo(MetricsChart);

