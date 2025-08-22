import ActivityParameterEditor from 'pages/Chaos/Experiment/common/ActivityParameter/ActivityParameterEditor';
import ActivityRecoverEditor from 'pages/Chaos/Experiment/common/ActivityParameter/ActivityRecoverEditor';
import React, { useCallback, useEffect, useState } from 'react';
import SlidePanel from '@alicloud/console-components-slide-panel';
import SlidePanelClose from 'config/constants/Chaos/SlidePanelClose';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../../../i18n';
import styles from './index.css';
import { Button, Icon, Input, Loading, NumberPicker, Switch } from '@alicloud/console-components';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IArgs, IComponent, IField, IHost, ILinkage, INode, IParamter, ITolerance } from 'config/interfaces/Chaos/experiment';
import { NODE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { compile } from 'expression-eval';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';

const PARAMETER_TYPES = {
  [ FunctionParameterConstants.PARAMETER_TYPE_ACTION ]: 'action',
  [ FunctionParameterConstants.PARAMETER_TYPE_MATCHER ]: 'matcher',
  [ FunctionParameterConstants.PARAMETER_TYPE_USER ]: 'user_args',
};

interface ActivityEditorProps {
  data: INode;
  hosts?: IHost[];
  visible: boolean;
  isExpertise: boolean;
  onClose: () => void;
  updateNode?: (node: INode) => void;
  disabled?: boolean;
  onCheckNode?: (value: INode) => void;
  readOnly?: boolean;
}

interface IValues {
  state: boolean;
  type: string | number;
  alias: string;
  value: string | number | boolean;
  component?: IComponent;
}

export default function ActivityEditor(props: ActivityEditorProps): JSX.Element {

  const dispatch = useDispatch();
  const loading = useSelector(({ functionParameters }) => functionParameters.loading);
  const functionParameters = useSelector(({ experimentScene }) => experimentScene.functionParameters);
  const guardRules = useSelector(({ experimentScene }) => experimentScene.guardRules);

  const [ currentId, setCurrentId ] = useState('');
  const [ showParameters, setShowParameters ] = useState(false); // 是否展示参数
  // const [ displayParameters, setDisplayParameters ] = useState(true); // 参数Icon展示（上or下）

  const [ openLevels, setOpenLevels ] = useState<any>({});
  const otherConfName = i18n.t('Process configuration');
  useEffect(() => {
    handleSyncData();
    initExpands(props.data.arguments, { [otherConfName]: false });
  }, []);
  useEffect(() => {
    if (props.data?.args?.length === 0) {
      return;
    }
    initExpands(props.data?.args, {});
  }, [ props.data?.args?.length ]);

  const initExpands = (datas: any, openLevels: any) => {
    datas?.map((item: any) => {
      const { gradeName, open = true } = item;
      openLevels[gradeName] = open;
    });
    setOpenLevels(openLevels);
  };

  useEffect(() => {
    return () => {
      SlidePanelClose.removeBodyClick();
    };
  }, [ props.visible ]);

  useEffect(() => {
    const { data } = props;
    if (!_.isEmpty(data)) {
      const { nodeType, functionId } = data;
      setCurrentId(functionId!);
      let exist;
      if (nodeType === NODE_TYPE.OBSERVER || nodeType === NODE_TYPE.NORMAL) {
        exist = _.find(functionParameters, (functionParameter: IParamter) => functionParameter.functionId === functionId);
        if (!_.isEmpty(data) && !_.isEmpty(data.arguments)) {
          setShowParameters(true);
        } else {
          if (!_.isEmpty(exist) && !_.isEmpty(exist.parameters)) {
            setShowParameters(true);
          } else {
            setShowParameters(false);
          }
        }
      } else if (nodeType === NODE_TYPE.RECOVER) {
        exist = _.find(guardRules, (guardRule: INode) => guardRule.functionId === functionId);
        if (!_.isEmpty(data) && !_.isEmpty(data.arguments)) {
          setShowParameters(true);
        } else {
          if (!_.isEmpty(exist) && !_.isEmpty(exist.rules.parameters)) {
            setShowParameters(true);
          } else {
            setShowParameters(false);
          }
        }
      } else {
        if (!_.isEmpty(data.arguments)) {
          setShowParameters(true);
        } else {
          setShowParameters(false);
        }
      }
    }
  });

  useEffect(() => {
    handleSyncData();
  });

  function handleSyncData() {
    const { data } = props;
    if (!_.isEmpty(data)) {
      const { nodeType, functionId } = data;
      let exist;
      // 初始化节点与观察节点参数逻辑一致
      if (nodeType === NODE_TYPE.OBSERVER || nodeType === NODE_TYPE.NORMAL) {
        exist = _.find(functionParameters, (functionParameter: IParamter) => functionParameter.functionId === functionId);
        if (!exist) {
          // 初始化节点arguments可能为空且无functionId，这时不再请求参数
          // 如果没有请求过该小程序的参数列表，则发起查询请求
          if (!_.isEmpty(data.arguments) || !_.isEmpty(functionParameters)) {
            handleMergeArgs(data, data.arguments);
          }
        } else if (!_.isEmpty(exist.parameters)) {
          // 如果已经请求过，则同步一下args
          handleMergeArgs(data, exist.parameters);
        }
      } else if (nodeType === NODE_TYPE.RECOVER) {
        exist = _.find(guardRules, (guardRule: INode) => guardRule.functionId === functionId);
        if (!exist) {
          if (_.isEmpty(data.arguments) && functionId && _.isEmpty(guardRules)) {
            // getGuardSceneRules(functionId);
          } else {
            // 编辑态，直接merge服务端返回的arguments
            handleMergeArgs(data, data.arguments);
          }
          // if (!_.isEmpty(data.arguments) || !_.isEmpty(guardRules)) {
          //   // 编辑态，直接merge服务端返回的arguments
          //   handleMergeArgs(data, data.arguments);
          // }
        } else {
          const parameters = _.get(exist.rules, 'parameters', []);
          const fields = _.get(exist.rules, 'fields', []);
          const tolerance = _.get(exist.rules, 'tolerance', []);
          // 有可能有参数
          if (!_.isEmpty(parameters)) {
            handleMergeArgs(data, parameters);
          }
          if (!_.isEmpty(fields)) {
            handleMergeFields(data, fields);
          }
          if (!_.isEmpty(tolerance)) {
            handleMergeTolerance(data, tolerance);
          }
        }
      }
    }
  }

  function handleMergeArgs(node: INode, parameters: IParamter[] | IArgs[]) {
    const { isExpertise } = props;
    // 如果参数为空或者参数长度一致，则说明参数已经同步
    if (_.isEmpty(parameters) || node.args && node.args.length === parameters.length) {
      return;
    }

    const { nodeType, args } = node;
    const newArgs: any[] = [];
    if (!_.isEmpty(parameters)) {
      // 这里保证参数的顺序
      _.forEach(parameters, (parameter: any, index: number) => {
        const { argumentList, gradeName } = parameter;
        if (!_.find(args, (arg: any) => arg.gradeName === gradeName)) {
          newArgs.push({ gradeName, argumentList: [] });
        }
        _.forEach(argumentList, (parameter: IArgs) => {
          const { parameterId } = parameter;
          let exist = false;
          node.args?.forEach((item: any) => {
            item.argumentList?.map((temp: IArgs) => {
              if (temp.parameterId === parameterId) {
                exist = true;
              }
            });
          });
          if (!exist) {
            // parameterId, alias, value
            const { name, alias, type, component } = parameter;
            const { required, linkage } = _.defaultTo(component, {}) as IComponent;
            const _type = PARAMETER_TYPES[ _.defaultTo(type, 2) as any ] || 'user_args';
            newArgs[index].argumentList.push({
              parameterId,
              type: _type,
              state: getParameterState(parameters as IParamter[], node.args, linkage),
              name,
              required,
              alias,
              value: getDefaultValueFromComponent(component),
              component,
            });
          } else {
            newArgs[index].argumentList.push(exist);
          }
        });
      });
      // _.forEach(parameters, (parameter: IArgs) => {
      //   const { parameterId } = parameter;
      //   // 如果在node.args里已有，则用已有的
      //   let exist = false;
      //   node.args?.forEach((item: any) => {
      //     item.argumentList?.map((temp: IArgs) => {
      //       if (temp.parameterId === parameterId) {
      //         exist = true;
      //       }
      //     })
      //   })
      //   if (!exist) {
      //     // parameterId, alias, value
      //     const { name, alias, type, component } = parameter;
      //     const { required, linkage } = _.defaultTo(component, {}) as IComponent;
      //     const _type = PARAMETER_TYPES[ _.defaultTo(type, 2) as any ] || 'user_args';
      //     newArgs.push({
      //       parameterId,
      //       type: _type,
      //       state: getParameterState(parameters as IParamter[], node.args, linkage),
      //       name,
      //       required,
      //       alias,
      //       value: getDefaultValueFromComponent(component),
      //       component,
      //     });
      //   } else {
      //     newArgs.push(exist);
      //   }
      // });
      if (nodeType === NODE_TYPE.OBSERVER || nodeType === NODE_TYPE.RECOVER) {
        // 如果是配置经验，则放到经验的reducer里
        if (isExpertise) {
          dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, args: newArgs });
        } else {
          dispatch.experimentEditor.setAddOrUpdateGuardNode({
            ...node,
            args: newArgs,
          });
        }
      } else if (nodeType === NODE_TYPE.NORMAL) {
        const { updateNode } = props;
        updateNode && updateNode({
          ...node,
          args: newArgs,
        });
      }
    }
  }

  function handleMergeFields(node: INode, displayFields: IField[]) {
    // displayFields 规则数据源
    const { isExpertise } = props;

    // displayFields 不为空说明新增时就算没有设置至少有一条默认值为空的数据，以此来判断该节点是编辑节点or新增节点
    if (!_.isEmpty(displayFields) && _.isEmpty(node.displayFields)) {
      // 如果是配置经验，则放到经验的reducer里
      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, displayFields });
      } else {
        dispatch.experimentEditor.setAddOrUpdateGuardNode({ ...node, displayFields });
      }
    }

    if (!_.isEmpty(node.fields) || _.isEmpty(displayFields)) {
      return;
    }
    // 第一次先设置第1条displayField
    const firstDisplayField = displayFields[0];
    const firstDefaultField: IField = {
      ...firstDisplayField,
      and: true,
      operation: {},
      value: getDefaultValueFromComponent(firstDisplayField.component) as any, // 获取控件的默认值
    };

    // 是否配置经验
    if (isExpertise) {
      dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({
        ...node,
        fields: [ firstDefaultField ],
        displayFields,
      });
    } else {
      dispatch.experimentEditor.setAddOrUpdateGuardNode({
        ...node,
        fields: [ firstDefaultField ],
        displayFields,
      });
    }
  }

  function handleMergeTolerance(node: INode, displayTolerance: ITolerance[]) {
    // 设置过就不要重复设置了，这是接口返回的只读数据
    const { isExpertise } = props;
    // 同fields
    // if (!_.isEmpty(displayTolerance) && _.isEmpty(node.tolerance)) {
    //   if (isExpertise) {
    //     dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, displayTolerance });
    //   } else {
    //     dispatch.experimentEditor.setAddOrUpdateGuardNode({
    //       ...node,
    //       displayTolerance,
    //     });
    //   }
    // }
    if (!_.isEmpty(node.tolerance) || _.isEmpty(displayTolerance)) {
      return;
    }
    // tolerance的默认value为空
    const tolerance = _.map(displayTolerance, (tolerance: ITolerance) => {
      return {
        ...tolerance,
        value: getDefaultValueFromComponent(tolerance.component), // 获取控件默认值
      };
    });
    if (isExpertise) {
      dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({
        ...node,
        tolerance,
        displayTolerance,
      });
    } else {
      dispatch.experimentEditor.setAddOrUpdateGuardNode({
        ...node,
        tolerance,
        displayTolerance,
      });
    }
  }

  function getDefaultValueFromComponent(component: IComponent) {
    const { defaultValue } = _.defaultTo(component, {}) as IComponent;
    return _.defaultTo(defaultValue, '');
  }

  const handleNodeNameChange = (node: INode, val: string) => {
    const { isExpertise } = props;
    const { nodeType } = node;
    if (nodeType === NODE_TYPE.OBSERVER || nodeType === NODE_TYPE.RECOVER) {
      // 修改全局节点名称
      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({
          ...node,
          name: val,
        });
      } else {
        dispatch.experimentEditor.setAddOrUpdateGuardNode({
          ...node,
          name: val,
        });
      }
      return;
    }

    const { updateNode } = props;
    updateNode && updateNode({
      ...node,
      activityName: val,
      name: val,
    });
  };

  const getHeader = useCallback(node => {
    if (_.isEmpty(node)) {
      return '';
    }
    const { disabled } = props;
    const { activityName, name } = node;
    if (disabled) {
      return activityName || name;
    }

    return (
      <Input
        value={activityName || name}
        maxLength={50}
        onChange={val => handleNodeNameChange(node, val)}
      />
    );
  }, [ props.data ]);

  function handleGetFunctionParameters(parameters: IArgs[], functionId: string) {
    const sceneFunction = _.find(parameters, (parameter: IArgs) => parameter.functionId === functionId);
    if (!_.isEmpty(sceneFunction)) {
      const { parameters: functionParameters } = sceneFunction as any;
      if (functionParameters) {
        return functionParameters;
      }
      return parameters;
    }
    return [];
  }

  function getParameters() {
    const { data } = props;
    if (data) {
      if (data.nodeType === NODE_TYPE.OBSERVER || data.nodeType === NODE_TYPE.NORMAL) {
        if (!_.isEmpty(data.arguments) && currentId) {
          // 编辑态手动添加节点有currentId则需getFunctionParameters处理data.arguments
          // 全局观察节点有currentId
          return handleGetFunctionParameters(data.arguments, currentId);
        }
        if (!_.isEmpty(data.arguments) && !currentId) {
          // 初始化节点无functionId直接返回arguments
          // 全局观察节点编辑态无functionId
          return data.arguments;
        }
        // 手动添加节点及全局观察节点有currentId无arguments则需handleGetFunctionParameters处理functionParameters
        return handleGetFunctionParameters(functionParameters, currentId);
      } else if (data.nodeType === NODE_TYPE.RECOVER) {
        if (!_.isEmpty(data.arguments) && currentId) {
          // return ActivityEditor.getGuardParameters(data.arguments, currentId);
        }
        if (!_.isEmpty(data.arguments) && !currentId) {
          return data.arguments;
        }
        // return ActivityEditor.getGuardParameters(guardRules, currentId);
      }
    }
    return [];
  }

  function handleParameterChange(parameterId: string, type: any, alias: string, value: string | number | boolean, component?: IComponent) {
    const _type = PARAMETER_TYPES[ type ] || 'user_args';
    updateParameter(parameterId, { state: true, type: _type, alias, value, component });
  }

  function updateParameter(parameterId: string, values: IValues) {
    const { data: node, isExpertise } = props as any;
    // 更新args
    let { args } = node;
    const argument = { parameterId, ...values };
    if (_.isEmpty(args)) {
      args = _.concat([], argument);
    } else {
      args.forEach((item: any) => {
        item.argumentList.forEach((temp: any, index: number) => {
          if (temp.parameterId === parameterId) {
            item.argumentList[index] = { ...temp, ...argument };
          }
        });
      });
    }
    const { nodeType } = node;
    // 更新节点
    if (nodeType === NODE_TYPE.OBSERVER || nodeType === NODE_TYPE.RECOVER) {
      const { onCheckNode } = props;
      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, args });
        onCheckNode && onCheckNode({ ...node, args });
      } else {
        dispatch.experimentEditor.setAddOrUpdateGuardNode({ ...node, args });
        onCheckNode && onCheckNode({ ...node, args });
      }
    } else if (nodeType === NODE_TYPE.NORMAL) {
      const { updateNode } = props;
      updateNode && updateNode({
        ...node,
        args,
      });
    }
  }

  function getParameterState(parameters: IParamter[], args: IArgs[], linkage: ILinkage) {
    const { depends, condition, defaultState } = _.defaultTo(linkage, {}) as ILinkage;
    if (_.isNull(defaultState) || _.isUndefined(defaultState) || defaultState === true) {
      return true;
    }
    if (_.isEmpty(depends) || _.isEmpty(condition)) {
      if (_.isBoolean(defaultState)) {
        return defaultState;
      }
      return true;
    }

    const dependParameter = _.find(parameters, (parameter: IParamter) => parameter.parameterId === depends);
    if (!_.isEmpty(dependParameter)) {
      const { alias } = dependParameter as IArgs;
      let matchedArg: any = null;
      args.forEach((item: any) => {
        item.argumentList.forEach((temp: IArgs) => {
          if (temp.alias === alias) {
            matchedArg = temp;
          }
        });
      });
      // const matchedArg = _.find(args, (arg: IArgs) => arg.alias === alias);
      if (!_.isEmpty(condition) && !_.isEmpty(matchedArg)) {
        const fn = compile(condition);
        return fn({ [alias]: matchedArg!.value });
      }
    } else {
      if (_.isBoolean(defaultState)) {
        return defaultState;
      }
      return true;
    }
    return false;
  }

  // 流程及观察节点参数部分渲染
  function renderParameter(parameter: IParamter, args: any, scopes: IHost[], levelIndex: number) {
    const { data: node, hosts, isExpertise } = props;
    // 获取参数组
    const parameters = getParameters();
    const { component } = parameter;
    const opLevelSwitch = component && component.opLevel;
    const { linkage } = _.defaultTo(component, {}) as IComponent;
    if (_.isEmpty(parameter)) {
      return '';
    }
    // defaultState问题，任何渲染参数场景都会走这里，因此将数据处理放在这里
    const cloneParameter = { ...parameter };
    const argumentList = args[levelIndex]?.argumentList || [];
    const param = _.find(argumentList, ({ parameterId }: IParamter) => parameter.parameterId === parameterId) as IParamter;
    if (param) {
      // linkage.defaultState
      // @see handleMergeArgs
      cloneParameter.state = getParameterState(parameters, args, linkage);
      cloneParameter.value = param.value ?? '';
      cloneParameter.errorMessage = param.errorMessage;
    }

    return (
      <ActivityParameterEditor
        key={`function-parameter-${parameter.parameterId}`}
        disabled={props.disabled!}
        parameter={cloneParameter}
        argumentsList={args}
        scopes={!_.isEmpty(scopes) ? scopes : hosts}
        code={node.app_code! || node.code!}
        onChange={handleParameterChange}
        isSwitch={isExpertise}
        opLevel={opLevelSwitch === 0} // 是否可操作
      />
    );
  }

  // 恢复策略参数渲染
  function renderRecover() {
    const { isExpertise, data: node, disabled, onCheckNode } = props;
    if (!_.isEmpty(node)) {
      const { nodeType } = node;
      if (nodeType === NODE_TYPE.RECOVER) {
        return (
          <div>
            <div className={styles.ruleTitle}><Translation>Rules</Translation></div>
            <ActivityRecoverEditor
              disabled={disabled as boolean}
              isExpertise={isExpertise}
              data={node}
              onChange={onCheckNode as () => void}
            />
          </div>
        );
      }
    }
    return null;
  }

  function handleUpdateNode(name: string, value: any) {
    const { data: node }: any = props;
    if (!_.isEmpty(node)) {
      node[name] = value;

      const { updateNode } = props;
      updateNode && updateNode({ ...node });
    }
  }

  const { data: node } = props;
  const parameters = getParameters();
  let pauseBefore = 0;
  let pauseAfter = 0;
  if (!_.isEmpty(node) && !_.isEmpty(node.pauses)) {
    const { before, after }: any = node.pauses;
    pauseBefore = before;
    pauseAfter = after;
  }

  function onChangeCloseLevel(gradeName: string) {
    setOpenLevels({ ...openLevels, [gradeName]: !openLevels[gradeName] });
  }

  // 参数分层
  const renderParams = () => {
    const paramsLevel = _.orderBy(parameters, [ 'order' ], [ 'asc' ]);
    return paramsLevel.map((item: any, index: number) => {
      const { gradeName, argumentList } = item;
      const isOpen = openLevels[gradeName];
      // 判断是否有显示的的参数配置
      const hasShow = argumentList.find((item: any) => !item.component.linkage || item.component.linkage.defaultState === true);
      if (!hasShow) return null;
      return (
        <div key={index}>
          <div className={styles.parameterHeader} onClick={() => onChangeCloseLevel(gradeName)}>
            <span className={styles.headerTitle}>{gradeName}</span>
            <Icon size="xs" type={isOpen ? 'arrow-down' : 'arrow-up'} />
          </div>
          {isOpen && argumentList.map((temp: any) => {
            const scopes = node?.scope || [];
            const args = node?.args || [];
            return renderParameter(temp, args, scopes!, index);
          })}
        </div>
      );
    });
  };

  return <div id='SlidePanel' className={styles.SlidePanelContent}>
    <SlidePanel
      title={getHeader(node)}
      isShowing={props.visible}
      hasMask={false}
      width={460}
      onClose={props.onClose}
      container={'SlidePanel'}
      customFooter={<Button onClick={props.onClose}><Translation>close</Translation></Button>}
    >
      { loading &&
        <div className={styles.loading}>
          <Loading />
        </div> ||
        <div>
          <div className={styles.container}>
            {showParameters && renderParams()}
            {renderRecover()}
          </div>
          {
            /* 流程节点需要有通用配置 */
            node && node.nodeType === NODE_TYPE.NORMAL && (
              <div className={styles.container}>
                <div className={styles.generalConfigHeader} onClick={() => onChangeCloseLevel(otherConfName)}>
                  <span className={styles.headerTitle}>{otherConfName}</span>
                  <Icon size="xs" type={openLevels[otherConfName] ? 'arrow-down' : 'arrow-up'} />
                </div>
                {
                  openLevels[otherConfName] && (
                    <>
                      <p className={styles.description}><Translation>The current node will wait for the specified time before running</Translation></p>
                      <div className={styles.configFieldContainer}>
                        <div className={styles.configFieldLabel}><Translation>Wait before execution (MS)</Translation></div>
                        <NumberPicker
                          disabled={props.disabled}
                          value={pauseBefore}
                          min={0}
                          step={100}
                          onChange={value => handleUpdateNode('pauses', { before: value, after: pauseAfter })}
                        />
                      </div>
                      <p className={styles.description}><Translation>Wait for the specified time after the current node is running. If it is in the process of ending the drill, it will not take effect</Translation></p>
                      <div className={styles.configFieldContainer}>
                        <div className={styles.configFieldLabel}><Translation>Wait after execution (MS)</Translation></div>
                        <NumberPicker
                          disabled={props.disabled}
                          value={pauseAfter}
                          min={0}
                          step={100}
                          onChange={value => handleUpdateNode('pauses', { before: pauseBefore, after: value })}
                        />
                      </div>
                      <p className={styles.description}><Translation>Whether to proceed to the next node after the current node runs (whether successful or failed)</Translation></p>
                      <div className={styles.configFieldContainer}>
                        <div className={styles.configFieldLabel}><Translation>Whether to promote the drill manually</Translation></div>
                        <Switch
                          disabled={props.disabled}
                          checked={node.user_check}
                          onChange={checked => handleUpdateNode('user_check', checked)}
                          checkedChildren={<span><Translation>yes</Translation></span>}
                          unCheckedChildren={<span><Translation>no</Translation></span>}
                        />
                      </div>
                      <p className={styles.description}><Translation>Failure tolerance: when the failure ratio of the following machines or subtasks exceeds the specified value, the current node will be recognized as failure, and the value is [0-100]</Translation></p>
                      <div className={styles.configFieldContainer}>
                        <div className={styles.configFieldLabel}><Translation>Failure tolerance</Translation></div>
                        <NumberPicker
                          disabled={props.disabled}
                          value={node.failedTolerance}
                          min={0}
                          step={100}
                          onChange={value => handleUpdateNode('failedTolerance', value)}
                        />
                      </div>
                      <p className={styles.description}><Translation>Whether to terminate the drill immediately after the current node fails will only take effect if it is not pushed manually</Translation></p>
                      <div className={styles.configFieldContainer}>
                        <div className={styles.configFieldLabel}><Translation>Do you want to terminate the drill now</Translation></div>
                        <Switch
                          disabled={props.disabled}
                          checked={node.interruptedIfFailed}
                          onChange={checked => handleUpdateNode('interruptedIfFailed', checked)}
                          checkedChildren={<span><Translation>yes</Translation></span>}
                          unCheckedChildren={<span><Translation>no</Translation></span>}
                        />
                      </div>
                    </>
                  )
                }
              </div>
            )
          }
          {
            /* 只读模式下，流程节点需要展示演练对象 */
            node && node.nodeType === NODE_TYPE.NORMAL && props.readOnly && (
              <>
                <div className={styles.divider} />
                <div className={styles.container}>
                  <div className={styles.experimentTargetHeader}>
                    <span className={styles.headerTitle}><Translation>Drill Object</Translation></span>
                  </div>
                  <ul>
                    {
                      _.map(node.scope, ({ k8s, ip, clusterName, deviceName, app, appId, nodeGroup }: any) => {
                        if (appId) {
                          return <li className={styles.experimentTargetItem}><span>
                            {`${ip}(${deviceName})`}
                            { [ i18n.t('application') + ':' + app ] }
                            { [ i18n.t('Group') + ':' + nodeGroup ]}
                          </span></li>;
                        }
                        if (k8s) {
                          return (
                            <li className={styles.experimentTargetItem}><span>{clusterName}</span></li>
                          );
                        }
                        return (
                          <li className={styles.experimentTargetItem}><span>
                            {`${ip}(${deviceName})`}
                          </span></li>
                        );

                      })
                    }
                  </ul>
                </div>
              </>
            )
          }
        </div>
      }
    </SlidePanel>
  </div>;
}
