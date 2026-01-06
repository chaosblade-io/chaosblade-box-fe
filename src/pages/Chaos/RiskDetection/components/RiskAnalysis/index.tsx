import React, { FC, useEffect, useState } from 'react';
import { Button, Tab, Tag, Loading, Message, Dialog, Input, Icon } from '@alicloud/console-components';
import { useHistory } from 'dva';
import Translation from 'components/Translation';
import { riskDetectionService } from '../../services/riskDetectionService';
import { RiskPoint, RiskSeverity, RiskCategory, RiskSummary } from '../../types';
import { GenerateExperimentRequest, SelectedFault } from '../../types/experimentTypes';
import RiskPointCard from '../RiskPointCard';
import GenerateExperimentModal from '../GenerateExperimentModal';
import styles from './index.css';

// 严重程度配置
const severityConfig: Record<RiskSeverity, { color: string; label: string; order: number }> = {
  CRITICAL: { color: 'red', label: '严重', order: 1 },
  HIGH: { color: 'orange', label: '高', order: 2 },
  MEDIUM: { color: 'yellow', label: '中', order: 3 },
  LOW: { color: 'green', label: '低', order: 4 },
};

// 类别配置
const categoryConfig: Record<RiskCategory, { label: string; description: string }> = {
  SINGLE_POINT_FAILURE: { label: '单点故障', description: '服务缺乏冗余，存在单点故障风险' },
  DEPENDENCY_RISK: { label: '依赖风险', description: '服务依赖关系存在潜在问题' },
  RESOURCE_RISK: { label: '资源风险', description: '资源配置或使用存在风险' },
  NETWORK_RISK: { label: '网络风险', description: '网络配置或通信存在风险' },
  DATA_RISK: { label: '数据风险', description: '数据存储或处理存在风险' },
  CAPACITY_RISK: { label: '容量风险', description: '系统容量或扩展性存在风险' },
};

const RiskAnalysis: FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState<RiskPoint[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [selectedFaults, setSelectedFaults] = useState<SelectedFault[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // 加载风险数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await riskDetectionService.analyzeRisks();
        setRisks(response.risks);
        setSummary(response.summary);
      } catch (error) {
        Message.error('加载风险数据失败');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 过滤风险点
  const filteredRisks = risks.filter(risk => {
    const matchSearch = !searchText || 
      risk.name.toLowerCase().includes(searchText.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchText.toLowerCase());
    
    if (activeTab === 'all') return matchSearch;
    return matchSearch && risk.category === activeTab;
  });

  // 按严重程度排序
  const sortedRisks = [...filteredRisks].sort((a, b) => 
    severityConfig[a.severity].order - severityConfig[b.severity].order
  );

  // 选择风险点
  const handleSelectRisk = (riskId: string, checked: boolean) => {
    if (checked) {
      setSelectedRisks([...selectedRisks, riskId]);
    } else {
      setSelectedRisks(selectedRisks.filter(id => id !== riskId));
      setSelectedFaults(selectedFaults.filter(f => f.riskPointId !== riskId));
    }
  };

  // 选择故障类型
  const handleSelectFault = (riskId: string, fault: SelectedFault) => {
    const existing = selectedFaults.findIndex(f => f.riskPointId === riskId);
    if (existing >= 0) {
      const newFaults = [...selectedFaults];
      newFaults[existing] = fault;
      setSelectedFaults(newFaults);
    } else {
      setSelectedFaults([...selectedFaults, fault]);
    }
  };

  // 生成演练场景
  const handleGenerateExperiment = () => {
    if (selectedRisks.length === 0) {
      Message.warning('请至少选择一个风险点');
      return;
    }
    if (selectedFaults.length === 0) {
      Message.warning('请为选中的风险点选择故障类型');
      return;
    }
    setShowGenerateModal(true);
  };

  // 确认生成
  const handleConfirmGenerate = async (config: any) => {
    try {
      const selectedRiskPoints = risks.filter(r => selectedRisks.includes(r.id));
      const request: GenerateExperimentRequest = {
        riskPoints: selectedRiskPoints,
        selectedFaults,
        experimentConfig: config,
      };

      const experiment = await riskDetectionService.generateExperiment(request);
      Message.success('演练场景生成成功');
      setShowGenerateModal(false);

      // 跳转到演练详情或列表
      Dialog.alert({
        title: '演练场景已生成',
        content: (
          <div>
            <p>演练名称：{experiment.baseInfo.name}</p>
            <p>包含 {experiment.flow.flowGroups.length} 个故障注入步骤</p>
            <p>关联 {experiment.riskContext.riskPointIds.length} 个风险点</p>
          </div>
        ),
        onOk: () => history.push('/chaos/risk-detection/drill-results'),
      });
    } catch (error) {
      Message.error('生成演练场景失败');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading tip="正在分析风险..." />
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
          <h2><Translation>风险分析结果</Translation></h2>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.selectedCount}>
            已选择 {selectedRisks.length} 个风险点
          </span>
          <Button
            type="primary"
            onClick={handleGenerateExperiment}
            disabled={selectedRisks.length === 0}
          >
            生成演练场景
          </Button>
        </div>
      </div>

      {/* 风险汇总 */}
      {summary && (
        <div className={styles.summarySection}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>总风险数</span>
            <span className={styles.summaryValue}>{summary.totalRisks}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>严重</span>
            <span className={styles.summaryValue} style={{ color: '#cf1322' }}>{summary.bySeverity.CRITICAL}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>高</span>
            <span className={styles.summaryValue} style={{ color: '#d46b08' }}>{summary.bySeverity.HIGH}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>中</span>
            <span className={styles.summaryValue} style={{ color: '#d4b106' }}>{summary.bySeverity.MEDIUM}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>低</span>
            <span className={styles.summaryValue} style={{ color: '#389e0d' }}>{summary.bySeverity.LOW}</span>
          </div>
        </div>
      )}

      {/* 搜索和过滤 */}
      <div className={styles.filterSection}>
        <Input
          placeholder="搜索风险点..."
          innerBefore={<Icon type="search" style={{ margin: 4 }} />}
          value={searchText}
          onChange={(val: string) => setSearchText(val)}
          style={{ width: 300 }}
          hasClear
        />
      </div>

      {/* 风险列表 */}
      <div className={styles.mainContent}>
        <Tab activeKey={activeTab} onChange={(key: string) => setActiveTab(key)}>
          <Tab.Item title={`全部 (${risks.length})`} key="all" />
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = risks.filter(r => r.category === key).length;
            return count > 0 ? (
              <Tab.Item title={`${config.label} (${count})`} key={key} />
            ) : null;
          })}
        </Tab>

        <div className={styles.riskList}>
          {sortedRisks.length === 0 ? (
            <div className={styles.emptyState}>暂无风险点</div>
          ) : (
            sortedRisks.map(risk => (
              <RiskPointCard
                key={risk.id}
                risk={risk}
                selected={selectedRisks.includes(risk.id)}
                selectedFault={selectedFaults.find(f => f.riskPointId === risk.id)}
                onSelect={(checked) => handleSelectRisk(risk.id, checked)}
                onSelectFault={(fault) => handleSelectFault(risk.id, fault)}
              />
            ))
          )}
        </div>
      </div>

      {/* 生成演练场景弹窗 */}
      <GenerateExperimentModal
        visible={showGenerateModal}
        risks={risks.filter(r => selectedRisks.includes(r.id))}
        faults={selectedFaults}
        onCancel={() => setShowGenerateModal(false)}
        onConfirm={handleConfirmGenerate}
      />
    </div>
  );
};

export default RiskAnalysis;

