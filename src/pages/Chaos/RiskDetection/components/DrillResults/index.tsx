import React, { FC, useEffect, useState } from 'react';
import { Button, Tag, Loading, Message, Tab, Icon } from '@alicloud/console-components';
import { useHistory } from 'dva';
import Translation from 'components/Translation';
import { riskDetectionService } from '../../services/riskDetectionService';
import { RiskDrillResult, RiskValidationResult } from '../../types/experimentTypes';
import styles from './index.css';

// 状态配置
const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: '', label: '待执行' },
  RUNNING: { color: 'blue', label: '执行中' },
  COMPLETED: { color: 'green', label: '已完成' },
  FAILED: { color: 'red', label: '失败' },
  STOPPED: { color: 'orange', label: '已停止' },
};

// 影响级别配置
const impactLevelConfig: Record<string, { color: string; label: string }> = {
  CRITICAL: { color: 'red', label: '严重' },
  HIGH: { color: 'orange', label: '高' },
  MEDIUM: { color: 'yellow', label: '中' },
  LOW: { color: 'green', label: '低' },
};

// 建议类别配置
const categoryConfig: Record<string, { label: string }> = {
  ARCHITECTURE: { label: '架构优化' },
  CODE: { label: '代码改进' },
  CONFIG: { label: '配置调整' },
  MONITORING: { label: '监控增强' },
  RUNBOOK: { label: '运维手册' },
};

