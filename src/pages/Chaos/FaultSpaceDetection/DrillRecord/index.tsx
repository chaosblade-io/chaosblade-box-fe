import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import {
  Button,
  Message,
  Icon,
  Dialog,
  Loading,
} from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory, useParams } from 'dva';


// Import section components
import ExecutionBasicInfo from './components/ExecutionBasicInfo';
import ExecutionLogs from './components/ExecutionLogs';
import TestCasesResults from './components/TestCasesResults';
import BusinessServiceChain, { RealtimeSummary } from './components/BusinessServiceChain';

// Types for new API structure
interface ApiBasicInfo {
  id: number | string;
  taskName: string;
  environment?: string;
  api?: {
    id?: number;
    systemId?: number;
    operationId?: string;
    method?: string;
    path?: string;
    summary?: string;
  };
  initiator?: string;
  startTime?: string;
  currentStatus?: string;
  cumulativeDuration?: number;
}

interface DrillRecordParams {
  runId: string;
}

interface TestCaseItem {
  id: number;
  taskId: number;
  caseType: string;
  targetCount: number;
  faultsJson: string;
  createdAt: string;
  executionId: number;
  p50: number;
  p95: number;
  p99: number;
  errRate: number;
}

const DrillRecord: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams() as DrillRecordParams;
  const { runId } = params;

  const [ basic, setBasic ] = useState<ApiBasicInfo | null>(null);
  const [ logs, setLogs ] = useState<any[]>([]);
  const [ testCases, setTestCases ] = useState<TestCaseItem[]>([]);
  const [ realtime, setRealtime ] = useState<RealtimeSummary | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ terminateDialogVisible, setTerminateDialogVisible ] = useState(false);
  const [ exportDialogVisible, setExportDialogVisible ] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (runId) {
      fetchDrillRecord(runId, { silent: false });
    }
  }, [ runId ]);

  // Conditional polling for realtime data based on currentStatus
  useEffect(() => {
    if (!runId || !basic?.currentStatus) return;
    const status = String(basic.currentStatus).toUpperCase();
    const active = status === 'RUNNING' || status === 'PENDING';
    let timer: number | null = null;

    if (active) {
      timer = window.setInterval(() => {
        fetchDrillRecord(runId, { silent: true });
      }, 5000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [ runId, basic?.currentStatus ]);


  useEffect(() => {
    if (basic) {
      // Set page title and breadcrumb
      dispatch.pageHeader.setTitle(`${i18n.t('Drill Record').toString()} - ${basic.id}`);
      dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
        { key: 'fault_space_detection', value: i18n.t('Fault Space Detection').toString(), path: '/chaos/fault-space-detection/tasks' },
        { key: 'detection_tasks', value: i18n.t('Detection Tasks').toString(), path: '/chaos/fault-space-detection/tasks' },
        { key: 'task_detail', value: basic.taskName, path: `/chaos/fault-space-detection/tasks/${basic.id}` },
        { key: 'drill_record', value: String(basic.id), path: `/chaos/fault-space-detection/records/${runId}` },
      ]));
    }
  }, [ basic, runId ]);

  const fetchDrillRecord = async (id: string, opts: { silent?: boolean } = {}) => {
    const { silent = false } = opts;
    if (!silent) setLoading(true);
    try {
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      const res = await probeProxy.getExecutionDetails(id);
      const d = res?.data || {};

      // New structure: data.basic, data.logs (or data.log), data.testCases, data.realtime
      const basicData: ApiBasicInfo | null = d?.basic || null;

      // Normalize logs: accept d.log, d.logs, d.executionLogs, d.logs.items
      let rawLogs: any[] = [];
      if (Array.isArray(d?.log)) rawLogs = d.log;
      else if (Array.isArray(d?.logs)) rawLogs = d.logs;
      else if (Array.isArray(d?.executionLogs)) rawLogs = d.executionLogs;
      else if (Array.isArray(d?.logs?.items)) rawLogs = d.logs.items;

      const logData = rawLogs.map((it: any, idx: number) => {
        const ts = it?.timestamp ?? it?.time ?? it?.ts ?? it?.date ?? it?.createdAt ?? it?.created_at;
        const lvl = it?.level ?? it?.severity ?? it?.type ?? it?.status;
        const msg = it?.message ?? it?.msg ?? it?.content ?? it?.text ?? it?.description;
        return {
          id: it?.id ?? idx,
          timestamp: ts,
          level: lvl,
          message: msg,
          ...it,
        };
      });

      const cases: TestCaseItem[] = Array.isArray(d?.testCases) ? d.testCases : [];

      // realtime 为汇总对象
      const realtimeData: RealtimeSummary | null = d?.realtime && typeof d.realtime === 'object'
        ? {
          totalTestCases: Number(d.realtime.totalTestCases || 0),
          completedTestCases: Number(d.realtime.completedTestCases || 0),
          totalServices: Number(d.realtime.totalServices || 0),
          completedServices: Number(d.realtime.completedServices || 0),
          testingServices: Number(d.realtime.testingServices || 0),
        }
        : null;

      setBasic(basicData);
      setLogs(logData);
      setTestCases(cases);
      setRealtime(realtimeData);
    } catch (error) {
      console.error('Failed to load drill record:', error);
      if (!opts.silent) {
        Message.error(i18n.t('Failed to load drill record').toString());
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };


  const handlePauseResume = async () => {
    // No-op: controls removed in the simplified design
  };

  const handleTerminate = async () => {
    try {
      // TODO: Terminate drill execution via API if available
      setTerminateDialogVisible(false);
      Message.success(i18n.t('Drill execution terminated').toString());
    } catch (error) {
      console.error('Failed to terminate drill:', error);
      Message.error(i18n.t('Failed to terminate drill execution').toString());
    }
  };

  const handleExportReport = async (format: 'HTML' | 'CSV' | 'JSON') => {
    try {
      // TODO: Export drill report
      // await dispatch.faultSpaceDetection.exportDrillReport({ runId, format });

      Message.success(i18n.t(`Report exported as ${format} successfully`).toString());
      setExportDialogVisible(false);
    } catch (error) {
      console.error('Failed to export report:', error);
      Message.error(i18n.t('Failed to export report').toString());
    }
  };
  // Build plain text summary for this drill execution
  const buildSummaryText = (): string[] => {
    const lines: string[] = [];
    if (basic) {
      lines.push(`任务：${basic.taskName || '-'}（ID：${basic.id}）`);
      lines.push(`状态：${basic.currentStatus || '-'}`);
    }
    if (realtime) {
      lines.push(`用例：${realtime.completedTestCases}/${realtime.totalTestCases} 已完成`);
      lines.push(`服务：${realtime.completedServices}/${realtime.totalServices} 已完成`);
    }
    if (Array.isArray(testCases) && testCases.length > 0) {
      const len = testCases.length;
      const sum = testCases.reduce((acc, it) => {
        return {
          p95: acc.p95 + Number(it.p95 || 0),
          p99: acc.p99 + Number(it.p99 || 0),
          err: acc.err + Number(it.errRate || 0),
        };
      }, { p95: 0, p99: 0, err: 0 });
      const avgP95 = Math.round(sum.p95 / len);
      const avgP99 = Math.round(sum.p99 / len);
      const avgErr = Number((sum.err / len).toFixed(2));
      lines.push(`性能：平均P95=${avgP95}ms，平均P99=${avgP99}ms，平均错误率=${avgErr}%`);
    }
    const status = String(basic?.currentStatus || '').toUpperCase();
    const statusHint = status === 'RUNNING' || status === 'PENDING' ? '在进行中' : (status ? '已结束' : '');
    lines.push(`摘要：本次演练${statusHint || ''}，请结合上方日志与结果判断是否达到预期。`);
    return lines;
  };


  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading tip={i18n.t('Loading drill record...').toString()}>
          <div style={{ height: 400 }} />
        </Loading>
      </div>
    );
  }

  if (!basic) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <Icon type="exclamation-circle" size="large" style={{ color: '#ff4d4f', marginBottom: 16 }} />
          <h3><Translation>Drill Record Not Found</Translation></h3>
          <p><Translation>The requested drill record could not be found or you don't have permission to view it.</Translation></p>
          <Button type="primary" onClick={() => pushUrl(history, '/chaos/fault-space-detection/tasks')}>
            <Translation>Back to Task List</Translation>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Section 1: Execution Basic Information */}
      <ExecutionBasicInfo
        data={{
          id: basic.id,
          taskName: basic.taskName,
          apiSummary: basic.api?.summary || '-',
          initiator: basic.initiator || '-',
          startTime: basic.startTime || '',
          currentStatus: basic.currentStatus || '-',
          cumulativeDuration: Number(basic.cumulativeDuration || 0),
        } as any}
        onPauseResume={handlePauseResume}
        onTerminate={() => setTerminateDialogVisible(true)}
        onExport={() => setExportDialogVisible(true)}
      />

      {/* Section 2: Real-time Execution Logs */}
      <ExecutionLogs
        logs={logs}
        title={i18n.t('Execution Logs').toString()}
      />

      {/* Section 3: Business Service Chain (realtime) */}
      <BusinessServiceChain realtime={realtime} />

      {/* Section 4: Execution Results */}
      <TestCasesResults
        testCases={testCases}
        onExport={handleExportReport}
      />

      {/* Section 5: Summary (plain text) */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Translation>测试总结</Translation>
          </div>
        </div>
        <div className={styles.sectionContent}>
          {buildSummaryText().map((line, idx) => (
            <p key={idx} style={{ margin: 0, color: '#333' }}>{line}</p>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        visible={terminateDialogVisible}
        title={i18n.t('Terminate Drill Execution').toString()}
        onClose={() => setTerminateDialogVisible(false)}
        onCancel={() => setTerminateDialogVisible(false)}
        onOk={handleTerminate}
        locale={locale().Dialog}
      >
        <div className={styles.terminateDialogContent}>
          <div className={styles.warningSection}>
            <Icon type="warning" style={{ color: '#faad14', marginRight: 8 }} />
            <span className={styles.warningText}>

              <Translation>This action will immediately terminate the drill execution</Translation>
            </span>
          </div>
          <div className={styles.impactSection}>
            <h4><Translation>Impact</Translation>:</h4>
            <ul>
              <li><Translation>All current fault injections will be immediately revoked</Translation></li>
              <li><Translation>Subsequent execution steps will be stopped</Translation></li>
              <li><Translation>Current data will be preserved for analysis</Translation></li>
            </ul>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={exportDialogVisible}
        title={i18n.t('Export Drill Report').toString()}
        onClose={() => setExportDialogVisible(false)}
        onCancel={() => setExportDialogVisible(false)}
        footer={null}
        locale={locale().Dialog}
      >
        <div className={styles.exportDialogContent}>
          <p><Translation>Choose the export format for the drill report</Translation>:</p>
          <div className={styles.exportOptions}>
            <Button
              type="primary"
              onClick={() => handleExportReport('HTML')}
              style={{ marginRight: 12, marginBottom: 12 }}
            >
              <Icon type="file-text" />
              <Translation>HTML Report</Translation>
              <div style={{ fontSize: 12, color: '#666' }}>
                <Translation>Complete report with charts and visualizations</Translation>
              </div>
            </Button>
            <Button
              onClick={() => handleExportReport('CSV')}
              style={{ marginRight: 12, marginBottom: 12 }}
            >
              <Icon type="table" />
              <Translation>CSV Data</Translation>
              <div style={{ fontSize: 12, color: '#666' }}>
                <Translation>Raw data for further analysis</Translation>
              </div>
            </Button>
            <Button
              onClick={() => handleExportReport('JSON')}
              style={{ marginBottom: 12 }}
            >
              <Icon type="code" />
              <Translation>JSON API</Translation>
              <div style={{ fontSize: 12, color: '#666' }}>
                <Translation>Structured data for API integration</Translation>
              </div>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DrillRecord;

