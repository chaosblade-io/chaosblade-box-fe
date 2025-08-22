
import BaseInfo from 'pages/Chaos/common/BaseInfo';
import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../../../i18n';
import styles from './index.css';
import { Button, Message } from '@alicloud/console-components';
import { IBaseInfo, IWorkSpaces } from 'config/interfaces/Chaos/experiment';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { parseQuery, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

function BaseInfoEditor() {

  const dispatch = useDispatch();
  const history = useHistory();
  const baseInfo = useSelector(({ experimentDetail }) => experimentDetail.baseInfo);
  const tags = useSelector(({ experimentDataSource }) => experimentDataSource.tags);
  // const workSpaces = useSelector(({ experimentDataSource }) => experimentDataSource.workSpaces);
  const [ baseInfoData, setBaseInfoData ] = useState(null);

  useEffect(() => {
    const parsed = parseQuery();
    const experimentId = _.get(parsed, 'id', '');
    if (experimentId) {
      (async function() {
        await dispatch.experimentDetail.getExperimentBaseInfo({ experimentId }, (res: any) => setBaseInfoData(() => {
          // 对演练空间数据做渲染处理
          const { workspaces = [] } = res;
          const newList: string[] = [];
          _.forEach(workspaces, (sp: IWorkSpaces) => newList.push(sp.workspaceId));
          return { ...res, workspaces: newList };
        }));
        // 流程基本信息空间
        // await dispatch.experimentDataSource.getWorkSpaces();
      })();
    }
  }, []);

  useEffect(() => {
    dispatch.pageHeader.setTitle(i18n.t('Basic information about the drill').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'workspace',
        value: i18n.t('Space management').toString(),
        path: '/chaos/workspace/list',
      },
      {
        key: 'experiment_detail',
        value: i18n.t('Drill details').toString(),
        path: '/chaos/experiment/detail',
      },
      {
        key: 'experiment_baseInfo',
        value: i18n.t('Basic information about the drill').toString(),
        path: '/chaos/baseInfo/editor',
      },
    ]));
  });

  function handleUpdateBase(data: IBaseInfo) {
    dispatch.experimentDetail.setUpdateBaseInfo(data);
  }

  function handleSubmitBaseInfo() {
    const parsed = parseQuery();
    const experimentId = _.get(parsed, 'id', '');
    (async function() {
      await dispatch.experimentDetail.updateExperimentBasicInfo({
        ...baseInfo,
        experimentId,
      }, res => {
        res && Message.success(i18n.t('Update completed').toString());
        pushUrl(history, '/chaos/experiment/detail');
      });
    })();
  }

  function handleBackDetail() {
    dispatch.experimentEditor.setClearExperiment();
    pushUrl(history, '/chaos/experiment/detail');
  }

  function handleFocusTags() {
    // 流程基本信息标签
    (async function() {
      await dispatch.experimentDataSource.getTags({ key: '', type: 0 });
    })();
  }

  // function handleFocusWorkSpace() {
  //   // 流程基本信息空间
  //   (async function() {
  //     await dispatch.experimentDataSource.getWorkSpaces();
  //   })();
  // }

  return <div className={styles.container}>
    <BaseInfo
      data={baseInfoData!}
      tags={tags as string[]}
      // workSpaces={workSpaces}
      disabled={false}
      onUpdateBasinfo={handleUpdateBase}
      onFocusTags={handleFocusTags}
      // onFocusWorkSpace={handleFocusWorkSpace}
    />
    <div className={styles.Divider}></div>
    <div>
      <Button
        className={styles.headerButton}
        type="primary"
        onClick={handleSubmitBaseInfo}
      >
        <Translation>Confirm</Translation>
      </Button>
      <Button
        className={styles.headerButton}
        onClick={handleBackDetail}
      >
        <Translation>Cancel and return to details</Translation>
      </Button>
    </div>
  </div>;
}

export default BaseInfoEditor;
