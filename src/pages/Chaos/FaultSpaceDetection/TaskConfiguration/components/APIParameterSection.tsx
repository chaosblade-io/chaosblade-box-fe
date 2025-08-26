import React, { FC, useState, useEffect } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { 
  Input, 
  Button, 
  Message, 
  Icon,
  Select,
  Tag,
  Dialog,
  Loading
} from '@alicloud/console-components';

interface APIParameterData {
  pathParams: Record<string, string>;
  queryParams: Record<string, string[]>;
  headers: {
    authType: 'TOKEN' | 'COOKIE' | 'PROFILE';
    customHeaders: Record<string, string>;
  };
  requestBody: string;
}

interface SelectedAPI {
  method: string;
  path: string;
  operationId: string;
}

interface APIParameterSectionProps {
  data: APIParameterData;
  selectedAPI: SelectedAPI | null;
  errors?: string[];
  onChange: (data: Partial<APIParameterData>) => void;
}

interface TraceResponse {
  correlationId: string;
  statusCode: number;
  duration: number;
  responseBody: any;
  traceId?: string;
}

const APIParameterSection: FC<APIParameterSectionProps> = ({ data, selectedAPI, errors, onChange }) => {
  const [pathParamSchema, setPathParamSchema] = useState<Record<string, any>>({});
  const [queryParamSchema, setQueryParamSchema] = useState<Record<string, any>>({});
  const [requestBodySchema, setRequestBodySchema] = useState<any>(null);
  const [isExecutingBaseline, setIsExecutingBaseline] = useState(false);
  const [baselineResponse, setBaselineResponse] = useState<TraceResponse | null>(null);
  const [responsePreviewVisible, setResponsePreviewVisible] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  useEffect(() => {
    if (selectedAPI) {
      loadAPISchema();
      // Only reset form data if it's empty or different API
      if (!data.pathParams || Object.keys(data.pathParams).length === 0) {
        resetFormData();
      }
    }
  }, [selectedAPI?.operationId]); // Only trigger when API actually changes

  const loadAPISchema = async () => {
    if (!selectedAPI) return;

    try {
      // TODO: Replace with actual API call to get OpenAPI schema
      const mockSchema = {
        pathParams: extractPathParams(selectedAPI.path),
        queryParams: {
          // Query parameters removed as requested
        },
        requestBody: selectedAPI.method === 'POST' || selectedAPI.method === 'PUT' ? {
          type: 'object',
          properties: {
            name: { type: 'string', description: '名称' },
            email: { type: 'string', format: 'email', description: '邮箱地址' },
            age: { type: 'integer', minimum: 0, description: '年龄' },
          },
          required: ['name', 'email'],
        } : null,
      };

      setPathParamSchema(mockSchema.pathParams);
      setQueryParamSchema(mockSchema.queryParams);
      setRequestBodySchema(mockSchema.requestBody);
    } catch (error) {
      console.error('Failed to load API schema:', error);
      Message.error(i18n.t('Failed to load API schema').toString());
    }
  };

  const extractPathParams = (path: string): Record<string, any> => {
    const params: Record<string, any> = {};
    const matches = path.match(/\{([^}]+)\}/g);
    
    if (matches) {
      matches.forEach(match => {
        const paramName = match.slice(1, -1);
        params[paramName] = {
          type: 'string',
          description: `Path parameter: ${paramName}`,
          required: true,
        };
      });
    }
    
    return params;
  };

  const resetFormData = () => {
    onChange({
      pathParams: {},
      queryParams: {},
      headers: {
        authType: 'TOKEN',
        customHeaders: {},
      },
      requestBody: requestBodySchema ? JSON.stringify({
        name: 'example',
        email: 'user@example.com',
        age: 25,
      }, null, 2) : '',
    });
  };

  const handlePathParamChange = (paramName: string, value: string) => {
    onChange({
      pathParams: {
        ...data.pathParams,
        [paramName]: value,
      },
    });
  };

  const handleQueryParamChange = (paramName: string, values: string[]) => {
    onChange({
      queryParams: {
        ...data.queryParams,
        [paramName]: values,
      },
    });
  };

  const handleAddCustomHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderValue.trim()) {
      Message.warning(i18n.t('Please enter both header key and value').toString());
      return;
    }

    onChange({
      headers: {
        ...data.headers,
        customHeaders: {
          ...data.headers.customHeaders,
          [newHeaderKey]: newHeaderValue,
        },
      },
    });

    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const handleRemoveCustomHeader = (headerKey: string) => {
    const { [headerKey]: removed, ...remainingHeaders } = data.headers.customHeaders;
    onChange({
      headers: {
        ...data.headers,
        customHeaders: remainingHeaders,
      },
    });
  };

  const handleSendBaseline = async () => {
    setIsExecutingBaseline(true);
    try {
      // Validate required path parameters
      const missingParams = Object.keys(pathParamSchema).filter(
        param => pathParamSchema[param].required && !data.pathParams[param]
      );

      if (missingParams.length > 0) {
        Message.error(i18n.t('Please fill in all required path parameters').toString());
        return;
      }

      // TODO: Replace with actual API call
      const correlationId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse: TraceResponse = {
        correlationId,
        statusCode: 200,
        duration: 156,
        responseBody: {
          success: true,
          data: {
            id: '12345',
            name: data.pathParams.userId || 'example-user',
            email: 'user@example.com',
            createdAt: new Date().toISOString(),
          },
        },
        traceId: `trace_${correlationId}`,
      };

      setBaselineResponse(mockResponse);
      Message.success(i18n.t('Baseline request executed successfully').toString());
      
      // Auto-fetch trace after successful request
      setTimeout(() => {
        fetchTrace(mockResponse.traceId!);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to execute baseline request:', error);
      Message.error(i18n.t('Failed to execute baseline request').toString());
    } finally {
      setIsExecutingBaseline(false);
    }
  };

  const fetchTrace = async (traceId: string) => {
    try {
      // TODO: Replace with actual trace fetching logic
      Message.success(i18n.t('Trace data fetched successfully').toString());
    } catch (error) {
      console.error('Failed to fetch trace:', error);
      Message.warning(i18n.t('Failed to fetch trace data, please try increasing sampling rate').toString());
    }
  };

  const renderPathParameters = () => {
    const pathParams = Object.keys(pathParamSchema);
    
    if (pathParams.length === 0) {
      return (
        <div style={{ color: '#999', fontStyle: 'italic', padding: '20px 0' }}>
          <Translation>No path parameters required for this API</Translation>
        </div>
      );
    }

    return (
      <div>
        {pathParams.map(paramName => (
          <div key={paramName} className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={`${styles.fieldLabel} ${pathParamSchema[paramName].required ? styles.required : ''}`}>
                {paramName}
              </label>
              <Input
                value={data.pathParams[paramName] || ''}
                onChange={(value) => handlePathParamChange(paramName, value)}
                placeholder={pathParamSchema[paramName].description || `Enter ${paramName}`}
                style={{ width: '100%' }}
              />
              {pathParamSchema[paramName].description && (
                <div className={styles.fieldDescription}>
                  {pathParamSchema[paramName].description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderQueryParameters = () => {
    const queryParams = Object.keys(queryParamSchema);
    
    if (queryParams.length === 0) {
      return (
        <div style={{ color: '#999', fontStyle: 'italic', padding: '20px 0' }}>
          <Translation>No query parameters available for this API</Translation>
        </div>
      );
    }

    return (
      <div>
        {queryParams.map(paramName => (
          <div key={paramName} className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>
                {paramName}
              </label>
              <Select
                mode="tag"
                value={data.queryParams[paramName] || []}
                onChange={(values) => handleQueryParamChange(paramName, values)}
                placeholder={queryParamSchema[paramName].description || `Enter ${paramName} values`}
                style={{ width: '100%' }}
                hasClear
              />
              {queryParamSchema[paramName].description && (
                <div className={styles.fieldDescription}>
                  {queryParamSchema[paramName].description}
                  {queryParamSchema[paramName].default && (
                    <span> (默认值: {queryParamSchema[paramName].default})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestHeaders = () => (
    <div>
      {/* Authentication Type */}
      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <label className={styles.fieldLabel}>
            <Translation>Authentication Type</Translation>
          </label>
          <Select
            value={data.headers.authType}
            onChange={(value) => onChange({
              headers: { ...data.headers, authType: value as any }
            })}
            style={{ width: '100%' }}
          >
            <Select.Option value="TOKEN">Token Authentication</Select.Option>
            <Select.Option value="COOKIE">Cookie Authentication</Select.Option>
            <Select.Option value="PROFILE">Profile Authentication</Select.Option>
          </Select>
          <div className={styles.fieldDescription}>
            <Translation>Choose the authentication method for API requests</Translation>
          </div>
        </div>
      </div>

      {/* Custom Headers */}
      <div style={{ marginTop: 20 }}>
        <label className={styles.fieldLabel}>
          <Translation>Custom Headers</Translation>
        </label>
        
        {/* Existing Headers */}
        {Object.keys(data.headers.customHeaders).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {Object.entries(data.headers.customHeaders).map(([key, value]) => (
              <div key={key} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 8,
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 4,
              }}>
                <code style={{ flex: 1, fontSize: 12 }}>
                  {key}: {value}
                </code>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => handleRemoveCustomHeader(key)}
                >
                  <Icon type="delete" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Header */}
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <Input
              placeholder={i18n.t('Header key').toString()}
              value={newHeaderKey}
              onChange={setNewHeaderKey}
              style={{ width: '100%' }}
            />
          </div>
          <div className={styles.formCol}>
            <Input
              placeholder={i18n.t('Header value').toString()}
              value={newHeaderValue}
              onChange={setNewHeaderValue}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ width: 100 }}>
            <Button onClick={handleAddCustomHeader} style={{ width: '100%' }}>
              <Translation>Add</Translation>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!selectedAPI) {
    return (
      <div>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>2</span>
              <Translation>API Parameter Configuration & Baseline Request</Translation>
            </div>
            <div className={styles.sectionDescription}>
              <Translation>Please select an API in the previous section first</Translation>
            </div>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: '#fafafa', 
          borderRadius: 6,
          color: '#999'
        }}>
          <Icon type="loading" size="large" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16 }}>
            <Translation>Waiting for API selection</Translation>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>2</span>
            <Translation>API Parameter Configuration & Baseline Request</Translation>
          </div>
          <div className={styles.sectionDescription}>
            <Translation>Configure API parameters and execute baseline request to establish trace data</Translation>
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

      {/* Selected API Info */}
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #bae7ff', 
        borderRadius: 6, 
        padding: 16, 
        marginBottom: 24 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon type="api" style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 600, color: '#333' }}>
            <Translation>Configuring API</Translation>:
          </span>
          <Tag color="#1890ff" style={{ fontWeight: 600 }}>
            {selectedAPI.method}
          </Tag>
          <code style={{ background: '#fff', padding: '4px 8px', borderRadius: 3 }}>
            {selectedAPI.path}
          </code>
        </div>
      </div>

      {/* Path Parameters */}
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
          <Translation>Path Parameters</Translation>
        </h4>
        {renderPathParameters()}
      </div>

      {/* Query Parameters */}
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
          <Translation>Query Parameters</Translation>
        </h4>
        {renderQueryParameters()}
      </div>

      {/* Request Headers */}
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
          <Translation>Request Headers</Translation>
        </h4>
        {renderRequestHeaders()}
      </div>

      {/* Request Body */}
      {requestBodySchema && (
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 16 }}>
            <Translation>Request Body</Translation>
          </h4>
          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>
                <Translation>JSON Body</Translation>
              </label>
              <Input.TextArea
                value={data.requestBody}
                onChange={(value) => onChange({ requestBody: value })}
                placeholder={i18n.t('Enter JSON request body').toString()}
                rows={8}
                style={{ fontFamily: 'Monaco, Consolas, monospace', fontSize: 12 }}
              />
              <div className={styles.fieldDescription}>
                <Translation>Enter the JSON request body. Use the schema validation for guidance.</Translation>
              </div>
            </div>
          </div>

          {/* JSON Validation */}
          {data.requestBody && (
            <div style={{ marginTop: 12 }}>
              {(() => {
                try {
                  JSON.parse(data.requestBody);
                  return (
                    <div style={{ color: '#52c41a', fontSize: 12 }}>
                      <Icon type="check-circle" size="xs" style={{ marginRight: 4 }} />
                      <Translation>Valid JSON format</Translation>
                    </div>
                  );
                } catch (error) {
                  return (
                    <div style={{ color: '#ff4d4f', fontSize: 12 }}>
                      <Icon type="exclamation-circle" size="xs" style={{ marginRight: 4 }} />
                      <Translation>Invalid JSON format</Translation>: {(error as Error).message}
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
      )}

      {/* Baseline Request Execution */}
      <div style={{
        background: '#f9f9f9',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 4 }}>
              <Translation>Baseline Request Execution</Translation>
            </h4>
            <div style={{ fontSize: 14, color: '#666' }}>
              <Translation>Execute the configured request to establish baseline performance and generate trace data</Translation>
            </div>
          </div>
          <Button
            type="primary"
            onClick={handleSendBaseline}
            loading={isExecutingBaseline}
            disabled={!selectedAPI}
          >
            <Icon type="play" />
            <Translation>Send & Trace</Translation>
          </Button>
        </div>

        {/* Baseline Response Display */}
        {baselineResponse && (
          <div style={{
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            padding: 16,
            marginTop: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h5 style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: 0 }}>
                <Translation>Response Summary</Translation>
              </h5>
              <Button
                type="link"
                size="small"
                onClick={() => setResponsePreviewVisible(true)}
              >
                <Translation>View Response Preview</Translation>
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <Translation>Status Code</Translation>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: baselineResponse.statusCode >= 200 && baselineResponse.statusCode < 300 ? '#52c41a' : '#ff4d4f'
                }}>
                  {baselineResponse.statusCode}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <Translation>Duration</Translation>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#333' }}>
                  {baselineResponse.duration}ms
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <Translation>Correlation ID</Translation>
                </div>
                <div style={{ fontSize: 12, fontFamily: 'Monaco, Consolas, monospace', color: '#333' }}>
                  {baselineResponse.correlationId}
                </div>
              </div>
              {baselineResponse.traceId && (
                <div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <Translation>Trace ID</Translation>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'Monaco, Consolas, monospace', color: '#1890ff' }}>
                    {baselineResponse.traceId}
                  </div>
                </div>
              )}
            </div>

            {baselineResponse.traceId && (
              <div style={{
                marginTop: 12,
                padding: 12,
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: 4
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon type="check-circle" style={{ color: '#52c41a' }} />
                  <span style={{ color: '#52c41a', fontWeight: 500 }}>
                    <Translation>Trace data acquired successfully</Translation>
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  <Translation>You can now proceed to configure fault injection in the next section</Translation>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isExecutingBaseline && (
          <div style={{
            textAlign: 'center',
            padding: '20px 0',
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            marginTop: 16
          }}>
            <Loading tip={i18n.t('Executing baseline request and fetching trace data...').toString()}>
              <div style={{ height: 60 }} />
            </Loading>
          </div>
        )}
      </div>

      {/* Response Preview Dialog */}
      <Dialog
        visible={responsePreviewVisible}
        title={i18n.t('Response Preview').toString()}
        onClose={() => setResponsePreviewVisible(false)}
        onCancel={() => setResponsePreviewVisible(false)}
        footer={
          <Button onClick={() => setResponsePreviewVisible(false)}>
            <Translation>Close</Translation>
          </Button>
        }
        style={{ width: 800 }}
      >
        {baselineResponse && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                <Translation>Response Body</Translation>
              </h4>
              <pre style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'Monaco, Consolas, monospace',
                maxHeight: 400,
                overflow: 'auto'
              }}>
                {JSON.stringify(baselineResponse.responseBody, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default APIParameterSection;
