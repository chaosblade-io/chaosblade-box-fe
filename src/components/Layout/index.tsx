import './index.css';
import AppLayout from '@alicloud/console-components-app-layout';
import Page from '@alicloud/console-components-page';
import React, { FC, PropsWithChildren, ReactNode, useEffect, useMemo, useState } from 'react';
import RoutableMenu from '@alicloud/console-components-console-menu/RoutableMenu';
import _ from 'lodash';
import { activeKeys, pathNameList, returnMenuList, setMenuConfig } from 'config/constants';

import { IBreadCrumbItem } from 'config/interfaces';
import { Icon } from '@alicloud/console-components';
import { getActiveNamespace, getParams, pushUrl } from 'utils/libs/sre-utils';
import { scrollToAnchor } from 'utils/util';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';
const { Breadcrumb, Header, Content } = Page;

import MyHeader from '../MyHeader';

const defaultOpenKeys = [
  '/chaos/chaos/dataAdmin', // 基础数据管理
];

const Layout: FC = ({ children }: PropsWithChildren<any>) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { breadcrumbItems = [], breadcrumbExtra, headerExtra, title, subTitle, hasBackArrow } = useSelector(({ pageHeader }) => pageHeader);
  const chaosContext = useSelector(({ loginUser }) => loginUser);
  const [ menu, setMenu ] = useState<any>(setMenuConfig('menuConfig'));
  const [ menuHearder, setMenuHeader ] = useState<ReactNode | string>('应用高可用服务');
  const [ openKeys, setOpenKeys ] = useState<string[]>(defaultOpenKeys);
  useEffect(() => {
    const getUserInfo = async () => {
      const res = await dispatch.loginUser.getLoginUser(); // 获取用户权限;
      if (_.isEmpty(res.userId)) {
        pushUrl(history, '/login');
      }
    };
    getUserInfo();
  }, []);

  useEffect(() => {
    const { pathname } = location;
    if (activeKeys[pathname]) {
      setOpenKeys([ ...openKeys, activeKeys[pathname] ]);
    }
    let caseType = '';
    pathNameList.forEach(({ index, value }) => {
      if (pathname.indexOf(index) !== -1) {
        caseType = value; // 拿出菜单的唯一key
      }
    });
    handeSetMenu(caseType); // 通过唯一key去确定修改哪一个二级导航
    scrollToAnchor();
  }, [ location.pathname ]);

  // 菜单
  const handeSetMenu = (caseType: string) => {
    if (caseType) {
      setMenu(setMenuConfig(caseType));
      returnMenuList.forEach(({ key, value }) => {
        if (caseType === key) {
          setMenuHeader(renderMuenHeader(value));
        }
      });
    } else {
      setMenu(setMenuConfig('menuConfig'));
      setMenuHeader('应用高可用服务');
    }
  };

  // 菜单头部
  const renderMuenHeader = (key: string) => {
    return (
      <div style={{ width: 110, cursor: 'pointer' }} onClick={() => {
        // 返回时不携带参数，pushUrl会把所有参数都带回去
        history.push(`${key}?ns=${getActiveNamespace()}`);
      }} >
        <Icon type="wind-arrow-left" style={{ cursor: 'pointer' }} />
        <span style={{ marginLeft: 20, position: 'relative', top: 3, fontSize: 16 }}>返回</span>
      </div>
    );
  };
  // chaos的菜单鉴权
  const setChaosBetaFlag = (menu: any) => {
    const _menuLs = menu?.map((item: any) => {
      if (!_.isEmpty(item.items)) {
        item.items = setChaosBetaFlag(item.items);
      }
      if (item.key === '/chaos/workspace/owner') {
        const workspaceId = getParams('workspaceId') || '';
        if (!workspaceId) {
          item.activePathPatterns = [
            '/chaos/experiment/editor',
            '/chaos/experiment/task',
            '/chaos/experiment/detail',
          ];
        }
      }
      return item;
    });
    return _menuLs;
  };

  // 菜单打开受控
  const onOpen = (val: string, obj: { key: string, open: boolean }) => {
    let _openKeys = _.cloneDeep(openKeys) as string[];
    const { key, open } = obj;

    if (open) {
      _openKeys.push(key);
    } else {
      _openKeys = _openKeys.filter(v => v !== key);
    }
    setOpenKeys(_openKeys);
  };

  // 面包屑
  const breadcrumb: ReactNode = useMemo(() => {
    return (
      <Breadcrumb>
        {
          breadcrumbItems.map((item: IBreadCrumbItem, index: number) => {
            const AComp = <a onClick={() => pushUrl(history, item.path, item.params)}>{item.value}</a>;
            return (
              <Breadcrumb.Item key={item.key}>
                {index === breadcrumbItems.length - 1 ? item.value : AComp}
              </Breadcrumb.Item>
            );
          })
        }
      </Breadcrumb>
    );
  }, [ breadcrumbItems ]);
  // 导航
  const nav = useMemo(() => {
    if (!chaosContext.userId || location.pathname === '/login') {
      return null;
    }
    return (
      <RoutableMenu
        header={menuHearder}
        items={setChaosBetaFlag(menu)}
        openKeys={openKeys}
        onOpen={onOpen}
      />
    );
  }, [ menuHearder, menu, openKeys, chaosContext, location.pathname ]);
  return (
    <>
      <MyHeader />
      <AppLayout nav={nav} adjustHeight={50} style={{ marginTop: '50px' }}>
        <Page className={'container-layout'}>
          {chaosContext.userId &&
            <Header
              title={title}
              subTitle={subTitle}
              breadcrumb={breadcrumb}
              breadcrumbExtra={breadcrumbExtra}
              breadcrumbExtraAlign={'right'}
              childrenAlign={'right'}
              hasBackArrow={hasBackArrow}
              onBackArrowClick={() => history.go(-1)}
              className={'container-layout-header'}
            >
              {headerExtra}
            </Header>
          }
          <Content>
            {children}
          </Content>
        </Page>
      </AppLayout>
    </>
  );
};

export default Layout;
