import MetricsChart from './MetricsChart';
import React, { FC, useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styles from './index.css';
import { Badge, Balloon, Icon } from '@alicloud/console-components';
import { DEFAULT_BREADCRUMB_ITEM as defaultBreadCrumbItem } from 'config/constants';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';

import { breadCrumbConf } from 'config/constants/Manage';

const ScopesControlDetail: FC = () => {
  const id = useQuery('configurationId');
  const dispatch = useDispatch();
  const [ info, setInfo ] = useState<any>({});

  useEffect(() => {
    dispatch.pageHeader.setTitle(info && info.baseInfo && info.baseInfo.instanceName);

    dispatch.pageHeader.setBreadCrumbItems(
      [ defaultBreadCrumbItem ].concat({
        ...breadCrumbConf[/\agentmanage\//.test(location.pathname) ? 'ahaos' : 'manage'],
      }, {
        key: 'setting/datail',
        value: '探针详情',
        path: location.pathname,
      }),
    );
    dispatch.pageHeader.showBackArrow(true);
  }, [ info ]);

  function renderIpInfo() {
    const baseInfo = (info && info.baseInfo) || {};
    return (
      <div>
        <div className={styles.title}>主机信息</div>
        <div className={styles.info}>
          <div className={styles.left}>
            <div className={styles.item}>
              <div className={styles.label}>名称:</div>
              <div className={styles.value} title={baseInfo.instanceName}>
                {baseInfo.href ? <a href={baseInfo.link} target="_blank">
                  {baseInfo.instanceName}
                </a> : baseInfo.instanceName}
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>ID:</div>
              <div className={styles.value}>{baseInfo.instanceId}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>插件类型:</div>
              <div className={styles.value}>{baseInfo.pluginType}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>探针版本:</div>
              <div className={styles.value}>
                {baseInfo.upgrade ?
                  <Balloon
                    trigger={
                      (<span>
                        <Icon type="star-circle1" size='xs' className="text-warning" style={{ marginRight: '4px' }} />
                        <span className="text-primary vertical-align-middle cursor-default">{baseInfo.version}</span>
                      </span>)
                    }
                    triggerType="hover"
                  >
                    <span style={{ color: 'black' }}>
                      可升级到版本 {baseInfo.upgradeVersion}
                    </span>
                  </Balloon> : <span>{baseInfo.version}</span>
                }
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.item}>
              <div className={styles.label}>安装环境:</div>
              <div className={styles.value}>{baseInfo.installMode}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>IP:</div>
              <div className={styles.value}>{baseInfo.ip}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>插件状态:</div>
              <div className={styles.value}>{baseInfo.pluginStatusShow}</div>
            </div>
            <div className={styles.item}>
              <div className={styles.label}>启动时间:</div>
              <div className={styles.value}>{baseInfo.connectTime}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function handleBaseInfo(res: any) {
    let baseInfo = {};
    if (res && res.Data) {
      const item: any = {};
      Object.keys(res.Data).forEach((v: string) => {
        item[_.lowerFirst(v)] = res.Data[v];
      });
      let ip: any;
      let pluginStatusShow: any = '';
      let publicIpShow: any;

      if (item.pluginType === 'AHAS_AGENT') {
        publicIpShow = '（公）';
      } else {
        publicIpShow = '（主机）';
      }

      if (item.publicIp && item.privateIp) {
        ip = (
          <span>
            {item.publicIp + publicIpShow}、{item.privateIp + '（私）'}
          </span>
        );
      } else if (!item.publicIp && item.privateIp) {
        ip = (
          <span>
            {item.privateIp + '（私）'}
          </span>
        );
      } else if (item.publicIp && !item.privateIp) {
        ip = <span> {item.publicIp + publicIpShow}</span>;
      }

      switch (item.pluginStatus) {
        case 0:
          pluginStatusShow = '待安装';
          break;
        case 1:
          pluginStatusShow = '安装中';
          break;
        case -1:
          pluginStatusShow = '安装失败';
          break;
        case 2:
          pluginStatusShow = (
            <span>
              <Badge dot style={{ margin: '-2px 3px 0 0', background: 'green', zIndex: 1 }} />
                在线
            </span>
          );
          break;
        case 3:
          pluginStatusShow = (
            <span>
              <Badge dot style={{ margin: '-2px 3px 0 0', background: 'red', zIndex: 1 }} />
                离线
            </span>
          );
          break;
        case 4:
          pluginStatusShow = '卸载中';
          break;
        case 5:
          pluginStatusShow = '卸载失败';
          break;
        default:
          break;
      }

      baseInfo = {
        ...item,
        pluginStatusShow,
        ip,
        connectTime: item.connectTime
          ? moment(item.connectTime).format('YYYY-MM-DD HH:mm:ss')
          : '',
        installMode: item.installMode || '',
      };
    }
    return baseInfo;
  }

  useEffect(() => {
    (async function() {
      const param: any = {
        MetricNames: 'system.cpu.util,system.mem.util',
        ConfigurationId: id,
        StartTime: new Date().getTime() - 15 * 60 * 1000,
        EndTime: new Date().getTime(),
      };
      const [ res, res1 ] = await Promise.all([ dispatch.agentSetting.getDescribePluginDetail({ ConfigurationId: id }), dispatch.agentSetting.getListAhasAgentMetrics(param) ]);
      const baseInfo = handleBaseInfo(res);
      const metricInfo = (res1 && res1.Data) || [];

      setInfo({
        baseInfo,
        metricInfo,
      });
    })();
  }, []);
  return (
    <div className={styles.agent}>
      <div className={styles.topContent}>
        {renderIpInfo()}
      </div>
      <div className={styles.metricsContent}>
        <MetricsChart dataSource={info.metricInfo} />
      </div>
    </div>
  );

};

export default ScopesControlDetail;
