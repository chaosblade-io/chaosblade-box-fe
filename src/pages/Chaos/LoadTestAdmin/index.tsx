import Actions, { LinkButton } from '@alicloud/console-components-actions';
import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';

import formatDate from '../lib/DateUtil';
import i18n from '../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Button, Dialog, Field, Form, Input, Message, NumberPicker, Radio, Select, Table, Upload } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';


const { Item: FormItem } = Form;
const { Group: RadioGroup } = Radio;

interface ILoadTestDef {
  id: string;
  name: string;
  type: 'HTTP' | 'FILE';
  status: 'ENABLED' | 'DISABLED';
  createdAt: number;
  engine: string;
  engineUrl: string;
}

const LoadTestAdmin: FC = () => {
  const dispatch = useDispatch();
  const [ loading, setLoading ] = useState(false);
  const [ dataSource, setDataSource ] = useState<ILoadTestDef[]>([]);

  const [ addVisible, setAddVisible ] = useState(false);
  const [ formType, setFormType ] = useState<'FILE'|'HTTP'>('FILE');
  const field = Field.useField();
  useEffect(() => {
    field.setValues({
      method: 'GET',
      concurrent: 1,
      duration: 60,
      engine: 'JMeter',
      engineUrl: 'http://localhost:8080',
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

  async function fetchList() {
    setLoading(true);
    try {
      // TODO: 接入后端接口。此处先用静态数据模拟
      const items: ILoadTestDef[] = [
        { id: '1', name: '示例压测-HTTP', type: 'HTTP', status: 'ENABLED', createdAt: Date.now() - 86400000, engine: 'JMeter', engineUrl: 'http://localhost:8080' },
        { id: '2', name: '示例压测-文件', type: 'FILE', status: 'DISABLED', createdAt: Date.now() - 172800000, engine: 'Locust', engineUrl: 'http://localhost:8089' },
      ];
      setDataSource(items);

    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setFormType('FILE');
    field.setValues({
      method: 'GET',
      url: '',
      headers: '',
      body: '',
      concurrent: 1,
      duration: 60,
      engine: 'JMeter',
      engineUrl: 'http://localhost:8080',
    });
    setAddVisible(true);
  }

  function handleCancel() {
    setAddVisible(false);
  }

  function handleSave(values: any) {
    // 简单校验
    if (formType === 'HTTP') {
      if (!values.url) {
        Message.error(i18n.t('Please enter URL').toString());
        return;
      }
    }
    if (!values.engine) {
      Message.error(i18n.t('Please select engine').toString());
      return;
    }
    if (!values.engineUrl) {
      Message.error(i18n.t('Please enter engine URL').toString());
      return;
    }
    // TODO: 提交到后端
    Message.success(i18n.t('Successful operation').toString());
    setAddVisible(false);
    fetchList();
  }

  function handleView(record: ILoadTestDef) {
    Message.notice(`${i18n.t('View').toString()}: ${record.name}`);
  }
  function handleEdit(record: ILoadTestDef) {
    Message.notice(`${i18n.t('Edit').toString()}: ${record.name}`);
  }
  function handleDelete(record: ILoadTestDef) {
    Dialog.confirm({
      title: i18n.t('Delete').toString(),
      content: `${i18n.t('Are you sure you want to delete it?').toString()} ${record.name}`,
      onOk: () => {
        Message.success(i18n.t('Successful operation').toString());
        fetchList();
      },
    });
  }

  const renderName: any = (value: string, index: number, record: ILoadTestDef) => {
    return <span className={styles.recordName} data-index={index} onClick={() => handleView(record)}>{value}</span>;
  };

  const renderActions: any = (_: any, __: number, record: ILoadTestDef) => {
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

            <FormItem label={i18n.t('Engine').toString()} required requiredMessage={i18n.t('Please select engine').toString()}>
              <Select name='engine' dataSource={[
                { label: 'JMeter', value: 'JMeter' },
                { label: 'Locust', value: 'Locust' },
                { label: 'Gatling', value: 'Gatling' },
                { label: 'K6', value: 'K6' },
                { label: i18n.t('Custom').toString(), value: 'Custom' },
              ]} placeholder={i18n.t('Please select engine').toString()} />
            </FormItem>

            <FormItem label={i18n.t('Engine URL').toString()} required requiredMessage={i18n.t('Please enter engine URL').toString()}>
              <Input name='engineUrl' placeholder='http://localhost:8080' />
            </FormItem>

            <FormItem label={i18n.t('Type').toString()} required>
              <RadioGroup value={formType} onChange={v => setFormType(v as any)}>
                <Radio value='FILE'><Translation>Upload configuration file</Translation></Radio>
                <Radio value='HTTP'><Translation>Custom HTTP</Translation></Radio>
              </RadioGroup>
            </FormItem>

            {formType === 'FILE' && (
              <FormItem label={i18n.t('Upload configuration file').toString()} required>
                <Upload
                  listType='text'
                  action='/'
                  limit={1}
                />
              </FormItem>
            )}

            {formType === 'HTTP' && (
              <>
                <FormItem label={i18n.t('Request method').toString()} required>
                  <Select name='method' dataSource={[ 'GET', 'POST', 'PUT', 'DELETE' ]} defaultValue='GET' />
                </FormItem>
                <FormItem label='URL' required requiredMessage={i18n.t('Please enter URL').toString()}>
                  <Input name='url' placeholder='https://example.com/api' />
                </FormItem>
                <FormItem label={i18n.t('Headers').toString()}>
                  <Input.TextArea name='headers' placeholder='{ "Content-Type": "application/json" }' />
                </FormItem>
                <FormItem label={i18n.t('Request body').toString()}>
                  <Input.TextArea name='body' placeholder='{"key":"value"}' />
                </FormItem>
                <FormItem label={i18n.t('Concurrent users').toString()} required>
                  <NumberPicker name='concurrent' min={1} max={10000} />
                </FormItem>
                <FormItem label={i18n.t('Duration (seconds)').toString()} required>
                  <NumberPicker name='duration' min={1} max={36000} />
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
      <div className={styles.tableContent}>
        <Table hasBorder={false} dataSource={loading ? [] : dataSource} loading={loading} locale={locale().Table}>
          <Table.Column title={i18n.t('Name').toString()} dataIndex='name' width='15%' cell={renderName} />
          <Table.Column title={i18n.t('Type').toString()} dataIndex='type' width='10%' />
          <Table.Column title={i18n.t('Engine').toString()} dataIndex='engine' width='10%' />
          <Table.Column title={i18n.t('Engine URL').toString()} dataIndex='engineUrl' width='20%' />
          <Table.Column title={i18n.t('Status').toString()} dataIndex='status' width='10%' />
          <Table.Column title={i18n.t('Create Time').toString()} dataIndex='createdAt' width='15%' cell={formatDate} />
          <Table.Column title={i18n.t('Operation').toString()} dataIndex='op' width='20%' cell={renderActions} />
        </Table>
      </div>
      {renderAddDialog()}
    </div>
  );
};

export default LoadTestAdmin;

