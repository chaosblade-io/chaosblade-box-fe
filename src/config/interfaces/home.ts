import { CommonReq } from './index';
import { ReactNode } from 'react';

export interface ILayoutOrder {
  Code: string;
  description: string;
  hidden: boolean;
  layoutOrder: number;
  layoutWidth: number;
  name: string;
  required: boolean;
  content?: ReactNode;
  id?: number;
  key?: number;
}

export interface INsListData {
  createTime: number;
  description: string;
  name: string;
  namespace: string;
  regionId: string;
}

export interface IDataSource {
  code: string;
  count: number;
  name: string;
}

export interface IResult {
  items: {
    level: string;
    timestamp: string;
    message: string;
  };
}

export interface IUpDatalayoutOrder extends CommonReq {
  UserLayouts: any;
}

export interface IGetTopologyEvents extends CommonReq {
  PageNo: number;
  PageSize: number;
  Keyword: string;
}

export interface IFailureRehearse extends CommonReq {
  args?: string;
}

export interface IGetOverviewBasicReq extends CommonReq {
  RequestTimestamp?: number;
}

export interface IGetLivedPluginCount extends CommonReq {
  NamespaceId?: string;
}

export interface ICreateNamespace extends CommonReq {
  Name?: string;
}

export interface ICaculatePrice extends CommonReq {
  NumNodes: number;
  Days: number;
}

export interface IGlobalDataPackages {
  expireTime: string;
  packageType: string;
  remaining: string;
  specification: string;
  startTime: string;
}
