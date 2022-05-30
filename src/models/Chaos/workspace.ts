import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { ICreateEditWorkspaceReq, ISearchWorkspaceMenberReq, IUpdateWorkspaceMemberReq, IWorkspaceIdReq } from 'config/interfaces/Chaos/workspace';

@dvaModel('workspace')
class WorkSpace extends BaseModel {

  state = {
    workspaceInfo: {
      description: '',
      name: '我的空间',
      workspaceId: '',
    },
  };

  @reducer
  setWorkspaceInfo(info: any) {
    return {
      ...this.state,
      workspaceInfo: {
        ...info,
      },
    };
  }

  @effect()
  *geManaeWorkspace() {
    return yield this.effects.call(createServiceChaos('GetMyManageWorkspace'));
  }

  @effect()
  *geJoinWorkspace() {
    return yield this.effects.call(createServiceChaos('GetMyJoinWorkspace'));
  }

  @effect()
  *getExperimentSummaryDays() {
    return yield this.effects.call(createServiceChaos('GetExperimentSummaryIn30Days'));
  }

  @effect()
  *getExperimentSummary() {
    return yield this.effects.call(createServiceChaos('GetExperimentSummary'));
  }

  @effect()
  *deleteWorkspace(payload: IWorkspaceIdReq) {
    return yield this.effects.call(createServiceChaos('DeleteWorkspace'), payload);
  }

  @effect()
  *createWorkspace(payload: ICreateEditWorkspaceReq) {
    return yield this.effects.call(createServiceChaos('AddWorkspace'), payload);
  }

  @effect()
  *updateMyWorkspaceBaseInfo(payload: ICreateEditWorkspaceReq) {
    return yield this.effects.call(createServiceChaos('UpdateMyWorkspaceBaseInfo'), payload);
  }

  @effect()
  *getGeneralWorkSpaceBaseInfo(payload: IWorkspaceIdReq) {
    const data = yield this.effects.call(createServiceChaos('GetGeneralWorkSpaceBaseInfo'), payload);
    yield this.effects.put(this.setWorkspaceInfo(data && data.Data));
    return data;
  }

  @effect()
  *updateGeneralWorkspaceBaseInfo(payload: ICreateEditWorkspaceReq) {
    return yield this.effects.call(createServiceChaos('UpdateGeneralWorkspaceBaseInfo'), payload);
  }

  @effect()
  *getListWorkspaceMember(payload: IWorkspaceIdReq) {
    return yield this.effects.call(createServiceChaos('ListWorkspaceMember'), payload);
  }

  @effect()
  *updateWorkspaceMember(payload: IUpdateWorkspaceMemberReq) {
    return yield this.effects.call(createServiceChaos('UpdateWorkspaceMember'), payload);
  }

  @effect()
  *searchWorkspaceMember(payload: ISearchWorkspaceMenberReq) {
    return yield this.effects.call(createServiceChaos('SearchWorkspaceMember'), payload);
  }

}

export default new WorkSpace().model;

declare global {
  interface Actions {
    workspace: WorkSpace;
  }
}
