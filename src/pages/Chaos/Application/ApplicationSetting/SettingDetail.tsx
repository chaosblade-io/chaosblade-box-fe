import ActivityParameterEditor from 'pages/Chaos/Experiment/common/ActivityParameter/ActivityParameterEditor';
import React, { FC, useEffect, useState } from 'react';
import _ from 'lodash';
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
      title='修改配置'
      style={{ width: 600 }}
      visible={visible}
      onOk={props.handleSubmit}
      onCancel={props.handleClose}
      onClose={props.handleClose}
    >
      <div>
        <div className={styles.setItem}>
          <div className={styles.label}>名称</div>
          <div className={styles.value}>{currentRecord.name}</div>
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}>描述</div>
          <div className={styles.value}>{currentRecord && currentRecord.description}</div>
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}>适用分组</div>
          <Select
            defaultValue={_.get(currentRecord, 'scope.nodeGroups', [])}
            mode="multiple"
            onChange={props.handleNodeGroupChange}
            dataSource={groupSource}
            style={{ width: 300 }}
          />
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}>是否覆盖用户配置内容</div>
          <Switch
            defaultChecked={_.get(currentRecord, 'override', false)}
            onChange={props.handleOverrideChange}
            checkedChildren="on"
            unCheckedChildren="off"
          />
        </div>
        <div className={styles.setItem}>
          <div className={styles.label}>配置值</div>
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
