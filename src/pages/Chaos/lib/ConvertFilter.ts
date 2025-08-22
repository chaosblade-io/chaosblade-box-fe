
// 流程提交数据处理；args赋值为arguments
import * as _ from 'lodash';
import { IFlow, IFlowGroup, INode } from 'config/interfaces/Chaos/experiment';
import { STAGES } from './FlowConstants';


const convertFilter = {

  convertFilterSubmit(flow: IFlow) {
    const submitFlow = { ...flow };
    const { flowGroups, guardConf } = submitFlow;

    if (!_.isEmpty(flowGroups)) {
      _.forEach(flowGroups, (flowGroup: IFlowGroup) => {
        const { flows } = flowGroup;
        _.forEach(flows, (flow: IFlow) => {
          const stages = _.map(STAGES, ({ key }: any) => key);
          _.forEach(stages, (stage: string) => {
            const nodes = flow[stage];
            if (!_.isEmpty(nodes)) {
              _.forEach(nodes, (node: INode) => {
                node.arguments = node.args;
                if (!node.activityName) {
                  node.activityName = node.name;
                }
                if (!node.app_code) {
                  node.app_code = node.code;
                }

                // 删除一些冗余属性
                delete node.groupOrder;
                delete node.hosts;
              });
            }
          });

          // 删除一些冗余属性
          delete flow.hosts;
          delete flow.order;
        });
      });
    }

    if (!_.isEmpty(guardConf)) {
      const { guards } = guardConf;
      const newGuards = _.map(guards, (guard: INode) => {
        const { functionId, actionType, appCode, args: guardArgs, fields, tolerance, name } = guard;
        return {
          functionId,
          actionType,
          appCode,
          name,
          arguments: guardArgs,
          fields,
          tolerance,
        };
      });
      submitFlow.guardConf.guards = newGuards;
    }
    return submitFlow;
  },
};

export default convertFilter;

