import ActivityEditor from 'pages/Chaos/Experiment/common/ActivityEditor';
import AddFunction from 'pages/Chaos/Experiment/common/AddFunction';
import CronExpressionGenerator from 'pages/Chaos/common/CronExpressionGenerator';
import MiniFlowView from 'pages/Chaos/common/MInFlowView';
import Node from 'pages/Chaos/common/Node';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import convertFilter from 'pages/Chaos/lib/ConvertFilter';
import styles from './index.css';
import { Balloon, Button, Dialog, Form, Icon, Message, NumberPicker, Radio, Select, Table } from '@alicloud/console-components';
import { IExperiment, IFlow, IFlowGroup, IFlowInfo, IHost, INode } from 'config/interfaces/Chaos/experiment';
import { NODE_TYPE, SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { getActiveNamespace, getParams, parseQuery, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const { Group: ButtonGroup } = Button;
const { Group: RadioGroup } = Radio;
const { Item: FormItem } = Form;
const Tooltip = Balloon.Tooltip;
const Option = Select.Option;
const DEFAULT_RUNMODE = 'SEQUENCE';
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 22 },
};

interface StepTwoProps {
  experimentId?: string;
  isEdit: boolean;
  onNext: () => void;
  onPrev: () => void;
  onBack: () => void;
  isExpertise: boolean;
}

