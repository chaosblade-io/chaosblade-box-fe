import _ from 'lodash';
import { IArgs, IFlow, IFlowGroup, INode, IStage } from 'config/interfaces/Chaos/experiment';
import { NODE_TYPE, STAGES } from 'pages/Chaos/lib/FlowConstants';
import { v4 as uuidv4 } from 'uuid';

export const initExperimentFlow = (experiment: any) => {
  const observerNodes = _.get(experiment, 'observerNodes', []);
  const recoverNodes = _.get(experiment, 'recoverNodes', []);
  const flow = _.get(experiment, 'flow', {});

  if (!flow.experimentId) {
    flow.experimentId = experiment.experimentId;
  }
  if (!flow.runMode) {
    flow.runMode = 'SEQUENCE';
  }
  if (!flow.duration) {
    flow.duration = 900;
  }

  experiment.observerNodes = observerNodes;
  experiment.recoverNodes = recoverNodes;
  experiment.flow = convertFlow(observerNodes, recoverNodes, flow);
  return experiment;
};


/* ---------------------------- 辅助方法 ------------------------------ */

export const convertNodeArguments = (args: IArgs[]) => {
  if (args) {
    return _.map(args, ({ alias, value }: IArgs) => ({ alias, value }));
  }
  return [];
};

export const convertFlow = (observerNodes: any[], recoverNodes: any[], flow: IFlow, isExpertise = false) => {
  if (!_.isEmpty(flow)) {
    const flowGroups = _.get(flow, 'flowGroups', []);
    _.forEach(flowGroups, (flowGroup: IFlowGroup) => {
      if (flowGroup.groupId) {
        // 把服务端返回的groupId设置为id
        flowGroup.id = flowGroup.groupId;
      } else if (!flowGroup.id) {
        // 实在不行就前端自己生成1个
        flowGroup.id = uuidv4();
      }

      const flows = _.get(flowGroup, 'flows', []);
      _.forEach(flows as IFlow[], (flow: IFlow) => {
        if (flow.flowId) {
          // 把服务端返回的flowId设置为flow.id
          flow.id = flow.flowId;
        } else if (!flow.id) {
          // 实在不行就前端自己生成1个
          flow.id = uuidv4();
        }

        // const stages = _.map(STAGES, (item: any) => item && item.key);
        const stages = _.map(STAGES, ({ key }: IStage) => key);

        _.forEach(stages, (stage: string) => {
          let nodes = flow[stage];
          if (!_.isEmpty(nodes)) {
            // 对流程节点进行转换
            nodes = _.map(nodes, (node: INode) => {
              node.nodeType = NODE_TYPE.NORMAL;
              node.stage = stage;
              // 把服务端返回的flowId设置为node.flowId，覆盖前端设置的
              node.flowId = flow.flowId;
              return convertNode(node);
            });
          }
        });
      });
    });
    flow.flowGroups = flowGroups;

    let guards = _.get(flow, 'guardConf.guards', []);
    guards = _.map(guards, (node: any) => {
      // 设置id
      if (!node.id) {
        node.id = uuidv4();
      }

      // 设置nodeType
      if (node.hasOwnProperty('actionType')) {
        node.nodeType = node.actionType;
      } else {
        // 自己判断nodeType
        if (node.tolerance && node.fields) {
          node.nodeType = NODE_TYPE.RECOVER;
        } else {
          node.nodeType = NODE_TYPE.OBSERVER;
        }
      }

      if (!_.isEmpty(node.arguments)) {
        node.args = node.arguments;
        // delete node.arguments;
      }

      // code和appCode保持一致
      if (!node.code && node.appCode) {
        node.code = node.appCode;
      }

      // 设置observerNodes和recoverNodes
      if (node.nodeType === NODE_TYPE.OBSERVER) {
        const exist = _.find(observerNodes, (obNode: INode) => obNode.id === node.id);
        if (!exist) {
          observerNodes.push(node);
        }
      } else if (node.nodeType === NODE_TYPE.RECOVER) {
        const exist = _.find(recoverNodes, (reNode: INode) => reNode.id === node.id);
        if (!exist) {
          recoverNodes.push(node);
        }
      }

      // 进行转换，添加一些字段
      node = convertNode(node);

      return node;
    });

    if (isExpertise) {
      flow.guardConf.guards = guards;
      flow.observerNodes = observerNodes;
      flow.recoverNodes = recoverNodes;
      return flow;
    }
    return flow;
  }
  return null;
};

export const convertNode = (node: INode) => {
  if (node.nodeType === NODE_TYPE.NORMAL) {
    return convertNormalNode(node);
  } else if (node.nodeType === NODE_TYPE.OBSERVER) {
    return convertObserverNode(node);
  } else if (node.nodeType === NODE_TYPE.RECOVER) {
    return convertRecoverNode(node);
  }
  return node;
};

export const convertNormalNode = (node: INode) => {
  // 参数初始化
  if (!_.isEmpty(node.arguments) && _.isEmpty(node.args)) {
    node.args = _.cloneDeep(node.arguments);
  }
  return node;
};

export const convertObserverNode = (node: INode) => {
  node.args = node.args || [];
  return {
    id: node.id,
    functionId: node.functionId,
    name: node.name,
    parentName: node.parentName,
    actionType: node.hasOwnProperty('actionType') ? node.actionType : node.nodeType,
    appCode: node.appCode || node.code, // 如果是查询回来的节点（编辑态），则取appCode；如果是自己添加的节点，则取code
    args: node.args,
    arguments: convertNodeArguments(node.args),
  };
};

export const convertRecoverNode = (node: INode) => {
  node.args = node.args || [];
  node.functionId = node.functionId || '';
  node.fields = node.fields || [];
  node.displayFields = node.displayFields || node.fields || [];
  node.tolerance = node.tolerance || [];
  node.displayTolerance = node.displayTolerance || node.tolerance || [];
  node.name = node.name || '';
  node.parentName = node.parentName || '';

  return {
    id: node.id,
    functionId: node.functionId,
    actionType: node.hasOwnProperty('actionType') ? node.actionType : node.nodeType,
    appCode: node.appCode || node.code,
    args: node.args,
    name: node.name,
    parentName: node.parentName,
    arguments: convertNodeArguments(node.args),
    fields: node.fields,
    tolerance: node.tolerance,
    displayFields: node.displayFields, // 接口返回的fields存放在这里
    displayTolerance: node.displayTolerance, // 接口返回的tolerance存放在这里
  };
};


export const dealCopyNode = (nodes: INode[]) => {
  if (!_.isEmpty(nodes)) {
    nodes.forEach((node: INode) => {
      node.flowId = uuidv4();
      node.activityId = '';
      node.id = '';
    });
  }
  return nodes;
};
