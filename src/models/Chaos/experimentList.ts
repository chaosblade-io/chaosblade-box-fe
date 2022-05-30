import _ from 'lodash';
import createServiceChaos from 'utils/createServiceChaos';
import moment from 'moment';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { IExperiment, IGetExperimentListReq, IGetExperimentOptionAndInfoReq } from 'config/interfaces/Chaos/experimentList';

interface IExperimentListState {
  experiments: {
    data: IExperiment[];
    total: number;
    permission?: number;
  };
}

const DEFAULT_STATE: IExperimentListState = {
  experiments: {
    data: [],
    total: 0,
    permission: 7,
  },
};

@dvaModel('experimentList')
class ExperimentList extends BaseModel {
  state: IExperimentListState = DEFAULT_STATE;

  @reducer
  setExperimens(payload: IExperimentListState['experiments']) {
    // 从我的空间进入默认为所有权限
    const { data: experiments, total, permission = 7 } = payload;
    const { experiments: { data: prevExperiments } } = this.state;
    if (!_.isEmpty(experiments)) {
      const _experiments = _.map(experiments, (experiment: any) => {
        const exist = _.find(prevExperiments, (prev: any) => prev.experimentId === experiment.experimentId);

        // 执行人
        if (_.isEmpty(experiment.task)) {
          experiment.task = {};
        }
        experiment.taskCreator = _.get(experiment, 'task.creator.userName', '');
        experiment.taskState = _.get(experiment, 'task.state', '');
        experiment.taskResult = _.get(experiment, 'task.result', '');

        // 最近运行时间和创建时间
        const taskStartTime = _.get(experiment, 'task.startTime', '');
        const createTime = _.get(experiment, 'createTime', '');
        experiment.taskStartTime = taskStartTime ? moment(new Date(taskStartTime)).format('YYYY-MM-DD HH:mm:ss') : '';
        experiment.createTime = createTime ? moment(new Date(createTime)).format('YYYY-MM-DD HH:mm:ss') : '';

        let exp = {
          experimentId: experiment.experimentId,
          experiment,
        };

        if (!_.isEmpty(exist)) {
          exp = { ...exist, ...exp };
        }
        return exp;
      });
      return {
        ...this.state,
        experiments: {
          data: _experiments,
          total,
          permission,
        },
      };
    }
    return {
      ...this.state,
      experiments: {
        data: [],
        total,
        permission: 7,
      },
    };
  }

  // @reducer
  // clearExperiments() {
  //   return {
  //     ...this.state,
  //     experiments: {
  //       data: [],
  //       tota: 0,
  //       permission: 7,
  //     },
  //   };
  // }

  @effect()
  *getExperimentTaskStatistic() {
    return yield this.effects.call(createServiceChaos('ExperimentTaskOverview'));
  }

  @effect()
  *getExperimentList(payload: IGetExperimentListReq) {
    const { Data: { content, total } } = yield this.effects.call(createServiceChaos('PageableQueryUserExperiments'), payload);
    yield this.effects.put(this.setExperimens({ data: content, total }));
  }

  @effect()
  *getListExperimentTags() {
    return yield this.effects.call(createServiceChaos('ListExperimentTags'));
  }

  @effect()
  *queryExperimentAmount(payload: IGetExperimentOptionAndInfoReq) {
    return yield this.effects.call(createServiceChaos('QueryExperimentAmount'), payload);
  }

  @effect()
  *startExperiment(payload: IGetExperimentOptionAndInfoReq) {
    return yield this.effects.call(createServiceChaos('RunExperiment'), payload);
  }

  @effect()
  *deleteExperiment(payload: IGetExperimentOptionAndInfoReq) {
    return yield this.effects.call(createServiceChaos('DeleteExperiment'), payload);
  }

  @effect()
  *stopExperiment(payload: IGetExperimentOptionAndInfoReq) {
    return yield this.effects.call(createServiceChaos('StopExperimentTask'), payload);
  }

  @effect()
  *cloneExperiment(payload: IGetExperimentOptionAndInfoReq) {
    return yield this.effects.call(createServiceChaos('CloneExperiment'), payload);
  }

  @effect()
  *stopAllExperimentTasks() {
    return yield this.effects.call(createServiceChaos('StopAllExperimentTasks'));
  }

  // 演练空间相关接口
  @effect()
  *searchExperiments(payload: any) {
    return yield this.effects.call(createServiceChaos('SearchExperiments'), payload);
  }

  @effect()
  *getPageableGeneralExperiments(payload: any) {
    const { Data: { pageQueryResponse, permission } } = yield this.effects.call(createServiceChaos('PageableGeneralExperiments'), payload);
    yield this.effects.put(this.setExperimens({ data: _.get(pageQueryResponse, 'content', []), total: _.get(pageQueryResponse, 'total', 0), permission }));
    return permission;
  }

  @effect()
  *getGeneralWorkSpaceStatInfo(payload: any) {
    return yield this.effects.call(createServiceChaos('GetGeneralWorkSpaceStatInfo'), payload);
  }

  @effect()
  *deleteWorkspaceExperiment(payload: any) {
    return yield this.effects.call(createServiceChaos('DeleteWorkspaceExperiment'), payload);
  }

  @effect()
  *addWorkspaceExperiment(payload: any) {
    return yield this.effects.call(createServiceChaos('AddWorkspaceExperiment'), payload);
  }

  @effect()
  *listGeneralWorkspaceExperimentTags(payload: any) {
    return yield this.effects.call(createServiceChaos('ListGeneralWorkspaceExperimentTags'), payload);
  }

  @effect()
  *getWorkspaceByExperimentId(payload: any) {
    return yield this.effects.call(createServiceChaos('GetWorkspaceByExperimentId'), payload);
  }

  @effect()
  *workspaceCloneExperiment(payload: IGetExperimentOptionAndInfoReq) {
    return yield this.effects.call(createServiceChaos('workspaceCloneExperiment'), payload);
  }

}

export default new ExperimentList().model;

declare global {
  interface Actions {
    experimentList: ExperimentList;
  }
}
