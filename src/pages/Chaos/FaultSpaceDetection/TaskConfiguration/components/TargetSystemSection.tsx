import React, { FC, useState, useEffect } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import {
  Select,
  Input,
  Button,
  Message,
  Icon,
  Table,
  Search,
  Tag,
} from '@alicloud/console-components';

interface TargetSystemData {
  systemId: string;
  environment: string;
  apiSource: {
    syncTime: string;
  };
  selectedAPI: {
    method: string;
    path: string;
    operationId: string;
  } | null;
}

interface APIItem {
  operationId: string;
  method: string;
  path: string;
  summary: string;
  tags: string[];
  deprecated?: boolean;
}

interface TargetSystemSectionProps {
  data: TargetSystemData;
  errors?: string[];
  onChange: (data: Partial<TargetSystemData>) => void;
}

const TargetSystemSection: FC<TargetSystemSectionProps> = ({ data, errors, onChange }) => {
  const [ availableSystems, setAvailableSystems ] = useState<Array<{ id: string; name: string; environment: string }>>([]);
  const [ availableAPIs, setAvailableAPIs ] = useState<APIItem[]>([]);
  const [ filteredAPIs, setFilteredAPIs ] = useState<APIItem[]>([]);
  const [ apiSearchKey, setApiSearchKey ] = useState('');
  const [ selectedMethodFilter, setSelectedMethodFilter ] = useState<string[]>([]);
  const [ selectedTagFilter, setSelectedTagFilter ] = useState<string[]>([]);
  const [ isRefreshingAPIs, setIsRefreshingAPIs ] = useState(false);

  useEffect(() => {
    // Load available systems
    loadAvailableSystems();
  }, []);

  useEffect(() => {
    // Load APIs when system is selected
    if (data.systemId) {
      loadAvailableAPIs(data.systemId);
    }
  }, [ data.systemId ]);

  useEffect(() => {
    // Filter APIs based on search and filters
    filterAPIs();
  }, [ availableAPIs, apiSearchKey, selectedMethodFilter, selectedTagFilter ]);

  const loadAvailableSystems = async () => {
    try {
      // TODO: Replace with actual API call
      const mockSystems = [
        { id: 'user-service', name: '用户中心', environment: '生产环境' },
        { id: 'order-service', name: '订单系统', environment: '测试环境' },
        { id: 'payment-service', name: '支付系统', environment: '生产环境' },
        { id: 'inventory-service', name: '库存系统', environment: '开发环境' },
      ];
      setAvailableSystems(mockSystems);
    } catch (error) {
      console.error('Failed to load systems:', error);
      Message.error(i18n.t('Failed to load available systems').toString());
    }
  };

  const loadAvailableAPIs = async (systemId: string) => {
    try {
      // TODO: Replace with actual API call
      const mockAPIs: APIItem[] = [
        {
          operationId: 'loginUser',
          method: 'POST',
          path: '/api/v1/auth/login',
          summary: '用户登录',
          tags: [ '认证', '用户' ],
        },
        {
          operationId: 'getUserProfile',
          method: 'GET',
          path: '/api/v1/users/{userId}',
          summary: '获取用户信息',
          tags: [ '用户' ],
        },
        {
          operationId: 'updateUserProfile',
          method: 'PUT',
          path: '/api/v1/users/{userId}',
          summary: '更新用户信息',
          tags: [ '用户' ],
        },
        {
          operationId: 'createOrder',
          method: 'POST',
          path: '/api/v1/orders',
          summary: '创建订单',
          tags: [ '订单' ],
        },
        {
          operationId: 'getOrderDetails',
          method: 'GET',
          path: '/api/v1/orders/{orderId}',
          summary: '获取订单详情',
          tags: [ '订单' ],
        },
        {
          operationId: 'processPayment',
          method: 'POST',
          path: '/api/v1/payments/process',
          summary: '处理支付',
          tags: [ '支付' ],
        },
      ];

      setAvailableAPIs(mockAPIs);

      // Update API source info
      onChange({
        apiSource: {
          syncTime: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to load APIs:', error);
      Message.error(i18n.t('Failed to load APIs').toString());
    }
  };

  const filterAPIs = () => {
    let filtered = availableAPIs;

    // Search filter
    if (apiSearchKey) {
      const searchLower = apiSearchKey.toLowerCase();
      filtered = filtered.filter(api =>
        api.path.toLowerCase().includes(searchLower) ||
        api.summary.toLowerCase().includes(searchLower) ||
        api.operationId.toLowerCase().includes(searchLower),
      );
    }

    // Method filter
    if (selectedMethodFilter.length > 0) {
      filtered = filtered.filter(api => selectedMethodFilter.includes(api.method));
    }

    // Tag filter
    if (selectedTagFilter.length > 0) {
      filtered = filtered.filter(api =>
        api.tags.some(tag => selectedTagFilter.includes(tag)),
      );
    }

    setFilteredAPIs(filtered);
  };

  const handleSystemChange = (systemId: string) => {
    const selectedSystem = availableSystems.find(s => s.id === systemId);
    if (selectedSystem) {
      onChange({
        systemId,
        environment: selectedSystem.environment,
        selectedAPI: null, // Reset API selection when system changes
      });
    }
  };

  const handleAPISelection = (api: APIItem) => {
    onChange({
      selectedAPI: {
        method: api.method,
        path: api.path,
        operationId: api.operationId,
      },
    });
  };

  const handleRefreshAPIs = async () => {
    if (!data.systemId) return;

    setIsRefreshingAPIs(true);
    try {
      await loadAvailableAPIs(data.systemId);
      Message.success(i18n.t('API list refreshed successfully').toString());
    } catch (error) {
      Message.error(i18n.t('Failed to refresh API list').toString());
    } finally {
      setIsRefreshingAPIs(false);
    }
  };

  const renderMethodTag = (method: string) => {
    const methodColors: Record<string, string> = {
      GET: '#52c41a',
      POST: '#1890ff',
      PUT: '#faad14',
      DELETE: '#ff4d4f',
      PATCH: '#722ed1',
    };

    return (
      <Tag
        color={methodColors[method] || '#666'}
        size="small"
        style={{ fontWeight: 600, minWidth: 50, textAlign: 'center' }}
      >
        {method}
      </Tag>
    );
  };

  const renderAPITable = () => {
    const columns = [
      {
        title: i18n.t('Method').toString(),
        dataIndex: 'method',
        width: 80,
        cell: (value: string) => renderMethodTag(value),
      },
      {
        title: i18n.t('Path').toString(),
        dataIndex: 'path',
        width: '40%',
        cell: (value: string) => (
          <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>
            {value}
          </code>
        ),
      },
      {
        title: i18n.t('Summary').toString(),
        dataIndex: 'summary',
        width: '30%',
      },
      {
        title: i18n.t('Tags').toString(),
        dataIndex: 'tags',
        width: '20%',
        cell: (tags: string[]) => (
          <div>
            {tags.map(tag => (
              <Tag key={tag} size="small" style={{ margin: '2px' }}>
                {tag}
              </Tag>
            ))}
          </div>
        ),
      },
      {
        title: i18n.t('Action').toString(),
        width: 80,
        cell: (value: any, index: number, record: APIItem) => (
          <Button
            type="primary"
            size="small"
            onClick={() => handleAPISelection(record)}
            disabled={data.selectedAPI?.operationId === record.operationId}
          >
            {data.selectedAPI?.operationId === record.operationId ?
              <Translation>Selected</Translation> :
              <Translation>Select</Translation>
            }
          </Button>
        ),
      },
    ];

    return (
      <Table
        dataSource={filteredAPIs}
        columns={columns}
        size="small"
        hasBorder={false}
        rowProps={(record: APIItem) => ({
          className: data.selectedAPI?.operationId === record.operationId ? styles.selectedRow : '',
        })}
        emptyContent={
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            {apiSearchKey || selectedMethodFilter.length > 0 || selectedTagFilter.length > 0 ?
              <Translation>No APIs match the current filters</Translation> :
              <Translation>No APIs available</Translation>
            }
          </div>
        }
      />
    );
  };

  // Get unique methods and tags for filters
  const uniqueMethods = Array.from(new Set(availableAPIs.map(api => api.method)));
  const uniqueTags = Array.from(new Set(availableAPIs.flatMap(api => api.tags)));

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>1</span>
            <Translation>Target System Selection & API Discovery</Translation>
          </div>
          <div className={styles.sectionDescription}>
            <Translation>Select the target system and choose the API endpoint for fault injection testing</Translation>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors && errors.length > 0 && (
        <div className={styles.errorList}>
          {errors.map((error, index) => (
            <div key={index} className={styles.errorItem}>
              <Icon type="exclamation-circle" size="xs" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Target System Selection */}
      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <label className={`${styles.fieldLabel} ${styles.required}`}>
            <Translation>Target System</Translation>
          </label>
          <Select
            placeholder={i18n.t('Select target system').toString()}
            value={data.systemId}
            onChange={handleSystemChange}
            showSearch
            style={{ width: '100%' }}
            dataSource={availableSystems.map(system => ({
              label: system.name,
              value: system.id,
            }))}
          />
          <div className={styles.fieldDescription}>
            <Translation>Choose the system where fault injection will be performed</Translation>
          </div>
        </div>

        <div className={styles.formCol}>
          <label className={styles.fieldLabel}>
            <Translation>Environment</Translation>
          </label>
          <Input
            value={data.environment}
            readOnly
            placeholder={i18n.t('Auto-populated based on system').toString()}
            style={{ width: '100%' }}
          />
          <div className={styles.fieldDescription}>
            <Translation>Environment is automatically determined by the selected system</Translation>
          </div>
        </div>
      </div>

      {/* OpenAPI Source Information */}
      {data.systemId && (
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.fieldLabel}>
              <Translation>OpenAPI Source</Translation>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <Translation>Last Sync</Translation>: {data.apiSource.syncTime ?
                    new Date(data.apiSource.syncTime).toLocaleString() : 'N/A'}
                </div>
              </div>
              <Button
                onClick={handleRefreshAPIs}
                loading={isRefreshingAPIs}
                disabled={!data.systemId}
              >
                <Icon type="refresh" />
                <Translation>Refresh API List</Translation>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Selection */}
      {data.systemId && availableAPIs.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 8 }}>
              <Translation>API Selection</Translation>
              <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
            </h4>
            <div style={{ fontSize: 14, color: '#666' }}>
              <Translation>Choose the API endpoint that will be tested for fault tolerance</Translation>
            </div>
          </div>

          {/* API Filters */}
          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <Search
                placeholder={i18n.t('Search by path, summary, or operation ID').toString()}
                value={apiSearchKey}
                onChange={setApiSearchKey}
                style={{ width: '100%' }}
                hasClear
              />
            </div>
            <div className={styles.formCol}>
              <Select
                mode="multiple"
                placeholder={i18n.t('Filter by method').toString()}
                value={selectedMethodFilter}
                onChange={setSelectedMethodFilter}
                style={{ width: '100%' }}
                hasClear
                dataSource={uniqueMethods.map(method => ({
                  label: method,
                  value: method,
                }))}
              />
            </div>
            <div className={styles.formCol}>
              <Select
                mode="multiple"
                placeholder={i18n.t('Filter by tags').toString()}
                value={selectedTagFilter}
                onChange={setSelectedTagFilter}
                style={{ width: '100%' }}
                hasClear
                dataSource={uniqueTags.map(tag => ({
                  label: tag,
                  value: tag,
                }))}
              />
            </div>
          </div>

          {/* Selected API Display */}
          {data.selectedAPI && (
            <div style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 6,
              padding: 16,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon type="check-circle" style={{ color: '#52c41a' }} />
                <span style={{ fontWeight: 600, color: '#333' }}>
                  <Translation>Selected API</Translation>:
                </span>
                {renderMethodTag(data.selectedAPI.method)}
                <code style={{ background: '#fff', padding: '4px 8px', borderRadius: 3 }}>
                  {data.selectedAPI.path}
                </code>
              </div>
            </div>
          )}

          {/* API Table */}
          <div style={{ border: '1px solid #e8e8e8', borderRadius: 6 }}>
            {renderAPITable()}
          </div>

          {/* API Statistics */}
          <div style={{
            marginTop: 12,
            fontSize: 12,
            color: '#666',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>
              <Translation>Showing</Translation> {filteredAPIs.length} <Translation>of</Translation> {availableAPIs.length} <Translation>APIs</Translation>
            </span>
            {data.selectedAPI && (
              <span style={{ color: '#52c41a', fontWeight: 500 }}>
                <Translation>API selected successfully</Translation>
              </span>
            )}
          </div>
        </div>
      )}

      {/* No APIs Available Message */}
      {data.systemId && availableAPIs.length === 0 && !isRefreshingAPIs && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#fafafa',
          borderRadius: 6,
          marginTop: 20,
        }}>
          <Icon type="inbox" size="large" style={{ color: '#ccc', marginBottom: 16 }} />
          <div style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
            <Translation>No APIs Available</Translation>
          </div>
          <div style={{ fontSize: 14, color: '#999', marginBottom: 16 }}>
            <Translation>No API definitions found for the selected system</Translation>
          </div>
          <Button type="primary" onClick={handleRefreshAPIs}>
            <Icon type="refresh" />
            <Translation>Refresh API List</Translation>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TargetSystemSection;
