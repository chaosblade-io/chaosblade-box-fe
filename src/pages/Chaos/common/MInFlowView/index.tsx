import MiniFlow from '../MiniFlow';
import React from 'react';
import * as _ from 'lodash';
import i18n from '../../../../i18n';
import styles from './index.css';
import { IActivity } from 'config/interfaces/Chaos/experimentTask';
import { IExperiment, IFlow, IFlowGroup, INode } from 'config/interfaces/Chaos/experiment';
import { Icon } from '@alicloud/console-components';

interface MiniFlowViewProps{
  experiment: IExperiment;
  isExpertise: boolean;
  runMode: string;
  onNodeClick: (node: INode | IActivity) => void;
}

const PHASE_GROUP = [
  {
    color: '#FFDDB2',
    stage: i18n.t('Preparation stage'),
  },
  {
    color: '#79B3F3',
    stage: i18n.t('Execution phase'),
  },
  {
    color: '#BAB1EA',
    stage: i18n.t('Inspection phase'),
  },
  {
    color: '#2A828A',
    stage: i18n.t('Recovery phase'),
  },
];

function MiniFlowView(props: MiniFlowViewProps): JSX.Element | null {

  function getNodesBySequence() {
    const nodes: any[] = [];
    const { experiment } = props;
    if (!_.isEmpty(experiment)) {
      const flowGroups = _.cloneDeep(_.get(experiment, 'flow.flowGroups', []));
      if (!_.isEmpty(flowGroups)) {
        let order = 0;
        const flows = _.reduce(flowGroups, (totalFlows: any[], flowGroup: IFlowGroup) => {
          // 防止覆盖拷贝一份新数据
          const flows = _.cloneDeep(_.get(flowGroup, 'flows', []) as IFlow[]);
          // 给每个flow加上分组顺序
          ++order;
          flows.forEach((flow: IFlow) => {
            flow.hosts = flowGroup.hosts && flowGroup.hosts.length;
            flow.hostPercent = flowGroup.hostPercent || '';
            flow.order = order;
          });
          totalFlows.push(...flows);
          return totalFlows;
        }, []);

        // 按顺序添加节点
        _.forEach(flows, (flow: IFlow) => {
          if (!_.isEmpty(flow.prepare)) {
            // nodes.push.apply(nodes, flow.prepare);
            nodes.push(...flow.prepare);
          }
          if (!_.isEmpty(flow.attack)) {
            // nodes.push.apply(nodes, flow.attack);
            nodes.push(...flow.attack);
          }
          if (!_.isEmpty(flow.check)) {
            // nodes.push.apply(nodes, flow.check);
            nodes.push(...flow.check);
          }
          if (!_.isEmpty(flow.recover)) {
            // nodes.push.apply(nodes, flow.recover);
            nodes.push(...flow.recover);
          }

          // 给节点赋上详情数据
          nodes.forEach(node => {
            node.hosts = node.hosts || flow.hosts;
            node.hostPercent = node.hostPercent || flow.hostPercent;
            node.groupOrder = node.groupOrder || flow.order;
          });
        });
      }
    }
    return nodes;
  }

  function getNodesByPhase() {
    const nodes: INode[] = [];
    const { experiment } = props;
    if (!_.isEmpty(experiment)) {
      const flowGroups = _.get(experiment, 'flow.flowGroups', []);
      if (!_.isEmpty(flowGroups)) {
        let order = 0;
        const flows = _.reduce(flowGroups, (totalFlows: IFlow[], flowGroup: IFlowGroup) => {
          const flows = _.get(flowGroup, 'flows', []) as IFlow[];
          // 给每个flow加上分组顺序
          ++order;
          flows.forEach((flow: IFlow) => {
            flow.hosts = flowGroup.hosts?.length;
            flow.order = order;
          });
          // totalFlows.push.apply(totalFlows, flows);
          totalFlows.push(...flows as any[]);
          return totalFlows;
        }, []);

        // 分阶段汇总，最后再合并
        const prepareNodes: INode[] = [];
        const attackNodes: INode[] = [];
        const checkNodes: INode[] = [];
        const recoverNodes: INode[] = [];

        _.forEach(flows as IFlow[], (flow: IFlow) => {
          if (!_.isEmpty(flow.prepare)) {
            // 给节点赋上分组顺序
            const nodes = flow.prepare;
            // 给节点赋上详情数据
            nodes.forEach((node: INode) => {
              node.hosts = node.hosts || flow.hosts;
              node.groupOrder = node.groupOrder || flow.order;
            });
            // prepareNodes.push.apply(prepareNodes, nodes);
            prepareNodes.push(...nodes);
          }
          if (!_.isEmpty(flow.attack)) {
            // 给节点赋上分组顺序
            const nodes = flow.attack;
            nodes.forEach((node: INode) => {
              node.hosts = node.hosts || flow.hosts;
              node.groupOrder = node.groupOrder || flow.order;
            });
            // attackNodes.push.apply(attackNodes, nodes);
            attackNodes.push(...nodes);
          }
          if (!_.isEmpty(flow.check)) {
            // 给节点赋上分组顺序
            const nodes = flow.check;
            nodes.forEach((node: INode) => {
              node.hosts = node.hosts || flow.hosts;
              node.groupOrder = node.groupOrder || flow.order;
            });
            // checkNodes.push.apply(checkNodes, nodes);
            checkNodes.push(...nodes);
          }
          if (!_.isEmpty(flow.recover)) {
            // 给节点赋上分组顺序
            const nodes = flow.recover;
            nodes.forEach((node: INode) => {
              node.hosts = node.hosts || flow.hosts;
              node.groupOrder = node.groupOrder || flow.order;
            });
            // recoverNodes.push.apply(recoverNodes, nodes);
            recoverNodes.push(...nodes);
          }

        });

        // nodes.push.apply(nodes, prepareNodes);
        // nodes.push.apply(nodes, attackNodes);
        // nodes.push.apply(nodes, checkNodes);
        // nodes.push.apply(nodes, recoverNodes);
        nodes.push(...prepareNodes);
        nodes.push(...attackNodes);
        nodes.push(...checkNodes);
        nodes.push(...recoverNodes);
      }
    }
    return nodes;
  }

  const { runMode }: any = props;
  let nodes: INode[] = [];
  if (runMode === 'SEQUENCE') {
    nodes = getNodesBySequence();
  } else if (runMode === 'PHASE') {
    nodes = getNodesByPhase();
  }

  return !_.isEmpty(nodes) ? <div>
    {runMode === 'PHASE' && <div className={styles.tips}>
      {PHASE_GROUP.map((item: any, idx: number) => {
        return <span>
          <span className={styles.stageContent}>
            <span className={styles.stageIcon} style={{ backgroundColor: item.color }}></span>
            <span style={{ color: item.color }}>{item.stage}</span>
          </span>
          {idx !== 3 && <span><span className={styles.line}></span><Icon className={styles.switchArrowDownIcon} type="caret-right" size="small" /></span>}
        </span>;
      })}
    </div>}
    <MiniFlow
      editable={false}
      nodes={nodes}
      {...props}
    />
  </div> : null;
}

export default MiniFlowView;
