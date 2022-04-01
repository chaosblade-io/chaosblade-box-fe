import { parseQuery } from 'utils/libs/sre-utils';
import { useEffect, useState } from 'react';
import { useHistory } from 'dva';

/**
 * 获取最新的query参数
 * @param {string} key 参数的key
 * @return {string} 参数最新的值
 */
export const useQuery = (key: string): string => {
  const history = useHistory();
  const parsed = parseQuery();
  const [ val, setVal ] = useState(parsed[key]);
  useEffect(() => {
    return history.listen(() => {
      const parsed = parseQuery();
      const newVal = parsed[key];
      if (newVal !== val) {
        setVal(parsed[key]);
      }
    });
  }, []);
  return val;
};
