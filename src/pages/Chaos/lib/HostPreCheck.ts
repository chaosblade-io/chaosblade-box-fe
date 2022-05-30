import _ from 'lodash';
import { IFlowGroup, IHost } from 'config/interfaces/Chaos/experiment';

export const hostPreCheck = (flowGroup: IFlowGroup[], hostInfo: any[]) => {
  const newFlowGroup = _.cloneDeep(flowGroup) as IFlowGroup[];
  _.map(Array.from(newFlowGroup), (f: IFlowGroup) => {
    const hosts = _.get(f, 'hosts', []);
    const newHosts: any[] = [];
    _.map(hosts, (h: IHost) => {
      hostInfo.map(i => {
        if (h.ip === i.ip) {
          h = {
            ...h,
            ...i,
          };
        }
        return h;
      });
      const exist = _.find(newHosts, (n: any) => n.ip === h.ip);
      if (!exist) {
        newHosts.push(h);
      }
    });
    f.hosts = newHosts;
  });
  return newFlowGroup;
};
