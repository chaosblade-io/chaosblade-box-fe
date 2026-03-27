import React, { FC, useState, useEffect } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import {
  Dialog,
  Form,
  Input,
  Select,
  NumberPicker,
  Message,
} from '@alicloud/console-components';
import locale from 'utils/locale';

const FormItem = Form.Item;

interface ApiFormProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** The system ID that this API belongs to */
  systemId: number;
  /** API data for editing; null means creating a new API */
  editData: any | null;
  /** Callback when the dialog is closed */
  onClose: () => void;
  /** Callback after a successful save */
  onSuccess: () => void;
}

/**
 * ApiForm - Dialog form for creating or editing an API definition.
 *
 * Fields include operation metadata (operationId, method, path, summary),
 * connection settings (baseUrl, contentType, authType, timeoutMs),
 * and template fields (headersTemplate, pathParams, queryParams, bodyTemplate).
 */
const ApiForm: FC<ApiFormProps> = ({ visible, systemId, editData, onClose, onSuccess }) => {
  const isEdit = !!editData;

  // Core fields
  const [operationId, setOperationId] = useState('');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [summary, setSummary] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  // Configuration fields
  const [contentType, setContentType] = useState('application/json');
  const [authType, setAuthType] = useState('NONE');
  const [timeoutMs, setTimeoutMs] = useState<number>(30000);

  // Template fields (JSON strings)
  const [headersTemplate, setHeadersTemplate] = useState('');
  const [pathParams, setPathParams] = useState('');
  const [queryParams, setQueryParams] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');

  // Submission loading state
  const [submitting, setSubmitting] = useState(false);

  // Populate form fields when editing
  useEffect(() => {
    if (editData) {
      setOperationId(editData.operationId || '');
      setMethod(editData.method || 'GET');
      setPath(editData.path || '');
      setSummary(editData.summary || '');
      setBaseUrl(editData.baseUrl || '');
      setContentType(editData.contentType || 'application/json');
      setAuthType(editData.authType || 'NONE');
      setTimeoutMs(editData.timeoutMs ?? 30000);
      setHeadersTemplate(editData.headersTemplate || '');
      setPathParams(editData.pathParams || '');
      setQueryParams(editData.queryParams || '');
      setBodyTemplate(editData.bodyTemplate || '');
    } else {
      // Reset fields for creation
      setOperationId('');
      setMethod('GET');
      setPath('');
      setSummary('');
      setBaseUrl('');
      setContentType('application/json');
      setAuthType('NONE');
      setTimeoutMs(30000);
      setHeadersTemplate('');
      setPathParams('');
      setQueryParams('');
      setBodyTemplate('');
    }
  }, [editData, visible]);

  /**
   * Validate JSON string fields. Returns true if the value is empty or valid JSON.
   */
  const isValidJsonOrEmpty = (value: string): boolean => {
    if (!value.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Validate the form and submit to the backend.
   */
  const handleSubmit = async () => {
    // Required field validation
    if (!operationId.trim()) {
      Message.error(i18n.t('Operation ID is required').toString());
      return;
    }
    if (!path.trim()) {
      Message.error(i18n.t('Path is required').toString());
      return;
    }
    if (!baseUrl.trim()) {
      Message.error(i18n.t('Base URL is required').toString());
      return;
    }

    // JSON field validation
    if (!isValidJsonOrEmpty(headersTemplate)) {
      Message.error(i18n.t('Headers Template must be valid JSON').toString());
      return;
    }
    if (!isValidJsonOrEmpty(pathParams)) {
      Message.error(i18n.t('Path Params must be valid JSON').toString());
      return;
    }
    if (!isValidJsonOrEmpty(queryParams)) {
      Message.error(i18n.t('Query Params must be valid JSON').toString());
      return;
    }
    if (!isValidJsonOrEmpty(bodyTemplate)) {
      Message.error(i18n.t('Body Template must be valid JSON').toString());
      return;
    }

    const payload: Record<string, any> = {
      operationId: operationId.trim(),
      method,
      path: path.trim(),
      summary: summary.trim(),
      baseUrl: baseUrl.trim(),
      contentType,
      authType,
      timeoutMs,
      headersTemplate: headersTemplate.trim() || null,
      pathParams: pathParams.trim() || null,
      queryParams: queryParams.trim() || null,
      bodyTemplate: bodyTemplate.trim() || null,
    };

    setSubmitting(true);
    try {
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      if (isEdit) {
        await probeProxy.updateApi(editData.id, payload);
        Message.success(i18n.t('API updated successfully').toString());
      } else {
        await probeProxy.createApi(systemId, payload);
        Message.success(i18n.t('API created successfully').toString());
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save API:', error);
      Message.error(i18n.t('Failed to save API').toString());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      title={isEdit ? i18n.t('Edit API').toString() : i18n.t('New API').toString()}
      onClose={onClose}
      onCancel={onClose}
      onOk={handleSubmit}
      okProps={{ loading: submitting }}
      locale={locale().Dialog}
      style={{ width: 640 }}
    >
      <Form labelAlign="top" style={{ padding: '8px 0' }}>
        {/* Core fields */}
        <FormItem label={i18n.t('Operation ID').toString()} required>
          <Input
            value={operationId}
            onChange={(value: string) => setOperationId(value)}
            placeholder={i18n.t('e.g. getOrderById').toString()}
            maxLength={200}
          />
        </FormItem>

        <FormItem label={i18n.t('Method').toString()} required>
          <Select
            value={method}
            onChange={(value: string) => setMethod(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
            <Select.Option value="PATCH">PATCH</Select.Option>
          </Select>
        </FormItem>

        <FormItem label={i18n.t('Path').toString()} required>
          <Input
            value={path}
            onChange={(value: string) => setPath(value)}
            placeholder={i18n.t('e.g. /api/v1/orders/{orderId}').toString()}
            maxLength={500}
          />
        </FormItem>

        <FormItem label={i18n.t('Summary').toString()}>
          <Input
            value={summary}
            onChange={(value: string) => setSummary(value)}
            placeholder={i18n.t('Brief description of the API').toString()}
            maxLength={300}
          />
        </FormItem>

        <FormItem label={i18n.t('Base URL').toString()} required>
          <Input
            value={baseUrl}
            onChange={(value: string) => setBaseUrl(value)}
            placeholder={i18n.t('e.g. http://ts-food-service:18856').toString()}
            maxLength={500}
          />
        </FormItem>

        {/* Configuration fields */}
        <FormItem label={i18n.t('Content Type').toString()}>
          <Select
            value={contentType}
            onChange={(value: string) => setContentType(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="application/json">application/json</Select.Option>
            <Select.Option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Select.Option>
            <Select.Option value="multipart/form-data">multipart/form-data</Select.Option>
            <Select.Option value="text/plain">text/plain</Select.Option>
          </Select>
        </FormItem>

        <FormItem label={i18n.t('Auth Type').toString()}>
          <Select
            value={authType}
            onChange={(value: string) => setAuthType(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="NONE"><Translation>None</Translation></Select.Option>
            <Select.Option value="BEARER">Bearer Token</Select.Option>
            <Select.Option value="BASIC">Basic Auth</Select.Option>
            <Select.Option value="API_KEY">API Key</Select.Option>
          </Select>
        </FormItem>

        <FormItem label={i18n.t('Timeout (ms)').toString()}>
          <NumberPicker
            value={timeoutMs}
            onChange={(value: number) => setTimeoutMs(value)}
            min={1000}
            max={300000}
            step={1000}
            style={{ width: '100%' }}
          />
        </FormItem>

        {/* Template fields - JSON text areas */}
        <FormItem label={i18n.t('Headers Template (JSON)').toString()}>
          <Input.TextArea
            value={headersTemplate}
            onChange={(value: string) => setHeadersTemplate(value)}
            placeholder={'{"Authorization": "Bearer ${token}"}'}
            rows={3}
          />
        </FormItem>

        <FormItem label={i18n.t('Path Params (JSON)').toString()}>
          <Input.TextArea
            value={pathParams}
            onChange={(value: string) => setPathParams(value)}
            placeholder={'{"orderId": "12345"}'}
            rows={2}
          />
        </FormItem>

        <FormItem label={i18n.t('Query Params (JSON)').toString()}>
          <Input.TextArea
            value={queryParams}
            onChange={(value: string) => setQueryParams(value)}
            placeholder={'{"page": 1, "size": 20}'}
            rows={2}
          />
        </FormItem>

        <FormItem label={i18n.t('Body Template (JSON)').toString()}>
          <Input.TextArea
            value={bodyTemplate}
            onChange={(value: string) => setBodyTemplate(value)}
            placeholder={'{"key": "value"}'}
            rows={4}
          />
        </FormItem>
      </Form>
    </Dialog>
  );
};

export default ApiForm;
