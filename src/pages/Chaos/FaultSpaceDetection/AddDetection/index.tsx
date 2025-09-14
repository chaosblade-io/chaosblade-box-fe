import React, { FC, useEffect, useState, useRef } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import {
  Button,
  Message,
  Dialog,
  Icon,
  Input,
} from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';

// Import section components from TaskConfiguration
import TargetSystemSection from '../TaskConfiguration/components/TargetSystemSection';
import APIParameterSection from '../TaskConfiguration/components/APIParameterSection';
import XFlowTraceVisualization from '../TaskConfiguration/components/XFlowTraceVisualization';
import SLOConfigurationSection from '../TaskConfiguration/components/SLOConfigurationSection';
import ExecutionConfigurationSection from '../TaskConfiguration/components/ExecutionConfigurationSection';

// TypeScript interfaces

interface TaskConfigurationData {
  taskName: string;
  targetSystem: {

    systemId: string;
    environment: string;
    apiSource: {
      syncTime: string;
    };
    selectedAPI: {
      id?: number; // apiId for payload
      method: string;
      path: string;
      operationId: string;
      baseUrl?: string;
    } | null;
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
        target?: string;
        action?: string;
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
    requestNum: number; // total requests for probe task
  };
}

interface ValidationErrors {
  taskName?: string[];
  targetSystem?: string[];
  apiParameters?: string[];
  traceConfig?: string[];
  sloConfig?: string[];
  executionConfig?: string[];
}

