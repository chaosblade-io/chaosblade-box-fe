import { useEffect, useRef } from 'react';

/**
 * 定时执行任务
 * @param {function} callback 执行的回调
 * @param {number|null} delay 间隔时长
 */
export const useInterval = (callback: () => any, delay: number | null) => {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    // eslint-disable-next-line
    // @ts-ignore
    savedCallback.current = callback;
  }, [ callback ]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        // eslint-disable-next-line
        // @ts-ignore
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [ delay ]);
};
