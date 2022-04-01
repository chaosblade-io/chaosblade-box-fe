import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';
import {
  IAppLicationCommmonReq,
  IAppLicationSearchApp,
  IApplicationConfigurationRecordAndReq,
  ISearchApplicationHosts,
  IUpdateApplicationTag,
} from 'config/interfaces/Chaos/application';

@dvaModel('application')
class Application extends BaseModel {

  state = null; // 演练消费记录中的所有数据都不需要共享；


  @effect()
  *getUserApplications(payload: IAppLicationCommmonReq) {
    return yield this.effects.call(createServiceChaos('GetUserApplicationSummaries'), payload);
  }

  @effect()
  *searchApplications(payload: IAppLicationSearchApp) {
    return yield this.effects.call(createServiceChaos('SearchApplications'), payload);
  }

  @effect()
  *getApplicationBasic(payload: IAppLicationCommmonReq) {
    return yield this.effects.call(createServiceChaos('GetApplicationBasic'), payload);
  }

  @effect()
  *getApplicationHosts(payload: IAppLicationCommmonReq) {
    return yield this.effects.call(createServiceChaos('GetApplicationHosts'), payload);
  }

  @effect()
  *getApplicationGroup(payload: IAppLicationCommmonReq) {
    return yield this.effects.call(createServiceChaos('GetUserApplicationGroups'), payload);
  }

  @effect()
  *searchApplicationHosts(payload: ISearchApplicationHosts) {
    return yield this.effects.call(createServiceChaos('SearchApplicationHosts'), payload);
  }

  @effect()
  *getApplicationTask(payload: IAppLicationCommmonReq) {
    return yield this.effects.call(createServiceChaos('GetApplicationExperimentTasks'), payload);
  }

  @effect()
  *getListApplicationConfigurations(payload: IAppLicationCommmonReq) {
    return yield this.effects.call(createServiceChaos('ListApplicationConfigurations'), payload);
  }

  @effect()
  *updateApplicationConfiguration(payload: IApplicationConfigurationRecordAndReq) {
    return yield this.effects.call(createServiceChaos('UpdateApplicationConfiguration'), payload);
  }

  // 单条增加标签
  @effect()
  *updateApplicationTag(payload: IUpdateApplicationTag, callback: (success: boolean) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('UpdateApplicationTag'), payload);
    callback && callback(Data);
  }

  // 批量增加标签
  @effect()
  *batchAddApplicationTag(payload: IUpdateApplicationTag, callback: (success: boolean) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('BatchAddApplicationTag'), payload);
    callback && callback(Data);
  }

}

export default new Application().model;

declare global {
  interface Actions {
    application: Application;
  }
}
