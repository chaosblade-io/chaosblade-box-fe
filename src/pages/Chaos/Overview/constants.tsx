import React from 'react';
import SvgIcon from './customeIcon';
import Translation from 'components/Translation';

import { Icon } from '@alicloud/console-components';

import { customIconUrl } from 'config/constants';

const CustomIcon = Icon.createFromIconfontCN({
  scriptUrl: customIconUrl,
});

export const experienceCards = [
  {
    title: <Translation>When entering for the first time, you need to install the drill probe first</Translation>,
    desp: <Translation>Chaos supports multi-platform installation</Translation>,
    icons: [ <CustomIcon type="icon-K8S" />, <CustomIcon type="icon-ECS_cai" /> ],
    btn: {
      type: '',
      text: <Translation>Install the walkthrough probe</Translation>,
    },
    skipInfo: {
      url: '/chaos/agentmanage/setting/step',
      params: {
        iis: 1,
      },
    },
  },
  {
    title: <Translation>Choose a walkthrough scenario to quickly create a walkthrough</Translation>,
    desp: <Translation>Provide multi-component, multi-source scenarios</Translation>,
    icons: [ <CustomIcon type="icon-K8S" />, <CustomIcon type="icon-ECS_cai" />, <SvgIcon type="lade" />, <SvgIcon type="litmus" /> ],
    btn: {
      type: 'blue',
      text: <Translation>Choose a rehearsal scene</Translation>,
    },
    skipInfo: {
      url: '/chaos/scenes',
    },
  },
  {
    title: <Translation>Want to learn more?</Translation>,
    desp: <Translation>Directly view the help documents and tutorials we provide</Translation>,
    icons: [ <SvgIcon type="file" /> ],
    btn: {
      type: 'link',
      text: <Translation>View documentation</Translation>,
      icon: <Icon type="wind-arrow-right" size="small" />,
    },
    skipInfo: {
      url: 'https://chaosblade.io/zh/docs/',
      type: '_blank',
    },
  },
];

export const videoCards = [
  {
    title: <Translation>Introduction to Product Capability of Fault Drill</Translation>,
    url: '',
  },
  {
    title: <Translation>Troubleshooting Quick Start</Translation>,
    url: '',
  },
  {
    title: <Translation>Introduction of advanced content of fault drill</Translation>,
    url: '',
  },
];

export const compTypes = [
  {
    prefix: <CustomIcon type="icon-zhuji" />,
    title: <Translation>Operating system</Translation>,
    skipInfo: {
      url: '/chaos/scenes',
      params: {
        scopeType: 0,
      },
    },
  },
  {
    prefix: <CustomIcon type="icon-yingyong" />,
    title: <Translation>Application</Translation>,
    skipInfo: {
      url: '/chaos/scenes',
      params: {
        scopeType: 0,
      },
    },
  },
  {
    prefix: <CustomIcon type="icon-rongqifuwu" />,
    title: <Translation>Container service</Translation>,
    skipInfo: {
      url: '/chaos/scenes',
      params: {
        scopeType: 3,
      },
    },
  },
];

export const notifyConf: any = {
  messageLs: [],
  practiceLs: [],
};
