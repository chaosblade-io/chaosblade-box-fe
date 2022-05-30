import React, { memo, useEffect, useMemo, useState } from 'react';
import i18n from '../../../i18n';

import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';

import { Loading, Step } from '@alicloud/console-components';

import { useDispatch } from 'utils/libs/sre-utils-dva';

import Finish from './Finish';
import Progress from './Progress';
import Setting from './Setting';

const stepLs = [ i18n.t('Account Configuration'), i18n.t('Data Migration'), i18n.t('Migration Results') ];

const Index: React.FC = () => {
  const dispatch = useDispatch();
  const [ loading, setLoading ] = useState(false);
  const [ currStep, setCurrStep ] = useState(0);

  useEffect(() => {
    dispatch.pageHeader.setTitle(i18n.t('Data Migration').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'migration',
        value: i18n.t('Data Migration').toString(),
        path: '',
      },
    ]));
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    const res = await dispatch.migration.queryMigrationResult({ migration_flag: '' });
    if (res?.status === 'RUNNING') {
      setCurrStep(1);
    }

    if (res?.status === 'FAILED') {
      setCurrStep(1);
    }
    setLoading(false);
  };
  const renderContent = useMemo(() => {
    if (currStep === 2) {
      return <Finish />;
    } else if (currStep === 1) {
      return <Progress onChangeStep={step => setCurrStep(step)} />;
    }
    return <Setting onChangeStep={step => setCurrStep(step)} />;
  }, [ currStep ]);

  return (
    <Loading visible={loading} tip={i18n.t('Loading data, please wait').toString()} style={{ display: 'block', minHeight: '420px' }}>
      <Step current={currStep} shape="circle" >
        {stepLs.map((item, index) => {
          return (
            <Step.Item key={index} title={item} />
          );
        })}
      </Step>
      <br /><br />
      {renderContent}
    </Loading>
  );
};

export default memo(Index);
