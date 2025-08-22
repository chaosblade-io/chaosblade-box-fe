import ActivityEditor from 'pages/Chaos/Experiment/common/ActivityEditor';
import AddFunction from 'pages/Chaos/Experiment/common/AddFunction';
import CronExpressionGenerator from 'pages/Chaos/common/CronExpressionGenerator';
import MiniFlowView from 'pages/Chaos/common/MInFlowView';
import Node from 'pages/Chaos/common/Node';
import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import convertFilter from 'pages/Chaos/lib/ConvertFilter';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Balloon, Button, Dialog, Form, Icon, Message, NumberPicker, Radio, Select, Table } from '@alicloud/console-components';
import { IExperiment, IFlow, IFlowGroup, IFlowInfo, IHost, INode } from 'config/interfaces/Chaos/experiment';
import { NODE_TYPE, SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { getActiveNamespace, getParams, parseQuery, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';
import { ILoadTestDefinition, ILoadTestStrategy } from 'config/interfaces/Chaos/experimentTask';

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
  const loadTestDefinitions = useSelector(({ loadTestDefinition }) => loadTestDefinition.definitions);

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
  const [ loadTestConfig, setLoadTestConfig ] = useState({
    selectedDefinitions: [] as string[],
    preStartTime: 5,
    preStartUnit: 'minute',
    duration: 10,
    durationUnit: 'minute',
  });
  const [ updateVisible, setUpdateVisible ] = useState(false); // 更新成功弹窗；
  const [ existingStrategies, setExistingStrategies ] = useState<ILoadTestStrategy[]>([]); // 现有的压测策略
  const workspaceId = getParams('workspaceId');

  // 加载压测定义列表
  useEffect(() => {
    dispatch.loadTestDefinition.listAllLoadTestDefinitions({});
  }, []);

  // 编辑模式下加载现有的压测策略
  useEffect(() => {
    if (props.isEdit && props.experimentId) {
      loadExistingStrategies(props.experimentId);
    }
  }, [ props.isEdit, props.experimentId ]);

  // 加载现有的压测策略
  async function loadExistingStrategies(experimentId: string) {
    try {
      const strategies = await dispatch.loadTestDefinition.getLoadTestStrategyByExperimentId({
        experimentId,
        Namespace: 'default', // 添加Namespace参数（大写N）
      });

      if (strategies && strategies.length > 0) {
        setExistingStrategies(strategies);

        // 回显压测配置
        const selectedDefinitions = strategies.map((s: ILoadTestStrategy) => s.definitionId);
        const firstStrategy = strategies[0];

        // 将秒转换为分钟（如果能整除60）或保持秒
        const preStartTime = firstStrategy.startBeforeFaultSec;
        const duration = firstStrategy.trafficDurationSec;

        const preStartUnit = preStartTime % 60 === 0 ? 'minute' : 'second';
        const durationUnit = duration % 60 === 0 ? 'minute' : 'second';

        setLoadTestConfig({
          selectedDefinitions,
          preStartTime: preStartUnit === 'minute' ? preStartTime / 60 : preStartTime,
          preStartUnit,
          duration: durationUnit === 'minute' ? duration / 60 : duration,
          durationUnit,
        });
      }
    } catch (error) {
      console.error('Failed to load existing strategies:', error);
    }
  }

  // 创建压测策略
  async function createLoadTestStrategies(experimentId: string, config: any) {
    try {
      // 将时间单位转换为秒
      const preStartTimeSec = config.preStartUnit === 'minute'
        ? config.preStartTime * 60
        : config.preStartTime;
      const durationSec = config.durationUnit === 'minute'
        ? config.duration * 60
        : config.duration;

      // 为每个选中的压测定义创建策略
      const promises = config.selectedDefinitions.map((definitionId: string) => {
        return dispatch.loadTestDefinition.createLoadTestStrategy({
          enable: true,
          definitionId,
          experimentId,
          startBeforeFaultSec: preStartTimeSec,
          trafficDurationSec: durationSec,
          abortOnLoadFailure: true,
        });
      });

      await Promise.all(promises);
      console.log('Load test strategies created successfully');
    } catch (error) {
      console.error('Failed to create load test strategies:', error);
      Message.error(i18n.t('Failed to create load test strategies').toString());
    }
  }

  // 编辑模式下处理压测策略的更新
  async function handleLoadTestStrategiesForUpdate(experimentId: string, config: any) {
    try {
      // 将时间单位转换为秒
      const preStartTimeSec = config.preStartUnit === 'minute'
        ? config.preStartTime * 60
        : config.preStartTime;
      const durationSec = config.durationUnit === 'minute'
        ? config.duration * 60
        : config.duration;

      // 获取当前选中的定义ID
      const selectedDefinitionIds = new Set(config.selectedDefinitions);

      // 获取现有策略的定义ID
      const existingDefinitionIds = new Set(existingStrategies.map(s => s.definitionId));

      // 需要删除的策略（现有的但未选中的）
      const strategiesToDelete = existingStrategies.filter(s => !selectedDefinitionIds.has(s.definitionId));

      // 需要创建的策略（选中的但不存在的）
      const definitionsToCreate = config.selectedDefinitions.filter((id: string) => !existingDefinitionIds.has(id));

      // 需要更新的策略（既存在又选中的）
      const strategiesToUpdate = existingStrategies.filter(s => selectedDefinitionIds.has(s.definitionId));

      // 删除不需要的策略
      for (const strategy of strategiesToDelete) {
        await dispatch.loadTestDefinition.deleteLoadTestStrategy({ id: strategy.id });
      }

      // 创建新的策略
      for (const definitionId of definitionsToCreate) {
        await dispatch.loadTestDefinition.createLoadTestStrategy({
          enable: true,
          definitionId,
          experimentId,
          startBeforeFaultSec: preStartTimeSec,
          trafficDurationSec: durationSec,
          abortOnLoadFailure: true,
        });
      }

      // 更新现有的策略
      for (const strategy of strategiesToUpdate) {
        await dispatch.loadTestDefinition.updateLoadTestStrategy({
          id: strategy.id,
          enable: true,
          startBeforeFaultSec: preStartTimeSec,
          trafficDurationSec: durationSec,
          abortOnLoadFailure: true,
        });
      }

      console.log('Load test strategies updated successfully');
    } catch (error) {
      console.error('Failed to update load test strategies:', error);
      Message.error(i18n.t('Failed to update load test strategies').toString());
    }
  }

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
        setCurrentNode({ ...exist } as INode);
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
          locale={locale().Select}
        >
          <Option value="minute"><Translation>Minute</Translation></Option>
          <Option value="hour"><Translation>Hour</Translation></Option>
        </Select>
      </div>
    );
  }

  function renderLoadTestStrategy() {
    // 使用真实的压测定义数据
    const dataSource = loadTestDefinitions.map((def: ILoadTestDefinition) => ({
      value: def.id,
      label: `${def.name} (${def.entry} - ${def.engineType})`,
    }));

    return (
      <div className={styles.loadTestStrategy}>
        <div className={styles.loadTestSection}>
          <div className={styles.sectionTitle}>
            <Translation>Load Test Definition Selection</Translation>
          </div>
          <Select
            mode="multiple"
            value={loadTestConfig.selectedDefinitions}
            onChange={(value: string[]) => setLoadTestConfig({ ...loadTestConfig, selectedDefinitions: value })}
            dataSource={dataSource}
            placeholder={i18n.t('Please select load test definitions').toString()}
            style={{ width: '100%', marginBottom: 16 }}
          />
          {loadTestConfig.selectedDefinitions.length > 0 && (
            <div className={styles.selectedPreview}>
              <div className={styles.previewTitle}><Translation>Selected Definitions</Translation>:</div>
              {loadTestConfig.selectedDefinitions.map(id => {
                const def = loadTestDefinitions.find((d: ILoadTestDefinition) => d.id === id);
                return def ? (
                  <div key={id} className={styles.previewItem}>
                    <span className={styles.defName}>{def.name}</span>
                    <span className={styles.defMeta}>({def.entry} - {def.engineType})</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div className={styles.loadTestSection}>
          <div className={styles.sectionTitle}>
            <Translation>Load Test Timing Configuration</Translation>
          </div>
          <div className={styles.timingConfig}>
            <div className={styles.timingItem}>
              <span className={styles.timingLabel}><Translation>Pre-start time</Translation>:</span>
              <div className={styles.timeOutContent}>
                <NumberPicker
                  className={styles.timeNumber}
                  value={loadTestConfig.preStartTime}
                  onChange={value => setLoadTestConfig({ ...loadTestConfig, preStartTime: value as number })}
                  min={0}
                  max={60}
                />
                <Select
                  className={styles.timeUnitOption}
                  value={loadTestConfig.preStartUnit}
                  onChange={value => setLoadTestConfig({ ...loadTestConfig, preStartUnit: value as string })}
                >
                  <Option value="minute"><Translation>Minute</Translation></Option>
                  <Option value="second"><Translation>Second</Translation></Option>
                </Select>
              </div>
            </div>
            <div className={styles.timingItem}>
              <span className={styles.timingLabel}><Translation>Duration</Translation>:</span>
              <div className={styles.timeOutContent}>
                <NumberPicker
                  className={styles.timeNumber}
                  value={loadTestConfig.duration}
                  onChange={value => setLoadTestConfig({ ...loadTestConfig, duration: value as number })}
                  min={1}
                  max={120}
                />
                <Select
                  className={styles.timeUnitOption}
                  value={loadTestConfig.durationUnit}
                  onChange={value => setLoadTestConfig({ ...loadTestConfig, durationUnit: value as string })}
                >
                  <Option value="minute"><Translation>Minute</Translation></Option>
                  <Option value="second"><Translation>Second</Translation></Option>
                </Select>
              </div>
            </div>
          </div>

          {loadTestConfig.selectedDefinitions.length > 0 && (
            <div className={styles.timelinePreview}>
              <div className={styles.previewTitle}><Translation>Timeline Preview</Translation>:</div>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div
                    className={styles.timelineBar}
                    style={{
                      backgroundColor: '#52c41a',
                      width: `${Math.max(30, (loadTestConfig.duration / (loadTestConfig.duration + loadTestConfig.preStartTime + 10)) * 100)}%`,
                    }}
                  >
                    <span><Translation>Load Test</Translation></span>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <div
                    className={styles.timelineBar}
                    style={{
                      backgroundColor: '#ff4d4f',
                      width: '40%',
                      marginLeft: `${(loadTestConfig.preStartTime / (loadTestConfig.duration + loadTestConfig.preStartTime + 10)) * 100}%`,
                    }}
                  >
                    <span><Translation>Fault Injection</Translation></span>
                  </div>
                </div>
                <div className={styles.timelineLabels}>
                  <span>0</span>
                  <span>{loadTestConfig.preStartTime}{loadTestConfig.preStartUnit === 'minute' ? 'min' : 's'}</span>
                  <span>{loadTestConfig.preStartTime + loadTestConfig.duration}{loadTestConfig.durationUnit === 'minute' ? 'min' : 's'}</span>
                </div>
              </div>
              <div className={styles.timelineDescription}>
                <div><Translation>Load Test</Translation>: {i18n.t('Start').toString()} {loadTestConfig.preStartTime}{loadTestConfig.preStartUnit === 'minute' ? i18n.t('minutes').toString() : i18n.t('seconds').toString()} {i18n.t('before fault injection').toString()}</div>
                <div><Translation>Duration</Translation>: {loadTestConfig.duration} {loadTestConfig.durationUnit === 'minute' ? i18n.t('minutes').toString() : i18n.t('seconds').toString()}</div>
              </div>
            </div>
          )}
        </div>
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
      return i18n.t('Add strategy');
    } else if (nodeType === NODE_TYPE.RECOVER) {
      return i18n.t('Add strategy');
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
        <Translation>Configure timing to run</Translation>
      </span>
      {cronExpression && <span
        className={styles.clearCron}
        onClick={() => handleCronExpressionChange('')}
      >
        <Translation>Empty</Translation>
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
    return `${i18n.t('Group')}${record.groupOrder}`;
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
      title={i18n.t('Walkthrough nodes involve machines').toString()}
      visible={nodeClickVisible}
      footer={false}
      onClose={() => { setNodeClickVisible(false); }}
      style={{ width: 960, paddingBottom: 20 }}
      locale={locale().Dialog}
    >
      <Table
        dataSource={nodeDetail}
        hasBorder={false}
        locale={locale().Table}
      >
        <Table.Column title={i18n.t('Group number').toString()} cell={renderGroupOrder} />
        <Table.Column title={i18n.t('Machine IP').toString()} cell={renderIP} />
        <Table.Column title={i18n.t('Attribution group').toString()} dataIndex="groupName" />
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
      return Message.error(i18n.t('A maximum of 8 monitoring policies can be configured'));
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
          const errorName = (checkNodes[0] as INode).name;
          Message.error(`"${errorName}"${i18n.t('Node parameters are not configured')}`);
          return false;
        } else if (!baseInfo.name) {
          Message.error(i18n.t('Please fill in the exercise name'));
          return false;
        }

        // 压测配置校验
        if (loadTestConfig.selectedDefinitions.length > 0) {
          if (loadTestConfig.preStartTime < 0) {
            Message.error(i18n.t('Pre-start time must be greater than or equal to 0'));
            return false;
          }
          if (loadTestConfig.duration <= 0) {
            Message.error(i18n.t('Duration must be greater than 0'));
            return false;
          }
          if (loadTestConfig.preStartTime > 60) {
            Message.error(i18n.t('Pre-start time should not exceed 60 minutes'));
            return false;
          }
          if (loadTestConfig.duration > 120) {
            Message.error(i18n.t('Duration should not exceed 120 minutes'));
            return false;
          }
        }
        setToBeFillNode([]);
        if (isEdit) {
          (async function() {
            await dispatch.experimentEditor.updateExperiment({ ...convertFilter.convertFilterSubmit(flow as any) }, async () => {
              // 演练更新成功后，处理压测策略
              if (loadTestConfig.selectedDefinitions.length > 0 && props.experimentId) {
                await handleLoadTestStrategiesForUpdate(props.experimentId, loadTestConfig);
              }
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
                loadTestConfig: loadTestConfig.selectedDefinitions.length > 0 ? loadTestConfig : undefined,
                workspaceId,
              } as any, async (createdExperimentId?: string) => {
                console.log('Experiment created successfully with ID:', createdExperimentId);

                // 如果有压测配置，则创建压测策略
                if (loadTestConfig.selectedDefinitions.length > 0 && createdExperimentId) {
                  try {
                    await createLoadTestStrategies(createdExperimentId, loadTestConfig);
                    console.log('Load test strategies created successfully for experiment:', createdExperimentId);
                  } catch (error) {
                    console.error('Failed to create load test strategies:', error);
                    Message.warning(i18n.t('Experiment created successfully, but load test configuration failed. You can configure it later.'));
                  }
                }
                setCreateVisible(true);
              });
            } else {
              await dispatch.experimentEditor.createExperiment({
                ...baseInfo,
                definition: { ...convertFilter.convertFilterSubmit(flow as any) },
                loadTestConfig: loadTestConfig.selectedDefinitions.length > 0 ? loadTestConfig : undefined,
              } as any, async (createdExperimentId?: string) => {
                console.log('Experiment created successfully with ID:', createdExperimentId);

                // 如果有压测配置，则创建压测策略
                if (loadTestConfig.selectedDefinitions.length > 0 && createdExperimentId) {
                  try {
                    await createLoadTestStrategies(createdExperimentId, loadTestConfig);
                    console.log('Load test strategies created successfully for experiment:', createdExperimentId);
                  } catch (error) {
                    console.error('Failed to create load test strategies:', error);
                    Message.warning(i18n.t('Experiment created successfully, but load test configuration failed. You can configure it later.'));
                  }
                }
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
        <FormItem label={i18n.t('Exercise process').toString()} >
          <RadioGroup value={runMode} onChange={handleRunModeChange as any}>
            <Radio id="SEQUENCE" value="SEQUENCE">
              <Translation>Sequential execution</Translation>
              {renderHelpTips('顺序执行：按照演练对象的顺序进行执行')}
            </Radio>
            <Radio id="PHASE" value="PHASE">
              <Translation>Stage execution</Translation>
              {renderHelpTips(i18n.t('Stage Execution: Execute in the order of the drill stages'))}
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
        <FormItem label={i18n.t('Monitoring strategy').toString()}>
          {renderNodes(NODE_TYPE.OBSERVER, observerNodes)}
        </FormItem>
        <FormItem label={i18n.t('Recovery strategy').toString()}>
          {renderNodes(NODE_TYPE.RECOVER, recoverNodes)}
        </FormItem>
        <FormItem label={i18n.t('Load Test Strategy').toString()}>
          {renderLoadTestStrategy()}
        </FormItem>
        <FormItem label={i18n.t('Auto recovery time').toString()}>
          {renderTimeOut()}
        </FormItem>
        <FormItem label={i18n.t('Timed operation').toString()}>
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
              data-autolog={`text=${i18n.t('Rehearse the previous step')}`}
            >
              <Translation>Pervious</Translation>
            </Button>
            <Button
              onClick={handleSubmitNext}
              style={{ marginRight: '10px' }}
              type="primary"
              // disabled={loading}
              data-autolog={`text=${isEdit ? i18n.t('Walkthrough Edit Submission') : i18n.t('Walkthrough new commits')}`}
            >
              <Translation>Next step</Translation>
            </Button>
            {
              isEdit && <Button type='normal' onClick={onBack}><Translation>Cancel editing</Translation></Button>
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
            <Icon type="success-filling" className={styles.successIcon} />
            <span className={styles.successTitle}><Translation>Success</Translation></span>
          </div>}
        visible={createVisible || updateVisible}
        closeable={false}
        footer={
          <ButtonGroup>
            <Button type="primary" onClick={handleToDetail} style={{ marginRight: 8 }}><Translation>Drill details</Translation></Button>
            <Button type="normal" onClick={handleToHome}><Translation>Back to Home</Translation></Button>
          </ButtonGroup>
        }
        locale={locale().Dialog}
      >
        <div className={styles.successContent}>{createVisible ? i18n.t('The walkthrough was created successfully').toString() : i18n.t('The drill update was successful').toString()}</div>
      </Dialog>
    </div>
  );
}

export default StepTwo;
