import React, { useState, useEffect } from 'react';
import { Input, List, Button, Space, Empty } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import type { Graph } from '@antv/x6';
import type { XFlowNode } from '../../types/xflow';

interface FilterPanelProps {
  graph: Graph | null;
  onNodeSelect: (nodeId: string) => void;
}

interface FilteredNode {
  id: string;
  label: string;
  entityType: string;
}

/**
 * 节点过滤面板组件
 * 提供按节点ID模糊搜索功能
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({ graph, onNodeSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<FilteredNode[]>([]);
  const [showResults, setShowResults] = useState(false);

  // 根据搜索文本过滤节点
  useEffect(() => {
    if (!graph || !searchText.trim()) {
      setFilteredNodes([]);
      setShowResults(false);
      return;
    }

    const allNodes = graph.getNodes();
    const filtered = allNodes
      .map(node => {
        const nodeData = node.getData() as XFlowNode['data'];
        // 排除虚拟节点
        if (nodeData?.isVirtual) {
          return null;
        }
        const label = nodeData?.displayName || nodeData?.entity?.name || node.id || '';
        return {
          id: node.id,
          label,
          entityType: nodeData?.entityType || 'UNKNOWN'
        };
      })
      .filter((node): node is FilteredNode => node !== null && (
        node.label.toLowerCase().includes(searchText.toLowerCase()) ||
        node.id.toLowerCase().includes(searchText.toLowerCase())
      ))
      .slice(0, 20); // 限制最多显示20个结果

    setFilteredNodes(filtered);
    setShowResults(true);
  }, [searchText, graph]);

  const handleSearch = () => {
    if (searchText.trim() && filteredNodes.length > 0) {
      setShowResults(true);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    // 隐藏结果列表但不清空搜索文本
    setShowResults(false);
    onNodeSelect(nodeId);
  };

  const clearSearch = () => {
    setSearchText('');
    setFilteredNodes([]);
    setShowResults(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
        <Input
          placeholder="搜索节点 (按 nodeId)"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          suffix={
            <Space size="small">
              {searchText && (
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={clearSearch}
                  size="small"
                />
              )}
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                size="small"
              />
            </Space>
          }
          style={{ width: 200 }}
          size="small"
        />
      </div>

      {/* 在同一图层展示过滤结果 */}
      {showResults && searchText && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: 300,
            maxHeight: 300,
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1001,
            marginTop: 4
          }}
        >
          {filteredNodes.length > 0 ? (
            <List
              dataSource={filteredNodes}
              renderItem={node => (
                <List.Item
                  onClick={() => handleNodeClick(node.id)}
                  style={{ cursor: 'pointer', padding: '8px 12px' }}
                >
                  <List.Item.Meta
                    title={<span style={{ fontSize: 12 }}>{node.label}</span>}
                    description={<span style={{ fontSize: 11 }}>ID: {node.id} | 类型: {node.entityType}</span>}
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ padding: 20 }}>
              <Empty description="未找到匹配的节点" imageStyle={{ height: 30 }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};