/* eslint-disable no-bitwise */
// 对灰度用户过滤
// 校验权限
export const handleIsAdmin = (permission: number, flag: number) => {
  // eslint-disable-next-line no-bitwise
  if ((permission & flag) === flag) {
    return true;
  }
  return false;
};
