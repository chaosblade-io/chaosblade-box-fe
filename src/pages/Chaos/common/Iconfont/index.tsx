import React from 'react';

const customCache = new Set();

interface IOptions {
  scriptUrl: string;
  extraCommonProps?: any;
}

interface IconfontProps {
  type: string;
  children?: string;
  className: any;
  onClick?: () => void;
  'data-autolog'?: string;
}

const createFromIconfontCN = (options: IOptions) => {
  const { scriptUrl, extraCommonProps = {} } = options;

  if (typeof document !== 'undefined'
    && typeof window !== 'undefined'
    && typeof document.createElement === 'function'
    && typeof scriptUrl === 'string'
    && scriptUrl.length
    && !customCache.has(scriptUrl)
  ) {
    const script = document.createElement('script');
    script.setAttribute('src', scriptUrl);
    script.setAttribute('data-namespace', scriptUrl);
    customCache.add(scriptUrl);
    document.body.appendChild(script);
  }

  const Iconfont = (props: IconfontProps) => {
    const { type, children, ...restProps } = props;

    let content: any = null;
    if (props.type) {
      content = (<use xlinkHref={`#${type}`}/>);
    }

    if (children) {
      content = children;
    }

    return (
      <svg {...restProps} {...extraCommonProps}>
        {content}
      </svg>
    );
  };

  Iconfont.displayName = 'Iconfont';
  return Iconfont;
};

const Iconfont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_976326_mtiq05ajtqs.js',
});

export default Iconfont;

