import React, { Fragment, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import i18n from '../../../../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { Checkbox, NumberPicker, Radio, TimePicker } from '@alicloud/console-components';

const KEY = {
  DAY_OF_MONTH: 'day_of_month',
  LAST_DAY_OF_MONTH: 'last_day_of_month',
  LAST_WEEKDAY_OF_MONTH: 'last_weekday_of_month',
  DAY_BEFORE_END_OF_MONTH: 'day_before_end_of_month',
  DAYS_OF_MONTH: 'days_of_month',
};

const daysOfMonth: any[] = [];
for (let i = 1; i <= 31; i++) {
  daysOfMonth.push({
    key: i <= 9 ? String('0' + i) : String(i),
    value: i,
  });
}

interface MonthsProps{
  value: any[];
  onChange: (value: any[]) => void;
}

function Months(props: MonthsProps) {

  const [ key, setKey ] = useState(KEY.DAY_OF_MONTH);
  const [ daysOfMonth, setDaysOfMonth ] = useState<any[]>([]);

  useEffect(() => {
    return handleSyncValue(value);
  }, []);

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

  function getDayBeforeEndOfMonth(value: any[]) {
    if (!_.isEmpty(value)) {
      const day = value[ 3 ];
      if (!day.includes('/')) {
        if (/L-[\d]/.test(day)) {
          const match: RegExpExecArray | null = /\d+/.exec(day);
          if (!_.isEmpty(match) && !_.isNaN(parseInt(match![ 0 ]))) {
            return parseInt(match![ 0 ]);
          }
        }
      }
    }
    return 0;
  }

  function getDayOfMonth(value: any[], skip = false) {
    if (!_.isEmpty(value)) {
      const day = value[ 3 ];
      if (!day.includes('/') && !skip) {
        if (!_.isNaN(parseInt(day))) {
          return parseInt(day);
        }
      }
    }
    return 0;
  }

  function handleSyncValue(value: any[]) {
    value = value === undefined ? props.value : value;

    if (!_.isEmpty(value)) {
      const day = value[ 3 ];
      if (!day.includes('/')) {
        if (!_.isNaN(parseInt(day))) {
          setKey(KEY.DAY_OF_MONTH);
        }
        if (day === 'L') {
          setKey(KEY.LAST_DAY_OF_MONTH);
        }
        if (day === 'LW') {
          setKey(KEY.LAST_WEEKDAY_OF_MONTH);
        }
        if (/L-[\d]/.test(day)) {
          setKey(KEY.DAY_BEFORE_END_OF_MONTH);
        }
        if (/,/.test(day)) {
          const dayVals = day
            .split(',')
            .map(_.trim)
            .map((val: string) => parseInt(val, 10));
          setKey(KEY.DAYS_OF_MONTH);
          setDaysOfMonth(daysOfMonth.map((item: any) => {
            if (dayVals.includes(item.value)) {
              item.selected = true;
            }
            return item;
          }));
        }
      }
    }
  }

  function handleStartTimeChange(time: any) {
    const { value, onChange } = props;

    value[ 0 ] = time.second() + '';
    value[ 1 ] = time.minute() + '';
    value[ 2 ] = time.hour() + '';

    onChange && onChange(value);
  }

  let { value, onChange } = props;
  return (
    <div className={styles.container}>
      <div className={styles.selectableItem}>
        <Radio
          checked={key === KEY.DAY_OF_MONTH}
          label={
            <Fragment>
              <span className={styles.prefix}><Translation>Monthly</Translation></span>
              <NumberPicker
                value={getDayOfMonth(value, key !== KEY.DAY_OF_MONTH)}
                min={1}
                max={31}
                disabled={key !== KEY.DAY_OF_MONTH}
                onChange={val => {
                  const updateValue = [ ...value ];
                  updateValue[ 3 ] = val + '';
                  onChange && onChange(updateValue);
                }}
              />
              <span className={styles.suffix}><Translation>Day</Translation></span>
            </Fragment>
          }
          onChange={checked => {
            if (checked) {
              setKey(KEY.DAY_OF_MONTH);
            }
          }}
        />
      </div>
      <div className={styles.selectableItem}>
        <Radio
          checked={key === KEY.LAST_DAY_OF_MONTH}
          label={i18n.t('Last day of the month').toString()}
          onChange={checked => {
            if (checked) {
              const updateValue = [ ...value ];
              updateValue[ 3 ] = 'L';
              setKey(KEY.LAST_DAY_OF_MONTH);
              onChange && onChange(updateValue);
            }
          }}
        />
      </div>
      <div className={styles.selectableItem}>
        <Radio
          checked={key === KEY.LAST_WEEKDAY_OF_MONTH}
          label={i18n.t('Working day of the last week of the month').toString()}
          onChange={checked => {
            if (checked) {
              setKey(KEY.LAST_WEEKDAY_OF_MONTH);
              const updateValue = [ ...value ];
              updateValue[ 3 ] = 'LW';
              onChange && onChange(updateValue);
            }
          }}
        />
      </div>
      <div className={styles.selectableItem}>
        <Radio
          checked={key === KEY.DAY_BEFORE_END_OF_MONTH}
          label={
            <Fragment>
              <span className={styles.prefix}><Translation>Penultimate month</Translation></span>
              <NumberPicker
                value={getDayBeforeEndOfMonth(value)}
                min={1}
                max={31}
                disabled={key !== KEY.DAY_BEFORE_END_OF_MONTH}
                onChange={val => {
                  const updateValue = [ ...value ];
                  updateValue[ 3 ] = 'L-' + val;
                  onChange && onChange(updateValue);
                }}
              />
              <span className={styles.suffix}><Translation>Day</Translation></span>
            </Fragment>
          }
          onChange={checked => {
            if (checked) {
              setKey(KEY.DAY_BEFORE_END_OF_MONTH);
            }
          }}
        />
      </div>
      <div className={styles.selectableItem}>
        <Radio
          checked={key === KEY.DAYS_OF_MONTH}
          label={i18n.t('Specific days of the month (select one or more days)').toString()}
          onChange={checked => {
            if (checked) {
              setKey(KEY.DAYS_OF_MONTH);
              const updateValue = [ ...value ];
              const selectedItems = daysOfMonth.filter(({ selected }) => !!selected);
              if (selectedItems.length > 0) {
                updateValue[ 3 ] = selectedItems.map(({ value }: any) => value).join(',');
              } else {
                updateValue[ 3 ] = '1';
              }
              onChange && onChange(updateValue);
            }
          }}
        />
        <div className={styles.daysOfMonthBox}>
          {
            daysOfMonth.map((item: any) => {
              const { key: name, value: val, selected } = item;
              return (
                <Checkbox
                  key={name}
                  label={name}
                  value={val}
                  disabled={key !== KEY.DAYS_OF_MONTH}
                  checked={!!selected}
                  onChange={checked => {
                    item.selected = !!checked;
                    setDaysOfMonth([ ...daysOfMonth ]);
                    const updateValue = [ ...value ];
                    const selectedItems = daysOfMonth.filter(({ selected }) => !!selected);
                    if (selectedItems.length > 0) {
                      updateValue[ 3 ] = selectedItems.map(({ value }) => value).join(',');
                    } else {
                      updateValue[ 3 ] = '1';
                    }
                    onChange && onChange(updateValue);
                  }}
                />
              );
            })
          }
        </div>

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

export default Months;
