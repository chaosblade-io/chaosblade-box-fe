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
  id: number | string;
  name: string;
  description?: string;
  systemId: number | string;
  apiId: number | string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  requestNum: number;
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
  const [ selectedRowKeys, setSelectedRowKeys ] = useState<Array<string | number>>([]);
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
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      const res: any = await probeProxy.getDetectionTasks({ page, size: pageSize, keyword: searchKey, status: statusFilter.join(',') });
      // 兼容两种返回结构：{ items, total, page, size } 或 { success, data: { items, total, page, size } }
      const items = (res?.items || res?.data?.items) || [];
      const total = Number(res?.total ?? res?.data?.total ?? items.length ?? 0);

      const mapped: DetectionTask[] = items.map((it: any) => ({
        id: it.id,
        name: it.name,
        description: it.description || '',
        systemId: it.systemId,
        apiId: it.apiId,
        createdBy: it.createdBy,
        updatedBy: it.updatedBy,
        createdAt: it.createdAt || '',
        updatedAt: it.updatedAt || '',
        requestNum: Number(it.requestNum || 0),
      }));

      setTasks(mapped);
      setTotal(total);
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

  const handleViewTask = (taskId: string | number) => {
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
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      await probeProxy.executeTask(currentTask.id);
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
  const handleRowSelectionChange = (selectedRowKeys: Array<string | number>) => {
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
      <span
        className={styles.taskNameLink}
        onClick={() => handleViewTask(record.id)}
      >
        {value}
      </span>
    );
  };


  const renderActions = (_: any, __: number, record: DetectionTask) => {
    return (
      <MenuButton
        label={<Icon type="ellipsis" />}
        popupProps={{ align: 'tr br' }}
      >
        <MenuButton.Item onClick={() => handleViewTask(record.id)}>
          <Translation>Details</Translation>
        </MenuButton.Item>
        <MenuButton.Item onClick={() => handleExecuteTask(record)}>
          <Translation>Execute</Translation>
        </MenuButton.Item>
        <MenuButton.Item onClick={() => handleCopyTask(record)}>
          <Translation>Copy</Translation>
        </MenuButton.Item>
        <MenuButton.Divider />
        <MenuButton.Item onClick={() => handleDeleteTask(record)}>
          <Translation>Delete</Translation>
        </MenuButton.Item>
      </MenuButton>
    );
  };

  // Helper functions
  const renderDate = (value: string) => {
    if (!value) return '-';
    try {
      return formatDate(new Date(value).getTime());
    } catch (e) {
      return value;
    }
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
          }}
        >
          <Table.Column
            title={i18n.t('ID').toString()}
            dataIndex="id"
            width="8%"
          />
          <Table.Column
            title={i18n.t('Task Name').toString()}
            dataIndex="name"
            width="16%"
            cell={renderTaskName as any}
          />
          <Table.Column
            title={i18n.t('Description').toString()}
            dataIndex="description"
            width="18%"
          />
          <Table.Column
            title={i18n.t('System ID').toString()}
            dataIndex="systemId"
            width="10%"
          />
          <Table.Column
            title={i18n.t('API ID').toString()}
            dataIndex="apiId"
            width="10%"
          />
          <Table.Column
            title={i18n.t('Request Num').toString()}
            dataIndex="requestNum"
            width="10%"
          />
          <Table.Column
            title={i18n.t('Created By').toString()}
            dataIndex="createdBy"
            width="10%"
          />
          <Table.Column
            title={i18n.t('Updated By').toString()}
            dataIndex="updatedBy"
            width="10%"
          />
          <Table.Column
            title={i18n.t('Created At').toString()}
            dataIndex="createdAt"
            width="12%"
            cell={renderDate as any}
          />
          <Table.Column
            title={i18n.t('Updated At').toString()}
            dataIndex="updatedAt"
            width="12%"
            cell={renderDate as any}
          />
          <Table.Column
            title={i18n.t('Operation').toString()}
            dataIndex="actions"
            width="8%"
            cell={renderActions as any}
          />
        </Table>

        <Pagination
          current={page}
          total={total}
          pageSize={pageSize}
          onChange={handlePageChange}
          style={{ marginTop: 16, textAlign: 'right' }}
          locale={locale().Pagination}
        />
      </div>

      {/* Dialogs */}
      {renderDialogs()}
    </div>
  );
};

export default DetectionTasks;
