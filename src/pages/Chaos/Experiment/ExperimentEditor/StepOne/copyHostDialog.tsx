import ApplicationGroup from './FlowGroup/ApplicationGroup';
import React, { useEffect, useState } from 'react';
import ScopeLists from './FlowGroup/ScopeLists';
import _ from 'lodash';
import styles from './index.css';
import { Dialog, Form } from '@alicloud/console-components';
import { IApp, IFlowGroup, IHost } from 'config/interfaces/Chaos/experiment';
import { SELECT_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';

const { Item: FormItem } = Form;

interface copyProps {
  visible: boolean;
  data: IFlowGroup;
  disableAppSel?: boolean;
  onCloseCopy: () => void;
  onSubmit?: (data: any) => void;
}

export default function CopyHostDialog(props: copyProps): JSX.Element {
  const dispatch = useDispatch();
  const applications = useSelector(({ experimentDataSource }) => experimentDataSource.applications);
  const groups = useSelector(({ experimentDataSource }) => experimentDataSource.groups);

  const [ total, setTotal ] = useState(0);
  const [ showScopes, setShowScopes ] = useState(true);
  const [ visible, setVisible ] = useState(() => {
    if (props?.visible) return props?.visible;
    return false;
  });
  const [ newFlowGroup, setNewFlowGroup ] = useState<IFlowGroup | null>(() => {
    if (props?.data) return _.cloneDeep(props?.data);
    return null;
  });
  const { data } = props;
  const { appId, scopeType, hostPercent, selectType } = data;
  const [ scopeSelectType, setScopeSelectType ] = useState(data ? selectType : SELECT_TYPE.IPS);
  const [ taskNumber, setTaskNumber ] = useState<number>(0);

  useEffect(() => {
    const getCountHost = async () => {
      await dispatch.experimentDataSource.countUserApplicationGroups({ appId, groupNames: newFlowGroup?.appGroups }, (res: any) => {
        const { total = 0 } = res;
        setTotal(total);
        setTaskNumber(Math.ceil((hostPercent as number / 100) * total));
      });
    };
    getCountHost();
  }, [ newFlowGroup?.appGroups ]);

  function handleAppFocus() {
    (async function() {
      await dispatch.experimentDataSource.getApplication({ appType: scopeType, filterDisabled: true });
    })();
  }

  function handleAppSelect(value: string, actionType: string, item: IApp) {
    (async function() {
      await dispatch.experimentDataSource.getApplicationGroup({ app_id: value });
    })();
    setNewFlowGroup({
      ...newFlowGroup as IFlowGroup,
      appName: item && item.label,
      appId: value,
      appGroups: [],
    });
  }

  function handleGroupFocus() {
    (async function() {
      await dispatch.experimentDataSource.getApplicationGroup({
        app_id: newFlowGroup && newFlowGroup.appId || '',
      });
    })();
  }

  function handleGroupSelect(value: string[]) {
    const { selectType, appId } = newFlowGroup as IFlowGroup;
    if (selectType === SELECT_TYPE.PERCENT) {
      // 先选择机器类型再选择分组情况处理
      (async function() {
        await dispatch.experimentDataSource.countUserApplicationGroups({ appId, groupNames: value }, (res: any) => {
          setTotal(res && res.total);
        });
      })();
    }
    setNewFlowGroup({
      ...newFlowGroup,
      appGroups: value,
      hosts: [],
    });
  }

  function handleScopeSelectTypeChange(selectType: string | number) {
    setScopeSelectType(selectType);
    if (selectType === SELECT_TYPE.IPS) { setShowScopes(true); }
    if (selectType === SELECT_TYPE.PERCENT) {
      const appId = _.get(newFlowGroup, 'appId', '');
      const groupNames = _.get(newFlowGroup, 'appGroups', []);
      (async function() {
        await dispatch.experimentDataSource.countUserApplicationGroups({ appId, groupNames }, (res: any) => {
          setTotal(res && res.total);
        });
      })();
    }
    setNewFlowGroup({
      ...newFlowGroup,
      hosts: [],
      selectType,
      hostPercent: 0,
    });
    setTaskNumber(0);
  }

  function handleScopeChange(value: IHost[]) {
    setNewFlowGroup({
      ...newFlowGroup,
      hosts: _.uniq(value),
    });
  }

  function handleRangeChange(value: string | number) {
    setTaskNumber(Math.ceil((value as number / 100) * total));
    setNewFlowGroup({
      ...newFlowGroup,
      hosts: [],
      hostPercent: value,
    });
  }

  function handleCopySubmit() {
    if (props?.onSubmit) {
      props.onSubmit(_.cloneDeep(newFlowGroup));
    } else {
      dispatch.experimentEditor.setCopyFlowGroups({ ...newFlowGroup as IFlowGroup });
    }
    handleNoCopy();
  }

  function handleNoCopy() {
    props.onCloseCopy();
    setVisible(false);
  }

  function renderScope() {
    if (_.isEmpty(newFlowGroup)) {
      return null;
    }
    const { hosts, scopeType, cloudServiceType } = newFlowGroup as IFlowGroup;
    return (
      <FormItem label="机器列表" required wrapperCol={{ span: 22 }}>
        <ScopeLists
          value={hosts}
          isApp={false}
          onChange={handleScopeChange}
          type={cloudServiceType as string}
          scopeType={scopeType}
          listTips='机器列表'
        />
      </FormItem>
    );
  }

  const { appName } = newFlowGroup as IFlowGroup;
  return <Dialog
    title='选择机器'
    visible={visible}
    onClose={handleNoCopy}
    onOk={handleCopySubmit}
    onCancel={handleNoCopy}
    style={{ width: 900 }}
  >
    <div className={styles.content}>
      {appName ? <ApplicationGroup
        disableAppSel={props.disableAppSel}
        data={newFlowGroup as IFlowGroup}
        applications={applications}
        groups={groups}
        onAppFocus={handleAppFocus}
        onAppChange={handleAppSelect}
        showScopes={showScopes}
        scopeType={scopeType}
        experimentObj={appName ? 0 : 2}
        onGroupFocus={handleGroupFocus}
        onGroupChange={handleGroupSelect}
        onSelectTypeChange={handleScopeSelectTypeChange}
        onScopeChange={handleScopeChange}
        scopeSelectType={scopeSelectType}
        onRangeChange={handleRangeChange}
        taskNumber={taskNumber}
        total={total}
      /> : renderScope()}
    </div>
  </Dialog>;
}
