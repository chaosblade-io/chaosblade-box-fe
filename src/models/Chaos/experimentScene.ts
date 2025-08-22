// 演练依赖数据，如tags，ip等
import * as _ from 'lodash';
import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { ICategories, IFunction, IFunctionParamterId, IFunctionsResult, IGuardRule, ISearchFunctions } from 'config/interfaces/Chaos/experiment';

interface IExperimentSceneState {
  functionParameters: any[];
  guardRules: any[];
}

const DEFAULT_STATE: IExperimentSceneState = {
  functionParameters: [],
  guardRules: [], // 全局防护类规则&策略
};

@dvaModel('experimentScene')
class ExperimentScene extends BaseModel {
  state: IExperimentSceneState = DEFAULT_STATE;

  @reducer
  setFunctionParameters(payload: IFunctionParamterId, parameters: IExperimentSceneState['functionParameters']) {
    let { functionParameters } = this.state;
    const functionId = _.get(payload, 'functionId', '');
    if (_.isEmpty(functionId)) {
      return { ...this.state };
    }
    const exist = _.find(functionParameters, (functionParameter: IFunction) => functionParameter.functionId === functionId);

    if (exist) {
      functionParameters = functionParameters.map((functionParameter: IFunction) => {
        if (functionParameter.functionId === functionId) {
          return {
            functionId,
            parameters,
          };
        }
        return functionParameter;
      });
    } else {
      functionParameters = _.concat(functionParameters, { functionId, parameters });
    }
    return {
      ...this.state,
      functionParameters,
    };
  }

  @reducer
  setGuardSceneRules(payload: IFunctionParamterId, rules: IExperimentSceneState['functionParameters']) {
    const functionId = _.get(payload, 'functionId', NaN);
    let { guardRules } = this.state;
    if (!functionId && functionId !== 0) {
      return { ...this.state };
    }

    const exist = _.find(guardRules, (guardRule: IGuardRule) => guardRule.functionId === functionId);
    if (exist) {
      guardRules = _.map(guardRules, (guardRule: IGuardRule) => {
        if (guardRule.functionId === functionId) {
          return {
            functionId,
            rules,
          };
        }
        return guardRule;
      });
    } else {
      guardRules = _.concat(guardRules, { functionId, rules });
    }
    return {
      ...this.state,
      guardRules,
    };
  }

  /** 根据类型搜索 */
  @effect()
  *getCategories(payload: ICategories) {
    const res = yield this.effects.call(createServiceChaos('QuerySceneFunctionCategories'), payload);
    const { Data = [] } = res || {};
    return Data;
  }

  @effect()
  *getGuardCategories(callback?: (cates: any[]) => void) {
    const { Data: cates } = yield this.effects.call(createServiceChaos('QueryGlobalGuardSceneFunctionCategories'));
    callback && callback(cates);
  }

  @effect()
  *getGlobalCategories(callback?: (cates: any[]) => void) {
    const { Data: cates } = yield this.effects.call(createServiceChaos('QueryGlobalMonitorSceneFunctionCategories'));
    callback && callback(cates);
  }

  /** 根据输入框搜索 */
  @effect()
  *searchFunctions(payload: ISearchFunctions, callback?: (data: IFunctionsResult) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('SearchSceneFunctions'), payload);
    callback && callback(Data);
  }

  /** 根据类目查 列表 */
  @effect()
  *getFunctionsByCategoryId(payload: ISearchFunctions, callback?: (data: IFunctionsResult) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QuerySceneFunctionByCategoryId'), payload);
    callback && callback(Data);
  }

  @effect()
  *getFunctionParameters(payload: IFunctionParamterId, callback?: (err: null, data: IFunctionsResult) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QuerySceneFunctionParameters'), payload);

    const result: any = [{
      argumentList: Data,
      gradeName: '参数',
      open: true,
      order: 1,
    }];
    yield this.effects.put(this.setFunctionParameters(payload, result));
    callback && callback(null, result);
  }

  @effect()
  *getGuardSceneRules(payload: IFunctionParamterId, callback?: (err: null, data: IFunctionsResult) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('QueryGuardSceneFunctionRules'), payload);
    yield this.effects.put(this.setGuardSceneRules(payload, Data));
    callback && callback(null, Data);
  }
}

export default new ExperimentScene().model;

declare global {
  interface Actions {
    experimentScene: ExperimentScene;
  }
}
