import React, { FC, useState, useMemo } from 'react';
import { Drawer, Button, Icon, Tag, Checkbox, Message, Loading, Collapse, Badge } from '@alicloud/console-components';
import { RiskPoint, RiskCategory, RiskSeverity } from '../../types';
import styles from './index.css';

const { Panel } = Collapse;

interface RiskAnalysisDrawerProps {
  visible: boolean;
  loading: boolean;
  risks: RiskPoint[];
  onClose: () => void;
  onGenerateExperiment: (selectedRisks: RiskPoint[], selectedFaults: Map<string, string[]>) => void;
}

// 风险类别配置
const riskCategoryConfig: Record<RiskCategory, { label: string; icon: string; color: string }> = {
  SINGLE_POINT_FAILURE: { label: '单点故障', icon: 'warning', color: '#EF4444' },
  DEPENDENCY_RISK: { label: '依赖风险', icon: 'link', color: '#F59E0B' },
  RESOURCE_RISK: { label: '资源风险', icon: 'atm', color: '#F97316' },
  NETWORK_RISK: { label: '网络风险', icon: 'share', color: '#8B5CF6' },
  DATA_RISK: { label: '数据风险', icon: 'database', color: '#06B6D4' },
  CAPACITY_RISK: { label: '容量风险', icon: 'chart-bar', color: '#10B981' },
};

// 风险等级配置
const severityConfig: Record<RiskSeverity, { label: string; color: string; bg: string }> = {
  CRITICAL: { label: '严重', color: '#EF4444', bg: '#FEF2F2' },
  HIGH: { label: '高', color: '#F97316', bg: '#FFF7ED' },
  MEDIUM: { label: '中', color: '#F59E0B', bg: '#FFFBEB' },
  LOW: { label: '低', color: '#10B981', bg: '#F0FDF4' },
};

