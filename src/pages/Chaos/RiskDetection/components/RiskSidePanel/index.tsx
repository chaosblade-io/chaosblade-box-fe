import React, { FC } from 'react';
import { Button, Tag, Icon } from '@alicloud/console-components';
import Translation from 'components/Translation';
import { RiskTopologyNode, RiskPoint, RiskSeverity, RiskCategory, K8sResourceType } from '../../types';
import styles from './index.css';

interface RiskSidePanelProps {
  node: RiskTopologyNode;
  onClose: () => void;
  onViewAnalysis: () => void;
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

// 状态配置
const statusConfig: Record<string, { color: string; label: string }> = {
  healthy: { color: 'green', label: '健康' },
  warning: { color: 'orange', label: '警告' },
  error: { color: 'red', label: '异常' },
  unknown: { color: '', label: '未知' },
};

// K8s 资源类型中文名
const resourceTypeLabels: Record<K8sResourceType, string> = {
  NAMESPACE: '命名空间',
  DEPLOYMENT: '部署',
  REPLICASET: '副本集',
  POD: 'Pod',
  SERVICE: '服务',
  CONFIGMAP: '配置映射',
  SECRET: '密钥',
  PVC: '持久卷声明',
  INGRESS: '入口',
  STATEFULSET: '有状态副本集',
  DAEMONSET: '守护进程集',
};

const RiskSidePanel: FC<RiskSidePanelProps> = ({ node, onClose, onViewAnalysis }) => {
  const statusInfo = statusConfig[node.status] || statusConfig.unknown;
  const typeLabel = resourceTypeLabels[node.type] || node.type;

  // 渲染元数据
  const renderMetadata = () => {
    const meta = node.metadata;
    if (!meta) return null;

    const items: { label: string; value: string }[] = [];

    if (meta.replicas !== undefined) {
      items.push({ label: '副本数', value: `${meta.readyReplicas || 0}/${meta.replicas}` });
    }
    if (meta.podIP) {
      items.push({ label: 'Pod IP', value: meta.podIP });
    }
    if (meta.hostIP) {
      items.push({ label: 'Host IP', value: meta.hostIP });
    }
    if (meta.phase) {
      items.push({ label: '阶段', value: meta.phase });
    }
    if (meta.clusterIP) {
      items.push({ label: 'Cluster IP', value: meta.clusterIP });
    }
    if (meta.ports && meta.ports.length > 0) {
      items.push({ label: '端口', value: meta.ports.map(p => `${p.port}:${p.targetPort}`).join(', ') });
    }
    if (meta.storageClass) {
      items.push({ label: '存储类', value: meta.storageClass });
    }
    if (meta.capacity) {
      items.push({ label: '容量', value: meta.capacity });
    }

    if (items.length === 0) return null;

    return (
      <>
        <div className={styles.divider} />
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Translation>资源详情</Translation></div>
          <div className={styles.infoGrid}>
            {items.map((item, index) => (
              <div key={index} className={styles.infoItem}>
                <span className={styles.infoLabel}>{item.label}</span>
                <span className={styles.infoValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3>{node.name}</h3>
          <Tag color={statusInfo.color} size="small">{statusInfo.label}</Tag>
        </div>
        <Button text onClick={onClose}><Icon type="close" /></Button>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}><Translation>基本信息</Translation></div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>资源类型</span>
              <span className={styles.infoValue}>{typeLabel}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>命名空间</span>
              <span className={styles.infoValue}>{node.namespace || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>风险数量</span>
              <span className={styles.infoValue}>
                {node.riskCount > 0 ? (
                  <Tag color="red" size="small">{node.riskCount} 个</Tag>
                ) : (
                  <Tag color="green" size="small">无</Tag>
                )}
              </span>
            </div>
          </div>
        </div>

        {renderMetadata()}

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}><Translation>关联风险点</Translation></span>
            {node.risks.length > 0 && (
              <Button text type="primary" onClick={onViewAnalysis}>
                查看全部
              </Button>
            )}
          </div>

          {node.risks.length === 0 ? (
            <div className={styles.emptyState}>暂无关联风险点</div>
          ) : (
            <div className={styles.riskList}>
              {node.risks.slice(0, 3).map((risk) => (
                <RiskCard key={risk.id} risk={risk} />
              ))}
              {node.risks.length > 3 && (
                <div className={styles.moreRisks}>
                  还有 {node.risks.length - 3} 个风险点...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <Button type="primary" onClick={onViewAnalysis} style={{ width: '100%' }}>
          <Translation>查看风险分析</Translation>
        </Button>
      </div>
    </div>
  );
};

// 风险卡片子组件
const RiskCard: FC<{ risk: RiskPoint }> = ({ risk }) => {
  const severity = severityConfig[risk.severity];
  const category = categoryConfig[risk.category];

  return (
    <div className={styles.riskCard}>
      <div className={styles.riskCardHeader}>
        <span className={styles.riskName}>{risk.name}</span>
        <Tag color={severity.color} size="small">{severity.label}</Tag>
      </div>
      <div className={styles.riskDescription}>{risk.description}</div>
      <div className={styles.riskMeta}>
        <Tag size="small">{category.label}</Tag>
        <span className={styles.faultCount}>
          {risk.recommendedFaults.length} 个推荐故障
        </span>
      </div>
    </div>
  );
};

export default RiskSidePanel;

