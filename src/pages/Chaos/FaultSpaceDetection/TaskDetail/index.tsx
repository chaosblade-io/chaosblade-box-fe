import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import {
  Tab,
  Button,
  Message,
  Icon,
  Loading,
  Dialog,
  Tag,
} from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory, useParams } from 'dva';
import formatDate from '../../lib/DateUtil';

// Import tab components
import ConfigurationTab from './components/ConfigurationTab';
import DrillRecordsTab from './components/DrillRecordsTab';
import ChangeHistoryTab from './components/ChangeHistoryTab';

// TypeScript interfaces
interface TaskDetailData {
  id: string;
  name: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  configuration: {
    targetSystem: {
      systemId: string;
      systemName: string;
      environment: string;
      apiSource: { syncTime: string; version: string };
      selectedAPI: { method: string; path: string; operationId: string; summary: string };
    };
    topologyNodes?: Array<{ id: number | string; name: string; layer: number; protocol?: string }>;
    topologyEdges?: Array<{ id?: number | string; fromNodeId: number | string; toNodeId: number | string }>;
    faultConfigs?: Array<{ nodeId: number | string; type?: string; faultscript?: any }>;
    apiParameters: {
      pathParams: Record<string, string>;
      queryParams: Record<string, string[]>;
      headers: { authType: 'TOKEN' | 'COOKIE' | 'PROFILE'; customHeaders: Record<string, string> };
      requestBody: string;
    };
    traceConfig: {
      baselineTrace: any;
      faultConfigurations: Array<{
        serviceId: string;
        serviceName: string;
        layer: number;
        faultTemplates: Array<{ type: string; enabled: boolean; parameters: Record<string, any> }>;
      }>;
    };
    sloConfig: {
      functionalAssertions: {
        statusCodes: number[];
        jsonPathAssertions: Array<{ id: string; path: string; operator: 'exists' | 'equals' | 'contains' | 'regex' | 'not_exists'; expectedValue: any; description: string }>;
      };
      performanceTargets: { p95Limit: number; p99Limit: number; errorRateLimit: number; throughputThreshold?: number };
    };
    executionConfig: { concurrency: number };
  };
  currentExecution?: {
    runId: string;
    status: 'RUNNING' | 'PAUSED' | 'TERMINATING';
    progress: number;
    startTime: string;
    estimatedEndTime: string;
    currentStep: string;
  };
}

interface TaskDetailParams {
  taskId: string;
}

