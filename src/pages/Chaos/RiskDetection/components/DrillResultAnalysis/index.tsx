import React, { FC, useState, useEffect } from 'react';
import { Dialog, Loading, Tab, Tag, Timeline, Icon, Card, Grid, Message } from '@alicloud/console-components';
import { RiskDrillResult, RiskValidationResult, ImpactAnalysis } from '../../types/experimentTypes';
import { riskDetectionService } from '../../services/riskDetectionService';
import styles from './index.css';

const { Row, Col } = Grid;

interface DrillResultAnalysisProps {
  visible: boolean;
  experimentId: string;
  onClose: () => void;
}

// 验证状态配置
const validationStatusConfig = {
  PASSED: { color: 'green', label: '通过', icon: 'success' },
  FAILED: { color: 'red', label: '失败', icon: 'error' },
  PARTIAL: { color: 'orange', label: '部分通过', icon: 'warning' },
  UNKNOWN: { color: 'gray', label: '未知', icon: 'help' },
};

// 影响级别配置
const impactLevelConfig = {
  CRITICAL: { color: 'red', label: '严重', icon: 'exclamation-circle' },
  HIGH: { color: 'orange', label: '高', icon: 'warning' },
  MEDIUM: { color: 'yellow', label: '中', icon: 'minus-circle' },
  LOW: { color: 'green', label: '低', icon: 'check-circle' },
  NONE: { color: 'gray', label: '无影响', icon: 'check-circle' },
};

