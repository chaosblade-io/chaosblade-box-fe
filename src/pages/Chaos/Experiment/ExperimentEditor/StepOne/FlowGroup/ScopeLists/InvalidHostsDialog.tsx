import React from 'react';
import _ from 'lodash';
import styles from './index.css';
import { Dialog, Icon } from '@alicloud/console-components';

interface IProps {
  visible?: boolean;
  onClose?: () => void;
  deleteHosts?: () => void;
  data: any[];
}

export default function InvalidHostsDialog(props: IProps) {

  function renderInvalidTitle() {
    return <div className={styles.invalidTip}>
      <Icon type="warning" className={styles.titleIcon}/>
      <span>失效机器</span>
    </div>;
  }

  const { data } = props;
  return <Dialog
    title={renderInvalidTitle()}
    visible={props.visible}
    onOk={props.deleteHosts}
    onCancel={props.onClose}
    onClose={props.onClose}
  >
    <div>
      <div className={styles.titleWord}>以下失效机器可能会影响演练，是否删除？</div>
      <ul className={styles.list}>
        {!_.isEmpty(data) && data.map((it: any) => {
          return <li>{it.label}</li>;
        })}
      </ul>
    </div>
  </Dialog>;
}
