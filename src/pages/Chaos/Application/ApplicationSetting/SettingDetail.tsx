import ActivityParameterEditor from 'pages/Chaos/Experiment/common/ActivityParameter/ActivityParameterEditor';
import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Dialog, Select, Switch } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';

interface IPorps {
  currentRecord: any;
  visible: boolean;
  handleSubmit: () => void;
  handleClose: () => void;
  handleOverrideChange: (value: boolean) => void;
  handleChange: any;
  handleNodeGroupChange: (value: string[]) => void;
}

const SettingDetail: FC<IPorps> = props => {
  const { currentRecord, visible, handleChange } = props;
  const appId = useQuery('appId');
  const [ groupSource, setGroupSource ] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (visible) {
      (async function() {
        const { Data = false } = await dispatch.application.getApplicationGroup({ app_id: appId });
        if (Data) {
          setGroupSource(Data);
        }
      })();
    }
  }, [ visible ]);

  if (!currentRecord) {
    return null;
  }

  return (
    <Dialog
      title={i18n.t('Change setting').toString()}
      style={{ width: 600 }}
      visible={visible}
      onOk={props.handleSubmit}
      onCancel={props.handleClose}
      onClose={props.handleClose}
      locale={locale().Dialog}
    >
      <div>
        <div className={styles.setItem}>
          <div className={styles.label}><Translation>Name</Translation></div>
          <div className={styles.value}>{currentRecord.name}</div>
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}><Translation>Description</Translation></div>
          <div className={styles.value}>{currentRecord && currentRecord.description}</div>
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}><Translation>Applicable grouping</Translation></div>
          <Select
            defaultValue={_.get(currentRecord, 'scope.nodeGroups', [])}
            mode="multiple"
            onChange={props.handleNodeGroupChange}
            dataSource={groupSource}
            style={{ width: 300 }}
            locale={locale().Select}
          />
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}><Translation>Overwrite user configuration</Translation></div>
          <Switch
            defaultChecked={_.get(currentRecord, 'override', false)}
            onChange={props.handleOverrideChange}
            checkedChildren="on"
            unCheckedChildren="off"
          />
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}><Translation>Configuration value</Translation></div>
          <div className={styles.valueComponent}>
            <ActivityParameterEditor
              parameter={_.get(_.set(currentRecord, 'component.value', _.get(currentRecord, 'value', '')), 'component', {})}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SettingDetail;
