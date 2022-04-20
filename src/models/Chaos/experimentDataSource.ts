// 演练依赖数据，如tags，ip等
import _ from 'lodash';
import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { IAppGet, IAppLications, IApplicationGroup, ICheckResult, ICount, IDeviceTags, IFlow, IFlowGroup, IGetApp, IGetCloudServiceInstanceList, IGetScopeByApplication, IGetScopeNoApplication, IHost, IInitMiniFlowByAppCode, ISearchKey, IWorkSpaces } from 'config/interfaces/Chaos/experiment';
import { ILabel } from 'config/interfaces/Chaos/components';

interface IExperimentDataSourceState {
  tags: string[];
  applications: IAppLications[];
  cloudList: any[];
  groups: any[];
  scopes: {
    scopesByApp: {
      data: IHost[];
      total: number;
    };
    scopesNoApp: {
      data: IHost[];
      total: number;
    };
    cloudInstanceList: {
      data: IHost[];
      total: number;
    }
  };
  workSpaces: ILabel[];
}

const DEFAULT_STATE: IExperimentDataSourceState = {
  tags: [],
  applications: [],
  cloudList: [],
  groups: [],
  scopes: {
    scopesByApp: {
      data: [],
      total: 0,
    },
    scopesNoApp: {
      data: [],
      total: 0,
    },
    cloudInstanceList: {
      data: [],
      total: 0,
    },
  },
  workSpaces: [],
};

@dvaModel('experimentDataSource')
class ExperimentDataSource extends BaseModel {
  state: IExperimentDataSourceState = DEFAULT_STATE;

  @reducer
  setTags(payload: IExperimentDataSourceState['tags']) {
    let { tags } = this.state;
    if (!_.isEmpty(payload)) {
      tags = _.uniq(_.map(payload, 'label'));
    }
    return {
      ...this.state,
      tags,
    };
  }

  @reducer
  setWorkSpaces(payload: IWorkSpaces[]) {
    let { workSpaces } = this.state;
    const newWorkSpaces: ILabel[] = [];
    if (!_.isEmpty(payload)) {
      payload.forEach(item => {
        newWorkSpaces.push({
          label: item && item.name,
          value: item && item.workspaceId,
        });
      });
    }

    workSpaces = _.cloneDeep(newWorkSpaces);
    return {
      ...this.state,
      workSpaces,
    };
  }

  @reducer
  setApplication(payload: IAppGet[]) {
    let { applications } = this.state;
    const newApplication: any[] = [];
    if (!_.isEmpty(payload)) {
      payload.forEach((app: IAppGet) => {
        newApplication.push({
          value: app.app_id,
          label: app.app_name,
          scopesType: app.scope_type,
          appType: app.app_type,
          osType: app.os_type,
        });
      });
    }
    applications = _.cloneDeep(newApplication);
    return {
      ...this.state,
      applications,
    };
  }

  @reducer
  setCloudList(payload: IExperimentDataSourceState['cloudList']) {
    let { cloudList } = this.state;
    const newCloudList: any[] = [];
    if (!_.isEmpty(payload)) {
      payload.forEach(i => {
        newCloudList.push({
          value: i.key,
          label: i.value,
        });
      });
    }
    cloudList = _.cloneDeep(newCloudList);
    return {
      ...this.state,
      cloudList,
    };
  }

  @reducer
  setApplicationGroup(payload: IExperimentDataSourceState['groups']) {
    return {
      ...this.state,
      groups: payload,
    };
  }

  @reducer
  setScopesByApp(payload: IExperimentDataSourceState['scopes'] | any) {
    return {
      ...this.state,
      scopes: {
        scopesByApp: payload,
        scopesNoApp: {
          data: [],
          total: 0,
        },
      },
    };
  }

  @reducer
  setScopesNoApp(payload: IExperimentDataSourceState['scopes']) {
    return {
      ...this.state,
      scopes: {
        scopesNoApp: payload,
        scopesByApp: {
          data: [],
          total: 0,
        },
      },
    };
  }

