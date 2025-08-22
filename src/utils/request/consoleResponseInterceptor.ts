import * as _ from 'lodash';
import i18n from '../../i18n';
import locale from 'utils/locale';
import { Dialog, Message } from '@alicloud/console-components';
import { ERROR_CODE_ENUM } from 'config/constants';

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
      default : Message.error(resMessage || i18n.t('Request failed'));
    }
  }
};

const ERROR_CODE: any = {
  API_VERSION_FORBIDDEN: i18n.t('Passing the version parameter is not allowed'),
  GetHiddenAcccessKeyWrong: i18n.t('Error in getting AK information'),
  ApiNotFound: i18n.t('This openApi is not supported'),
  ApiDefineWrong: i18n.t('RestfulAPI does not define API configuration'),
  InvalidParameters: i18n.t('Parameter error'),
  PostonlyOrTokenError: i18n.t('Refresh page'),
  InvalidEndpoint: i18n.t('Endpoint configuration error'),
  ConsoleNeedLogin: i18n.t('Login failed'),
};

const ERROR_MESSAGE: any = {
  'The request has failed due to a temporary failure of the server.':
  i18n.t('Request timed out'),
};

const handleRefresh = (response: any) => {
  if ([ 'PostonlyOrTokenError', 'ConsoleNeedLogin' ].includes(response.code)) {
    if (!document.getElementById('token_old_dialog')) {
      Dialog.confirm({
        id: 'token_old_dialog',
        title: i18n.t('System hint').toString(),
        content: i18n.t('It has not been operated for a long time, for your data safety, please click OK and try again').toString(),
        onOk: () => window.location.reload(),
        locale: locale().Dialog,
      });
      throw new Error(i18n.t('Refresh page'));
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
      let errMes = i18n.t('Proxy interface exception');
      if (apiResponseData.code === '1005') {
        errMes = i18n.t('The current user does not have permission to operate');
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
      const errMes = `${ERROR_CODE[apiResponseData.code] || i18n.t('Request failed')}: ${
        ERROR_MESSAGE[apiResponseData.message] || apiResponseData.message
      }`;
      // Message.error(errMes);
      throw new Error(errMes);
    }
    return apiResponseData;
  }
  handleRefresh(apiResponseData);
  if (!ignoreError) {
    const errMes = `${ERROR_CODE[apiResponseData.code] || i18n.t('Request failed')}`;
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
