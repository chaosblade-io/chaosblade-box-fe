import React, { useEffect, useState } from 'react';
import styles from './index.css';

import _ from 'lodash';
import { Dialog, Tab } from '@alicloud/console-components';

import Days from './tabs/Days';
import Hours from './tabs/Hours';
import Minutes from './tabs/Minutes';
import Months from './tabs/Months';
import Weeks from './tabs/Weeks';

const { Item } = Tab;

interface CronExpressionGeneratorProps {
  visible: boolean;
  expression?: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

function CronExpressionGenerator(props: CronExpressionGeneratorProps) {

  const [ value, setValue ] = useState([ '0', '0/1', '*', '*', '*', '?', '*' ]);

  useEffect(() => {
    const { expression } = props;
    if (!_.isEmpty(expression)) {
      setValue(_.split(expression, ' '));
    }
  }, []);

  function handleTabChange(index: string) {
    let expression = '0 0/1 * * * ? *';

    if (index === '0') {
      expression = '0 0/1 * * * ? *';
    }
    if (index === '1') {
      expression = '0 0 00 1/1 * ? *';
    }
    if (index === '2') {
      expression = '0 0 00 1/1 * ? *';
    }
    if (index === '3') {
      expression = '0 0 00 ? * * *';
    }
    if (index === '4') {
      expression = '0 0 00 1 1/1 ? *';
    }

    setValue(_.split(expression, ' '));
  }

  function handleValueChange(value: any) {
    if (!_.isEmpty(value)) {
      setValue([ ...value ]);
    }
  }

  const { visible, onChange, onClose } = props;
  return (
    <Dialog
      visible={visible}
      onOk={() => {
        onChange && onChange(_.join(value, ' '));
      }}
      style={{ width: 630 }}
      onCancel={onClose}
      onClose={onClose}
    >
      <div className={styles.container}>
        <Tab onChange={() => handleTabChange}>
          <Item title="分">
            <Minutes value={value} onChange={handleValueChange}/>
          </Item>
          <Item title="时">
            <Hours value={value} onChange={handleValueChange}/>
          </Item>
          <Item title="天">
            <Days value={value} onChange={handleValueChange}/>
          </Item>
          <Item title="周">
            <Weeks value={value} onChange={handleValueChange}/>
          </Item>
          <Item title="月">
            <Months value={value} onChange={handleValueChange}/>
          </Item>
        </Tab>
      </div>
      <div className={styles.preview}>
        {_.join(value, ' ')}
      </div>
    </Dialog>
  );
}

export default CronExpressionGenerator;
