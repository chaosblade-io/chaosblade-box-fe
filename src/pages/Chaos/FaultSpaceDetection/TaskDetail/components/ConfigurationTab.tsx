import React, { FC, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import {
  Icon,
  Tag,
  Collapse,
  Button,
  Message,
} from '@alicloud/console-components';

import TaskTopologyViewer from './TaskTopologyViewer';
import ReadOnlyServiceTopology from './ReadOnlyServiceTopology';
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
  data: ConfigurationData & {
    topologyNodes?: any[];
    topologyEdges?: any[];
    faultConfigs?: any[];
  };
}

const ConfigurationTab: FC<ConfigurationTabProps> = ({ data }) => {
  const [ selectedNodeId, setSelectedNodeId ] = useState<string | number | null>(
    null,
  );
  const selectedFaults = (data.faultConfigs || []).filter(
    (fc: any) => String(fc.nodeId) === String(selectedNodeId),
  );
  const [ expandedFaultServices, setExpandedFaultServices ] = useState<string[]>(
    [],
  );

  const toggleFaultService = (serviceId: string) => {
    setExpandedFaultServices(prev =>
      (prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [ ...prev, serviceId ]),
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

  const renderConfigRow = (
    label: string,
    value: React.ReactNode,
    isCode = false,
    isJson = false,
  ) => (
    <div className={styles.configRow}>
      <div className={styles.configLabel}>{label}:</div>
      <div
        className={`${styles.configValue} ${isCode ? styles.code : ''} ${
          isJson ? styles.json : ''
        }`}
      >
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
        {renderConfigRow(
          i18n.t('Target System').toString(),
          data.targetSystem.systemName,
        )}
        {renderConfigRow(
          i18n.t('Environment').toString(),
          data.targetSystem.environment,
        )}
        {renderConfigRow(
          i18n.t('Last Sync').toString(),
          formatDate(data.targetSystem.apiSource.syncTime),
        )}
        {renderConfigRow(
          i18n.t('Selected API').toString(),
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color="#1890ff" style={{ fontWeight: 600 }}>
              {data.targetSystem.selectedAPI?.method}
            </Tag>
            <code>{data.targetSystem.selectedAPI?.path}</code>
          </div>,
        )}
        {renderConfigRow(
          i18n.t('Operation ID').toString(),
          data.targetSystem.selectedAPI.operationId,
          true,
        )}
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
        {Object.keys(data.apiParameters.pathParams).length > 0
          ? renderConfigRow(
            i18n.t('Path Parameters').toString(),
            <div>
              {Object.entries(data.apiParameters.pathParams).map(
                ([ key, value ]) => (
                  <div key={key} style={{ marginBottom: 4 }}>
                    <code>{key}</code>: {value}
                  </div>
                ),
              )}
            </div>,
          )
          : renderConfigRow(
            i18n.t('Path Parameters').toString(),
            <em style={{ color: '#999' }}>None</em>,
          )}

        {/* Query Parameters */}
        {Object.keys(data.apiParameters.queryParams).length > 0
          ? renderConfigRow(
            i18n.t('Query Parameters').toString(),
            <div>
              {Object.entries(data.apiParameters.queryParams).map(
                ([ key, values ]) => (
                  <div key={key} style={{ marginBottom: 4 }}>
                    <code>{key}</code>: {values.join(', ')}
                  </div>
                ),
              )}
            </div>,
          )
          : renderConfigRow(
            i18n.t('Query Parameters').toString(),
            <em style={{ color: '#999' }}>None</em>,
          )}

        {/* Authentication */}
        {renderConfigRow(
          i18n.t('Authentication Type').toString(),
          data.apiParameters.headers.authType,
        )}

        {/* Custom Headers */}
        {Object.keys(data.apiParameters.headers.customHeaders).length > 0
          ? renderConfigRow(
            i18n.t('Custom Headers').toString(),
            <div>
              {Object.entries(data.apiParameters.headers.customHeaders).map(
                ([ key, value ]) => (
                  <div key={key} style={{ marginBottom: 4 }}>
                    <code>{key}</code>: {value}
                  </div>
                ),
              )}
            </div>,
          )
          : renderConfigRow(
            i18n.t('Custom Headers').toString(),
            <em style={{ color: '#999' }}>None</em>,
          )}

        {/* Request Body */}
        {data.apiParameters.requestBody
          ? renderConfigRow(
            i18n.t('Request Body').toString(),
            data.apiParameters.requestBody,
            false,
            true,
          )
          : renderConfigRow(
            i18n.t('Request Body').toString(),
            <em style={{ color: '#999' }}>None</em>,
          )}
      </div>
    </div>
  );

  const renderFaultConfigurationCard = () => (
    <div className={styles.configCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <Icon type="share-alt" />
          <Translation>Service Topology</Translation>
        </div>
      </div>
      <div className={styles.cardContent}>
        {/* 统一与 AddDetection 的视觉风格，提供平移缩放、层级布局、内联故障标识 */}
        <ReadOnlyServiceTopology
          nodes={
            data.topologyNodes ||
            (data as any)?.traceConfig?.baselineTrace?.nodes ||
            []
          }
          edges={
            data.topologyEdges ||
            (data as any)?.traceConfig?.baselineTrace?.edges ||
            []
          }
          faultConfigs={data.faultConfigs || []}
          showFaultIndicators={false}
          selectedNodeId={selectedNodeId}
          onSelectNode={id => setSelectedNodeId(id)}
          height={560}
        />
      </div>
      {/* Fault Configuration Panel (appears when node selected) */}
      /* eslint-disable indent, @typescript-eslint/indent */
      {selectedNodeId != null && (
        <div className={styles.configCard} style={{ marginTop: 16 }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Icon type="warning" />
              <Translation>Fault Configuration</Translation>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <a onClick={() => setSelectedNodeId(null)}>
                <Translation>Close</Translation>
              </a>
            </div>
          </div>
          <div className={styles.cardContent}>
            {selectedFaults.length === 0 ? (
              <em style={{ color: '#999' }}>
                <Translation>
                  No fault configurations for this service
                </Translation>
              </em>
            ) : (
              selectedFaults.map((fc: any, idx: number) => {
                const type =
                  fc?.type ||
                  fc?.faultscript?.spec?.experiments?.[0]?.action ||
                  fc?.faultscript?.spec?.experiments?.[0]?.target ||
                  '-';
                const matchers =
                  fc?.faultscript?.spec?.experiments?.[0]?.matchers || [];
                const params = matchers
                  .filter(
                    (m: any) =>
                      ![
                        'names',
                        'namespace',
                        'container-names',
                        'container_names',
                      ].includes(String(m?.name)),
                  )
                  .reduce((acc: any, m: any) => {
                    acc[String(m.name)] = Array.isArray(m.value)
                      ? m.value.join(',')
                      : String(m.value);
                    return acc;
                  }, {} as Record<string, string>);
                return (
                  <div
                    key={idx}
                    className={styles.faultTemplate}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div className={styles.faultInfo}>
                      <div className={styles.faultName}>{type}</div>
                      <div className={styles.faultParams}>
                        {Object.keys(params).length === 0 ? (
                          <span style={{ color: '#999' }}>
                            <Translation>No parameters</Translation>
                          </span>
                        ) : (
                          Object.entries(params).map(([ k, v ]) => (
                            <span key={k} style={{ marginRight: 12 }}>
                              {k}: {v as any}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {typeof fc?.enabled === 'boolean' && (
                        <div className={styles.enabledBadge}>
                          {fc.enabled ? (
                            <Translation>Enabled</Translation>
                          ) : (
                            <Translation>Disabled</Translation>
                          )}
                        </div>
                      )}
                      <Button
                        text
                        size="small"
                        onClick={() => {
                          try {
                            const text = JSON.stringify(
                              fc?.faultscript ?? {},
                              null,
                              2,
                            );
                            if (
                              navigator.clipboard &&
                              typeof navigator.clipboard.writeText ===
                                'function'
                            ) {
                              navigator.clipboard.writeText(text);
                            } else {
                              const ta = document.createElement('textarea');
                              ta.value = text;
                              document.body.appendChild(ta);
                              ta.select();
                              document.execCommand('copy');
                              document.body.removeChild(ta);
                            }
                            Message.success(
                              i18n.t('Copied fault script JSON').toString(),
                            );
                          } catch (e) {
                            Message.error(i18n.t('Copy failed').toString());
                          }
                        }}
                      >
                        <Translation>Copy Fault Script JSON</Translation>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
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
        {/* 仅保留性能目标 */}
        <div className={styles.sloSection}>
          <div className={styles.sloSectionTitle}>
            <Translation>Performance Targets</Translation>
          </div>
          <div className={styles.performanceGrid}>
            <div className={styles.performanceItem}>
              <div className={styles.performanceLabel}>P95 Limit</div>
              <div className={styles.performanceValue}>
                ≤ {data.sloConfig.performanceTargets.p95Limit}ms
              </div>
            </div>
            <div className={styles.performanceItem}>
              <div className={styles.performanceLabel}>P99 Limit</div>
              <div className={styles.performanceValue}>
                ≤ {data.sloConfig.performanceTargets.p99Limit}ms
              </div>
            </div>
            <div className={styles.performanceItem}>
              <div className={styles.performanceLabel}>Error Rate Limit</div>
              <div className={styles.performanceValue}>
                ≤ {data.sloConfig.performanceTargets.errorRateLimit}%
              </div>
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
        {renderConfigRow(
          i18n.t('Concurrency').toString(),
          data.executionConfig.concurrency,
        )}
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
