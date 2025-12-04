import React, { FC, useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Icon, Message, Loading } from '@alicloud/console-components';
import { RiskDrillResult } from '../../types/experimentTypes';
import { riskDetectionService } from '../../services/riskDetectionService';
import DrillResultAnalysis from '../DrillResultAnalysis';
import styles from './index.css';

// 状态配置
const statusConfig = {
  SUCCESS: { color: 'green', label: '成功' },
  FAILED: { color: 'red', label: '失败' },
  RUNNING: { color: 'blue', label: '运行中' },
  STOPPED: { color: 'orange', label: '已停止' },
};

// 验证状态配置
const validationStatusConfig = {
  PASSED: { color: 'green', label: '通过' },
  FAILED: { color: 'red', label: '失败' },
  PARTIAL: { color: 'orange', label: '部分通过' },
  UNKNOWN: { color: 'gray', label: '未知' },
};

// 影响级别配置
const impactLevelConfig = {
  CRITICAL: { color: 'red', label: '严重' },
  HIGH: { color: 'orange', label: '高' },
  MEDIUM: { color: 'yellow', label: '中' },
  LOW: { color: 'green', label: '低' },
  NONE: { color: 'gray', label: '无影响' },
};

const DrillResultList: FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RiskDrillResult[]>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>('');
  const [analysisVisible, setAnalysisVisible] = useState(false);

  // 加载演练结果列表
  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await riskDetectionService.getDrillResults();
      setResults(data);
    } catch (error) {
      Message.error('加载演练结果失败');
    } finally {
      setLoading(false);
    }
  };

  // 查看详情
  const handleViewDetail = (experimentId: string) => {
    setSelectedExperimentId(experimentId);
    setAnalysisVisible(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '演练名称',
      dataIndex: 'experimentName',
      width: 200,
    },
    {
      title: '执行时间',
      dataIndex: 'executionTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      cell: (value: keyof typeof statusConfig) => {
        const config = statusConfig[value];
        return <Tag color={config.color} size="small">{config.label}</Tag>;
      },
    },
    {
      title: '验证结果',
      dataIndex: 'validation',
      width: 120,
      cell: (validation: any) => {
        const config = validationStatusConfig[validation.overallStatus];
        return <Tag color={config.color} size="small">{config.label}</Tag>;
      },
    },
    {
      title: '影响级别',
      dataIndex: 'impact',
      width: 100,
      cell: (impact: any) => {
        const config = impactLevelConfig[impact.overallImpact];
        return <Tag color={config.color} size="small">{config.label}</Tag>;
      },
    },
    {
      title: '风险点',
      dataIndex: 'riskPointNames',
      width: 200,
      cell: (names: string[]) => (
        <div className={styles.riskTags}>
          {names.slice(0, 2).map((name, index) => (
            <Tag key={index} size="small" type="primary">{name}</Tag>
          ))}
          {names.length > 2 && (
            <Tag size="small" type="normal">+{names.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      width: 100,
      cell: (value: number) => `${value}s`,
    },
    {
      title: '操作',
      width: 120,
      cell: (_: any, __: number, record: RiskDrillResult) => (
        <Button
          type="primary"
          text
          size="small"
          onClick={() => handleViewDetail(record.experimentId)}
        >
          <Icon type="eye" style={{ marginRight: 4 }} />
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card
        title="演练结果列表"
        extra={
          <Button size="small" onClick={loadResults} disabled={loading}>
            <Icon type="refresh" style={{ marginRight: 4 }} />
            刷新
          </Button>
        }
        contentHeight="auto"
      >
        <Table
          dataSource={results}
          columns={columns}
          loading={loading}
          primaryKey="experimentId"
          emptyContent={
            <div className={styles.empty}>
              <Icon type="inbox" size="xl" style={{ color: '#D1D5DB' }} />
              <div className={styles.emptyText}>暂无演练结果</div>
            </div>
          }
        />
      </Card>

      {/* 演练结果分析对话框 */}
      <DrillResultAnalysis
        visible={analysisVisible}
        experimentId={selectedExperimentId}
        onClose={() => setAnalysisVisible(false)}
      />
    </div>
  );
};

export default DrillResultList;