const TaskDetail: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams() as TaskDetailParams;
  const { taskId } = params;

  const [ taskData, setTaskData ] = useState<TaskDetailData | null>(null);
  const [ loading, setLoading ] = useState(true);
  const [ activeTab, setActiveTab ] = useState('configuration');
  const [ executeDialogVisible, setExecuteDialogVisible ] = useState(false);
  const [ copyDialogVisible, setCopyDialogVisible ] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTaskDetail(taskId);
    }
  }, [ taskId ]);

  useEffect(() => {
    if (taskData) {
      // Set page title and breadcrumb
      dispatch.pageHeader.setTitle(taskData.name);
      dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
        { key: 'fault_space_detection', value: i18n.t('Fault Space Detection').toString(), path: '/chaos/fault-space-detection/tasks' },
        { key: 'detection_tasks', value: i18n.t('Detection Tasks').toString(), path: '/chaos/fault-space-detection/tasks' },
        { key: 'task_detail', value: taskData.name, path: `/chaos/fault-space-detection/tasks/${taskId}` },
      ]));
    }
  }, [ taskData, taskId ]);

  const loadTaskDetail = async (id: string) => {
    setLoading(true);
    try {
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      const res = await probeProxy.getDetectionTaskDetails(Number(id));
      const d = res?.data || {};

      const details: TaskDetailData = {
        id: String(d?.task?.id || d?.id || id),
        name: d?.task?.name || d?.name || '-',
        creator: d?.task?.createdBy || d?.createdBy || '-',
        createdAt: d?.task?.createdAt || d?.createdAt || '-',
        updatedAt: d?.task?.updatedAt || d?.updatedAt || '-',
        status: (d?.task?.status || d?.status || 'ACTIVE') as any,
        configuration: {
          targetSystem: {
            systemId: String(d?.task?.systemId || d?.systemId || ''),
            systemName: d?.sys?.name || '',
            environment: d?.sys?.defaultEnvironment || '',
            apiSource: {
              syncTime: d?.topology?.generatedAt || '',
              version: d?.topology?.version || '',
            },
            selectedAPI: {
              method: d?.apiDefinition?.method || '',
              path: d?.apiDefinition?.urlTemplate || '',
              operationId: d?.apiDefinition?.operationId || '',
              summary: d?.apiDefinition?.name || '',
            },
          },
          // 为 ConfigurationTab 提供直接可用的拓扑与故障配置
          topologyNodes: d?.topologyNodes || [],
          topologyEdges: d?.topologyEdges || [],
          faultConfigs: d?.faultConfigs || [],
          apiParameters: {
            pathParams: (() => {
              try {
                if (typeof d?.apiDefinition?.pathParams === 'string') {
                  return JSON.parse(d.apiDefinition.pathParams || '{}');
                }
                return d?.apiDefinition?.pathParams || {};
              } catch { return {}; }
            })(),
            queryParams: (() => {
              try {
                const raw = typeof d?.apiDefinition?.queryParams === 'string'
                  ? JSON.parse(d.apiDefinition.queryParams || '{}')
                  : (d?.apiDefinition?.queryParams || {});
                const out: Record<string, string[]> = {};
                Object.entries(raw).forEach(([ key, val ]) => {
                  if (Array.isArray(val)) out[key] = val.map(v => String(v));
                  else if (val == null) out[key] = [];
                  else out[key] = [ String(val) ];
                });
                return out;
              } catch { return {}; }
            })(),
            headers: {
              authType: 'TOKEN',
              customHeaders: (() => { try { return d?.apiDefinition?.headers ? JSON.parse(d.apiDefinition.headers) : {}; } catch { return {}; } })(),
            },
            requestBody: (() => { try { return d?.apiDefinition?.bodyTemplate ? JSON.stringify(JSON.parse(d.apiDefinition.bodyTemplate), null, 2) : ''; } catch { return d?.apiDefinition?.bodyTemplate || ''; } })(),
          },
          traceConfig: {
            baselineTrace: {
              dagId: d?.topology?.id ? `TOPO_${d.topology.id}` : '',
              version: d?.topology?.version || '',
              sampleCount: d?.task?.requestNum || 0,
              baselineMetrics: {
                p95Latency: d?.baselineMetrics?.p95 || 0,
                p99Latency: d?.baselineMetrics?.p99 || 0,
                avgLatency: d?.baselineMetrics?.avg || 0,
                errorRate: d?.baselineMetrics?.errRate || 0,
              },
              nodes: d?.topologyNodes || [],
              edges: d?.topologyEdges || [],
            },
            faultConfigurations: (d?.faultConfigs || d?.task?.faultConfigurations || []).map((fc: any, idx: number) => ({
              serviceId: String(fc.nodeId || fc.serviceId || idx),
              serviceName: (d?.topologyNodes || []).find((n: any) => Number(n.id) === Number(fc.nodeId))?.name || '',
              layer: Number((d?.topologyNodes || []).find((n: any) => Number(n.id) === Number(fc.nodeId))?.layer ?? 0),
              faultTemplates: (() => {
                if (fc.faultscript) {
                  const action = fc.faultscript?.spec?.experiments?.[0]?.action || fc.faultscript?.spec?.experiments?.[0]?.target;
                  return [{ type: action || fc.type || '', enabled: true, parameters: {} }];
                }
                return [{ type: fc.type || '', enabled: true, parameters: {} }];
              })(),
            })),
          },
          sloConfig: {
            functionalAssertions: { statusCodes: [], jsonPathAssertions: [] },
            performanceTargets: {
              p95Limit: Number((d?.taskSlos || d?.task?.taskSlo || [])[0]?.p95 || 0),
              p99Limit: Number((d?.taskSlos || d?.task?.taskSlo || [])[0]?.p99 || 0),
              errorRateLimit: Number((d?.taskSlos || d?.task?.taskSlo || [])[0]?.errRate || 0),
              throughputThreshold: undefined,
            },
          },
          executionConfig: { concurrency: 0 },
        },
        currentExecution: d?.latestExecutionStatus ? {
          runId: String(d?.latestExecutionStatus?.runId || ''),
          status: (d?.latestExecutionStatus?.status || 'RUNNING') as any,
          progress: Number(d?.latestExecutionStatus?.progress || 0),
          startTime: d?.latestExecutionStatus?.startedAt || '',
          estimatedEndTime: d?.latestExecutionStatus?.estimatedEndTime || '',
          currentStep: d?.latestExecutionStatus?.currentStep || '',
        } : undefined,
      };

      setTaskData(details);
    } catch (error) {
      console.error('Failed to load task detail:', error);
      Message.error(i18n.t('Failed to load task detail').toString());
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfiguration = () => {
    // Navigate to configuration page with pre-populated data
    pushUrl(history, `/chaos/fault-space-detection/add?taskId=${taskId}`);
  };

  const handleCopyAsNewTask = () => {
    setCopyDialogVisible(true);
  };

  const handleExecuteImmediately = () => {
    setExecuteDialogVisible(true);
  };

  const confirmCopyTask = async () => {
    try {
      // TODO: Implement copy task logic
      // const newTaskId = await dispatch.faultSpaceDetection.copyTask({ taskId });

      Message.success(i18n.t('Task copied successfully').toString());
      setCopyDialogVisible(false);
      // Navigate to new task or stay on current page
    } catch (error) {
      console.error('Failed to copy task:', error);
      Message.error(i18n.t('Failed to copy task').toString());
    }
  };

  const confirmExecuteTask = async () => {
    try {
      // TODO: Implement execute task logic
      // const runId = await dispatch.faultSpaceDetection.executeTask({ taskId });

      Message.success(i18n.t('Task execution started successfully').toString());
      setExecuteDialogVisible(false);
      // Refresh task data to show running status
      loadTaskDetail(taskId);
    } catch (error) {
      console.error('Failed to execute task:', error);
      Message.error(i18n.t('Failed to execute task').toString());
    }
  };

  const handleViewDrill = () => {
    if (taskData?.currentExecution) {
      pushUrl(history, `/chaos/fault-space-detection/records/${taskData.currentExecution.runId}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading tip={i18n.t('Loading task details...').toString()}>
          <div style={{ height: 400 }} />
        </Loading>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <Icon type="exclamation-circle" size="large" style={{ color: '#ff4d4f', marginBottom: 16 }} />
          <h3><Translation>Task Not Found</Translation></h3>
          <p><Translation>The requested task could not be found or you don't have permission to view it.</Translation></p>
          <Button type="primary" onClick={() => pushUrl(history, '/chaos/fault-space-detection/tasks')}>
            <Translation>Back to Task List</Translation>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.taskInfo}>
            <div className={styles.taskMeta}>
              <span className={styles.metaItem}>
                <Icon type="user" size="xs" />
                <Translation>Created by</Translation> {taskData.creator}
              </span>
              <span className={styles.metaItem}>
                <Icon type="calendar" size="xs" />
                {formatDate(new Date(taskData.createdAt).getTime())}
              </span>
              <span className={styles.metaItem}>
                <Icon type="edit" size="xs" />
                <Translation>Updated</Translation> {formatDate(new Date(taskData.updatedAt).getTime())}
              </span>
              <Tag color={
                taskData.status === 'ACTIVE' ? '#52c41a' :
                  taskData.status === 'DRAFT' ? '#faad14' :
                    taskData.status === 'PAUSED' ? '#1890ff' : '#666'
              }>
                {taskData.status}
              </Tag>
            </div>
          </div>

          <div className={styles.headerActions}>
            <Button onClick={handleEditConfiguration}>
              <Icon type="edit" />
              <Translation>Edit Configuration</Translation>
            </Button>
            <Button onClick={handleCopyAsNewTask}>
              <Icon type="copy" />
              <Translation>Copy as New Task</Translation>
            </Button>
            <Button
              type="primary"
              onClick={handleExecuteImmediately}
              disabled={!!taskData.currentExecution}
            >
              <Icon type="play" />
              <Translation>Execute Immediately</Translation>
            </Button>
          </div>
        </div>
      </div>

      {/* Running Status Banner */}
      {taskData.currentExecution && (
        <div className={styles.runningBanner}>
          <div className={styles.bannerContent}>
            <div className={styles.statusInfo}>
              <Icon type="loading" className={styles.spinningIcon} />
              <div>
                <div className={styles.statusText}>
                  <Translation>Drill Execution in Progress</Translation>
                  <Tag color="#1890ff" style={{ marginLeft: 8 }}>
                    {taskData.currentExecution.status}
                  </Tag>
                </div>
                <div className={styles.progressInfo}>
                  <Translation>Progress</Translation>: {taskData.currentExecution.progress}% |
                  <Translation>Current Step</Translation>: {taskData.currentExecution.currentStep} |
                  <Translation>ETA</Translation>: {formatDate(new Date(taskData.currentExecution.estimatedEndTime).getTime())}
                </div>
              </div>
            </div>
            <Button type="primary" size="small" onClick={handleViewDrill}>
              <Translation>View Drill</Translation>
            </Button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className={styles.tabContainer}>
        <Tab
          activeKey={activeTab}
          onChange={key => setActiveTab(key as string)}
          size="medium"
          contentStyle={{ padding: 0 }}
        >
          <Tab.Item
            title={i18n.t('Configuration Information').toString()}
            key="configuration"
          >
            <ConfigurationTab data={taskData.configuration} />
          </Tab.Item>

          <Tab.Item
            title={i18n.t('Drill Records').toString()}
            key="drillRecords"
          >
            <DrillRecordsTab taskId={taskId} />
          </Tab.Item>

          <Tab.Item
            title={i18n.t('Change History').toString()}
            key="changeHistory"
          >
            <ChangeHistoryTab taskId={taskId} />
          </Tab.Item>
        </Tab>
      </div>

      {/* Dialogs */}
      <Dialog
        visible={executeDialogVisible}
        title={i18n.t('Execute Task Immediately').toString()}
        onClose={() => setExecuteDialogVisible(false)}
        onCancel={() => setExecuteDialogVisible(false)}
        onOk={confirmExecuteTask}
        locale={locale().Dialog}
      >
        <p><Translation>Are you sure you want to start the fault injection test immediately?</Translation></p>
        <p><Translation>This will execute the task with the current configuration.</Translation></p>
      </Dialog>

      <Dialog
        visible={copyDialogVisible}
        title={i18n.t('Copy as New Task').toString()}
        onClose={() => setCopyDialogVisible(false)}
        onCancel={() => setCopyDialogVisible(false)}
        onOk={confirmCopyTask}
        locale={locale().Dialog}
      >
        <p><Translation>This will create a new task with the same configuration.</Translation></p>
        <p><Translation>You can modify the configuration after copying.</Translation></p>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
