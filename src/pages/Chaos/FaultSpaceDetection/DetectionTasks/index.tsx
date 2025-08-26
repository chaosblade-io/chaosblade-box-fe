import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import {
  Button,
  Table,
  Pagination,
  Search,
  Select,
  Message,
  Collapse,
  DatePicker,
  Tag,
  Dialog,
  Checkbox,
  Icon,
  MenuButton,
  Badge,
} from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';
import formatDate from '../../lib/DateUtil';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// TypeScript interfaces for the new data structure
interface DetectionTask {
  id: string;
  name: string;
  applicationSystem: string;
  environment: string;
  apiMethod: string;
  apiPath: string;
  dagId: string;
  sampleCount: number;

  sloTarget: {
    p95: number;
    p99: number;
    errorRate: number;
  };
  executionResult: {
    status: 'SUCCESS' | 'FAILED' | 'TERMINATED' | 'RUNNING';
    duration: number;
  };
  lastExecutionTime: string;
  lastExecutor: string;
  createdAt: string;
  creator: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PENDING';
  tags: string[];
}

const DetectionTasks: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Search and filter states
  const [ searchKey, setSearchKey ] = useState('');
  const [ advancedFiltersVisible, setAdvancedFiltersVisible ] = useState(false);
  const [ applicationSystemFilter, setApplicationSystemFilter ] = useState('');
  const [ statusFilter, setStatusFilter ] = useState<string[]>([]);
  const [ tagsFilter, setTagsFilter ] = useState<string[]>([]);
  const [ creationDateRange, setCreationDateRange ] = useState<[Date, Date] | null>(null);
  const [ executionDateRange, setExecutionDateRange ] = useState<[Date, Date] | null>(null);

  // Table states
  const [ page, setPage ] = useState(1);
  const [ pageSize ] = useState(20);
  const [ loading, setLoading ] = useState(false);
  const [ tasks, setTasks ] = useState<DetectionTask[]>([]);
  const [ total, setTotal ] = useState(0);

  // Selection and batch operations
  const [ selectedRowKeys, setSelectedRowKeys ] = useState<string[]>([]);
  const [ batchActionVisible, setBatchActionVisible ] = useState(false);

  // Dialog states
  const [ executeDialogVisible, setExecuteDialogVisible ] = useState(false);
  const [ deleteDialogVisible, setDeleteDialogVisible ] = useState(false);
  const [ currentTask, setCurrentTask ] = useState<DetectionTask | null>(null);

  useEffect(() => {
    // 设置页面标题和面包屑
    dispatch.pageHeader.setTitle(i18n.t('Detection Tasks').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
      { key: 'fault_space_detection', value: i18n.t('Fault Space Detection').toString(), path: '/chaos/fault-space-detection/tasks' },
      { key: 'detection_tasks', value: i18n.t('Detection Tasks').toString(), path: '/chaos/fault-space-detection/tasks' },
    ]));

    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [ searchKey, statusFilter, applicationSystemFilter, tagsFilter, creationDateRange, executionDateRange, page ]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // TODO: 实际的API调用
      // const result = await dispatch.faultSpaceDetection.getDetectionTasks({
      //   searchKey,
      //   statusFilter,
      //   applicationSystemFilter,
      //   tagsFilter,
      //   creationDateRange,
      //   executionDateRange,
      //   page,
      //   pageSize,
      // });

      // Enhanced mock data matching the new structure
      const mockTasks: DetectionTask[] = [
        {
          id: '1',
          name: '用户登录API故障空间探测',
          applicationSystem: '用户中心',
          environment: '生产环境',
          apiMethod: 'POST',
          apiPath: '/api/v1/auth/login',
          dagId: 'DAG_20241225_001',
          sampleCount: 1000,

          sloTarget: {
            p95: 200,
            p99: 500,
            errorRate: 0.1,
          },
          executionResult: {
            status: 'SUCCESS',
            duration: 1800,
          },
          lastExecutionTime: new Date(Date.now() - 3600000).toISOString(),
          lastExecutor: 'admin',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          creator: 'admin',
          status: 'COMPLETED',
          tags: [ '高优先级', '核心API' ],
        },
        {
          id: '2',
          name: '订单查询故障空间探测',
          applicationSystem: '订单系统',
          environment: '测试环境',
          apiMethod: 'GET',
          apiPath: '/api/v1/orders/{orderId}',
          dagId: 'DAG_20241225_002',
          sampleCount: 500,

          sloTarget: {
            p95: 150,
            p99: 300,
            errorRate: 0.05,
          },
          executionResult: {
            status: 'RUNNING',
            duration: 0,
          },
          lastExecutionTime: new Date().toISOString(),
          lastExecutor: 'user1',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          creator: 'user1',
          status: 'RUNNING',
          tags: [ '订单', '查询' ],
        },
        {
          id: '3',
          name: '支付功能故障空间探测',
          applicationSystem: '支付系统',
          environment: '生产环境',
          apiMethod: 'POST',
          apiPath: '/api/v1/payment/process',
          dagId: 'DAG_20241225_003',
          sampleCount: 2000,

          sloTarget: {
            p95: 100,
            p99: 200,
            errorRate: 0.01,
          },
          executionResult: {
            status: 'FAILED',
            duration: 900,
          },
          lastExecutionTime: new Date(Date.now() - 7200000).toISOString(),
          lastExecutor: 'admin',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          creator: 'admin',
          status: 'FAILED',
          tags: [ '支付', '高优先级', '核心API' ],
        },
      ];
      setTasks(mockTasks);
      setTotal(mockTasks.length);
    } catch (error) {
      console.error('Failed to fetch detection tasks:', error);
      Message.error(i18n.t('Failed to load data').toString());
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleSearch = (value: string) => {
    setSearchKey(value);
    setPage(1);
  };

  const handleStatusChange = (value: string[]) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleApplicationSystemChange = (value: string) => {
    setApplicationSystemFilter(value);
    setPage(1);
  };

  const handleTagsChange = (value: string[]) => {
    setTagsFilter(value);
    setPage(1);
  };

  const handleCreationDateRangeChange = (value: [Date, Date] | null) => {
    setCreationDateRange(value);
    setPage(1);
  };

  const handleExecutionDateRangeChange = (value: [Date, Date] | null) => {
    setExecutionDateRange(value);
    setPage(1);
  };

  const handlePageChange = (current: number) => {
    setPage(current);
  };

  const handleAddDetection = () => {
    pushUrl(history, '/chaos/fault-space-detection/add');
  };

  const handleViewTask = (taskId: string) => {
    pushUrl(history, `/chaos/fault-space-detection/tasks/${taskId}`);
  };

  const handleExecuteTask = (task: DetectionTask) => {
    setCurrentTask(task);
    setExecuteDialogVisible(true);
  };

  const handleCopyTask = (task: DetectionTask) => {
    // TODO: 实现复制任务逻辑
    console.log('Copy task:', task.id);
    Message.success(i18n.t('Task copied successfully').toString());
  };

  const handleDeleteTask = (task: DetectionTask) => {
    setCurrentTask(task);
    setDeleteDialogVisible(true);
  };

  const confirmExecuteTask = async () => {
    if (!currentTask) return;

    try {
      // TODO: 实际的API调用
      // await dispatch.faultSpaceDetection.executeTask({ taskId: currentTask.id });

      Message.success(i18n.t('Task execution started successfully').toString());
      setExecuteDialogVisible(false);
      setCurrentTask(null);
      fetchTasks(); // 刷新列表
    } catch (error) {
      console.error('Failed to execute task:', error);
      Message.error(i18n.t('Failed to execute task').toString());
    }
  };

  const confirmDeleteTask = async () => {
    if (!currentTask) return;

    try {
      // TODO: 实际的API调用
      // await dispatch.faultSpaceDetection.deleteTask({ taskId: currentTask.id });

      Message.success(i18n.t('Task deleted successfully').toString());
      setDeleteDialogVisible(false);
      setCurrentTask(null);
      fetchTasks(); // 刷新列表
    } catch (error) {
      console.error('Failed to delete task:', error);
      Message.error(i18n.t('Failed to delete task').toString());
    }
  };

  // Selection handlers
  const handleRowSelectionChange = (selectedRowKeys: string[]) => {
    setSelectedRowKeys(selectedRowKeys);
    setBatchActionVisible(selectedRowKeys.length > 0);
  };

  const handleBatchDelete = () => {
    Dialog.confirm({
      title: i18n.t('Batch Delete').toString(),
      content: i18n.t('Are you sure you want to delete the selected tasks?').toString(),
      onOk: async () => {
        try {
          // TODO: 实际的API调用
          // await dispatch.faultSpaceDetection.batchDeleteTasks({ taskIds: selectedRowKeys });

          Message.success(i18n.t('Tasks deleted successfully').toString());
          setSelectedRowKeys([]);
          setBatchActionVisible(false);
          fetchTasks(); // 刷新列表
        } catch (error) {
          console.error('Failed to batch delete tasks:', error);
          Message.error(i18n.t('Failed to delete tasks').toString());
        }
      },
    });
  };

  // Render functions
  const renderTaskName = (value: string, index: number, record: DetectionTask) => {
    return (
      <div className={styles.taskNameCell}>
        <span
          className={styles.taskNameLink}
          onClick={() => handleViewTask(record.id)}
        >
          {value}
        </span>
        <Badge
          count={record.status}
          style={{
            backgroundColor: getStatusColor(record.status),
            marginLeft: 8,
            fontSize: 10,
          }}
        />
      </div>
    );
  };

  const renderApplicationSystem = (value: string, index: number, record: DetectionTask) => {
    return (
      <div>
        <div>{value}</div>
        <div className={styles.environmentText}>{record.environment}</div>
      </div>
    );
  };

  const renderAPI = (value: string, index: number, record: DetectionTask) => {
    return (
      <div>
        <span className={styles.methodTag}>{record.apiMethod}</span>
        <div className={styles.apiPath}>{record.apiPath}</div>
      </div>
    );
  };


  const renderSLOTarget = (value: string, index: number, record: DetectionTask) => {
    return (
      <div>
        <div>P95: {record.sloTarget.p95}ms</div>
        <div>P99: {record.sloTarget.p99}ms</div>
        <div>Error: {record.sloTarget.errorRate}%</div>
      </div>
    );
  };

  const renderExecutionResult = (value: string, index: number, record: DetectionTask) => {
    const statusColor = getExecutionStatusColor(record.executionResult.status);
    return (
      <div>
        <span style={{ color: statusColor }}>
          {getExecutionStatusText(record.executionResult.status)}
        </span>
        {record.executionResult.duration > 0 && (
          <div className={styles.duration}>
            {Math.floor(record.executionResult.duration / 60)}m {record.executionResult.duration % 60}s
          </div>
        )}
      </div>
    );
  };

  const renderLastExecution = (value: string, index: number, record: DetectionTask) => {
    return (
      <div>
        <div>{formatDate(new Date(record.lastExecutionTime).getTime())}</div>
        <div className={styles.executor}>{record.lastExecutor}</div>
      </div>
    );
  };

  const renderActions = (value: any, index: number, record: DetectionTask) => {
    const isRunning = record.status === 'RUNNING';

    return (
      <MenuButton
        label={<Icon type="ellipsis" />}
        popupProps={{ align: 'tr br' }}
      >
        <MenuButton.Item onClick={() => handleViewTask(record.id)}>
          <Translation>Details</Translation>
        </MenuButton.Item>
        <MenuButton.Item
          onClick={() => handleExecuteTask(record)}
          disabled={isRunning}
        >
          <Translation>Execute</Translation>
        </MenuButton.Item>
        <MenuButton.Item onClick={() => handleCopyTask(record)}>
          <Translation>Copy</Translation>
        </MenuButton.Item>
        <MenuButton.Divider />
        <MenuButton.Item
          onClick={() => handleDeleteTask(record)}
          disabled={isRunning}
        >
          <Translation>Delete</Translation>
        </MenuButton.Item>
      </MenuButton>
    );
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      RUNNING: '#1890ff',
      COMPLETED: '#52c41a',
      FAILED: '#ff4d4f',
      PENDING: '#faad14',
    };
    return colorMap[status] || '#666';
  };

  const getExecutionStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      SUCCESS: '#52c41a',
      FAILED: '#ff4d4f',
      TERMINATED: '#faad14',
      RUNNING: '#1890ff',
    };
    return colorMap[status] || '#666';
  };

  const getExecutionStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      SUCCESS: i18n.t('Success').toString(),
      FAILED: i18n.t('Failed').toString(),
      TERMINATED: i18n.t('Terminated').toString(),
      RUNNING: i18n.t('Running').toString(),
    };
    return textMap[status] || status;
  };

  // Render advanced filters
  const renderAdvancedFilters = () => (
    <Collapse>
      <Panel title={i18n.t('Advanced Filters').toString()}>
        <div className={styles.advancedFilters}>
          <div className={styles.filterRow}>
            <div className={styles.filterItem}>
              <label>{i18n.t('Application System').toString()}</label>
              <Select
                placeholder={i18n.t('Select application system').toString()}
                value={applicationSystemFilter}
                onChange={handleApplicationSystemChange}
                style={{ width: 200 }}
                hasClear
              >
                <Select.Option value="用户中心">用户中心</Select.Option>
                <Select.Option value="订单系统">订单系统</Select.Option>
                <Select.Option value="支付系统">支付系统</Select.Option>
              </Select>
            </div>

            <div className={styles.filterItem}>
              <label>{i18n.t('Status').toString()}</label>
              <Select
                mode="multiple"
                placeholder={i18n.t('Select status').toString()}
                value={statusFilter}
                onChange={handleStatusChange}
                style={{ width: 200 }}
                hasClear
              >
                <Select.Option value="RUNNING">Running</Select.Option>
                <Select.Option value="COMPLETED">Completed</Select.Option>
                <Select.Option value="FAILED">Failed</Select.Option>
                <Select.Option value="PENDING">Pending</Select.Option>
              </Select>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterItem}>
              <label>{i18n.t('Tags').toString()}</label>
              <Select
                mode="multiple"
                placeholder={i18n.t('Select tags').toString()}
                value={tagsFilter}
                onChange={handleTagsChange}
                style={{ width: 200 }}
                hasClear
              >
                <Select.Option value="高优先级">高优先级</Select.Option>
                <Select.Option value="核心API">核心API</Select.Option>
                <Select.Option value="订单">订单</Select.Option>
                <Select.Option value="支付">支付</Select.Option>
                <Select.Option value="查询">查询</Select.Option>
              </Select>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterItem}>
              <label>{i18n.t('Creation Time').toString()}</label>
              <RangePicker
                value={creationDateRange}
                onChange={handleCreationDateRangeChange}
                style={{ width: 250 }}
                placeholder={[ i18n.t('Start Date').toString(), i18n.t('End Date').toString() ]}
              />
            </div>

            <div className={styles.filterItem}>
              <label>{i18n.t('Last Execution Time').toString()}</label>
              <RangePicker
                value={executionDateRange}
                onChange={handleExecutionDateRangeChange}
                style={{ width: 250 }}
                placeholder={[ i18n.t('Start Date').toString(), i18n.t('End Date').toString() ]}
              />
            </div>
          </div>
        </div>
      </Panel>
    </Collapse>
  );

  // Render batch action toolbar
  const renderBatchActionToolbar = () => {
    if (!batchActionVisible) return null;

    return (
      <div className={styles.batchActionToolbar}>
        <span className={styles.selectedInfo}>
          {i18n.t('Selected').toString()}: {selectedRowKeys.length} {i18n.t('items').toString()}
        </span>
        <Button onClick={handleBatchDelete} type="primary">
          <Translation>Batch Delete</Translation>
        </Button>
      </div>
    );
  };

  // Render confirmation dialogs
  const renderDialogs = () => (
    <>
      <Dialog
        visible={executeDialogVisible}
        title={i18n.t('Execute Task').toString()}
        onClose={() => setExecuteDialogVisible(false)}
        onCancel={() => setExecuteDialogVisible(false)}
        onOk={confirmExecuteTask}
        locale={locale().Dialog}
      >
        <p>{i18n.t('Will start drill immediately with current configuration').toString()}</p>
        {currentTask && (
          <div>
            <strong>{i18n.t('Task').toString()}:</strong> {currentTask.name}
          </div>
        )}
      </Dialog>

      <Dialog
        visible={deleteDialogVisible}
        title={i18n.t('Delete Task').toString()}
        onClose={() => setDeleteDialogVisible(false)}
        onCancel={() => setDeleteDialogVisible(false)}
        onOk={confirmDeleteTask}
        locale={locale().Dialog}
      >
        <p>{i18n.t('Are you sure you want to delete this task?').toString()}</p>
        {currentTask && (
          <div>
            <strong>{i18n.t('Task').toString()}:</strong> {currentTask.name}
          </div>
        )}
      </Dialog>
    </>
  );

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <Search
            placeholder={i18n.t('Search by Task Name / API Path / Creator').toString()}
            onSearch={handleSearch}
            style={{ width: 400, marginRight: 16 }}
            hasClear
          />
        </div>
        <Button type="primary" onClick={handleAddDetection}>
          <Icon type="add" style={{ marginRight: 4 }} />
          <Translation>New Task</Translation>
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className={styles.filtersSection}>
        {renderAdvancedFilters()}
      </div>

      {/* Batch Action Toolbar */}
      {renderBatchActionToolbar()}

      {/* Table Section */}
      <div className={styles.tableContainer}>
        <Table
          dataSource={tasks}
          loading={loading}
          locale={locale().Table}
          hasBorder={false}
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelectionChange,
            getProps: (record: DetectionTask) => ({
              disabled: record.status === 'RUNNING',
            }),
          }}
        >
          <Table.Column
            title={i18n.t('Task Name').toString()}
            dataIndex="name"
            width="18%"
            cell={renderTaskName}
          />
          <Table.Column
            title={i18n.t('Application System / Environment').toString()}
            dataIndex="applicationSystem"
            width="15%"
            cell={renderApplicationSystem}
          />
          <Table.Column
            title={i18n.t('API').toString()}
            dataIndex="apiMethod"
            width="20%"
            cell={renderAPI}
          />


          <Table.Column
            title={i18n.t('SLO Target').toString()}
            dataIndex="sloTarget"
            width="12%"
            cell={renderSLOTarget}
          />
          <Table.Column
            title={i18n.t('Latest Execution Result').toString()}
            dataIndex="executionResult"
            width="13%"
            cell={renderExecutionResult}
          />
          <Table.Column
            title={i18n.t('Last Execution Time / Executor').toString()}
            dataIndex="lastExecutionTime"
            width="15%"
            cell={renderLastExecution}
          />
          <Table.Column
            title={i18n.t('Operation').toString()}
            dataIndex="actions"
            width="8%"
            cell={renderActions}
          />
        </Table>

        {total > pageSize && (
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            style={{ marginTop: 16, textAlign: 'right' }}
            locale={locale().Pagination}
          />
        )}
      </div>

      {/* Dialogs */}
      {renderDialogs()}
    </div>
  );
};

export default DetectionTasks;
