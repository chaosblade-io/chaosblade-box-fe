declare module '*.css';
declare module 'dva';
declare module 'dva-loading';
declare module 'history';
declare module 'redux';
declare module 'react-redux';
declare module 'redux-saga/effects';
declare module '@alicloud/console-components-actions';
declare module '@alicloud/console-mock-interceptor';
declare module '@alicloud/console-request-interceptor';
declare module '@alicloud/widget-requestwidget-request';
declare module '@alicloud/search-params-interceptor';
declare module '@alicloud/fecs-csrf-token-error-interceptor';
declare module '@alicloud/console-components-console-menu/RoutableMenu';
declare module 'react-draggable-tags';
declare module 'react-code-diff-lite';
declare module 'diff-match-patch';
declare module 'randomcolor'
declare module 'classnames'
declare module 'uuid'
declare module 'file-saver';
declare module 'bx-tooltip';
declare module '@antv/g2plot';
declare module '*.svg'
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.bmp'
declare module '*.tiff'

// JSX namespace declaration for TypeScript 3.2 compatibility
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface Element extends React.ReactElement<any> {}
  interface ElementClass extends React.Component<any> {
    render(): React.ReactNode;
  }
}

// Lodash type augmentation for TypeScript 3.2 compatibility
declare module 'lodash' {
  const _: {
    get<T = any>(object: any, path: string | string[], defaultValue?: T): T;
    set(object: any, path: string | string[], value: any): any;
    isEmpty(value?: any): boolean;
    [key: string]: any;
  };
  export = _;
}
