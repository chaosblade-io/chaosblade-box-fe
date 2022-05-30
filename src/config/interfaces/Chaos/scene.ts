import { CommonReq } from 'config/interfaces';

export interface ICatetorItem {
  categoryId: string;
  children: ICatetorItem[];
  level: number;
  name: string;
  phase: number;
  supportScopeTypes: number[];
  type: number;
  parentId: string;
}


export interface IGetSceneDetailFunctionId extends CommonReq {
  functionId: string;
}

// 类目操作
export interface ICategoryEditorParams extends CommonReq {
  name?: string;
  parentId?: string;
  phase?: number;
  type?: number;
  supportScopeTypes?: number[];
  categoryId?: string;
}


// 演练场景interface
export interface ICategories {
  categoryId: string;
  children: ICategories[];
  level: number;
  name: string;
  parentId: string;
  phase: number;
  supportScopeTypes: number[];
  type: number;
}

export interface ISelectData {
  agentRequired: boolean;
  categoryIds: string[];
  code: string;
  description: string;
  enabled: number;
  functionId: string;
  gmtCreate: number;
  name: string;
  nextDepAppCode: string;
}

