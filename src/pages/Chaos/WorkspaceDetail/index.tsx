import ExperimentList from '../ExperimentList';
import React, { useEffect } from 'react';
import i18n from '../../../i18n';

import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { removeParams } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const WorkspaceDetail = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch.pageHeader.setTitle(i18n.t('My spac').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'workspace_detail',
        value: i18n.t('My spac').toString(),
        path: '',
      },
    ]));
  });

  useEffect(() => {
    removeParams('id');
    removeParams('permission');
    removeParams('expertiseId');
  }, []);

  return (
    <ExperimentList workspaceName={''} />
  );
};

export default WorkspaceDetail;