function StepTwo(props: StepTwoProps) {
  const dispatch = useDispatch();
  const history = useHistory();
  const experiment = useSelector(({ experimentEditor }) => experimentEditor.experiment, (preProps, state) => {
    return preProps === state;
  });
  const createExperimentId = useSelector(({ experimentEditor }) => experimentEditor.createExperimentId);
  const expertise = useSelector(({ expertiseEditor }) => expertiseEditor.expertise, (preProps, state) => {
    return preProps === state;
  });

  const [ addNodeVisible, setAddNodeVisible ] = useState(false);
  const [ editNodeVisible, setEditNodeVisible ] = useState(false);
  const [ currentNode, setCurrentNode ] = useState<INode | null>(null); // 当前操作数据节点
  const [ nodeType, setNodeType ] = useState(NaN);
  const [ toBeFillNode, setToBeFillNode ] = useState<any[]>([]);
  const [ timeUnit, setTimeUnit ] = useState('minute');
  const [ timeOut, setTimeOut ] = useState(15);
  const [ nodeClickVisible, setNodeClickVisible ] = useState(false); // 演练节点涉及机器弹窗
  const [ nodeDetail, setNodeDetail ] = useState<any[]>([]); // 流程节点详情
  const [ cronVisible, setCronVisible ] = useState(false); // 定时运行配置弹窗
  const [ createVisible, setCreateVisible ] = useState(false); // 提交成功弹窗
  const [ updateVisible, setUpdateVisible ] = useState(false); // 更新成功弹窗；
  const workspaceId = getParams('workspaceId');

  useEffect(() => {
    // 节点改变后进行数据更新
    const { isExpertise } = props;
    let experimentData: any;
    let experimentTimeOut: any;
    if (isExpertise) {
      experimentData = expertise;
      experimentTimeOut = expertise && expertise.executable_info;

    } else {
      experimentData = experiment;
      experimentTimeOut = experiment;
    }
    if (_.isEmpty(experimentData)) {
      return;
    }
    if (experimentTimeOut && experimentTimeOut.flow && experimentTimeOut.flow.duration) {
      if (timeUnit === 'minute') {
        setTimeOut(experimentTimeOut.flow.duration / 60);
      } else if (timeUnit === 'hour') {
        setTimeOut(experimentTimeOut.flow.duration / 3600);
      }
    }
    // 更新currentNode
    const { observerNodes: observerNodesNext = [], recoverNodes: recoverNodesNext = [] } = experimentData;
    if (currentNode) {
      let searchNodes: INode[] = [];
      if (currentNode.nodeType === NODE_TYPE.OBSERVER) {
        searchNodes = observerNodesNext;
      } else if (currentNode.nodeType === NODE_TYPE.RECOVER) {
        searchNodes = recoverNodesNext;
      }
      const exist = _.find(searchNodes, (node: INode) => node.id === currentNode.id);
      if (exist) {
        setCurrentNode({ ...exist });
      }
    }
    return;
  }, [ experiment, expertise ]);

  function renderTimeOut() {
    return (
      <div className={styles.timeOutContent}>
        <NumberPicker
          className={styles.timeNumber}
          onChange={handleTimeOutChange}
          value={timeOut}
          precision={1}
          step={1}
          min={1}
        />
        <Select
          className={styles.timeUnitOption}
          onChange={handleTimeUnit}
          value={timeUnit}
        >
          <Option value="minute">分钟</Option>
          <Option value="hour">小时</Option>
        </Select>
      </div>
    );
  }

  function handleTimeOutChange(time: number) {
    setTimeOut(time);
    handleTimeTransform(time);
  }

  function handleTimeUnit(timeUnit: string) {
    setTimeUnit(timeUnit);
    handleTimeTransform(timeOut, timeUnit);
  }

  function handleTimeTransform(time: number, unit?: string) {
    const { isExpertise } = props;
    let durationTime;
    if (unit && unit === 'hour') {
      durationTime = time * 3600;
    } else {
      durationTime = time * 60;
    }
    if (isExpertise) {
      dispatch.expertiseEditor.setChangeExpertiseTimeOut(durationTime);
    } else {
      dispatch.experimentEditor.setChangeTimeOut(durationTime);
    }
  }

  function getNodeSettingTitle(nodeType: number) {
    if (nodeType === NODE_TYPE.OBSERVER) {
      return '新增策略';
    } else if (nodeType === NODE_TYPE.RECOVER) {
      return '新增策略';
    }
    return '';
  }

  function handleAddNodeClose() {
    setNodeType(NaN);
    setAddNodeVisible(false);
  }

  function handleCronExpressionChange(value: string) {
    const { isExpertise } = props;
    if (isExpertise) {
      dispatch.expertiseEditor.setExpertiseSchedulerConfig({ cronExpression: value });
    } else {
      dispatch.experimentEditor.setSchedulerConfig({ cronExpression: value });
    }
  }

  function renderCronExpression() {
    const { isExpertise } = props;
    let experimentData;
    if (isExpertise) {
      experimentData = _.get(expertise, 'executable_info');
    } else {
      experimentData = experiment;
    }

    const cronExpression = _.get(experimentData, 'flow.schedulerConfig.cronExpression', '');
    return (<>
      <span className={cronExpression && styles.inputExpression}>{cronExpression}</span>
      <span
        className={styles.cronTool}
        onClick={() => setCronVisible(true)}
      >
        配置定时运行
      </span>
      {cronExpression && <span
        className={styles.clearCron}
        onClick={() => handleCronExpressionChange('')}
      >
        清空
      </span>}
    </>);
  }

  function handleNodeSelect(node: INode) {
    const { isExpertise } = props;
    if (isExpertise) {
      // 经验创建全局存储
      dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode(node);
    } else {
      // 这时experimentId理论上已经存在了，就不校验了
      dispatch.experimentEditor.setAddOrUpdateGuardNode(node);
    }
    // 选择节点的同时，打开参数设置抽屉
    handleEditNodeOpen(node);
  }

  function handleEditNodeClose() {
    setEditNodeVisible(false);
    setCurrentNode(null);
  }

  function handleNodeCheckParams(updateVal: INode) {
    const { isExpertise } = props;
    let experimentData;
    if (isExpertise) {
      experimentData = _.get(expertise, 'executable_info');
    } else {
      experimentData = experiment;
    }
    const { flow } = experimentData;
    const { guardConf } = flow as IFlowInfo;
    const { guards } = guardConf;
    _.map(guards, (g: INode) => {
      if (g.id === updateVal.id) {
        g.args = updateVal.args;
        g.tolerance = updateVal.tolerance;
      }
    });
    const submitNodes = handleNodeCheck(guardConf as any);
    setToBeFillNode(submitNodes);
  }

  function handleNodeCheck(guardConf: INode[]) {
    const checkNodes: INode[] = [];
    if (!_.isEmpty(guardConf)) {
      const guards = _.get(guardConf, 'guards', []);
      _.map(guards, (g: INode) => {
        const { args, tolerance } = g;
        if (!_.isEmpty(args)) {
          let foundError = false;
          args.forEach((arg: any) => {
            const { argumentList = [] } = arg;
            argumentList.forEach((item: any) => {
              if (item.component && item.component.required && (item.value == null || item.value === '')) {
                foundError = true;
                g.argsValid = false;
                checkNodes.push(g);
              }
            });
          });
          // 如果所有参数校验通过，置回true
          if (!foundError) {
            g.argsValid = true;
          }
        }
        if (!_.isEmpty(tolerance)) {
          let foundError = false;
          for (const tole of tolerance!) {
            if (tole.component && tole.component.required && (tole.value == null || tole.value === '')) {
              foundError = true;
              g.argsValid = false;
              checkNodes.push(g);
              break;
            }
          }
          // 如果所有参数校验通过，置回true
          if (!foundError) {
            g.argsValid = true;
          }
        }
      });
      return checkNodes;
    }
    return [];
  }

  const renderGroupOrder: any = (value: string, index: number, record: any) => {
    return `分组${record.groupOrder}`;
  };

  const renderIP: any = (value: string, index: number, record: any) => {
    return handleDealHosts(record);
  };

  const handleDealHosts: any = (val: any) => {
    let label;
    if (val.scopeType === SCOPE_TYPE.HOST || !val.k8s || val.app) {
      label = `${val.ip}[${val.deviceName}]`;
    } else {
      if (val && !_.isEmpty(val.clusterName)) {
        label = `[K8S] ${val.clusterName}`;
      } else {
        label = `[K8S] ${val.clusterId}`;
      }
    }
    return label;
  };

  function renderNodeClick() {
    return <Dialog
      title="演练节点涉及机器"
      visible={nodeClickVisible}
      footer={false}
      onClose={() => { setNodeClickVisible(false); }}
      style={{ width: 960, paddingBottom: 20 }}
    >
      <Table
        dataSource={nodeDetail}
        hasBorder={false}
      >
        <Table.Column title="分组编号" cell={renderGroupOrder}/>
        <Table.Column title="机器 IP" cell={renderIP}/>
        <Table.Column title="归属分组" dataIndex="groupName" />
      </Table>
    </Dialog>;
  }

  function handleToDetail() {
    const parsed = parseQuery();
    const { id } = parsed as { id: string | number };
    if (id) {
      pushUrl(history, '/chaos/experiment/detail', { id });
    } else if (createExperimentId) {
      pushUrl(history, '/chaos/experiment/detail', {
        id: createExperimentId,
      });
    }
    dispatch.experimentEditor.setClearExperiment();
  }

  function handleToHome() {
    if (workspaceId) {
      pushUrl(history, '/chaos/workspace/detail', {
        workspaceId,
      });
    } else {
      // 返回时不携带参数，pushUrl会把所有参数都带回去
      history.push(`/chaos?ns=${getActiveNamespace()}`);
    }
    dispatch.experimentEditor.setClearExperiment();
  }

  function getActiveRunMode() {
    const { isExpertise } = props;
    let experimentData;
    if (isExpertise) {
      experimentData = _.get(expertise, 'executable_info', {});
    } else {
      experimentData = experiment;
    }

    if (!_.isEmpty(experimentData)) {
      return _.get(experimentData, 'flow.runMode', DEFAULT_RUNMODE);
    }
    return DEFAULT_RUNMODE;
  }

  function handleRunModeChange(mode: string | number | boolean) {
    const { isExpertise } = props;
    if (isExpertise) {
      dispatch.expertiseEditor.setChangeExpertiseRunMode(String(mode));
    } else {
      dispatch.experimentEditor.setChangeRunMode(String(mode));
    }
  }

  function renderHelpTips(content: string) {
    return <Tooltip
      trigger={<Icon type="help" className={styles.helpIcon} />}
      align="tl"
    >
      {content}
    </Tooltip>;
  }

  function getNodes() {
    const nodes = {
      observerNodes: [] as INode[],
      recoverNodes: [] as INode[],
    } as any;
    let experimentData;
    const { isExpertise } = props;
    if (isExpertise) {
      experimentData = expertise;
    } else {
      experimentData = experiment;
    }

    if (_.isEmpty(experimentData)) {
      return nodes;
    }

    nodes.observerNodes = experimentData.observerNodes;
    nodes.recoverNodes = experimentData.recoverNodes;

    return nodes;
  }

  function handleAddNode(nodeType: number) {
    const { observerNodes } = getNodes();
    if (nodeType === NODE_TYPE.OBSERVER && observerNodes && observerNodes.length >= 8) {
      return Message.error('监控策略最多配置8个');
    }
    setNodeType(nodeType);
    setAddNodeVisible(true);
    setEditNodeVisible(false);
  }

  function handleEditNodeOpen(node: INode) {
    const { nodeType, functionId = '' } = node;
    setEditNodeVisible(true);
    setCurrentNode(node);

    if (nodeType === NODE_TYPE.OBSERVER) {
      (async function() {
        await dispatch.experimentScene.getFunctionParameters({ functionId });
      })();
    }

    if (nodeType === NODE_TYPE.RECOVER) {
      (async function() {
        await dispatch.experimentScene.getGuardSceneRules({ functionId });
      })();
    }
  }

  function renderNodes(nodeType: number, nodes: INode[]) {
    const { isExpertise } = props;
    const title = getNodeSettingTitle(nodeType);
    const errorNodes = _.intersectionBy(nodes, toBeFillNode, 'id');
    !_.isEmpty(nodes) && _.forEach(nodes, (node: INode) => {
      node.argsValid = true;
      if (!_.isEmpty(errorNodes)) {
        _.forEach(errorNodes, (eN: INode) => {
          const exist = _.find(nodes, (node: INode) => node.id === eN.id) as INode;
          if (!_.isEmpty(exist)) {
            exist.argsValid = false;
          }
        });
      }
    });
    return (
      <div className={styles.globalNode}>
        <span
          className={styles.addNodeBtn}
          onClick={() => handleAddNode(nodeType)}
        >{title}</span>
        {
          !_.isEmpty(nodes) && nodes.map(node => {
            return (
              <Node
                key={node.id}
                isAdisExpertisemin={isExpertise}
                editable
                deletable
                data={node}
                onClick={handleEditNodeOpen}
                onNodeDeleteClick={handleDeleteNode}
              />
            );
          })
        }
      </div>
    );
  }

  function handleDeleteNode(node: INode) {
    const { isExpertise } = props;
    if (isExpertise) {
      dispatch.expertiseEditor.setDeleteExpertiseGuardNode(node);
      handleEditNodeClose();
    } else {
      dispatch.experimentEditor.setDeleteGuardNode(node);
      handleEditNodeClose();
    }
  }

  function handleNodeClick(node: INode) {
    const { isExpertise } = props;
    let flowGroups;
    if (isExpertise) {
      flowGroups = _.get(expertise, 'executable_info.flow.flowGroups', []);
    } else {
      flowGroups = _.get(experiment, 'flow.flowGroups', []);
    }
    const dataSourceValue: any[] = [];
    _.map(flowGroups, (fg: IFlowGroup) => {
      const { flows } = fg;
      _.map(flows as IFlow[], (f: IFlow) => {
        if (node && f.id === node.flowId) {
          setNodeClickVisible(true);
          const { hosts } = fg;
          hosts && _.map(hosts, (h: IHost) => {
            dataSourceValue.push({
              groupOrder: node.groupOrder,
              ...h,
              ...fg,
            });
          });
        }
      });
    });
    if (!_.isEmpty(dataSourceValue)) {
      setNodeDetail(dataSourceValue!);
    }
    return;
  }

  function handleSubmitNext() {
    const { onNext, isEdit, isExpertise } = props;
    let experimentData;
    if (isExpertise) {
      experimentData = _.get(expertise, 'executable_info', {});
    } else {
      experimentData = experiment;
    }
    if (!_.isEmpty(experimentData)) {
      const { flow, baseInfo } = experimentData as IExperiment;
      const { guardConf } = flow;

      // 管理员配置经验不校验参数
      const submitNodes = isExpertise ? [] : handleNodeCheck(guardConf as any);
      if (isExpertise) {
        onNext();
      } else {
        if (!_.isEmpty(submitNodes) && _.find(submitNodes, (node: INode) => !node.argsValid)) {
          const checkNodes = _.filter(submitNodes, (node: INode) => !node.argsValid);
          setToBeFillNode(checkNodes);
          const errorName = checkNodes[0].name;
          Message.error(`"${errorName}"节点参数未配置！`);
          return false;
        } else if (!baseInfo.name) {
          Message.error('请填写演练名称！');
          return false;
        }
        setToBeFillNode([]);
        if (isEdit) {
          (async function() {
            await dispatch.experimentEditor.updateExperiment({ ...convertFilter.convertFilterSubmit(flow as any) }, () => {
              setUpdateVisible(true);
            });
          })();
        } else {
          (async function() {
            if (workspaceId) {
              // 普通空间创建演练
              await dispatch.experimentEditor.workspaceCreateExperiment({
                ...baseInfo,
                definition: { ...convertFilter.convertFilterSubmit(flow as any) } as any,
                workspaceId,
              } as any, () => {
                setCreateVisible(true);
              });
            } else {
              await dispatch.experimentEditor.createExperiment({
                ...baseInfo,
                definition: { ...convertFilter.convertFilterSubmit(flow as any) },
              } as any, () => {
                setCreateVisible(true);
              });
            }
          })();
        }
      }
    }
  }

  const { isEdit, onBack, onPrev, isExpertise } = props;
  const executableInfo = _.get(expertise, 'executable_info', {}) as IExperiment;
  const runMode = getActiveRunMode();
  const { observerNodes, recoverNodes } = getNodes();
  return (
    <div>
      <Form {...formItemLayout}>
        <FormItem label="演练流程" >
          <RadioGroup value={runMode} onChange={handleRunModeChange as any}>
            <Radio id="SEQUENCE" value="SEQUENCE">
              顺序执行
              {renderHelpTips('顺序执行：按照演练对象的顺序进行执行')}
            </Radio>
            <Radio id="PHASE" value="PHASE">
              阶段执行
              {renderHelpTips('阶段执行：按照演练阶段的顺序进行执行')}
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label=" " className={styles.miniFlowContent}>
          <div className={styles.miniFlowBackGround}>
            <MiniFlowView
              isExpertise={isExpertise}
              experiment={isExpertise ? executableInfo : experiment}
              runMode={runMode}
              onNodeClick={node => handleNodeClick(node as INode)}
            />
          </div>
        </FormItem>
        <FormItem label="监控策略">
          {renderNodes(NODE_TYPE.OBSERVER, observerNodes)}
        </FormItem>
        <FormItem label="恢复策略">
          {renderNodes(NODE_TYPE.RECOVER, recoverNodes)}
        </FormItem>
        <FormItem label="自动恢复时间">
          {renderTimeOut()}
        </FormItem>
        <FormItem label="定时运行">
          {renderCronExpression()}
        </FormItem>
      </Form>
      <div>
        <div>
          <div className='DividerEdit'></div>
          <ButtonGroup>
            <Button
              style={{ marginRight: '10px' }}
              onClick={onPrev}
              type="primary"
              // disabled={loading}
              data-autolog={'text=演练上一步'}
            >
            上一步
            </Button>
            <Button
              onClick={handleSubmitNext}
              style={{ marginRight: '10px' }}
              type="primary"
              // disabled={loading}
              data-autolog={`text=${isEdit ? '演练编辑提交' : '演练新增提交'}`}
            >
            下一步
            </Button>
            {
              isEdit && <Button type='normal' onClick={onBack}>取消编辑</Button>
            }
          </ButtonGroup>
        </div>
      </div>
      <AddFunction
        title={getNodeSettingTitle(nodeType!)}
        nodeType={nodeType!}
        searchable={false}
        visible={addNodeVisible}
        onClose={handleAddNodeClose}
        onSelect={node => handleNodeSelect({ ...node, nodeType })}
      />
      {currentNode &&
        <ActivityEditor
          isExpertise={isExpertise}
          visible={editNodeVisible}
          data={currentNode!}
          onClose={handleEditNodeClose}
          onCheckNode={handleNodeCheckParams}
        />
      }
      {renderNodeClick()}
      <CronExpressionGenerator
        visible={cronVisible}
        onChange={value => {
          setCronVisible(false);
          handleCronExpressionChange(value);
        }}
        onClose={() => setCronVisible(false)}
      />
      <Dialog
        className={styles.successDialog}
        title={
          <div className={styles.success}>
            <Icon type="success-filling" className={styles.successIcon}/>
            <span className={styles.successTitle}>成功</span>
          </div>}
        visible={createVisible || updateVisible}
        closeable={false}
        footer={
          <ButtonGroup>
            <Button type="primary" onClick={handleToDetail} style={{ marginRight: 8 }}>演练详情</Button>
            <Button type="normal" onClick={handleToHome}>返回首页</Button>
          </ButtonGroup>
        }
      >
        <div className={styles.successContent}>{createVisible ? '演练创建成功。' : '演练更新成功。'}</div>
      </Dialog>
    </div>
  );
}

export default StepTwo;
