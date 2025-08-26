import React, { FC, useEffect, useState, useRef } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import {
  Button,
  Message,
  Dialog,
  Icon
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
  targetSystem: {
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

interface ValidationErrors {
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
  const [formData, setFormData] = useState<TaskConfigurationData>({
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
        statusCodes: [200],
        jsonPathAssertions: [],
      },
      performanceTargets: {
        p95Limit: 800,
        p99Limit: 1500,
        errorRateLimit: 5,
      },
    },
    executionConfig: {
      concurrency: 5,
    },
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [activeSection, setActiveSection] = useState('targetSystem');
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executeDialogVisible, setExecuteDialogVisible] = useState(false);

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

    // Target System validation
    if (!formData.targetSystem.systemId) {
      errors.targetSystem = [i18n.t('Target system is required').toString()];
    }
    if (!formData.targetSystem.selectedAPI) {
      errors.targetSystem = [...(errors.targetSystem || []), i18n.t('API selection is required').toString()];
    }

    // Trace Config validation
    if (formData.traceConfig.faultConfigurations.length === 0) {
      errors.traceConfig = [i18n.t('At least one fault configuration is required').toString()];
    }

    // SLO Config validation
    if (formData.sloConfig.performanceTargets.p95Limit <= 0) {
      errors.sloConfig = [i18n.t('P95 limit must be greater than 0').toString()];
    }

    // Execution Config validation
    if (formData.executionConfig.concurrency <= 0) {
      errors.executionConfig = [i18n.t('Concurrency must be greater than 0').toString()];
    }

    return errors;
  };

  // Action handlers
  async function handleSaveDraft() {
    setIsSaving(true);
    try {
      // TODO: Save draft without validation
      // await dispatch.taskConfiguration.saveDraft(formData);

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

      // TODO: Save validated configuration
      // await dispatch.taskConfiguration.saveConfiguration(formData);

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
      // TODO: Create and execute task
      // const taskId = await dispatch.taskConfiguration.createAndExecuteTask(formData);

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
    const { concurrency } = formData.executionConfig;

    // Simplified estimation based on concurrency
    const estimatedTime = Math.ceil(100 / concurrency) * 30; // Assume 100 requests, 30s each

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
                {navigationSections.map((section) => (
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
          </div>
        </div>
        {/* Section 1: Target System Selection */}
        <div ref={targetSystemRef} className={styles.section}>
          <TargetSystemSection
            data={formData.targetSystem}
            errors={validationErrors.targetSystem}
            onChange={updateTargetSystem}
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
