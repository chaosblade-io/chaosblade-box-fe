import React, { FC, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IPorps {
  content: string;
  styles?: React.CSSProperties;
}

const MarkD: FC<IPorps> = ({ content, styles = {} }) => {
  const wrapStyle: React.CSSProperties = {
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    whiteSpace: 'pre-wrap',
    ...styles,
  };

  const commonInline = { wordBreak: 'break-word', overflowWrap: 'anywhere' as const };
  const commonBlock = { wordBreak: 'break-word' as const, overflowWrap: 'anywhere' as const, whiteSpace: 'pre-wrap' as const };

  return (
    <div style={wrapStyle}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p style={commonBlock} {...props} />,
          li: ({ node, ...props }) => <li style={commonBlock} {...props} />,
          h1: ({ node, ...props }) => <h1 style={commonBlock} {...props} />,
          h2: ({ node, ...props }) => <h2 style={commonBlock} {...props} />,
          h3: ({ node, ...props }) => <h3 style={commonBlock} {...props} />,
          h4: ({ node, ...props }) => <h4 style={commonBlock} {...props} />,
          h5: ({ node, ...props }) => <h5 style={commonBlock} {...props} />,
          h6: ({ node, ...props }) => <h6 style={commonBlock} {...props} />,
          code: ({ inline, children, ...props }) => (
            inline
              ? <code style={commonInline} {...props}>{children}</code>
              : <code style={{ ...commonBlock }} {...props}>{children}</code>
          ),
          pre: ({ node, ...props }) => (
            <pre style={{ ...commonBlock, overflowX: 'auto' }} {...props} />
          ),
          table: ({ node, ...props }) => (
            <table style={{ ...commonBlock, display: 'block', overflowX: 'auto' }} {...props} />
          ),
          th: ({ node, ...props }) => <th style={commonBlock} {...props} />,
          td: ({ node, ...props }) => <td style={commonBlock} {...props} />,
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default memo(MarkD);