const DrillResults: FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<RiskDrillResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<RiskDrillResult | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await riskDetectionService.getDrillResults();
        setResults(data);
        if (data.length > 0) {
          setSelectedResult(data[0]);
        }
      } catch (error) {
        Message.error('加载演练结果失败');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading tip="加载演练结果..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button onClick={() => history.push('/chaos/risk-detection')}>
            <Icon type="arrow-left" style={{ marginRight: 4 }} />
            返回拓扑
          </Button>
          <h2><Translation>演练结果分析</Translation></h2>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* 左侧演练列表 */}
        <div className={styles.resultList}>
          <h3>演练记录</h3>
          {results.length === 0 ? (
            <div className={styles.emptyState}>暂无演练记录</div>
          ) : (
            results.map(result => {
              const status = statusConfig[result.status];
              return (
                <div
                  key={result.experimentId}
                  className={`${styles.resultItem} ${selectedResult?.experimentId === result.experimentId ? styles.selected : ''}`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className={styles.resultItemHeader}>
                    <span className={styles.resultName}>{result.experimentName}</span>
                    <Tag color={status.color} size="small">{status.label}</Tag>
                  </div>
                  <div className={styles.resultItemMeta}>
                    <span>开始时间: {new Date(result.startTime).toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 右侧详情 */}
        <div className={styles.resultDetail}>
          {selectedResult ? (
            <ResultDetail result={selectedResult} />
          ) : (
            <div className={styles.emptyState}>请选择一个演练记录查看详情</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 结果详情组件
const ResultDetail: FC<{ result: RiskDrillResult }> = ({ result }) => {
  const [activeTab, setActiveTab] = useState('validation');
  const status = statusConfig[result.status];
  const duration = result.endTime ? Math.round((result.endTime - result.startTime) / 1000) : 0;
  const verifiedCount = result.riskValidationResults.filter(r => r.verified).length;
  const recommendationCount = result.riskValidationResults.reduce((acc, r) => acc + r.recommendations.length, 0);

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <h3>{result.experimentName}</h3>
        <Tag color={status.color} size="small">{status.label}</Tag>
      </div>

      {/* 执行概要 */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>执行时长</span>
          <span className={styles.summaryValue}>{duration}秒</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>验证风险点</span>
          <span className={styles.summaryValue}>{result.riskValidationResults.length}个</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>风险确认</span>
          <span className={styles.summaryValue} style={{ color: '#cf1322' }}>{verifiedCount}个</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>改进建议</span>
          <span className={styles.summaryValue} style={{ color: '#1890ff' }}>{recommendationCount}条</span>
        </div>
      </div>

      <Tab activeKey={activeTab} onChange={(key: string) => setActiveTab(key)}>
        <Tab.Item title="风险验证结果" key="validation">
          <RiskValidationSection results={result.riskValidationResults} />
        </Tab.Item>
        <Tab.Item title="改进建议" key="recommendations">
          <RecommendationsSection results={result.riskValidationResults} />
        </Tab.Item>
      </Tab>
    </div>
  );
};

// 风险验证结果区域
const RiskValidationSection: FC<{ results: RiskValidationResult[] }> = ({ results }) => {
  return (
    <div className={styles.validationSection}>
      {results.map((validation, index) => {
        const impactLevel = impactLevelConfig[validation.impactAnalysis.impactLevel];

        return (
          <div key={index} className={styles.validationCard}>
            <div className={styles.validationHeader}>
              <div className={styles.validationTitle}>
                <span>{validation.riskName}</span>
              </div>
              <Tag color={validation.verified ? 'red' : 'green'} size="small">
                {validation.verified ? '风险已确认' : '风险未触发'}
              </Tag>
            </div>

            <div className={styles.divider} />

            <div className={styles.impactSection}>
              <h4>影响分析</h4>
              <div className={styles.impactGrid}>
                <div className={styles.impactItem}>
                  <span className={styles.impactLabel}>影响级别</span>
                  <Tag color={impactLevel.color} size="small">{impactLevel.label}</Tag>
                </div>
                <div className={styles.impactItem}>
                  <span className={styles.impactLabel}>受影响服务</span>
                  <span>{validation.impactAnalysis.affectedServices.join(', ')}</span>
                </div>
              </div>

              <div className={styles.impactDescription}>
                <div className={styles.impactDescItem}>
                  <strong>用户影响：</strong>
                  <span>{validation.impactAnalysis.userImpact}</span>
                </div>
                <div className={styles.impactDescItem}>
                  <strong>业务影响：</strong>
                  <span>{validation.impactAnalysis.businessImpact}</span>
                </div>
              </div>

              {/* 指标降级 */}
              <div className={styles.metricsSection}>
                <h5>指标变化</h5>
                <div className={styles.metricsGrid}>
                  {validation.impactAnalysis.degradedMetrics.map((metric, idx) => (
                    <div key={idx} className={styles.metricItem}>
                      <span className={styles.metricName}>{metric.metricName}</span>
                      <div className={styles.metricValues}>
                        <span className={styles.baseline}>{metric.baselineValue}</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.fault}>{metric.faultValue}</span>
                        <Tag color={metric.degradationPercent > 50 ? 'red' : 'orange'} size="small">
                          {metric.degradationPercent > 0 ? '+' : ''}{metric.degradationPercent}%
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 改进建议区域
const RecommendationsSection: FC<{ results: RiskValidationResult[] }> = ({ results }) => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const allRecommendations = results.flatMap(r =>
    r.recommendations.map(rec => ({ ...rec, riskName: r.riskName }))
  ).sort((a, b) => a.priority - b.priority);

  const toggleExpand = (index: number) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter(i => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  return (
    <div className={styles.recommendationsSection}>
      {allRecommendations.map((rec, index) => {
        const category = categoryConfig[rec.category];
        const isExpanded = expandedItems.includes(index);
        return (
          <div key={index} className={styles.recommendationCard}>
            <div className={styles.recHeader}>
              <div className={styles.recTitle}>
                <Tag size="small">{category.label}</Tag>
                <span>{rec.title}</span>
              </div>
              <Tag size="small">P{rec.priority}</Tag>
            </div>
            <p className={styles.recDescription}>{rec.description}</p>

            <div className={styles.expandToggle} onClick={() => toggleExpand(index)}>
              {isExpanded ? '收起步骤' : '查看实施步骤'}
            </div>

            {isExpanded && (
              <ol className={styles.stepsList}>
                {rec.implementationSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            )}

            <div className={styles.recMeta}>
              <span>预估时间: {rec.estimatedTime}</span>
              <span>预期收益: {rec.expectedBenefit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DrillResults;

