import { CommonReq } from 'config/interfaces';
import { IFlowInfo } from 'config/interfaces/Chaos/experiment';

export interface IExpertise extends CommonReq{
  expertise_id: string;
  basic_info: IBasicInfo;
  evaluation_info: {
    items: ITems[];

  };
  executable_info: {
    flow: IFlowInfo;
    run_time: {
      items: string[];
    };
  };
  observerNodes?: any[];
  recoverNodes?: any[];

}

export interface IBasicInfo{
  background_desc: string;
  design_concept: string;
  function_desc: string;
  name: string;
  tags: string[];
  [key: string]: any;
}

export interface IExpertiseId extends CommonReq{
  expertise_id: string | string[] | null | undefined;
}

export interface IAppCode extends CommonReq{
  appCode: string;
}

export interface ITems{
  id?: string;
  desc: string;
}
