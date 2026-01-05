import React, { FC, memo } from 'react';

interface IPorps {
  content: string;
  styles?: any;
}

const MarkD: FC<IPorps> = ({ content, styles = {} }) => {
  // react-markdown 已移除，改为简单的文本渲染
  // 如需 Markdown 支持，可以重新安装 react-markdown 或使用其他 Markdown 库
  return (
    <div style={styles}>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{content || ''}</pre>
    </div>
  );
};

export default memo(MarkD);
