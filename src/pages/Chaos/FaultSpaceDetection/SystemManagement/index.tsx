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
  Message,
  Dialog,
  Icon,
} from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';
import SystemForm from './SystemForm';
import ApiList from './ApiList';

// TypeScript interface for the system data
interface SystemRecord {
  id: number;
  systemKey: string;
  name: string;
  description?: string;
  owner?: string;
  defaultEnvironment?: string;
  apiCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * SystemManagement - Main page for managing target systems and their APIs.
 *
 * Displays a searchable table of target systems. Each system row can be
 * expanded to reveal the ApiList component showing that system's API
 * definitions. Supports create, edit, and delete operations via the
 * SystemForm dialog.
 */
const SystemManagement: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Search state
  const [searchKey, setSearchKey] = useState('');

  // Table states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [systems, setSystems] = useState<SystemRecord[]>([]);
  const [total, setTotal] = useState(0);

  // Expanded row tracking
  const [expandedRowKeys, setExpandedRowKeys] = useState<Array<string | number>>([]);

  // SystemForm dialog state
  const [formVisible, setFormVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemRecord | null>(null);

  useEffect(() => {
    // Set page title and breadcrumb
    dispatch.pageHeader.setTitle(i18n.t('Target System Management').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
      {
        key: 'fault_space_detection',
        value: i18n.t('Fault Space Detection').toString(),
        path: '/chaos/fault-space-detection/tasks',
      },
      {
        key: 'system_management',
        value: i18n.t('Target System Management').toString(),
        path: '/chaos/fault-space-detection/systems',
      },
    ]));

    fetchSystems();
  }, []);

  // Refetch when search or pagination changes
  useEffect(() => {
    fetchSystems();
  }, [searchKey, page]);

  /**
   * Fetch the list of target systems from the backend.
   */
  const fetchSystems = async () => {
    setLoading(true);
    try {
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      const res: any = await probeProxy.getSystems({ page, size: pageSize });

      // Handle both response structures: { items, total } or { data: { items, total } }
      let items = res?.items || res?.data?.items || [];
      const totalCount = Number(res?.total ?? res?.data?.total ?? items.length ?? 0);

      // Client-side name filter (the backend may not support keyword search for systems)
      if (searchKey.trim()) {
        const keyword = searchKey.trim().toLowerCase();
        items = items.filter((item: any) =>
          (item.name || '').toLowerCase().includes(keyword) ||
          (item.systemKey || '').toLowerCase().includes(keyword)
        );
      }

      const mapped: SystemRecord[] = items.map((item: any) => ({
        id: item.id,
        systemKey: item.systemKey || '',
        name: item.name || '',
        description: item.description || '',
        owner: item.owner || '',
        defaultEnvironment: item.defaultEnvironment || '',
        apiCount: item.apiCount ?? 0,
        createdAt: item.createdAt || '',
        updatedAt: item.updatedAt || '',
      }));

      setSystems(mapped);
      setTotal(searchKey.trim() ? mapped.length : totalCount);
    } catch (error) {
      console.error('Failed to fetch systems:', error);
      Message.error(i18n.t('Failed to load data').toString());
    } finally {
      setLoading(false);
    }
  };

  // -- Event Handlers --

  /**
   * Handle search input submission.
   */
  const handleSearch = (value: string) => {
    setSearchKey(value);
    setPage(1);
  };

  /**
   * Handle page change in the pagination component.
   */
  const handlePageChange = (current: number) => {
    setPage(current);
  };

  /**
   * Open the SystemForm dialog for creating a new system.
   */
  const handleAddSystem = () => {
    setEditingSystem(null);
    setFormVisible(true);
  };

  /**
   * Open the SystemForm dialog for editing an existing system.
   */
  const handleEditSystem = (record: SystemRecord) => {
    setEditingSystem(record);
    setFormVisible(true);
  };

  /**
   * Delete a system after user confirmation.
   */
  const handleDeleteSystem = (record: SystemRecord) => {
    Dialog.confirm({
      title: i18n.t('Delete System').toString(),
      content: i18n.t('Are you sure you want to delete this system? All associated APIs will also be deleted.').toString(),
      locale: locale().Dialog,
      onOk: async () => {
        try {
          const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
          await probeProxy.deleteSystem(record.id);
          Message.success(i18n.t('System deleted successfully').toString());
          fetchSystems();
        } catch (error) {
          console.error('Failed to delete system:', error);
          Message.error(i18n.t('Failed to delete system').toString());
        }
      },
    });
  };

  /**
   * Handle row expansion toggle.
   */
  const handleExpandedRowChange = (expandedKeys: Array<string | number>) => {
    setExpandedRowKeys(expandedKeys);
  };

  // -- Render Helpers --

  /**
   * Render the system name as a clickable link that expands the row.
   */
  const renderSystemName = (value: string, _index: number, record: SystemRecord) => {
    return (
      <span
        className={styles.systemNameLink}
        onClick={() => {
          const key = record.id;
          if (expandedRowKeys.includes(key)) {
            setExpandedRowKeys(expandedRowKeys.filter(k => k !== key));
          } else {
            setExpandedRowKeys([...expandedRowKeys, key]);
          }
        }}
      >
        {value}
      </span>
    );
  };

  /**
   * Render the environment column as a styled tag.
   */
  const renderEnvironment = (value: string) => {
    if (!value) return '-';
    return <span className={styles.environmentTag}>{value}</span>;
  };

  /**
   * Render the action buttons for each system row.
   */
  const renderActions = (_: any, __: number, record: SystemRecord) => {
    return (
      <div className={styles.actionButtons}>
        <Button
          type="primary"
          text
          onClick={() => handleEditSystem(record)}
        >
          <Translation>Edit</Translation>
        </Button>
        <Button
          type="primary"
          text
          warning
          onClick={() => handleDeleteSystem(record)}
        >
          <Translation>Delete</Translation>
        </Button>
      </div>
    );
  };

  /**
   * Render the expanded content for a system row, showing its API list.
   */
  const renderExpandedRow = (record: SystemRecord) => {
    return <ApiList systemId={record.id} />;
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <Search
            placeholder={i18n.t('Search by system name or key').toString()}
            onSearch={handleSearch}
            style={{ width: 400, marginRight: 16 }}
            hasClear
          />
        </div>
        <Button type="primary" onClick={handleAddSystem}>
          <Icon type="add" style={{ marginRight: 4 }} />
          <Translation>New System</Translation>
        </Button>
      </div>

      {/* Table Section */}
      <div className={styles.tableContainer}>
        <Table
          dataSource={systems}
          loading={loading}
          locale={locale().Table}
          hasBorder={false}
          primaryKey="id"
          expandedRowRender={renderExpandedRow as any}
          expandedRowKeys={expandedRowKeys}
          onExpandedChange={handleExpandedRowChange as any}
        >
          <Table.Column
            title={i18n.t('Name').toString()}
            dataIndex="name"
            width="18%"
            cell={renderSystemName as any}
          />
          <Table.Column
            title={i18n.t('System Key').toString()}
            dataIndex="systemKey"
            width="15%"
          />
          <Table.Column
            title={i18n.t('Environment').toString()}
            dataIndex="defaultEnvironment"
            width="12%"
            cell={renderEnvironment as any}
          />
          <Table.Column
            title={i18n.t('Owner').toString()}
            dataIndex="owner"
            width="12%"
          />
          <Table.Column
            title={i18n.t('Description').toString()}
            dataIndex="description"
            width="20%"
          />
          <Table.Column
            title={i18n.t('API Count').toString()}
            dataIndex="apiCount"
            width="10%"
          />
          <Table.Column
            title={i18n.t('Operation').toString()}
            dataIndex="actions"
            width="13%"
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

      {/* System Create/Edit Dialog */}
      <SystemForm
        visible={formVisible}
        editData={editingSystem}
        onClose={() => setFormVisible(false)}
        onSuccess={fetchSystems}
      />
    </div>
  );
};

export default SystemManagement;
