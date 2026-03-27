import React, { FC, useState, useEffect } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import {
  Dialog,
  Form,
  Input,
  Select,
  Message,
} from '@alicloud/console-components';
import locale from 'utils/locale';

const FormItem = Form.Item;

interface SystemFormProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** System data for editing; null means creating a new system */
  editData: any | null;
  /** Callback when the dialog is closed */
  onClose: () => void;
  /** Callback after a successful save */
  onSuccess: () => void;
}

/**
 * SystemForm - Dialog form for creating or editing a target system.
 *
 * Fields:
 * - systemKey: unique identifier (disabled on edit)
 * - name: display name
 * - description: optional description
 * - owner: system owner
 * - defaultEnvironment: prod / staging / dev / test
 */
const SystemForm: FC<SystemFormProps> = ({ visible, editData, onClose, onSuccess }) => {
  const isEdit = !!editData;

  // Form field states
  const [systemKey, setSystemKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [defaultEnvironment, setDefaultEnvironment] = useState('prod');

  // Submission loading state
  const [submitting, setSubmitting] = useState(false);

  // Populate form fields when editing an existing system
  useEffect(() => {
    if (editData) {
      setSystemKey(editData.systemKey || '');
      setName(editData.name || '');
      setDescription(editData.description || '');
      setOwner(editData.owner || '');
      setDefaultEnvironment(editData.defaultEnvironment || 'prod');
    } else {
      // Reset fields for creation
      setSystemKey('');
      setName('');
      setDescription('');
      setOwner('');
      setDefaultEnvironment('prod');
    }
  }, [editData, visible]);

  /**
   * Validate the form and submit to the backend.
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!systemKey.trim()) {
      Message.error(i18n.t('System Key is required').toString());
      return;
    }
    if (!name.trim()) {
      Message.error(i18n.t('Name is required').toString());
      return;
    }

    const payload = {
      systemKey: systemKey.trim(),
      name: name.trim(),
      description: description.trim(),
      owner: owner.trim(),
      defaultEnvironment,
    };

    setSubmitting(true);
    try {
      const { probeProxy } = await import('../../../../services/faultSpaceDetection/probeProxy');
      if (isEdit) {
        await probeProxy.updateSystem(editData.id, payload);
        Message.success(i18n.t('System updated successfully').toString());
      } else {
        await probeProxy.createSystem(payload);
        Message.success(i18n.t('System created successfully').toString());
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save system:', error);
      Message.error(i18n.t('Failed to save system').toString());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      title={isEdit ? i18n.t('Edit System').toString() : i18n.t('New System').toString()}
      onClose={onClose}
      onCancel={onClose}
      onOk={handleSubmit}
      okProps={{ loading: submitting }}
      locale={locale().Dialog}
      style={{ width: 520 }}
    >
      <Form labelAlign="top" style={{ padding: '8px 0' }}>
        <FormItem
          label={i18n.t('System Key').toString()}
          required
        >
          <Input
            value={systemKey}
            onChange={(value: string) => setSystemKey(value)}
            placeholder={i18n.t('e.g. order-service').toString()}
            disabled={isEdit}
            maxLength={100}
          />
        </FormItem>

        <FormItem
          label={i18n.t('Name').toString()}
          required
        >
          <Input
            value={name}
            onChange={(value: string) => setName(value)}
            placeholder={i18n.t('Enter system name').toString()}
            maxLength={200}
          />
        </FormItem>

        <FormItem
          label={i18n.t('Description').toString()}
        >
          <Input.TextArea
            value={description}
            onChange={(value: string) => setDescription(value)}
            placeholder={i18n.t('Enter system description').toString()}
            rows={3}
            maxLength={500}
          />
        </FormItem>

        <FormItem
          label={i18n.t('Owner').toString()}
        >
          <Input
            value={owner}
            onChange={(value: string) => setOwner(value)}
            placeholder={i18n.t('Enter owner name').toString()}
            maxLength={100}
          />
        </FormItem>

        <FormItem
          label={i18n.t('Default Environment').toString()}
        >
          <Select
            value={defaultEnvironment}
            onChange={(value: string) => setDefaultEnvironment(value)}
            style={{ width: '100%' }}
          >
            <Select.Option value="prod"><Translation>Production</Translation></Select.Option>
            <Select.Option value="staging"><Translation>Staging</Translation></Select.Option>
            <Select.Option value="dev"><Translation>Development</Translation></Select.Option>
            <Select.Option value="test"><Translation>Test</Translation></Select.Option>
          </Select>
        </FormItem>
      </Form>
    </Dialog>
  );
};

export default SystemForm;
