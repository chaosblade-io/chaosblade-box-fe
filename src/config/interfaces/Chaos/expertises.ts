import { CommonReq } from 'config/interfaces';

export interface IExpertiseCom extends CommonReq {
  page: number;
  size: number;
  key?: string;
  tagNames?: string[];
  scopeType?: string;
}

export interface IExpertiseAdminActionAndDetail extends CommonReq {
  expertise_id: number | string;
}

export interface ISearchExpertiseRes {
  expertise_id: string;
  flow: IExpertiseFlow;
  function_desc: string;
  name: string;
  tags: string[];
  state?: number;
}

interface IExpertiseFlow {
  activities: IFlowActivetie[];
}

interface IFlowActivetie {
  name: string;
  phase: string;
}

export interface IGetListUserTagsByType extends CommonReq {
  type?: number;
  key: string;
}
