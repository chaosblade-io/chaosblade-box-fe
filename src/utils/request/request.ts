import consoleRequestInterceptor from '@alicloud/console-request-interceptor';
import consoleResponseInterceptor from './consoleResponseInterceptor';
import csrfTokenErrorInterceptor from '@alicloud/fecs-csrf-token-error-interceptor';
import { axios } from '@alicloud/widget-request';

/**
 * -------------------------------------------------------------------------
 * request.js 用于处理对服务端的数据请求，为了方便开发者，此工具已经预先设置好了一些
 * 业务相关的拦截器，这些拦截器都独立封装了一部分特定的业务功能，开发者可以按需插拔。
 *
 * 另外需要额外注意的是拦截器的 use 顺序是有关的，它遵循：后使用先执行。因此，除非你知道
 * 自己在干什么，否则不要随意改变拦截器的使用顺序，这样有可能引发 widget 行为异常。
 * -------------------------------------------------------------------------
 */
// Interceptors for request
axios.interceptors.request.use(consoleRequestInterceptor);
axios.interceptors.request.use(function(config) {
  config.headers['Content-Type'] = 'application/json;charset=UTF-8';
  return config;
});

// Interceptors for response
axios.interceptors.response.use(csrfTokenErrorInterceptor);
// widgetRequest.interceptors.response.use(consoleRiskInterceptor);
axios.interceptors.response.use(consoleResponseInterceptor);

// Export the request instance
export default axios;
