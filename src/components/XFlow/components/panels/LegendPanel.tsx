import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 图例面板组件
 * 显示不同关系类型的图例说明
 */
export const LegendPanel: React.FC = () => {
  const { t } = useTranslation();
  const [ isVisible, setIsVisible ] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '6px 12px',
          zIndex: 100,
          cursor: 'pointer',
        }}
        onClick={toggleVisibility}
      >
        <span style={{ fontSize: '12px', color: '#666' }}>{t('Show legend')}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '12px',
        zIndex: 100,
        width: '200px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>{t('Relationship Legend')}</h4>
        <span
          style={{ fontSize: '12px', color: '#1890ff', cursor: 'pointer' }}
          onClick={toggleVisibility}
        >
          {t('Hide')}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <svg width="30" height="20" style={{ marginRight: '8px' }}>
          <line x1="0" y1="10" x2="30" y2="10" stroke="#1890ff" strokeWidth="2" markerEnd="url(#arrow)" />
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#1890ff" />
            </marker>
          </defs>
        </svg>
        <span style={{ fontSize: '12px' }}>{t('Dependency Relationship')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <svg width="30" height="20" style={{ marginRight: '8px' }}>
          <line x1="0" y1="10" x2="30" y2="10" stroke="#52c41a" strokeWidth="1" strokeDasharray="5 5" markerEnd="url(#arrow2)" />
          <defs>
            <marker id="arrow2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#52c41a" />
            </marker>
          </defs>
        </svg>
        <span style={{ fontSize: '12px' }}>{t('Contains Relationship')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <svg width="30" height="20" style={{ marginRight: '8px' }}>
          <line x1="0" y1="10" x2="30" y2="10" stroke="#1890ff" strokeWidth="1.5" markerEnd="url(#arrow3)" />
          <defs>
            <marker id="arrow3" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#1890ff" />
            </marker>
          </defs>
        </svg>
        <span style={{ fontSize: '12px' }}>{t('Invocation Relationship')}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <svg width="30" height="20" style={{ marginRight: '8px' }}>
          <line x1="0" y1="10" x2="30" y2="10" stroke="#722ed1" strokeWidth="2" strokeDasharray="10 2" markerEnd="url(#arrow4)" />
          <defs>
            <marker id="arrow4" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#722ed1" />
            </marker>
          </defs>
        </svg>
        <span style={{ fontSize: '12px' }}>{t('Running Relationship')}</span>
      </div>
    </div>
  );
};
