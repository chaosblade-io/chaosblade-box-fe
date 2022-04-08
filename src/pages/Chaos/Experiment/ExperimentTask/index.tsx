import Chart from './Chart';
import DialogFrom from 'pages/Chaos/Experiment/common/DialogFrom';
import FeedBack from 'pages/Chaos/Experiment/common/FeedBack';
import React, { useEffect, useState } from 'react';
import TaskBasic from './TaskBasic';
import TaskFlow from './TaskFlow';
import TaskInfo from './TaskInfo';
import _ from 'lodash';
import formatDate from 'pages/Chaos/lib/DateUtil';
import styles from './index.css';
import { Button, Dialog, Icon, Message, Table } from '@alicloud/console-components';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IActivity, IExperimentTask, IMetrics, IStrategies, IToleranceValue } from 'config/interfaces/Chaos/experimentTask';
import { IField, ITolerance } from 'config/interfaces/Chaos/experiment';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { handleIsAdmin } from 'pages/Chaos/lib/BetaFlag';
import { parseQuery, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const noop = () => { console.log(); };

export default function ExperimentTask() {
  const dispatch = useDispatch();
  const history = useHistory();
  let worker: NodeJS.Timeout;

  // const logs = useSelector(({ experimentTask }) => experimentTask.logs);
  const dependenceSubmit = useSelector(({ experimentTask }) => experimentTask.dependenceSubmit);
  const reStartTaskId = useSelector(({ experimentTask }) => experimentTask.reStartTaskId);
  const stopResult = useSelector(({ experimentTask }) => experimentTask.stopResult);
  const loading = useSelector(state => state.loading.effects['experimentTask/retryActivityTask']);

  const [ autoRefresh, setAutoRefresh ] = useState(false);
  const [ experimentTask, setExperimentTask ] = useState<IExperimentTask | null>(null);
  const [ activity, setActivity ] = useState<null | IActivity>(null); // 目前进行中的节点
  // const [ activityId, setActivityId ] = useState(''); // 目前进行中的节点id
  const [ activityTask, setActivityTask ] = useState(null);// 节点详情，QueryActivityTask请求返回
  const [ activityTaskParamer, setActivityTaskParamer ] = useState(null);// 节点参数
  const [ metrics, setMetrics ] = useState<IMetrics[]>([]); // 图表数据
  const [ strategies, setStrategies ] = useState([]); // 保护策略
  const [ visibleLoadingZero, setVisibleLoadingZero ] = useState(false);
  const [ visibleLoadingOne, setVisibleLoadingOne ] = useState(false);
  const [ visibleLoadingTwo, setVisibleLoadingTwo ] = useState(false);
  const [ visibleLoadingThree, setVisibleLoadingThree ] = useState(false);
  const [ visibleLoadingFour, setVisibleLoadingFour ] = useState(false);
  const [ visibleLoadingFive, setVisibleLoadingFive ] = useState(false);
  const [ visibleLoadingSix, setVisibleLoadingSix ] = useState(false);
  const [ visibleLoadingSeven, setVisibleLoadingSeven ] = useState(false);
  const [ chartMetric, setChartMetric ] = useState(null); // 选中节点执行动态图表数据
  const [ strategiesVisible, setStrategiesVisible ] = useState(false);
  const [ strategiesDetail, setStrategiesDetail ] = useState<null | IStrategies>(null); // 恢复策略操作数据；
  const [ isFinishedTsk, setIsFinishedTsk ] = useState(false); // 流程是否完成；
  const [ isLoop, setIsLoop ] = useState(false); // 是否循环
  // const [ isLoading, setIsLoading ] = useState(true); // 流程部分loading效果
  const [ dependenceVisible, setDependenceVisible ] = useState(false); // 是否循环
  const [ feedBackReturn, setFeedBackReturn ] = useState({}); // 反馈提交成功后刷新数据，用于页面展示
  const [ isFeedbackStatus, setIsFeedbackStatus ] = useState(false);
  const [ currentActivity, setCurrentActivity ] = useState<any>(null); // 选择查看的节点

  const { reRunLoading } = useSelector(state => {
    return {
      reRunLoading: state.loading.effects['experimentTask/runExperiment'],
    };
  });

  useEffect(() => {
    if (_.isBoolean(stopResult) && !stopResult) {
      dispatch.experimentTask.clearTasksStopResult();
      Message.error('停止演练失败！');
    }
    if (reStartTaskId) {
      dispatch.experimentTask.clearExperimentStartingResult();
      pushUrl(history, '/chaos/experiment/task', { id: reStartTaskId });
      (async function() {
        await dispatch.experimentTask.getExperimentTask({ taskId: reStartTaskId }, (taskRes: any) => {
          const { feedbackStatus, state } = taskRes || {};
          !_.isEmpty(taskRes) && setExperimentTask(taskRes);
          if (state === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
            setIsLoop(false);
            (async function() {
              await dispatch.experimentTask.getExperimentTaskFeedback({ taskId: reStartTaskId });
            })();
            if (!feedbackStatus) {
              setDependenceVisible(true);
            }
          }
          if (taskRes && taskRes.activities) {
            const activityTaskId = !_.isEmpty(taskRes.activities) && taskRes.activities[0].activityTaskId;
            setActivity(!_.isEmpty(taskRes.activities) && taskRes.activities[0]);
            getActivityTaskInfo(activityTaskId);
            (async function() {
              await dispatch.experimentTask.getTaskMetric({ activityTaskId }, (taskMetric: any) => {
                if (!_.isEmpty(taskMetric)) {
                  setChartMetric(taskMetric);
                }
              });
            })();
          }
        });
      })();
      getTaskGuardInfo(reStartTaskId);
      const activityTaskId = _.get(activity, 'activityTaskId', '');
      (async function() {
        await dispatch.experimentTask.getTaskMetric({ activityTaskId }, (metricRes: any) => {
          setChartMetric(metricRes);
        });
      })();
    }
  });

  const getActivityTaskInfo = async (activityId: string, isParams?: boolean) => {
    await dispatch.experimentTask.getActivityTask({ activityTaskId: activityId }, (activityTask: any) => {
      if (!_.isEmpty(activityTask)) {
        setActivityTask(activityTask);
        if (isParams) {
          setActivityTaskParamer(activityTask);
        }
      }
    });
  };

  const getTaskGuardInfo = async (taskId: string) => {
    await dispatch.experimentTask.getExperiementTaskGuardInfo({ taskId }, (guardRes: any) => {
      if (!_.isEmpty(guardRes)) {
        setMetrics(guardRes && guardRes.metrics);
        setStrategies(guardRes && guardRes.strategies);
      }
    });
  };

  useEffect(() => {
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'workspace',
        value: '空间管理',
        path: '/chaos/workspace/list',
      },
      {
        key: 'experiment_task',
        value: '演练记录详情',
        path: '/chaos/experiment/task',
      },
    ]));

    const taskId = getTaskId();
    if (!_.isEmpty(taskId)) {
      (async function() {
        await dispatch.experimentTask.getExperimentTask({ taskId }, (taskRes: any) => {
          !taskRes && setIsLoop(false);
          const { feedbackStatus, state } = taskRes || {};
          !_.isEmpty(taskRes) && setExperimentTask(taskRes);
          if (state === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
            setIsLoop(false);
            (async function() {
              await dispatch.experimentTask.getExperimentTaskFeedback({ taskId });
            })();
            if (!feedbackStatus) {
              setDependenceVisible(true);
            }
          }
          if (taskRes && taskRes.activities) {
            const activityTaskId = !_.isEmpty(taskRes.activities) && taskRes.activities[0].activityTaskId;
            setActivity(!_.isEmpty(taskRes.activities) && taskRes.activities[0]);
            getActivityTaskInfo(activityTaskId);
            (async function() {
              await dispatch.experimentTask.getTaskMetric({ activityTaskId }, (taskMetric: any) => {
                if (!_.isEmpty(taskMetric)) {
                  setChartMetric(taskMetric);
                }
              });
            })();
          } else {
            if (taskRes && taskRes.code) {
              setIsLoop(false);
              // setIsLoading(false);
            }
          }
        });
      })();
      getTaskGuardInfo(taskId);
    }
  }, []);

  useEffect(() => {
    const isStopping = getIsTaskStopping(experimentTask) || false;
    const isFinished = getIsTaskFinished(experimentTask);
    if (!_.isEmpty(experimentTask)) {
      dispatch.pageHeader.setTitle(experimentTask!.experimentName);
      dispatch.pageHeader.setHeaderExtra(
        <Button.Group style={{ float: 'right' }}>
          <Button type="normal" loading={reRunLoading} disabled={(!isFinished || !handleIsAdmin(experimentTask?.permission as number, 4))} onClick={handleRestartTask}>重新执行</Button>
          <Button type="primary" className={styles.buttonSecond} onClick={handleCheckDetail}>查看详情</Button>
          {!isFinished && <Button type="primary" disabled={(isStopping || !handleIsAdmin(experimentTask?.permission as number, 4))} warning={!isStopping} onClick={handleStopTask}>{isStopping ? '停止中' : '终止'}</Button>}
        </Button.Group>,
      );
    }

    if (!_.isEmpty(experimentTask) && getIsTaskFinished(experimentTask)) {
      if (autoRefresh) {
        handleStopRefresh();
      }

      if (!isFinishedTsk) {
        setIsFinishedTsk(true);
      }
    } else {
      if (!autoRefresh) {
        setAutoRefresh(true);
        setIsLoop(true);
      }
    }
  });

  useEffect(() => {
    if (isLoop) {
      handleLoop();
    }
    return () => {
      if (worker) {
        clearTimeout(worker);
      }
    };
  }, [ autoRefresh, isLoop, currentActivity ]);

  function handleLoop() {
    let activityTaskId;
    const taskId = getTaskId();
    (async function() {
      await dispatch.experimentTask.getExperimentTask({ taskId }, (taskRes: any) => {
        const { feedbackStatus, state } = taskRes || {};
        !_.isEmpty(taskRes) && setExperimentTask(taskRes);
        if (state === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
          (async function() {
            await dispatch.experimentTask.getExperimentTaskFeedback({ taskId }, (res: any) => {
              !_.isEmpty(res) && setFeedBackReturn(res);
            });
          })();
          if (!feedbackStatus) {
            setDependenceVisible(true);
          }
        }
        if (taskRes && taskRes.activities) {
          if (taskRes.activities[0].state === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
            if (currentActivity) {
              activityTaskId = currentActivity && currentActivity.activityTaskId;
            } else {
              activityTaskId = !_.isEmpty(taskRes.activities) && taskRes.activities[0].activityTaskId;
            }
            getActivityTaskInfo(activityTaskId);
          }
        }
      });
    })();
    getTaskGuardInfo(taskId);
    if (worker) clearTimeout(worker);
    if (!isLoop) return;
    worker = setTimeout(() => {
      handleLoop();
    }, 3000);
  }


  function handleRestartTask() {
    const taskId = getTaskId();
    if (!_.isEmpty(experimentTask) && getIsTaskFinished(experimentTask)) {
      const experimentId = _.get(experimentTask, 'experimentId', '');
      if (!_.isEmpty(experimentId)) {
        (async function() {
          await dispatch.experimentTask.runExperiment({ experimentId });
        })();
        getTaskGuardInfo(taskId);
      }
    }
  }

  function handleCheckDetail() {
    const experimentId = _.get(experimentTask, 'experimentId', '');
    if (!_.isEmpty(experimentId)) {
      pushUrl(history, '/chaos/experiment/detail', { id: experimentId });
    }
  }

  function handleStopTask() {
    if (!_.isEmpty(experimentTask)) {
      if (getIsTaskStopping(experimentTask)) {
        Dialog.alert({
          title: '重复操作提醒',
          content: '当前演练正在停止中，请勿重复操作！',
          onOk: noop,
        });
      } else {
        Dialog.confirm({
          title: '停止演练',
          content: '是否停止当前正在执行的演练？',
          locale: {
            ok: '确定',
            cancel: '取消',
          },
          onOk: () => {
            const taskId = getTaskId();
            (async function() {
              await dispatch.experimentTask.stopExperimentTask({ taskId });
            })();
            // stopExperimentTask(taskId);
          },
          onCancel: noop,
        });
      }
    }
  }

  function handleStopRefresh() {
    clearTimeout(worker);
    setAutoRefresh(false);
    setIsLoop(false);
  }

  function getTaskId() {
    const parsed = parseQuery();
    const { id } = parsed;
    return id;
  }

  function getIsTaskFinished(task: any) {
    if (!_.isEmpty(task)) {
      const { state: status } = task;
      return status === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED;
    }
    return false;
  }

  function getIsTaskStopping(task: any) {
    if (!_.isEmpty(task)) {
      const { state: status } = task;
      return status === ExperimentConstants.EXPERIMENT_TASK_STATE_STOPPING;
    }
    return false;
  }

  function handleUpdateChart(upData: IMetrics, upId: number) {
    switch (upId) {
      case 0:
        setVisibleLoadingZero(true);
        break;
      case 1:
        setVisibleLoadingOne(true);
        break;
      case 2:
        setVisibleLoadingTwo(true);
        break;
      case 3:
        setVisibleLoadingThree(true);
        break;
      case 4:
        setVisibleLoadingFour(true);
        break;
      case 5:
        setVisibleLoadingFive(true);
        break;
      case 6:
        setVisibleLoadingSix(true);
        break;
      case 7:
        setVisibleLoadingSeven(true);
        break;
      default:
        break;
    }
    const taskId = getTaskId();
    (async function() {
      await dispatch.experimentTask.getExperiementTaskGuardInfo({ taskId }, (guardRes: any) => {
        if (!_.isEmpty(guardRes)) {
          guardRes && guardRes.metrics.forEach((it: IMetrics) => {
            if (it.guardId === upData.guardId) {
              metrics.forEach((me: any, idx: any) => {
                if (me.guardId === it.guardId) {
                  metrics[idx] = it;
                }
              });
            }
          });
          setMetrics(metrics);
          setVisibleLoadingZero(false);
          setVisibleLoadingOne(false);
          setVisibleLoadingTwo(false);
          setVisibleLoadingThree(false);
          setVisibleLoadingFour(false);
          setVisibleLoadingFive(false);
          setVisibleLoadingSix(false);
          setVisibleLoadingSeven(false);
        }
      });
    })();
  }

  function handleMoreShow() {
    setStrategiesVisible(true);
  }

  function renderMoreDialog() {
    const fields = _.get(strategiesDetail, 'fields', []) as IField[];
    const tolerance = _.get(strategiesDetail, 'tolerance', []) as ITolerance[];
    return (
      <div>
        <div className={styles.showStrategy}>规则</div>
        <div className={styles.showRules}>
          {!_.isEmpty(fields) && fields.map((item: IField, idx: number) => {
            const operator = _.findKey(item as any, (i: boolean) => i === true);
            let operatorLabel;
            if (operator === 'and') {
              operatorLabel = '且';
            } else {
              operatorLabel = '或';
            }
            return <span>
              {item.name}{item.operation && item.operation.label! + item.value + item.unit}
              &nbsp;&nbsp;{idx < fields.length - 1 ? operatorLabel : ''}&nbsp;&nbsp;
            </span>;
          })}
        </div>
        <div className={styles.showStrategy}>恢复策略</div>
        <div className={styles.showTolerance}>
          {!_.isEmpty(tolerance) && tolerance.map((tole: ITolerance) => {
            return <div className={styles.tolerance}>{tole.name}&nbsp;&nbsp;{tole.value + tole.unit}</div>;
          })}
        </div>
      </div>
    );
  }

  const renderAction: any = (value: any, index: number, record: any) => {
    setStrategiesDetail(record);
    return <span className={styles.ruleDetail} onClick={handleMoreShow}>规则详情</span>;
  };

  const renderIcon: any = (value: string) => {
    if (value === 'RUNNING' || value === 'READY') {
      return <div className={styles.iconContent}>
        <div className={styles.circle}></div>
        <img src='https://img.alicdn.com/tfs/TB1znK5VRr0gK0jSZFnXXbRRXXa-14-16.svg' className={styles.svg}/>
      </div>;
    }
    if (value === 'TRIGGERED') {
      return <div className={styles.triggered}>
        <Icon type='warning' className={styles.svgFail}/>
        <div>自动终止</div>
      </div>;
    }
    if (value === 'FINISHED') {
      return <div className={styles.iconContent}>
        <div className={styles.circleStill}></div>
        <img src='https://img.alicdn.com/tfs/TB1znK5VRr0gK0jSZFnXXbRRXXa-14-16.svg' className={styles.svg}/>
      </div>;
    }
  };

  const renderDetail: any = (value: any, index: number, record: any) => {
    const { tolerance = [] } = record;
    return !_.isEmpty(tolerance) && tolerance.map((tole: IToleranceValue, idx: number) => {
      return <span className={styles.tolerance}>{tole.name}{tole.value + tole.unit}{idx !== tolerance.length - 1 ? '；' : null }</span>;
    });
  };

  function handleActivitedNode(node: IActivity) {
    setActivity(node);
    setCurrentActivity(node);
    const activityTaskId = node.activityTaskId;

    getActivityTaskInfo(activityTaskId, true);

    (async function() {
      await dispatch.experimentTask.getTaskMetric({ activityTaskId }, (metricRes: any) => {
        setChartMetric(metricRes);
      });
    })();
  }

  function renderDialogFooter() {
    const source = _.get(experimentTask, 'source', '');
    if (source === 1) {
      return <Button.Group>
        <Button type="primary" onClick={() => handleSubmitFeebBack(true)}>确定，返回强弱依赖治理</Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => handleSubmitFeebBack(false)}>确定，留在本页</Button>
      </Button.Group>;
    }
    if (source === 2) {
      return <Button.Group>
        <Button type="primary" onClick={() => handleSubmitFeebBack(true)}>确定，返回消息演练</Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => handleSubmitFeebBack(false)}>确定，留在本页</Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => setDependenceVisible(false)}>取消，下次反馈</Button>
      </Button.Group>;
    }
    if (source === 3) {
      return <Button.Group>
        <Button type="primary" onClick={() => handleSubmitFeebBack(true)}>确定，返回容灾演练</Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => handleSubmitFeebBack(false)}>确定，留在本页</Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => setDependenceVisible(false)}>取消，下次反馈</Button>
      </Button.Group>;
    }
    return <Button.Group>
      <Button type="primary" onClick={() => handleSubmitFeebBack(true)}>确定</Button>
      <Button type="normal" className={styles.normalBtn} onClick={() => setDependenceVisible(false)}>稍后反馈</Button>
    </Button.Group>;
  }

  function handleSubmitFeebBack(isHref: boolean) {
    // const { dependenceSubmit, submitExperimentTaskFeedback } = this.props;
    const taskId = getTaskId();
    (async function() {
      await dispatch.experimentTask.submitExperimentTaskFeedback({
        feedback: dependenceSubmit,
        taskId,
      }, (submitRes: any) => {
        setDependenceVisible(false);
        if (!_.isEmpty(submitRes)) {
          if (isHref && (submitRes.source === 1 || submitRes.source === 2 || submitRes.source === 3)) {
            window.location.href = submitRes.redirectUrl;
          } else {
            Message.success('反馈成功！');
            (async function() {
              await dispatch.experimentTask.getExperimentTaskFeedback({ taskId }, res => {
                !_.isEmpty(res) && setFeedBackReturn(res);
                !_.isEmpty(res) && setIsFeedbackStatus(true);
              });
            })();
          }
        }
      });
    })();
  }

  function handleSpecialDomChange(data: any) {
    dispatch.experimentTask.setExtraChange(data);
  }

  function renderSpecialDom() {
    return <div className={styles.specialDom}>
      <FeedBack data={dependenceSubmit} onSpecialDomChange={handleSpecialDomChange}/>
    </div>;
  }

  function handleFormChange(data: any) {
    dispatch.experimentTask.setFeedBackChange(data);
  }

  function renderItemValue(item: any) {
    const value = _.get(item, 'value', '');
    const itemOptions = _.get(item, 'format.options');
    if (itemOptions) {
      return _.find(itemOptions, (i: any) => i.key === value) && _.find(itemOptions, (i: any) => i.key === value).value;
    }
    return value;
  }

  // 节点中 重试 按钮
  function handleActivitedNodeTryAgain(node: IActivity, callBack: (res: any) => void) {
    const taskId = getTaskId();
    const activityTaskId = node.activityTaskId;
    if (!_.isEmpty(node)) {
      (async function() {
        await dispatch.experimentTask.retryActivityTask({ activityTaskId }, (taskActivity: any) => {
          callBack(taskActivity);
          if (taskActivity) {
            if (taskActivity && taskActivity.success) {
              (async function() {
                await dispatch.experimentTask.getExperimentTask({ taskId }, (taskRes: any) => {
                  setActivity(!_.isEmpty(taskRes.activities) && taskRes.activities[0]);
                });
              })();
            }
          }
        });
      })();
    }
  }
  // 节点中 继续 按钮
  function handleUserCheck(checked: boolean, node: IActivity, callBack: (res: any) => void) {
    const activityTaskId = node.activityTaskId;
    (async function() {
      await dispatch.experimentTask.userCheckActivityTask({ activityTaskId, success: checked }, callBack);
    })();
  }
  const renderName: any = (val: string) => {
    return `保护${val}`;
  };

  const source = _.get(experimentTask, 'source', '');
  const feedbackStatus = _.get(experimentTask, 'feedbackStatus', 0);
  const expectationStatus = _.get(feedBackReturn, 'expectationStatus', 0);
  const businessStatus = _.get(feedBackReturn, 'businessStatus', 0);
  const memo = _.get(feedBackReturn, 'memo', '');
  const options = _.get(feedBackReturn, 'extra.options', []);
  const extInfo = _.get(experimentTask, 'extInfo', {});

  const startTime = _.get(activityTask, 'startTime', '');
  const endTime = _.get(activityTask, 'endTime', '');
  return <div className={styles.warper}>
    <TaskBasic data={experimentTask!} scheduler={extInfo}/>
    <div className={styles.charts}>
      {/* {stableScoreData && Object.keys(stableScoreData).map((key: string) => {
        const datas = stableScoreData[key];
        return <Chart
          className={styles.stableChart}
          data={{
            data: datas,
            yName: 'score',
            name: `[${key}稳态度量]系统稳定性分析`,
          }}
          update={handleUpdateChart}
          loadingVisible={visibleLoadingStable}
          id={-1} />;
      })} */}
      { !_.isEmpty(metrics) &&
        <>
          <Chart data={metrics[0]} update={handleUpdateChart} loadingVisible={visibleLoadingZero} id={0}/>
          <Chart data={metrics[1]} update={handleUpdateChart} loadingVisible={visibleLoadingOne} id={1}/>
          <Chart data={metrics[2]} update={handleUpdateChart} loadingVisible={visibleLoadingTwo} id={2}/>
          <Chart data={metrics[3]} update={handleUpdateChart} loadingVisible={visibleLoadingThree} id={3}/>
          <Chart data={metrics[4]} update={handleUpdateChart} loadingVisible={visibleLoadingFour} id={4}/>
          <Chart data={metrics[5]} update={handleUpdateChart} loadingVisible={visibleLoadingFive} id={5}/>
          <Chart data={metrics[6]} update={handleUpdateChart} loadingVisible={visibleLoadingSix} id={6}/>
          <Chart data={metrics[7]} update={handleUpdateChart} loadingVisible={visibleLoadingSeven} id={7}/>
        </>
      }
    </div>
    <div className={styles.line}></div>
    <div className={styles.strategies}>
      <div className={styles.titleTips}>保护策略</div>
      {!_.isEmpty(strategies) && <Table
        hasBorder={false}
        dataSource={strategies}
      >
        <Table.Column title="策略名称" dataIndex="name" cell={renderName}/>
        <Table.Column title="策略状态" dataIndex="state" cell={renderIcon}/>
        <Table.Column title="策略内容" dataIndex="tolerance" cell={renderDetail}/>
        <Table.Column title="操作" cell={renderAction} />
      </Table>}
    </div>
    <div className={styles.taskDetail}>
      <div className={styles.titleTips}>执行情况</div>
      <Message type='notice'>
        <div className={styles.timeRange}>
          <div>
            <span className={styles.start}>节点开始执行时间：{formatDate(startTime)}</span>
            {endTime && <span>节点结束执行时间：{formatDate(endTime)}</span>}
          </div>
        </div>
      </Message>
      <div className={styles.taskContent}>
        <div className={styles.flows}>
          {
            loading ? <div className={styles.flowLoading}><Icon type='loading' size='xl'/></div> : _.isEmpty(experimentTask) ? <div>暂无数据</div> : <TaskFlow
              data={experimentTask!}
              selectNode={activity!}
              onActivitedClick={handleActivitedNode}
              onTryAgain={handleActivitedNodeTryAgain}
              onCheck={handleUserCheck}
              permission={experimentTask?.permission}
            />
          }
        </div>
        <div className={styles.taskInfo}>
          <TaskInfo
            data={activityTask!}
            activitiing={currentActivity}
            paramer={activityTaskParamer}
            currentActivity={currentActivity}
            activity={activity!}
            chartMetric={chartMetric || []}
            // logs={logs}
            clearCurrentActivity={() => { setCurrentActivity(null); }}
          />
        </div>
      </div>
    </div>
    {(feedbackStatus === 1 || isFeedbackStatus) && <div className={styles.feedBack}>
      <div className={styles.feedTitle}>结果反馈</div>
      <div className={styles.feedItem}>
        <div className={styles.label}>业务影响</div>
        <div className={styles.value}>{businessStatus ? '影响' : '不影响'}</div>
      </div>
      <div className={styles.feedItem}>
        <div className={styles.label}>结论</div>
        <div className={styles.value}>{expectationStatus ? '符合预期' : '不符合预期'}</div>
      </div>
      {
        !_.isEmpty(options) && options.map((item: any) => (
          <div className={styles.feedItem}>
            <div className={styles.label}>{item && item.description}</div>
            <div className={styles.value}>{renderItemValue(item)}</div>
          </div>
        ))
      }
      <div className={styles.feedItem}>
        <div className={styles.label}>说明</div>
        <div className={styles.value}>{memo}</div>
      </div>
    </div>}
    <Dialog
      title={`${strategiesDetail && strategiesDetail.name}规则`}
      style={{ width: 640 }}
      visible={strategiesVisible}
      footerActions={[ 'ok' ]}
      onOk={() => { setStrategiesVisible(false); }}
      onClose={() => { setStrategiesVisible(false); }}
    >
      {renderMoreDialog()}
    </Dialog>
    <Dialog
      visible={dependenceVisible}
      title='结果反馈'
      footer={renderDialogFooter()}
      className={styles.dependenceDialog}
      onClose={() => { setDependenceVisible(false); }}
    >
      <div className={styles.DialogFrom}>
        <DialogFrom
          data={experimentTask!}
          value={dependenceSubmit}
          onFormChange={handleFormChange}
          specialDom={(source === 1 || source === 2) && renderSpecialDom}
        />
      </div>
    </Dialog>
  </div>;
}
