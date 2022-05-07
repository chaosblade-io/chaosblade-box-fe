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
    desp: 'Chaos支持多平台安装',
    icons: [ <CustomIcon type="icon-K8S" />, <CustomIcon type="icon-ECS_cai" /> ],
    btn: {
      type: '',
      text: '安装演练探针',
    },
    skipInfo: {
      url: '/chaos/agentmanage/setting/step',
      params: {
        iis: 1,
      },
    },
  },
  {
    title: '选择演练场景，快速创建一个演练',
    desp: '提供多组件，多来源的场景',
    icons: [ <CustomIcon type="icon-K8S" />, <CustomIcon type="icon-ECS_cai" />, <SvgIcon type="lade" />, <SvgIcon type="litmus" /> ],
    btn: {
      type: 'blue',
      text: '选择演练场景',
    },
    skipInfo: {
      url: '/chaos/scenes',
    },
  },
  {
    title: '希望了解更多信息？',
    desp: '直接查看我们提供的帮助文档及教程',
    icons: [ <SvgIcon type="file" /> ],
    btn: {
      type: 'link',
      text: '查看文档',
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
    title: '故障演练产品能力介绍',
    url: '',
  },
  {
    title: '故障演练快速入门',
    url: '',
  },
  {
    title: '故障演练进阶内容介绍',
    url: '',
  },
];

export const compTypes = [
  {
    prefix: <CustomIcon type="icon-zhuji" />,
    title: '操作系统',
    skipInfo: {
      url: '/chaos/scenes',
      params: {
        scopeType: 0,
      },
    },
  },
  {
    prefix: <CustomIcon type="icon-yingyong" />,
    title: '应用',
    skipInfo: {
      url: '/chaos/scenes',
      params: {
        scopeType: 0,
      },
    },
  },
  {
    prefix: <CustomIcon type="icon-rongqifuwu" />,
    title: '容器服务',
    skipInfo: {
      url: '/chaos/scenes',
      params: {
        scopeType: 3,
      },
    },
  },
];

export const archMapCards = [
  {
    title: '主机视图',
    prefix: <CustomIcon type="icon-zhuji" />,
    type: 'NodeMonitorView',
    skipInfo: {
      url: '/arch/archMap',
      params: {
        view: 'NodeMonitorView',
      },
    },
  },
  {
    title: '应用视图',
    prefix: <CustomIcon type="icon-yingyong" />,
    type: 'ApplicationView',
    skipInfo: {
      url: '/arch/archMap',
      params: {
        view: 'ApplicationView',
      },
    },
  },
  {
    title: '风险视图',
    prefix: <CustomIcon type="icon-fengxian" />,
    type: 'CloudConfigView',
    skipInfo: {
      url: '/arch/archMap',
      params: {
        view: 'CloudConfigRiskView',
      },
    },
  },
  {
    title: 'Kunbernetes',
    prefix: <CustomIcon type="icon-K8S" />,
    type: 'KubernetesView',
    skipInfo: {
      url: '/arch/archMap',
      params: {
        view: 'KubernetesMonitorView',
      },
    },
  },
  {
    title: '云资源视图',
    prefix: <CustomIcon type="icon-yunziyuan" />,
    type: 'CloudConfigView',
    skipInfo: {
      url: '/arch/archMap',
      params: {
        view: 'CloudConfigView',
      },
    },
  },
];

export const planCards = [
  {
    title: '容灾演练',
    prefix: <CustomIcon type="icon-tongchengrongzaiyanlian" />,
    desp: '针对可用区级别的云资源断网故障演练。',
    img: 'https://img.alicdn.com/imgextra/i1/O1CN01b6ukda1r6bUoYgebE_!!6000000005582-2-tps-508-248.png',
    skipInfo: {
      url: '/chaos/disaster',
      params: {
        view: 'NodeMonitorView',
      },
    },
  },
  {
    title: '微服务演练',
    prefix: <CustomIcon type="icon-weifuwuyanlian" />,
    desp: '通过科学的手段持续稳定地得到应用间依赖关系,通过演练来验证强弱依赖。',
    img: 'https://img.alicdn.com/imgextra/i1/O1CN01ay6JpL1V5lDhfgcri_!!6000000002602-2-tps-508-244.png',
    skipInfo: {
      url: '/chaos/depGovernHome',
      params: {
        view: 'CloudConfigRiskView',
      },
    },
  },
  {
    title: '消息演练',
    prefix: <CustomIcon type="icon-xiaoxiyanlian" />,
    desp: '针对常见消息组件集群(Kafka,Rocketmq等)的故障演练。',
    img: 'https://img.alicdn.com/tfs/TB1EzWy4Yr1gK0jSZFDXXb9yVXa-732-248.png',
    skipInfo: {
      url: '/chaos/mq/experiments',
      params: {
        view: 'KubernetesMonitorView',
      },
    },
  },
  {
    title: '容器演练',
    prefix: <CustomIcon type="icon-rongqiyanlian" />,
    desp: '针对Kubernetes集群定制的故障演练。',
    img: 'https://img.alicdn.com/imgextra/i3/O1CN010fS6vI1QuzTfCfPBT_!!6000000002037-0-tps-1396-632.jpg',
    skipInfo: {
      url: '/chaos/container/alarm',
      params: {
        view: 'NodeMonitorView',
      },
    },
  },
];

export const notifyConf: any = {
  messageLs: [],
  practiceLs: [],
};
