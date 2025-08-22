import Actions, { LinkButton } from '@alicloud/console-components-actions';
import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';

import formatDate from '../lib/DateUtil';
import i18n from '../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Button, Dialog, Field, Form, Input, Message, Radio, Select, Table, Upload, Pagination, Icon } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { ILoadTestDefinition } from 'config/interfaces/Chaos/experimentTask';

const { Item: FormItem } = Form;
const { Group: RadioGroup } = Radio;

const LoadTestAdmin: FC = () => {
  const dispatch = useDispatch();
  const { definitions, total, loading } = useSelector((state: any) => state.loadTestDefinition);

  const [ addVisible, setAddVisible ] = useState(false);
  const [ editVisible, setEditVisible ] = useState(false);
  const [ currentRecord, setCurrentRecord ] = useState<ILoadTestDefinition | null>(null);
  const [ formType, setFormType ] = useState<'URL'|'SCRIPT'>('URL');
  const [ pageNum, setPageNum ] = useState(1);
  const [ pageSize, setPageSize ] = useState(20);
  const [ searchName, setSearchName ] = useState('');
  const [ searchEngineType, setSearchEngineType ] = useState<'JMETER' | 'K6' | 'LOCUST' | ''>('');
  const [ uploadedFile, setUploadedFile ] = useState<any>(null);
  const [ uploading, setUploading ] = useState(false);
  const [ editUploadedFile, setEditUploadedFile ] = useState<any>(null);
  const [ editUploading, setEditUploading ] = useState(false);

  const field = Field.useField();
  const editField = Field.useField();

  useEffect(() => {
    field.setValues({
      method: 'GET',
      engineType: 'JMETER',
      endpoint: '',
      entry: 'URL',
    });
  }, []);

  useEffect(() => {
    // 标题与面包屑
    dispatch.pageHeader.setTitle(i18n.t('Load Testing Management').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([
      { key: 'data_admin', value: i18n.t('Data Management').toString(), path: '/chaos/expertise/admin' },
      { key: 'loadtest_admin', value: i18n.t('Load Testing Management').toString(), path: '/chaos/loadtest/admin' },
    ]));
    fetchList();
  }, []);

  useEffect(() => {
    fetchList();
  }, [ pageNum, pageSize, searchName, searchEngineType ]);

  async function fetchList() {
    try {
      await dispatch.loadTestDefinition.queryLoadTestDefinitions({
        pageNum,
        pageSize,
        name: searchName || undefined,
        engineType: searchEngineType || undefined,
      });
    } catch (error) {
      console.error('Failed to fetch load test definitions:', error);
      Message.error(i18n.t('Failed to load data').toString());
    }
  }

  function handleAdd() {
    setFormType('URL');
    field.setValues({
      name: '',
      engineType: 'JMETER',
      endpoint: '',
      entry: 'URL',
      method: 'GET',
      path: '',
      headers: '{}',
    });
    setCurrentRecord(null);
    setAddVisible(true);
  }

  function handleCancel() {
    setAddVisible(false);
    setEditVisible(false);
    setCurrentRecord(null);
    setUploadedFile(null);
    setEditUploadedFile(null);
    field.reset();
    editField.reset();
  }

  // 文件上传处理函数
  async function handleFileUpload(file: File, endpoint: string, isEdit = false) {
    const setUploadingState = isEdit ? setEditUploading : setUploading;
    const setFileState = isEdit ? setEditUploadedFile : setUploadedFile;

    try {
      setUploadingState(true);
      const result = await dispatch.loadTestDefinition.uploadJmxFile({
        file,
        endpoint,
      });

      setFileState(result);
      Message.success(i18n.t('File uploaded successfully').toString());
      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      Message.error(i18n.t('File upload failed').toString());
      throw error;
    } finally {
      setUploadingState(false);
    }
  }

  // Upload组件的beforeUpload处理
  function handleBeforeUpload(file: File, isEdit = false) {
    const endpoint = isEdit ? editField.getValue('endpoint') : field.getValue('endpoint');

    if (!endpoint || typeof endpoint !== 'string') {
      Message.error(i18n.t('Please enter endpoint first').toString());
      return false;
    }

    // 验证文件类型
    const allowedTypes = [ '.jmx', '.xml' ];
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.some(type => fileName.endsWith(type));

    if (!isValidType) {
      Message.error(i18n.t('Only JMX and XML files are allowed').toString());
      return false;
    }

    // 验证文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      Message.error(i18n.t('File size cannot exceed 10MB').toString());
      return false;
    }

    // 执行上传
    handleFileUpload(file, endpoint, isEdit);
    return false; // 阻止默认上传行为
  }

  async function handleSave(values: any) {
    try {
      // 构建请求参数
      const params: any = {
        name: values.name,
        engineType: values.engineType,
        endpoint: values.endpoint,
        entry: values.entry,
      };

      // 如果是URL类型，添加urlCase
      if (values.entry === 'URL') {
        params.urlCase = {
          method: values.method || 'GET',
          path: values.path || '/',
          headers: values.headers ? JSON.parse(values.headers) : {},
        };
      }

      // 如果是脚本类型，添加contentRef
      if (values.entry === 'SCRIPT') {
        if (uploadedFile && uploadedFile.accessUrl) {
          params.contentRef = uploadedFile.accessUrl;
        } else if (values.contentRef) {
          params.contentRef = values.contentRef;
        }
      }

      await dispatch.loadTestDefinition.createLoadTestDefinition(params);
      Message.success(i18n.t('Successful operation').toString());
      setAddVisible(false);
      fetchList();
    } catch (error) {
      console.error('Failed to create load test definition:', error);
      Message.error(i18n.t('Operation failed').toString());
    }
  }

  async function handleUpdate(values: any) {
    if (!currentRecord) return;

    try {
      const params: any = {
        id: currentRecord.id,
        name: values.name,
        engineType: values.engineType,
        endpoint: values.endpoint,
        entry: values.entry,
      };

      if (values.entry === 'URL') {
        params.urlCase = {
          method: values.method || 'GET',
          path: values.path || '/',
          headers: values.headers ? JSON.parse(values.headers) : {},
        };
      }

      if (values.entry === 'SCRIPT') {
        if (editUploadedFile && editUploadedFile.accessUrl) {
          params.contentRef = editUploadedFile.accessUrl;
        } else if (values.contentRef) {
          params.contentRef = values.contentRef;
        }
      }

      await dispatch.loadTestDefinition.updateLoadTestDefinition(params);
      Message.success(i18n.t('Successful operation').toString());
      setEditVisible(false);
      setCurrentRecord(null);
      fetchList();
    } catch (error) {
      console.error('Failed to update load test definition:', error);
      Message.error(i18n.t('Operation failed').toString());
    }
  }

  function handleView(record: ILoadTestDefinition) {
    // 查看详情的逻辑
    dispatch.loadTestDefinition.getLoadTestDefinition({ id: record.id });
    Message.notice(`${i18n.t('View').toString()}: ${record.name}`);
  }

  function handleEdit(record: ILoadTestDefinition) {
    setCurrentRecord(record);
    setFormType(record.entry);
    setEditUploadedFile(null); // 重置上传文件状态

    editField.setValues({
      name: record.name,
      engineType: record.engineType,
      endpoint: record.endpoint,
      entry: record.entry,
      method: record.urlCase?.method || 'GET',
      path: record.urlCase?.path || '/',
      headers: record.urlCase?.headers ? JSON.stringify(record.urlCase.headers, null, 2) : '{}',
      contentRef: record.contentRef || '',
    });
    setEditVisible(true);
  }

  function handleDelete(record: ILoadTestDefinition) {
    Dialog.confirm({
      title: i18n.t('Delete').toString(),
      content: `${i18n.t('Are you sure you want to delete it?').toString()} ${record.name}`,
      onOk: async () => {
        try {
          await dispatch.loadTestDefinition.deleteLoadTestDefinition({ id: record.id });
          Message.success(i18n.t('Successful operation').toString());
          fetchList();
        } catch (error) {
          console.error('Failed to delete load test definition:', error);
          Message.error(i18n.t('Operation failed').toString());
        }
      },
    });
  }

  const renderName: any = (value: string, index: number, record: ILoadTestDefinition) => {
    return <span className={styles.recordName} data-index={index} onClick={() => handleView(record)}>{value}</span>;
  };

  const renderEngineType: any = (value: string) => {
    const typeMap: Record<string, string> = {
      JMETER: 'JMeter',
      K6: 'K6',
      LOCUST: 'Locust',
    };
    return typeMap[value] || value;
  };

  const renderEntry: any = (value: string) => {
    return value === 'URL' ? i18n.t('URL Configuration').toString() : i18n.t('Script File').toString();
  };

  const renderCreatedAt: any = (value: string) => {
    return value ? formatDate(new Date(value).getTime()) : '-';
  };

  const renderActions: any = (_: any, __: number, record: ILoadTestDefinition) => {
    return (
      <Actions className={styles.operations} direction='hoz'>
        <LinkButton onClick={() => handleView(record)}><Translation>View</Translation></LinkButton>
        <LinkButton onClick={() => handleEdit(record)}><Translation>Edit</Translation></LinkButton>
        <LinkButton onClick={() => handleDelete(record)}><Translation>Delete</Translation></LinkButton>
      </Actions>
    );
  };

  function renderAddDialog() {
    return (
      <Dialog
        visible={addVisible}
        title={i18n.t('Add Load Testing Definition').toString()}
        onClose={handleCancel}
        onCancel={handleCancel}
        onOk={() => field.validate((err: any, values: any) => { if (!err) handleSave(values); })}
        style={{ width: 800 }}
        locale={locale().Dialog}
      >
        <div className={styles.dialogContent}>
          <Form field={field} fullWidth labelAlign='top'>
            <FormItem label={i18n.t('Name').toString()} required requiredMessage={i18n.t('Please enter name').toString()}>
              <Input name='name' placeholder={i18n.t('Please enter name').toString()} />
            </FormItem>

            <FormItem label={i18n.t('Engine Type').toString()} required requiredMessage={i18n.t('Please select engine type').toString()}>
              <Select name='engineType' dataSource={[
                { label: 'JMeter', value: 'JMETER' },
                { label: 'K6', value: 'K6' },
                { label: 'Locust', value: 'LOCUST' },
              ]} placeholder={i18n.t('Please select engine type').toString()} />
            </FormItem>

            <FormItem label={i18n.t('Endpoint').toString()} required requiredMessage={i18n.t('Please enter endpoint').toString()}>
              <Input name='endpoint' placeholder='http://example.com' />
            </FormItem>

            <FormItem label={i18n.t('Entry Type').toString()} required>
              <RadioGroup value={formType} onChange={v => setFormType(v as any)}>
                <Radio value='URL'><Translation>URL Configuration</Translation></Radio>
                <Radio value='SCRIPT'><Translation>Script File</Translation></Radio>
              </RadioGroup>
            </FormItem>

            {formType === 'SCRIPT' && (
              <>
                <FormItem label={i18n.t('Upload Script File').toString()}>
                  <Upload
                    listType="text"
                    beforeUpload={file => handleBeforeUpload(file, false)}
                    accept=".jmx,.xml"
                  >
                    <Button loading={uploading} disabled={uploading}>
                      <Icon type="upload" />
                      {uploading ? i18n.t('Uploading...').toString() : i18n.t('Select File').toString()}
                    </Button>
                  </Upload>
                  {uploadedFile && (
                    <div style={{ marginTop: 8, padding: 8, background: '#f6f8fa', borderRadius: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#28a745' }}>
                        <Icon type="success" style={{ marginRight: 4 }} />
                        <span>{uploadedFile.originalFileName}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        {i18n.t('File size').toString()}: {(uploadedFile.fileSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  )}
                </FormItem>
                <FormItem label={i18n.t('Or enter file URL').toString()}>
                  <Input
                    name='contentRef'
                    placeholder={i18n.t('File URL or reference').toString()}
                    disabled={!!uploadedFile}
                  />
                  {uploadedFile && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                      {i18n.t('File uploaded, URL input is disabled').toString()}
                    </div>
                  )}
                </FormItem>
              </>
            )}

            {formType === 'URL' && (
              <>
                <FormItem label={i18n.t('Request method').toString()} required>
                  <Select name='method' dataSource={[ 'GET', 'POST', 'PUT', 'DELETE' ]} defaultValue='GET' />
                </FormItem>
                <FormItem label={i18n.t('Path').toString()} required requiredMessage={i18n.t('Please enter path').toString()}>
                  <Input name='path' placeholder='/api/test' />
                </FormItem>
                <FormItem label={i18n.t('Headers').toString()}>
                  <Input.TextArea name='headers' placeholder='{"Content-Type": "application/json"}' />
                </FormItem>
              </>
            )}
          </Form>
        </div>
      </Dialog>
    );
  }

  function renderEditDialog() {
    return (
      <Dialog
        visible={editVisible}
        title={i18n.t('Edit Load Testing Definition').toString()}
        onClose={handleCancel}
        onCancel={handleCancel}
        onOk={() => editField.validate((err: any, values: any) => { if (!err) handleUpdate(values); })}
        style={{ width: 800 }}
        locale={locale().Dialog}
      >
        <div className={styles.dialogContent}>
          <Form field={editField} fullWidth labelAlign='top'>
            <FormItem label={i18n.t('Name').toString()} required requiredMessage={i18n.t('Please enter name').toString()}>
              <Input name='name' placeholder={i18n.t('Please enter name').toString()} />
            </FormItem>

            <FormItem label={i18n.t('Engine Type').toString()} required requiredMessage={i18n.t('Please select engine type').toString()}>
              <Select name='engineType' dataSource={[
                { label: 'JMeter', value: 'JMETER' },
                { label: 'K6', value: 'K6' },
                { label: 'Locust', value: 'LOCUST' },
              ]} placeholder={i18n.t('Please select engine type').toString()} />
            </FormItem>

            <FormItem label={i18n.t('Endpoint').toString()} required requiredMessage={i18n.t('Please enter endpoint').toString()}>
              <Input name='endpoint' placeholder='http://example.com' />
            </FormItem>

            <FormItem label={i18n.t('Entry Type').toString()} required>
              <RadioGroup value={formType} onChange={v => setFormType(v as any)}>
                <Radio value='URL'><Translation>URL Configuration</Translation></Radio>
                <Radio value='SCRIPT'><Translation>Script File</Translation></Radio>
              </RadioGroup>
            </FormItem>

            {formType === 'SCRIPT' && (
              <>
                <FormItem label={i18n.t('Upload Script File').toString()}>
                  <Upload
                    listType="text"
                    beforeUpload={file => handleBeforeUpload(file, true)}
                    accept=".jmx,.xml"
                  >
                    <Button loading={editUploading} disabled={editUploading}>
                      <Icon type="upload" />
                      {editUploading ? i18n.t('Uploading...').toString() : i18n.t('Select File').toString()}
                    </Button>
                  </Upload>
                  {editUploadedFile && (
                    <div style={{ marginTop: 8, padding: 8, background: '#f6f8fa', borderRadius: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#28a745' }}>
                        <Icon type="success" style={{ marginRight: 4 }} />
                        <span>{editUploadedFile.originalFileName}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        {i18n.t('File size').toString()}: {(editUploadedFile.fileSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  )}
                </FormItem>
                <FormItem label={i18n.t('Or enter file URL').toString()}>
                  <Input
                    name='contentRef'
                    placeholder={i18n.t('File URL or reference').toString()}
                    disabled={!!editUploadedFile}
                  />
                  {editUploadedFile && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                      {i18n.t('File uploaded, URL input is disabled').toString()}
                    </div>
                  )}
                </FormItem>
              </>
            )}

            {formType === 'URL' && (
              <>
                <FormItem label={i18n.t('Request method').toString()} required>
                  <Select name='method' dataSource={[ 'GET', 'POST', 'PUT', 'DELETE' ]} defaultValue='GET' />
                </FormItem>
                <FormItem label={i18n.t('Path').toString()} required requiredMessage={i18n.t('Please enter path').toString()}>
                  <Input name='path' placeholder='/api/test' />
                </FormItem>
                <FormItem label={i18n.t('Headers').toString()}>
                  <Input.TextArea name='headers' placeholder='{"Content-Type": "application/json"}' />
                </FormItem>
              </>
            )}
          </Form>
        </div>
      </Dialog>
    );
  }

  return (
    <div className={styles.warp}>
      <div className={styles.searchButton}>
        <Button type='primary' onClick={handleAdd}>
          {i18n.t('Add Load Testing Definition').toString()}
        </Button>
      </div>
      <div className={styles.searchFilters} style={{ marginBottom: 16 }}>
        <Input
          placeholder={i18n.t('Search by name').toString()}
          value={searchName}
          onChange={setSearchName}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          placeholder={i18n.t('Filter by engine type').toString()}
          value={searchEngineType}
          onChange={setSearchEngineType}
          style={{ width: 200, marginRight: 16 }}
          hasClear
        >
          <Select.Option value="">All</Select.Option>
          <Select.Option value="JMETER">JMeter</Select.Option>
          <Select.Option value="K6">K6</Select.Option>
          <Select.Option value="LOCUST">Locust</Select.Option>
        </Select>
        <Button onClick={fetchList}>
          <Translation>Search</Translation>
        </Button>
      </div>

      <div className={styles.tableContent}>
        <Table hasBorder={false} dataSource={loading ? [] : definitions} loading={loading} locale={locale().Table}>
          <Table.Column title={i18n.t('Name').toString()} dataIndex='name' width='20%' cell={renderName} />
          <Table.Column title={i18n.t('Engine Type').toString()} dataIndex='engineType' width='12%' cell={renderEngineType} />
          <Table.Column title={i18n.t('Entry Type').toString()} dataIndex='entry' width='12%' cell={renderEntry} />
          <Table.Column title={i18n.t('Endpoint').toString()} dataIndex='endpoint' width='25%' />
          <Table.Column title={i18n.t('Created By').toString()} dataIndex='createdBy' width='12%' />
          <Table.Column title={i18n.t('Create Time').toString()} dataIndex='createdAt' width='15%' cell={renderCreatedAt} />
          <Table.Column title={i18n.t('Operation').toString()} dataIndex='op' width='20%' cell={renderActions} />
        </Table>

        {total > pageSize && (
          <Pagination
            current={pageNum}
            total={total}
            pageSize={pageSize}
            onChange={current => setPageNum(current)}
            onPageSizeChange={size => {
              setPageSize(size);
              setPageNum(1);
            }}
            style={{ marginTop: 16, textAlign: 'right' }}
          />
        )}
      </div>
      {renderAddDialog()}
      {renderEditDialog()}
    </div>
  );
};

export default LoadTestAdmin;

