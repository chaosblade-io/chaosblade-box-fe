import React, { FC, memo } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IPorps {
  content: string;
  styles?: any;
}

const MarkD: FC<IPorps> = ({ content, styles = {} }) => {

  return (
    <div style={styles}>
      <ReactMarkdown children={content || ''} remarkPlugins={[ remarkGfm ]} />
    </div>
  );
};

export default memo(MarkD);
