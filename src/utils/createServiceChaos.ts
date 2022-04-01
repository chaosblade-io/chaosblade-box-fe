import request from './request/request';
import { CommonReq } from 'config/interfaces';
import { Message } from '@alicloud/console-components';
import { getActiveNamespace } from 'utils/libs/sre-utils';
import { getRequirePrefix } from 'utils/util';

interface OptionParams {
  apiType?: string;
  ignoreError?: boolean;
  description?: string;
  useCors?: boolean;
}

const prefix = getRequirePrefix();
function createServiceChaos(
  action?: string,
  {
    apiType = 'open',
    ignoreError = false,
    description = undefined,
    useCors = false,
  }: OptionParams = {},
) {
  if (!action) {
    return () => request({
      url: `${prefix}/${action}`,
      method: 'post',
      data: {},
      apiType, // one-console 对应的接口类型
      useCors, // 是否使用 fecs 提供的跨域接口
      ignoreError, // 是否忽略 api 异常
      description, // 当前请求的描述
    });
  }
  return (params: CommonReq = {}) => {
    const namespace = getActiveNamespace();
    const args = {
      ...params, namespace,
      Lang: 'zh',
      Namespace: namespace,
    };
    return request({
      url: `${prefix}/${action}`,
      method: 'post',
      data: args,
      apiType,
      useCors,
      ignoreError,
      description: description || action,
    }).catch((e: Error) => {
      Message.error(e.message);
    });
  };
}

export default createServiceChaos;
