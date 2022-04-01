import PageHeaderExtra from '../components/PageHeaderExtra';
import React from 'react';
import { BaseModel, dvaModel, reducer, subscription } from 'utils/libs/sre-utils-dva';
import { IBreadCrumbItem } from 'config/interfaces';

import { generateUrl, getActiveNamespace, parseQuery } from 'utils/libs/sre-utils';

interface IPageHeaderState {
  breadcrumbItems?: IBreadCrumbItem[];
  breadcrumbExtra?: React.ReactNode;
  headerExtra?: React.ReactNode;
  headerKubCluster?: React.ReactNode;
  title?: string | React.ReactNode;
  subTitle?: React.ReactNode;
  hasBackArrow?: boolean;
  showCustomLayout?: boolean;
  showNameSpace?: boolean;
  showKubCluster?: boolean;
  showHeader?: boolean;
  showBreadcrumb?: boolean;
  showRegionbar?: boolean;
  showHandleBtnList?: boolean;
  showAccountUid?: boolean;
  preLocationUrl?: string;
}

@dvaModel('pageHeader')
class PageHeader extends BaseModel {
  state: IPageHeaderState = {
    showBreadcrumb: true,
    breadcrumbExtra: <PageHeaderExtra />,
  };

  @subscription
  whenLocationChange({ dispatch, history }: any) {
    history.listen(location => {
      const { pathname, search } = location;
      if (this.state.preLocationUrl === `${pathname}${search}`) {
        // 防止面包屑重复渲染
        return;
      }
      dispatch(this.setPreLocationUrl(`${pathname}${search}`));
      // 默认展示Namespace，不需要展示的组件内自行设置
      dispatch(this.setNameSpace(true));

      // 默认展示showHeader，不需要展示的组件内自行设置
      dispatch(this.setShowHeader(true));

      // 默认展示面包屑导航，不需要展示的组件内自行设置
      dispatch(this.setShowBreadcrumb(true));

      // 默认不展示返回，需要展示的在页面自己处理
      dispatch(this.showBackArrow(false));

      // 默认清空，其他路由会设置
      dispatch(this.setHeaderExtra(null));
      // 设置region
      const query = parseQuery();
      if (!query.ns) {
        // url上没有region参数，则默认cn-hangzhou
        window.location.href = generateUrl({
          ns: getActiveNamespace(),
        });
        return;
      }
    });
  }

  @reducer
  showBackArrow(hasBackArrow: IPageHeaderState['hasBackArrow']) {
    return {
      ...this.state,
      hasBackArrow,
    };
  }

  @reducer
  setBreadCrumbItems(breadcrumbItems: IBreadCrumbItem[]) {
    return {
      ...this.state,
      breadcrumbItems,
    };
  }

  @reducer
  setBreadCrumbExtra(breadcrumbExtra: IPageHeaderState['breadcrumbExtra']) {
    return {
      ...this.state,
      breadcrumbExtra,
    };
  }

  @reducer
  setNameSpace(showNameSpace: IPageHeaderState['showNameSpace']) {
    return {
      ...this.state,
      showNameSpace,
    };
  }

  @reducer
  setRegionbar(showRegionbar: IPageHeaderState['showRegionbar']) {
    return {
      ...this.state,
      showRegionbar,
    };
  }

  @reducer
  setTitle(title: IPageHeaderState['title']) {
    return {
      ...this.state,
      title,
    };
  }

  @reducer
  setSubTitle(subTitle: IPageHeaderState['subTitle']) {
    return {
      ...this.state,
      subTitle,
    };
  }

  @reducer
  setHeaderExtra(headerExtra: IPageHeaderState['headerExtra']) {
    return {
      ...this.state,
      headerExtra,
    };
  }

  @reducer
  setKubCluster(showKubCluster: IPageHeaderState['showKubCluster']) {
    return {
      ...this.state,
      showKubCluster,
    };
  }

  @reducer
  setShowHeader(showHeader: IPageHeaderState['showHeader']) {
    return {
      ...this.state,
      showHeader,
    };
  }

  @reducer
  setShowBreadcrumb(showBreadcrumb: IPageHeaderState['showBreadcrumb']) {
    return {
      ...this.state,
      showBreadcrumb,
    };
  }

  @reducer
  setPreLocationUrl(preLocationUrl: IPageHeaderState['preLocationUrl']) {
    return {
      ...this.state,
      preLocationUrl,
    };
  }

}

export default new PageHeader().model;

declare global {
  interface Actions {
    pageHeader: PageHeader;
  }
}
