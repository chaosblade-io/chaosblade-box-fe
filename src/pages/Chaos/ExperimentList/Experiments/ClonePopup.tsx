import React, { FC, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
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
  const [ stateName, setStateName ] = useState(`${i18n.t('[copy]')}${name}`);

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
          <Translation>Copy</Translation>
        </Button>}
      triggerType="click"
      needAdjust={true}
      closable={false}
    >
      <p className={styles.cloneTitle}><Translation>Drill name</Translation></p>
      <Input
        hasClear
        maxLength={20}
        onChange={(e: string) => setStateName(e)}
        value={stateName}
      />
      <div className={styles.cloneBtnRow}>
        <Button type="primary" onClick={() => {
          if (!stateName) {
            Message.error(i18n.t('Please enter a drill name').toString());
          } else {
            props.onSubmit({ experimentId, name: stateName });
            setVisible(false);
          }
        }}><Translation>Confirm</Translation></Button>
        <Button type="normal" onClick={() => setVisible(false)}><Translation>cancel</Translation></Button>
      </div>
    </Balloon>
  );
};

export default ClonePopup;
