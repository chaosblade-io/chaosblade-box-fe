import * as _ from 'lodash';
import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { IActivityTaskId, IExperimentTaskId, ILog, ISubmitFeedback, ITask, IminiTaskId } from 'config/interfaces/Chaos/experimentTask';
import { IExperimentId } from 'config/interfaces/Chaos/experiment';

interface IExperimentTask {
  logs: ILog[];
  dependenceSubmit: {
    taskId: string;
    feedbackId: string;
    feedback: {
      memo: string;
      expectationStatus: number;
      businessStatus: number;
      extra: any;
    }
  };
  reStartTaskId: string;
  stopResult: boolean | null;
}

const DEFAULT_STATE: IExperimentTask = {
  logs: [],
  dependenceSubmit: {
    taskId: '',
    feedbackId: '',
    feedback: {
      memo: '',
      expectationStatus: 1,
      businessStatus: 0,
      extra: {
        options: [],
      },
    },
  },
  reStartTaskId: '',
  stopResult: null,
};

@dvaModel('experimentTask')
class ExperimentTask extends BaseModel {
  state: IExperimentTask = DEFAULT_STATE;

  @reducer
  setActivityTaskLog(payload: ILog[]) {
    const logs = payload;
    return {
      ...this.state,
      logs,
    };
  }

  @reducer
  setTaskFeedback(payLoad: IExperimentTask['dependenceSubmit']) {
    // const { dependenceSubmit } = this.state;
    const data = { ...payLoad };
    const options = _.get(data, 'extra.options', []);
    const newChildOptions: any[] = [];
    const newOptions: any[] = [];
    let newDependenceSubmit;
    if (!_.isEmpty(options)) {
      options.forEach((o: any) => {
        let newCo;
        const childOptions = _.get(o, 'format.options', []);
        if (childOptions && !_.isEmpty(childOptions)) {
          childOptions.forEach((co: any) => {
            newCo = {
              label: co && co.value,
              value: co && co.key,
            };
            newChildOptions.push(newCo);
          });
          o = {
            ...o,
            format: {
              ...o.format,
              options: newChildOptions,
            },
          };
          newOptions.push(o);
        } else {
          newOptions.push(o);
        }
      });
      const extra = _.get(data, 'extra', {});
      newDependenceSubmit = {
        ...data,
        extra: {
          ...extra,
          options: newOptions,
        },
        expectationStatus: 1,
        businessStatus: 0,
      };
    } else {
      newDependenceSubmit = { ...data, expectationStatus: 1, businessStatus: 0 };
    }
    return {
      ...this.state,
      dependenceSubmit: {
        ...newDependenceSubmit,
      },
    };
  }

  @reducer
  setFeedBackChange(payLoad: any) {
    let { dependenceSubmit } = this.state;
    const data = { ...payLoad };
    dependenceSubmit = { ...dependenceSubmit, ...data };
    return {
      ...this.state,
      dependenceSubmit: {
        ...dependenceSubmit,
      },
    };
  }

  @reducer
  setExtraChange(payLoad: any) {
    let { dependenceSubmit } = this.state;
    const data = { ...payLoad };

    if (!_.isEmpty(data)) {
      if (data.feedbackId === dependenceSubmit.feedbackId) {
        dependenceSubmit = { ...data };
      }
    }
    return {
      ...this.state,
      dependenceSubmit: { ...dependenceSubmit },
    };
  }

  @reducer
  setReStartTaskId(payLoad: any) {
    if (!_.isEmpty(payLoad)) {
      const taskId = _.get(payLoad, 'taskId', '');
      return {
        ...this.state,
        reStartTaskId: taskId,
      };
    }
    return { ...this.state };
  }

  @reducer
  setStopTaskId(payLoad: boolean) {
    return {
      ...this.state,
      stopResult: payLoad,
    };
  }

  @reducer
  clearTasksStopResult() {
    return {
      ...this.state,
      stopResult: null,
    };
  }

  @reducer
  clearExperimentStartingResult() {
    return {
      ...this.state,
      reStartTaskId: null,
    };
  }

  @effect()
  *getExperimentTask(payload: ITask, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryExperimentTask'), payload);
    callback && callback(Data);
  }

  @effect()
  *getExperiementTaskGuardInfo(payload: ITask, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryExperimentTaskGuardInfo'), payload);
    callback && callback(Data);
  }

  @effect()
  *getActivityTask(payload: IActivityTaskId, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryActivityTask'), payload);
    callback && callback(Data);
  }
  @effect()
  *QueryMiniAppTask(payload: IminiTaskId) {
    const res = yield this.effects.call(createServiceChaos('QueryMiniAppTask'), payload);
    return res?.Data;
  }
  @effect()
  *QueryMiniAppTaskLog(payload: IminiTaskId) {
    const res = yield this.effects.call(createServiceChaos('QueryMiniAppTaskLog'), payload);
    return res?.Data;
  }
  @effect()
  *QueryMiniAppTaskInfo(payload: any) {
    const res = yield this.effects.call(createServiceChaos('GetScopeByAppConfigurationId'), payload);
    return res?.Data;
  }
  @effect()
  *getTaskMetric(payload: IActivityTaskId, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryActivityTaskMetric'), payload);
    callback && callback(Data);
  }

  @effect()
  *retryActivityTask(payload: IActivityTaskId, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('RetryActivityTask'), payload);
    callback && callback(Data);
  }

  @effect()
  *queryExperimentTaskConsumedAmount(payload: IExperimentTaskId, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryExperimentTaskConsumedAmount'), payload);
    callback && callback(Data);
  }

  @effect()
  *runExperiment(payload: IExperimentId) {
    const { Data } = yield this.effects.call(createServiceChaos('RunExperiment'), payload);
    yield this.effects.put(this.setReStartTaskId(Data));
  }

  @effect()
  *stopExperimentTask(payload: ITask) {
    const { Data } = yield this.effects.call(createServiceChaos('StopExperimentTask'), payload);
    yield this.effects.put(this.setStopTaskId(Data));
    return Data;
  }

  @effect()
  *getExperimentTaskFeedback(payload: ITask, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('GetExperimentTaskFeedback'), payload);
    yield this.effects.put(this.setTaskFeedback(Data));
    callback && callback(Data);
  }

  @effect()
  *submitExperimentTaskFeedback(payload: ISubmitFeedback, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('SubmitExperimentTaskFeedback'), payload);
    callback && callback(Data);
  }

  @effect()
  *userCheckActivityTask(payload: any, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('UserCheckActivityTask'), payload);
    callback && callback(Data);
  }

}

export default new ExperimentTask().model;

declare global {
  interface Actions {
    experimentTask: ExperimentTask;
  }
}