const AddDetection: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Refs for section scrolling
  const targetSystemRef = useRef<HTMLDivElement>(null);
  const apiParameterRef = useRef<HTMLDivElement>(null);
  const traceVisualizationRef = useRef<HTMLDivElement>(null);
  const sloConfigurationRef = useRef<HTMLDivElement>(null);
  const executionConfigurationRef = useRef<HTMLDivElement>(null);


  // State management
  const [ formData, setFormData ] = useState<TaskConfigurationData>({
    taskName: getDefaultTaskName(),
    targetSystem: {

      systemId: '',
      environment: '',
      apiSource: {
        syncTime: '',
      },
      selectedAPI: null,
    },
    apiParameters: {
      pathParams: {},
      queryParams: {},
      headers: {
        authType: 'TOKEN',
        customHeaders: {},
      },
      requestBody: '',
    },
    traceConfig: {
      baselineTrace: null,
      faultConfigurations: [],
    },
    sloConfig: {
      functionalAssertions: {
        statusCodes: [ 200 ],
        jsonPathAssertions: [],
      },
      performanceTargets: {
        p95Limit: 800,
        p99Limit: 1500,
        errorRateLimit: 5,
      },
    },
    executionConfig: {
      requestNum: 20,
    },
  });

  const [ validationErrors, setValidationErrors ] = useState<ValidationErrors>({});
  const [ activeSection, setActiveSection ] = useState('targetSystem');
  const [ isValidating, setIsValidating ] = useState(false);
  const [ isSaving, setIsSaving ] = useState(false);
  const [ executeDialogVisible, setExecuteDialogVisible ] = useState(false);

  useEffect(() => {
    // Set page title and breadcrumb
    dispatch.pageHeader.setTitle(i18n.t('Add Detection').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
      { key: 'fault_space_detection', value: i18n.t('Fault Space Detection').toString(), path: '/chaos/fault-space-detection/tasks' },
      { key: 'add_detection', value: i18n.t('Add Detection').toString(), path: '/chaos/fault-space-detection/add' },
    ]));
  }, []);

  // Navigation sections configuration
  const navigationSections = [
    {
      id: 'targetSystem',
      title: i18n.t('Target System Selection').toString(),
      ref: targetSystemRef,
      hasErrors: validationErrors.targetSystem && validationErrors.targetSystem.length > 0,
    },
    {
      id: 'apiParameters',
      title: i18n.t('API Parameter Configuration').toString(),
      ref: apiParameterRef,
      hasErrors: validationErrors.apiParameters && validationErrors.apiParameters.length > 0,
    },
    {
      id: 'traceVisualization',
      title: i18n.t('Trace Visualization & Fault Configuration').toString(),
      ref: traceVisualizationRef,
      hasErrors: validationErrors.traceConfig && validationErrors.traceConfig.length > 0,
    },
    {
      id: 'sloConfiguration',
      title: i18n.t('SLO Configuration').toString(),
      ref: sloConfigurationRef,
      hasErrors: validationErrors.sloConfig && validationErrors.sloConfig.length > 0,
    },
    {
      id: 'executionConfiguration',
      title: i18n.t('Execution Configuration').toString(),
      ref: executionConfigurationRef,
      hasErrors: validationErrors.executionConfig && validationErrors.executionConfig.length > 0,
    },
  ];

  // Scroll to section handler
  const scrollToSection = (sectionId: string) => {
    const section = navigationSections.find(s => s.id === sectionId);
    if (section?.ref.current) {
      section.ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setActiveSection(sectionId);
    }
  };

  // Form data update handlers
  const updateTargetSystem = (data: Partial<TaskConfigurationData['targetSystem']>) => {
    setFormData(prev => ({
      ...prev,
      targetSystem: { ...prev.targetSystem, ...data },
    }));
  };

  const updateAPIParameters = (data: Partial<TaskConfigurationData['apiParameters']>) => {
    setFormData(prev => ({
      ...prev,
      apiParameters: { ...prev.apiParameters, ...data },
    }));
  };

  const updateTraceConfig = (data: Partial<TaskConfigurationData['traceConfig']>) => {
    setFormData(prev => ({
      ...prev,
      traceConfig: { ...prev.traceConfig, ...data },
    }));
  };

  const updateSLOConfig = (data: Partial<TaskConfigurationData['sloConfig']>) => {
    setFormData(prev => ({
      ...prev,
      sloConfig: { ...prev.sloConfig, ...data },
    }));
  };

  const updateExecutionConfig = (data: Partial<TaskConfigurationData['executionConfig']>) => {
    setFormData(prev => ({
      ...prev,
      executionConfig: { ...prev.executionConfig, ...data },
    }));
  };

  // Validation logic
  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Task Name validation
    const name = (formData.taskName || '').trim();
    if (!name) {
      errors.taskName = [ i18n.t('Task name is required').toString() ];
    } else {
      if (name.length < 1 || name.length > 50) {
        errors.taskName = [ ...(errors.taskName || []), i18n.t('Task name length must be between 1 and 50 characters').toString() ];
      }
      const namePattern = /^[\u4e00-\u9fa5A-Za-z0-9_-]{1,50}$/;
      if (!namePattern.test(name)) {
        errors.taskName = [ ...(errors.taskName || []), i18n.t('Allowed characters: Chinese, letters, numbers, underscore, hyphen').toString() ];
      }
    }

    // Target System validation
    if (!formData.targetSystem.systemId) {
      errors.targetSystem = [ i18n.t('Target system is required').toString() ];
    }
    if (!formData.targetSystem.selectedAPI) {
      errors.targetSystem = [ ...(errors.targetSystem || []), i18n.t('API selection is required').toString() ];
    }
    if (formData.targetSystem.selectedAPI && formData.targetSystem.selectedAPI.id == null) {
      errors.targetSystem = [ ...(errors.targetSystem || []), i18n.t('API id is missing, please reselect API').toString() ];
    }

    // Trace Config validation
    if (formData.traceConfig.faultConfigurations.length === 0) {
      errors.traceConfig = [ i18n.t('At least one fault configuration is required').toString() ];
    }

    // SLO Config validation
    if (formData.sloConfig.performanceTargets.p95Limit <= 0) {
      errors.sloConfig = [ i18n.t('P95 limit must be greater than 0').toString() ];
    }

    // Execution Config validation
    if ((formData.executionConfig.requestNum || 0) <= 0) {
      errors.executionConfig = [ ...(errors.executionConfig || []), i18n.t('Total request number must be greater than 0').toString() ];
    }

    return errors;
  };

  // Generate a reasonably unique code for apiDefinition.code
  function generateUniqueCode(): string {
    // Prefer crypto.randomUUID if available; fallback to timestamp + random hex
    try {
      const g: any = (window as any).crypto || (globalThis as any).crypto;
      if (g && typeof g.randomUUID === 'function') {
        return g.randomUUID();
      }
    } catch (_) { /* ignore */ }
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `api-${Date.now()}-${s4()}${s4()}`;
  }

  // Default task name template
  function getDefaultTaskName(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const name = `ProbeTask-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    return name.slice(0, 50);
  }

  // Build payload for create probe task via proxy
  function buildCreateTaskPayload() {
    const apiId = formData.targetSystem.selectedAPI?.id || 0;
    const systemIdNum = Number(formData.targetSystem.systemId) || 0;

    const headersStr = JSON.stringify({
      ...(formData.apiParameters.headers.authType === 'TOKEN' ? { Authorization: 'Bearer {{token}}' } : {}),
      ...formData.apiParameters.headers.customHeaders,
      Accept: 'application/json',
    });
    const queryStr = JSON.stringify(formData.apiParameters.queryParams || {});
    const bodyStr = formData.apiParameters.requestBody || '';

    const taskSlo = [
      {
        node_id: 12,
        p95: formData.sloConfig.performanceTargets.p95Limit,
        p99: formData.sloConfig.performanceTargets.p99Limit,
        errRate: formData.sloConfig.performanceTargets.errorRateLimit,
      },
    ];

    const faultConfigurations = formData.traceConfig.faultConfigurations.map(fc => {
      // serviceId 是渲染时的 String(id)，需转 number；若无法解析，保持 0 触发后端校验
      const nodeId = Number(fc.serviceId);
      // 构造最小 CRD 结构，由后端进行自动补全（names/namespace/container_names）
      // 根据选择的 faultTemplates 中 enabled=true 的项转换
      const enabledFaults = (fc.faultTemplates || []).filter(t => t.enabled);
      // 取第一个故障类型作为示例（若支持多个，可扩展为分多条 faultConfigurations）
      const selected = enabledFaults[0] || {} as any;
      const type = selected?.type || '';
      const parameters = selected?.parameters || {};

      // Derive target/action from template or type (faultCode like "cpu_fullload")
      const deriveTargetAction = (tpl: any) => {
        let target = (tpl?.target || '').toString();
        let action = (tpl?.action || '').toString();
        if (!target || !action) {
          const code: string = (tpl?.type || '').toString();
          const parts = code.split('_');
          if (parts.length >= 2) {
            target = parts[0];
            action = parts.slice(1).join('_');
          }
        }
        const normTarget = (t: string) => {
          const x = (t || '').toLowerCase();
          if (x === 'memory') return 'mem';
          if (x === 'net') return 'network';
          return x;
        };
        return { target: normTarget(target), action: (action || '').toLowerCase() };
      };
      const { target, action } = deriveTargetAction(selected);

      const faultscript = type
        ? {
            apiVersion: 'chaosblade.io/v1alpha1',
            kind: 'ChaosBlade',
            metadata: { name: `auto-${type}-${Date.now()}` },
            spec: {
              experiments: [
                {
                  scope: 'container',
                  target,
                  action,
                  // 构建 matchers：支持数组值，并过滤空/无效值
                  matchers: (() => {
                    const base = Object.entries(parameters)
                      .filter(([_, v]) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '') && !(Array.isArray(v) && v.length === 0))
                      .map(([k, v]) => ({
                        name: String(k).replace(/_/g, '-'),
                        value: Array.isArray(v) ? v.map((x) => String(x)) : [ String(v) ],
                      }));

                    const has = (n: string) => base.some(m => m.name === n);
                    const getParam = (...keys: string[]) => {
                      for (const key of keys) {
                        const val = (parameters as any)[key];
                        if (val !== undefined && val !== null && !(typeof val === 'string' && val.trim() === '') && !(Array.isArray(val) && val.length === 0)) {
                          return val;
                        }
                      }
                      return undefined;
                    };
                    const toArr = (v: any) => Array.isArray(v) ? v.map(x => String(x)) : (v !== undefined ? [ String(v) ] : []);

                    if (!has('names')) {
                      const v = getParam('names', 'pod_names', 'podNames');
                      base.push({ name: 'names', value: toArr(v) });
                    }
                    if (!has('namespace')) {
                      const v = getParam('namespace', 'ns');
                      base.push({ name: 'namespace', value: toArr(v) });
                    }
                    if (!has('container-names')) {
                      const v = getParam('container-names', 'container_names', 'containerNames');
                      base.push({ name: 'container-names', value: toArr(v) });
                    }
                    return base;
                  })(),
                },
              ],
            },
          }
        : null;

      return { nodeId: isNaN(nodeId) ? 0 : nodeId, type, faultscript };
    });

    // Compose full URL: baseUrl + path (avoid double slashes)
    const apiPath = formData.targetSystem.selectedAPI?.path || '/';
    const baseUrl = formData.targetSystem.selectedAPI?.baseUrl || '';
    console.log("baseUrl: ",baseUrl)
    const urlTemplate = baseUrl
      ? `${baseUrl.replace(/\/$/, '')}${apiPath.startsWith('/') ? '' : '/'}${apiPath}`
      : apiPath;

    return {
      name: (formData.taskName || '').trim() || getDefaultTaskName(),
      description: 'Created via AddDetection UI',
      systemId: systemIdNum,
      apiId,
      createdBy: 'frontend',
      updatedBy: 'frontend',
      faultConfigurations,
      taskSlo,
      apiDefinition: {
        code: generateUniqueCode(),
        name: formData.targetSystem.selectedAPI?.operationId || 'API',
        method: formData.targetSystem.selectedAPI?.method || 'GET',
        urlTemplate,
        headers: headersStr,
        queryParams: queryStr,
        bodyMode: 'JSON',
        contentType: 'application/json',
        bodyTemplate: bodyStr,
        apiId,
      },
      requestNum: formData.executionConfig.requestNum || 20,
    };
  }


  // Action handlers
  async function handleSaveDraft() {
    setIsSaving(true);
    try {
      Message.success(i18n.t('Draft saved successfully').toString());
      pushUrl(history, '/chaos/fault-space-detection/tasks');
    } catch (error) {
      console.error('Failed to save draft:', error);
      Message.error(i18n.t('Failed to save draft').toString());
    } finally {
      setIsSaving(false);
    }
  }

  async function handleValidateAndSave() {
    setIsValidating(true);
    try {
      const errors = validateForm();
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) {
        Message.error(i18n.t('Please fix validation errors before saving').toString());
        return;
      }
      const payload = buildCreateTaskPayload();
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      await probeProxy.createProbeTask(payload as any);
      Message.success(i18n.t('Configuration saved successfully').toString());
      pushUrl(history, '/chaos/fault-space-detection/tasks');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      Message.error(i18n.t('Failed to save configuration').toString());
    } finally {
      setIsValidating(false);
    }
  }



  async function handleExecuteImmediately() {
    setIsValidating(true);
    try {
      const errors = validateForm();
      setValidationErrors(errors);

      if (Object.keys(errors).length > 0) {
        Message.error(i18n.t('Please fix validation errors before execution').toString());
        setIsValidating(false);
        return;
      }

      setExecuteDialogVisible(true);
    } catch (error) {
      console.error('Validation failed:', error);
      Message.error(i18n.t('Validation failed').toString());
    } finally {
      setIsValidating(false);
    }
  }

  async function confirmExecuteImmediately() {
    try {
      const errors = validateForm();
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) {
        Message.error(i18n.t('Please fix validation errors before execution').toString());
        return;
      }
      const payload = buildCreateTaskPayload();
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      await probeProxy.createProbeTask(payload as any);
      Message.success(i18n.t('Task execution started successfully').toString());
      setExecuteDialogVisible(false);
      pushUrl(history, '/chaos/fault-space-detection/records');
    } catch (error) {
      console.error('Failed to execute task:', error);
      Message.error(i18n.t('Failed to execute task').toString());
    }
  }

  function calculateTotalSteps(): number {
    const baseSteps = 3; // Setup, Execute, Cleanup
    const faultSteps = formData.traceConfig.faultConfigurations.length * 2; // Inject + Recover
    return baseSteps + faultSteps;
  }

  function calculateEstimatedDuration(): string {
    const total = formData.executionConfig.requestNum || 20;
    // Simplified estimation based on request number only
    const estimatedTime = Math.ceil(total / 100) * 30; // Assume each 100 requests ~30s

    const minutes = Math.floor(estimatedTime / 60);
    const seconds = estimatedTime % 60;

    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  return (
    <div className={styles.container}>
      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Right Sidebar Navigation */}
        <div className={styles.sidebarContainer}>
          <div className={styles.sidebarAffix}>
            <div className={styles.sidebar}>
              <div className={styles.sidebarTitle}>
                <Translation>Configuration Sections</Translation>
              </div>
              <nav className={styles.navigation}>
                {navigationSections.map(section => (
                  <div
                    key={section.id}
                    className={`${styles.navItem} ${activeSection === section.id ? styles.navItemActive : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    <span className={styles.navItemText}>{section.title}</span>
                    {section.hasErrors && (
                      <span className={styles.errorIndicator}>
                        <Icon type="warning" size="xs" />
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            </div>
        {/* Section 0: Task Basic Info */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <span className={styles.sectionNumber}>0</span>
              <Translation>Task Basic Info</Translation>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formCol}>
              <label className={styles.fieldLabel}>
                <Translation>Task Name</Translation>
                <span style={{ color: '#ff4d4f' }}> *</span>
              </label>
              <Input
                value={formData.taskName}
                maxLength={50}
                placeholder={i18n.t('e.g. OrderAPI-PeakTest-Delay').toString()}
                onChange={(val) => setFormData(prev => ({ ...prev, taskName: (val || '').slice(0, 50) }))}
              />
              <div className={styles.fieldDescription}>
                <Translation>1-50 characters; supports Chinese, letters, numbers, underscore, hyphen</Translation>
              </div>
              {validationErrors.taskName && validationErrors.taskName.length > 0 && (
                <div className={styles.errorList}>
                  {validationErrors.taskName.map((err, idx) => (
                    <div key={idx} className={styles.errorItem}>
                      <Icon type="warning" size="xs" /> {err}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

          </div>
        </div>
        {/* Section 1: Target System Selection */}
        <div ref={targetSystemRef} className={styles.section}>
          <TargetSystemSection
            data={formData.targetSystem}
            errors={validationErrors.targetSystem}
            onChange={updateTargetSystem}
            onTopologyLoaded={({ nodes, edges }) => updateTraceConfig({ baselineTrace: { nodes, edges } })}
          />
        </div>

        {/* Section 2: API Parameter Configuration */}
        <div ref={apiParameterRef} className={styles.section}>
          <APIParameterSection
            data={formData.apiParameters}
            selectedAPI={formData.targetSystem.selectedAPI}
            errors={validationErrors.apiParameters}
            onChange={updateAPIParameters}
          />
        </div>

        {/* Section 3: Trace Visualization & Fault Configuration */}
        <div ref={traceVisualizationRef} className={styles.section}>
          <XFlowTraceVisualization
            data={formData.traceConfig}
            errors={validationErrors.traceConfig}
            onChange={updateTraceConfig}
          />
        </div>

        {/* Section 4: SLO Configuration */}
        <div ref={sloConfigurationRef} className={styles.section}>
          <SLOConfigurationSection
            data={formData.sloConfig}
            errors={validationErrors.sloConfig}
            onChange={updateSLOConfig}
          />
        </div>

        {/* Section 5: Execution Configuration */}
        <div ref={executionConfigurationRef} className={styles.section}>
          <ExecutionConfigurationSection
            data={formData.executionConfig}
            errors={validationErrors.executionConfig}
            onChange={updateExecutionConfig}
          />
        </div>

        {/* Bottom padding to ensure last section is scrollable */}
        <div className={styles.bottomPadding} />
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className={styles.bottomActionBar}>
        <div className={styles.actionBarContent}>
          <Button
            onClick={handleSaveDraft}
            loading={isSaving}
            disabled={isValidating}
          >
            <Translation>Save Draft</Translation>
          </Button>

          <Button
            type="primary"
            onClick={handleValidateAndSave}
            loading={isValidating}
            disabled={isSaving}
          >
            <Translation>Validate & Save</Translation>
          </Button>

          <Button
            type="primary"
            onClick={handleExecuteImmediately}
            loading={isValidating}
            disabled={isSaving}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            <Translation>Execute Immediately</Translation>
          </Button>
        </div>
      </div>

      {/* Execute Confirmation Dialog */}
      <Dialog
        visible={executeDialogVisible}
        title={i18n.t('Execute Task Immediately').toString()}
        onClose={() => setExecuteDialogVisible(false)}
        onCancel={() => setExecuteDialogVisible(false)}
        onOk={confirmExecuteImmediately}
        locale={locale().Dialog}
        style={{ width: 600 }}
      >
        <div className={styles.executeDialogContent}>
          <div className={styles.warningSection}>
            <Icon type="warning" style={{ color: '#faad14', marginRight: 8 }} />
            <span className={styles.warningText}>
              <Translation>This will start the fault injection test immediately</Translation>
            </span>
          </div>

          <div className={styles.estimationSection}>
            <h4><Translation>Execution Estimation</Translation></h4>
            <div className={styles.estimationItem}>
              <span><Translation>Total Steps</Translation>:</span>
              <span>{calculateTotalSteps()}</span>
            </div>
            <div className={styles.estimationItem}>
              <span><Translation>Estimated Duration</Translation>:</span>
              <span>{calculateEstimatedDuration()}</span>
            </div>
            <div className={styles.estimationItem}>
              <span><Translation>Environment</Translation>:</span>
              <span>{formData.targetSystem.environment}</span>
            </div>
          </div>

          <div className={styles.riskWarning}>
            <Icon type="exclamation-circle" style={{ color: '#ff4d4f', marginRight: 8 }} />
            <span>
              <Translation>Please ensure the target environment can handle the configured load and fault injection</Translation>
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AddDetection;
