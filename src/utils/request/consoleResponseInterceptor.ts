import { Dialog, Message } from '@alicloud/console-components';
import { ERROR_CODE_ENUM } from 'config/constants';

import _ from 'lodash';

/*
* 校验 Request Code
* @param {string} resCode 错误码
* @param {string} resMessage 错误提示
*/
const checkRequestCode = (response: any, resCode: string, resMessage?: string) => {
  const ignoreError = response.config.ignoreError;
  if (!ignoreError) {
    const { demoNoOpt, systemError } = ERROR_CODE_ENUM;
    switch (resCode) {
      // demo示例下无权限操作
      case demoNoOpt.code : Message.error({ content: resMessage });
        break;
      // 接口请求失败
      case systemError.code : Message.error(systemError.message);
        break;
      default : Message.error(resMessage || '请求失败');
    }
  }
};

const ERROR_CODE: any = {
  API_VERSION_FORBIDDEN: '不允许传送version参数',
  GetHiddenAcccessKeyWrong: '获取AK信息错误',
  ApiNotFound: '未支持该openApi',
  ApiDefineWrong: 'RestfulAPI未定义API配置',
  InvalidParameters: '参数错误',
  PostonlyOrTokenError: '刷新页面',
  InvalidEndpoint: 'endpoint配置错误',
  ConsoleNeedLogin: '登陆失效',
};

const ERROR_MESSAGE: any = {
  'The request has failed due to a temporary failure of the server.':
    '请求超时',
};

const handleRefresh = (response: any) => {
  if ([ 'PostonlyOrTokenError', 'ConsoleNeedLogin' ].includes(response.code)) {
    if (!document.getElementById('token_old_dialog')) {
      Dialog.confirm({
        id: 'token_old_dialog',
        title: '系统提示',
        content: '长时间未操作，为了您的数据安全，请点击确认并重试',
        onOk: () => window.location.reload(),
      });
      throw new Error('刷新页面');
    }
  }
};

const CommonRes = (response: any) => {
  let apiResponseData = response.data || {};
  const ignoreError = response.config?.ignoreError;
  // 多api不处理
  if (apiResponseData.withFailedRequest === true) return apiResponseData;

  if (response.config.proxy) {
    if (
      apiResponseData.code === '200' &&
      apiResponseData?.data?.RouteResponseBody
    ) {
      apiResponseData = apiResponseData.data.RouteResponseBody;
    } else {
      let errMes = '代理接口异常';
      if (apiResponseData.code === '1005') {
        errMes = '当前用户无操作权限';
      }
      Message.error(errMes);
      throw new Error(errMes);
    }
  }
  if (apiResponseData.code + '' === '200' || apiResponseData.success) {
    // 数据处理
    if (apiResponseData.hasOwnProperty('result') && !apiResponseData.hasOwnProperty('Data')) {
      apiResponseData.Data = _.cloneDeep(apiResponseData.result);
      delete apiResponseData.result;
    }
    apiResponseData.Success = apiResponseData.success;
    return apiResponseData;
  } else if (apiResponseData.message) {
    handleRefresh(apiResponseData);
    if (!ignoreError) {
      const errMes = `${ERROR_CODE[apiResponseData.code] || '请求失败'}: ${
        ERROR_MESSAGE[apiResponseData.message] || apiResponseData.message
      }`;
      // Message.error(errMes);
      throw new Error(errMes);
    }
    return apiResponseData;
  }
  handleRefresh(apiResponseData);
  if (!ignoreError) {
    const errMes = `${ERROR_CODE[apiResponseData.code] || '请求失败'}`;
    Message.error(errMes);
    throw new Error(errMes);
  }
  return apiResponseData;
};

function consoleResponseInterceptor(response: any) {
  const res = CommonRes(response);
  // 由于msha-GetUserProductInfo接口，succes首字母小写，做兼容处理。
  if (res.success) {
    return res;
  }

  if (!res.Success) {
    checkRequestCode(response, res.Code || '200', res.Message);
  }

  return res || {};
}

export default consoleResponseInterceptor;
