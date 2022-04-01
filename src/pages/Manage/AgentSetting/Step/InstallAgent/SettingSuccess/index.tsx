import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { IQueryPluginStatusResult } from 'config/interfaces';
import { Icon } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const SettingSuccess: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const [ installedAgent, setInstalledAgent ] = useState<IQueryPluginStatusResult[]>([]); // 安装成功
  const timer = useRef<any>();
  // 探针数量
  useEffect(() => {
    const fetchData = async (loop = false) => {
      const { Data: installedAgent = [] } = await dispatch.agentSetting.getQueryRecentlyInstalledAhasAgent({
        Loop: loop,
      });
      setInstalledAgent(installedAgent);
    };
    timer.current = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <div style={{ margin: '20px 0 70px 0', border: '1px solid #ddd', padding: '20px 30px' }}>
      <p style={{ borderLeft: '4px solid #00c4e2', paddingLeft: '10px' }}>
        探针正在安装，已有{installedAgent.length}个探针接入
      </p>
      <ul>
        {installedAgent.map(item => (
          <li>
            实例名称 {item.instanceName}
            <Icon
              type="success-filling"
              size="xs"
              style={{ color: 'green', marginLeft: '10px' }}
            />
          </li>
        ))}
      </ul>
      <p style={{ color: '#aaa' }}>
        {installedAgent.length > 0 ? (
          <span>
            <a
              onClick={() => pushUrl(history, '/archMap')}
            >
              点此
            </a>
            查看数据
          </span>
        ) : (
          <span>
            无数据！
          </span>
        )}
      </p>
    </div>
  );
};

export default memo(SettingSuccess);
