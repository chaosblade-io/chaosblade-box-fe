import { getCookie } from '@alicloud/cookie';
import { parse, stringify, stringifyUrl } from 'query-string';

/**
 * 解析参数
 * @param {string} s 需要解析的字符串
 * @return {object} 参数对象
 */
export const parseQuery = (function(window) {
  return function(s = ''): { [key: string]: any } {
    return parse(s || window.location.search);
  };
})(window);

/**
 * 获取 url params
 * @param {string} name 需要获取的参数名
 * @return {string | null} 参数值
 */
export const getParams = (name: string): string | null => {
  const parsed = parseQuery();
  const res = parsed[name];
  if (res) {
    return res === 'undefined' || res === 'null' || res === 'false' ? null : decodeURIComponent(res);
  }
  return null;
};

/**
 * 动态设置 url params
 * @param {string} name 需要设置的参数名
 * @param {any} value 需要设置的参数值
 */
export const setParams = (function(window) {
  return function(name: string, value: any) {
    const _originHref = window.location.origin + window.location.pathname;
    if (!name) {
      return;
    }

    let query = {};
    if (typeof name === 'string') {
      query = {
        [name]: value,
      };
    }
    if (Object.prototype.toString.call(name) === '[object Object]') {
      query = name;
    }

    const parsed = parseQuery();
    const historyStr = `?${stringify(Object.assign({}, parsed, query))}`;

    if (window.history.replaceState) {
      const url = _originHref + historyStr;
      window.history.replaceState(null, '', url);
    } else {
      window.location.hash = historyStr;
    }
  };
})(window);

function getDefaultQuery(parsedQuery: { [key: string]: string }): { [key: string]: string } {
  // 默认带上ns和region参数
  const defaultQuery: { [key: string]: string } = {};
  if (parsedQuery.ns) {
    defaultQuery.ns = parsedQuery.ns;
  }
  if (parsedQuery.region) {
    defaultQuery.region = parsedQuery.region;
  }
  return defaultQuery;
}

/**
 * 跳转路由
 * @param {any} history dva的history
 * @param {string} pathname 需要跳转的路由
 * @param {object} query 参数
 * @param {boolean} mergeCurrentQuery 是否与当前query参数合并
*/
export const pushUrl = (history: any, pathname: string, query?: { [key: string]: string | undefined | null | number }, mergeCurrentQuery = true) => {
  const currentQuery = parseQuery();
  // 默认带上ns和region参数
  const defaultQuery: { [key: string]: string } = getDefaultQuery(currentQuery);
  history.push(`${pathname}?${stringify(Object.assign(mergeCurrentQuery ? currentQuery : defaultQuery, query))}`);
};

// region 存在 cookie 的 key
export const REGION_COOKIE = 'currentRegionId';
/**
 * 获取 region
 * @return {string} region 的值
*/
export const getActiveRegion = (): string => {
  // 先从url取
  const parsed = parseQuery();
  let region = parsed.region;
  if (!region) {
    region = getCookie(REGION_COOKIE);
  }
  return (region as string) || 'cn-public';
};

/**
 * 获取 ns（namespace）
 * @return {string} namespace 的值
*/
export const getActiveNamespace = (): string => {
  const parsed = parseQuery();
  const { ns } = parsed;
  return (ns as string) || 'default';
};


/**
 * 生成 URL
 * @param {object} query 参数对象
 * @param {string} href href
 * @param {boolean} mergeCurrentQuery 是否与当前query参数合并
 * @return {string} 拼装好的URL
 */
export const generateUrl = (query: { [key: string]: string }, href?: string, mergeCurrentQuery = true): string => {
  const currentQuery = parseQuery();
  // 默认带上ns和region参数
  const defaultQuery = getDefaultQuery(currentQuery);
  return stringifyUrl({ url: href ? href : location.href, query: Object.assign(mergeCurrentQuery ? currentQuery : defaultQuery, query) });
};

/**
 * 动态删除 url params
 * @param {string} name 需要删除的参数名，不传name则删除所有参数
 */
export const removeParams = (function(window) {
  return function(name?: string) {
    const _originHref = window.location.origin + window.location.pathname;
    const parsed = parseQuery();

    let removeList: any = [];
    const nameType = Object.prototype.toString.call(name);
    if (nameType === '[object String]') {
      removeList.push(name);
    } else if (nameType === '[object Array]') {
      removeList = name;
    } else if (nameType === '[object Object]') {
      removeList = Object.keys(name!);
    } else {
      if (!name) {
        removeList = Object.keys(parsed!);
      } else {
        return;
      }
    }

    Object.keys(parsed).forEach((val: string) => {
      if (removeList.includes(val)) {
        delete parsed[val];
      }
    });

    const historyStr = `?${stringify(Object.assign({}, parsed))}`;

    if (window.history.replaceState) {
      const url = _originHref + historyStr;
      window.history.replaceState(null, '', url);
    } else {
      window.location.hash = historyStr;
    }
  };
})(window);
