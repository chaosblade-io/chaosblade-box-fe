import Iconfont from 'pages/Chaos/common/Iconfont';
import React, { useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './index.css';
import { Button, Icon } from '@alicloud/console-components';
import { ExperimentConstants, NORMAL, NodeRunResult, RECOVER, TASK } from 'config/constants/Chaos/Node';
import { INode } from 'config/interfaces/Chaos/experiment';
import { handleIsAdmin } from 'pages/Chaos/lib/BetaFlag';

interface NodeProps {
  editable?: boolean;
  data: INode;
  isHead?: boolean;
  isLineFirst?: boolean;
  isLineLast?: boolean;
  isLast?: boolean;
  selected?: INode | boolean | null;
  [key: string]: any;
}

const COLOR_MAP: {[key: string]: any} = {
  prepare: '#FFDDB2',
  attack: '#79B3F3',
  check: '#BAB1EA',
  recover: '#2A828A',
};

// 节点分组标签颜色，5个一循环
const NODE_GROUP_ORDER: {[key: string]: any} = {
  0: {
    tag: '#EDF7ED',
    word: '#629962',
  },
  1: {
    tag: '#EDF3F7',
    word: '#628099',
  },
  2: {
    tag: '#F0EDF7',
    word: '#746299',
  },
  3: {
    tag: '#F7EDED',
    word: '#996262',
  },
  4: {
    tag: '#F7F6ED',
    word: '#999062',
  },
};

export default function Node(props: NodeProps): JSX.Element {

  const { permission } = props;
  const [ isContinue, setIsContinue ] = useState(false); // 继续
  const [ isStop, setIsStop ] = useState(false); // 停止
  const [ isRetry, setIsRetry ] = useState(false); // 重试

  const handleClick = () => {
    const { data: node, onClick } = props;

    if (!_.isEmpty(node)) {
      onClick && onClick(node);
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();

    const { data: node, onNodeDeleteClick } = props;
    onNodeDeleteClick && onNodeDeleteClick(node);
  };

  const handleNodeAddClick = (prevNode: INode | null, nextNode: INode) => {
    const { onNodeAddClick } = props;
    onNodeAddClick && onNodeAddClick(prevNode, nextNode);
  };

  const handleTryAgain = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    setIsRetry(true);
    e.stopPropagation();
    if (!handleIsAdmin(permission as number, 4)) {
      return;
    }
    const { data: node, onTryAgainClick } = props;
    if (!_.isEmpty(node)) {
      onTryAgainClick && onTryAgainClick(node, () => {
        setIsRetry(false);
      });
    }
  };

  const handleIsContiue = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, checked: boolean) => {
    if (checked) {
      setIsContinue(true);
    } else {
      setIsStop(true);
    }
    e.stopPropagation();
    if (!handleIsAdmin(permission as number, 4)) {
      return;
    }
    const { data: node, onCheck } = props;
    if (!_.isEmpty(node)) {
      onCheck && onCheck(checked, node, () => {
        if (checked) {
          setIsContinue(false);
        } else {
          setIsStop(false);
        }
      });
    }
  };

  // 是否有必填参数
  function handleHasRequiredParameters(): boolean {
    const { data: node } = props;
    let hasReuired = false;
    if (!_.isEmpty(node)) {
      const args = node.arguments || node.args;
      if (!_.isEmpty(args)) {
        args.forEach((item: any) => {
          item.argumentList?.forEach((temp: any) => {
            const { component } = temp;
            if (!_.isEmpty(component)) {
              if (component.required) {
                hasReuired = true;
              }
            }
          });
        });
      }
    }
    return hasReuired;
  }

  const { isExpertise, editable, data: node, isHead, isLineFirst, isLineLast, isLast, selected } = props;
  const { stage, activityName, name, miniAppName, state, runResult, retryable, userCheckState, nodeType, hostPercent, hosts } = node;

  const nodeName = activityName || name || miniAppName;
  const hasRequiredParameters: boolean = handleHasRequiredParameters();
  const nodeClassMap = {
    [styles.nodeBox]: true,
  };
  const deletable = props.hasOwnProperty('deletable') ? props.deletable : node.deletable;

  // 外部容器样式：区分流程节点与全局节点
  let containerCls;
  let nodeBoxTail: any;

  if (nodeType !== NORMAL && nodeType !== TASK) {
    nodeBoxTail = null;
    containerCls = styles.globalNodeContainer;
  } else {
    nodeBoxTail = editable ? styles.tailBox : styles.tailBoxReadOnly;
    containerCls = styles.normalNodeContainer;
  }

  /** ********************* 以下是节点状态展示逻辑 ***************** **/

  // 1. 是否被选中
  if (selected) {
    nodeClassMap[styles.selectedNode] = true;
  }

  // 2. 参数校验是否通过：流程节点
  if (node.hasOwnProperty('argsValid')) {
    if (editable && !node.argsValid && !isExpertise) {
      // 非管理员模式下，参数校验不通过
      // 如果已经处于被选中则需要去掉，否则左下角还多个三角形
      nodeClassMap[styles.selectedNode] = false;
      nodeClassMap[styles.errorNode] = true;
    }
  }

  // 3. 执行节点状态
  // 执行页面流程状态执行中，执行成功 执行失败和待执行
  if (state === 'RUNNING' && !selected) {
    nodeClassMap[styles.activityRunning] = true;
  } else if (state === 'FINISHED' && !selected) {
    if (runResult && runResult === NodeRunResult.SUCCESS) {
      nodeClassMap[styles.activitySuccess] = true;
    } else if (runResult && runResult === NodeRunResult.REJECTED) {
      nodeClassMap[styles.activityRejected] = true;
    } else {
      nodeClassMap[styles.activityFailed] = true;
    }

  }

  function renderColor(groupOrder: number) {
    return NODE_GROUP_ORDER[groupOrder % 5]!.tag || '';
  }

  function renderWordColor(groupOrder: number) {
    return NODE_GROUP_ORDER[groupOrder % 5]!.word || '';
  }

  return (
    <div className={containerCls}>
      {
        /* 编辑模式下，第一个节点之前应该有线条和添加节点的icon */
        editable && isHead && (
          <div className={styles.headBox}>
            <Iconfont
              className={styles.iconHead}
              type="icon-tianjia2"
              onClick={() => handleNodeAddClick(null, node)}
              data-autolog={'text=添加演练节点'}
            />
            <div className={styles.arrowLineHead}></div>
          </div>
        )
      }
      {
        /* 行首节点，但不是第一个，这时占个空位 */
        isLineFirst && editable && (
          <div className={styles.firstBox}></div>
        )
      }
      {
        /* 节点主体!!!!!!!!!!!!
          执行动态页面流程节点，根据运行状态等属性区分节点样式及是否有操作按钮
        */
      }
      <div
        title={activityName || name || miniAppName}
        className={classnames(nodeClassMap)}
        onClick={handleClick}
      >
        {/* 节点内分上、下两层，每一层又分左、右两个部分 */}
        <div className={styles.topLayer}>
          <div className={styles.topLeftBox}>
            <div className={styles.stageIcon} style={{ backgroundColor: COLOR_MAP[stage!] }}></div>
            <span title={nodeName} className={styles.nodeName}>{nodeName}</span>
          </div>
          <div className={styles.topRightBox}>
            {
              // 非管理员、编辑模式下，参数校验不通过，展示叉icon
              editable && !isExpertise && node.argsValid === false && <Icon type={'delete-filling'} size={'xs'} style={{ color: '#D93026', marginRight: 12 }} />
            }
            {
              runResult && runResult === NodeRunResult.SUCCESS && <Icon type={'success-filling'} size={'small'} style={{ color: '#1E8E3E', marginRight: 12 }} />
            }
            {
              runResult && _.indexOf(NodeRunResult.FAILED, runResult) >= 0 && <Icon type={'delete-filling'} size={'small'} style={{ color: '#D93026', marginRight: 12 }} />
            }
            {
              state === 'RUNNING' && <Icon type={'loading'} size={'small'} style={{ marginRight: 12 }} />
            }
            { // 只读模式下提示分组名
              !editable && node.groupOrder && (
                <div className={styles.groupOrderBox} style={{ backgroundColor: renderColor(node.groupOrder) }}>
                  <span style={{ color: renderWordColor(node.groupOrder) }}>分组{node.groupOrder}</span>
                </div>
              )
            }
          </div>
        </div>
        <div className={styles.bottomLayer}>
          <div className={styles.bottomLeftBox}>
            <div className={styles.parameterInfo}>
              {
                !isExpertise && editable && !state && (
                  <>
                    <span>必填参数：</span>
                    { (hasRequiredParameters || nodeType === RECOVER) && <span style={{ color: '#D93026' }}>有</span> }
                    { (!hasRequiredParameters && nodeType !== RECOVER) && <span>无</span> }
                  </>
                )
              }
              {
                // 全局节点在详情态下也展示必填参数
                !isExpertise && !editable && !state && (nodeType !== NORMAL) && (
                  <>
                    <span>必填参数：</span>
                    { (hasRequiredParameters || nodeType === RECOVER) && <span style={{ color: '#D93026' }}>有</span> }
                    { (!hasRequiredParameters && nodeType !== RECOVER) && <span>无</span> }
                  </>
                )
              }
              {
                // 经验库详情态下也展示必填参数
                isExpertise && !editable && !state && (
                  <>
                    <span>必填参数：</span>
                    { (hasRequiredParameters || nodeType === RECOVER) && <span style={{ color: '#D93026' }}>有</span> }
                    { (!hasRequiredParameters && nodeType !== RECOVER) && <span>无</span> }
                  </>
                )
              }
              {
                !isExpertise && !editable && (nodeType === NORMAL) && !state && (
                  <>
                    <span>涉及机器：</span>
                    {(hostPercent && hostPercent !== 0 && !hosts) ? <span style={{ color: '#0070cc' }}>{hostPercent}%</span> : <span></span>}
                    {hosts &&
                      <span style={{ color: '#0070cc' }}>{`${node.hosts}个`}</span>
                    }
                  </>
                )
              }
              {
                userCheckState === ExperimentConstants.EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_WAITING && <span>待手动推进</span>
              }
              {
                runResult && runResult === NodeRunResult.SUCCESS && <span>节点成功执行</span>
              }
              {
                runResult && _.indexOf(NodeRunResult.FAILED, runResult) >= 0 && <span>节点执行失败</span>
              }
              {
                runResult && runResult === NodeRunResult.REJECTED && <span>节点执行被跳过</span>
              }
              {
                state && state === 'RUNNING' && <span>节点执行中…</span>
              }
            </div>
          </div>
          <div className={styles.bottomRightBox}>
            <div className={styles.userAction}>
              {
                retryable && <span className={styles.contiueTryIcon} onClick={e => handleTryAgain(e)}>
                  <Button type='primary' loading={isRetry} text className={styles.action} disabled={!handleIsAdmin(permission as number, 4)}>重试</Button>
                </span>
              }
              {
                userCheckState === ExperimentConstants.EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_WAITING
                  ?
                  <span className={styles.userCheck}>
                    <span className={styles.contiueTryIcon} onClick={e => handleIsContiue(e, true)}>
                      <Button type='primary' loading={isContinue} text className={styles.action} disabled={!handleIsAdmin(permission as number, 4)}>继续</Button>
                    </span>
                    <span onClick={(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => handleIsContiue(e, false)}>
                      <Button type='primary' loading={isStop} text className={styles.action} disabled={!handleIsAdmin(permission as number, 4)}>终止</Button>
                    </span>
                  </span>
                  :
                  <span></span>
              }
            </div>
          </div>
        </div>
        {
          /* 这里是绝对定位 */
          /* 被选中的节点（并且参数校验通过），左下角展示三角形 */
          state ? selected && <div className={styles.selectedTriangle} /> :
            selected && node.argsValid && <div className={styles.selectedTriangle} />
        }
        {
          /* 这里是绝对定位 */
          /* 可编辑并且可删除的节点，展示删除icon */
          editable && deletable && !state && (
            <Icon
              type="ashbin"
              size="small"
              style={{
                position: 'absolute',
                top: 16,
                right: 12,
                color: '#888',
              }}
              onClick={e => handleDelete(e)}
              data-autolog={'text=删除演练节点'}
            />
          )
        }
        {
          /* 这里是绝对定位 */
          state && state === 'RUNNING' && <div></div>
        }
      </div>
      {
        !isLineLast && !isLast && (
          <div className={nodeBoxTail}>
            {(nodeType === NORMAL || nodeType === TASK) ?
              <>
                <div className={styles.arrowLineTail}></div>
                <Icon type="caret-right" size="small" />
              </>
              : null}
            {
              nodeType === NORMAL && editable && (
                <Iconfont
                  className={styles.iconTail}
                  type="icon-tianjia2"
                  onClick={() => handleNodeAddClick(node, node.next!)}
                  data-autolog={'text=添加演练节点'}
                />
              )
            }
          </div>
        )
      }
      {
        isLast && editable && (
          <div className={nodeBoxTail}>
            {(nodeType === NORMAL || nodeType === TASK) ?
              <>
                <div className={styles.arrowLineTail}></div>
                <Icon type="caret-right" size="small" />
              </>
              : null}
            <Iconfont
              className={styles.iconTail}
              type="icon-tianjia2"
              onClick={() => handleNodeAddClick(node, node.next!)}
              data-autolog={'text=添加演练节点'}
            />
          </div>
        )
      }
    </div>
  );
}
