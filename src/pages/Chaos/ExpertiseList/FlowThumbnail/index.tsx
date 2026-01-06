import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import * as _ from 'lodash';
import styles from './index.css';
import { Balloon, Icon } from '@alicloud/console-components';

interface IPorps {
  nodes: any;
  containerWidth: number;
  containerHeight: number;
}

const FlowThumbnail: FC<IPorps> = props => {
  const { nodes, containerWidth = 0, containerHeight } = props;
  if (_.isEmpty(nodes) || containerWidth === 0) {
    return null;
  }

  const containerRef = useRef<any | null>(null);
  const [ boxWidth, setBoxWidth ] = useState(0);
  const [ boxHeight, setBoxHeight ] = useState(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setBoxWidth(containerRef.current.clientWidth);
      setBoxHeight(containerRef.current.clientHeight);
    }
  });

  const controlBoxStyles: {
    flexWrap?: any;
  } = {};

  // 确定节点的排列和尺寸
  const totalCount = nodes.length;
  let countPerRow = 0; // 每行排列几个节点
  let nodeWidth = 0; // 节点宽度
  let nodeHeight = 0; // 节点高度
  let arrowWidth = 0; // 节点之间的箭头线长度
  let switchArrowLineWidth = 0; // 折行箭头线长度
  let switchArrowLineHeight = 0; // 折行箭头线的高度（分上下两半）
  if (totalCount === 1) {
    countPerRow = 1;
    nodeWidth = 157;
    nodeHeight = 44;
  } else if (totalCount === 2) {
    countPerRow = 2;
    nodeWidth = 130;
    nodeHeight = 34;
    arrowWidth = 32;
    controlBoxStyles.flexWrap = 'nowrap';
  } else if (totalCount <= 6) {
    countPerRow = 3;
    nodeWidth = 130;
    nodeHeight = 34;
    arrowWidth = 16;
    switchArrowLineWidth = (nodeWidth + arrowWidth) * (countPerRow - 1);
    switchArrowLineHeight = 12;
  } else if (totalCount <= 8) {
    countPerRow = 3;
    nodeWidth = 115;
    nodeHeight = 24;
    arrowWidth = 16;
    switchArrowLineWidth = (nodeWidth + arrowWidth) * (countPerRow - 1);
    switchArrowLineHeight = 12;
  } else {
    countPerRow = 4;
    nodeWidth = 95;
    nodeHeight = 20;
    arrowWidth = 14;
    switchArrowLineWidth = (nodeWidth + arrowWidth) * (countPerRow - 1);
    switchArrowLineHeight = 8;
  }

  const padding = (containerWidth - countPerRow * nodeWidth - (countPerRow - 1) * arrowWidth) / 2;
  const controls: any = [];
  for (let i = 0; i < totalCount; i++) {
    const node = nodes[i];
    const isLast = i === totalCount - 1; // 是否最后1个节点
    const isLineLast = (i + 1) % countPerRow === 0; // 是否行尾节点

    // 先add
    controls.push((
      <div
        key={`node-${i}`}
        className={styles.node}
        style={{
          width: nodeWidth,
          height: nodeHeight,
        }}
      >
        <Balloon
          trigger={<span>{node.name}</span>}
          closable={false}
        >
          {node.name}
        </Balloon>
      </div>
    ));

    if (!isLast) {
      if (isLineLast) {
        controls.push((
          <div
            key={`switchArrowBox-${i}`}
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: countPerRow * nodeWidth + (countPerRow - 1) * arrowWidth,
            }}
          >
            <div
              style={{
                width: switchArrowLineWidth,
              }}
            >
              <div className={styles.topPart} style={{ height: switchArrowLineHeight }} />
              <div className={styles.midPart} style={{ width: switchArrowLineWidth }} />
              <div className={styles.bottomPart} style={{ height: switchArrowLineHeight }}>
                <Icon
                  type="arrow-down1"
                  size="xs"
                  style={{
                    top: countPerRow === 4 ? -3 : (countPerRow === 3 ? 1 : 0), // 样式微调
                    left: countPerRow === 4 ? -7 : -6, // 样式微调
                  }}
                />
              </div>
            </div>
          </div>
        ));
      } else {
        controls.push((
          <div
            key={`arrowBox-${i}`}
            className={styles.arrowBox}
            style={{
              width: arrowWidth,
              height: nodeHeight, // 和节点高度一样
            }}
          >
            <div className={styles.arrow} />
            <Icon type="caret-right" size="xs" style={{ top: nodeHeight / 2 - 8 }} />
          </div>
        ));
      }
    }
  }

  // 处理缩放
  function getTransformScale() {
    const width = boxWidth;
    const height = boxHeight;

    let scaleX = 0;
    let scaleY = 0;
    if (width > containerWidth) {
      scaleX = width / containerWidth;
    }
    if (height > containerHeight) {
      scaleY = height / containerHeight;
    }

    // 取两者较大的那个，也就是需要缩放得更狠
    let scale = 0;
    if (scaleX > scaleY) {
      scale = containerWidth / width;
    } else {
      scale = containerHeight / height;
    }

    // 超过1就不用缩放了
    if (scale >= 1) {
      return {};
    }
    return {
      transform: `scale(${scale})`,
    };
  }

  return (
    <div
      className={styles.thumbnailBox}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      <div
        ref={containerRef}
        className={styles.controlBox}
        style={{
          paddingLeft: padding,
          paddingRight: padding,
          ...getTransformScale(),
          ...controlBoxStyles,
        }}
      >
        {controls}
      </div>
    </div>
  );

};

export default FlowThumbnail;
