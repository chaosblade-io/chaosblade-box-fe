import React, { FC, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { 
  Input, 
  Button, 
  Message, 
  Icon,
  Select,
  NumberPicker,
  Tag,
  Checkbox
} from '@alicloud/console-components';

interface SLOConfigData {
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
}

interface SLOConfigurationSectionProps {
  data: SLOConfigData;
  errors?: string[];
  onChange: (data: Partial<SLOConfigData>) => void;
}

const SLOConfigurationSection: FC<SLOConfigurationSectionProps> = ({ data, errors, onChange }) => {
  const [newJsonPathAssertion, setNewJsonPathAssertion] = useState({
    path: '',
    operator: 'exists' as const,
    expectedValue: '',
    description: '',
  });

  // Predefined status code groups
  const statusCodeGroups = [
    { label: '2xx Success', codes: [200, 201, 202, 204] },
    { label: '3xx Redirect', codes: [301, 302, 304] },
    { label: '4xx Client Error', codes: [400, 401, 403, 404, 409, 422] },
    { label: '5xx Server Error', codes: [500, 502, 503, 504] },
  ];

  const jsonPathOperators = [
    { value: 'exists', label: i18n.t('Field Exists').toString() },
    { value: 'not_exists', label: i18n.t('Field Not Exists').toString() },
    { value: 'equals', label: i18n.t('Equals').toString() },
    { value: 'contains', label: i18n.t('Contains').toString() },
    { value: 'regex', label: i18n.t('Regex Match').toString() },
  ];

  const handleStatusCodeChange = (codes: number[]) => {
    onChange({
      functionalAssertions: {
        ...data.functionalAssertions,
        statusCodes: codes,
      },
    });
  };

  const handleStatusCodeGroupToggle = (groupCodes: number[], checked: boolean) => {
    const currentCodes = data.functionalAssertions.statusCodes;
    const newCodes = checked
      ? [...new Set([...currentCodes, ...groupCodes])]
      : currentCodes.filter(code => !groupCodes.includes(code));
    
    handleStatusCodeChange(newCodes);
  };

  const addJsonPathAssertion = () => {
    if (!newJsonPathAssertion.path.trim()) {
      Message.warning(i18n.t('Please enter JSONPath').toString());
      return;
    }

    const assertion = {
      id: `assertion_${Date.now()}`,
      ...newJsonPathAssertion,
      path: newJsonPathAssertion.path.trim(),
      description: newJsonPathAssertion.description.trim() || `${newJsonPathAssertion.operator} ${newJsonPathAssertion.path}`,
    };

    onChange({
      functionalAssertions: {
        ...data.functionalAssertions,
        jsonPathAssertions: [...data.functionalAssertions.jsonPathAssertions, assertion],
      },
    });

    // Reset form
    setNewJsonPathAssertion({
      path: '',
      operator: 'exists',
      expectedValue: '',
      description: '',
    });
  };

  const removeJsonPathAssertion = (id: string) => {
    onChange({
      functionalAssertions: {
        ...data.functionalAssertions,
        jsonPathAssertions: data.functionalAssertions.jsonPathAssertions.filter(a => a.id !== id),
      },
    });
  };

  const updatePerformanceTarget = (key: keyof SLOConfigData['performanceTargets'], value: number | undefined) => {
    onChange({
      performanceTargets: {
        ...data.performanceTargets,
        [key]: value,
      },
    });
  };

  const getDefaultSuggestions = () => {
    return {
      p95Limit: 800,
      p99Limit: 1500,
      errorRateLimit: 5,
      throughputThreshold: 10,
    };
  };

  const applyDefaultSuggestions = () => {
    const suggestions = getDefaultSuggestions();
    onChange({
      performanceTargets: {
        ...data.performanceTargets,
        ...suggestions,
      },
    });
    Message.success(i18n.t('Default suggestions applied').toString());
  };

  const renderStatusCodeSelection = () => (
    <div>
      <label className={styles.fieldLabel}>
        <Translation>Expected Status Codes</Translation>
      </label>
      
      {/* Status Code Groups */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
          <Translation>Quick Select</Translation>:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {statusCodeGroups.map(group => {
            const isGroupSelected = group.codes.every(code => 
              data.functionalAssertions.statusCodes.includes(code)
            );
            const isPartiallySelected = group.codes.some(code => 
              data.functionalAssertions.statusCodes.includes(code)
            );

            return (
              <Checkbox
                key={group.label}
                checked={isGroupSelected}
                indeterminate={!isGroupSelected && isPartiallySelected}
                onChange={(checked) => handleStatusCodeGroupToggle(group.codes, checked)}
              >
                {group.label}
              </Checkbox>
            );
          })}
        </div>
      </div>

      {/* Individual Status Codes */}
      <Select
        mode="multiple"
        value={data.functionalAssertions.statusCodes}
        onChange={handleStatusCodeChange}
        placeholder={i18n.t('Select or enter status codes').toString()}
        style={{ width: '100%' }}
        hasClear
        showSearch
        filterLocal={false}
        dataSource={[
          ...statusCodeGroups.flatMap(group => 
            group.codes.map(code => ({ label: `${code}`, value: code }))
          ),
        ]}
      />
      
      <div className={styles.fieldDescription}>
        <Translation>Select the HTTP status codes that indicate successful responses</Translation>
      </div>

      {/* Selected Status Codes Display */}
      {data.functionalAssertions.statusCodes.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            <Translation>Selected Status Codes</Translation>:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {data.functionalAssertions.statusCodes.sort().map(code => (
              <Tag key={code} size="small" color={
                code >= 200 && code < 300 ? '#52c41a' :
                code >= 300 && code < 400 ? '#1890ff' :
                code >= 400 && code < 500 ? '#faad14' : '#ff4d4f'
              }>
                {code}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderJsonPathAssertions = () => (
    <div>
      <label className={styles.fieldLabel}>
        <Translation>JSONPath Assertions</Translation>
      </label>
      
      {/* Existing Assertions */}
      {data.functionalAssertions.jsonPathAssertions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {data.functionalAssertions.jsonPathAssertions.map(assertion => (
            <div key={assertion.id} style={{ 
              border: '1px solid #e8e8e8', 
              borderRadius: 6, 
              padding: 12, 
              marginBottom: 8,
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 3, fontSize: 12 }}>
                      {assertion.path}
                    </code>
                    <Tag size="small" color="#1890ff">
                      {jsonPathOperators.find(op => op.value === assertion.operator)?.label}
                    </Tag>
                    {assertion.expectedValue && (
                      <span style={{ fontSize: 12, color: '#666' }}>
                        = "{assertion.expectedValue}"
                      </span>
                    )}
                  </div>
                  {assertion.description && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {assertion.description}
                    </div>
                  )}
                </div>
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => removeJsonPathAssertion(assertion.id)}
                >
                  <Icon type="delete" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Assertion */}
      <div style={{ 
        border: '1px dashed #d9d9d9', 
        borderRadius: 6, 
        padding: 16,
        background: '#fafafa'
      }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
          <Translation>Add New Assertion</Translation>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <Input
              placeholder="$.data.id"
              value={newJsonPathAssertion.path}
              onChange={(value) => setNewJsonPathAssertion(prev => ({ ...prev, path: value }))}
              addonBefore="JSONPath"
            />
          </div>
          <div className={styles.formCol}>
            <Select
              value={newJsonPathAssertion.operator}
              onChange={(value) => setNewJsonPathAssertion(prev => ({ ...prev, operator: value as any }))}
              dataSource={jsonPathOperators}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {(newJsonPathAssertion.operator === 'equals' || 
          newJsonPathAssertion.operator === 'contains' || 
          newJsonPathAssertion.operator === 'regex') && (
          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <Input
                placeholder={i18n.t('Expected value').toString()}
                value={newJsonPathAssertion.expectedValue}
                onChange={(value) => setNewJsonPathAssertion(prev => ({ ...prev, expectedValue: value }))}
              />
            </div>
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <Input
              placeholder={i18n.t('Description (optional)').toString()}
              value={newJsonPathAssertion.description}
              onChange={(value) => setNewJsonPathAssertion(prev => ({ ...prev, description: value }))}
            />
          </div>
          <div style={{ width: 100 }}>
            <Button onClick={addJsonPathAssertion} style={{ width: '100%' }}>
              <Translation>Add</Translation>
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.fieldDescription}>
        <Translation>Define JSONPath assertions to validate response structure and content</Translation>
      </div>
    </div>
  );

  const renderPerformanceTargets = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <label className={styles.fieldLabel} style={{ marginBottom: 0 }}>
          <Translation>Performance Targets</Translation>
        </label>
        <Button size="small" onClick={applyDefaultSuggestions}>
          <Icon type="magic-wand" />
          <Translation>Apply Defaults</Translation>
        </Button>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <label className={styles.fieldLabel}>
            <Translation>P95 Latency Limit</Translation>
          </label>
          <NumberPicker
            value={data.performanceTargets.p95Limit}
            onChange={(value) => updatePerformanceTarget('p95Limit', value)}
            min={1}
            max={30000}
            step={10}
            style={{ width: '100%' }}
            innerAfter={<span>ms</span>}
          />
          <div className={styles.fieldDescription}>
            <Translation>95th percentile response time should not exceed this value</Translation>
          </div>
        </div>

        <div className={styles.formCol}>
          <label className={styles.fieldLabel}>
            <Translation>P99 Latency Limit</Translation>
          </label>
          <NumberPicker
            value={data.performanceTargets.p99Limit}
            onChange={(value) => updatePerformanceTarget('p99Limit', value)}
            min={1}
            max={60000}
            step={10}
            style={{ width: '100%' }}
            innerAfter={<span>ms</span>}
          />
          <div className={styles.fieldDescription}>
            <Translation>99th percentile response time should not exceed this value</Translation>
          </div>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <label className={styles.fieldLabel}>
            <Translation>Error Rate Limit</Translation>
          </label>
          <NumberPicker
            value={data.performanceTargets.errorRateLimit}
            onChange={(value) => updatePerformanceTarget('errorRateLimit', value)}
            min={0}
            max={100}
            step={0.1}
            precision={1}
            style={{ width: '100%' }}
            innerAfter={<span>%</span>}
          />
          <div className={styles.fieldDescription}>
            <Translation>Percentage of requests that can fail without violating SLO</Translation>
          </div>
        </div>
      </div>

      {/* Performance Target Summary */}
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #bae7ff', 
        borderRadius: 6, 
        padding: 16,
        marginTop: 16 
      }}>
        <h5 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          <Translation>SLO Summary</Translation>
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>P95 Latency</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
              ≤ {data.performanceTargets.p95Limit}ms
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>P99 Latency</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
              ≤ {data.performanceTargets.p99Limit}ms
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#666' }}>Error Rate</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
              ≤ {data.performanceTargets.errorRateLimit}%
            </div>
          </div>
          {data.performanceTargets.throughputThreshold && (
            <div>
              <div style={{ fontSize: 12, color: '#666' }}>Throughput</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                ≥ {data.performanceTargets.throughputThreshold} req/s
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionNumber}>4</span>
            <Translation>SLO Configuration</Translation>
          </div>
          <div className={styles.sectionDescription}>
            <Translation>Define Service Level Objectives for performance targets</Translation>
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



      {/* Performance Targets */}
      <div>
        <h4 style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 20 }}>
          <Translation>Performance Targets</Translation>
        </h4>
        {renderPerformanceTargets()}
      </div>
    </div>
  );
};

export default SLOConfigurationSection;
