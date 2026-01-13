import ActivityEditor from 'pages/Chaos/Experiment/common/ActivityEditor';
import AddFunction from 'pages/Chaos/Experiment/common/AddFunction';
import ApplicationGroup from './ApplicationGroup';
import MiniFlow from 'pages/Chaos/common/MiniFlow';
import ParameterUtil from 'pages/Chaos/lib/ParameterUtil';
import React, { useEffect, useState } from 'react';
import ScopeLists from './ScopeLists';
import Translation from 'components/Translation';
import _ from 'lodash';
import i18n from '../../../../../../i18n';
import locale from 'utils/locale';
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
      if (nextOsType === OS_TYPE.LINUX) {
        setOsType(nextOsType!);
      }
      if (appName) {
        setExperimentObj(APPLICATION_TYPE.APPLICATION);
        // 修复：当资源类型是 K8S 时，不应该将 appType 设置为 k8sResourceType
        // 如果已有机器，根据机器的 deviceType 来设置；否则不设置（显示所有 K8S 场景）
        if (scopeType === SCOPE_TYPE.K8S) {
          if (!_.isEmpty(hosts) && hosts[0] && hosts[0].deviceType !== undefined) {
            const firstHost = hosts[0];
            if (firstHost.deviceType === 1) { // CONTAINER
              setK8sResourceType(1); // K8_RESOURCE_TYPE_CONTAINER
            } else if (firstHost.deviceType === 2) { // POD
              setK8sResourceType(3); // K8_RESOURCE_TYPE_POD
            } else {
              setK8sResourceType(NaN);
            }
          } else {
            setK8sResourceType(NaN); // 不设置，让后端显示所有 K8S 场景
          }
        } else {
          setK8sResourceType(appType);
        }
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

  /**
   * 更新 K8S 参数（故障场景添加时调用）
   * 参数在 initMiniFlow 返回时就已经在 node.arguments 中了，可以直接更新
   */
  function updateK8sParametersForNewFlow(flow: IFlow, hosts: IHost[]) {
    if (scopeType !== SCOPE_TYPE.K8S || experimentObj !== APPLICATION_TYPE.APPLICATION || _.isEmpty(hosts)) {
      return;
    }

    // 直接更新参数，因为 initMiniFlow 返回的 flow 中已经包含了 arguments
    const updatedFlow = updateK8sFlowParametersForFlow(flow, hosts) as IFlow;

    // 更新 flowGroup 中的 flow
    setFlowGroup((prevFlowGroup: IFlowGroup) => {
      const flows = _.get(prevFlowGroup, 'flows', []) as IFlow[];
      const flowIndex = flows.findIndex((f: IFlow) => f.id === flow.id);
      if (flowIndex >= 0) {
        const newFlows = [ ...flows ];
        newFlows[flowIndex] = updatedFlow;
        return {
          ...prevFlowGroup,
          flows: newFlows,
        };
      }
      return prevFlowGroup;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('故障场景添加时自动填充 K8S 参数:', { flowId: flow.id, hostsCount: hosts.length });
    }
  }

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
        <span><Translation>Drill object</Translation></span>
        <Balloon trigger={
          <span className={styles.appOrHosts}><Icon type="help" className={styles.appOrHostsIcon} /></span>
        } triggerType="click" className={styles.balloonStyle}>
          <div className={styles.wordContent}>
            <div><Translation>Application</Translation>:</div>
            <li><Translation>Select the target machine that needs to be drilled according to the application dimension. It is more convenient to choose the machine, and it will also help you to better measure the drill effect</Translation></li>
            <div><Translation>Non-application</Translation>:</div>
            <li><Translation>Select target machines according to different deployment modes, which are divided into two types: host and K8S cluster</Translation></li>
          </div>
        </Balloon>
      </div>}>
        {!appDisabled ? <RadioGroup
          value={experimentObj}
          onChange={handleApplicationChange as any}
        >
          <Radio id="application" value={APPLICATION_TYPE.APPLICATION}>
            <Translation>Application</Translation>
          </Radio>
          <Badge
            content={<span className={styles.badgeWord}><Translation>Recommend</Translation></span>}
            className={styles.badgeIcon}
            style={{ backgroundColor: '#f54743', color: '#fff' }}
          />
          <Radio id="host" value={APPLICATION_TYPE.HOSTS}>
            <Translation>Non-application</Translation>
          </Radio>
        </RadioGroup> : <span style={{ lineHeight: '32px' }}>{renderAppDisableChange()}</span>}
      </FormItem>
    );
  }

  function renderAppDisableChange() {
    if (experimentObj === 0) {
      return i18n.t('Application');
    } else if (experimentObj === 2) {
      return i18n.t('Non-application');
    }
    const appName = _.get(flowGroup, 'appName', '');
    if (appName || isApp) {
      return i18n.t('Application');
    }
    return i18n.t('Non-application');
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
    setExperimentObj(APPLICATION_TYPE.APPLICATION);
    setShowExperimentObj(true);
    setScopeSelectType(SELECT_TYPE.IPS);
    setTotal(0);
  }

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
      <FormItem label={i18n.t('Resource Type').toString()}>
        {!scopeDisabled ? <RadioGroup
          value={scopeType}
          onChange={handleScopeTypeChange as any}
        >
          <Radio id="hostname" value={SCOPE_TYPE.K8S}>
            <Translation>Kubernetes</Translation>
          </Radio>
          <Radio id="applications" value={SCOPE_TYPE.HOST}>
            <Translation>Host</Translation>
          </Radio>
        </RadioGroup> : <span style={{ lineHeight: '32px' }}>{renderScopeDisableChange()}</span>}
      </FormItem>
    );
  }

  // 经验库创建选择操作系统
  function renderOsType() {
    return (
      <FormItem label={i18n.t('Operating system').toString()}>
        <RadioGroup
          value={osType}
          onChange={handleOsTypeChange as any}
        >
          <Radio id="linux" value={OS_TYPE.LINUX}>
            linux
          </Radio>
        </RadioGroup>
      </FormItem>
    );
  }

  function renderScopeDisableChange() {
    const scopeType = _.get(flowGroup, 'scopeType', '');
    if (scopeType === SCOPE_TYPE.HOST) {
      return i18n.t('Host');
    }
    return i18n.t('Kubernetes');
  }

  function renderScope() {
    if (_.isEmpty(flowGroup)) {
      return null;
    }
    const { hosts } = flowGroup;
    return (
      <FormItem label={i18n.t('Machine list').toString()} required wrapperCol={{ span: 22 }}>
        <ScopeLists
          value={hosts}
          isApp={false}
          onChange={handleScopeChange}
          scopeType={scopeType}
          listTips={i18n.t('Machine list').toString()}
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

  /**
   * 更新单个 flow 的 K8S 演练场景参数
   */
  function updateK8sFlowParametersForFlow(flow: IFlow, hosts: IHost[]) {
    if (_.isEmpty(flow) || _.isEmpty(hosts)) {
      return flow;
    }

    // 收集所有机器的 deviceName，使用英文逗号分隔
    const deviceNames = hosts
      .filter((host: IHost) => host.deviceName)
      .map((host: IHost) => host.deviceName)
      .join(',');

    // 获取第一个机器的 kubNamespace（假设所有机器在同一个 namespace）
    const firstHost = hosts[0];
    const kubNamespace = firstHost?.kubNamespace || '';

    if (!deviceNames && !kubNamespace) {
      return flow;
    }

    const updatedFlow = _.cloneDeep(flow);
    const nodes = getNodes(updatedFlow);
    let hasUpdated = false;

    nodes.forEach((node: INode) => {
      // 优先使用 node.arguments（initMiniFlow 返回时参数在这里）
      // 如果没有，再使用 node.args（ActivityEditor 同步后的参数）
      const argsToUpdate = node.arguments || node.args;
      if (argsToUpdate && argsToUpdate.length > 0) {
        // 创建新的 args 数组，确保 React 能检测到变化
        const updatedArgs = argsToUpdate.map((arg: any) => {
          if (arg.argumentList && arg.argumentList.length > 0) {
            // 创建新的 argumentList 数组
            const updatedArgumentList = arg.argumentList.map((param: any) => {
              // 更新 names 参数
              if (param.alias === 'names' && deviceNames) {
                hasUpdated = true;
                if (process.env.NODE_ENV === 'development') {
                  console.log('更新 names 参数:', { alias: param.alias, oldValue: param.value, newValue: deviceNames });
                }
                return { ...param, value: deviceNames };
              }
              // 更新 namespace 参数
              if (param.alias === 'namespace' && kubNamespace) {
                hasUpdated = true;
                if (process.env.NODE_ENV === 'development') {
                  console.log('更新 namespace 参数:', { alias: param.alias, oldValue: param.value, newValue: kubNamespace });
                }
                return { ...param, value: kubNamespace };
              }
              return param;
            });
            return { ...arg, argumentList: updatedArgumentList };
          }
          return arg;
        });
        // 更新节点的 arguments 和 args（同时更新，确保兼容）
        if (node.arguments) {
          node.arguments = updatedArgs;
        }
        if (node.args) {
          node.args = updatedArgs;
        }
      }
    });

    // 调试：打印所有参数的 alias，帮助排查问题
    if (process.env.NODE_ENV === 'development' && !hasUpdated) {
      const allAliases: string[] = [];
      nodes.forEach((node: INode) => {
        // 优先检查 arguments（initMiniFlow 返回时参数在这里）
        const argsToCheck = node.arguments || node.args;
        if (argsToCheck && argsToCheck.length > 0) {
          argsToCheck.forEach((arg: any) => {
            if (arg.argumentList && arg.argumentList.length > 0) {
              arg.argumentList.forEach((param: any) => {
                allAliases.push(param.alias);
              });
            }
          });
        }
      });
      console.log('所有参数的 alias:', allAliases, '期望找到: names, namespace');
      // 打印节点信息，帮助排查
      nodes.forEach((node: INode) => {
        console.log('节点信息:', {
          nodeId: node.id,
          hasArgs: !!node.args,
          argsLength: node.args?.length || 0,
          hasArguments: !!node.arguments,
          argumentsLength: node.arguments?.length || 0,
        });
      });
    }

    if (hasUpdated && process.env.NODE_ENV === 'development') {
      console.log('K8S 参数自动填充:', { deviceNames, kubNamespace, flowId: flow.id });
    }

    return updatedFlow;
  }


  /**
   * 使用指定的 flowGroup 更新 K8S 演练场景参数
   */
  function updateK8sFlowParametersWithFlowGroup(targetFlowGroup: IFlowGroup, hosts: IHost[]) {
    // 只在资源类型是 K8S 且演练对象是应用的情况下执行
    if (scopeType !== SCOPE_TYPE.K8S || experimentObj !== APPLICATION_TYPE.APPLICATION) {
      return;
    }

    const flows = _.get(targetFlowGroup, 'flows', []) as IFlow[];
    if (_.isEmpty(flows)) {
      return;
    }

    // 如果没有选择机器，清空参数值
    if (_.isEmpty(hosts)) {
      const clearedFlows = flows.map((flow: IFlow) => {
        const updatedFlow = _.cloneDeep(flow);
        const nodes = getNodes(updatedFlow);
        nodes.forEach((node: INode) => {
          // 同时处理 node.args 和 node.arguments
          const argsToUpdate = node.args || node.arguments;
          if (argsToUpdate && argsToUpdate.length > 0) {
            // 创建新的 args 数组，确保 React 能检测到变化
            const updatedArgs = argsToUpdate.map((arg: any) => {
              if (arg.argumentList && arg.argumentList.length > 0) {
                // 创建新的 argumentList 数组
                const updatedArgumentList = arg.argumentList.map((param: any) => {
                  // 清空 names 和 namespace 参数
                  if (param.alias === 'names' || param.alias === 'namespace') {
                    return { ...param, value: '' };
                  }
                  return param;
                });
                return { ...arg, argumentList: updatedArgumentList };
              }
              return arg;
            });
            // 更新节点的 args 或 arguments（优先更新 args）
            if (node.args) {
              node.args = updatedArgs;
            }
            if (node.arguments) {
              node.arguments = updatedArgs;
            }
          }
        });
        return updatedFlow;
      });
      setFlowGroup({
        ...targetFlowGroup,
        flows: clearedFlows,
      });
      return;
    }

    // 更新所有 flows 中的参数
    const updatedFlows = flows.map((flow: IFlow) => {
      return updateK8sFlowParametersForFlow(flow, hosts);
    });

    // 更新 flowGroup - 使用展开运算符确保创建新对象
    const newFlowGroup = {
      ...targetFlowGroup,
      flows: [ ...updatedFlows ],
    };
    setFlowGroup(newFlowGroup);

    // 如果 ActivityEditor 正在显示某个节点，也需要更新它
    if (currentNode) {
      const updatedFlow = _.find(updatedFlows, (f: IFlow) => {
        const nodes = getNodes(f);
        return nodes.some((n: INode) => n.id === currentNode.id);
      });
      if (updatedFlow) {
        const nodes = getNodes(updatedFlow);
        const updatedNode = nodes.find((n: INode) => n.id === currentNode.id);
        if (updatedNode) {
          // 使用 handleNodeUpdate 来更新节点，确保 ActivityEditor 能检测到变化
          handleNodeUpdate(updatedNode);
        }
      }
    }
  }

  function handleScopeChange(value: IHost[]) {
    const newFlowGroup = {
      ...flowGroup,
      hosts: _.uniq(value),
    };
    setFlowGroup(newFlowGroup);

    if (!_.isEmpty(value)) {
      setValidateApp('success');
      // 修复：当资源类型是 K8S 且选择了机器后，根据机器的 deviceType 来设置 k8sResourceType
      // DeviceType: CONTAINER=1, POD=2
      // K8S 资源类型: CONTAINER=1, NODE=2, POD=3
      if (scopeType === SCOPE_TYPE.K8S) {
        const firstHost = value[0];
        if (firstHost && firstHost.deviceType !== undefined) {
          // 根据 deviceType 映射到 k8sResourceType
          // DeviceType.CONTAINER(1) -> K8_RESOURCE_TYPE_CONTAINER(1)
          // DeviceType.POD(2) -> K8_RESOURCE_TYPE_POD(3)
          // 如果没有匹配的，保持 NaN（显示所有 K8S 场景）
          if (firstHost.deviceType === 1) { // CONTAINER
            setK8sResourceType(1); // K8_RESOURCE_TYPE_CONTAINER
          } else if (firstHost.deviceType === 2) { // POD
            setK8sResourceType(3); // K8_RESOURCE_TYPE_POD
          } else {
            // 其他类型或未定义，不设置 k8sResourceType，显示所有 K8S 场景
            setK8sResourceType(NaN);
          }
        }
        // 更新 K8S 演练场景参数，机器选择变更时直接更新（此时参数应该已经加载了）
        if (scopeType === SCOPE_TYPE.K8S && experimentObj === APPLICATION_TYPE.APPLICATION) {
          // 直接更新所有 flow 的参数，因为此时参数应该已经加载了
          updateK8sFlowParametersWithFlowGroup(newFlowGroup, value);
        }
      }
    } else {
      setValidateApp('error');
      // 清空机器时，如果资源类型是 K8S，重置 k8sResourceType
      if (scopeType === SCOPE_TYPE.K8S) {
        setK8sResourceType(NaN);
        // 清空参数值
        if (experimentObj === APPLICATION_TYPE.APPLICATION) {
          updateK8sFlowParametersWithFlowGroup(newFlowGroup, []);
        }
      }
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
    let appId = _.get(flowGroup, 'appId', '');
    const nodeGroups = _.get(flowGroup, 'appGroups', []);

    // 确保appId是有效的，空字符串会导致后端无法识别
    if (!appId || appId === '') {
      appId = undefined as any;
    }

    if (appCode) {
      const source = experimentObj === APPLICATION_TYPE.APPLICATION ? 1 : 0;
      // 根据选择的小程序code，初始化微流程
      // 传递appId和nodeGroups以触发自动填充参数
      (async function() {
        await dispatch.experimentDataSource.initMiniFlow({
          appCode,
          source,
          appId: appId || undefined,
          nodeGroups: nodeGroups || [],
        }, (flow: IFlow) => {
          if (process.env.NODE_ENV === 'development') {
            // 由于接口对象层级较深，会修改到mock接口导出的结果
            // 避免问题这里先deepclone，仅限于线下开发
            flow = _.cloneDeep(flow);
          }

          flow = decorateFlow(flow) as IFlow;

          if (!_.isEmpty(flow)) {
            const flows = _.get(flowGroup, 'flows', []) as IFlow[];
            flows.push(flow);
            const newFlowGroup = {
              ...flowGroup,
              flows: [ ...flows ] as IFlow[],
              scopeType,
            };
            setFlowGroup(newFlowGroup);

            // 如果是 K8S 资源类型且演练对象是应用，自动填充参数
            // 参数在 initMiniFlow 返回时就已经在 node.arguments 中了，可以直接更新
            const currentHosts = _.get(newFlowGroup, 'hosts', []) as IHost[];
            if (scopeType === SCOPE_TYPE.K8S && experimentObj === APPLICATION_TYPE.APPLICATION && !_.isEmpty(currentHosts)) {
              // 使用 setTimeout 确保 flow 已经添加到 flowGroup 后再更新
              setTimeout(() => {
                updateK8sParametersForNewFlow(flow, currentHosts);
              }, 0);
            }
          }
        });
      })();
    }
  }

  /**
   * 刷新已有演练场景的参数，根据当前应用和机器分组自动填充参数
   */
  function refreshExistingFlowParameters(currentFlowGroup?: IFlowGroup) {
    const targetFlowGroup = currentFlowGroup || flowGroup;
    const flows = _.get(targetFlowGroup, 'flows', []) as IFlow[];
    if (_.isEmpty(flows)) {
      return;
    }

    const appId = _.get(targetFlowGroup, 'appId', '');
    const nodeGroups = _.get(targetFlowGroup, 'appGroups', []);
    const source = experimentObj === APPLICATION_TYPE.APPLICATION ? 1 : 0;

    // 确保appId是有效的，空字符串会导致后端无法识别
    if (!appId || appId === '') {
      return;
    }

    // 遍历所有已有的flows，刷新每个flow的参数
    const refreshPromises = flows.map((existingFlow: IFlow) => {
      return new Promise<IFlow>(resolve => {
        const nodes = getNodes(existingFlow);
        if (_.isEmpty(nodes)) {
          resolve(existingFlow);
          return;
        }

        // 获取第一个节点的appCode（同一个flow中所有节点应该有相同的appCode）
        const firstNode = nodes[0];
        const appCode = _.get(firstNode, 'code', '') || _.get(firstNode, 'app_code', '');

        if (!appCode) {
          resolve(existingFlow);
          return;
        }

        // 重新初始化flow以获取更新后的参数
        // 传递appId和nodeGroups以触发自动填充参数
        dispatch.experimentDataSource.initMiniFlow({
          appCode,
          source,
          appId: appId || undefined,
          nodeGroups: nodeGroups || [],
        }, (newFlow: IFlow) => {
          if (process.env.NODE_ENV === 'development') {
            newFlow = _.cloneDeep(newFlow);
          }

          newFlow = decorateFlow(newFlow) as IFlow;

          if (_.isEmpty(newFlow)) {
            resolve(existingFlow);
            return;
          }

          // 合并新flow的参数到现有flow，保留用户已填写的值
          const existingNodesMap = new Map<string, INode>();
          nodes.forEach((node: INode) => {
            if (node.id) {
              existingNodesMap.set(node.id, node);
            }
          });

          // 创建更新后的flow
          const updatedFlow = _.cloneDeep(existingFlow);

          // 更新每个stage的节点参数
          [ 'prepare', 'attack', 'check', 'recover' ].forEach((stage: string) => {
            if (newFlow[stage]) {
              const newStageNodes = newFlow[stage] as INode[];
              const existingStageNodes = (updatedFlow[stage] as INode[]) || [];

              // 更新每个节点的参数
              newStageNodes.forEach((newNode: INode) => {
                const existingNode = existingNodesMap.get(newNode.id || '');
                if (existingNode && existingNode.args && newNode.args) {
                  // 合并参数：保留用户已填写的值，使用新参数的默认值
                  const mergedArgs = newNode.args.map((newArg: any, argIndex: number) => {
                    const existingArg = existingNode.args[argIndex];
                    const existingArgAny = existingArg as any;
                    const newArgAny = newArg as any;
                    if (existingArg && existingArgAny.argumentList && newArgAny.argumentList) {
                      const mergedArgumentList = newArgAny.argumentList.map((newParam: any, paramIndex: number) => {
                        const existingParam = existingArgAny.argumentList[paramIndex];
                        if (existingParam && existingParam.value !== undefined && existingParam.value !== '') {
                          // 保留用户已填写的值
                          return {
                            ...newParam,
                            value: existingParam.value,
                          };
                        }
                        return newParam;
                      });
                      return {
                        ...newArg,
                        argumentList: mergedArgumentList,
                      };
                    }
                    return newArg;
                  });

                  // 更新现有节点的参数
                  const nodeIndex = existingStageNodes.findIndex((n: INode) => n.id === newNode.id);
                  if (nodeIndex >= 0) {
                    existingStageNodes[nodeIndex] = {
                      ...existingStageNodes[nodeIndex],
                      args: mergedArgs,
                    };
                  }
                }
              });

              updatedFlow[stage] = existingStageNodes;
            }
          });

          resolve(updatedFlow);
        });
      });
    });

    // 等待所有异步操作完成
    Promise.all(refreshPromises).then((updatedFlows: IFlow[]) => {
      setFlowGroup(prevFlowGroup => ({
        ...prevFlowGroup,
        flows: updatedFlows,
      }));
    }).catch(error => {
      console.error('刷新演练场景参数失败:', error);
    });
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
          title: i18n.t('Hint').toString(),
          content: i18n.t('You have switched the exercise application of different operating systems, the exercise machine and the exercise content will be cleared').toString(),
          onOk: () => handleSetChangApp(value, actionType, item, true),
          locale: locale().Dialog,
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
        const newFlowGroup = {
          ...flowGroup,
          appName: item && item.label,
          appId: value,
          appGroups: [],
          hosts: [],
          appType: item && item.appType,
          flows: update ? [] : flowGroup.flows,
          scopeType: item && item.scopesType,
          osType: item && item.osType,
        };
        setFlowGroup(newFlowGroup);
        // 如果已有演练场景且未清空，刷新参数
        if (!update && !_.isEmpty(flowGroup.flows)) {
          // 直接传递新的flowGroup，避免state异步更新问题
          setTimeout(() => {
            refreshExistingFlowParameters(newFlowGroup);
          }, 0);
        }
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
    // 修复：当资源类型是 K8S 时，不应该将 appType 设置为 k8sResourceType
    // appType 是应用类型（HOST=0, CLUSTER=1），不是 K8S 资源类型（CONTAINER=1, NODE=2, POD=3）
    // 如果资源类型是 K8S，不设置 k8sResourceType，让后端根据场景的 function_code 来过滤所有 K8S 场景
    // 或者根据选择的机器来确定 k8sResourceType（在 handleScopeChange 中处理）
    if (item && item.scopesType === SCOPE_TYPE.K8S) {
      setK8sResourceType(NaN); // 不设置，让后端显示所有 K8S 场景
    } else {
      setK8sResourceType(item && item.appType);
    }
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
      const newFlowGroup = {
        ...flowGroup,
        appGroups: value,
        hosts: _.isEmpty(value) ? [] : hosts,
      };
      setFlowGroup(newFlowGroup);
      // 如果已有演练场景，刷新参数
      if (!_.isEmpty(flowGroup.flows)) {
        // 直接传递新的flowGroup，避免state异步更新问题
        setTimeout(() => {
          refreshExistingFlowParameters(newFlowGroup);
        }, 0);
      }
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
      Message.error(i18n.t('Please fill in the exercise name'));
      return;
    }
    flowGroup.groupName = groupName;

    // 机器列表必填校验
    if (!isExpertise) {
      if (scopeSelectType === SELECT_TYPE.IPS) {
        if (_.isEmpty(flowGroup.hosts)) {
          setValidateApp('error');
          Message.error(i18n.t('Please select a machine list').toString());
          return;
        }
      } else {
        if (flowGroup && flowGroup.appName && !flowGroup.hostPercent) {
          setValidateApp('error');
          Message.error(i18n.t('Please select a machine percentage'));
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
      Message.error(i18n.t('Please add a walkthrough').toString());
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
      Message.error(`"${errorNode.activityName}"${i18n.t('The node parameter configuration is incorrect')}`);
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
            Message.error(i18n.t('The drill group parameter configuration is incorrect, please modify it'));
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
        return <div className={styles.flowAction}><span style={{ color: '#888' }}><Translation>Please select the walkthrough application and add the walkthrough content</Translation></span></div>;
      }
    }

    if (!flows.length) {
      return <div className={styles.flowAction}><span className={styles.addFlow} onClick={handleAddFunction} ><Translation>Add walkthrough</Translation></span></div>;
    }
    return <div className={styles.flowAction}><div className={styles.hasFlow}>现有{flows.length}个</div><span className={styles.addFlow} onClick={handleAddFunction}><Translation>Keep adding</Translation></span></div>;
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
      <FormItem label={i18n.t('Group Name').toString()} required>
        <Input
          {...init('groupName', {
            initValue: groupName,
            rules: [{ required: true, message: i18n.t('Can not be empty') }],
          })}
          className={styles.itemWidth}
          placeholder={i18n.t('Please input').toString()}
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
      <FormItem label={i18n.t('Drill content').toString()} required >
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
      title={i18n.t('Choose a walkthrough failure').toString()}
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
        <Button type="primary" onClick={handleSubmit} className={styles.submit} data-autolog={`text=${i18n.t('Save walkthrough groups')}`}><Translation>Save</Translation></Button>
        <Button type="normal" onClick={handleCancel} disabled={props.onDisableCancel}><Translation>cancel</Translation></Button>
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
