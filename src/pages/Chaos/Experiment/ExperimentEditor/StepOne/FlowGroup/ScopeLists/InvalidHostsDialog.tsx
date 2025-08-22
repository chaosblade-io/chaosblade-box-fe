import React from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import locale from 'utils/locale';
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
      <span><Translation>Dead machine</Translation></span>
    </div>;
  }

  const { data } = props;
  return <Dialog
    title={renderInvalidTitle()}
    visible={props.visible}
    onOk={props.deleteHosts}
    onCancel={props.onClose}
    onClose={props.onClose}
    locale={locale().Dialog}
  >
    <div>
      <div className={styles.titleWord}><Translation>The following failed machines may affect the exercise, delete</Translation></div>
      <ul className={styles.list}>
        {!_.isEmpty(data) && data.map((it: any) => {
          return <li>{it.label}</li>;
        })}
      </ul>
    </div>
  </Dialog>;
}
