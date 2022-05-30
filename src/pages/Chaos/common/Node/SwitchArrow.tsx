import Iconfont from 'pages/Chaos/common/Iconfont';
import React from 'react';
import styles from './index.css';
import { INode } from 'config/interfaces/Chaos/experiment';
import { Icon } from '@alicloud/console-components';

interface SwitchArrowProps {
  key?: any;
  data: INode;
  editable: boolean;
  lineWidth: number;
  padding: number;
  onNodeAddClick: (prevNode: INode, nextNode: INode) => void;
}

export default function SwitchArrow(props: SwitchArrowProps) {
  function handleNodeAddClick(prevNode: INode, nextNode: INode) {
    const { onNodeAddClick } = props;
    onNodeAddClick && onNodeAddClick(prevNode, nextNode);
  }

  const { data: node, editable, lineWidth, padding } = props;

  return (
    <div
      className={styles.switchArrowContainer}
      style={{
        width: '100%',
        paddingLeft: padding,
      }}>
      <div className={styles.switchArrowDownContainer}>
        <div className={styles.switchArrowDown}>
        </div>
        <Icon className={styles.switchArrowDownIcon} type="caret-down" size="small" />
      </div>
      <div
        className={styles.switchArrowLine}
        style={{
          width: lineWidth,
        }}
      ></div>
      <div className={styles.switchArrowUpContainer}>
        <div className={styles.switchArrowUp}>
        </div>
        {
          editable && (
            <Iconfont
              className={styles.switchArrowIcon}
              type="icon-tianjia2"
              onClick={() => handleNodeAddClick(node, node.next!)}
            />
          )
        }
      </div>
    </div>
  );
}
