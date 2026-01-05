import ActivityEditor from 'pages/Chaos/Experiment/common/ActivityEditor';
import BaseInfoView from 'pages/Chaos/common/BaseInfoView';
import ExperimentChangeHistory from './ExperimentChangeHistory';
import ExperimentTaskHistory from 'pages/Chaos/Experiment/common/ExperimentTaskHistory';
import MiniFlowView from 'pages/Chaos/common/MInFlowView';
import Node from 'pages/Chaos/common/Node';
import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import classnames from 'classnames';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
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
              dispatch.pageHeader.setTitle(i18n.t('Drill details').toString());
              dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
                {
                  key: 'workspace',
                  value: i18n.t('Space management').toString(),
                  path: '/chaos/workspace/list',
                },
                {
                  key: 'experiment_detail',
                  value: i18n.t('Drill details').toString(),
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
          value: i18n.t('Space management').toString(),
          path: '/chaos/workspace/list',
        },
        {
          key: 'experiment_detail',
          value: i18n.t('Drill details').toString(),
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
    const preCheckInfo = _.get(experiment, 'preCheckInfo', {}) as any;
    if (!_.isEmpty(flow)) {
      const experimentId = _.get(flow, 'experimentId', '');
      const state = _.get(flow, 'state', '');
      const taskId = _.get(flow, 'taskId', '');
      if (state.toUpperCase() === ExperimentConstants.EXPERIMENT_STATE_RUNNING) {
        Dialog.confirm({
          title: i18n.t('The current drill is running').toString(),
          content: i18n.t('The current drill is being executed and cannot be executed again. Do you want to check the execution status').toString(),
          locale: locale().Dialog,
          onOk: () => {
            pushUrl(history, '/chaos/experiment/task', { id: taskId });
          },
          onCancel: noop,
        });
      } else if (state.toUpperCase() === ExperimentConstants.EXPERIMENT_STATE_DRAFT) {
        Dialog.confirm({
          title: i18n.t('The drill is not choreographed').toString(),
          content: i18n.t('There is no process choreography for the current exercise. Do you want to continue to complete the process choreography').toString(),
          locale: locale().Dialog,
          onOk: handleEditExperiment,
          onCancel: noop,
        });
      } else if (state.toUpperCase() === ExperimentConstants.EXPERIMENT_STATE_SYNC) {
        Dialog.confirm({
          title: i18n.t('The drill needs to be re-edited').toString(),
          content: i18n.t('The current drill needs to be re-edited before it can be executed normally. Do you want to edit it').toString(),
          locale: locale().Dialog,
          onOk: handleEditExperiment,
          onCancel: noop,
        });
      } else {
        if (preCheckInfo && (preCheckInfo as any).opLevel === OPLEVEL.YELLOW) {
          const content = _.get(_.find(_.get(preCheckInfo, 'points', []), (p: any) => p.type === 0), 'content', '');
          Dialog.show({
            title: i18n.t('Start the exercise').toString(),
            content: <Message type='warning' iconType='exclamation-circle'>
              <span><Translation>The current exercise configuration has the following problems, which may affect the exercise effect. Do you want to continue the exercise</Translation></span>
              <div style={{ color: '#333' }}>{content}</div>
            </Message>,
            style: { width: '20%' },
            locale: locale().Dialog,
            onOk: () => {
              (async function() {
                await dispatch.experimentTask.runExperiment({ experimentId });
              })();
            },
            onCancel: noop,
          });
        } else {
          const startDialog = Dialog.alert({
            title: i18n.t('Start the exercise').toString(),
            style: {
              width: 560,
            },
            content: renderStartWaring(),
            footer: (<span>
              <Button onClick={() => { startDialog.hide(); }} style={{ marginRight: 8 }}><Translation>cancel</Translation></Button>
              <Button
                type='primary'
                onClick={() => {
                  (async function() {
                    startDialog.hide();
                    await dispatch.experimentTask.runExperiment({ experimentId });
                  })();
                }}><Translation>Confirm</Translation></Button>
            </span>),
            onCancel: noop,
            locale: locale().Dialog,
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
        <p><Translation>After the drill starts, operations such as fault injection will be performed on the specified target (host, etc.), which may make the target (host, etc.) service unavailable. Are you sure to start the execution</Translation></p>
        <span className={styles.warnContent}>
          <p><Translation>Scenarios included in the walkthrough, the following issues may arise</Translation></p>
          <ul className={styles.tipsContent}>
            {_.map(experimentAppRisks, it => {
              return <li className={styles.startTipsList}><span>{it && it.appName}：</span>{it && it.message}</li>;
            })}
          </ul>
        </span>
      </span>;
    }
    return <p><Translation>After the drill starts, operations such as fault injection will be performed on the specified target (host, etc.), which may make the target (host, etc.) service unavailable. Are you sure to start the execution</Translation></p>;
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

  const renderGroupName: any = (value: string, index: number, record: any) => {
    return <div className={styles.groupNameList} title={record.groupName}>{record.groupName}</div>;
  };

  const renderAboutHost: any = (value: string, index: number, record: any) => {
    const hosts = _.get(record, 'hosts', []);
    const selectType = _.get(record, 'selectType', 0);
    const errorHosts = _.filter(hosts, (h: IHost) => _.has(h, 'passed') && !h.passed);
    if (selectType === SELECT_TYPE.PERCENT) {
      const { hostPercent } = record;
      return <div>{hostPercent}%</div>;
    }
    return <span>
      <div>{hosts && hosts.length}<Translation>Indivual</Translation></div>
      {errorHosts.length > 0 && <div className={styles.errorTip}><Translation>Abnormal</Translation>:{errorHosts.length}<Translation>Indivual</Translation></div>}
    </span>;
  };

  const renderAction: any = (value: string, index: number, record: any) => {
    return <span className={styles.ableCheckAll} onClick={() => setEditHost(_.cloneDeep(record))}><Translation>Editing machine</Translation></span>;
  };

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
          title: i18n.t('Tips').toString(),
          content: i18n.t('It has been successfully saved as an experience. Do you want to go to the experience library to view the details').toString(),
          onOk: () => {
            pushUrl(history, '/chaos/expertise/detail', {
              expertiseId: res,
            });
            removeParams('id');
          },
          locale: locale().Dialog,
        });
      }
      setSaveExperience(false);
    }
  };

  function handleNodeClick(node: INode | IActivity) {
    setCurrentNode(node as INode);
    setActivityEditorVisible(true);
  }
  const renderGroupNum: any = (value: string, index: number) => <span><Translation>Group</Translation>{index + 1}</span>;

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
          {preCheckInfo && (preCheckInfo as any).opLevel === OPLEVEL.RED && renderHelpIcon()}
          {state && state === ExperimentConstants.EXPERIMENT_STATE_RUNNING ?
            <Button type="primary" onClick={handleHrefTask}>
              <Translation>In drill</Translation>
              <Icon type="loading" />
            </Button> :
            <Button type="primary" loading={runLoading} onClick={handlePaidCheck} disabled={((preCheckInfo && (preCheckInfo as any).opLevel === OPLEVEL.RED) || !handleIsAdmin(experiment.permission as number, 4))}>
              <Translation>Drill</Translation>
            </Button>}
          <Select
            className={styles.runOrder}
            value={defaultRunMode}
            disabled
            locale={locale().Select}
          >
            <Option value="SEQUENCE"><Translation>Sequential execution</Translation></Option>
            <Option value="PHASE"><Translation>Stage execution</Translation></Option>
          </Select>
        </div>
        <div style={{ float: 'right' }} >
          {Number(source) === 1 ? <Button type="primary" onClick={handleEditExperiment} ><Translation>Editing Walkthrough</Translation></Button> :
            <Button type="primary" disabled={!handleIsAdmin(experiment.permission as number, 2)} onClick={handleEditExperiment}><Translation>Editing Walkthrough</Translation></Button>
          }
          &nbsp;&nbsp;
          <Button type="normal" loading={saveExperience} disabled={!handleIsAdmin(experiment.permission as number, 2)} onClick={() => saveAsExperience()}><Translation>Save as experience</Translation></Button>
        </div>
      </div>
      <div className={styles.detailView}>
        <div className={styles.detailLabel}><Translation>Drill machine</Translation></div>
        <div className={styles.detailValue}>
          <Table
            dataSource={flowGroupsInfo as any}
            hasBorder={false}
            locale={locale().Table}
          >
            <Table.Column title={i18n.t('Group number').toString()} width={80} cell={renderGroupNum} />
            <Table.Column title={i18n.t('Group Name').toString()} width="12.8%" cell={renderGroupName}/>
            <Table.Column title={i18n.t('Involving machines').toString()} width="10%" cell={renderAboutHost}/>
            <Table.Column title={i18n.t('Machine IP').toString()} cell={renderIP} />
            <Table.Column title={i18n.t('Operation').toString()} width="8%" cell={renderAction} />
          </Table>
        </div>
        <div className={styles.detailLabel}><Translation>Exercise process</Translation></div>
        <div className={styles.detailValue}>
          {experiment && experiment.flow ?
            <MiniFlowView
              experiment={experiment}
              runMode={defaultRunMode}
              isExpertise={false}
              onNodeClick={handleNodeClick}
            /> : null}
        </div>
        <div className={styles.detailLabel}><Translation>Monitoring strategy</Translation></div>
        <div className={classnames(styles.detailValue, styles.nodeConfig)}>
          {
            observerNodes.length ? observerNodes.map(ob => {
              return <Node key={ob.id} data={ob} onClick={handleNodeClick} permission={experiment.permission}/>;
            }) : <Translation>None</Translation>
          }
        </div>
        <div className={styles.detailLabel}><Translation>Recovery strategy</Translation></div>
        <div className={classnames(styles.detailValue, styles.nodeConfig)}>
          {
            recoverNodes.length ? recoverNodes.map(re => {
              return <Node key={re.id} data={re} onClick={handleNodeClick} permission={experiment.permission}/>;
            }) : <Translation>None</Translation>
          }
        </div>
        <div className={styles.detailLabel}><Translation>Auto recovery time</Translation></div>
        <div className={styles.detailValue}>
          <NumberPicker
            className={styles.timeNumber}
            disabled
            value={ Number(duration) / 60 }
            precision={0}
            min={1}
          />
          <Select
            className={styles.timeUnitOption}
            disabled
            value="minute"
            locale={locale().Select}
          >
            <Option value="minute"><Translation>Minute</Translation></Option>
            <Option value="hour"><Translation>Hour</Translation></Option>
          </Select>
        </div>
        <div className={styles.detailLabel}><Translation>Timed execution</Translation></div>
        <div className={styles.detailValue}>
          {cronExpression ? <span className={styles.inputExpression}>{cronExpression}</span> : <Translation>Not configured</Translation>}
        </div>
      </div>
    </div>;
  }

  const renderHosts: any = (value: string, index: number, record: any) => {
    let label;
    if (record.scopeType === SCOPE_TYPE.HOST || record.app) {
      label = `${record.ip}[${record.deviceName}]`;
    } else {
      if (record && !_.isEmpty(record.clusterName)) {
        label = `[K8S] ${record.clusterName}`;
      } else {
        label = `[K8S] ${record.clusterId}`;
      }
    }
    return <span>{label}</span>;
  };
  const renderReason: any = (value: string) => <span style={{ color: '#D93026' }}>{value}</span>;
  const renderNo: any = (value: string, index: number) => <span>{index + 1}</span>;

  function renderAllIpsDialog(record: any) {
    const hosts = record && record.hosts;
    return <Dialog
      title={`【${record && record.groupName}】${i18n.t('Involving machine IP')}`}
      style={{ width: '50%', minHeight: 200 }}
      visible={hostsVisible}
      onClose={handleClose}
      footer={false}
      locale={locale().Dialog}
    >
      <Table dataSource={hosts} hasBorder={false}>
        <Table.Column title={i18n.t('Serial number').toString()} cell={renderNo} />
        <Table.Column title={i18n.t('Machine IP').toString()} cell={renderHosts}/>
        <Table.Column title={i18n.t('Abnormal reason').toString()} dataIndex="content" cell={renderReason}/>
      </Table>
    </Dialog>;
  }

  const renderIP: any = (value: string, index: number, record: any) => {
    const hosts = record && record.hosts;
    const tags = handleDealHosts(hosts);
    const selectType = record && record.selectType;

    if (selectType === SELECT_TYPE.PERCENT) {
      return <span>{[ `${i18n.t('Application').toString()}:${record.appName}${record.appGroups ? `,${i18n.t('Group').toString()}:${record.appGroups}` : ''}` ]}</span>;
    }

    if (tags.length && tags.length <= 4) {
      return renderTags(tags, record);
    }

    return <div>
      {renderTags(_.slice(tags, 0, 4), record)}
      <span className={styles.ableCheckAll} onClick={() => handleAbleCheckAll(record)} ><Translation>View all</Translation></span>
    </div>;
  };

  function renderTags(tags: any[], record: any) {
    return (
      <div style={{ maxWidth: '720px' }}>
        {tags.map(t => {
          if (!_.has(t, 'passed') || (t && t.passed)) {
            if (t && t.content) {
              return <Tooltip trigger={
                <Tag key={t && t.deviceId} type="primary" size="small" className={styles.tagStyle} onClick={() => handleAbleCheckAll(record)}>
                  {t && t.label}{record.appId && [ `${i18n.t('Application').toString()}:${record.appName}${record.appGroups ? `,${i18n.t('Group').toString()}:${record.appGroups}` : ''}` ]}
                </Tag>
              } align="t">
                {t && t.content}
              </Tooltip>;
            }
            return <Tag key={t && t.deviceId} type="primary" size="small" className={styles.tagStyle} onClick={() => handleAbleCheckAll(record)}>
              {t && t.label}{record.appId && [ `${i18n.t('Application').toString()}:${record.appName}${record.appGroups ? `,${i18n.t('Group').toString()}:${record.appGroups}` : ''}` ]}
            </Tag>;
          }
          return <Tooltip trigger={
            <ColoredTag key={t && t.deviceId} type="misty-rose" size="small" className={styles.tagStyle} onClick={() => handleAbleCheckAll(record)}>
              {t && t.label}{record.appId && [ `${i18n.t('Application').toString()}:${record.appName}${record.appGroups ? `,${i18n.t('Group').toString()}:${record.appGroups}` : ''}` ]}
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
      if (val.scopeType === SCOPE_TYPE.HOST || val.app) {
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
              <Item title={i18n.t('Configure').toString()}>
                {renderFlow()}
              </Item>
              <Item title={i18n.t('Exercise record').toString()}>
                <ExperimentTaskHistory experimentId={currentId}/>
              </Item>
              <Item title={i18n.t('Change log').toString()}>
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
