import request from './request/request';
import { CommonReq } from 'config/interfaces';
import { Message } from '@alicloud/console-components';
import { getActiveNamespace } from 'utils/libs/sre-utils';
import { getLanguage, getRequirePrefix } from 'utils/util';

interface OptionParams {
  apiType?: string; // one-console 对应的接口类型
  ignoreError?: boolean; // 是否忽略 api 异常
  description?: string; // 当前请求的描述
  useCors?: boolean; // 是否使用 fecs 提供的跨域接口
  proxy?: boolean; // 是否代理接口
}
const prefix = getRequirePrefix();
function createService(
  action: string,
  {
    apiType = 'open',
    ignoreError = false,
    description = undefined,
    useCors = false,
    proxy = false,
  }: OptionParams = {},
) {
  return (params: CommonReq = {}) => {
    if (!params.Namespace) {
      params.NameSpace = params.Namespace = getActiveNamespace(); // 大小写问题，兼容不同接口。。
    }
    params.Lang = getLanguage() === 'zh' ? 'zh' : 'en';
    return request({
      url: `${prefix}/${action}`,
      method: 'post',
      data: params,
      apiType,
      ignoreError,
      useCors,
      description: description || action,
      proxy,
    }).catch((e: Error) => {
      Message.error(e.message);
    });
  };
}

export default createService;
