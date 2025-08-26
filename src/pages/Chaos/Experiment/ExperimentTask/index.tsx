import Chart from './Chart';
import DialogFrom from 'pages/Chaos/Experiment/common/DialogFrom';
import FeedBack from 'pages/Chaos/Experiment/common/FeedBack';
import LoadTestDataCharts from './LoadTestDataCharts';
// import LoadTestTaskStatus from './LoadTestTaskStatus';
import React, { useEffect, useState } from 'react';
import TaskBasic from './TaskBasic';
import TaskFlow from './TaskFlow';
import TaskInfo from './TaskInfo';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Button, Dialog, Icon, Message, Table } from '@alicloud/console-components';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IActivity, IExperimentTask, IMetrics, IStrategies, IToleranceValue, ILoadTestTask, ILoadTestMetrics } from 'config/interfaces/Chaos/experimentTask';
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
  const [ , setLoadTestData ] = useState<any>(null); // 压测数据
  const [ _loadTestTasks, setLoadTestTasks ] = useState<ILoadTestTask[]>([]);
  const [ _loadTestMetrics, setLoadTestMetrics ] = useState<ILoadTestMetrics | null>(null);
  const [ loadTestPolling, setLoadTestPolling ] = useState(false);
  const [ pollIntervalRef, setPollIntervalRef ] = useState<NodeJS.Timeout | null>(null);

  const { reRunLoading } = useSelector(state => {
    return {
      reRunLoading: state.loading.effects['experimentTask/runExperiment'],
    };
  });

  useEffect(() => {
    if (_.isBoolean(stopResult) && !stopResult) {
      dispatch.experimentTask.clearTasksStopResult();
      Message.error(i18n.t('Failed to stop rehearsal'));
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

  const fetchLoadTestData = async (taskId: string, loadTestConfig: any) => {
    try {
      // TODO: 替换为真实的API调用
      // const response = await dispatch.experimentTask.getLoadTestMetrics({ taskId });
      // setLoadTestData(response);

      // 暂时使用模拟数据
      const mockData = {
        taskId,
        loadTestConfig,
        hasData: true,
      };
      setLoadTestData(mockData);
    } catch (error) {
      console.error('Failed to fetch load test data:', error);
    }
  };

  // 获取压测任务状态
  const fetchLoadTestTasks = async (experimentTaskId: string) => {
    try {
      console.log('Fetching load test tasks for experimentTaskId:', experimentTaskId);
      const task = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: experimentTaskId });
      if (task) {
        console.log('Load test task found:', task);
        setLoadTestTasks([ task ]);

        // 如果任务正在运行，开始轮询
        if (task.status === 'RUNNING' || task.status === 'PENDING') {
          startLoadTestPolling(task);
        } else {
          // 如果任务已完成，获取结果和指标
          if (task.status === 'COMPLETED' || task.status === 'FAILED' || task.status === 'STOPPED') {
            await fetchLoadTestResults(experimentTaskId);
            if (task.executionId) {
              await fetchLoadTestMetrics(task.executionId);
            }
          }
        }
      } else {
        console.log('No load test task found for experimentTaskId:', experimentTaskId);
        setLoadTestTasks([]); // 清空任务列表
      }
    } catch (error) {
      console.error('Failed to fetch load test tasks for experimentTaskId:', experimentTaskId, error);
      // 如果是404错误，说明没有压测任务，这是正常情况
      if (error.message && error.message.includes('404')) {
        console.log('No load test tasks found (404), this is normal for experiments without load test strategies');
        setLoadTestTasks([]);
      }
    }
  };

  // 获取压测结果
  const fetchLoadTestResults = async (taskId: string) => {
    try {
      console.log('Fetching load test results for taskId:', taskId);
      const results = await dispatch.loadTestDefinition.getLoadTestResults({ taskId: '1958681761508659201' });
      console.log('Load test results:', results);
    } catch (error) {
      console.error('Failed to fetch load test results for taskId:', taskId, error);
    }
  };

  // 获取压测指标
  const fetchLoadTestMetrics = async (executionId: string) => {
    try {
      const metrics = await dispatch.loadTestDefinition.getLoadTestMetrics({ executionId });
      setLoadTestMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch load test metrics for executionId:', executionId, error);
    }
  };

  // 开始压测轮询
  const startLoadTestPolling = (task: ILoadTestTask) => {
    if (loadTestPolling) return; // 避免重复轮询
    setLoadTestPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        // 使用taskId来轮询任务状态
        const updatedTask = await dispatch.loadTestDefinition.getLoadTestTask({ taskId: task.taskId });
        if (updatedTask) {
          setLoadTestTasks([ updatedTask ]);

          // 如果任务完成，停止轮询并获取结果
          if (updatedTask.status !== 'RUNNING' && updatedTask.status !== 'PENDING') {
            clearInterval(pollInterval);
            setLoadTestPolling(false);
            setPollIntervalRef(null);

            if (updatedTask.status === 'COMPLETED' || updatedTask.status === 'FAILED' || updatedTask.status === 'STOPPED') {
              // 使用taskId获取结果
              await fetchLoadTestResults(updatedTask.taskId);
              if (updatedTask.executionId) {
                await fetchLoadTestMetrics(updatedTask.executionId);
              }
            }
          } else {
            // 如果任务正在运行且有executionId，获取实时指标
            if (updatedTask.status === 'RUNNING' && updatedTask.executionId) {
              await fetchLoadTestMetrics(updatedTask.executionId);
            }
          }
        }
      } catch (error) {
        console.error('Load test polling error:', error);
      }
    }, 5000); // 5秒轮询一次

    setPollIntervalRef(pollInterval);
  };

  // 停止压测任务
  const _stopLoadTestTask = async (loadTestTaskId: string) => {
    try {
      console.log('Stopping load test task with taskId:', loadTestTaskId);

      // 直接使用传入的 loadTestTaskId（这应该是 ILoadTestTask 的 taskId）
      await dispatch.loadTestDefinition.stopLoadTestTask({ taskId: loadTestTaskId });
      Message.success(i18n.t('Load test task stopped successfully').toString());

      // 重新获取任务状态
      await fetchLoadTestTasks(taskId);
    } catch (error) {
      console.error('Failed to stop load test task with taskId:', loadTestTaskId, error);
      Message.error(i18n.t('Failed to stop load test task').toString());
    }
  };

  useEffect(() => {
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'workspace',
        value: i18n.t('Space management').toString(),
        path: '/chaos/workspace/list',
      },
      {
        key: 'experiment_task',
        value: i18n.t('Drill Record Details').toString(),
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

          // 检查是否有压测配置，如果有则获取压测数据（保留原有逻辑）
          if (taskRes && taskRes.loadTestConfig) {
            fetchLoadTestData(taskId, taskRes.loadTestConfig);
          }

          // 使用experimentTaskId获取压测任务状态（无论是否有loadTestConfig都尝试获取）
          // 因为压测策略可能是在演练配置时设置的，而不是在loadTestConfig中
          if (taskRes && taskRes.taskId) {
            fetchLoadTestTasks(taskRes.taskId); // 使用experimentTaskId作为taskId参数
          }

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
          <Button type="normal" loading={reRunLoading} disabled={(!isFinished || !handleIsAdmin(experimentTask?.permission as number, 4))} onClick={handleRestartTask}><Translation>Do it again</Translation></Button>
          <Button type="primary" className={styles.buttonSecond} onClick={handleCheckDetail}><Translation>See details</Translation></Button>
          {!isFinished && <Button type="primary" disabled={(isStopping || !handleIsAdmin(experimentTask?.permission as number, 4))} warning={!isStopping} onClick={handleStopTask}>{isStopping ? i18n.t('Stoppings').toString() : i18n.t('Termination').toString()}</Button>}
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

  // 清理压测轮询
  useEffect(() => {
    return () => {
      if (pollIntervalRef) {
        clearInterval(pollIntervalRef);
        setLoadTestPolling(false);
        setPollIntervalRef(null);
      }
    };
  }, [ pollIntervalRef ]);

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
          title: i18n.t('Repeat action reminder').toString(),
          content: i18n.t('The current drill is being stopped, please do not repeat the operation').toString(),
          onOk: noop,
          locale: locale().Dialog,
        });
      } else {
        Dialog.confirm({
          title: i18n.t('Stop the drill').toString(),
          content: i18n.t('Stop the currently running exercise').toString(),
          locale: locale().Dialog,
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
        <div className={styles.showStrategy}><Translation>Rules</Translation></div>
        <div className={styles.showRules}>
          {!_.isEmpty(fields) && fields.map((item: IField, idx: number) => {
            const operator = Object.keys(item as any).find(key => (item as any)[key] === true);
            let operatorLabel;
            if (operator === 'and') {
              operatorLabel = i18n.t('And');
            } else {
              operatorLabel = i18n.t('Or');
            }
            return <span>
              {item.name}{item.operation && item.operation.label! + item.value + item.unit}
              &nbsp;&nbsp;{idx < fields.length - 1 ? operatorLabel : ''}&nbsp;&nbsp;
            </span>;
          })}
        </div>
        <div className={styles.showStrategy}><Translation>Recovery strategy</Translation></div>
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
    return <span className={styles.ruleDetail} onClick={handleMoreShow}><Translation>Rules Details</Translation></span>;
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
        <div><Translation>Automatic termination</Translation></div>
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
    const source = _.get(experimentTask, 'source', 0) as number;
    if (source === 1) {
      return <Button.Group>
        <Button type="primary" onClick={() => handleSubmitFeebBack(true)}><Translation>OK, return to strong and weak dependency governance</Translation></Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => handleSubmitFeebBack(false)}><Translation>Ok, stay on this page</Translation></Button>
      </Button.Group>;
    }
    if (source === 2) {
      return <Button.Group>
        <Button type="primary" onClick={() => handleSubmitFeebBack(true)}><Translation>OK, return to message walkthrough</Translation></Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => handleSubmitFeebBack(false)}><Translation>Ok, stay on this page</Translation></Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => setDependenceVisible(false)}><Translation>Cancel, next feedback</Translation></Button>
      </Button.Group>;
    }
    if (source === 3) {
      return <Button.Group>
        <Button type="primary" onClick={() => handleSubmitFeebBack(true)}><Translation>OK, return to disaster recovery drill</Translation></Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => handleSubmitFeebBack(false)}><Translation>Ok, stay on this page</Translation></Button>
        <Button type="normal" className={styles.normalBtn} onClick={() => setDependenceVisible(false)}><Translation>Cancel, next feedback</Translation></Button>
      </Button.Group>;
    }
    return <Button.Group>
      <Button type="primary" onClick={() => handleSubmitFeebBack(true)}><Translation>Confirm</Translation></Button>
      <Button type="normal" className={styles.normalBtn} onClick={() => setDependenceVisible(false)}><Translation>Cancel, next feedback</Translation></Button>
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
            Message.success(i18n.t('Feedback success'));
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
      const foundOption = _.find(itemOptions, (i: any) => i.key === value);
      return foundOption ? foundOption.value : value;
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
    return `${i18n.t('Protect')}${val}`;
  };

  const source = _.get(experimentTask, 'source', 0) as number;
  const feedbackStatus = _.get(experimentTask, 'feedbackStatus', 0) as number;
  const expectationStatus = _.get(feedBackReturn, 'expectationStatus', 0) as number;
  const businessStatus = _.get(feedBackReturn, 'businessStatus', 0) as number;
  const memo = _.get(feedBackReturn, 'memo', '') as string;
  const options = _.get(feedBackReturn, 'extra.options', []) as any[];
  const extInfo = _.get(experimentTask, 'extInfo', {}) as any;

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
      <div className={styles.titleTips}><Translation>Protection strategy</Translation></div>
      {!_.isEmpty(strategies) && <Table
        hasBorder={false}
        dataSource={strategies}
        locale={locale().Table}
      >
        <Table.Column title={i18n.t('Policy name').toString()} dataIndex="name" cell={renderName}/>
        <Table.Column title={i18n.t('Policy status').toString()} dataIndex="state" cell={renderIcon}/>
        <Table.Column title={i18n.t('Policy content').toString()} dataIndex="tolerance" cell={renderDetail}/>
        <Table.Column title={i18n.t('Operation').toString()} cell={renderAction} />
      </Table>}
    </div>

    {/* 压测数据展示区域 */}
    <LoadTestDataCharts
      taskId={getTaskId()}
    />

    <div className={styles.taskDetail}>
      <div className={styles.titleTips}><Translation>Implementation</Translation></div>
      <Message type='notice'>
        <div className={styles.timeRange}>
          <div>
            <span className={styles.start}><Translation>Node start execution time</Translation>: {formatDate(startTime)}</span>
            {endTime && <span><Translation>Node end execution time</Translation>: {formatDate(endTime)}</span>}
          </div>
        </div>
      </Message>
      <div className={styles.taskContent}>
        <div className={styles.flows}>
          {
            loading ? <div className={styles.flowLoading}><Icon type='loading' size='xl'/></div> : _.isEmpty(experimentTask) ? <div><Translation>No data</Translation></div> : <TaskFlow
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
      <div className={styles.feedTitle}><Translation>Result feedback</Translation></div>
      <div className={styles.feedItem}>
        <div className={styles.label}><Translation>Business impact</Translation></div>
        <div className={styles.value}>{businessStatus ? i18n.t('Influence').toString() : i18n.t('Does not affect').toString()}</div>
      </div>
      <div className={styles.feedItem}>
        <div className={styles.label}><Translation>In conclusion</Translation></div>
        <div className={styles.value}>{expectationStatus ? i18n.t('In line with expectations').toString() : i18n.t('Not as expected').toString()}</div>
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
        <div className={styles.label}><Translation>Illustrate</Translation></div>
        <div className={styles.value}>{memo}</div>
      </div>
    </div>}
    <Dialog
      title={`${strategiesDetail && strategiesDetail.name}${i18n.t('Rules')}`}
      style={{ width: 640 }}
      visible={strategiesVisible}
      footerActions={[ 'ok' ]}
      onOk={() => { setStrategiesVisible(false); }}
      onClose={() => { setStrategiesVisible(false); }}
      locale={locale().Dialog}
    >
      {renderMoreDialog()}
    </Dialog>
    <Dialog
      visible={dependenceVisible}
      title={i18n.t('Result feedback').toString()}
      footer={renderDialogFooter()}
      className={styles.dependenceDialog}
      onClose={() => { setDependenceVisible(false); }}
      locale={locale().Dialog}
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