const DrillResultAnalysis: FC<DrillResultAnalysisProps> = ({
  visible,
  experimentId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskDrillResult | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // 加载演练结果
  useEffect(() => {
    if (visible && experimentId) {
      loadResult();
    }
  }, [visible, experimentId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const data = await riskDetectionService.getDrillResultDetail(experimentId);
      if (data) {
        setResult(data);
      } else {
        Message.error('未找到演练结果');
      }
    } catch (error) {
      Message.error('加载演练结果失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染概览标签页
  const renderOverview = () => {
    if (!result) return null;

    const { validation, impact } = result;
    const statusInfo = validationStatusConfig[validation.overallStatus];
    const impactInfo = impactLevelConfig[impact.overallImpact];

    return (
      <div className={styles.overview}>
        {/* 总体状态 */}
        <Row gutter={16} className={styles.statsRow}>
          <Col span={12}>
            <Card className={styles.statCard} contentHeight="auto">
              <div className={styles.statHeader}>
                <Icon type={statusInfo.icon} className={styles.statIcon} style={{ color: statusInfo.color }} />
                <span className={styles.statLabel}>验证状态</span>
              </div>
              <div className={styles.statValue}>
                <Tag color={statusInfo.color} size="large">{statusInfo.label}</Tag>
              </div>
              <div className={styles.statDetail}>
                通过 {validation.passedCount}/{validation.totalCount} 项检查
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className={styles.statCard} contentHeight="auto">
              <div className={styles.statHeader}>
                <Icon type={impactInfo.icon} className={styles.statIcon} style={{ color: impactInfo.color }} />
                <span className={styles.statLabel}>影响级别</span>
              </div>
              <div className={styles.statValue}>
                <Tag color={impactInfo.color} size="large">{impactInfo.label}</Tag>
              </div>
              <div className={styles.statDetail}>
                {impact.affectedServices.length} 个服务受影响
              </div>
            </Card>
          </Col>
        </Row>

        {/* 关键指标 */}
        <Card title="关键指标" className={styles.metricsCard}>
          <Row gutter={16}>
            <Col span={6}>
              <div className={styles.metricItem}>
                <div className={styles.metricLabel}>演练时长</div>
                <div className={styles.metricValue}>{result.duration}s</div>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.metricItem}>
                <div className={styles.metricLabel}>恢复时间</div>
                <div className={styles.metricValue}>{impact.recoveryTime || 'N/A'}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.metricItem}>
                <div className={styles.metricLabel}>错误率</div>
                <div className={styles.metricValue}>{impact.errorRate || '0%'}</div>
              </div>
            </Col>
            <Col span={6}>
              <div className={styles.metricItem}>
                <div className={styles.metricLabel}>响应时间</div>
                <div className={styles.metricValue}>{impact.responseTimeIncrease || '0%'}</div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 执行摘要 */}
        <Card title="执行摘要" className={styles.summaryCard}>
          <p className={styles.summaryText}>{result.summary}</p>
        </Card>
      </div>
    );
  };

  // 渲染验证结果标签页
  const renderValidation = () => {
    if (!result) return null;

    return (
      <div className={styles.validation}>
        <div className={styles.validationHeader}>
          <span>共 {result.validation.totalCount} 项验证，通过 {result.validation.passedCount} 项</span>
        </div>
        <div className={styles.validationList}>
          {result.validation.results.map((item, index) => {
            const statusInfo = validationStatusConfig[item.status];
            return (
              <Card key={index} className={styles.validationItem}>
                <div className={styles.validationItemHeader}>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                  <span className={styles.validationName}>{item.checkName}</span>
                </div>
                <div className={styles.validationDescription}>{item.description}</div>
                {item.actualValue && (
                  <div className={styles.validationDetail}>
                    <span className={styles.detailLabel}>实际值：</span>
                    <span className={styles.detailValue}>{item.actualValue}</span>
                  </div>
                )}
                {item.expectedValue && (
                  <div className={styles.validationDetail}>
                    <span className={styles.detailLabel}>期望值：</span>
                    <span className={styles.detailValue}>{item.expectedValue}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染影响分析标签页
  const renderImpact = () => {
    if (!result) return null;

    const { impact } = result;

    return (
      <div className={styles.impact}>
        {/* 受影响服务 */}
        <Card title="受影响服务" className={styles.impactCard}>
          <div className={styles.serviceList}>
            {impact.affectedServices.map((service, index) => (
              <Tag key={index} type="primary" size="medium" style={{ margin: '4px' }}>
                {service}
              </Tag>
            ))}
          </div>
        </Card>

        {/* 性能指标变化 */}
        {impact.metrics && impact.metrics.length > 0 && (
          <Card title="性能指标变化" className={styles.metricsChangeCard}>
            <div className={styles.metricsList}>
              {impact.metrics.map((metric, index) => (
                <div key={index} className={styles.metricChangeItem}>
                  <div className={styles.metricName}>{metric.name}</div>
                  <div className={styles.metricChange}>
                    <span className={styles.metricBefore}>{metric.before}</span>
                    <Icon type="arrow-right" style={{ margin: '0 8px' }} />
                    <span className={styles.metricAfter}>{metric.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 影响描述 */}
        <Card title="影响描述" className={styles.descriptionCard}>
          <p className={styles.impactDescription}>{impact.description}</p>
        </Card>
      </div>
    );
  };

  // 渲染建议标签页
  const renderRecommendations = () => {
    if (!result) return null;

    return (
      <div className={styles.recommendations}>
        <Timeline className={styles.timeline}>
          {result.recommendations.map((rec, index) => (
            <Timeline.Item
              key={index}
              title={rec.title}
              state={rec.priority === 'HIGH' ? 'error' : rec.priority === 'MEDIUM' ? 'process' : 'success'}
            >
              <div className={styles.recommendationContent}>
                <div className={styles.recommendationDescription}>{rec.description}</div>
                {rec.actionItems && rec.actionItems.length > 0 && (
                  <div className={styles.actionItems}>
                    <div className={styles.actionItemsTitle}>行动项：</div>
                    <ul className={styles.actionItemsList}>
                      {rec.actionItems.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };

  return (
    <Dialog
      title="演练结果分析"
      visible={visible}
      onClose={onClose}
      onCancel={onClose}
      footer={false}
      style={{ width: 900 }}
      className={styles.dialog}
    >
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading tip="加载演练结果中..." />
        </div>
      ) : (
        <Tab activeKey={activeTab} onChange={setActiveTab}>
          <Tab.Item key="overview" title="概览">
            {renderOverview()}
          </Tab.Item>
          <Tab.Item key="validation" title="验证结果">
            {renderValidation()}
          </Tab.Item>
          <Tab.Item key="impact" title="影响分析">
            {renderImpact()}
          </Tab.Item>
          <Tab.Item key="recommendations" title="改进建议">
            {renderRecommendations()}
          </Tab.Item>
        </Tab>
      )}
    </Dialog>
  );
};

export default DrillResultAnalysis;
