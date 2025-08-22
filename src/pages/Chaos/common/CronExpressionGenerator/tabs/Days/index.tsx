import React, { Fragment, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { NumberPicker, Radio, TimePicker } from '@alicloud/console-components';

interface DaysProps{
  value: any[];
  onChange: (value: any[]) => void;
}

function Days(props: DaysProps) {

  const [ weekday, setWeekday ] = useState(false);

  function getDay(value: any[]) {
    if (!_.isEmpty(value) && _.size(value) > 3) {
      const item = value[ 3 ];
      if (item.includes('/')) {
        const values = _.split(item, '/');
        if (_.size(values) > 1) {
          return parseInt(values[ 1 ]);
        }
      }
    }
    return 0;
  }

  function getStartTime(value: any[]) {
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

    const suffix = '? * MON-FRI *';
    if (_.join(_.slice(_.split(value as any, ' '), 3), ' ') === suffix) {
      setWeekday(true);
    }
  }, []);

  function handleDayChange(day: number) {
    const { value, onChange } = props;

    if (!weekday) {
      if (day === 0) {
        value[ 3 ] = '*';
      }
      if (day > 0 && day <= 31) {
        value[ 3 ] = `1/${day}`;
      }

      onChange && onChange(value);
    }
  }

  function handleChangeWeekday(checked: boolean) {
    setWeekday(checked);
    if (checked) {
      const { value, onChange } = props;

      value[ 3 ] = '?';
      value[ 4 ] = '*';
      value[ 5 ] = 'MON-FRI';
      value[ 6 ] = '*';

      onChange && onChange(value);
    }
  }

  function handleStartTimeChange(time: any) {
    const { value, onChange } = props;

    value[ 0 ] = time.second() + '';
    value[ 1 ] = time.minute() + '';
    value[ 2 ] = time.hour() + '';

    onChange && onChange(value);
  }

  const { value } = props;
  return (
    <div className={styles.container}>
      <div className={styles.selectableItem}>
        <Radio
          checked={!weekday}
          label={
            <Fragment>
              <span className={styles.prefix}><Translation>Every</Translation></span>
              <NumberPicker
                value={getDay(value)}
                disabled={weekday}
                onChange={handleDayChange}
                min={0}
                max={31}
              />
              <span className={styles.suffix}>天</span>
            </Fragment>
          }
          onChange={checked => setWeekday(!checked)}
        />
      </div>
      <div className={styles.selectableItem}>
        <Radio
          checked={weekday}
          label={i18n.t('Working day').toString()}
          onChange={handleChangeWeekday}
        />
      </div>
      <div className={styles.startTime}>
        <span className={styles.prefix}><Translation>Start time</Translation></span>
        <TimePicker
          value={getStartTime(value)}
          onChange={handleStartTimeChange}
        />
      </div>
    </div>
  );
}

export default Days;
