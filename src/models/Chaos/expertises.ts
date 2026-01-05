import _ from 'lodash';
import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { IExpertiseAdminActionAndDetail, IExpertiseCom, IGetListUserTagsByType, ISearchExpertiseRes } from 'config/interfaces/Chaos/expertises';
import { IFlow } from 'config/interfaces/Chaos/experiment';
import { convertFlow } from './experimentInit';
import { v4 as uuidv4 } from 'uuid';

interface IExpertiseState {
  expertise: {
    expertises: ISearchExpertiseRes[];
    total: number;
  };
  expertiseInfo: {
    basic_info: {
      background_desc: string;
      design_concept: string;
      function_desc: string;
      name: string;
      state: number;
      tags: string[];
    };
    evaluation_info: {
      items: any[];
    };
    executable_info: any; // 看演练详情那边是否有类似的
    expertise_id: string;
    observerNodes: any[];// 看演练详情那边是否有类似的
    recoverNodes: any[];
  };
}

@dvaModel('expertises')
class Expertises extends BaseModel {

  state: IExpertiseState = {
    expertise: {
      expertises: [],
      total: 0,
    },
    expertiseInfo: {
      basic_info: {
        background_desc: '',
        design_concept: '',
        function_desc: '',
        name: '',
        state: 0,
        tags: [],
      },
      evaluation_info: {
        items: [],
      },
      executable_info: null,
      expertise_id: '',
      observerNodes: [],
      recoverNodes: [],
    },
  };

  @reducer
  setExpertises(payload: IExpertiseState['expertise']) {
    return {
      ...this.state,
      expertise: {
        ...payload,
      },
    };
  }

  @reducer
  setEertiseDetail(payload: IExpertiseState['expertiseInfo']) {
    const result = { ...payload };
    const { expertiseInfo } = this.state;
    const observerNodes = _.get(result, 'observerNodes', []);
    const recoverNodes = _.get(result, 'recoverNodes', []);
    const flow = _.get(result, 'executable_info.flow', {});
    const basicInfo = _.get(result, 'basic_info', {});
    const evaluationInfo = _.get(result, 'evaluation_info', { items: [] });

    const runTime = _.get(result, 'executable_info.run_time', {});
    const exResult = convertFlow(observerNodes, recoverNodes, flow as IFlow, true);
    const observerNodesList = _.get(exResult, 'observerNodes', []);
    const recoverNodesList = _.get(exResult, 'recoverNodes', []);

    _.set(expertiseInfo, 'executable_info.flow', exResult);
    _.set(expertiseInfo, 'executable_info.run_time', runTime);
    _.set(expertiseInfo, 'basic_info', basicInfo);
    _.set(expertiseInfo, 'observerNodes', observerNodesList);
    _.set(expertiseInfo, 'recoverNodes', recoverNodesList);


    if (!_.isEmpty(evaluationInfo.items)) {
      Array.from(evaluationInfo.items).map((it: any) => {
        if (!it.id) {
          it.id = uuidv4();
        }
        return it;
      });
      _.set(expertiseInfo, 'evaluation_info', evaluationInfo);
    } else {
      _.set(expertiseInfo, 'evaluation_info', { items: [{ id: uuidv4() }] });
    }
    expertiseInfo.expertise_id = result.expertise_id;
    return {
      ...this.state,
      expertiseInfo: { ...expertiseInfo },
    };
  }

  @reducer
  clearExperiseList() {
    return {
      ...this.state,
      expertise: {
        expertises: [],
        total: 0,
      },
    };
  }

  // 演练经验库管理页
  @effect()
  *getAdminExpertiseBase(payload: IExpertiseCom) {
    return yield this.effects.call(createServiceChaos('PageableQueryExpertise'), payload);
  }

  @effect()
  *goOnlineExpertise(payload: IExpertiseAdminActionAndDetail) {
    return yield this.effects.call(createServiceChaos('EnableExpertise'), payload);
  }

  @effect()
  *offlineExpertise(payload: IExpertiseAdminActionAndDetail) {
    return yield this.effects.call(createServiceChaos('DisableExpertise'), payload);
  }

  @effect()
  *deleteExpertise(payload: IExpertiseAdminActionAndDetail) {
    return yield this.effects.call(createServiceChaos('DeleteExpertise'), payload);
  }

  // 演练经验库页
  @effect()
  *getExpertiseBase(payload: IExpertiseCom) {
    const { Data: { content = [], total = 0 } } = yield this.effects.call(createServiceChaos('SearchExpertise'), payload);
    yield this.effects.put(this.setExpertises({
      expertises: content,
      total,
    }));
  }

  // 演练经验库详情页
  @effect()
  *getExpertiseDetail(payload: IExpertiseAdminActionAndDetail) {
    const res = yield this.effects.call(createServiceChaos('QueryExpertiseDetails'), payload);
    const Data = (res && res.Data) || false;
    if (Data) {
      if (Data.executable_info?.flow?.guardConf?.guards) {
        Data.executable_info.flow.guardConf.guards.map((item: any) => {
          if (item.actionType === 0) {
            item.arguments = [{
              argumentList: item.arguments,
              gradeName: '参数',
            }];
          }
          return item;
        });
      }
      yield this.effects.put(this.setEertiseDetail({
        ...Data,
      }));
    }
  }

  // 经验库标签
  @effect()
  *getExperiseSearchTags(payload: IGetListUserTagsByType) {
    return yield this.effects.call(createServiceChaos('ListExpertiseTags'), payload);
  }

  // 经验库管理标签
  @effect()
  *getExperiseAdminSearchTags(payload: IGetListUserTagsByType) {
    return yield this.effects.call(createServiceChaos('ListUserTagsByType'), payload);
  }

}

export default new Expertises().model;

declare global {
  interface Actions {
    expertises: Expertises;
  }
}
