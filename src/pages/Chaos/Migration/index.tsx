import React, { memo, useEffect, useMemo, useState } from 'react';

import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';

import { Loading, Step } from '@alicloud/console-components';

import { useDispatch } from 'utils/libs/sre-utils-dva';

import Finish from './Finish';
import Progress from './Progress';
import Setting from './Setting';

const stepLs = [ '账号配置', '数据迁移', '迁移结果' ];

const Index: React.FC = () => {
  const dispatch = useDispatch();
  const [ loading, setLoading ] = useState(false);
  const [ currStep, setCurrStep ] = useState(0);

  useEffect(() => {
    dispatch.pageHeader.setTitle('数据迁移');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'migration',
        value: '数据迁移',
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
    <Loading visible={loading} tip="数据加载中，请稍后！" style={{ display: 'block', minHeight: '420px' }}>
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
