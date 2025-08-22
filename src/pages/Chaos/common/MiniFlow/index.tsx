/* eslint-disable no-bitwise */
import AddFunction from 'pages/Chaos/Experiment/common/AddFunction';
import Node from 'pages/Chaos/common/Node';
import React, { useEffect, useRef, useState } from 'react';
import SwitchArrow from 'pages/Chaos/common/Node/SwitchArrow';
import * as _ from 'lodash';
import i18n from '../../../../i18n';
import styles from './index.css';
import { IActivity } from 'config/interfaces/Chaos/experimentTask';
import { IFlow, INode } from 'config/interfaces/Chaos/experiment';
import { Icon } from '@alicloud/console-components';


const padding = 16;
const headWidth = 16;
const nodeWidth = 244;
let deleteBoxWidth = 0; // 32
let tailWidth = 0; // 48

interface MinFlowProps {
  key?: string | number | undefined;
  scopeType?: number | string;
  nodes: INode[] | IActivity[];
  selectedNode?: INode | IActivity | null;
  onNodeAdding?: () => void;
  onNodeAdd?: (node: INode | IActivity, flow?: IFlow) => void;
  onNodeDelete?: (node: INode | IActivity, flow?: IFlow) => void;
  onNodeClick?: (node: INode | IActivity, flow?: IFlow) => void;
  editable: boolean;
  isExpertise?: boolean;
  deletable?: boolean;
  onDelete?: () => void;
  onTryAgain?: (node: IActivity, callBack: (res: any) => void) => void;
  running?: boolean;
  onCheck?: (checked: boolean, node: IActivity, callBack: (res: any) => void) => void;
  permission?: number;
}

