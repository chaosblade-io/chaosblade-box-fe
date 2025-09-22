import React, { FC, useState, useEffect, useRef } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { Icon, Card, Button, Tag, Balloon } from '@alicloud/console-components';
import XFlowServiceChain from './XFlowServiceChain';

interface TestProgressMetrics {
  totalTestCases: number;
  completedTestCases: number;
  totalServices: number;
  completedServices: number;
  testingServices: number;
  sampleCount: number;
}

interface ServiceNode {
  id: string;
  name: string;
  layer: number;
  protocol: 'HTTP' | 'gRPC' | 'DB' | 'MQ';
  status: 'TESTED' | 'TESTING' | 'UNTESTED';
  x: number;
  y: number;
  testResults?: {
    faultScenarios: Array<{
      type: string;
      status: 'COMPLETED' | 'RUNNING' | 'PENDING';
      responseData?: any;
      latencyMetrics?: {
        p50: number;
        p95: number;
        p99: number;
      };
      errorRate?: number;
      performanceComparison?: {
        before: { p95: number; errorRate: number };
        during: { p95: number; errorRate: number };
        after: { p95: number; errorRate: number };
      };
    }>;
    currentFaultType?: string;
    remainingScenarios?: string[];
  };
  plannedFaults?: string[];
  dependencies?: string[];
}

interface AnomalyAlert {
  id: string;
  type: 'HIGH_LATENCY' | 'HIGH_ERROR_RATE' | 'LOW_THROUGHPUT';
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  threshold: number;
  actual: number;
  timestamp: string;
}

interface RealTimeStatusProps {
  testMetrics: TestProgressMetrics;
  status: string;
  currentStep: string;
}

