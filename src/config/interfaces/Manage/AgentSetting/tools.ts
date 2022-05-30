import { CommonReq } from '../../index';

export interface IGetList extends CommonReq {
  installMode: string;
  operateId: string;
  // configurationId?: string;
  // clusterId?: string;
}

export interface IGetListResItem {
  copyright: string;
  description: string;
  latest: string;
  logo: string;
  name: string;
  readme: string;
  subTitle: string;
  title: string;
  webSite: string;
  installed: boolean;
  unInstalled: boolean;
}

export interface IInstall extends CommonReq {
  // configurationId?: string; // 用 operateId 和  installMode 代替 installMode 和 clusterId
  // clusterId?: number;
  operateId: string;
  installMode: string;
  name: string;
  version: string;
  toolsNamespace: string;
}

export interface IUninstall extends CommonReq {
  // configurationId?: string;
  // clusterId?: number;
  operateId: string;
  installMode: string;
  name: string;
  version: string;
}
