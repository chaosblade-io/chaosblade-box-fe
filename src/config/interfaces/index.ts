export interface CommonReq {
  RegionId?: string;
  chaosRegionId?: string;
  Lang?: string;
  NameSpace?: string;
  Namespace?: string; // 够呛，不同接口还有大小写问题。。
}

export interface Namespace {
  name: string;
  namespace: string;
}
declare global {
  interface Window {
    goldlog: any;
    'chaos-new_zh-cn': any;
    [key: string]: any;
  }
}

export interface IBreadCrumbItem {
  key: string;
  value: string;
  path: string;
  params?: { [key: string]: string | undefined | null | number };
}

export * from './home';
export * from './Manage';
