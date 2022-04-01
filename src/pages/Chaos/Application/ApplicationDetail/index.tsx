import React, { FC, useEffect, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import formatDate from 'pages/Chaos/lib/DateUtil';
import styles from './index.css';
import { Balloon, Icon, Tag } from '@alicloud/console-components';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IAppLicationBasic } from 'config/interfaces/Chaos/application';
import { SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';

const Tooltip = Balloon.Tooltip;

const ApplicationDetail: FC = () => {
  const appId = useQuery('appId');
  const dispatch = useDispatch();
  const [ basic, setBasic ] = useState<IAppLicationBasic>();

  useEffect(() => {
    dispatch.pageHeader.setTitle('应用概览');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'application',
        value: '应用管理',
        path: '/chaos/application',
      },
      {
        key: 'applicationDetail',
        value: '应用概览',
        path: '/chaos/application/detail',
      },
    ]));
  }, []);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.application.getApplicationBasic({ app_id: appId });
      if (Data) {
        setBasic(Data);
      }
    })();
  }, []);

  function renderType() {
    const appType = _.get(basic, 'app_type', '');
    if (appType === SCOPE_TYPE.HOST) {
      return '主机';
    }
    return 'Kubernetes';
  }

  function renderStatus() {
    const task = _.get(basic, 'task');
    if (!_.isEmpty(task)) {
      const state = _.get(task, 'state', '');
      const result = _.get(task, 'result', '');
      if (state === ExperimentConstants.EXPERIMENT_TASK_STATE_FINISHED) {
        if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS) {
          return <span><Icon type="select" className={classnames(styles.onLineState, styles.icon)}/>成功</span>;
        }
        if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED) {
          return <span><Icon type="exclamationcircle-f" className={classnames(styles.icon, styles.offLineState)}/>不符合预期</span>;
        }
        if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR) {
          return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.notInstall)}/>异常</span>;
        }
        if (result === ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED) {
          return <span><Icon type="minus-circle-fill" className={classnames(styles.icon, styles.interrupt)}/>中断</span>;
        }
      }

      return <span><Icon type="loading" className={classnames(styles.icon, styles.loading)}/>执行中</span>;
    }
    return '-';
  }

  const task = _.get(basic, 'task', '');

  return (
    <div className={styles.warp}>
      <div className={styles.appBase}>
        <div className={styles.baseTitle}>基础信息</div>
        <div>
          <div className={styles.lineItem}>
            <span className={styles.lineLabel}>应用名称:</span>
            <span className={styles.lineValueTitle}>{_.get(basic, 'app_name', '')}</span>
          </div>
          <div className={styles.content}>
            <div className={styles.leftContent}>
              <div className={styles.topLine}>
                <div className={styles.lineItem}>
                  <span className={styles.lineLabel}>应用类型:</span>
                  <span className={styles.lineValue}>{renderType()}</span>
                </div>
              </div>
              <div className={styles.bottomLine}>
                <div className={styles.lineItem}>
                  <span className={styles.lineLabel}>最近一次演练时间:</span>
                  <span className={styles.lineValue}>{!_.isEmpty(task) ? formatDate(_.get(task, 'startTime', '')) : '-'}</span>
                </div>
                <div className={styles.lineItem}>
                  <span className={styles.lineLabel}>最近一次演练结果:</span>
                  <span className={styles.lineValue}>{!_.isEmpty(basic) ? renderStatus() : '-'}</span>
                </div>
              </div>
            </div>
            <div className={styles.rightContent}>
              <div className={styles.groupItem}>
                <div className={styles.label}>机器分组</div>
                <div>
                  {
                    basic && basic.app_groups && basic.app_groups.slice(0, 2).map((tag: string, index: number) => {
                      return <Tag type="primary" style={{ marginRight: 8 }} key={`${tag}${index}`}>{tag}</Tag>;
                    })
                  }
                  {!_.isEmpty(task) && <Tooltip trigger={
                    basic && basic.app_groups && basic.app_groups.length - 2 > 0 && <span className={styles.moreTag}>余下{basic && basic.app_groups && basic.app_groups.length - 2}个</span>
                  } align="b">
                    {
                      basic && basic.app_groups && basic.app_groups.slice(2, basic && basic.app_groups && basic.app_groups.length).map((tag: string, index: number) => {
                        return <Tag type="primary" style={{ marginRight: 8, marginBottom: 8 }} key={`${tag}${index}`}>{tag}</Tag>;
                      })
                    }
                  </Tooltip>}
                </div>
              </div>
              <div className={styles.item}>
                <div className={styles.label}>机器</div>
                <div className={styles.value}>
                  {basic && basic.machine_count || '-'}
                  <span className={styles.unit}>台</span>
                </div>
              </div>
              <div className={styles.item}>
                <div className={styles.label}>总演练</div>
                <div className={styles.value}>
                  {basic && basic.experiment_task_count || '-'}
                  <span className={styles.unit}>次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
