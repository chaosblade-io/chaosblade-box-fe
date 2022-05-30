import React, { Fragment, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import moment from 'moment';
import styles from './index.css';
import { NumberPicker, Radio, TimePicker } from '@alicloud/console-components';

interface HoursProps{
  value: any[];
  onChange: (value: any[]) => void;
}

function Hours(props: HoursProps) {

  const [ period, setPeriod ] = useState(true);

  function getHour(value: any[]) {
    if (!_.isEmpty(value) && _.size(value) > 2) {
      const item = value[ 2 ];
      if (item.includes('/')) {
        const values = _.split(item, '/');
        if (_.size(values) > 1) {
          return parseInt(values[ 1 ]);
        }
      }
    }
    return 0;
  }

  function getTime(value: any[]) {
    const time = moment();

    if (!_.isEmpty(value) && _.size(value) > 2) {
      const second = value[ 0 ];
      const minute = value[ 1 ];
      const hour = value[ 2 ];

      if (!second.includes('/')) {
        time.second(parseInt(second));
      }
      if (!minute.includes('/')) {
        time.minute(parseInt(minute));
      }
      if (!hour.includes('/')) {
        time.hour(parseInt(hour));
      }

      return time;
    }

    time.second(0);
    time.minute(0);
    time.hour(0);
    return time;
  }

  useEffect(() => {
    const { value } = props;

    const hour = value[ 2 ];
    setPeriod(hour.includes('/'));
  }, []);

  function handleHourChange(hour: number) {
    const { value, onChange } = props;

    if (period) {
      if (hour === 0) {
        value[ 2 ] = '*';
      }
      if (hour > 0 && hour < 24) {
        value[ 2 ] = `0/${hour}`;
      }

      value[ 3 ] = '1/1';

      onChange && onChange(value);
    }
  }

  function handleTimeChange(time: any) {
    const { value, onChange } = props;

    if (!period) {
      value[ 0 ] = time.second() + '';
      value[ 1 ] = time.minute() + '';
      value[ 2 ] = time.hour() + '';
      value[ 3 ] = '1/1';

      onChange && onChange(value);
    }
  }

  const { value } = props;

  return (
    <div className={styles.container}>
      <div className={styles.selectableItem}>
        <Radio
          checked={period}
          label={
            <Fragment>
              <span className={styles.prefix}><Translation>Every</Translation></span>
              <NumberPicker
                value={getHour(value)}
                disabled={!period}
                onChange={handleHourChange}
                min={0}
                max={23}
              />
              <span className={styles.suffix}><Translation>Hour</Translation></span>
            </Fragment>
          }
          onChange={checked => setPeriod(checked)}
        />
      </div>
      <div className={styles.selectableItem}>
        <Radio
          checked={!period}
          label={
            <Fragment>
              <span className={styles.prefix}><Translation>Specified time</Translation></span>
              <TimePicker
                value={getTime(value)}
                disabled={period}
                onChange={handleTimeChange}
              />
            </Fragment>
          }
          onChange={checked => setPeriod(!checked)}
        />
      </div>
    </div>
  );
}

export default Hours;
