import React, { FC, useState } from 'react';
import styles from './index.css';
import { Balloon, Button, Input, Message } from '@alicloud/console-components';

interface IProps {
  experiment: any;
  onSubmit: (params: any) => void;
  disable: boolean;
}

const ClonePopup: FC<IProps> = props => {
  const { experimentId, name } = props.experiment;
  const [ visible, setVisible ] = useState(false);
  const [ stateName, setStateName ] = useState(`[副本]${name}`);

  return (
    <Balloon
      visible={visible}
      trigger={
        <Button
          disabled={props.disable}
          className={styles.opt}
          onClick={() => setVisible(!visible)}
          text
          type="primary"
        >
          拷贝
        </Button>}
      triggerType="click"
      needAdjust={true}
      closable={false}
    >
      <p className={styles.cloneTitle}>演练名称</p>
      <Input
        hasClear
        maxLength={20}
        onChange={(e: string) => setStateName(e)}
        value={stateName}
      />
      <div className={styles.cloneBtnRow}>
        <Button type="primary" onClick={() => {
          if (!stateName) {
            Message.error('请输入演练名称');
          } else {
            props.onSubmit({ experimentId, name: stateName });
            setVisible(false);
          }
        }}>确定</Button>
        <Button type="normal" onClick={() => setVisible(false)}>取消</Button>
      </div>
    </Balloon>
  );
};

export default ClonePopup;
