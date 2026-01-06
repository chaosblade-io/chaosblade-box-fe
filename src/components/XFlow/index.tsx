import React from 'react';
import { TopologyXFlow } from './components/TopologyXFlow';
import './styles/app.css';

interface XFlowProps {
  data?: any;
  errors?: string[];
  onChange?: (data: any) => void;
}

/**
 * XFlow 可视化组件
 * 用于替换原来的 XFlowTraceVisualization 组件
 */
const XFlow: React.FC<XFlowProps> = ({ data, errors, onChange }) => {
  // 这里可以处理传入的数据和错误信息
  // 但目前我们主要依赖 XFlow 内部的数据获取和处理逻辑

  return (
    <div className="xflow-topology-app">
      <TopologyXFlow />
    </div>
  );
};

export default XFlow;
