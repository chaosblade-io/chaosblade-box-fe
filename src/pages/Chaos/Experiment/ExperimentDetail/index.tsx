import ActivityEditor from 'pages/Chaos/Experiment/common/ActivityEditor';
import BaseInfoView from 'pages/Chaos/common/BaseInfoView';
import ExperimentChangeHistory from './ExperimentChangeHistory';
import ExperimentTaskHistory from 'pages/Chaos/Experiment/common/ExperimentTaskHistory';
import MiniFlowView from 'pages/Chaos/common/MInFlowView';
import Node from 'pages/Chaos/common/Node';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './index.css';
import { Balloon, Button, Dialog, Icon, Message, NumberPicker, Select, Tab, Table, Tag } from '@alicloud/console-components';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IActivity } from 'config/interfaces/Chaos/experimentTask';
import { IExperiment, IFlow, IFlowGroup, IHost, INode } from 'config/interfaces/Chaos/experiment';
import { IPoint } from 'config/interfaces/Chaos/experimentDetail';
import { OPLEVEL, SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { SELECT_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { handleIsAdmin } from 'pages/Chaos/lib/BetaFlag';
import { hostPreCheck } from 'pages/Chaos/lib/HostPreCheck';
import { parseQuery, pushUrl, removeParams } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

import CopyHostDialog from '../ExperimentEditor/StepOne/copyHostDialog';

const { Item } = Tab;
const Tooltip = Balloon.Tooltip;
const Option = Select.Option;

const { Colored: ColoredTag }: any = Tag;
const noop = () => { console.log(); };

function ExperimentDetail() {
  const dispatch = useDispatch();
  const history = useHistory();
  const experiment = useSelector(({ experimentDetail }) => experimentDetail.experiment);
  const reStartTaskId = useSelector(({ experimentTask }) => experimentTask.reStartTaskId);

  const [ currentId, setCurrentId ] = useState('');
  const [ currentNode, setCurrentNode ] = useState<INode | null>(null);
  const [ defaultRunMode, setDefaultRunMode ] = useState('');
  const [ activityEditorVisible, setActivityEditorVisible ] = useState(false);
  const [ startRender, setStartRender ] = useState(false);
  const [ hostsVisible, setHostsVisible ] = useState(false);
  const [ actionRecord, setActionRecord ] = useState({});
  const [ pageName, setPageName ] = useState('');
  const [ updateExperiment, setUpdateExperiment ] = useState(false); // 领取体验包后的数据更新
  const [ saveExperience, setSaveExperience ] = useState(false);

  const [ editHost, setEditHost ] = useState<any>(null);

  const { runLoading } = useSelector(state => {
    return {
      runLoading: state.loading.effects['experimentTask/runExperiment'],
    };
  });

  useEffect(() => {
    const parsed = parseQuery();
    if (!_.isEmpty(parsed)) {
      const { id: experimentId }: any = parsed;
      if (!_.isEmpty(experimentId)) {
        setCurrentId(experimentId);
        // clearExperiment()
        dispatch.pageHeader.setTitle('');
        (async function() {
          await dispatch.experimentDetail.getExperiment({ experimentId }, (experiment: IExperiment) => {
            if (!experiment) {
              dispatch.pageHeader.setTitle('演练详情');
              dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
                {
                  key: 'workspace',
                  value: '空间管理',
                  path: '/chaos/workspace/list',
                },
                {
                  key: 'experiment_detail',
                  value: '演练详情',
                  path: '/chaos/experiment/detail',
                },
              ]));
            } else {
              const { flowInfo: flow } = experiment;
              if (flow && flow.runMode) {
                setDefaultRunMode(flow.runMode!);
              } else if (flow && !flow.flowGroups) {
                pushUrl(history, '/chaos/experiment/edit');
                return;
              } else {
                pushUrl(history, '/chaos');
              }
              setStartRender(true);
            }
          });
        })();
      }
    }
  }, [ updateExperiment ]);

  useEffect(() => {
    const name = _.get(experiment, 'baseInfo.name', '');
    if (name) {
      setPageName(name);
      dispatch.pageHeader.setTitle(pageName);
      dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
        {
          key: 'workspace',
          value: '空间管理',
          path: '/chaos/workspace/list',
        },
        {
          key: 'experiment_detail',
          value: '演练详情',
          path: '/chaos/experiment/detail',
        },
      ]));
    }
    if (reStartTaskId) {
      dispatch.experimentTask.clearExperimentStartingResult();
      pushUrl(history, '/chaos/experiment/task', { id: reStartTaskId });
    }
  });

  function handleDecorateFlow(flow: IFlow) {
    if (!_.isEmpty(flow)) {
      // 不同阶段下的节点赋值stage，用于MiniFlowView区分节点
      _.forEach([ 'check', 'prepare', 'recover', 'attack' ], (stage: string) => {
        const nodes = flow[stage];
        if (!_.isEmpty(nodes)) {
          _.forEach(nodes, (node: INode) => {
            node.stage = stage;
          });
        }
      });
      return flow;
    }
    return null;
  }

  function functionDirectExperiment() {
    if (!_.isEmpty(experiment)) {
      const flowGroups = _.get(experiment, 'flow.flowGroups', []);
      if (!_.isEmpty(flowGroups)) {
        _.map(flowGroups, (fg: IFlowGroup) => {
          const flows = _.get(fg, 'flows', []);
          if (!_.isEmpty(flows)) {
            _.map(flows, (f: IFlow) => handleDecorateFlow(f));
          }
        });
      }
      return experiment;
    }
    return experiment;
  }

  function handleEditExperimentBaseInfo() {
    pushUrl(history, '/chaos/baseInfo/editor', {
      pass: 'detail',
    });
  }

  function handleHrefTask() {
    const taskId = _.get(experiment, 'baseInfo.experimentTaskId', '');
    pushUrl(history, '/chaos/experiment/task', { id: taskId });
  }

  // 演练资源包弹窗
  function handlePaidCheck() {
    handleStartExperiment();
  }

  function handleStartExperiment() {
    const flow = _.get(experiment, 'flow', {});
    const preCheckInfo = _.get(experiment, 'preCheckInfo', {});
    if (!_.isEmpty(flow)) {
      const experimentId = _.get(flow, 'experimentId', '');
      const state = _.get(flow, 'state', '');
      const taskId = _.get(flow, 'taskId', '');
      if (state.toUpperCase() === ExperimentConstants.EXPERIMENT_STATE_RUNNING) {
        Dialog.confirm({
          title: '当前演练正在执行',
          content: '当前演练正在执行，不能再次执行，是否要查看执行状态?',
          locale: {
            ok: '确定',
            cancel: '取消',
          },
          onOk: () => {
            pushUrl(history, '/chaos/experiment/task', { id: taskId });
          },
          onCancel: noop,
        });
      } else if (state.toUpperCase() === ExperimentConstants.EXPERIMENT_STATE_DRAFT) {
        Dialog.confirm({
          title: '演练未进行编排',
          content: '当前演练未进行流程编排，是否继续完成流程编排?',
          locale: {
            ok: '确定',
            cancel: '取消',
          },
          onOk: handleEditExperiment,
          onCancel: noop,
        });
      } else if (state.toUpperCase() === ExperimentConstants.EXPERIMENT_STATE_SYNC) {
        Dialog.confirm({
          title: '演练需重新编辑',
          content: '当前演练需要重新编辑后才能正常执行，是否进行编辑?',
          locale: {
            ok: '确定',
            cancel: '取消',
          },
          onOk: handleEditExperiment,
          onCancel: noop,
        });
      } else {
        if (preCheckInfo && preCheckInfo.opLevel === OPLEVEL.YELLOW) {
          const content = _.get(_.find(_.get(preCheckInfo, 'points', []), (p: any) => p.type === 0), 'content', '');
          Dialog.show({
            title: '开始执行演练',
            content: <Message type='warning' iconType='exclamation-circle'>
              <span>当前演练配置存在如下问题，可能会影响演练效果，是否继续演练？</span>
              <div style={{ color: '#333' }}>{content}</div>
            </Message>,
            style: { width: '20%' },
            locale: {
              ok: '确定',
              cancel: '取消',
            },
            onOk: () => {
              (async function() {
                await dispatch.experimentTask.runExperiment({ experimentId });
              })();
            },
            onCancel: noop,
          });
        } else {
          const startDialog = Dialog.alert({
            title: '开始执行演练?',
            style: {
              width: 560,
            },
            content: renderStartWaring(),
            footer: (<span>
              <Button onClick={() => { startDialog.hide(); }} style={{ marginRight: 8 }}>取消</Button>
              <Button
                type='primary'
                onClick={() => {
                  (async function() {
                    startDialog.hide();
                    await dispatch.experimentTask.runExperiment({ experimentId });
                  })();
                }}>确认</Button>
            </span>),
            onCancel: noop,
          });
        }
      }
    }
  }

  function renderStartWaring() {
    const experimentDetail = functionDirectExperiment();
    const experimentAppRisks = _.get(experimentDetail, 'experimentAppRisks', []);
    if (!_.isEmpty(experimentAppRisks)) {
      return <span>
        <p>演练开始后会对指定目标(主机等)进行故障注入等操作，可能会使目标(主机等)服务不可用，是否确认开始执行?</p>
        <span className={styles.warnContent}>
          <p>演练中包含的场景，可能会出现以下问题</p>
          <ul className={styles.tipsContent}>
            {_.map(experimentAppRisks, it => {
              return <li className={styles.startTipsList}><span>{it && it.appName}：</span>{it && it.message}</li>;
            })}
          </ul>
        </span>
      </span>;
    }
    return <p>演练开始后会对指定目标(主机等)进行故障注入等操作，可能会使目标(主机等)服务不可用，是否确认开始执行?</p>;
  }

  function renderHelpIcon() {
    const contentList = _.get(experiment, 'preCheckInfo.points', []);
    return <Balloon trigger={
      <div className={styles.disableHelp}>
        <Icon type="question-circle" />
      </div>
    } triggerType="click">
      {
        contentList.map((i: any) => <li className={styles.baoollnList}>{i && i.content}</li>)
      }
    </Balloon>;
  }

  function renderGroupName(value: string, index: number, record: any) {
    return <div className={styles.groupNameList} title={record.groupName}>{record.groupName}</div>;
  }

  function renderAboutHost(value: string, index: number, record: any) {
    const hosts = _.get(record, 'hosts', []);
    const selectType = _.get(record, 'selectType', 0);
    const errorHosts = _.filter(hosts, (h: IHost) => _.has(h, 'passed') && !h.passed);
    if (selectType === SELECT_TYPE.PERCENT) {
      const { hostPercent } = record;
      return <div>{hostPercent}%</div>;
    }
    return <span>
      <div>{hosts && hosts.length}个</div>
      {errorHosts.length > 0 && <div className={styles.errorTip}>异常：{errorHosts.length}个</div>}
    </span>;
  }

  function renderAction(value: string, index: number, record: any) {
    return <span className={styles.ableCheckAll} onClick={() => setEditHost(_.cloneDeep(record))}>编辑机器</span>;
  }

  function handleAbleCheckAll(record: any) {
    setHostsVisible(true);
    setActionRecord(record);
    renderAllIpsDialog(record);
  }

  function handleClose() {
    setHostsVisible(false);
    setActionRecord({});
  }

  function handleActivityEditorClose() {
    setCurrentNode(null);
    setActivityEditorVisible(false);
  }

  function handleEditExperiment() {
    dispatch.experimentEditor.setClearExperiment();
    pushUrl(history, '/chaos/experiment/editor', {
      id: currentId,
    });
  }

  const saveAsExperience = async () => {
    const { experimentId } = experiment || {};
    if (experimentId) {
      setSaveExperience(true);
      const res = await dispatch.experimentDetail.saveExperience({ experimentId });
      if (res) {
        Dialog.confirm({
          title: '温馨提示',
          content: '已成功保存为经验，是否前往经验库查看详情?',
          onOk: () => {
            pushUrl(history, '/chaos/expertise/detail', {
              expertiseId: res,
            });
            removeParams('id');
          },
        });
      }
      setSaveExperience(false);
    }
  };

  function handleNodeClick(node: INode | IActivity) {
    setCurrentNode(node as INode);
    setActivityEditorVisible(true);
  }

  function renderFlow() {
    const experimentDetail = functionDirectExperiment();
    const state = _.get(experimentDetail, 'baseInfo.state', '');
    const duration = _.get(experimentDetail, 'flow.duration', '');
    const observerNodes = experimentDetail && experimentDetail.observerNodes;
    const recoverNodes = experimentDetail && experimentDetail.recoverNodes;
    const flowGroups = _.get(experimentDetail, 'flow.flowGroups', []);
    const cronExpression = _.get(experimentDetail, 'flow.schedulerConfig.cronExpression', '未配置');
    const preCheckInfo = _.get(experimentDetail, 'preCheckInfo', {});
    const results = _.get(_.find(_.get(preCheckInfo, 'points', []), (p: IPoint) => p.type === 0), 'results', []);
    const flowGroupsInfo = hostPreCheck(flowGroups, results);
    const source = _.get(experimentDetail, 'baseInfo.source', 0);
    return <div>
      <div className={styles.actionContent}>
        <div className={styles.actionLeft}>
          {preCheckInfo && preCheckInfo.opLevel === OPLEVEL.RED && renderHelpIcon()}
          {state && state === ExperimentConstants.EXPERIMENT_STATE_RUNNING ?
            <Button type="primary" onClick={handleHrefTask}>
            演练中
              <Icon type="loading" />
            </Button> :
            <Button type="primary" loading={runLoading} onClick={handlePaidCheck} disabled={(preCheckInfo && preCheckInfo.opLevel === OPLEVEL.RED || !handleIsAdmin(experiment.permission as number, 4))}>
              演练
            </Button>}
          <Select
            className={styles.runOrder}
            value={defaultRunMode}
            disabled
          >
            <Option value="SEQUENCE">顺序执行</Option>
            <Option value="PHASE">阶段执行</Option>
          </Select>
        </div>
        <div style={{ float: 'right' }} >
          {source === 1 ? <Button type="primary" onClick={handleEditExperiment} >编辑演练</Button> :
            <Button type="primary" disabled={!handleIsAdmin(experiment.permission as number, 2)} onClick={handleEditExperiment}>编辑演练</Button>
          }
          &nbsp;&nbsp;
          <Button type="normal" loading={saveExperience} disabled={!handleIsAdmin(experiment.permission as number, 2)} onClick={() => saveAsExperience()}>保存为经验</Button>
        </div>
      </div>
      <div className={styles.detailView}>
        <div className={styles.detailLabel}>演练机器</div>
        <div className={styles.detailValue}>
          <Table
            dataSource={flowGroupsInfo as any}
            hasBorder={false}
          >
            <Table.Column title="分组编号" width={80} cell={(value: string, index: number) => (<span>分组{index + 1}</span>)} />
            <Table.Column title="分组名称" width="12.8%" cell={renderGroupName}/>
            <Table.Column title="涉及机器" width="10%" cell={renderAboutHost}/>
            <Table.Column title="机器IP" cell={renderIP} />
            <Table.Column title="操作" width="8%" cell={renderAction} />
          </Table>
        </div>
        <div className={styles.detailLabel}>演练流程</div>
        <div className={styles.detailValue}>
          {experiment && experiment.flow ?
            <MiniFlowView
              experiment={experiment}
              runMode={defaultRunMode}
              isExpertise={false}
              onNodeClick={handleNodeClick}
            /> : null}
        </div>
        <div className={styles.detailLabel}>监控策略</div>
        <div className={classnames(styles.detailValue, styles.nodeConfig)}>
          {
            observerNodes.length ? observerNodes.map(ob => {
              return <Node key={ob.id} data={ob} onClick={handleNodeClick} permission={experiment.permission}/>;
            }) : '无'
          }
        </div>
        <div className={styles.detailLabel}>恢复策略</div>
        <div className={classnames(styles.detailValue, styles.nodeConfig)}>
          {
            recoverNodes.length ? recoverNodes.map(re => {
              return <Node key={re.id} data={re} onClick={handleNodeClick} permission={experiment.permission}/>;
            }) : '无'
          }
        </div>
        <div className={styles.detailLabel}>自动恢复时间</div>
        <div className={styles.detailValue}>
          <NumberPicker
            className={styles.timeNumber}
            disabled
            value={ duration / 60 }
            precision={0}
            min={1}
          />
          <Select
            className={styles.timeUnitOption}
            disabled
            value="minute"
          >
            <Option value="minute">分钟</Option>
            <Option value="hour">小时</Option>
          </Select>
        </div>
        <div className={styles.detailLabel}>定时执行</div>
        <div className={styles.detailValue}>
          {cronExpression ? <span className={styles.inputExpression}>{cronExpression}</span> : '未配置'}
        </div>
      </div>
    </div>;
  }

  function renderHosts(value: string, index: number, record: any) {
    let label;
    if (record.scopeType === SCOPE_TYPE.HOST || record.app || record.scopeType === SCOPE_TYPE.CLOUD) {
      label = `${record.ip}[${record.deviceName}]`;
    } else {
      if (record && !_.isEmpty(record.clusterName)) {
        label = `[K8S] ${record.clusterName}`;
      } else {
        label = `[K8S] ${record.clusterId}`;
      }
    }
    return <span>{label}</span>;
  }

  function renderAllIpsDialog(record: any) {
    const hosts = record && record.hosts;
    return <Dialog
      title={`【${record && record.groupName}】涉及机器IP`}
      style={{ width: '50%', minHeight: 200 }}
      visible={hostsVisible}
      onClose={handleClose}
      footer={false}
    >
      <Table dataSource={hosts} hasBorder={false}>
        <Table.Column title="序号" cell={(value: string, index: number) => <span>{index + 1}</span>} />
        <Table.Column title="机器IP" cell={renderHosts}/>
        <Table.Column title="异常原因" dataIndex="content" cell={(value: string) => <span style={{ color: '#D93026' }}>{value}</span>}/>
      </Table>
    </Dialog>;
  }

  function renderIP(value: string, index: number, record: any) {
    const hosts = record && record.hosts;
    const tags = handleDealHosts(hosts);
    const selectType = record && record.selectType;

    if (selectType === SELECT_TYPE.PERCENT) {
      return <span>{[ `应用:${record.appName}${record.appGroups ? `,分组:${record.appGroups}` : ''}` ]}</span>;
    }

    if (tags.length && tags.length <= 4) {
      return renderTags(tags, record);
    }

    return <div>
      {renderTags(_.slice(tags, 0, 4), record)}
      <span className={styles.ableCheckAll} onClick={() => handleAbleCheckAll(record)} >查看全部</span>
    </div>;
  }

  function renderTags(tags: any[], record: any) {
    return (
      <div style={{ maxWidth: '720px' }}>
        {tags.map(t => {
          if (!_.has(t, 'passed') || (t && t.passed)) {
            if (t && t.content) {
              return <Tooltip trigger={
                <Tag key={t && t.deviceId} type="primary" size="small" className={styles.tagStyle} onClick={() => handleAbleCheckAll(record)}>
                  {t && t.label}{record.appId && [ `应用:${record.appName}${record.appGroups ? `,分组:${record.appGroups}` : ''}` ]}
                </Tag>
              } align="t">
                {t && t.content}
              </Tooltip>;
            }
            return <Tag key={t && t.deviceId} type="primary" size="small" className={styles.tagStyle} onClick={() => handleAbleCheckAll(record)}>
              {t && t.label}{record.appId && [ `应用:${record.appName}${record.appGroups ? `,分组:${record.appGroups}` : ''}` ]}
            </Tag>;
          }
          return <Tooltip trigger={
            <ColoredTag key={t && t.deviceId} type="misty-rose" size="small" className={styles.tagStyle} onClick={() => handleAbleCheckAll(record)}>
              {t && t.label}{record.appId && [ `应用:${record.appName}${record.appGroups ? `,分组:${record.appGroups}` : ''}` ]}
            </ColoredTag>
          } align="t">
            {t && t.content}
          </Tooltip>;

        })}
      </div>
    );
  }

  function handleDealHosts(hosts: IHost[]) {
    let label;
    const tags: IHost[] = [];
    hosts && _.map(hosts, (val: IHost) => {
      if (val.scopeType === SCOPE_TYPE.HOST || val.app || val.scopeType === SCOPE_TYPE.CLOUD) {
        label = `${val.ip}[${val.deviceName}]`;
      } else {
        if (val && !_.isEmpty(val.clusterName)) {
          label = `[K8S] ${val.clusterName}`;
        } else {
          label = `[K8S] ${val.clusterId}`;
        }
      }
      tags.push({
        ...val,
        label,
      });
    });
    return tags;
  }

  if (!startRender) {
    return null;
  }

  const onSubmitHost = async (data: any) => {
    const parsed = parseQuery();
    if (!_.isEmpty(parsed)) {
      const { id: experimentId }: any = parsed;
      data.experimentId = experimentId;
      data.miniGroupId = data.id;
      await dispatch.experimentDetail.UpdateExperimentHost(data);
      setUpdateExperiment(!updateExperiment);
    }
  };
  const { baseInfo } = experiment;
  return <div>
    <div>
      <div>
        <div className={styles.informationContainer}>
          {/* {renderBaseInfo()} */}
          <BaseInfoView baseInfo={baseInfo} onEditExperimentBaseInfo={handleEditExperimentBaseInfo} permission={experiment.permission}/>
          <div className={styles.tabButton}>
            <Tab className={styles.tabs} shape="wrapped">
              <Item title="配置">
                {renderFlow()}
              </Item>
              <Item title="演练记录">
                <ExperimentTaskHistory experimentId={currentId}/>
              </Item>
              <Item title="变更记录">
                <ExperimentChangeHistory experimentId={currentId}/>
              </Item>
            </Tab>
            <Button.Group className={styles.buttonGroup}>
            </Button.Group>
          </div>
        </div>
      </div>
    </div>
    {currentNode &&
      <ActivityEditor
        disabled
        readOnly
        isExpertise={false}
        visible={activityEditorVisible}
        data={currentNode!}
        onClose={handleActivityEditorClose}
      />
    }
    { hostsVisible && renderAllIpsDialog(actionRecord)}
    {editHost &&
      <CopyHostDialog
        visible={true}
        disableAppSel={true}
        data={editHost as IFlowGroup}
        onCloseCopy={() => setEditHost(null)}
        onSubmit={(data: any) => onSubmitHost(data)}
      />}
  </div>;
}

export default ExperimentDetail;
