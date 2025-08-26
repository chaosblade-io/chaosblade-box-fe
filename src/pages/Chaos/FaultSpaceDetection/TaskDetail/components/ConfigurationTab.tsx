import React, { FC, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { Icon, Tag, Collapse } from '@alicloud/console-components';

const { Panel } = Collapse;

interface ConfigurationData {
  targetSystem: {
    systemId: string;
    systemName: string;
    environment: string;
    apiSource: {
      syncTime: string;
    };
    selectedAPI: {
      method: string;
      path: string;
      operationId: string;
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
    baselineTrace: any;
    faultConfigurations: Array<{
      serviceId: string;
      serviceName: string;
      layer: number;
      faultTemplates: Array<{
        type: string;
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
        operator: 'exists' | 'equals' | 'contains' | 'regex' | 'not_exists';
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
    concurrency: number;
  };
}

interface ConfigurationTabProps {
  data: ConfigurationData;
}

const ConfigurationTab: FC<ConfigurationTabProps> = ({ data }) => {
  const [expandedFaultServices, setExpandedFaultServices] = useState<string[]>([]);

  const toggleFaultService = (serviceId: string) => {
    setExpandedFaultServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusCodeClass = (code: number) => {
    if (code >= 200 && code < 300) return styles.statusCode2xx;
    if (code >= 300 && code < 400) return styles.statusCode3xx;
    if (code >= 400 && code < 500) return styles.statusCode4xx;
    if (code >= 500) return styles.statusCode5xx;
    return '';
  };



  const renderConfigRow = (label: string, value: React.ReactNode, isCode = false, isJson = false) => (
    <div className={styles.configRow}>
      <div className={styles.configLabel}>{label}:</div>
      <div className={`${styles.configValue} ${isCode ? styles.code : ''} ${isJson ? styles.json : ''}`}>
        {value}
      </div>
    </div>
  );

  const renderSystemEnvironmentCard = () => (
    <div className={styles.configCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Icon type="desktop" />
          <Translation>System & Environment</Translation>
        </div>
      </div>
      <div className={styles.cardContent}>
        {renderConfigRow(i18n.t('Target System').toString(), data.targetSystem.systemName)}
        {renderConfigRow(i18n.t('Environment').toString(), data.targetSystem.environment)}
        {renderConfigRow(i18n.t('Last Sync').toString(), formatDate(data.targetSystem.apiSource.syncTime))}
        {renderConfigRow(i18n.t('Selected API').toString(), (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="#1890ff" style={{ fontWeight: 600 }}>
              {data.targetSystem.selectedAPI.method}
            </Tag>
            <code>{data.targetSystem.selectedAPI.path}</code>
          </div>
        ))}
        {renderConfigRow(i18n.t('Operation ID').toString(), data.targetSystem.selectedAPI.operationId, true)}
      </div>
    </div>
  );

  const renderAPIParametersCard = () => (
    <div className={styles.configCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Icon type="api" />
          <Translation>API Parameters</Translation>
        </div>
      </div>
      <div className={styles.cardContent}>
        {/* Path Parameters */}
        {Object.keys(data.apiParameters.pathParams).length > 0 ? (
          renderConfigRow(i18n.t('Path Parameters').toString(), (
            <div>
              {Object.entries(data.apiParameters.pathParams).map(([key, value]) => (
                <div key={key} style={{ marginBottom: 4 }}>
                  <code>{key}</code>: {value}
                </div>
              ))}
            </div>
          ))
        ) : (
          renderConfigRow(i18n.t('Path Parameters').toString(), <em style={{ color: '#999' }}>None</em>)
        )}

        {/* Query Parameters */}
        {Object.keys(data.apiParameters.queryParams).length > 0 ? (
          renderConfigRow(i18n.t('Query Parameters').toString(), (
            <div>
              {Object.entries(data.apiParameters.queryParams).map(([key, values]) => (
                <div key={key} style={{ marginBottom: 4 }}>
                  <code>{key}</code>: {values.join(', ')}
                </div>
              ))}
            </div>
          ))
        ) : (
          renderConfigRow(i18n.t('Query Parameters').toString(), <em style={{ color: '#999' }}>None</em>)
        )}

        {/* Authentication */}
        {renderConfigRow(i18n.t('Authentication Type').toString(), data.apiParameters.headers.authType)}

        {/* Custom Headers */}
        {Object.keys(data.apiParameters.headers.customHeaders).length > 0 ? (
          renderConfigRow(i18n.t('Custom Headers').toString(), (
            <div>
              {Object.entries(data.apiParameters.headers.customHeaders).map(([key, value]) => (
                <div key={key} style={{ marginBottom: 4 }}>
                  <code>{key}</code>: {value}
                </div>
              ))}
            </div>
          ))
        ) : (
          renderConfigRow(i18n.t('Custom Headers').toString(), <em style={{ color: '#999' }}>None</em>)
        )}

        {/* Request Body */}
        {data.apiParameters.requestBody ? (
          renderConfigRow(i18n.t('Request Body').toString(), data.apiParameters.requestBody, false, true)
        ) : (
          renderConfigRow(i18n.t('Request Body').toString(), <em style={{ color: '#999' }}>None</em>)
        )}
      </div>
    </div>
  );



  const renderFaultConfigurationCard = () => (
    <div className={styles.configCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Icon type="warning" />
          <Translation>Fault Configuration</Translation>
        </div>
      </div>
      <div className={styles.cardContent}>
        {data.traceConfig.faultConfigurations.length === 0 ? (
          <em style={{ color: '#999' }}>
            <Translation>No fault configurations defined</Translation>
          </em>
        ) : (
          data.traceConfig.faultConfigurations.map(service => (
            <div key={service.serviceId} className={styles.faultServiceCard}>
              <div 
                className={styles.faultServiceHeader}
                onClick={() => toggleFaultService(service.serviceId)}
              >
                <div className={styles.serviceInfo}>
                  <div className={styles.serviceName}>{service.serviceName}</div>
                  <div className={styles.serviceLayer}>Layer {service.layer}</div>
                </div>
                <Icon 
                  type={expandedFaultServices.includes(service.serviceId) ? 'arrow-up' : 'arrow-down'} 
                  size="xs" 
                />
              </div>
              
              {expandedFaultServices.includes(service.serviceId) && (
                <div className={styles.faultTemplates}>
                  {service.faultTemplates.filter(template => template.enabled).map((template, index) => (
                    <div key={index} className={styles.faultTemplate}>
                      <div className={styles.faultInfo}>
                        <div className={styles.faultName}>{template.type}</div>
                        <div className={styles.faultParams}>
                          {Object.entries(template.parameters).map(([key, value]) => (
                            <span key={key} style={{ marginRight: 12 }}>
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.enabledBadge}>
                        <Translation>Enabled</Translation>
                      </div>
                    </div>
                  ))}
                  
                  {service.faultTemplates.filter(template => template.enabled).length === 0 && (
                    <em style={{ color: '#999' }}>
                      <Translation>No fault templates enabled for this service</Translation>
                    </em>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSLOConfigurationCard = () => (
    <div className={styles.configCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Icon type="dashboard" />
          <Translation>SLO Configuration</Translation>
        </div>
      </div>
      <div className={styles.cardContent}>
        {/* Functional Assertions */}
        <div className={styles.sloSection}>
          <div className={styles.sloSectionTitle}>
            <Translation>Functional Assertions</Translation>
          </div>
          
          {/* Status Codes */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              <Translation>Expected Status Codes</Translation>:
            </div>
            <div className={styles.statusCodeList}>
              {data.sloConfig.functionalAssertions.statusCodes.map(code => (
                <span key={code} className={`${styles.statusCode} ${getStatusCodeClass(code)}`}>
                  {code}
                </span>
              ))}
            </div>
          </div>

          {/* JSONPath Assertions */}
          {data.sloConfig.functionalAssertions.jsonPathAssertions.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                <Translation>JSONPath Assertions</Translation>:
              </div>
              {data.sloConfig.functionalAssertions.jsonPathAssertions.map(assertion => (
                <div key={assertion.id} className={styles.jsonPathAssertion}>
                  <div className={styles.assertionPath}>
                    {assertion.path} {assertion.operator} {assertion.expectedValue}
                  </div>
                  <div className={styles.assertionDescription}>
                    {assertion.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Targets */}
        <div className={styles.sloSection}>
          <div className={styles.sloSectionTitle}>
            <Translation>Performance Targets</Translation>
          </div>
          <div className={styles.performanceGrid}>
            <div className={styles.performanceItem}>
              <div className={styles.performanceLabel}>P95 Limit</div>
              <div className={styles.performanceValue}>≤ {data.sloConfig.performanceTargets.p95Limit}ms</div>
            </div>
            <div className={styles.performanceItem}>
              <div className={styles.performanceLabel}>P99 Limit</div>
              <div className={styles.performanceValue}>≤ {data.sloConfig.performanceTargets.p99Limit}ms</div>
            </div>
            <div className={styles.performanceItem}>
              <div className={styles.performanceLabel}>Error Rate Limit</div>
              <div className={styles.performanceValue}>≤ {data.sloConfig.performanceTargets.errorRateLimit}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExecutionConfigurationCard = () => (
    <div className={styles.configCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Icon type="play" />
          <Translation>Execution Configuration</Translation>
        </div>
      </div>
      <div className={styles.cardContent}>
        {renderConfigRow(i18n.t('Concurrency').toString(), data.executionConfig.concurrency)}
      </div>
    </div>
  );

  return (
    <div>
      {renderSystemEnvironmentCard()}
      {renderAPIParametersCard()}
      {renderFaultConfigurationCard()}
      {renderSLOConfigurationCard()}
      {renderExecutionConfigurationCard()}
    </div>
  );
};

export default ConfigurationTab;
