/*
* 跳转到锚点位置
* @param {string} anchorName 类名
* block: 滚动到锚点的顶部或者底部: start/end
* behavior: 滚动效果: auto/smooth
*/
type Navigator = {
  language: string;
  userLanguage?: string;
};

export function scrollToAnchor() {
  const anchorElement = document.getElementById('content-scroll-top');
  if (anchorElement) {
    anchorElement.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
}

// 根据环境获取请求前缀
export const getRequirePrefix = () => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? '/api/chaos' : '/chaos';
};

export function getLanguage() {
  const navigator: Navigator = window.navigator;
  const lang = navigator.language || navigator.userLanguage || 'en';
  return localStorage.getItem('lang') || lang.split('-')[0];
}
