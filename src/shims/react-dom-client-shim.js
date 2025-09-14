import ReactDOM from 'react-dom';

export function createRoot(container) {
  return {
    render: (el) => ReactDOM.render(el, container),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
  };
}

export function hydrateRoot(container, children) {
  ReactDOM.hydrate(children, container);
  return {
    render: (el) => ReactDOM.render(el, container),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
  };
}

