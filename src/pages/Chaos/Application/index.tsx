import ApplicationCard from './ApplicationCard';
import React, { FC, useEffect, useState } from 'react';
import _ from 'lodash';
import styles from './index.css';
import { Button, Loading, Pagination, Search, Switch } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const Application: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [ dataSource, setDataSource ] = useState([]);
  const [ isSearch, setIsSearch ] = useState(false);
  const [ searchKey, setSearchKey ] = useState('');
  const [ page, setPage ] = useState(1);
  const [ total, setTotal ] = useState(0);
  const { loading } = useSelector(state => {
    return {
      loading: state.loading.effects['application/getUserApplications'] || state.loading.effects['application/searchApplications'],
    };
  });
  const [ filterDisabled, setFilterDisabled ] = useState(true);

  useEffect(() => {
    dispatch.pageHeader.setTitle('应用管理');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'Application',
        value: '应用管理',
        path: '/chaos/application/index',
      },
    ]));
  }, []);

  useEffect(() => {
    (async function() {
      if (!searchKey) {
        // 如果搜索值为空调全部的接口
        const { Data = false } = await dispatch.application.getUserApplications({ page, size: 12, filterDisabled });
        if (Data) {
          setDataSource(_.get(Data, 'data', []));
          setTotal(_.get(Data, 'total', []));
          setIsSearch(false);
        }
      } else {
        // 如果搜索值不为空调搜索接口，因为这个接口传空字符串报错
        const { Data = [] } = await dispatch.application.searchApplications({ key: searchKey, filterDisabled });
        setDataSource(Data);
        setTotal(Data.length || 0);
        setIsSearch(true);
      }
    })();
  }, [ page, searchKey, filterDisabled ]);

  function handleCardDetail(item: any) {
    pushUrl(history, '/chaos/application/detail', {
      appId: item && item.app_id,
      appType: item && item.app_type,
    });
  }

  function handleGoAppAccess() {
    pushUrl(history, '/chaos/freshapplication/access');
  }

  function renderApplicationCardList() {
    if (!loading) {
      if (!_.isEmpty(dataSource)) {
        return dataSource.map((item: any, index: number) => {
          return <ApplicationCard data={item} key={`${item.app_name}${index}`} onClick={handleCardDetail} />;
        });
      }
      if (isSearch) {
        return <div className={styles.emptyData}>
          <img src='https://img.alicdn.com/tfs/TB1DCGzcBFR4u4jSZFPXXanzFXa-268-258.png' />
          <div>
            <div className={styles.title}>没有发现与「{searchKey}」相关应用</div>
            <div>请重新输入关键词进行搜索，或选择接入此应用。</div>
            <div className={styles.hrefAction} onClick={handleGoAppAccess}>接入指南</div>
          </div>
        </div>;
      }
      return <div className={styles.emptyData}>
        <img src='https://img.alicdn.com/tfs/TB1DCGzcBFR4u4jSZFPXXanzFXa-268-258.png' />
        <div>
          <div className={styles.title}>当前暂无应用</div>
          <div>建议您在使用前 <span className={styles.hrefAction} onClick={handleGoAppAccess}>点击这里</span> 查看应用接入指南，然后在此</div>
          <div>查看已接入应用。</div>
        </div>
      </div>;
    }
    return <Loading className={styles.loading} style={{ width: '100%' }}></Loading>;
  }

  return (
    <div className={styles.warp}>
      <div className={styles.searchWarp}>
        <Search
          shape="simple"
          placeholder='请输入应用名称'
          className={styles.searchContent}
          onSearch={e => {
            setSearchKey(e);
            setPage(1);
          }}
          hasClear
        />
        <Button type='primary' onClick={handleGoAppAccess} className={styles.buttonAction}>新应用接入</Button>
        <div>
          <Switch
            checked={filterDisabled}
            onChange={e => {
              setFilterDisabled(e);
              setPage(1);
            }}
          />
          <span>{filterDisabled ? '不展示无机器应用' : '展示无机器应用'}</span>
        </div>
      </div>
      <div className={styles.cardContent}>
        {renderApplicationCardList()}
      </div>
      <Pagination
        className={styles.pagination}
        current={page}
        total={total}
        totalRender={() => `共有${total}条`}
        pageSize={12}
        hideOnlyOnePage
        onChange={current => { setPage(current); }}
      />
    </div>
  );
};

export default Application;
