import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';
import { IListExperimentNodesByCluster, IQueryExperimentScopesReq, IQueryScopeControlDetailReq, IQueryScopeControlPodReq } from 'config/interfaces/Chaos/scopesControl';

@dvaModel('scopesControl')
class ScopesControl extends BaseModel {

  state = null; // 演练消费记录中的所有数据都不需要共享；


  @effect()
  *getExperimentScopes(payload: IQueryExperimentScopesReq) {
    return yield this.effects.call(createServiceChaos('PageableQueryExperimentScopes'), payload);
  }

  @effect()
  *getListExperimentClusters() {
    return yield this.effects.call(createServiceChaos('ListExperimentClusters'));
  }

  @effect()
  *getScopeSceneFunctionCount(payload: IQueryScopeControlDetailReq) {
    return yield this.effects.call(createServiceChaos('CountExperimentScopeSceneFunctionCount'), payload);
  }

  @effect()
  *getScopeInfo(payload: IQueryScopeControlDetailReq) {
    return yield this.effects.call(createServiceChaos('QueryScopeInfo'), payload);
  }

  @effect()
  *getScopeInvocation(payload: IQueryScopeControlDetailReq) {
    return yield this.effects.call(createServiceChaos('CountExperimentScopeInvocation'), payload);
  }

  @effect()
  *getExperimentTaskScopes(payload: IQueryScopeControlDetailReq) {
    return yield this.effects.call(createServiceChaos('PageableQueryExperimentTaskByScope'), payload);
  }

  @effect()
  *getSearchExperimentPodsByNode(payload: IQueryScopeControlPodReq) {
    return yield this.effects.call(createServiceChaos('SearchExperimentPodsByNode'), payload);
  }

  @effect()
  *getListExperimentNodesByCluster(payload: IListExperimentNodesByCluster) {
    return yield this.effects.call(createServiceChaos('ListExperimentNodesByCluster'), payload);
  }
}

export default new ScopesControl().model;

declare global {
  interface Actions {
    scopesControl: ScopesControl;
  }
}
