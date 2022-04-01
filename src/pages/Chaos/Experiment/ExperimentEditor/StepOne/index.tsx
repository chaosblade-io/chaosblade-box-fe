import CopyHostDialog from './copyHostDialog';
import FlowGroupEditor from './FlowGroup';
import InvalidHostsDialog from './FlowGroup/ScopeLists/InvalidHostsDialog';
import ParameterUtil from 'pages/Chaos/lib/ParameterUtil';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styles from './index.css';
import { Balloon, Button, Dialog, Icon, Message } from '@alicloud/console-components';
import { IExperiment, IFlow, IFlowGroup, IHost, INode } from 'config/interfaces/Chaos/experiment';
import { SCOPE_TYPE, SELECT_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { decorateFlow } from 'pages/Chaos/lib/FlowGroupDecorate';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';


const DEFAULT_GROUP_NAME = '默认分组';

interface StepOneProps {
  isEdit: boolean;
  onNext: () => void;
  onBack: () => void;
  experiment?: IExperiment;
  isExpertise: boolean;
}

function StepOne(props: StepOneProps) {
  const dispatch = useDispatch();
  const experiment = useSelector(({ experimentEditor }) => experimentEditor.experiment);
  const expertise = useSelector(({ expertiseEditor }) => expertiseEditor.expertise, (preProps, state) => {
    return preProps === state;
  });

  const [ draftFlowGroup, setDraftFlowGroup ] = useState<IFlowGroup | null>(null);
  const [ isUpdate, setIsUpdate ] = useState(false);
  const [ targetFlowGroup, setTargetFlowGroup ] = useState<IFlowGroup | null>(null);
  const [ copyVisible, setCopyVisible ] = useState(false);

  useEffect(() => {
    initDraftFlowGroup(getFlowGroups());
  }, []);

  useEffect(() => {
    const flowGroups = getFlowGroups();
    if (!isUpdate && !_.isEmpty(flowGroups) && !_.isEmpty(draftFlowGroup)) {
      setIsUpdate(true);
      initDraftFlowGroup(flowGroups);
    }
  });

  function getFlowGroups() {
    let flowGroups = [];
    if (props.isExpertise) {
      flowGroups = _.get(expertise, 'executable_info.flow.flowGroups', []);
    } else {
      if (_.isEmpty(experiment)) {
        return [];
      }
      flowGroups = _.get(experiment, 'flow.flowGroups', []);
    }

    // 之前这里做了倒序排列，但是加了分组编号之后就会和后面StepTwo颠倒，所以这里不倒序排列了。
    const copyFlowGroups = flowGroups.slice();

    // 给展示顺序添加分组索引
    _.forEach(copyFlowGroups, (flowGroup: IFlowGroup, index: number) => {
      flowGroup.displayIndex = index + 1;
    });
    return copyFlowGroups;
  }

  function initDraftFlowGroup(flowGroups: IFlowGroup[]) {
    if (_.isEmpty(flowGroups)) {
      setDraftFlowGroup({
        groupId: null,
        groupName: DEFAULT_GROUP_NAME,
        scopeType: NaN,
        flows: [],
        hosts: [],
        selectType: SELECT_TYPE.IPS,
      });
    } else {
      // 默认进来展开第1个，这里需要深拷贝（未被decorate之前），下面就会对flowGroups进行patch
      const draftFlowGroupNew = _.cloneDeep(flowGroups[0]);
      setDraftFlowGroup(draftFlowGroupNew);
    }

    _.forEach(flowGroups, (flowGroup: IFlowGroup) => {
      const flows = _.get(flowGroup, 'flows', []);
      _.forEach(flows as IFlow[], (flow: IFlow) => decorateFlow(flow));

      const { isExpertise } = props;
      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseFlowGroup({ ...flowGroup });
      } else {
        dispatch.experimentEditor.setAddOrUpdateFlowGroup({ ...flowGroup });
      }
    });
  }

  function getFlowGroupCount() {
    if (_.isEmpty(experiment)) {
      return [];
    }
    const flowGroups = _.get(experiment, 'flow.flowGroups', []);
    return flowGroups.length;
  }

  function handleFlowGroupAdd() {
    if (!_.isEmpty(draftFlowGroup)) {
      Message.error('请保存或取消编辑！');
      return;
    }

    const flowGroupCount = getFlowGroupCount();
    setDraftFlowGroup({
      groupId: '',
      groupName: flowGroupCount > 0 ? '' : DEFAULT_GROUP_NAME,
      flows: [],
      hosts: [],
    });
  }

  function handleCheckAll(e: any) {
    e.stopPropagation();
  }

  function handleFlowGroupEdit(flowGroup: IFlowGroup) {
    if (!draftFlowGroup) {
      setDraftFlowGroup(flowGroup);
    }
    return;
  }

  function handleScope(val: IHost) {
    let label;
    if (val.scopeType === SCOPE_TYPE.HOST || val.app || val.scopeType === SCOPE_TYPE.CLOUD) {
      label = `${val.ip}[${val.deviceName}]`;
    } else {
      if (val && !_.isEmpty(val.clusterName)) {
        label = `[K8S] ${val.clusterName}`;
      } else {
        label = `[K8S] ${val.clusterId}`;
      }
    }
    return label;
  }

  function handleIpBlock(ips: any[], more: boolean) {
    let value;
    if (more) {
      value = ips.slice(0, 5);
    } else {
      value = ips;
    }
    return <div className={styles.ipList}>
      {value.map(it => {
        return <div className={styles.ipBlock} key={it.app ? it.appConfigurationId : it.deviceConfigurationId} title={handleScope(it)}></div>;
      })}
      {more && <span style={{ marginRight: 12 }}>...</span>}
      <Balloon
        trigger={<div className={styles.allCheck} onClick={e => handleCheckAll(e)}>查看全部</div>}
        align="t"
        alignEdge
        triggerType="click"
      >
        {ips.map(it => {
          return <li key={it.app ? it.appConfigurationId : it.deviceConfigurationId} className={styles.ipListBallon}>
            {handleScope(it)}
          </li>;
        })}
      </Balloon>
    </div>;
  }

  function handleScopeList(value: IHost[] = []) {
    if (value && value.length === 1) {
      return value.map((it, i) => (<Balloon trigger={<div className={styles.ip}>{handleScope(it)}</div>} key={i}>
        <div>{handleScope(it)}</div>
      </Balloon>));
    }
    if (value && value.length > 1 && value.length <= 5) {
      return handleIpBlock(value, false);
    }
    return handleIpBlock(value, true);
  }

  // 获取 ExperimentFlowGroups
  function getExperimentFlowGroups() {
    let flowGroups;
    if (props.isExpertise) {
      flowGroups = _.get(expertise, 'executable_info.flow.flowGroups', []);
    } else {

      flowGroups = _.get(experiment, 'flow.flowGroups', []);
    }

    return flowGroups;
  }

  function handleFlowGroupDelete(e: any, flowGroup: IFlowGroup) {
    e.stopPropagation();
    Dialog.confirm({
      title: '确认删除？',
      content: '确认后该分组将被删除且不可恢复，请谨慎操作',
      onOk: () => {
        dispatch.experimentEditor.setUpdateFlowGroups(_.filter(getExperimentFlowGroups(), (fg: IFlowGroup) => fg.id !== flowGroup.id) as any);
      },
      onCancel: () => console.log('cancel'),
    });
  }

  // 复制信息弹窗
  function handleFlowGroupCopy(e: any, flowGroup: IFlowGroup) {
    e.stopPropagation();
    flowGroup && setTargetFlowGroup(flowGroup);
    setCopyVisible(true);
  }

  function handleClose() { setCopyVisible(false); }

  function renderFlowGroups(flowGroups: []) {
    if (_.isEmpty(flowGroups)) {
      return null;
    }
    return flowGroups.map((item: IFlowGroup) => {
      return <div className={styles.groups} onClick={() => handleFlowGroupEdit(item)} key={item && item.id}>
        <div className={styles.title}>
          <Icon type="arrow-right" className={styles.groupIcon}/>
          <div className={styles.groupName} title='11'>分组{item.displayIndex}：{item.groupName}</div>
        </div>
        <div className={styles.action}>
          <div>
            {item?.selectType === 2 && `${item.hostPercent || 0} %` || handleScopeList(item.hosts)}
          </div>
          <div>
            {!props.isExpertise && <Icon type="copy" className={styles.groupIpActionCopy} onClick={e => handleFlowGroupCopy(e, item)} title='复制分组'/>}
            {!item.required && <Icon type="ashbin" className={styles.groupIpAction} onClick={e => handleFlowGroupDelete(e, item)} title='删除分组'/>}
          </div>
        </div>
      </div>;
    });
  }

  function handleFlowGroupCancelEditing() {
    // 删除草稿
    setDraftFlowGroup(null);
  }

  // 处理存储演练数据
  function handleFlowGroupSave(flowGroup: IFlowGroup) {
    const { isExpertise } = props;

    // isExpertise: 演练创建or经验创建
    if (!isExpertise) {
      dispatch.experimentEditor.setAddOrUpdateFlowGroup(flowGroup);
    }

    // 专家经验后台保存
    if (isExpertise) {
      dispatch.expertiseEditor.setAddOrUpdateExpertiseFlowGroup(flowGroup);
    }

    // 没有在编辑的草稿了
    setDraftFlowGroup(null);
  }

  function handleNext() {
    const { isExpertise } = props;

    // 基本信息校验
    let baseInfoErrorMessage = '';
    if (isExpertise) {
      // 经验，都是必填项
      const name = _.get(expertise, 'basic_info.name', '');
      const desc = _.get(expertise, 'basic_info.function_desc', '');
      const tags = _.get(expertise, 'basic_info.tags', []);

      // 都是必填
      if (!name) {
        baseInfoErrorMessage = '请填写经验名称！';
      } else if (!desc) {
        baseInfoErrorMessage = '请填写经验描述！';
      } else if (tags.length === 0) {
        baseInfoErrorMessage = '请填写经验标签！';
      }
    } else {
      // 演练，只有名称必填
      const name = _.get(experiment, 'baseInfo.name', '');
      if (!name) {
        baseInfoErrorMessage = '请填写演练名称！';
      }
    }

    if (baseInfoErrorMessage) {
      Message.error(baseInfoErrorMessage);
      return;
    }

    // TODO: 时间关系，校验这部分代码与flowGroup的handleSubmit函数高度重复，待抽象。
    // 校验演练分组配置
    let index = 0;
    const flowGroups = getFlowGroups();
    for (const flowGroup of flowGroups) {
      ++index;

      const { appName, groupName, hosts, flows, hostPercent, selectType, scopeType } = flowGroup;

      // 演练名称必填校验
      if (!groupName) {
        Message.error(`分组${index}：请填写演练名称！`);
        return;
      }

      // 机器列表必填校验
      if (!isExpertise) {
        if (scopeType === SCOPE_TYPE.CLOUD) {
          if (_.isEmpty(hosts)) {
            Message.error(`分组${index}：请选择云服务实例列表！`);
            return;
          }
        }
        if (selectType === SELECT_TYPE.IPS) {
          if (_.isEmpty(hosts)) {
            Message.error(`分组${index}：请选择机器列表！`);
            return;
          }
        }

        if (selectType === SELECT_TYPE.PERCENT && appName && !hostPercent) {
          Message.error(`分组${index}：请选择机器百分比！`);
          return;
        }
      }

      // 演练内容校验
      if (_.isEmpty(flows)) {
        Message.error(`分组${index}：请添加演练内容！`);
        return;
      }

      // 节点参数必填校验
      // 注意：管理员配置经验时不校验参数，不会填写的
      let checkFailedNodes: IFlow[] = [];
      if (!isExpertise && flows) {
        _.forEach(flows, (f: IFlow) => {
          checkFailedNodes = _.concat(checkFailedNodes, handleNodesArgsCheck(f.prepare));
          checkFailedNodes = _.concat(checkFailedNodes, handleNodesArgsCheck(f.attack));
          checkFailedNodes = _.concat(checkFailedNodes, handleNodesArgsCheck(f.check));
          checkFailedNodes = _.concat(checkFailedNodes, handleNodesArgsCheck(f.recover));
        });
      }

      if (!_.isEmpty(checkFailedNodes)) {
        // 取第一个节点提示
        const errorNode = checkFailedNodes[0];
        Message.error(`分组${index}："${errorNode.activityName}"节点参数配置有误！`);
        return;
      }
    }

    const { onNext } = props;
    onNext && onNext();
  }

  function handleNodesArgsCheck(nodes: INode[]) {
    return ParameterUtil.checkNodesArgs(nodes);
  }

  const { isEdit, isExpertise } = props;
  const flowGroups = getFlowGroups();
  let firstPartFlowGroups: any = [];
  let lastPartFlowGroups: any = [];
  let editingIndex = -1;
  if (draftFlowGroup && draftFlowGroup.id) {
    // 说明是编辑当前存储过的，而不是新增的
    editingIndex = _.findIndex(flowGroups, (fg: IFlowGroup) => fg.id === draftFlowGroup.id);
  }
  firstPartFlowGroups = editingIndex === -1 ? [] : flowGroups.slice(0, editingIndex);
  lastPartFlowGroups = editingIndex === -1 ? flowGroups : flowGroups.slice(editingIndex + 1);
  const isDisable = _.isEmpty(getExperimentFlowGroups()) || !_.isEmpty(draftFlowGroup);
  return (
    <div>
      <Button
        type="primary"
        className={styles.addDrillOb}
        onClick={handleFlowGroupAdd}
      >新增演练分组</Button>
      {/* 没有id，表示新增的演练分组，要先展示 */}
      {draftFlowGroup && !draftFlowGroup.id &&
        <FlowGroupEditor
          {...props}
          data={draftFlowGroup}
          onSave={handleFlowGroupSave}
          onCancel={handleFlowGroupCancelEditing}
          onDisableCancel={!!_.isEmpty(flowGroups)}
          isExpertise={isExpertise} // 是否经验创建
          isEdit={isEdit}
        />
      }
      { renderFlowGroups(firstPartFlowGroups) }
      {/* 有id，表示编辑已有的演练分组，按所在位置展示 */}
      {draftFlowGroup && draftFlowGroup.id &&
        <FlowGroupEditor
          {...props}
          data={draftFlowGroup}
          onSave={handleFlowGroupSave}
          onCancel={handleFlowGroupCancelEditing}
          onDisableCancel={!!_.isEmpty(flowGroups)}
          isExpertise={isExpertise}
          isEdit={isEdit}
        />
      }
      { renderFlowGroups(lastPartFlowGroups) }
      <div className='DividerEdit'></div>
      <Button
        onClick={handleNext}
        style={{ marginRight: '10px' }}
        type="primary"
        disabled={isDisable}
      >
        下一步
      </Button>
      {
        props.isEdit && <Button type='normal' onClick={props.onBack}>取消编辑</Button>
      }
      {/* @ts-ignore */}
      <InvalidHostsDialog/>
      {!isExpertise && copyVisible && <CopyHostDialog
        visible={copyVisible}
        data={targetFlowGroup as IFlowGroup}
        onCloseCopy={handleClose}
      />}
    </div>
  );
}

export default StepOne;
