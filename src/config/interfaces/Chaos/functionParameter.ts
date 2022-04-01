import { CommonReq } from 'config/interfaces';
import { IHost } from 'config/interfaces/Chaos/experiment';

export interface IFunctionId extends CommonReq {
  functionId: string;
}

export interface ISearchEditor extends CommonReq{
  value?: string;
  hosts: IHost[];
  runParams: any[];
  appCode: string | undefined;
  alias?: string;
  configurationIds?: string[];
}

