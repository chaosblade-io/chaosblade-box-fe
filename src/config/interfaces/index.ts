export interface CommonReq {
  RegionId?: string;
  AhasRegionId?: string;
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
    ALIYUN_CONSOLE_I18N_MESSAGE: any;
    'ahas-new_zh-cn': any;
    ALIYUN_CONSOLE_CONFIG: any;
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
