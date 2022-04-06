import createService from 'utils/createService';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';
import {
  CommonReq,
  IBatchInstallPluginParams,
  IBatchQueryPluginStatusParams,
  IDescribePluginDetailParams,
  IDescribePluginRateParams,
  IGetUserApplicationsParams,
  IInstallPluginParams,
  IListChaosAgentMetricsParams,
  IListKubernetesClusterParams,
  IQueryPluginStatusParams,
  IQueryPluginsParams,
  IQueryUninstallAndInstallCommandParams,
  IQueryWaitInstallPluginParams,
  IStopAndStartPluginParams,
  IUninstallPluginParams,
} from 'config/interfaces';

interface IAgentSettingState {
}
const DEFAULT_STATE = {
};
@dvaModel('agentSetting')
class AgentSetting extends BaseModel {
  state: IAgentSettingState = DEFAULT_STATE;

  // 应用防护-新应用接口
  @effect()
  *getQueryLicenseKey(payload?: any) {
    return yield this.effects.call(createService('QueryLicenseKey'), payload);
  }
  // 获取 探针管理列表
  @effect()
  *getQueryPlugins(payload?: IQueryPluginsParams) {
    return yield this.effects.call(createService('QueryPlugins'), payload);
  }
  // 获取 kubernetes 探针管理列表
  @effect()
  *getListKubernetesCluster(payload?: IListKubernetesClusterParams) {
    return yield this.effects.call(createService('ListKubernetesCluster'), payload);
  }

  // 获取 探针数和总ecs数
  @effect()
  *getDescribePluginRate(payload?: IDescribePluginRateParams) {
    return yield this.effects.call(createService('DescribePluginRate'), payload);
  }

  // 停止 and 开启
  @effect()
  *getStopAndStartPlugin(action: string, payload?: IStopAndStartPluginParams) {
    return yield this.effects.call(createService(action), payload);
  }

  // 卸载
  @effect()
  *getUninstallPlugin(payload?: IUninstallPluginParams) {
    return yield this.effects.call(createService('UninstallPlugin'), payload);
  }

  // 安装
  @effect()
  *getInstallPlugin(payload?: IInstallPluginParams) {
    return yield this.effects.call(createService('InstallPlugin'), payload);
  }

  // 状态
  @effect()
  *getQueryPluginStatus(payload?: IQueryPluginStatusParams) {
    return yield this.effects.call(createService('QueryPluginStatus'), payload);
  }

  // 手动 卸载 and 安装 Cmd
  @effect()
  *getQueryUninstallAndInstallCommand(action: string, payload?: IQueryUninstallAndInstallCommandParams) {
    return yield this.effects.call(createService(action), payload);
  }

  @effect()
  *getQueryHelmPackageAddress(payload?: CommonReq) {
    return yield this.effects.call(createService('QueryHelmPackageAddress'), payload);
  }
  // ecs table 列表数据
  @effect()
  *getQueryWaitInstallPlugin(payload?: IQueryWaitInstallPluginParams) {
    return yield this.effects.call(createService('QueryWaitInstallPlugin'), payload);
  }

  // 应用名称
  @effect()
  *getGetUserApplications(payload?: IGetUserApplicationsParams) {
    return yield this.effects.call(createService('GetUserApplications'), payload);
  }

  // 应用分组
  @effect()
  *getGetUserApplicationGroups(payload?: IGetUserApplicationsParams) {
    return yield this.effects.call(createService('GetUserApplicationGroups'), payload);
  }

  // 添加 应用 名称
  @effect()
  *getBatchInstallPlugin(payload?: IBatchInstallPluginParams) {
    return yield this.effects.call(createService('BatchInstallPlugin'), payload);
  }

  // 添加 应用 名称
  @effect()
  *getBatchQueryPluginStatus(payload?: IBatchQueryPluginStatusParams) {
    return yield this.effects.call(createService('BatchQueryPluginStatus'), payload);
  }

  // 查看探针监控
  @effect()
  *getListChaosAgentMetrics(payload?: IListChaosAgentMetricsParams) {
    return yield this.effects.call(createService('ListChaosAgentMetrics'), payload);
  }
  // 探针基本信息
  @effect()
  *getDescribePluginDetail(payload?: IDescribePluginDetailParams) {
    return yield this.effects.call(createService('DescribePluginDetail'), payload);
  }

}

export default new AgentSetting().model;

declare global {
  interface Actions {
    agentSetting: AgentSetting;
  }
}