const RiskAnalysisDrawer: FC<RiskAnalysisDrawerProps> = ({
  visible,
  loading,
  risks,
  onClose,
  onGenerateExperiment,
}) => {
  // 选中的风险点
  const [selectedRiskIds, setSelectedRiskIds] = useState<Set<string>>(new Set());
  // 每个风险点选中的故障类型
  const [selectedFaults, setSelectedFaults] = useState<Map<string, Set<string>>>(new Map());

  // 按类别分组风险点
  const risksByCategory = useMemo(() => {
    const groups: Record<RiskCategory, RiskPoint[]> = {
      SINGLE_POINT_FAILURE: [],
      DEPENDENCY_RISK: [],
      RESOURCE_RISK: [],
      NETWORK_RISK: [],
      DATA_RISK: [],
      CAPACITY_RISK: [],
    };

    risks.forEach(risk => {
      if (groups[risk.category]) {
        groups[risk.category].push(risk);
      }
    });

    return groups;
  }, [risks]);

  // 统计信息
  const statistics = useMemo(() => {
    const bySeverity: Record<RiskSeverity, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    risks.forEach(risk => {
      bySeverity[risk.severity]++;
    });

    return {
      total: risks.length,
      bySeverity,
      selected: selectedRiskIds.size,
    };
  }, [risks, selectedRiskIds]);

  // 切换风险点选中状态
  const toggleRiskSelection = (riskId: string) => {
    const newSelected = new Set(selectedRiskIds);
    if (newSelected.has(riskId)) {
      newSelected.delete(riskId);
      // 同时清除该风险点的故障选择
      const newFaults = new Map(selectedFaults);
      newFaults.delete(riskId);
      setSelectedFaults(newFaults);
    } else {
      newSelected.add(riskId);
    }
    setSelectedRiskIds(newSelected);
  };

  // 切换故障类型选中状态
  const toggleFaultSelection = (riskId: string, faultCode: string) => {
    const newFaults = new Map(selectedFaults);
    const riskFaults = newFaults.get(riskId) || new Set();
    
    if (riskFaults.has(faultCode)) {
      riskFaults.delete(faultCode);
    } else {
      riskFaults.add(faultCode);
    }
    
    newFaults.set(riskId, riskFaults);
    setSelectedFaults(newFaults);
  };

  // 生成演练场景
  const handleGenerateExperiment = () => {
    if (selectedRiskIds.size === 0) {
      Message.warning('请至少选择一个风险点');
      return;
    }

    // 检查每个选中的风险点是否至少选择了一个故障类型
    const selectedRisks = risks.filter(r => selectedRiskIds.has(r.id));
    const faultsMap = new Map<string, string[]>();
    
    for (const risk of selectedRisks) {
      const riskFaults = selectedFaults.get(risk.id);
      if (!riskFaults || riskFaults.size === 0) {
        Message.warning(`请为风险点"${risk.name}"选择至少一个故障类型`);
        return;
      }
      faultsMap.set(risk.id, Array.from(riskFaults));
    }

    onGenerateExperiment(selectedRisks, faultsMap);
  };

  // 渲染风险点卡片
  const renderRiskCard = (risk: RiskPoint) => {
    const isSelected = selectedRiskIds.has(risk.id);
    const severity = severityConfig[risk.severity];
    const riskFaults = selectedFaults.get(risk.id) || new Set();

    return (
      <div key={risk.id} className={`${styles.riskCard} ${isSelected ? styles.selected : ''}`}>
        {/* 卡片头部 */}
        <div className={styles.riskCardHeader}>
          <Checkbox
            checked={isSelected}
            onChange={() => toggleRiskSelection(risk.id)}
          />
          <div className={styles.riskCardTitle}>
            <span className={styles.riskName}>{risk.name}</span>
            <Tag
              size="small"
              style={{
                background: severity.bg,
                color: severity.color,
                border: 'none',
                marginLeft: 8,
              }}
            >
              {severity.label}
            </Tag>
          </div>
        </div>

        {/* 风险描述 */}
        <div className={styles.riskDescription}>{risk.description}</div>

        {/* 风险详情 */}
        <div className={styles.riskDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>发现时间:</span>
            <span className={styles.detailValue}>{new Date(risk.detectedAt).toLocaleString()}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>目标服务:</span>
            <span className={styles.detailValue}>{risk.targetService}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>影响范围:</span>
            <span className={styles.detailValue}>{risk.affectedServices.join(', ')}</span>
          </div>
        </div>

        {/* 推荐故障类型 */}
        {isSelected && (
          <div className={styles.faultSection}>
            <div className={styles.faultSectionTitle}>
              推荐故障类型
            </div>
            <div className={styles.faultList}>
              {risk.recommendedFaults.map(fault => (
                <div
                  key={fault.faultCode}
                  className={`${styles.faultItem} ${riskFaults.has(fault.faultCode) ? styles.faultSelected : ''}`}
                  onClick={() => toggleFaultSelection(risk.id, fault.faultCode)}
                >
                  <Checkbox
                    checked={riskFaults.has(fault.faultCode)}
                    onChange={() => toggleFaultSelection(risk.id, fault.faultCode)}
                  />
                  <div className={styles.faultInfo}>
                    <div className={styles.faultName}>
                      {fault.faultName}
                      <Tag size="small" style={{ marginLeft: 6, fontSize: 10 }}>
                        优先级 {fault.priority}
                      </Tag>
                    </div>
                    <div className={styles.faultDescription}>{fault.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 风险分析 */}
        {isSelected && (
          <Collapse className={styles.analysisCollapse}>
            <Panel title="风险分析详情">
              <div className={styles.analysisContent}>
                <div className={styles.analysisItem}>
                  <div className={styles.analysisLabel}>影响范围</div>
                  <div className={styles.analysisValue}>{risk.analysis.impactScope}</div>
                </div>
                <div className={styles.analysisItem}>
                  <div className={styles.analysisLabel}>影响描述</div>
                  <div className={styles.analysisValue}>{risk.analysis.impactDescription}</div>
                </div>
                <div className={styles.analysisItem}>
                  <div className={styles.analysisLabel}>根本原因</div>
                  <div className={styles.analysisValue}>{risk.analysis.rootCause}</div>
                </div>
                <div className={styles.analysisItem}>
                  <div className={styles.analysisLabel}>修复建议</div>
                  <ul className={styles.recommendationList}>
                    {risk.analysis.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Panel>
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <Drawer
      title="风险分析结果"
      visible={visible}
      onClose={onClose}
      width={720}
      className={styles.drawer}
    >
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading tip="正在分析风险..." />
        </div>
      ) : (
        <>
          {/* 统计信息 */}
          <div className={styles.statistics}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{statistics.total}</div>
              <div className={styles.statLabel}>总风险数</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: severityConfig.CRITICAL.color }}>
                {statistics.bySeverity.CRITICAL}
              </div>
              <div className={styles.statLabel}>严重</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: severityConfig.HIGH.color }}>
                {statistics.bySeverity.HIGH}
              </div>
              <div className={styles.statLabel}>高</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: severityConfig.MEDIUM.color }}>
                {statistics.bySeverity.MEDIUM}
              </div>
              <div className={styles.statLabel}>中</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#3B82F6' }}>
                {statistics.selected}
              </div>
              <div className={styles.statLabel}>已选择</div>
            </div>
          </div>

          {/* 风险列表 */}
          <div className={styles.riskList}>
            {Object.entries(risksByCategory).map(([category, categoryRisks]) => {
              if (categoryRisks.length === 0) return null;

              const config = riskCategoryConfig[category as RiskCategory];

              return (
                <div key={category} className={styles.categorySection}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryTitle}>{config.label}</span>
                    <Badge count={categoryRisks.length} style={{ marginLeft: 8 }} />
                  </div>
                  <div className={styles.categoryContent}>
                    {categoryRisks.map(risk => renderRiskCard(risk))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 底部操作栏 */}
          <div className={styles.footer}>
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              onClick={handleGenerateExperiment}
              disabled={selectedRiskIds.size === 0}
            >
              生成演练场景 ({selectedRiskIds.size})
            </Button>
          </div>
        </>
      )}
    </Drawer>
  );
};

export default RiskAnalysisDrawer;

