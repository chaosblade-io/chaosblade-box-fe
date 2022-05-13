import React, { useEffect, useState } from 'react';
import Translation from '../../../components/Translation';
import classnames from 'classnames';
import styles from './index.css';
import { compTypes } from './constants';

import { Icon, Loading, Tab } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

import { IUserExperiment } from 'config/interfaces/Chaos/overview';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';

import Guide from './guide';
import NotifyLs from './notifyLs';
import Statistics from './statistics';
import SvgIcon from './customeIcon';

import { customIconUrl } from 'config/constants';

const arrowIcon = <Icon type="wind-arrow-right"/>;
const CustomIcon = Icon.createFromIconfontCN({
  scriptUrl: customIconUrl,
});

const WorkspaceDetail = () => {
  const dispatch = useDispatch();
  const [ showGuide ] = useState(false); // 是否显示引导
  const [ loadings, setLoadings ] = useState<string[]>([]);
  const [ expertiseLs, setExpertiseLs ] = useState<IUserExperiment[]>([]);
  const [ currPage, setCurrPage ] = useState<number>(1);
  const [ pages, setPages ] = useState<number>(1); // 页数
  const history = useHistory();
  useEffect(() => {
    dispatch.pageHeader.setTitle('');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: '/chaos/overview',
        value: '概览',
        path: '',
      },
    ]));
  }, []);
  useEffect(() => {
    getExpertiseLs();
  }, [ currPage ]);
  const getExpertiseLs = async () => {
    setLoadings([ ...loadings, 'expertiseLs' ]);
    const res = await dispatch.archIndex.getExpertiseLs({ page: currPage, size: 4 });
    const { pages, content } = res || {};
    setExpertiseLs(content || []);
    setPages(pages);
    setLoadings(loadings.filter(item => item !== 'expertiseLs'));
  };
  const skipUrl = (url:string, params = {}) => {
    pushUrl(history, url, params);
  };
  const renderExpertiseCards = () => {
    return (
      <>
        <div style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
          <Translation>A set of exercise templates for a failure effect or system component</Translation>
        </div>
        <Loading style={{ display: 'block' }} visible={loadings.includes('expertiseLs')}>
          <div className={styles.cards}>
            {expertiseLs.map((item, index) => {
              const { expertiseName: title, expertiseDescription: desp, expertiseTargetType: tag, expertiseId, expertiseTargetIcon } = item;
              return (
                <div key={index} className={classnames(styles.cardItem, styles.expertiseItem)} style={{ width: '24%' }}>
                  <div className={styles.cardTitle} title={title}>{title}</div>
                  <div className={styles.cardDesp} title={desp}>{desp}</div>
                  <div className={styles.cardTag}>
                    <CustomIcon type={expertiseTargetIcon}/>
                    {tag}
                  </div>
                  <div>
                    <div className={styles.btn} data-type='blue' onClick={() => {
                      dispatch.experimentEditor.setClearExperiment();
                      skipUrl('/chaos/experiment/editor', { expertiseId });
                    }}>
                      <Translation>Create drill</Translation>
                    </div>&nbsp;&nbsp;
                    <div className={styles.btn} data-type='no' onClick={() => pushUrl(history, '/chaos/expertise/detail/', { expertiseId })}>查看详情</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Loading>
        <div
          className={styles.btn}
          style={{ textAlign: 'right', width: '100%', padding: '6px 0' }}
          data-type='link'
          onClick={() => setCurrPage(currPage + 1 > pages ? 1 : currPage + 1)}
        >
          <Icon type="sync-alt" size="xs"/>
          <Translation>Change batch</Translation>
        </div>
      </>
    );
  };

  return <div className={styles.container}>
    <div className={styles.leftContent}>
      <Guide showGuide={true} skipUrl={skipUrl}/>
      {!showGuide && <Statistics skipUrl={skipUrl}/>}
      <div className={styles.segment}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Translation>Component type</Translation>
          </div>
        </div>
        <div className={classnames([ styles.cards, styles.cardColors1 ])}>
          {compTypes.map((item, index) => {
            const { prefix, title, skipInfo } = item;
            return (
              <div key={index} className={styles.simpleCardItem} onClick={() => skipUrl(skipInfo.url, skipInfo.params)}>
                {prefix}
                <span className={styles.scTitle}>{title}</span>
                {arrowIcon}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.segment} style={{ marginBottom: '48px' }}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Translation>Advanced scene</Translation>
          </div>
        </div>
        <Tab navStyle={{ textAlign: 'center' }}>
          <Tab.Item title={<span><SvgIcon type="star2" />
            <Translation>Drill experience</Translation>
          </span>}>
            {renderExpertiseCards()}
          </Tab.Item>
        </Tab>
      </div>
    </div>
    <div className={styles.rightContent}>
      <NotifyLs />
    </div>
  </div>;
};
export default WorkspaceDetail;
