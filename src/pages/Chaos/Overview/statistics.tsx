import React, { memo, useEffect, useState } from 'react';
import classnames from 'classnames';
import styles from './index.css';

import { Balloon, Icon, Loading } from '@alicloud/console-components';
import { IUserAgent, IUserAgentBase, IUserExperimentInfo, IUserScene } from 'config/interfaces/Chaos/overview';

import { useDispatch } from 'utils/libs/sre-utils-dva';

import LogChart from './logChart';
const Tooltip = Balloon.Tooltip;

interface Props {
  skipUrl: (str: string, params?:any) => void;
}
const Statistics: React.FC<Props> = props => {
  const { skipUrl } = props;
  const dispatch = useDispatch();
  const [ loadings, setLoadings ] = useState<string[]>([]);
  const [ userAgent, setUserAgent ] = useState<IUserAgent>({});
  const [ userScene, setUserScene ] = useState<IUserScene[]>([]);
  const [ experimentStatis, setExperimentStatis ] = useState<IUserExperimentInfo|any>({});
  const [ expands, setExpands ] = useState<string[]>([]);
  useEffect(() => {
    setLoadings([ ...loadings, 'agent', 'scene', 'experiment' ]);
    const getUserAgentData = async () => {
      const res = await dispatch.archIndex.getUserAgent();
      setLoadings(loadings.filter(item => item !== 'agent'));
      setUserAgent(res);
    };
    const getUserSceneData = async () => {
      const res = await dispatch.archIndex.getUserScene();
      setLoadings(loadings.filter(item => item !== 'scene'));
      setUserScene(res);
    };
    const getExperimentStatistics = async () => {
      const res = await dispatch.archIndex.getExperimentStatistics();
      setLoadings(loadings.filter(item => item !== 'experiment'));
      setExperimentStatis(res);
    };
    getUserAgentData();
    getUserSceneData();
    getExperimentStatistics();
  }, []);

  useEffect(() => {
    const _expands: string[] = [];
    const { cluster, host } = userAgent || {};
    if (cluster && host) {
      if (cluster.totalCount > 0 && host.totalCount > 0) {
        !_expands.includes('agent') && _expands.push('agent');
      }
    }
    if (experimentStatis?.total > 0) {
      !_expands.includes('experiment') && _expands.push('experiment');
    }
    setExpands(_expands);
  }, [ userAgent, experimentStatis ]);
  const renderUserAgent = (data: IUserAgentBase | any, typeName: string, type: number) => {
    const { onlineCount, totalCount, normalCount, errorCount } = data || {};
    return (
      <>
        <div
          className={classnames(styles.sItem, styles.canClink)}
          onClick={() => {
            skipUrl('/chaos/experiment/scope/control', { type });
          }}
        >
          <span>{typeName}</span>
          <div className={styles.bigNum}>{totalCount ?? '-'}</div>
        </div>
        <div
          className={classnames(styles.sItem, styles.canClink)}
          onClick={() => {
            skipUrl('/chaos/experiment/scope/control', { type });
          }}
        >
          <span>在线数目</span>
          <div>{onlineCount ?? '-'}</div>
        </div>
        <div
          className={classnames(styles.sItem, styles.canClink)}
          onClick={() => {
            skipUrl('/chaos/experiment/scope/control', { type });
          }}
        >
          <span>正常数目</span>
          <div style={{ color: '#63BA4D' }}>{normalCount ?? '-'}</div>
        </div>
        <div
          className={classnames(styles.sItem, styles.canClink)}
          onClick={() => {
            skipUrl('/chaos/experiment/scope/control', { type });
          }}
        >
          <span>异常数目</span>
          <div style={{ color: '#D93026' }}>{errorCount ?? '-'}</div>
        </div>
      </>
    );
  };
  const changeExpands = (flag: string) => {
    if (expands.includes(flag)) {
      setExpands(expands.filter(item => item !== flag));
    } else {
      setExpands([ ...expands, flag ]);
    }
  };
  const { cluster, host } = userAgent;
  const { active, failure, idle, running, success, total } = experimentStatis;
  return (
    <>
      <div className={styles.segment}>
        <div className={styles.header} style={{ margin: 0 }}>
          <div className={styles.title}>演练 <Tooltip trigger={<Icon type="warning" size="xs" style={{ color: '#888' }}/>} align="r">我的空间下演练统计！</Tooltip></div>
          <div className={styles.btn} data-type="link" onClick={() => changeExpands('experiment')}>{expands.includes('experiment') ? '收起' : '展开'}</div>
        </div>
        <Loading style={{ display: 'block', width: '100%' }} visible={loadings.includes('experiment')}>
          {expands.includes('experiment') &&
            <div className={styles.statistic}>
              <div style={{ width: '120px' }} className={classnames(styles.sItem, styles.canClink)} onClick={() => {
                skipUrl('/chaos/workspace/owner');
              }}>
                <span>总演练数</span>
                <div className={styles.bigNum}>{total ?? '-'}</div>
              </div>
              <div className={classnames(styles.flexLayout, styles.leftBorder, styles.rightBoarer)} style={{ flexGrow: 1, marginRight: '42px' }}>
                <div className={classnames(styles.sItem, styles.canClink)} onClick={() => {
                  skipUrl('/chaos/workspace/owner');
                }}>
                  <span>执行演练数</span>
                  <div className={styles.bigNum}>{ active ?? '-'}</div>
                </div>
                <div className={classnames(styles.sItem, styles.canClink)} onClick={() => {
                  skipUrl('/chaos/workspace/owner', { _st: 2 });
                }}>
                  <span>运行中</span>
                  <div>{ running ?? '-'}</div>
                </div>
                <div className={classnames(styles.sItem, styles.canClink)} onClick={() => {
                  skipUrl('/chaos/workspace/owner', { _st: 1 });
                }}>
                  <span>成功</span>
                  <div style={{ color: '#63BA4D' }}>{ success ?? '-'}</div>
                </div>
                <div className={classnames(styles.sItem, styles.canClink)} onClick={() => {
                  skipUrl('/chaos/workspace/owner', { _st: '3,4,5' });
                }}>
                  <span>失败</span>
                  <div style={{ color: '#D93026' }}>{failure ?? '-'}</div>
                </div>
              </div>
              <div style={{ width: '120px' }} className={classnames(styles.sItem, styles.canClink)} onClick={() => {
                skipUrl('/chaos/workspace/owner');
              }}>
                <span>未执行演练数</span>
                <div className={styles.bigNum}>{idle ?? '-'}</div>
              </div>
            </div>
          }
        </Loading>
      </div>
      <Loading style={{ display: 'block', width: '100%' }} visible={loadings.includes('agent')}>
        <div className={styles.segment}>
          <div className={styles.header} style={{ margin: 0 }}>
            <div className={styles.title}>探针</div>
            <div className={styles.btn} data-type="link" onClick={() => changeExpands('agent')}>{expands.includes('agent') ? '收起' : '展开'}</div>
          </div>
          {expands.includes('agent') &&
            <div className={styles.statistic}>
              <div className={classnames(styles.flexLayout, styles.rightBoarer)} style={{ width: '50%', paddingRight: '24px' }}>
                {renderUserAgent(host, '主机探针', 0)}
              </div>
              <div className={styles.flexLayout} style={{ width: '50%', paddingLeft: '24px' }}>
                {renderUserAgent(cluster, '集群探针', 2)}
              </div>
            </div>
          }
        </div>
      </Loading>
      <LogChart showGuide={true}/>
      <div className={styles.segment}>
        <div className={styles.header}>
          <div className={styles.title}>常用演练场景</div>
          <div className={styles.btn} data-type="link" onClick={() => skipUrl('/chaos/scenes')}>查看全部</div>
        </div>
        <Loading style={{ display: 'block', width: '100%' }} visible={loadings.includes('scene')}>
          <div className={styles.sceneDemos}>
            {userScene?.map((item, index) => {
              const { name, sceneTarget, sceneType, appCode } = item;
              return (
                <div key={index}>
                  <div className={styles.desp}>{sceneTarget}/{sceneType}</div>
                  <div className={styles.title}>{name}</div>
                  <div className={styles.btn} data-type="link" onClick={() => skipUrl('/chaos/experiment/editor', { code: appCode })}>创建演练</div>
                </div>
              );
            })}
          </div>
        </Loading>
      </div>
    </>
  );
};

export default memo(Statistics);
