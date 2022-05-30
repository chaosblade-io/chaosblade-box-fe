import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';

@dvaModel('archIndex')
class ArchIndex extends BaseModel {
  state = null;
  /** 资源包使用情况查询 */
  @effect()
  *getUserPayPack() {
    const res = yield this.effects.call(createServiceChaos('UserPayPackOverviewInfo'));
    return res?.Data || {};
  }

  /** 探针数据统计 */
  @effect()
  *getUserAgent() {
    const res = yield this.effects.call(createServiceChaos('UserAgentOverviewInfo'));
    return res?.Data || {};
  }

  /** 概览页产品消息通知及最佳实践 */
  @effect()
  *getNotify() {
    const res = yield this.effects.call(createServiceChaos('ProductMessageOverviewInfo'));
    return res?.Data || {};
  }

  /** 用户常用场景 */
  @effect()
  *getUserScene() {
    const res = yield this.effects.call(createServiceChaos('UserSceneOverview'));
    return res?.Data || [];
  }

  /** 用户演练经验 */
  @effect()
  *getExpertiseLs(payload: any) {
    const res = yield this.effects.call(createServiceChaos('UserExpertiseOverview'), payload);
    return res?.Data || {};
  }

  /** 演练数据统计 */
  @effect()
  *getExperimentStatistics() {
    const res = yield this.effects.call(createServiceChaos('UserExperimentOverviewInfo'));
    return res?.Data || {};
  }

  /** 用户演练任务分布 */
  @effect()
  *getExperimentTrend() {
    const res = yield this.effects.call(createServiceChaos('UserExperimentByDayOverviewInfo'));
    return res?.Data || {};
  }
}

export default new ArchIndex().model;

declare global {
  interface Actions {
    archIndex: ArchIndex;
  }
}
