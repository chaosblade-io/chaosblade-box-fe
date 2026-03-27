import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import {
  Button,
  Table,
  Message,
  Dialog,
  Icon,
} from '@alicloud/console-components';
import ApiForm from './ApiForm';

interface ApiListProps {
  /** The system ID whose APIs to display */
  systemId: number;
}

/**
 * ApiList - Displays the list of API definitions belonging to a target system.
 *
 * Shows a table with method (color-coded tag), path, operation ID, base URL,
 * and action buttons for edit and delete. Includes a "New API" button and
 * an ApiForm dialog for create/edit operations.
 */
const ApiList: FC<ApiListProps> = ({ systemId }) => {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ApiForm dialog state
  const [formVisible, setFormVisible] = useState(false);
  const [editingApi, setEditingApi] = useState<any | null>(null);

  useEffect(() => {
    fetchApis();
  }, [systemId]);

  /**
   * Fetch the list of APIs for the given system from the backend.
   */
  const fetchApis = async () => {
    setLoading(true);
    try {
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      const res: any = await probeProxy.getApis(systemId);
      // Handle both response structures
      const items = res?.items || res?.data?.items || [];
      setApis(items);
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
      Message.error(i18n.t('Failed to load APIs').toString());
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open the ApiForm dialog for creating a new API.
   */
  const handleAddApi = () => {
    setEditingApi(null);
    setFormVisible(true);
  };

  /**
   * Open the ApiForm dialog for editing an existing API.
   */
  const handleEditApi = (record: any) => {
    setEditingApi(record);
    setFormVisible(true);
  };

  /**
   * Delete an API after user confirmation.
   */
  const handleDeleteApi = (record: any) => {
    Dialog.confirm({
      title: i18n.t('Delete API').toString(),
      content: i18n.t('Are you sure you want to delete this API?').toString(),
      locale: locale().Dialog,
      onOk: async () => {
        try {
          const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
          await probeProxy.deleteApi(record.id);
          Message.success(i18n.t('API deleted successfully').toString());
          fetchApis();
        } catch (error) {
          console.error('Failed to delete API:', error);
          Message.error(i18n.t('Failed to delete API').toString());
        }
      },
    });
  };

  /**
   * Get the CSS class name for the method tag based on HTTP method.
   */
  const getMethodTagClass = (httpMethod: string): string => {
    const upper = (httpMethod || '').toUpperCase();
    switch (upper) {
      case 'GET': return styles.methodTagGET;
      case 'POST': return styles.methodTagPOST;
      case 'PUT': return styles.methodTagPUT;
      case 'DELETE': return styles.methodTagDELETE;
      case 'PATCH': return styles.methodTagPATCH;
      default: return styles.methodTagDefault;
    }
  };

  /**
   * Render the method column as a color-coded tag.
   */
  const renderMethod = (value: string) => {
    return (
      <span className={getMethodTagClass(value)}>
        {(value || '').toUpperCase()}
      </span>
    );
  };

  /**
   * Render the path column with monospace styling.
   */
  const renderPath = (value: string) => {
    return <span className={styles.apiPath}>{value}</span>;
  };

  /**
   * Render the action buttons for each API row.
   */
  const renderActions = (_: any, __: number, record: any) => {
    return (
      <div className={styles.actionButtons}>
        <Button
          type="primary"
          text
          onClick={() => handleEditApi(record)}
        >
          <Translation>Edit</Translation>
        </Button>
        <Button
          type="primary"
          text
          warning
          onClick={() => handleDeleteApi(record)}
        >
          <Translation>Delete</Translation>
        </Button>
      </div>
    );
  };

  return (
    <div className={styles.expandedRow}>
      <div className={styles.apiListHeader}>
        <span className={styles.apiListTitle}>
          {i18n.t('API List').toString()}
        </span>
        <Button type="primary" size="small" onClick={handleAddApi}>
          <Icon type="add" style={{ marginRight: 4 }} />
          <Translation>New API</Translation>
        </Button>
      </div>

      <Table
        dataSource={apis}
        loading={loading}
        locale={locale().Table}
        hasBorder={false}
        size="small"
      >
        <Table.Column
          title={i18n.t('Method').toString()}
          dataIndex="method"
          width="10%"
          cell={renderMethod as any}
        />
        <Table.Column
          title={i18n.t('Path').toString()}
          dataIndex="path"
          width="25%"
          cell={renderPath as any}
        />
        <Table.Column
          title={i18n.t('Operation ID').toString()}
          dataIndex="operationId"
          width="20%"
        />
        <Table.Column
          title={i18n.t('Base URL').toString()}
          dataIndex="baseUrl"
          width="25%"
        />
        <Table.Column
          title={i18n.t('Operation').toString()}
          dataIndex="actions"
          width="20%"
          cell={renderActions as any}
        />
      </Table>

      {/* API Create/Edit Dialog */}
      <ApiForm
        visible={formVisible}
        systemId={systemId}
        editData={editingApi}
        onClose={() => setFormVisible(false)}
        onSuccess={fetchApis}
      />
    </div>
  );
};

export default ApiList;
