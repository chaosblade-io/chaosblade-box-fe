import React, { FC, useState } from 'react';
import { Checkbox, Tag, Balloon } from '@alicloud/console-components';
import { RiskPoint, RiskSeverity, RiskCategory } from '../../types';
import { SelectedFault } from '../../types/experimentTypes';
import styles from './index.css';

interface RiskPointCardProps {
  risk: RiskPoint;
  selected: boolean;
  selectedFault?: SelectedFault;
  onSelect: (checked: boolean) => void;
  onSelectFault: (fault: SelectedFault) => void;
}

// 严重程度配置
const severityConfig: Record<RiskSeverity, { color: string; label: string }> = {
  CRITICAL: { color: 'red', label: '严重' },
  HIGH: { color: 'orange', label: '高' },
  MEDIUM: { color: 'yellow', label: '中' },
  LOW: { color: 'green', label: '低' },
};

// 类别配置
const categoryConfig: Record<RiskCategory, { label: string }> = {
  SINGLE_POINT_FAILURE: { label: '单点故障' },
  DEPENDENCY_RISK: { label: '依赖风险' },
  RESOURCE_RISK: { label: '资源风险' },
  NETWORK_RISK: { label: '网络风险' },
  DATA_RISK: { label: '数据风险' },
  CAPACITY_RISK: { label: '容量风险' },
};

const RiskPointCard: FC<RiskPointCardProps> = ({
  risk,
  selected,
  selectedFault,
  onSelect,
  onSelectFault,
}) => {
  const [expanded, setExpanded] = useState(false);
  const severity = severityConfig[risk.severity];
  const category = categoryConfig[risk.category];

  const handleFaultSelect = (fault: any) => {
    onSelectFault({
      riskPointId: risk.id,
      faultCode: fault.faultCode,
      faultName: fault.faultName,
      parameters: fault.parameters || {},
    });
  };

  return (
    <div className={`${styles.card} ${selected ? styles.selected : ''}`}>
      <div className={styles.header}>
        <Checkbox
          checked={selected}
          onChange={(checked: boolean) => onSelect(checked)}
          className={styles.checkbox}
        />
        <div className={styles.titleSection}>
          <div className={styles.titleRow}>
            <h4 className={styles.title}>{risk.name}</h4>
            <div className={styles.tags}>
              <Tag color={severity.color} size="small">{severity.label}</Tag>
              <Tag size="small">{category.label}</Tag>
            </div>
          </div>
          <p className={styles.description}>{risk.description}</p>
          <div className={styles.meta}>
            <span className={styles.metaItem}>目标: {risk.targetService}</span>
            <span className={styles.metaItem}>影响: {risk.affectedServices.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className={styles.expandToggle} onClick={() => setExpanded(!expanded)}>
        {expanded ? '收起详情' : '展开详情'}
      </div>

      {expanded && (
        <div className={styles.expandedContent}>
          <div className={styles.analysisSection}>
            <div className={styles.analysisItem}>
              <h5>影响范围</h5>
              <p>{risk.analysis.impactScope}: {risk.analysis.impactDescription}</p>
            </div>
            <div className={styles.analysisItem}>
              <h5>根因分析</h5>
              <p>{risk.analysis.rootCause}</p>
            </div>
            <div className={styles.analysisItem}>
              <h5>改进建议</h5>
              <ul>
                {risk.analysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.faultSection}>
            <h5>推荐故障类型</h5>
            <div className={styles.faultList}>
              {risk.recommendedFaults.map((fault) => (
                <Balloon
                  key={fault.faultCode}
                  trigger={
                    <div
                      className={`${styles.faultItem} ${
                        selectedFault?.faultCode === fault.faultCode ? styles.faultSelected : ''
                      }`}
                      onClick={() => handleFaultSelect(fault)}
                    >
                      <div className={styles.faultName}>{fault.faultName}</div>
                    </div>
                  }
                  closable={false}
                >
                  {fault.description}
                </Balloon>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPointCard;

