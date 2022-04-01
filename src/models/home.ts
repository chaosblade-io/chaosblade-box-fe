import createService from 'utils/createService';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';
import { CommonReq, ICreateNamespace, IGetLivedPluginCount } from 'config/interfaces';

@dvaModel('homeModel')
class HomeModel extends BaseModel {

  // 请求环境列表
  @effect()
  *getNamespaceList(payload?: CommonReq) {
    return yield this.effects.call(createService('QueryNamespaceList'), payload);
  }

  // 删除环境
  @effect()
  *DeleteNamespace(payload?: IGetLivedPluginCount) {
    const { Data = {} } = yield this.effects.call(createService('DeleteNamespace'), payload);
    return Data;
  }

  // 新增环境
  @effect()
  *CreateNamespace(payload?: ICreateNamespace) {
    const res = yield this.effects.call(createService('CreateNamespace'), payload);
    return res;
  }
}

export default new HomeModel().model;

declare global {
  interface Actions {
    homeModel: HomeModel;
  }
}
