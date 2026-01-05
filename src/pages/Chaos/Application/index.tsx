import ApplicationCard from './ApplicationCard';
import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import i18n from '../../../i18n';
import locale from 'utils/locale';
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
    dispatch.pageHeader.setTitle(<Translation>Application Management</Translation>);
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'Application',
        value: i18n.t('Application Management'),
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
          setTotal(_.get(Data, 'total', 0));
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
            <div className={styles.title}><Translation>No related applications found</Translation></div>
            <div><Translation>Please re-enter keywords to search, or choose to access this app.</Translation></div>
            <div className={styles.hrefAction} onClick={handleGoAppAccess}><Translation>Access Guide</Translation></div>
          </div>
        </div>;
      }
      return <div className={styles.emptyData}>
        <img src='https://img.alicdn.com/tfs/TB1DCGzcBFR4u4jSZFPXXanzFXa-268-258.png' />
        <div>
          <div className={styles.title}><Translation>No application currently</Translation></div>
          <div><Translation>It is recommended that you</Translation> <span className={styles.hrefAction} onClick={handleGoAppAccess}><Translation>click here</Translation></span><Translation>View the app access guide and click here</Translation></div>
          <div><Translation>View connected apps.</Translation></div>
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
          placeholder={i18n.t('Please input application name')}
          className={styles.searchContent}
          onSearch={e => {
            setSearchKey(e);
            setPage(1);
          }}
          hasClear
        />
        <Button type='primary' onClick={handleGoAppAccess} className={styles.buttonAction}><Translation>New application access</Translation></Button>
        <div>
          <Switch
            checked={filterDisabled}
            onChange={e => {
              setFilterDisabled(e);
              setPage(1);
            }}
          />
          <span>{filterDisabled ? <Translation>No machine free applications are shown</Translation> : <Translation>Show no machine applications</Translation>}</span>
        </div>
      </div>
      <div className={styles.cardContent}>
        {renderApplicationCardList()}
      </div>
      <Pagination
        className={styles.pagination}
        current={page}
        total={total}
        locale={locale().Pagination}
        pageSize={12}
        hideOnlyOnePage
        onChange={current => { setPage(current); }}
      />
    </div>
  );
};

export default Application;
