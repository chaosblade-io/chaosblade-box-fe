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
  Balloon
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
      apiSource: {
        syncTime: string;
        version: string;
      };
      selectedAPI: {
        method: string;
        path: string;
        operationId: string;
        summary: string;
      };
    };
    apiParameters: {
      pathParams: Record<string, string>;
      queryParams: Record<string, string[]>;
      headers: {
        authType: 'TOKEN' | 'COOKIE' | 'PROFILE';
        customHeaders: Record<string, string>;
      };
      requestBody: string;
    };
    traceConfig: {
      dagId: string;
      version: string;
      sampleCount: number;
      baselineMetrics: {
        p95Latency: number;
        p99Latency: number;
        avgLatency: number;
        errorRate: number;
      };
      faultConfigurations: Array<{
        serviceId: string;
        serviceName: string;
        layer: number;
        protocol: string;
        faultTemplates: Array<{
          type: string;
          name: string;
          enabled: boolean;
          parameters: Record<string, any>;
        }>;
      }>;
    };
    sloConfig: {
      functionalAssertions: {
        statusCodes: number[];
        jsonPathAssertions: Array<{
          id: string;
          path: string;
          operator: string;
          expectedValue: any;
          description: string;
        }>;
      };
      performanceTargets: {
        p95Limit: number;
        p99Limit: number;
        errorRateLimit: number;
        throughputThreshold?: number;
      };
    };
    executionConfig: {
      totalRequests: number;
      concurrency: number;
      requestTimeout: number;
      retryConfig: {
        count: number;
        interval: number;
      };
      warmupCooldown: {
        warmupSeconds: number;
        cooldownSeconds: number;
      };
      virtualizationStrategy: {
        replayStrategy: 'EXACT' | 'TEMPLATE' | 'APPROXIMATE';
        missStrategy: 'FALLBACK' | 'REJECT';
      };
    };
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
  const { taskId } = useParams<TaskDetailParams>();
  
  const [taskData, setTaskData] = useState<TaskDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  const [executeDialogVisible, setExecuteDialogVisible] = useState(false);
  const [copyDialogVisible, setCopyDialogVisible] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTaskDetail(taskId);
    }
  }, [taskId]);

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
  }, [taskData, taskId]);

  const loadTaskDetail = async (id: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const result = await dispatch.faultSpaceDetection.getTaskDetail({ taskId: id });
      
      // Mock data for development
      const mockTaskData: TaskDetailData = {
        id: id,
        name: '用户登录API故障空间探测',
        creator: 'admin',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'ACTIVE',
        configuration: {
          targetSystem: {
            systemId: 'user-service',
            systemName: '用户中心',
            environment: '生产环境',
            apiSource: {
              syncTime: new Date(Date.now() - 7200000).toISOString(),
              version: 'v1.2.3',
            },
            selectedAPI: {
              method: 'POST',
              path: '/api/v1/auth/login',
              operationId: 'loginUser',
              summary: '用户登录',
            },
          },
          apiParameters: {
            pathParams: {},
            queryParams: {
              'client_id': ['web-app'],
              'scope': ['read', 'write'],
            },
            headers: {
              authType: 'TOKEN',
              customHeaders: {
                'X-Client-Version': '1.0.0',
                'X-Request-ID': '{{$randomUUID}}',
              },
            },
            requestBody: JSON.stringify({
              username: 'test@example.com',
              password: 'password123',
              rememberMe: true,
            }, null, 2),
          },
          traceConfig: {
            dagId: 'DAG_20241225_001',
            version: '1.0.0',
            sampleCount: 1000,
            baselineMetrics: {
              p95Latency: 156,
              p99Latency: 234,
              avgLatency: 89,
              errorRate: 0.2,
            },
            faultConfigurations: [
              {
                serviceId: 'user-service',
                serviceName: 'User Service',
                layer: 1,
                protocol: 'HTTP',
                faultTemplates: [
                  {
                    type: 'network_delay',
                    name: '网络延迟',
                    enabled: true,
                    parameters: {
                      delay: 200,
                      variance: 10,
                    },
                  },
                  {
                    type: 'cpu_stress',
                    name: 'CPU压力',
                    enabled: true,
                    parameters: {
                      cpuPercent: 80,
                      duration: 60,
                    },
                  },
                ],
              },
              {
                serviceId: 'auth-db',
                serviceName: 'Auth Database',
                layer: 2,
                protocol: 'DB',
                faultTemplates: [
                  {
                    type: 'network_delay',
                    name: '网络延迟',
                    enabled: true,
                    parameters: {
                      delay: 50,
                      variance: 5,
                    },
                  },
                ],
              },
            ],
          },
          sloConfig: {
            functionalAssertions: {
              statusCodes: [200, 201],
              jsonPathAssertions: [
                {
                  id: 'assertion_1',
                  path: '$.success',
                  operator: 'equals',
                  expectedValue: true,
                  description: '响应成功标识',
                },
                {
                  id: 'assertion_2',
                  path: '$.data.token',
                  operator: 'exists',
                  expectedValue: null,
                  description: '返回访问令牌',
                },
              ],
            },
            performanceTargets: {
              p95Limit: 200,
              p99Limit: 500,
              errorRateLimit: 1.0,
              throughputThreshold: 50,
            },
          },
          executionConfig: {
            totalRequests: 100,
            concurrency: 10,
            requestTimeout: 30000,
            retryConfig: {
              count: 3,
              interval: 1000,
            },
            warmupCooldown: {
              warmupSeconds: 10,
              cooldownSeconds: 10,
            },
            virtualizationStrategy: {
              replayStrategy: 'TEMPLATE',
              missStrategy: 'FALLBACK',
            },
          },
        },
        currentExecution: Math.random() > 0.5 ? {
          runId: 'RUN_20241225_001',
          status: 'RUNNING',
          progress: 65,
          startTime: new Date(Date.now() - 300000).toISOString(),
          estimatedEndTime: new Date(Date.now() + 180000).toISOString(),
          currentStep: '执行故障注入 - User Service',
        } : undefined,
      };
      
      setTaskData(mockTaskData);
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
          onChange={setActiveTab}
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
