import * as _ from 'lodash';
import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { IBaseInfo, IExperiment, IExperimentId } from 'config/interfaces/Chaos/experiment';
import { initExperimentFlow } from './experimentInit';

interface IExperimentDetailState {
  experiment: IExperiment;
  baseInfo: IBaseInfo;
}

const DEFAULT_STATE: IExperimentDetailState = {
  experiment: {
    id: '',
    experimentId: '',
    baseInfo: {
      experimentId: '',
      name: '',
      description: '',
      gmtCreate: '',
      tags: [],
      miniAppDesc: [],
      workspaces: [],
      relations: [],
    },
    flow: {
      experimentId: '',
      runMode: 'SEQUENCE',
      state: '',
      duration: 900,
      schedulerConfig: {
        cronExpression: '',
      },
      flowGroups: [],
      guardConf: {
        guards: [],
      },
    },
    observerNodes: [],
    recoverNodes: [],
    permission: 0,
  },
  baseInfo: {
    experimentId: '',
    name: '',
    description: '',
    gmtCreate: '',
    tags: [],
    miniAppDesc: [],
    workspaces: [],
    relations: [],
  },
};


@dvaModel('experimentDetail')
class ExperimentDetail extends BaseModel {
  state: IExperimentDetailState = DEFAULT_STATE;

  @reducer
  setExperiment(payload: IExperimentDetailState['experiment']) {
    let { experiment } = this.state;
    if (!_.isEmpty(payload)) {
      const { flowInfo, basicInfo } = payload;
      const mergeExperiment = {
        experimentId: payload.experimentId, // id在最外层放1个
        flow: { ...flowInfo },
        baseInfo: { ...basicInfo },
        permission: _.get(payload, 'permission', 0),
      };
      const preCheckInfo = _.get(payload, 'preCheckInfo', {});
      const experimentAppRisks = _.get(payload, 'experimentAppRisks', []);
      experiment = initExperimentFlow(mergeExperiment);
      _.set(experiment, 'preCheckInfo', preCheckInfo);
      _.set(experiment, 'experimentAppRisks', experimentAppRisks);
    } else {
      const newExperiment = {
        experimentId: payload.experimentId, // id在最外层放1个
        flow: {
          experimentId: payload.experimentId,
          runMode: 'SEQUENCE', // runMode默认值：顺序执行
          duration: 900, // 自动回复时间默认900秒
          schedulerConfig: {
            cronExpression: '',
          },
        },
        baseInfo: {
          experimentId: payload.experimentId,
          name: '',
          description: '',
          tags: [],
          miniAppDesc: [],
          workspaces: [],
          relations: [],
        },
        permission: _.get(payload, 'permission', 0),
      };
      const preCheckInfo = _.get(payload, 'preCheckInfo', {});
      const experimentAppRisks = _.get(payload, 'experimentAppRisks', []);
      experiment = initExperimentFlow(newExperiment);
      _.set(experiment, 'preCheckInfo', preCheckInfo);
      _.set(experiment, 'experimentAppRisks', experimentAppRisks);
    }
    return {
      ...this.state,
      experiment: { ...experiment },
    };
  }

  @reducer
  setClearExperiment() {
    return {
      ...this.state,
    };
  }

  @reducer
  setUpdateBaseInfo(payload: IBaseInfo) {
    return {
      ...this.state,
      baseInfo: {
        ...payload,
      },
    };
  }

  @effect()
  *getExperiment(payload: IExperimentId, callback: (res: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryExperiment'), payload);
    if (Data.flowInfo?.guardConf?.guards) {
      Data.flowInfo.guardConf.guards?.map((item: any) => {
        if (item.actionType === 0) {
          item.arguments = [{
            argumentList: item.arguments,
            gradeName: '参数',
          }];
        }
        return item;
      });
    }
    callback && callback(Data);
    yield this.effects.put(this.setExperiment(Data));
  }

  @effect()
  *getExperimentBaseInfo(payload?: IExperimentId, callback?: (res: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryExperimentBasicInfo'),
      payload);
    callback && callback(Data);
  }

  @effect()
  *updateExperimentBasicInfo(payload: IBaseInfo, callback?: (res: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('UpdateExperimentBasicInfo'),
      payload);
    callback && callback(Data);
  }

  @effect()
  *getListOperationLogs(payload: any, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('ListExperimentOperationLogs'), payload);
    callback && callback(Data);
  }

  @effect()
  *getExperimentTaskPageable(payload: any, callback?: (data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('ExperimentTaskSummaryPageableQuery'), payload);
    callback && callback(Data);
  }

  /** 演练保存为经验 */
  @effect()
  *saveExperience(payload?: IExperimentId) {
    const { Data } = yield this.effects.call(createServiceChaos('ConvertExperimentToExpertise'), payload);
    return Data;
  }

  /** 演练保存为经验 */
  @effect()
  *UpdateExperimentHost(payload?: IExperimentId) {
    const { Data } = yield this.effects.call(createServiceChaos('UpdateExperimentHost'), payload);
    return Data;
  }
}

export default new ExperimentDetail().model;

declare global {
  interface Actions {
    experimentDetail: ExperimentDetail;
  }
}
