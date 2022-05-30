import { CommonReq } from 'config/interfaces';

export interface IAdminiStratorItem {
  permission: number;
  relationId: string;
  userId: string;
  userName: string;
  userRole: number | boolean;
}

export interface IWorkspaceInfo {
  description: string;
  experimentCount: number;
  memberCount: number;
  name: string;
  type: number;
  workspaceId: string;
  administrators?: IAdminiStratorItem[];
}

export interface IExperimentSummaryInfo {
  date?: string;
  successSize: number;
  totalSize: number;
  unexpectedSize: number;
  unexpectedRatio: number;
  successRatio: number;
}

export interface IWorkspaceIdReq extends CommonReq {
  workspaceId?: string;
}

export interface ICreateEditWorkspaceReq extends IWorkspaceIdReq {
  name?: string;
  description: string;
}

export interface IEditorWorkspaceMemberReq extends IWorkspaceIdReq {
  userId: string;
  userRole: number;
  permission?: number;
  memberRole?: number;
  userName?: string;
}

export interface ISearchWorkspaceMenberReq extends IWorkspaceIdReq {
  searchKey: string;
}

export interface IUpdateWorkspaceMemberReq extends IWorkspaceIdReq {
  members: IEditorWorkspaceMemberReq[]
}
