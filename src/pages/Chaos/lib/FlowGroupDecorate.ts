import _ from 'lodash';
import { IFlow, IFlowGroup, INode, IStages } from 'config/interfaces/Chaos/experiment';
import { NODE_TYPE, STAGES } from 'pages/Chaos/lib/FlowConstants';
import { v4 as uuidv4 } from 'uuid';

export const getNodes = (flow: IFlow | null) => {
  const nodes: any[] = [];
  if (!_.isEmpty(flow)) {
    _.map(STAGES, ({ key: stage }: IStages) => {
      const n = flow && flow[stage];
      if (_.isArray(n)) {
        nodes.push(...n);
        // nodes.push.apply(nodes, n);
      } else if (_.isPlainObject(n)) {
        nodes.push(n);
      }
    });
  }
  return nodes;
};

export function unDecorateFlowGroup(flowGroup: IFlowGroup) {
  // 保存之前把之前decorate过的undecorate一下，避免循环引用
  const newFlows = _.map(_.get(flowGroup, 'flows', []) as IFlow[], (flow: IFlow | null) => unDecorateFlow(flow)) as any[];
  flowGroup = {
    ...flowGroup,
    flows: newFlows,
  };
  return flowGroup;
}

export function unDecorateFlow(flow: IFlow | null) {
  const nodes = getNodes(flow);
  _.forEach(nodes, (node: INode) => {
    // 解除链表
    delete node.prev;
    delete node.next;

    // 解除一些node上冗余字段
    unDecorateNode(node);
  });
  return flow;
}

export const unDecorateNode = (node: INode) => {
  delete node.insertBefore;
  delete node.insertAfter;
  return node;
};

export const decorateFlow = (flow: IFlow) => {
  if (!_.isEmpty(flow)) {
    // 给flow设置全局唯一的id，方便管理
    if (!flow.id) {
      flow.id = uuidv4();
    }

    // 对flow的每个node设置全局唯一的id，方便管理
    _.forEach([ 'check', 'prepare', 'recover', 'attack' ], (stage: string) => {
      const nodes = flow[stage];
      if (!_.isEmpty(nodes)) {
        _.forEach(nodes, (node: INode) => {
          decorateNode(node, flow, stage);
        });
      }
    });

    return flow;
  }
  return null;
};

const decorateNode = (node: INode, flow: IFlow | null, stage: string, extend?: any[]) => {
  if (!_.isEmpty(node)) {
    // 根据node.required判断是否可以删除，由后端控制
    node.deletable = !node.required;

    if (!node.id) {
      node.id = uuidv4();
    }
    if (!node.nodeType) {
      node.nodeType = NODE_TYPE.NORMAL;
    }
    if (flow && !node.flowId) {
      node.flowId = flow.id;
    }
    if (!node.args) {
      node.args = [];
    }
    // stage, phase
    const stageItem = _.find(STAGES, (s: IStages) => s.key === stage) as any;
    if (!_.isEmpty(stageItem)) {
      node.stage = stageItem.key;
      node.phase = stageItem.value;
    }

    // 扩展
    if (!_.isEmpty(extend)) {
      _.merge(node, extend);
    }
  }
  return node;
};
