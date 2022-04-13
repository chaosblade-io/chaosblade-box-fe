import ActivityEditor from 'pages/Chaos/Experiment/common/ActivityEditor';
import AddFunction from 'pages/Chaos/Experiment/common/AddFunction';
import ApplicationGroup from './ApplicationGroup';
import MiniFlow from 'pages/Chaos/common/MiniFlow';
import ParameterUtil from 'pages/Chaos/lib/ParameterUtil';
import React, { useEffect, useState } from 'react';
import ScopeLists from './ScopeLists';
import _ from 'lodash';
import styles from './index.css';
import { APPLICATION_TYPE, NODE_TYPE, OS_TYPE, SCOPE_TYPE, SELECT_TYPE, STAGES } from 'pages/Chaos/lib/FlowConstants';
import { Badge, Balloon, Button, Dialog, Field, Form, Icon, Input, Message, Radio } from '@alicloud/console-components';
import { IActivity } from 'config/interfaces/Chaos/experimentTask';
import { IApp, IArgs, ICheckDeatail, IFlow, IFlowGroup, IHost, INode, IStages } from 'config/interfaces/Chaos/experiment';
import { getNodes, unDecorateFlowGroup } from 'pages/Chaos/lib/FlowGroupDecorate';
import { parseQuery } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { v4 as uuidv4 } from 'uuid';

const { Item: FormItem } = Form;
const { Group: RadioGroup } = Radio;

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 9 },
};

const formFlowLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

interface FlowGroupProps {
  data: IFlowGroup;
  onCancel: (flowGroup: IFlowGroup) => void;
  onSave: (flowGroup: IFlowGroup) => void;
  isEdit: boolean;
  isExpertise: boolean;
  onDisableCancel: boolean;
}

