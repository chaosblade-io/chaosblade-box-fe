import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Button, Table, Pagination, Search, Select, Message, DatePicker, Dialog, Tag, Icon } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';
import formatDate from '../../lib/DateUtil';

const { RangePicker } = DatePicker;

const DetectionRecords: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [ searchKey, setSearchKey ] = useState('');
  const [ statusFilter, setStatusFilter ] = useState('');
  const [ dateRange, setDateRange ] = useState<[Date, Date] | null>(null);
  const [ page, setPage ] = useState(1);
  const [ pageSize ] = useState(20);
  const [ loading, setLoading ] = useState(false);
  const [ records, setRecords ] = useState([]);
  const [ total, setTotal ] = useState(0);
  const [ detailVisible, setDetailVisible ] = useState(false);
  const [ currentRecord, setCurrentRecord ] = useState<any>(null);

  useEffect(() => {
    // 设置页面标题和面包屑
    dispatch.pageHeader.setTitle(i18n.t('Detection Records').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
      { key: 'fault_space_detection', value: i18n.t('Fault Space Detection').toString(), path: '/chaos/fault-space-detection/tasks' },
      { key: 'detection_records', value: i18n.t('Detection Records').toString(), path: '/chaos/fault-space-detection/records' },
    ]));

    fetchRecords();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [ searchKey, statusFilter, dateRange, page ]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // TODO: 实际的API调用
      // const result = await dispatch.faultSpaceDetection.getDetectionRecords({
      //   searchKey,
      //   status: statusFilter,
      //   startDate: dateRange?.[0],
      //   endDate: dateRange?.[1],
      //   page,
      //   pageSize,
      // });

      // Mock drill records data
      const mockRecords = [
        {
          runId: 'RUN_20241225_001',
          taskId: 'task_001',
          taskName: '用户登录API故障检测',
          applicationSystem: '用户中心',
          environment: '生产环境',
          apiInfo: {
            method: 'POST',
            path: '/api/v1/auth/login',
            summary: '用户登录',
          },
          initiator: 'admin',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date().toISOString(),
          status: 'SUCCESS',
          duration: 3600,
          resultSummary: {
            totalRequests: 100,
            failedRequests: 2,
            highLatencyIncidents: 5,
            avgLatency: 156,
            maxLatency: 890,
          },
        },
        {
          runId: 'RUN_20241224_003',
          taskId: 'task_002',
          taskName: '订单查询性能探测',
          applicationSystem: '订单系统',
          environment: '测试环境',
          apiInfo: {
            method: 'GET',
            path: '/api/v1/orders/{orderId}',
            summary: '订单查询',
          },
          initiator: 'user1',
          startTime: new Date(Date.now() - 86400000).toISOString(),
          endTime: new Date(Date.now() - 86100000).toISOString(),
          status: 'FAILED',
          duration: 300,
          resultSummary: {
            totalRequests: 45,
            failedRequests: 15,
            highLatencyIncidents: 8,
            avgLatency: 234,
            maxLatency: 2100,
          },
        },
        {
          runId: 'RUN_20241224_002',
          taskId: 'task_001',
          taskName: '用户登录API故障空间探测',
          applicationSystem: '用户中心',
          environment: '生产环境',
          apiInfo: {
            method: 'POST',
            path: '/api/v1/auth/login',
            summary: '用户登录',
          },
          initiator: 'admin',
          startTime: new Date(Date.now() - 172800000).toISOString(),
          endTime: new Date(Date.now() - 172500000).toISOString(),
          status: 'RUNNING',
          duration: 300,
          resultSummary: {
            totalRequests: 30,
            failedRequests: 1,
            highLatencyIncidents: 2,
            avgLatency: 178,
            maxLatency: 567,
          },
        },
        {
          runId: 'RUN_20241223_001',
          taskId: 'task_003',
          taskName: '支付功能故障空间探测',
          applicationSystem: '支付系统',
          environment: '生产环境',
          apiInfo: {
            method: 'POST',
            path: '/api/v1/payment/process',
            summary: '支付处理',
          },
          initiator: 'user2',
          startTime: new Date(Date.now() - 259200000).toISOString(),
          endTime: new Date(Date.now() - 258900000).toISOString(),
          status: 'TERMINATED',
          duration: 180,
          resultSummary: {
            totalRequests: 20,
            failedRequests: 0,
            highLatencyIncidents: 1,
            avgLatency: 123,
            maxLatency: 345,
          },
        },
      ];

      setRecords(mockRecords);
      setTotal(mockRecords.length);
    } catch (error) {
      console.error('Failed to fetch detection records:', error);
      Message.error(i18n.t('Failed to load data').toString());
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchKey(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDateRangeChange = (value: [Date, Date] | null) => {
    setDateRange(value);
    setPage(1);
  };

  const handlePageChange = (current: number) => {
    setPage(current);
  };

  const handleViewDetail = (record: any) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleViewDrillRecord = (runId: string) => {
    pushUrl(history, `/chaos/fault-space-detection/records/${runId}`);
  };

  const renderStatus = (status: string) => {
    const statusConfig = {
      SUCCESS: { text: i18n.t('Success').toString(), color: '#52c41a' },
      FAILED: { text: i18n.t('Failed').toString(), color: '#ff4d4f' },
      RUNNING: { text: i18n.t('Running').toString(), color: '#1890ff' },
      TERMINATED: { text: i18n.t('Terminated').toString(), color: '#faad14' },
      PAUSED: { text: i18n.t('Paused').toString(), color: '#666' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { text: status, color: '#666' };

    return (
      <Tag color={config.color} style={{ fontWeight: 500 }}>
        {config.text}
      </Tag>
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  };

  const renderResultSummary = (record: any) => {
    const { resultSummary } = record;

    return (
      <div style={{ fontSize: 12 }}>
        <div style={{ marginBottom: 2 }}>
          <Translation>Failed</Translation>: {resultSummary.failedRequests}/{resultSummary.totalRequests}
        </div>
        <div style={{ marginBottom: 2 }}>
          <Translation>High Latency</Translation>: {resultSummary.highLatencyIncidents}
        </div>
        <div>
          <Translation>Avg</Translation>: {resultSummary.avgLatency}ms
        </div>
      </div>
    );
  };

  const renderDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    }
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;

  };

  const renderStartTime = (value: string) => {
    return value ? formatDate(new Date(value).getTime()) : '-';
  };

  const renderActions = (_: any, __: number, record: any) => {
    return (
      <div>
        <Button type="link" onClick={() => handleViewDetail(record)}>
          <Translation>View Detail</Translation>
        </Button>
      </div>
    );
  };

  const renderDetailDialog = () => {
    if (!currentRecord) return null;

    return (
      <Dialog
        visible={detailVisible}
        title={i18n.t('Drill Record Detail').toString()}
        onClose={() => setDetailVisible(false)}
        onCancel={() => setDetailVisible(false)}
        footer={
          <div>
            <Button onClick={() => setDetailVisible(false)} style={{ marginRight: 8 }}>
              <Translation>Close</Translation>
            </Button>
            <Button type="primary" onClick={() => handleViewDrillRecord(currentRecord.runId)}>
              <Translation>View Full Details</Translation>
            </Button>
          </div>
        }
        style={{ width: 600 }}
        locale={locale().Dialog}
      >
        <div className={styles.detailContent}>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('Run ID').toString()}:</span>
            <span style={{ fontFamily: 'Monaco, Consolas, monospace' }}>{currentRecord.runId}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('Task Name').toString()}:</span>
            <span>{currentRecord.taskName}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('Application / Environment').toString()}:</span>
            <span>{currentRecord.applicationSystem} / {currentRecord.environment}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('API').toString()}:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color="#1890ff" style={{ fontWeight: 600, fontSize: 11 }}>
                {currentRecord.apiInfo.method}
              </Tag>
              <code style={{ fontSize: 12 }}>{currentRecord.apiInfo.path}</code>
            </div>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('Status').toString()}:</span>
            {renderStatus(currentRecord.status)}
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('Initiator').toString()}:</span>
            <span>{currentRecord.initiator}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('Start Time').toString()}:</span>
            <span>{renderStartTime(currentRecord.startTime)}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{i18n.t('Duration').toString()}:</span>
            <span style={{ fontFamily: 'Monaco, Consolas, monospace' }}>{formatDuration(currentRecord.duration)}</span>
          </div>

          {currentRecord.resultSummary && (
            <div className={styles.resultSection}>
              <div className={styles.sectionTitle}>{i18n.t('Result Summary').toString()}</div>
              <div className={styles.detailItem}>
                <span className={styles.label}>{i18n.t('Total Requests').toString()}:</span>
                <span>{currentRecord.resultSummary.totalRequests}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>{i18n.t('Failed Requests').toString()}:</span>
                <span>{currentRecord.resultSummary.failedRequests}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>{i18n.t('High Latency Incidents').toString()}:</span>
                <span>{currentRecord.resultSummary.highLatencyIncidents}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>{i18n.t('Average Latency').toString()}:</span>
                <span>{currentRecord.resultSummary.avgLatency}ms</span>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <Search
            placeholder={i18n.t('Search by Run ID or Task Name').toString()}
            onSearch={handleSearch}
            style={{ width: 250, marginRight: 16 }}
          />
          <Select
            placeholder={i18n.t('Filter by status').toString()}
            value={statusFilter}
            onChange={handleStatusChange}
            style={{ width: 150, marginRight: 16 }}
            hasClear
          >
            <Select.Option value="">All Status</Select.Option>
            <Select.Option value="SUCCESS">Success</Select.Option>
            <Select.Option value="FAILED">Failed</Select.Option>
            <Select.Option value="RUNNING">Running</Select.Option>
            <Select.Option value="TERMINATED">Terminated</Select.Option>
            <Select.Option value="PAUSED">Paused</Select.Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{ width: 250 }}
            placeholder={[ i18n.t('Start Date').toString(), i18n.t('End Date').toString() ]}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table
          dataSource={records}
          loading={loading}
          locale={locale().Table}
          hasBorder={false}
        >
          <Table.Column
            title={i18n.t('Run ID').toString()}
            dataIndex="runId"
            width="15%"
            cell={(value: string) => (
              <Button
                type="link"
                onClick={() => handleViewDrillRecord(value)}
                style={{
                  padding: 5,
                  fontSize: 12,
                  fontFamily: 'Monaco, Consolas, monospace',
                  fontWeight: 500,
                }}
              >
                {value}
              </Button>
            )}
          />
          <Table.Column
            title={i18n.t('Task Name').toString()}
            dataIndex="taskName"
            width="20%"
            cell={(value: string, index: number, record: any) => (
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {record.applicationSystem} / {record.environment}
                </div>
              </div>
            )}
          />
          <Table.Column
            title={i18n.t('API').toString()}
            width="20%"
            cell={(value: any, index: number, record: any) => (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <Tag color="#1890ff" style={{ fontWeight: 600, fontSize: 11 }}>
                    {record.apiInfo.method}
                  </Tag>
                  <code style={{ fontSize: 11 }}>{record.apiInfo.path}</code>
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  {record.apiInfo.summary}
                </div>
              </div>
            )}
          />
          <Table.Column
            title={i18n.t('Initiator').toString()}
            dataIndex="initiator"
            width="10%"
            cell={(value: string) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon type="user" size="xs" />
                {value}
              </div>
            )}
          />
          <Table.Column title={i18n.t('Status').toString()} dataIndex="status" width="10%" cell={renderStatus} />
          <Table.Column title={i18n.t('Start Time').toString()} dataIndex="startTime" width="15%" cell={renderStartTime} />
          <Table.Column
            title={i18n.t('Duration').toString()}
            width="10%"
            cell={(value: any, index: number, record: any) => (
              <span style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: 12 }}>
                {formatDuration(record.duration)}
              </span>
            )}
          />
          <Table.Column
            title={i18n.t('Result Summary').toString()}
            width="15%"
            cell={(value: any, index: number, record: any) => renderResultSummary(record)}
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

      {renderDetailDialog()}
    </div>
  );
};

export default DetectionRecords;
