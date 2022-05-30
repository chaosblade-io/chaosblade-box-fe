import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';
import { IGetList, IGetListResItem, IInstall, IUninstall } from 'config/interfaces/Manage/AgentSetting/tools';

interface IAgentToolsState {
}
const DEFAULT_STATE = {
};
@dvaModel('agentTools')
class AgentTools extends BaseModel {
  state: IAgentToolsState = DEFAULT_STATE;

  // 获取工具列表
  @effect()
  *getChaosToolsList(payload?: IGetList, callback?: (data: IGetListResItem[]) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('GetChaosToolsOverviewList'), payload);
    callback && callback(Data);
  }

  // 卸载工具
  @effect()
  *uninstallChaosTools(payload?: IUninstall, callback?: (data: boolean) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('UninstallChaosTools'), payload);
    callback && callback(Data);
  }

  // 安装工具
  @effect()
  *installChaosTools(payload?: IInstall, callback?: (data: boolean) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('InstallChaosTools'), payload);
    callback && callback(Data);
  }

}

export default new AgentTools().model;

declare global {
  interface Actions {
    agentTools: AgentTools;
  }
}