const RealTimeStatus: FC<RealTimeStatusProps> = ({
  testMetrics,
  status,
  currentStep,
}) => {
  const [ serviceNodes, setServiceNodes ] = useState<ServiceNode[]>([]);
  const [ anomalies, setAnomalies ] = useState<AnomalyAlert[]>([]);
  const [ selectedService, setSelectedService ] = useState<ServiceNode | null>(null);
  const [ detailPanelVisible, setDetailPanelVisible ] = useState(false);

  useEffect(() => {
    // Generate mock service chain data
    const mockServices: ServiceNode[] = [
      // Layer 0 (Entry point)
      {
        id: 'api-gateway',
        name: 'API Gateway',
        layer: 0,
        protocol: 'HTTP',
        status: 'TESTED',
        x: 400,
        y: 50,
        testResults: {
          faultScenarios: [
            {
              type: 'Network Delay',
              status: 'COMPLETED',
              responseData: { statusCode: 200, responseTime: 156 },
              latencyMetrics: { p50: 45, p95: 156, p99: 234 },
              errorRate: 2.1,
              performanceComparison: {
                before: { p95: 89, errorRate: 0.5 },
                during: { p95: 156, errorRate: 2.1 },
                after: { p95: 92, errorRate: 0.6 },
              },
            },
            {
              type: 'CPU Stress',
              status: 'COMPLETED',
              responseData: { statusCode: 200, responseTime: 234 },
              latencyMetrics: { p50: 67, p95: 234, p99: 345 },
              errorRate: 3.2,
              performanceComparison: {
                before: { p95: 89, errorRate: 0.5 },
                during: { p95: 234, errorRate: 3.2 },
                after: { p95: 95, errorRate: 0.7 },
              },
            },
          ],
        },
        plannedFaults: [ 'Network Delay', 'CPU Stress' ],
      },
      // Layer 1 (Services)
      {
        id: 'user-service',
        name: 'User Service',
        layer: 1,
        protocol: 'HTTP',
        status: 'TESTING',
        x: 200,
        y: 150,
        testResults: {
          currentFaultType: 'Memory Leak',
          faultScenarios: [
            {
              type: 'Network Delay',
              status: 'COMPLETED',
              responseData: { statusCode: 200, responseTime: 123 },
              latencyMetrics: { p50: 34, p95: 123, p99: 189 },
              errorRate: 1.5,
            },
            {
              type: 'Memory Leak',
              status: 'RUNNING',
              latencyMetrics: { p50: 45, p95: 167, p99: 245 },
              errorRate: 2.8,
            },
          ],
          remainingScenarios: [ 'CPU Stress', 'Disk I/O' ],
        },
        plannedFaults: [ 'Network Delay', 'Memory Leak', 'CPU Stress', 'Disk I/O' ],
      },
      {
        id: 'auth-service',
        name: 'Auth Service',
        layer: 1,
        protocol: 'gRPC',
        status: 'UNTESTED',
        x: 600,
        y: 150,
        plannedFaults: [ 'Network Delay', 'Process Kill', 'Memory Leak' ],
        dependencies: [ 'auth-db', 'cache' ],
      },
      // Layer 2 (Data stores)
      {
        id: 'user-db',
        name: 'User Database',
        layer: 2,
        protocol: 'DB',
        status: 'TESTED',
        x: 150,
        y: 250,
        testResults: {
          faultScenarios: [
            {
              type: 'Connection Pool Exhaustion',
              status: 'COMPLETED',
              responseData: { queryTime: 45, connectionCount: 89 },
              latencyMetrics: { p50: 23, p95: 45, p99: 67 },
              errorRate: 0.8,
            },
          ],
        },
        plannedFaults: [ 'Connection Pool Exhaustion' ],
      },
      {
        id: 'cache',
        name: 'Redis Cache',
        layer: 2,
        protocol: 'DB',
        status: 'UNTESTED',
        x: 550,
        y: 250,
        plannedFaults: [ 'Memory Pressure', 'Network Partition' ],
        dependencies: [],
      },
    ];

    setServiceNodes(mockServices);

    // Generate mock anomalies based on test progress
    const mockAnomalies: AnomalyAlert[] = [];

    // Check for test completion rate issues
    const completionRate = testMetrics.completedTestCases / testMetrics.totalTestCases;
    if (completionRate < 0.5 && testMetrics.completedTestCases > 10) {
      mockAnomalies.push({
        id: 'anomaly_1',
        type: 'LOW_THROUGHPUT',
        severity: 'WARNING',
        message: 'Test completion rate is lower than expected',
        threshold: 0.5,
        actual: completionRate,
        timestamp: new Date().toISOString(),
      });
    }

    setAnomalies(mockAnomalies);
  }, [ testMetrics ]);


  const handleServiceClick = (serviceId: string) => {
    const service = serviceNodes.find(node => node.id === serviceId);
    if (service) {
      setSelectedService(service);
      setDetailPanelVisible(true);
    } else {
      setSelectedService(null);
      setDetailPanelVisible(false);
    }
  };

  const renderTestProgressCard = (label: string, current: number, total?: number, unit = '') => {
    const percentage = total ? (current / total) * 100 : 0;

    return (
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}>{label}</div>
        <div className={styles.metricValue}>
          {current.toLocaleString()}{unit}
        </div>
        <div className={styles.metricDelta}>
          {total ? (
            <span style={{ color: percentage >= 80 ? '#52c41a' : percentage >= 50 ? '#faad14' : '#ff4d4f' }}>
              {percentage.toFixed(1)}% ({current}/{total})
            </span>
          ) : (
            <span style={{ color: '#666' }}>
              <Translation>Total count</Translation>
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderAnomalyAlert = (anomaly: AnomalyAlert) => (
    <div
      key={anomaly.id}
      style={{
        background: anomaly.severity === 'CRITICAL' ? '#fff2f0' : '#fffbe6',
        border: `1px solid ${anomaly.severity === 'CRITICAL' ? '#ff4d4f' : '#faad14'}`,
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Icon
        type="warning"
        style={{
          color: anomaly.severity === 'CRITICAL' ? '#ff4d4f' : '#faad14',
          fontSize: 16,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 600,
          color: anomaly.severity === 'CRITICAL' ? '#ff4d4f' : '#faad14',
          marginBottom: 2,
        }}>
          {anomaly.message}
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>
          <Translation>Threshold</Translation>: {anomaly.threshold} |
          <Translation>Actual</Translation>: {anomaly.actual} |
          {new Date(anomaly.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  const renderServiceDetailPanel = () => {
    if (!selectedService || !detailPanelVisible) return null;

    const statusColors = {
      TESTED: '#52c41a',
      TESTING: '#1890ff',
      UNTESTED: '#d9d9d9',
    };

    // Get fault scenarios by status
    const completedScenarios = selectedService.testResults?.faultScenarios.filter(s => s.status === 'COMPLETED') || [];
    const runningScenarios = selectedService.testResults?.faultScenarios.filter(s => s.status === 'RUNNING') || [];
    const pendingScenarios = selectedService.testResults?.faultScenarios.filter(s => s.status === 'PENDING') || [];

    // For untested services, use planned faults as pending scenarios
    const allPendingScenarios = selectedService.status === 'UNTESTED'
      ? (selectedService.plannedFaults || []).map(fault => ({ type: fault, status: 'PENDING' as const }))
      : pendingScenarios;

    return (
      <div style={{
        marginTop: 16,
        padding: 20,
        background: '#f8f9fa',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            <Translation>Fault Scenario Testing Status</Translation>: {selectedService.name}
          </h4>
          <Tag color={statusColors[selectedService.status]} size="medium">
            {selectedService.status}
          </Tag>
          <Button
            size="small"
            onClick={() => setDetailPanelVisible(false)}
            style={{ marginLeft: 'auto' }}
          >
            <Icon type="close" />
          </Button>
        </div>

        {/* Completed Fault Scenarios */}
        {completedScenarios.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#52c41a' }}>
              <Icon type="check-circle" style={{ marginRight: 8 }} />
              <Translation>Completed Fault Scenarios</Translation> ({completedScenarios.length})
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {completedScenarios.map((scenario, index) => (
                <Tag key={index} color="#52c41a" size="medium">
                  {scenario.type}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Currently Testing Fault Scenarios */}
        {runningScenarios.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#1890ff' }}>
              <Icon type="loading" style={{ marginRight: 8 }} />
              <Translation>Currently Testing Fault Scenarios</Translation> ({runningScenarios.length})
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {runningScenarios.map((scenario, index) => (
                <Tag key={index} color="#1890ff" size="medium">
                  {scenario.type}
                </Tag>
              ))}
            </div>
            <div style={{
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: 6,
              padding: 12,
              marginTop: 12,
              fontSize: 12,
              color: '#666',
            }}>
              <Translation>Real-time fault injection in progress...</Translation>
            </div>
          </div>
        )}

        {/* Pending/Untested Fault Scenarios */}
        {allPendingScenarios.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#d9d9d9' }}>
              <Icon type="clock-circle" style={{ marginRight: 8 }} />
              <Translation>Pending Fault Scenarios</Translation> ({allPendingScenarios.length})
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allPendingScenarios.map((scenario, index) => (
                <Tag key={index} color="#d9d9d9" size="medium">
                  {typeof scenario === 'string' ? scenario : scenario.type}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: 6,
          padding: 16,
          marginTop: 16,
        }}>
          <h6 style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#666' }}>
            <Translation>Testing Progress Summary</Translation>
          </h6>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
                {completedScenarios.length}
              </div>
              <div style={{ color: '#666' }}>
                <Translation>Completed</Translation>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                {runningScenarios.length}
              </div>
              <div style={{ color: '#666' }}>
                <Translation>Testing</Translation>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#d9d9d9' }}>
                {allPendingScenarios.length}
              </div>
              <div style={{ color: '#666' }}>
                <Translation>Pending</Translation>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="dashboard" />
          <Translation>Real-time Execution Status</Translation>
        </div>
      </div>

      <div className={styles.sectionContent}>
        {/* Test Progress Metrics Cards */}
        <div className={styles.metricsGrid}>
          {renderTestProgressCard(i18n.t('Total Test Cases').toString(), testMetrics.totalTestCases)}
          {renderTestProgressCard(i18n.t('Completed Test Cases').toString(), testMetrics.completedTestCases, testMetrics.totalTestCases)}
          {renderTestProgressCard(i18n.t('Total Services').toString(), testMetrics.totalServices)}
          {renderTestProgressCard(i18n.t('Completed Services').toString(), testMetrics.completedServices, testMetrics.totalServices)}
          {renderTestProgressCard(i18n.t('Testing Services').toString(), testMetrics.testingServices)}
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>
              <Translation>Sample Count</Translation>
            </div>
            <div className={styles.metricValue}>
              {testMetrics.sampleCount.toLocaleString()}
            </div>
            <div className={styles.metricDelta} style={{ color: '#666' }}>
              <Translation>Total samples</Translation>
            </div>
          </div>
        </div>

        {/* Anomaly Alerts */}
        {anomalies.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>
              <Icon type="warning" style={{ marginRight: 8, color: '#faad14' }} />
              <Translation>Anomaly Alerts</Translation>
            </h4>
            {anomalies.map(renderAnomalyAlert)}
          </div>
        )}

        {/* Test Case Info Visualization */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: 0 }}>
              <Icon type="share-alt" style={{ marginRight: 8 }} />
              {i18n.t('Test Case Info').toString()}
            </h4>
            <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span><Translation>Click services to view testing details</Translation></span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#52c41a' }}>●</span> <Translation>Tested</Translation>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#1890ff' }}>●</span> <Translation>Testing</Translation>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#d9d9d9' }}>●</span> <Translation>Untested</Translation>
                </span>
              </div>
            </div>
          </div>

          <XFlowServiceChain
            serviceNodes={serviceNodes}
            onServiceClick={handleServiceClick}
            selectedService={selectedService}
          />

          {/* Service Detail Panel */}
          {renderServiceDetailPanel()}
        </div>
      </div>
    </div>
  );
};

export default RealTimeStatus;
