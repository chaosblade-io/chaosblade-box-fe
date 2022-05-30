import React, { FC, useEffect, useRef, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import { Icon, Select } from '@alicloud/console-components';

import { useDispatch } from 'utils/libs/sre-utils-dva';

import { OS_TYPE, SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';

import styles from './index.css';

interface IProps {
  params: any;
  value: string | undefined; // 默认值的key
  appInfo?: any | undefined;
  placeholder?: string;
  name?: string;
  onChange: (value: string, actionType: string, item: any) => void;
}
const Index: FC<IProps> = props => {
  const { params, value: defaultValue, appInfo, placeholder, onChange } = props;
  const dispatch = useDispatch();
  const [ dataSource, setDataSource ] = useState<any>([]);
  const page = useRef(1);
  const fetching = useRef(false);

  const [ loading, setLoading ] = useState(false);
  const [ pages, setPages ] = useState(0); // 后台接口返回的页数
  const [ key, setKey ] = useState('');
  const [ isFocus, setIsFocus ] = useState(false);

  const [ value, setValue ] = useState(defaultValue);

  const filters = useRef({ ...params });

  useEffect(() => {
    setValue(props.value);
    setKey('');
  }, [ props.value ]);

  const getData = () => {
    const getAppLs = async () => {
      setLoading(true);
      const res = await dispatch.experimentDataSource.getApplication({ ...filters.current, page: page.current, size: 11, key });
      const { data, pages, total } = res;
      if (data?.length > 0) {
        data?.map((item: any) => {
          item.value = item.app_id;
          item.label = item.app_name;
          item.scopesType = item.scope_type;
          item.appType = item.app_type;
          item.osType = item.os_type;
          return item;
        });
        setDataSource((prev: any) => [ ...prev, ...data ]);
      } else {
        if (total === 0) {
          setDataSource([]);
        }
      }
      setPages(pages);
      setLoading(false);
      fetching.current = false;
    };
    // 判断 参数不为空 调用接口
    if (params.appType !== undefined || (params.osType !== undefined && !isNaN(params.osType))) {
      getAppLs();
    }
  };
  useEffect(() => {
    getData();
  }, [ key ]);

  useEffect(() => {
    page.current = 1;
    filters.current = params;
    setDataSource([]);
    getData();
  }, [ params.osType, params.appType ]);

  useEffect(() => {
    let ele = document.querySelector('#selectScroll .next-menu');
    setTimeout(() => {
      ele = document.querySelector('#selectScroll .next-menu');
      // ele?.style.overflowY = 'scroll';
      ele?.addEventListener('scroll', onOptionScroll);
    }, 300);
    return () => {
      ele?.removeEventListener('scroll', onOptionScroll);
    };
  }, [ isFocus ]);
  const onOptionScroll = (e: any) => {
    const { target } = e;
    const { scrollTop, offsetHeight, scrollHeight } = target as any || {};
    if (target && scrollTop + offsetHeight > 60 && scrollTop + offsetHeight > scrollHeight) {
      if (!fetching.current && page.current < pages) {
        page.current = page.current + 1;
        fetching.current = true;
        getData();
      }
    }
  };
  function renderItemScopeType(osType: any, scopeType: any) {
    if (scopeType === SCOPE_TYPE.HOST) {
      if (osType === OS_TYPE.LINUX) {
        return i18n.t('Host-linux');
      }
      return i18n.t('Host');
    }
    if (scopeType === SCOPE_TYPE.K8S) {
      return i18n.t('Kubernetes');
    }
    return '';
  }
  function renderItem(item: any) {
    return <div className={styles.itemContent} title={item && item.label}>
      <div className={styles.appName}>{item && item.label}</div>
      <div className={styles.scopeTip}>{renderItemScopeType(item.os_type, item.scope_type)}</div>
    </div>;
  }
  return (
    <>
      <Select
        // mode="tag"
        className={styles.appSelect}
        showSearch={true}
        filterLocal={false}
        style={{ width: '100%' }}
        value={value}
        placeholder={placeholder || ''}
        onChange={(value:string, action:string) => {
          const item = dataSource.find((item: any) => item.app_id === value);
          setValue(value);
          onChange?.(value, action, item);
        }}
        fillProps={'app_id'}
        onFocus={() => setIsFocus(true)}
        onSearch={value => {
          setLoading(true);
          page.current = 1;
          setDataSource([]);
          setKey(value);
        }}
        dataSource={dataSource}
        popupContainer="selectScroll"
        itemRender={item => renderItem(item)}
        locale={locale().Select}
      >
        {dataSource?.map((item: any, index: number) => {
          return (
            <Select.Option value={item.app_id} key={index}>
              <div className={styles.itemContent} title={item.label}>
                <div className={styles.appName}>{item.label}</div>
                <div className={styles.scopeTip}>{renderItemScopeType(item.os_type, item.scope_type)}</div>
              </div>
            </Select.Option>
          );
        })}
        { dataSource?.length === 0 && appInfo?.appId &&
          <Select.Option value={appInfo.appId}>
            <div className={styles.itemContent} title={appInfo.appName}>
              <div className={styles.appName}>{appInfo.appName}</div>
              <div className={styles.scopeTip}>{renderItemScopeType(appInfo.osType, appInfo.scopeType)}</div>
            </div>
          </Select.Option>
        }
        {loading && <Select.Option value={'more'} key={'more'}><div style={{ color: '#0064C8' }}><Icon size="small" type="loading" />&nbsp;&nbsp;<Translation>Load more options...</Translation></div></Select.Option>}
      </Select>
      <div id="selectScroll">
      </div>
    </>
  );
};

export default Index;
