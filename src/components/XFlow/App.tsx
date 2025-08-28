import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { TopologyXFlow } from './components/TopologyXFlow';
import 'antd/dist/reset.css';
import './styles/app.css';

/**
 * XFlow 拓扑可视化应用
 */
const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="xflow-topology-app">
        <TopologyXFlow />
      </div>
    </ConfigProvider>
  );
};

export default App;
