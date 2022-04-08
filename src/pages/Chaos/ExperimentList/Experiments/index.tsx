import ClonePopup from './ClonePopup';
import React, { FC } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import randomColor from 'randomcolor';
import styles from './index.css';
import { Balloon, Button, Dialog, Icon, Message, Pagination, Table, Tag } from '@alicloud/console-components';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IExperiment, IExperimentInfo, IGetExperimentOptionAndInfoReq } from 'config/interfaces/Chaos/experimentList';
import { getParams, pushUrl } from 'utils/libs/sre-utils';
import { handleIsAdmin } from 'pages/Chaos/lib/BetaFlag';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const { Column } = Table;

const MAX_SIZE = 2;
const colors = randomColor({
  count: 26,
  hue: '#00C1DE',
});
const noop = () => { console.log(); };

interface IProps {
  page: number;
  handlePageChange: (e: number) => void;
  getExperimentTotals: () => void;
  running?: number;
  permission: number;
  workspaceName: string;
  getExperienceBag: () => void;
  handleTagChange: (e: string) => void;
}

const Experiments: FC<IProps> = props => {
  const history = useHistory();
  const dispatch = useDispatch();
  const workspaceId = getParams('workspaceId');
  const { data, total, loading } = useSelector(state => {
    return {
      ...state.experimentList.experiments,
      loading: state.loading.effects['experimentList/getExperimentList'],
    };
  });

  // useEffect(() => {
  //   return () => {
  //     dispatch.experimentList.clearExperiments();
  //   };
  // }, []);

  async function handleStartExpermient(experimentId: string) {
    const { Data: { taskId } } = await dispatch.experimentList.startExperiment({ experimentId });
    if (taskId) {
      props.getExperimentTotals();
    }
  }

  async function deleteExperiment(experimentId: string) {
    if (!_.isEmpty(workspaceId)) {
      const data = await dispatch.experimentList.deleteWorkspaceExperiment({ workspaceId, workspaceExperimentList: [{ experimentId }] });
      if (data.Success) {
        Message.success('删除成功');
        props.getExperimentTotals();
      }
    } else {
      const data = await dispatch.experimentList.deleteExperiment({ experimentId });
      if (data.Success) {
        Message.success('删除成功');
        props.getExperimentTotals();
      }
    }
  }

  async function stopExperiment(taskId: string) {
    const data = await dispatch.experimentList.stopExperiment({ taskId });
    if (data.Success) {
      props.getExperimentTotals();
    }
  }

  async function cloneExperiment(params: IGetExperimentOptionAndInfoReq) {
    let id = '';
    if (workspaceId) {
      const { Data } = await dispatch.experimentList.workspaceCloneExperiment({ ...params, workspaceId });
      id = Data;
    } else {
      const { Data } = await dispatch.experimentList.cloneExperiment(params);
      id = Data;
    }
    if (id) {
      Message.success('拷贝成功');
      props.getExperimentTotals();
    }
  }

  async function queryExperimentAmount(experimentId: string, value: IExperimentInfo) {
    const { Data: { remainingAmount, forecastAmount } } = await dispatch.experimentList.queryExperimentAmount({ experimentId });
    if (isNaN(remainingAmount) || isNaN(forecastAmount)) {
      Dialog.alert({
        title: '查询资源失败',
        content: '请重试',
        messageProps: {
          type: 'error',
        },
      });
      return;
    }
    const startDialog = Dialog.alert({
      style: {
        width: 480,
      },
      title: '开始执行演练？',
      content: renderMessageTitle(value),
      locale: {
        ok: '确定',
        cancel: '取消',
      },
      footer: (<span>
        <Button onClick={() => { startDialog.hide(); }} style={{ marginRight: 8 }}>取消</Button>
        <Button
          type='primary'
          onClick={() => {
            startDialog.hide();
            handleStartExpermient(experimentId);
          }}>确认</Button>
      </span>),
      onCancel: noop,
    });
  }

  const renderMessageTitle: any = (value: IExperimentInfo) => {
    const experimentAppRisks = _.get(value, 'experimentAppRisks', []);
    if (!_.isEmpty(experimentAppRisks)) {
      return <span style={{ fontSize: 12, color: '#555', fontWeight: 'normal' }}>
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
    return <span style={{ fontSize: 12, color: '#555', fontWeight: 'normal', lineHeight: '20px' }}>演练开始后会对指定目标(主机等)进行故障注入等操作，可能会使目标(主机等)服务不可用，是否确认开始执行?</span>;
  };

  const renderTitle: any = (value: string, index: number, record: IExperiment) => {
    const { experiment } = record;
    let description;
    let timing = false;
    if (!_.isEmpty(experiment)) {
      description = experiment.description;
      timing = experiment.schedulerConfig && experiment.schedulerConfig.cronExpression;
    }

    const { experimentId, state } = experiment;
    const taskId = _.get(experiment.task, 'taskId', '');

    const titleComponent = (
      <a
        onClick={() => {
          if (state !== ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING) {
            pushUrl(history, '/chaos/experiment/detail', { id: experimentId });
          } else {
            pushUrl(history, '/chaos/experiment/task', { id: taskId });
          }
        }}
        className={styles.title}
      >
        {timing && <img src='https://img.alicdn.com/tfs/TB1Ffk2iAcx_u4jSZFlXXXnUFXa-16-16.svg' className={styles.listIcon} title='定时任务' />}
        <span className={styles.displayTitle}>
          {value}
        </span>
      </a>
    );

    return (
      <Balloon trigger={titleComponent} closable={false}>
        {!_.isEmpty(description) ? description : value}
      </Balloon>
    );
  };

  const renderTags: any = (value: string[]) => {
    return (
      <div>
        {
          !_.isEmpty(value) && _.map(value, (tag: string, n: number) => (
            <Balloon closable={false} trigger={<Tag key={`user-experiments-tag-${n}`} style={{ maxWidth: 200, marginTop: '2px', marginBottom: '2px' }} size="small" onClick={() => {
              props.handleTagChange && props.handleTagChange(tag);
            }}>{tag}</Tag>} key={n}>{tag}</Balloon>
          ))
        }
      </div>
    );
  };

  const renderApps: any = (value: string[] = []) => {
    const limited = value.length > MAX_SIZE;
    value = value.map(code => {
      const parts = code.split(/\./g);
      if (parts.length > 1) {
        return parts[1];
      }
      return code;
    });

    return (
      <div className={styles.apps}>
        {
          !_.isEmpty(value) && _.map(limited ? _.slice(value, 0, MAX_SIZE) : value, (desc: string[], n: number) => {
            const char = _.upperFirst(desc as any).charAt(0);
            const color = colors[char.charCodeAt(0) - 65];
            return (
              <Balloon
                key={`user-experiments-app-${n}`}
                trigger={
                  <div className={styles.app} style={{ backgroundColor: color }}>
                    {char}
                  </div>
                }
                closable={false}
              >
                {_.upperCase(desc as any)}
              </Balloon>
            );
          })
        }
        {
          limited
            ? (
              <Balloon
                trigger={
                  <div className={styles.app} style={{ backgroundColor: '#E5E5E5' }}>
                    ...
                  </div>
                }
                closable={false}
              >
                {_.join(_.map(_.slice(value, MAX_SIZE), _.upperCase), ',')}
              </Balloon>
            ) : ''
        }
      </div>
    );
  };

  const renderStatus: any = (value: string, index: number, record: IExperiment) => {
    const { experiment } = record;
    const { taskState, taskResult } = experiment;

    let icon;
    let text = '';

    if (experiment.state === ExperimentConstants.EXPERIMENT_STATE_DRAFT) {
      text = '- - -';
    } else if (experiment.state === ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING) {
      icon = <Icon type="loading" size="small" style={{ marginRight: 5 }} />;

      if (taskState === ExperimentConstants.EXPERIMENT_TASK_STATE_STOPPING) {
        text = '正在停止';
      } else {
        if (experiment.taskUserCheckState === ExperimentConstants.EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_WAITING) {
          text = '等待用户确认';
        } else {
          text = '进行中';
        }
      }
    } else {
      if (taskState === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
        if (taskResult === ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS) {
          icon = <Icon type="success" style={{ color: '#1F8E3D', marginRight: 6 }} size="small" />;
          text = '成功';
        }
        if (taskResult === ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED) {
          icon = <Icon type="warning" style={{ color: '#D93026', marginRight: 6 }} size="small" />;
          text = '不符合预期';
        }
        if (taskResult === ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR) {
          icon = <Icon type="warning" style={{ color: '#D93026', marginRight: 6 }} size="small" />;
          text = '异常';
        }
        if (taskResult === ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED || experiment.taskResult === ExperimentConstants.EXPERIMENT_TASK_RESULT_REJECTED) {
          icon = <Icon type="minus-circle-fill" style={{ color: '#FFC440', marginRight: 6 }} size="small" />;
          text = '中断';
        }
      }
    }

    return (
      <div>
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  const renderNamesContent: any = (names: any[]) => {
    return names.map((item: { name: string; }, index: number) => {
      return <span key={item.name}>{item.name}{names.length - 1 !== index && '、'}</span>;
    });
  };

  async function handleDelete(name: string, experimentId: string) {
    let names: any = [];
    if (_.isEmpty(workspaceId)) {
      const { Data } = await dispatch.experimentList.getWorkspaceByExperimentId({ experimentId });
      names = Data;
    }
    const dialog = Dialog.alert({
      title: '警告',
      content: (
        <div className={styles.deleteTips}>
          {workspaceId && `移除演练（${name}），将会解除其与此空间（${props.workspaceName}）的关联关系。确定移除？`}
          {!workspaceId && <div>
            { !_.isEmpty(names) ?
              <div>删除演练（{name}），将会删除所有关联空间（{renderNamesContent(names)}）中的此演练，确定删除？</div>
              :
              <div>该演练（{name}）仅存在于我的空间，是否确定删除？</div>
            }
          </div>}
        </div>),
      footer: (
        <>
          <Button
            type='primary'
            onClick={() => {
              deleteExperiment(experimentId);
              dialog.hide();
            }}
          >
            确定
          </Button>
          <Button onClick={() => dialog.hide()}>取消</Button>
        </>
      ),
    });

  }

  function renderDeleteOption(name: string, experimentId: string, permission: number) {
    return (
      <Button
        className={classnames(styles.opt, handleIsAdmin(permission, 2) ? styles.warning : '', !handleIsAdmin(permission, 2) ? styles.disable : '')}
        disabled={!handleIsAdmin(permission, 2)}
        style={{ marginLeft: 0 }}
        text
        onClick={event => {
          event.stopPropagation();
          handleDelete(name, experimentId);
        }}
        type='primary'
      >
        { workspaceId ? '移除' : '删除' }
      </Button>
    );
  }

  function reasonList(value: IExperimentInfo) {
    const blockReasons = _.get(value, 'blockReasons', []);
    return <ul className={styles.ulList}>
      {Array.from(blockReasons).map((r: any) => {
        return <li key={r} className={styles.baoollnList}>{r}</li>;
      })}
    </ul>;
  }

  function renderFirstBtn(value: IExperimentInfo) {
    const { experimentId, state, name, opLevel, taskState, permission = 0 } = value;
    const taskId = _.get(value, 'task.taskId', '');
    if (opLevel) {
      return (
        <>
          <Balloon
            trigger={<Icon type="help" size='xs' className={styles.helpIcon} />}
            closable={false}
          >
            {reasonList(value)}
          </Balloon>
          <Button
            disabled={(opLevel !== 1 || !handleIsAdmin(permission, 4))}
            className={styles.opt}
            text
            type='primary'
          >
              演练
          </Button>
        </>
      );
    }
    if (state !== ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING) {
      if (state === ExperimentConstants.EXPERIMENT_STATE_SYNC) {
        return (
          <Balloon
            trigger={<span className={classnames(styles.opt, styles.disable)}>演练</span>}
            closable={false}
          >
            需编辑后运行
          </Balloon>
        );
      }
      return (
        <Button
          disabled={!handleIsAdmin(permission, 4)}
          className={styles.opt}
          text
          onClick={() => queryExperimentAmount(experimentId, value)}
          type='primary'
        >
          演练
        </Button>
      );

    }
    if (taskState === ExperimentConstants.EXPERIMENT_TASK_STATE_STOPPING) {
      return (
        <Balloon
          trigger={<span className={classnames(styles.opt, styles.disable)}>停止</span>}
          closable={false}
        >
          演练正在停止中
        </Balloon>
      );
    }
    return (
      <Button
        className={classnames(styles.opt, handleIsAdmin(permission, 4) && styles.warning)}
        disabled={!handleIsAdmin(permission, 4)}
        text
        onClick={() => {
          Dialog.confirm({
            title: '停止演练',
            content: `是否确认停止演练[演练名称: ${name}]？`,
            locale: {
              ok: '确定',
              cancel: '取消',
            },
            onOk: () => stopExperiment(taskId),
          });
        }}
      >
        停止
      </Button>
    );

  }

  const renderOperations: any = (value: IExperimentInfo) => {
    const { experimentId, state, name, permission = 0 } = value;
    return (
      <div className={styles.optGroup}>
        {renderFirstBtn(value)}
        <span style={{ marginRight: 8, color: '#d8d8d8' }}>|</span>
        <ClonePopup experiment={value} disable={!handleIsAdmin(permission, 2)} onSubmit={cloneExperiment} />
        <span style={{ marginRight: 8, color: '#d8d8d8' }}>|</span>
        {
          state !== ExperimentConstants.EXPERIMENT_TASK_STATE_RUNNING
            ? renderDeleteOption(name, experimentId, permission)
            : (
              <Balloon
                trigger={<span className={classnames(styles.opt, styles.disable)}>{ workspaceId ? '移除' : '删除' }</span>}
                closable={false}
              >
                进行的中演练禁止删除
              </Balloon>
            )
        }
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Table
        primaryKey="experimentId"
        hasBorder={false}
        dataSource={(!props.running && loading || !handleIsAdmin(props.permission, 1)) ? [] : data}
        loading={!props.running ? loading : false}
        onFilter={() => console.log(1)}
      >
        <Column
          title="演练名称"
          dataIndex='experiment.name'
          cell={renderTitle}
          width={'16%'}
        />
        <Column title="标签" dataIndex="experiment.tags" cell={renderTags} width="16%" />
        <Column title="场景" dataIndex="experiment.miniAppDesc" cell={renderApps} />
        <Column title="创建时间" dataIndex="experiment.createTime" width="13%" />
        <Column title="定时任务" dataIndex="experiment.schedulerConfig.cronExpression" />
        <Column title="最近运行状态" dataIndex="experiment.state" cell={renderStatus} width="9%" />
        <Column title="最近运行时间" dataIndex="experiment.taskStartTime" width="13%" />
        <Column title="操作" width="12%" lock="right" dataIndex="experiment" cell={renderOperations} />
      </Table>
      <Pagination
        className={styles.homePagination}
        shape="arrow-only"
        pageSizePosition="start"
        current={props.page}
        total={total}
        totalRender={() => `共有${total}条`}
        onChange={props.handlePageChange}
        hideOnlyOnePage={true}
      />
    </div>
  );
};

export default Experiments;
