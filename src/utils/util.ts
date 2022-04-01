/*
* 跳转到锚点位置
* @param {string} anchorName 类名
* block: 滚动到锚点的顶部或者底部: start/end
* behavior: 滚动效果: auto/smooth
*/
export function scrollToAnchor() {
  const anchorElement = document.getElementById('content-scroll-top');
  if (anchorElement) {
    anchorElement.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
}

// 获取语言
export const getLocal = (function(window) {
  return function() {
    let local = window?.ALIYUN_CONSOLE_CONFIG?.LOCALE;
    if (local && typeof local === 'string') {
      local = local.toLocaleLowerCase();
    } else {
      local = 'zh-cn';
    }
    return local;
  };
})(window);

// 根据环境获取请求前缀
export const getRequirePrefix = () => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? '/api/chaos' : '/chaos';
};