function FlowGroup(props: FlowGroupProps) {
  const dispatch = useDispatch();
  const myfield = Field.useField([]);
  const { init } = myfield;
  const { applications, groups } = useSelector(({ experimentDataSource }) => {
    return {
      applications: experimentDataSource.applications,
      groups: experimentDataSource.groups,
    };
  });
  const [ flowGroup, setFlowGroup ] = useState<IFlowGroup>(props.data);
  const [ addFunctionVisible, setAddFunctionVisible ] = useState(false);
  // const [ validateGroup, setValidateGroup ] = useState<string>('success');
  const [ validateApp, setValidateApp ] = useState<'warning' | 'error' | 'success' | 'loading' | undefined>('success');
  const [ scopeType, setScopeType ] = useState<string | number>(); // 资源类型
  const [ editNodeVisible, setEditNodeVisible ] = useState(false); // 参数面板抽屉显示控制
  const [ currentNode, setCurrentNode ] = useState<INode | null>(null);
  const [ experimentObj, setExperimentObj ] = useState<string | number>(APPLICATION_TYPE.APPLICATION); // 演练对象
  const [ showScopes, setShowScopes ] = useState(true); // 应用下是否展示机器列表
  const [ k8sResourceType, setK8sResourceType ] = useState(NaN); // 应用下机器类型
  const [ appDisabled, setAppDisabled ] = useState(false); // 是否可选择应用与非应用
  const [ scopeDisabled, setScopeDisabled ] = useState(false); // 是否可选择机器与k8S
  const [ showExperimentObj, setShowExperimentObj ] = useState(false);
  const [ scopeSelectType, setScopeSelectType ] = useState<string | number>(SELECT_TYPE.IPS);
  const [ taskNumber, setTaskNumber ] = useState<number>(0);
  const [ total, setTotal ] = useState<number>(0);
  const [ isApp, setIsApp ] = useState(false); // 编辑情况下机器类型不影响应用类型
  const [ osType, setOsType ] = useState(NaN); // 机器操作系统

  const query = parseQuery();
  const { expertiseId, code } = query;

  useEffect(() => {
    if (!scopeType && scopeType !== SCOPE_TYPE.HOST) {
      const { data: { hosts, scopeType, appName, selectType, osType: nextOsType }, isExpertise, isEdit } = props;
      const appType = _.get(props, 'data.appType', '');
      if (nextOsType === OS_TYPE.LINUX || osType === OS_TYPE.WINDOWS) {
        setOsType(nextOsType!);
      }
      if (appName) {
        setExperimentObj(APPLICATION_TYPE.APPLICATION);
        setK8sResourceType(appType);
        setScopeType(scopeType!);
        setOsType(nextOsType!);
        isEdit && setAppDisabled(true);
        setShowExperimentObj(true);
        setScopeSelectType(selectType!);
        isEdit && setIsApp(true);
        if (selectType === SELECT_TYPE.IPS) {
          setShowScopes(true);
        }
        if (!selectType && !_.isEmpty(hosts)) {
          setScopeSelectType(SELECT_TYPE.IPS);
        }
      } else if (scopeType === SCOPE_TYPE.HOST || scopeType === SCOPE_TYPE.K8S) {
        if ((!isExpertise && expertiseId) || code) {
          // 经验库创建或是演练场景直接创建
          setScopeType(scopeType);
          setScopeDisabled(true);
          setShowExperimentObj(true);
          setOsType(nextOsType!);
          if (!_.isEmpty(hosts) && !appName) {
            setExperimentObj(APPLICATION_TYPE.HOSTS);
          } else {
            setExperimentObj(APPLICATION_TYPE.APPLICATION);
          }
        } else {
          setScopeType(scopeType);
          setOsType(nextOsType!);
          setExperimentObj(APPLICATION_TYPE.HOSTS);
          if (!isEdit) {
            setShowExperimentObj(true);
          } else {
            setShowExperimentObj(true);
            setAppDisabled(true);
          }
          if (selectType) {
            setScopeSelectType(selectType!);
          } else {
            setScopeSelectType(SELECT_TYPE.IPS);
          }
        }
      } else if (!_.isEmpty(hosts)) {
        setScopeType(hosts[0].scopeType);
        setAppDisabled(true);
        setExperimentObj(APPLICATION_TYPE.HOSTS);
        setShowExperimentObj(true);
        setScopeSelectType(SELECT_TYPE.IPS);
      } else if (experimentObj) {
        setExperimentObj(experimentObj);
      } else if (isExpertise && !scopeType) {
        setScopeType(SCOPE_TYPE.K8S); // 默认资源类型选择k8s
        setExperimentObj(APPLICATION_TYPE.HOSTS);
        setAppDisabled(true);
        setShowExperimentObj(true);
        setOsType(OS_TYPE.LINUX);
      } else {
        setScopeType(SCOPE_TYPE.K8S); // 默认资源类型选择k8s
        setExperimentObj(APPLICATION_TYPE.APPLICATION);
        setShowExperimentObj(true);
        setFlowGroup({ ...flowGroup, selectType: SELECT_TYPE.IPS });
      }
    }
  });

  useEffect(() => {
    const { data: { appId, appGroups, hostPercent } } = props;
    let isUnmount = false;
    // if (!isUnmount && appId && !_.isEmpty(appGroups) && selectType && selectType === SELECT_TYPE.PERCENT) {
    if (!isUnmount && appId && !_.isEmpty(appGroups)) {
      // 先选择机器类型再选择分组情况处理
      (async function() {
        await dispatch.experimentDataSource.countUserApplicationGroups({ appId, groupNames: appGroups }, (res: any) => {
          setTotal(res && res.total);
          res.total === 0 && setScopeSelectType(SELECT_TYPE.IPS);
          res && setTaskNumber(Math.ceil((hostPercent as number / 100) * res.total));
        });
      })();
    }
    return () => { isUnmount = true; };
  }, []);

  // 应用与非应用切换
  function handleApplicationChange(value: any) {
    setExperimentObj(value);
    if (expertiseId) {
      setFlowGroup({
        ...flowGroup,
        appName: '',
        appId: '',
        appGroups: [],
        appType: NaN,
        hosts: [],
        selectType: NaN,
        scopeType,
        experimentObj: value,
        osType: (scopeType === SCOPE_TYPE.HOST && value === APPLICATION_TYPE.HOSTS) ? OS_TYPE.LINUX : NaN,
      });
    } else {
      setFlowGroup({
        ...flowGroup,
        appName: '',
        appId: '',
        appGroups: [],
        appType: NaN,
        hosts: [],
        flows: [],
        selectType: NaN,
        scopeType,
        experimentObj: value,
        osType: (scopeType === SCOPE_TYPE.HOST && value === APPLICATION_TYPE.HOSTS) ? OS_TYPE.LINUX : NaN,
      });
    }
    if (value === APPLICATION_TYPE.APPLICATION) {
      // 经验创建需要限制操作系统类型，传参加osType
      // if (expertiseId && scopeType === SCOPE_TYPE.HOST) {
      //   (async function() {
      //     await dispatch.experimentDataSource.getApplication({ filterDisabled: true, appType: scopeType, osType });
      //   })();
      // } else {
      //   (async function() {
      //     await dispatch.experimentDataSource.getApplication({ filterDisabled: true, appType: scopeType });
      //   })();
      // }
    } else {
      setK8sResourceType(NaN);
      if (scopeType === SCOPE_TYPE.HOST && (osType !== OS_TYPE.LINUX && osType !== OS_TYPE.WINDOWS)) {
        setOsType(OS_TYPE.LINUX);
      }
    }
  }

  function renderExperimentObj() {
    return (
      <FormItem label={<div style={{ display: 'flex' }}>
        <span>演练对象</span>
        <Balloon trigger={
          <span className={styles.appOrHosts}><Icon type="help" className={styles.appOrHostsIcon} /></span>
        } triggerType="click" className={styles.balloonStyle}>
          <div className={styles.wordContent}>
            <div>应用：</div>
            <li>按照应用维度来选择需要演练的目标机器，机器选择更加方便，也会帮助您更好的进行演练效果的度量。</li>
            <div>非应用：</div>
            <li>按照不同的部署模式来选择目标机器，分为主机和K8S集群两种。</li>
          </div>
        </Balloon>
      </div>}>
        {!appDisabled ? <RadioGroup
          value={experimentObj}
          onChange={handleApplicationChange as any}
        >
          <Radio id="application" value={APPLICATION_TYPE.APPLICATION}>
            应用
          </Radio>
          <Badge
            content={<span className={styles.badgeWord}>推荐</span>}
            className={styles.badgeIcon}
            style={{ backgroundColor: '#f54743', color: '#fff' }}
          />
          <Radio id="host" value={APPLICATION_TYPE.HOSTS}>
            非应用
          </Radio>
        </RadioGroup> : <span style={{ lineHeight: '32px' }}>{renderAppDisableChange()}</span>}
      </FormItem>
    );
  }

  function renderAppDisableChange() {
    if (experimentObj === 0) {
      return '应用';
    } else if (experimentObj === 2) {
      return '非应用';
    }
    const appName = _.get(flowGroup, 'appName', '');
    if (appName || isApp) {
      return '应用';
    }
    return '非应用';
  }

  // 切换资源类型
  function handleScopeTypeChange(scopeType: any) {
    const { isExpertise } = props;
    setScopeType(scopeType);
    setEditNodeVisible(false); // 关闭参数弹框
    if (!isExpertise) {
      setFlowGroup({
        ...flowGroup,
        appName: '',
        appId: '',
        appGroups: [],
        appType: NaN,
        selectType: NaN,
        scopeType: NaN,
        hostPercent: 0,
        hosts: [],
        flows: [],
        cloudServiceName: '',
        cloudServiceType: '',
      });
    } else {
      setFlowGroup({
        ...flowGroup,
        scopeType,
        flows: [],
      });
    }
    if (scopeType !== SCOPE_TYPE.HOST) {
      setOsType(NaN);
    }
    setShowExperimentObj(false);
    setExperimentObj(NaN);
    handleCloudFocus();
    setScopeSelectType(SELECT_TYPE.IPS);
    setTotal(0);
  }

  const handleCloudFocus = () => {
    (async function() {
      await dispatch.experimentDataSource.getCloudServiceList();
    })();
  };

  function handleScopeSelectTypeChange(selectType: string | number) {
    setScopeSelectType(selectType);
    if (selectType === SELECT_TYPE.IPS) { setShowScopes(true); }
    if (selectType === SELECT_TYPE.PERCENT) {
      const appId = _.get(flowGroup, 'appId', '');
      const groupNames = _.get(flowGroup, 'appGroups', []);
      (async function() {
        await dispatch.experimentDataSource.countUserApplicationGroups({ appId, groupNames }, (res: any) => {
          setTotal(res && res.total);
        });
      })();
    }
    if (!isExpertise) {
      setFlowGroup({
        ...flowGroup,
        hosts: [],
        selectType,
        hostPercent: 0,
      });
      setTaskNumber(0);
    } else {
      setFlowGroup({
        ...flowGroup,
        scopeType,
        flows: [],
      });
    }
  }

  function handleRangeChange(value: string | number) {
    setTaskNumber(Math.ceil((value as number / 100) * total));
    if (!isExpertise) {
      setFlowGroup({
        ...flowGroup,
        hosts: [],
        hostPercent: value,
      });
    } else {
      setFlowGroup({
        ...flowGroup,
        scopeType,
      });
    }
  }

  function handleOsTypeChange(ostype: number) {
    setFlowGroup({
      ...flowGroup,
      flows: [],
      osType: ostype,
    });
    setOsType(ostype);
  }

  function renderScopeType() {
    return (
      <FormItem label="资源类型">
        {!scopeDisabled ? <RadioGroup
          value={scopeType}
          onChange={handleScopeTypeChange as any}
        >
          <Radio id="hostname" value={SCOPE_TYPE.K8S}>
            Kubernetes
          </Radio>
          <Radio id="applications" value={SCOPE_TYPE.HOST}>
            主机
          </Radio>
        </RadioGroup> : <span style={{ lineHeight: '32px' }}>{renderScopeDisableChange()}</span>}
      </FormItem>
    );
  }

  // 经验库创建选择操作系统
  function renderOsType() {
    return (
      <FormItem label="操作系统">
        <RadioGroup
          value={osType}
          onChange={handleOsTypeChange as any}
        >
          <Radio id="linux" value={OS_TYPE.LINUX}>
            linux
          </Radio>
          <Radio id="windows" value={OS_TYPE.WINDOWS}>
            windows
          </Radio>
        </RadioGroup>
      </FormItem>
    );
  }

  function renderScopeDisableChange() {
    const scopeType = _.get(flowGroup, 'scopeType', '');
    if (scopeType === SCOPE_TYPE.HOST) {
      return '主机';
    }
    return 'Kubernetes';
  }

  function renderScope() {
    if (_.isEmpty(flowGroup)) {
      return null;
    }
    const { hosts } = flowGroup;
    return (
      <FormItem label="机器列表" required wrapperCol={{ span: 22 }}>
        <ScopeLists
          value={hosts}
          isApp={false}
          onChange={handleScopeChange}
          scopeType={scopeType}
          listTips='机器列表'
          experimentObj={experimentObj}
          // osTypeSelect={scopeType === SCOPE_TYPE.HOST && experimentObj === APPLICATION_TYPE.HOSTS}
          osType={osType}
          osTypeChange={handleScopeOsTyps}
        />
      </FormItem>
    );
  }

  function handleScopeOsTyps(ostype: number) {
    setOsType(ostype);
    setFlowGroup({
      ...flowGroup,
      hosts: [],
      flows: [],
      osType: ostype,
    });
  }

  function handleScopeChange(value: IHost[]) {
    setFlowGroup({
      ...flowGroup,
      hosts: _.uniq(value),
    });
    if (!_.isEmpty(value)) {
      setValidateApp('success');
    } else {
      setValidateApp('error');
    }
  }

  function handleAddFunction() {
    setAddFunctionVisible(true);
  }

  function handleAddFunctionClose() {
    setAddFunctionVisible(false);
  }

  function decorateFlow(flow: IFlow | null) {
    if (!_.isEmpty(flow)) {
      // 给flow设置全局唯一的id，方便管理
      if (flow && !flow.id) {
        flow.id = uuidv4();
      }

      // 对flow的每个node设置全局唯一的id，方便管理
      _.forEach([ 'check', 'prepare', 'recover', 'attack' ], (stage: string) => {
        const nodes = flow && flow[stage];
        if (!_.isEmpty(nodes)) {
          _.forEach(nodes, (node: INode) => {
            decorateNode(node, flow, stage);
          });
        }
      });

      // 做成双向链表，方便添加节点逻辑
      const nodes = getNodes(flow);
      _.forEach(nodes, (node: INode, index: number) => {
        const hasPrev = index > 0;
        const hasNext = index < nodes.length - 1;
        if (hasPrev) {
          node.prev = nodes[index - 1];
        }
        if (hasNext) {
          node.next = nodes[index + 1];
        }
      });

      return flow;
    }
    return null;
  }

  function decorateNode(node: INode, flow: IFlow | null, stage: string, extend?: any[]) {
    if (!_.isEmpty(node)) {
      // 根据node.required判断是否可以删除，由后端控制
      node.deletable = !node.required;

      if (!node.id) {
        node.id = uuidv4();
      }
      if (!node.nodeType) {
        node.nodeType = NODE_TYPE.NORMAL;
      }
      if (!node.flowId) {
        node.flowId = flow && flow.id;
      }
      if (!node.args) {
        node.args = [];
      }
      if (!node.hasOwnProperty('argsValid')) {
        // 默认参数校验通过
        node.argsValid = true;
      }
      // stage, phase
      const stageItem = _.find(STAGES, (s: IStages) => s.key === stage) as any;
      if (!_.isEmpty(stageItem)) {
        node.stage = stageItem.key;
        node.phase = stageItem.value;
      }

      // 添加insertBefore和insertAfter便捷方法插入新节点
      node.insertBefore = (newNode: INode) => {
        const { stage } = newNode as INode;
        const stageNodes = _.get(flow, stage as string, []);
        if (stage === node.stage) {
          const index = _.findIndex(stageNodes, (n: INode) => n.id === node.id);
          stageNodes.splice(index, 0, newNode);
        } else {
          // 如果阶段不一样，则插入阶段节点数组末尾
          stageNodes.push(newNode);
        }
        if (flow && stage) {
          flow[stage] = stageNodes;
        }
        setFlowGroup({ ...flowGroup });
      };

      node.insertAfter = newNode => {
        const { stage } = newNode;
        const stageNodes = _.get(flow, stage as string, []);
        if (stage === node.stage) {
          const index = _.findIndex(stageNodes, (n: INode) => n.id === node.id);
          stageNodes.splice(index + 1, 0, newNode);
        } else {
          // 如果阶段不一样，则插入阶段节点数组开头
          stageNodes.unshift(newNode);
        }
        if (flow && stage) {
          flow[stage] = stageNodes;
        }
        setFlowGroup({ ...flowGroup });
      };

      // 扩展
      if (!_.isEmpty(extend)) {
        _.merge(node, extend);
      }
    }
    return node;
  }

  function handleFunctionSelect(data: INode) {
    const appCode = _.get(data, 'code', '');
    const appId = _.get(flowGroup, 'appId', '');
    const nodeGroups = _.get(flowGroup, 'appGroups', []);
    if (appCode) {
      const source = experimentObj === APPLICATION_TYPE.APPLICATION ? 1 : 0;
      // 根据选择的小程序code，初始化微流程
      (async function() {
        await dispatch.experimentDataSource.initMiniFlow({ appCode, source, appId, nodeGroups }, (flow: IFlow) => {
          if (process.env.NODE_ENV === 'development') {
            // 由于接口对象层级较深，会修改到mock接口导出的结果
            // 避免问题这里先deepclone，仅限于线下开发
            flow = _.cloneDeep(flow);
          }

          flow = decorateFlow(flow) as IFlow;

          if (!_.isEmpty(flow)) {
            const flows = _.get(flowGroup, 'flows', []) as IFlow[];
            flows.push(flow);
            setFlowGroup({
              ...flowGroup,
              flows: [ ...flows ] as IFlow[],
              scopeType,
            });
          }
        });
      })();
    }
  }

  function handleAppFocus() {
    if (expertiseId || code) {
      // const { data: { scopeType = 0 } } = props;
      // 经验创建需要限制操作系统类型，传参加osType
      // if (scopeType === SCOPE_TYPE.HOST) {
      //   (async function() {
      //     await dispatch.experimentDataSource.getApplication({ filterDisabled: true, appType: scopeType, osType });
      //   })();
      // } else {
      //   (async function() {
      //     await dispatch.experimentDataSource.getApplication({ filterDisabled: true, appType: scopeType });
      //   })();
      // }
    } else {
      // (async function() {
      //   await dispatch.experimentDataSource.getApplication({ filterDisabled: true, appType: scopeType });
      // })();
    }
  }

  function handleAppSelect(value: string, actionType: string, item: IApp) {
    setScopeSelectType(SELECT_TYPE.IPS);
    (async function() {
      await dispatch.experimentDataSource.getApplicationGroup({ app_id: value });
    })();
    if (item.osType! === osType || (!osType && osType !== OS_TYPE.LINUX)) {
      handleSetChangApp(value, actionType, item, false);
    } else {
      if (!_.isEmpty(flowGroup.hosts) || !_.isEmpty(flowGroup.flows)) {
        Dialog.alert({
          title: '提示',
          content: '您当前已切换了不同操作系统的演练应用，将会清空演练机器和演练内容',
          onOk: () => handleSetChangApp(value, actionType, item, true),
        });
      } else {
        handleSetChangApp(value, actionType, item, false);
      }
    }
  }

  function handleSetChangApp(value: string, actionType: string, item: IApp, update: boolean) {
    const { isExpertise } = props;
    if (!isExpertise) {
      // 经验库创建更改应用不影响微流程
      if (expertiseId) {
        setFlowGroup({
          ...flowGroup,
          appName: item && item.label,
          appId: value,
          appGroups: [],
          hosts: [],
          appType: item && item.appType,
          scopeType: item && item.scopesType,
          osType: item && item.osType,
        });
      } else {
        setFlowGroup({
          ...flowGroup,
          appName: item && item.label,
          appId: value,
          appGroups: [],
          hosts: [],
          appType: item && item.appType,
          flows: update ? [] : flowGroup.flows,
          scopeType: item && item.scopesType,
          osType: item && item.osType,
        });
      }
    } else {
      setFlowGroup({
        ...flowGroup,
        appName: item && item.label,
        appId: value,
        appGroups: [],
        appType: item && item.appType,
        scopeType,
      });
    }
    setK8sResourceType(item && item.appType);
    setScopeType(item && item.scopesType);
    setOsType(item && item.osType);
  }

  function handleGroupSelect(value: string[]) {
    setScopeSelectType(SELECT_TYPE.IPS);
    const { isExpertise } = props;
    const { hosts, appId } = flowGroup;
    // if (scopeSelectType === SELECT_TYPE.PERCENT) {
    // 先选择机器类型再选择分组情况处理
    (async function() {
      await dispatch.experimentDataSource.countUserApplicationGroups({ appId, groupNames: value }, (res: any) => {
        setTotal(res && res.total);
      });
    })();
    // }
    if (!isExpertise) {
      setFlowGroup({
        ...flowGroup,
        appGroups: value,
        hosts: _.isEmpty(value) ? [] : hosts,
      });
      // setShowScopes(true);
    } else {
      setFlowGroup({
        ...flowGroup,
        appGroups: value,
      });
    }
  }

  function handleGroupFocus() {
    (async function() {
      await dispatch.experimentDataSource.getApplicationGroup({
        app_id: flowGroup && flowGroup.appId,
      });
    })();
  }

  function handleNodesArgsCheck(nodes: INode[]) {
    return ParameterUtil.checkNodesArgs(nodes);
  }

  // 编辑框保存
  function handleSubmit() {
    const { isExpertise, onSave } = props;
    const groupName: string = myfield.getValue('groupName');

    // 演练名称必填校验
    if (!groupName) {
      // setValidateGroup('error');
      Message.error('请填写演练名称！');
      return;
    }
    flowGroup.groupName = groupName;

    // 机器列表必填校验
    if (!isExpertise) {
      if (scopeSelectType === SELECT_TYPE.IPS) {
        if (_.isEmpty(flowGroup.hosts)) {
          setValidateApp('error');
          Message.error('请选择机器列表！');
          return;
        }
      } else {
        if (flowGroup && flowGroup.appName && !flowGroup.hostPercent) {
          setValidateApp('error');
          Message.error('请选择机器百分比！');
          return;
        }
      }
    }

    // 保存之前把之前decorate过的undecorate一下，避免循环引用
    unDecorateFlowGroup(flowGroup);
    const flows = _.get(flowGroup, 'flows', []);

    // 演练内容校验
    if (_.isEmpty(flows)) {
      // setFlowsEmpty(true);
      Message.error('请添加演练内容！');
      return;
    }

    // 前端参数校验
    // 注意：管理员配置经验时不校验参数，不会填写的
    let checkFailedNodes: any[] = [];
    if (!isExpertise && flows) {
      _.forEach(flows as IFlow[], (f: IFlow | null) => {
        const nodes = getNodes(f);
        checkFailedNodes = _.concat(checkFailedNodes, handleNodesArgsCheck(nodes));
      });
    }

    if (!_.isEmpty(checkFailedNodes)) {
      // 取第一个节点提示
      const errorNode = checkFailedNodes[0];
      Message.error(`"${errorNode.activityName}"节点参数配置有误！`);
      // 触发re-render
      setFlowGroup({ ...flowGroup });
      return;
    }

    // 后端参数校验
    if (!isExpertise && flows) {
      // 复制一份，用于异步操作(会被重新decorate回去)
      const flowGroupCopy = _.cloneDeep(flowGroup);

      // 传入接口的数据，节点的args需要赋给arguments，后端只认arguments
      // 所以这里需要深拷贝，不能影响前端的数据
      const inputFlowGroup = _.cloneDeep(flowGroup);
      const inputFlows = inputFlowGroup.flows as IFlow[];
      for (const inputFlow of inputFlows) {
        const nodes = getNodes(inputFlow);
        for (const node of nodes) {
          if (!_.isEmpty(node.args)) {
            node.arguments = node.args;
            // args字段也就没用了
            delete node.args;
          }
        }
      }
      // 提交后端
      (async function() {
        await dispatch.experimentDataSource.checkActivityGroupDefinition(inputFlowGroup, ({ is_pass, details = [] }) => {
          const flows = _.get(flowGroupCopy, 'flows', []);

          // 准备好所有节点
          let totalNodes: any[] = [];
          for (const flow of flows) {
            totalNodes = _.concat(totalNodes, getNodes(flow as IFlow));
          }

          if (is_pass) {
            // 校验通过
            for (const node of totalNodes) {
              // 标志位重置
              node.argsValid = true;

              // 参数报错置空
              for (const arg of node.args) {
                arg.errorMessage = '';
              }
            }

            // 继续下面操作
            onSave && onSave({ ...flowGroupCopy, scopeType });
          } else {
            let found = false;
            // 找出有问题的node，设置参数报错信息
            for (const failedNode of details) {
              const { id: failedNodeId, params }: ICheckDeatail = failedNode;
              const targetNode = _.find(totalNodes, ({ id }: INode) => id === failedNodeId);
              if (!_.isEmpty(targetNode)) {
                found = true;
                // 将节点标记为报错
                targetNode.argsValid = false;

                for (const param of params) {
                  let arg: any = null;
                  targetNode.args.forEach((item: any) => {
                    item.argumentList?.forEach((temp: IArgs) => {
                      if (temp.alias === param.alias) {
                        arg = temp;
                      }
                    });
                  });
                  // const arg = _.find(targetNode.args, ({ alias }: IArgs) => alias === param.alias);
                  if (!_.isEmpty(arg)) {
                    // 设置参数报错信息
                    arg.errorMessage = param.error;
                  }
                }
              }
            }
            // 补偿一下，如果没找到错误节点，则放行
            if (!found) {
              // 在异步操作里，需要对flowGroup重新unDecorate
              onSave && onSave({ ...flowGroupCopy, scopeType });
              return;
            }
            Message.error('演练分组参数配置有误，请修改！');
            // 触发re-render
            setFlowGroup(flowGroupCopy);
          }
        });
      })();
    } else {
      onSave && onSave({ ...flowGroup, scopeType, osType });
    }
  }

  // 取消编辑框
  function handleCancel() {
    // 编辑取消之前把之前decorate过的undecorate一下，避免循环引用
    unDecorateFlowGroup(flowGroup);
    props.onCancel(flowGroup);
  }

  const handleNodeEditClose = () => {
    setCurrentNode(null);
    setEditNodeVisible(false);
  };

  function handleFlowDelete(flow: IFlow) {
    if (!_.isEmpty(flow)) {
      let { flows } = flowGroup;
      flows = _.filter(flows as IFlow[], (f: IFlow) => f.id !== flow.id);

      setFlowGroup({
        ...flowGroup,
        flows: [ ...flows! ],
      });
    }
  }

  function handleNodeAdd(node: INode | IActivity, flow: IFlow) {
    decorateNode(node as INode, flow, node.stage!);
  }

  function handleNodeDelete(node: INode | IActivity, flow: IFlow) {
    handleNodeEditClose();

    if (!_.isEmpty(node)) {
      const { stage } = node;
      if (!_.isEmpty(stage)) {
        let nodes = flow[stage!];
        nodes = _.filter(nodes, (n: INode) => n.id !== node.id);
        flow[stage!] = nodes;

        setFlowGroup({ ...flowGroup });
      }
    }
  }

  function handleNodeEditing(node: INode | IActivity) {
    if (!_.isEmpty(node)) {
      setCurrentNode(node as INode);
      setEditNodeVisible(true);
      if (currentNode === node) {
        setCurrentNode(null);
        setEditNodeVisible(false);
      } else {
        setCurrentNode(node as INode);
        setEditNodeVisible(true);
      }
    }
  }

  function handleNodeUpdate(node: INode) {
    if (!_.isEmpty(node)) {
      const { id, flowId, stage } = node as INode;
      if (!_.isEmpty(flowGroup)) {
        const flow = _.find(_.get(flowGroup, 'flows', []), (f: IFlowGroup) => f.id === flowId) as IFlow;
        if (!_.isEmpty(flow)) {
          let nodes = flow[stage!];
          if (!_.isEmpty(nodes)) {
            let found = false;
            nodes = _.map(nodes, (n: INode) => {
              if (n.id === id) {
                found = true;
                return node;
              }
              return n;
            });
            flow[stage!] = nodes;

            // 立刻进行一次校验，如果校验不通过，则节点显示红色，所见即所得，提升体验
            handleNodesArgsCheck(nodes);
            if (found) {
              setCurrentNode(node);
              setFlowGroup({ ...flowGroup });
            }
          }
        }
      }
    }
  }

  function renderFlowGroup() {
    const appName = _.get(flowGroup, 'appName', '');
    const { isExpertise } = props;
    const flows = _.get(flowGroup, 'flows', []);
    if (!isExpertise && experimentObj === APPLICATION_TYPE.APPLICATION) {
      if (!appName) {
        return <div className={styles.flowAction}><span style={{ color: '#888' }}>请选择演练应用后添加演练内容</span></div>;
      }
    }

    if (!flows.length) {
      return <div className={styles.flowAction}><span className={styles.addFlow} onClick={handleAddFunction} >添加演练内容</span></div>;
    }
    return <div className={styles.flowAction}><div className={styles.hasFlow}>现有{flows.length}个</div><span className={styles.addFlow} onClick={handleAddFunction}>继续添加</span></div>;
  }

  const groupName = _.get(flowGroup, 'groupName', '');
  const flows = _.get(flowGroup, 'flows', []);
  const hosts = _.get(flowGroup, 'hosts', []);
  const cloudServiceType = _.get(flowGroup, 'cloudServiceType', '');
  const { isExpertise } = props;

  return (<div className={styles.formContent}>
    <div className={styles.flowGroupTips}>
      <Icon type="arrow-down" className={styles.editIcon} />
      <div className={styles.editingFlowGroup}>{groupName || ''}</div>
    </div>
    <Form {...formItemLayout}>
      <FormItem label="分组名称" required>
        <Input
          {...init('groupName', {
            initValue: groupName,
            rules: [{ required: true, message: '不能为空' }],
          })}
          className={styles.itemWidth}
          placeholder="请输入"
        />
      </FormItem>
      {/* 资源类型 */}
      {renderScopeType()}
      {/* 操作系统 */}
      {isExpertise && scopeType === SCOPE_TYPE.HOST && renderOsType()}
      {/* 演练对象 */}
      {!isExpertise && showExperimentObj && renderExperimentObj()}
      {!isExpertise && experimentObj === APPLICATION_TYPE.APPLICATION &&
        <ApplicationGroup
          data={flowGroup}
          applications={applications}
          groups={groups}
          showScopes={showScopes}
          validateApp={validateApp}
          onAppChange={handleAppSelect}
          onAppFocus={handleAppFocus}
          onGroupChange={handleGroupSelect}
          onGroupFocus={handleGroupFocus}
          onScopeChange={handleScopeChange}
          scopeSelectType={scopeSelectType}
          scopeType={scopeType}
          osType={osType}
          experimentObj={experimentObj}
          onSelectTypeChange={handleScopeSelectTypeChange}
          onRangeChange={handleRangeChange}
          taskNumber={taskNumber}
          total={total}
        />
      }
      {!props.isExpertise && experimentObj === APPLICATION_TYPE.HOSTS && renderScope()}
    </Form>
    {/* 添加演练内容 */}
    <Form {...formFlowLayout}>
      <FormItem label="演练内容" required >
        {renderFlowGroup()}
        {
          /* flow */
          _.map(flows as IFlow[], (flow: IFlow) => {
            flow = decorateFlow(flow)!;
            return (
              <MiniFlow
                key={flow.id}
                editable
                deletable={!flow.required}
                scopeType={scopeType!}
                nodes={getNodes(flow)}
                selectedNode={currentNode}
                onDelete={() => handleFlowDelete(flow)}
                onNodeAdding={handleNodeEditClose}
                onNodeAdd={node => handleNodeAdd(node, flow)}
                onNodeDelete={node => handleNodeDelete(node, flow)}
                onNodeClick={node => handleNodeEditing(node)}
                {...props}
              />
            );
          })
        }
      </FormItem>
    </Form>
    <AddFunction
      title='选择演练故障'
      searchable={true}
      isApplication={showScopes}
      visible={addFunctionVisible}
      phase={1 << 1} // eslint-disable-line no-bitwise
      scopeType={scopeType!}
      osType={osType}
      k8sResourceType={k8sResourceType}
      onClose={handleAddFunctionClose}
      onSelect={(data: INode) => handleFunctionSelect(data)}
      cloudServiceType={cloudServiceType}
    />
    <Form {...formItemLayout} className={styles.buttonGroup}>
      <FormItem label=" ">
        <Button type="primary" onClick={handleSubmit} className={styles.submit} data-autolog={'text=保存演练分组'}>保存</Button>
        <Button type="normal" onClick={handleCancel} disabled={props.onDisableCancel}>取消</Button>
      </FormItem>
    </Form>
    {/* 参数编辑 */}
    {currentNode &&
      <ActivityEditor
        {...props}
        visible={editNodeVisible}
        data={currentNode!}
        onClose={handleNodeEditClose}
        updateNode={handleNodeUpdate}
        isExpertise={isExpertise}
        hosts={hosts}
      />
    }
  </div>);
}

export default FlowGroup;