  @reducer
  cloudInstanceList(payload: IExperimentDataSourceState['scopes']) {
    const { scopes } = this.state;
    return {
      ...this.state,
      scopes: {
        ...scopes,
        cloudInstanceList: payload,
      },
    };
  }

  @effect()
  *getTags(payload: ISearchKey) {
    const { Data: tags } = yield this.effects.call(createServiceChaos('SearchTags'), payload);
    yield this.effects.put(this.setTags(tags));
  }

  // @effect()
  // *getWorkSpaces() {
  //   const { Data: workSpaces } = yield this.effects.call(createServiceChaos('ListUserWorkspaces'));
  //   yield this.effects.put(this.setWorkSpaces(workSpaces));
  // }

  // 应用
  @effect()
  *getApplication(payload?: IGetApp) {
    const { Data } = yield this.effects.call(createServiceChaos('GetUserApplications'), payload);
    yield this.effects.put(this.setApplication(Data.data));
    return Data;
  }

  @effect()
  *getApplicationGroup(payload: IApplicationGroup) {
    const { Data: groups } = yield this.effects.call(createServiceChaos('GetUserApplicationGroups'), payload);
    yield this.effects.put(this.setApplicationGroup(groups));
    return groups;
  }

  @effect()
  *getScopeByApplication(payload: IGetScopeByApplication, callback: (scopes: any) => void) {
    const { app_group, app_id } = payload;
    if (app_group?.length !== 0 && app_id) {
      const { Data: scopes } = yield this.effects.call(createServiceChaos('GetScopesByApplication'), payload);
      yield this.effects.put(this.setScopesByApp(scopes));
      callback && callback(scopes);
    } else {
      yield this.effects.put(this.setScopesByApp({ data: [], total: 0 }));
      callback && callback({});
    }
  }

  @effect()
  *getScopeNoApplication(payload: IGetScopeNoApplication, callback: (scopes: any) => void) {
    const { Data: scopes } = yield this.effects.call(createServiceChaos('UserScope'), payload);
    yield this.effects.put(this.setScopesNoApp(scopes));
    callback && callback(scopes);
  }

  // 云服务实例
  @effect()
  *getCloudServiceInstanceList(payload: IGetCloudServiceInstanceList, callback: (scopes: any) => void) {
    const { Data: list } = yield this.effects.call(createServiceChaos('GetCloudServiceInstanceList'), payload);
    yield this.effects.put(this.cloudInstanceList(list));
    callback && callback(list);
  }

  // 微流程
  @effect()
  *initMiniFlow(payload: IInitMiniFlowByAppCode, callback?: (Data: IFlow) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('InitMiniFlowByAppCode'), payload);
    callback && callback(Data);
  }

  @effect()
  *checkActivityGroupDefinition(payload: IFlowGroup, callback?: (Data: ICheckResult) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('CheckActivityGroupDefinition'), payload);
    callback && callback(Data);
  }

  @effect()
  *getSearchDeviceTags(payload: IDeviceTags, callback?: (Data: string[]) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('SearchDeviceTags'), payload);
    callback && callback(Data);
  }

  @effect()
  *getSearchK8sNamespaceTags(payload: IDeviceTags, callback?: (Data: string[]) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('SearchClusterNamespace'), payload);
    callback && callback(Data);
  }

  @effect()
  *getSearchClusterNameTags(payload: IDeviceTags, callback?: (Data: string[]) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('SearchClusterNames'), payload);
    if (Data) {
      const result: any = [];
      for (const i in Data) {
        result.push({ label: Data[i], value: i });
      }
      callback && callback(result);
      return;
    }
    callback && callback([]);
  }

  @effect()
  *countUserApplicationGroups(payload: ICount, callback?: (Data: any) => void) {
    const { Data } = yield this.effects.call(createServiceChaos('CountScopesByApplication'), payload);
    callback && callback(Data);
  }
}

export default new ExperimentDataSource().model;

declare global {
  interface Actions {
    experimentDataSource: ExperimentDataSource;
  }
}
