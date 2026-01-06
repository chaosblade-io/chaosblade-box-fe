import React, { FC, useState, useEffect } from 'react';
import { Dialog, Form, Input, NumberPicker, Switch, Tag, Message } from '@alicloud/console-components';
import Translation from 'components/Translation';
import { RiskPoint, RiskSeverity } from '../../types';
import { SelectedFault } from '../../types/experimentTypes';
import styles from './index.css';

const FormItem = Form.Item;

interface GenerateExperimentModalProps {
  visible: boolean;
  risks: RiskPoint[];
  faults: SelectedFault[];
  onCancel: () => void;
  onConfirm: (config: ExperimentConfig) => void;
}

interface ExperimentConfig {
  name: string;
  description: string;
  duration: number;
  autoRecover: boolean;
  tags: string[];
}

// 严重程度配置
const severityConfig: Record<RiskSeverity, { color: string; label: string }> = {
  CRITICAL: { color: 'red', label: '严重' },
  HIGH: { color: 'orange', label: '高' },
  MEDIUM: { color: 'yellow', label: '中' },
  LOW: { color: 'green', label: '低' },
};

const GenerateExperimentModal: FC<GenerateExperimentModalProps> = ({
  visible,
  risks,
  faults,
  onCancel,
  onConfirm,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 300,
    autoRecover: true,
  });

  // 自动生成演练名称和描述
  useEffect(() => {
    if (visible && risks.length > 0) {
      const riskNames = risks.map(r => r.name).join('、');
      const autoName = `风险验证演练 - ${risks[0].targetService}`;
      const autoDesc = `验证以下风险点：${riskNames}`;

      setFormData({
        name: autoName,
        description: autoDesc,
        duration: 300,
        autoRecover: true,
      });
    }
  }, [visible, risks]);

  const handleOk = () => {
    if (!formData.name) {
      Message.warning('请输入演练名称');
      return;
    }
    onConfirm({
      ...formData,
      tags: ['risk-detection', 'auto-generated'],
    });
  };

  // 获取最高严重级别
  const getHighestSeverity = (): RiskSeverity => {
    const severityOrder: RiskSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    for (const severity of severityOrder) {
      if (risks.some(r => r.severity === severity)) {
        return severity;
      }
    }
    return 'LOW';
  };

  const highestSeverity = getHighestSeverity();
  const severityInfo = severityConfig[highestSeverity];

  return (
    <Dialog
      title="生成演练场景"
      visible={visible}
      onClose={onCancel}
      onCancel={onCancel}
      onOk={handleOk}
      okProps={{ children: '生成演练' }}
      style={{ width: 560 }}
    >
      <div className={styles.notice}>
        系统将根据选中的风险点和故障类型自动配置演练参数
      </div>

      <div className={styles.summarySection}>
        <h4><Translation>演练概要</Translation></h4>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>风险点</span>
            <span className={styles.summaryValue}>{risks.length} 个</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>故障注入</span>
            <span className={styles.summaryValue}>{faults.length} 个</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>最高级别</span>
            <Tag color={severityInfo.color} size="small">{severityInfo.label}</Tag>
          </div>
        </div>

        <div className={styles.riskList}>
          {risks.map(risk => {
            const fault = faults.find(f => f.riskPointId === risk.id);
            return (
              <div key={risk.id} className={styles.riskItem}>
                <Tag color={severityConfig[risk.severity].color} size="small">
                  {severityConfig[risk.severity].label}
                </Tag>
                <span className={styles.riskName}>{risk.name}</span>
                {fault && (
                  <Tag size="small" color="blue">{fault.faultName}</Tag>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.divider} />

      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <FormItem label="演练名称" required>
          <Input
            value={formData.name}
            onChange={(val: string) => setFormData({ ...formData, name: val })}
            placeholder="输入演练名称"
          />
        </FormItem>

        <FormItem label="演练描述">
          <Input.TextArea
            value={formData.description}
            onChange={(val: string) => setFormData({ ...formData, description: val })}
            rows={2}
            placeholder="输入演练描述"
          />
        </FormItem>

        <FormItem label="持续时间(秒)">
          <NumberPicker
            value={formData.duration}
            onChange={(val: number) => setFormData({ ...formData, duration: val })}
            min={60}
            max={3600}
            style={{ width: '100%' }}
          />
        </FormItem>

        <FormItem label="自动恢复">
          <Switch
            checked={formData.autoRecover}
            onChange={(checked: boolean) => setFormData({ ...formData, autoRecover: checked })}
          />
        </FormItem>
      </Form>
    </Dialog>
  );
};

export default GenerateExperimentModal;

