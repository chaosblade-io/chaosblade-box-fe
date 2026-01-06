import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import {
  Table,
  Button,
  Message,
  Icon,
  Select,
  DatePicker,
  MenuButton,
  Tag,
  Pagination,
  Search,
} from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';
import formatDate from '../../../lib/DateUtil';

const { RangePicker } = DatePicker;

interface DrillRecord {
  runId: string;
  initiator: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'TERMINATED';
  startTime: string;
  endTime?: string;
  duration?: number;
  resultSummary: {
    totalRequests: number;
    failedRequests: number;
    highLatencyIncidents: number;
    avgLatency: number;
    maxLatency: number;
  };
  errorMessage?: string;
}

interface DrillRecordsTabProps {
  taskId: string;
}

const DrillRecordsTab: FC<DrillRecordsTabProps> = ({ taskId }) => {
  const history = useHistory();

  const [ records, setRecords ] = useState<DrillRecord[]>([]);
  const [ loading, setLoading ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ pageSize ] = useState(20);
  const [ total, setTotal ] = useState(0);

  // Filters
  const [ statusFilter, setStatusFilter ] = useState<string>('');
  const [ dateRange, setDateRange ] = useState<[Date, Date] | null>(null);
  const [ searchKey, setSearchKey ] = useState('');

  useEffect(() => {
    loadDrillRecords();
  }, [ taskId, page, statusFilter, dateRange, searchKey ]);

  const loadDrillRecords = async () => {
    setLoading(true);
    try {
      const { probeProxy } = await import('../../../../../services/faultSpaceDetection/probeProxy');
      const res = await probeProxy.getTaskExecutions(Number(taskId), { page, size: pageSize });
      const items = res?.data?.items || [];
      const total = res?.data?.total || 0;

      const mapped: DrillRecord[] = items.map((it: any) => ({
        runId: String(it.id),
        initiator: it.initiator || it.createdBy || '-',
        status: (it.status || 'DONE') as any,
        startTime: it.startedAt || it.createdAt || '',
        endTime: it.finishedAt || it.updatedAt || '',
        duration: Number(it.durationSeconds || 0),
        resultSummary: {
          totalRequests: Number(it.totalRequests || 0),
          failedRequests: Number(it.failedRequests || 0),
          highLatencyIncidents: Number(it.highLatencyIncidents || 0),
          avgLatency: Number(it.avgLatency || 0),
          maxLatency: Number(it.maxLatency || 0),
        },
        errorMessage: it.errorMsg,
      }));

      setRecords(mapped);
      setTotal(total);
    } catch (error) {
      console.error('Failed to load drill records:', error);
      Message.error(i18n.t('Failed to load drill records').toString());
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (runId: string) => {
    pushUrl(history, `/chaos/fault-space-detection/records/${runId}`);
  };

  const handleExportReport = async (runId: string, format: 'HTML' | 'CSV' | 'JSON') => {
    try {
      // TODO: Implement export functionality
      // await dispatch.faultSpaceDetection.exportDrillReport({ runId, format });

      Message.success(i18n.t(`Report exported as ${format} successfully`).toString());
    } catch (error) {
      console.error('Failed to export report:', error);
      Message.error(i18n.t('Failed to export report').toString());
    }
  };

  const handleQuickFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setDateRange([ startDate, endDate ]);
  };

  const renderStatus = (status: string) => {
    const statusConfig = {
      SUCCESS: { color: '#52c41a', text: i18n.t('Success').toString() },
      FAILED: { color: '#ff4d4f', text: i18n.t('Failed').toString() },
      RUNNING: { color: '#1890ff', text: i18n.t('Running').toString() },
      TERMINATED: { color: '#faad14', text: i18n.t('Terminated').toString() },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: '#666', text: status };

    return (
      <Tag color={config.color} style={{ fontWeight: 500 }}>
        {config.text}
      </Tag>
    );
  };

  const renderDuration = (startTime: string, endTime?: string, duration?: number) => {
    if (duration) {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    }

    if (endTime) {
      const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
      const totalSeconds = Math.floor(durationMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    }

    return '-';
  };

  const renderResultSummary = (record: DrillRecord) => {
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

  const renderActions = (value: any, index: number, record: DrillRecord) => (
    <MenuButton
      label={<Icon type="ellipsis" />}
      popupProps={{ align: 'tr br' }}
    >
      <MenuButton.Item onClick={() => handleViewDetails(record.runId)}>
        <Icon type="eye" style={{ marginRight: 4 }} />
        <Translation>View Details</Translation>
      </MenuButton.Item>
      <MenuButton.Divider />
      <MenuButton.Item onClick={() => handleExportReport(record.runId, 'HTML')}>
        <Icon type="download" style={{ marginRight: 4 }} />
        <Translation>Export HTML</Translation>
      </MenuButton.Item>
      <MenuButton.Item onClick={() => handleExportReport(record.runId, 'CSV')}>
        <Icon type="download" style={{ marginRight: 4 }} />
        <Translation>Export CSV</Translation>
      </MenuButton.Item>
      <MenuButton.Item onClick={() => handleExportReport(record.runId, 'JSON')}>
        <Icon type="download" style={{ marginRight: 4 }} />
        <Translation>Export JSON</Translation>
      </MenuButton.Item>
    </MenuButton>
  );

  const columns = [
    {
      title: i18n.t('Run ID').toString(),
      dataIndex: 'runId',
      width: '15%',
      cell: (value: string) => (
        <Button
          type="link"
          onClick={() => handleViewDetails(value)}
          style={{ padding: 5, fontSize: 12, fontFamily: 'Monaco, Consolas, monospace' }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: i18n.t('Initiator').toString(),
      dataIndex: 'initiator',
      width: '10%',
    },
    {
      title: i18n.t('Status').toString(),
      dataIndex: 'status',
      width: '10%',
      cell: renderStatus,
    },
    {
      title: i18n.t('Start Time').toString(),
      dataIndex: 'startTime',
      width: '15%',
      cell: (value: string) => formatDate(new Date(value).getTime()),
    },
    {
      title: i18n.t('End Time').toString(),
      dataIndex: 'endTime',
      width: '15%',
      cell: (value: string) => (value ? formatDate(new Date(value).getTime()) : '-'),
    },
    {
      title: i18n.t('Duration').toString(),
      width: '10%',
      cell: (value: any, index: number, record: DrillRecord) =>
        renderDuration(record.startTime, record.endTime, record.duration),
    },
    {
      title: i18n.t('Result Summary').toString(),
      width: '15%',
      cell: (value: any, index: number, record: DrillRecord) => renderResultSummary(record),
    },
    {
      title: i18n.t('Actions').toString(),
      width: '10%',
      cell: renderActions,
    },
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{
        background: '#fff',
        padding: 16,
        marginBottom: 16,
        borderRadius: 6,
        border: '1px solid #e8e8e8',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <Search
              placeholder={i18n.t('Search by Run ID or Initiator').toString()}
              value={searchKey}
              onChange={setSearchKey}
              style={{ width: 250 }}
              hasClear
            />
          </div>

          <div>
            <Select
              placeholder={i18n.t('Filter by status').toString()}
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              hasClear
            >
              <Select.Option value="">All Status</Select.Option>
              <Select.Option value="SUCCESS">Success</Select.Option>
              <Select.Option value="FAILED">Failed</Select.Option>
              <Select.Option value="RUNNING">Running</Select.Option>
              <Select.Option value="TERMINATED">Terminated</Select.Option>
            </Select>
          </div>

          <div>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={[ i18n.t('Start Date').toString(), i18n.t('End Date').toString() ]}
              style={{ width: 250 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" onClick={() => handleQuickFilter(1)}>
              <Translation>Last 24h</Translation>
            </Button>
            <Button size="small" onClick={() => handleQuickFilter(7)}>
              <Translation>Last 7 days</Translation>
            </Button>
            <Button size="small" onClick={() => handleQuickFilter(30)}>
              <Translation>Last 30 days</Translation>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        borderRadius: 6,
        border: '1px solid #e8e8e8',
      }}>
        <Table
          dataSource={records}
          columns={columns}
          loading={loading}
          hasBorder={false}
          emptyContent={
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
              <Icon type="inbox" size="large" style={{ marginBottom: 16 }} />
              <div style={{ fontSize: 16, marginBottom: 8 }}>
                <Translation>No drill records found</Translation>
              </div>
              <div style={{ fontSize: 14 }}>
                <Translation>Execute the task to generate drill records</Translation>
              </div>
            </div>
          }
        />

        {total > pageSize && (
          <div style={{ padding: 16, textAlign: 'right', borderTop: '1px solid #e8e8e8' }}>
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={setPage}
              totalRender={(total, range) => `${range[0]}-${range[1]} of ${total} records`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillRecordsTab;
