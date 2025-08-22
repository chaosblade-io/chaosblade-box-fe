import React from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import styles from './index.css';
import { NumberPicker } from '@alicloud/console-components';

interface MinutesProps{
  value: any[];
  onChange: (value: any[]) => void;
}

function Minutes(props: MinutesProps) {

  function getMinute(value: any[]) {
    if (!_.isEmpty(value) && _.size(value) > 1) {
      const item = value[ 1 ];
      if (item.includes('/')) {
        const values = _.split(item, '/');
        if (_.size(values) > 1) {
          return parseInt(values[ 1 ]);
        }
      }
    }
    return 0;
  }

  function handleChange(minute: number) {
    const { value, onChange } = props;

    if (minute === 0) {
      value[ 1 ] = '*';
    }
    if (minute > 0 && minute < 60) {
      value[ 1 ] = `0/${minute}`;
    }

    onChange && onChange(value);
  }

  const { value } = props;
  return (
    <div className={styles.container}>
      <span className={styles.prefix}><Translation>Every</Translation></span>
      <NumberPicker
        value={getMinute(value)}
        onChange={handleChange}
        min={0}
        max={60}
      />
      <span className={styles.suffix}><Translation>Minute</Translation></span>
    </div>
  );
}

export default Minutes;