function MinFlow(props: MinFlowProps) {
  const containerEl = useRef<HTMLDivElement | null>(null);
  let timer: NodeJS.Timeout;
  if (!props.editable) {
    tailWidth = 29;
  } else {
    tailWidth = 48;
  }

  // 有删除按钮，需要减去删除按钮宽度
  if (!props.deletable) {
    deleteBoxWidth = 0;
  } else {
    deleteBoxWidth = 32;
  }

  const [ containerWidth, setContainerWidth ] = useState<number | null>(0);
  const [ phase, setPhase ] = useState<number | undefined>(NaN); // 阶段参数，查询小程序需要
  const [ prevNode, setPrevNode ] = useState<INode>();
  const [ nextNode, setNextNode ] = useState<INode>();
  const [ addFunctionVisible, setAddFunctionVisible ] = useState(false);

  useEffect(() => {
    // 获取外部的空间，需要减去内部padding
    handleSetContainerWidth();
    handleSetUpDetectContainerTimer();
  }, []);

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  function handleSetContainerWidth() {
    const { editable } = props;
    const newContainerWidth = containerEl.current && containerEl.current!.scrollWidth - (editable ? padding * 2 : 0);
    if (newContainerWidth !== containerWidth) {
      setContainerWidth(newContainerWidth);
    }
  }

  function handleSetUpDetectContainerTimer() {
    const interval = 1000;
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      handleSetContainerWidth();
      handleSetUpDetectContainerTimer();
    }, interval);
  }

  const handleNodeAddClick = (prevNode: INode, nextNode: INode) => {
    const { onNodeAdding } = props;
    onNodeAdding && onNodeAdding();

    let phase: number | undefined;
    if (prevNode) {
      if (prevNode.phase === (1 << 1)) { // attack
        if (nextNode) {
          if (nextNode.phase === (1 << 3)) { // recover
            // 如果是注入和恢复之间添加，则phase应该是检查和恢复都包含
            phase = (1 << 2) | (1 << 3);
          } else {
            if (nextNode.phase) {
              phase = nextNode.phase;
            }
          }
        } else {
          // 只有1个attack节点，后面可以添加检查和恢复
          phase = (1 << 2) | (1 << 3);
        }
      } else {
        if (prevNode.phase) {
          phase = prevNode.phase;
        }
      }
    } else {
      phase = 1 << 0;
    }

    setPrevNode(prevNode);
    setNextNode(nextNode);
    setPhase(phase);
    setAddFunctionVisible(true);
  };

  function handleAddFunctionClose() {
    setAddFunctionVisible(false);
  }

  function handleFunctionSelect(node: INode) {

    // 根据phase获取stage
    let stage;
    switch (phase) {
      case (1 << 0):
        stage = 'prepare';
        break;
      case (1 << 1):
        stage = 'attack';
        break;
      case (1 << 2):
        stage = 'check';
        break;
      case (1 << 3):
        stage = 'recover';
        break;
      default:
        stage = undefined;
        break;
    }

    // 如果是组合的场景，只有1个情况：检查阶段 + 恢复阶段
    if (!stage) {
      const phaseFlag = _.get(node, 'phaseFlag');
      if (phaseFlag) {
        // 如果包含恢复阶段，则stage为恢复，否则为检查
        if ((phaseFlag & 8) === 8) {
          stage = 'recover';
        } else {
          stage = 'check';
        }
      }
    }
    node.stage = stage;

    // 执行节点插入
    if (prevNode) {
      prevNode.insertAfter!(node);
    } else if (nextNode) {
      nextNode.insertBefore!(node);
    }

    const { onNodeAdd } = props;
    onNodeAdd && onNodeAdd(node);
  }

  function getNodeCountPerLine(containerWidth: number, totalCount: number) {
    const { editable } = props;
    // 有删除按钮，需要减去删除按钮宽度
    const maxWidth = containerWidth - deleteBoxWidth;
    const headNodeWidth = editable ? (headWidth + nodeWidth + tailWidth) : (nodeWidth + tailWidth);
    let count = 0;
    if (maxWidth >= headNodeWidth) {
      count = 1;
      let leftWidth = maxWidth - headNodeWidth;
      while (leftWidth >= tailWidth + nodeWidth) {
        ++count;
        leftWidth -= (tailWidth + nodeWidth);
      }

      if (leftWidth > nodeWidth && totalCount > (count + 1)) {
        ++count;
      }
    }
    return count;
  }

  function renderNodes(nodes: INode[] | IActivity[]) {
    const { editable, selectedNode, isExpertise, running } = props;
    const nodeCountPerLine = getNodeCountPerLine(containerWidth!, nodes.length);
    // const switchArrowWidth = (nodeWidth + tailWidth) * nodeCountPerLine - tailWidth + (editable ? headWidth : 0);
    const switchArrowPadding = nodeWidth / 2 + (editable ? headWidth : 0);
    const switchArrowLineWidth = (nodeWidth + tailWidth) * (nodeCountPerLine - 1);
    const nodeCtrls: any[] = [];

    if (containerWidth! > 0 && nodeCountPerLine > 0) {
      _.forEach(nodes as INode[], (node: INode, index: number) => {
        const { id, activityId } = node;
        const selected = selectedNode && (node.id === selectedNode.id);
        const isHead = index === 0;
        const isLineFirst = index !== 0 && (index + 1) % nodeCountPerLine === 1;
        const isLineLast = index !== nodes.length - 1 && (index + 1) % nodeCountPerLine === 0;
        const isLast = index === nodes.length - 1;
        nodeCtrls.push((
          <Node
            key={id || activityId}
            data={node}
            editable={editable}
            isExpertise={isExpertise}
            selected={selected}
            isHead={isHead}
            isLineFirst={isLineFirst}
            isLineLast={isLineLast}
            isLast={isLast}
            onClick={props.onNodeClick}
            onNodeAddClick={handleNodeAddClick}
            onNodeDeleteClick={props.onNodeDelete}
            onTryAgainClick={props.onTryAgain}
            running={running}
            onCheck={props.onCheck}
            permission={props.permission}
          />
        ));

        if (isLineLast) {
          nodeCtrls.push((
            <SwitchArrow
              key={index}
              data={node}
              editable={editable}
              lineWidth={switchArrowLineWidth}
              padding={switchArrowPadding}
              onNodeAddClick={handleNodeAddClick}
            />
          ));
        }
      });
    }

    return nodeCtrls;
  }

  const { editable, nodes, scopeType, deletable } = props;
  const boxContainerCls = editable ? styles.boxContainer : styles.boxContainerReadOnly;

  if (_.isEmpty(nodes)) {
    return null;
  }
  return (
    <div className={boxContainerCls}>
      <div ref={containerEl} className={styles.box}>
        { renderNodes(nodes) }
      </div>
      {
        deletable &&
        <div
          className={styles.deleteFlowBox}
          onClick={props.onDelete}
          data-autolog={`text=${i18n.t('Delete walkthrough group')}`}
        >
          <Icon
            type="ashbin"
            size="small"
            style={{
              color: '#888',
            }}
            data-autolog={`text=${i18n.t('Delete walkthrough group')}`}
          />
        </div>
      }
      <AddFunction
        title={i18n.t('Choose a walkthrough node').toString()}
        searchable={true}
        visible={addFunctionVisible}
        phase={phase!}
        scopeType={scopeType}
        onClose={handleAddFunctionClose}
        onSelect={handleFunctionSelect}
      />
    </div>
  );
}

export default MinFlow;
