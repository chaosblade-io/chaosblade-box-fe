import React, { useEffect, useState } from 'react';
import * as _ from 'lodash';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { DRILL_OBJ, PHASE_FLAGS } from 'config/constants/Chaos/FunctionConstants';
import {
  Dialog,
  Field,
  Form,
  Input,
  Radio,
  Select,
  TreeSelect,
} from '@alicloud/console-components';
import { ICatetorItem } from 'config/interfaces/Chaos/scene';


const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 },
};

const groupType = [
  { label: i18n.t('Normal grouping'), value: '0' },
  { label: i18n.t('Global observation group'), value: '1' },
  { label: i18n.t('Global Guardian Group'), value: '2' },
];

interface IProps {
  catetoryData: ICatetorItem[];
  handleAddCategory: (params: any) => void;
  handleEditorCategory: (params: any) => void;
  visible: boolean;
  data: ICatetorItem | null;
  handleOnCancel: () => void;
}

const CategoryDialog = (props: IProps) => {
  const { catetoryData = [], data } = props;
  const field = Field.useField();
  const [ radioId, setRadioId ] = useState('no');

  useEffect(() => {
    if (!_.get(data, 'parentId', '')) {
      setRadioId('yes');
    }
  }, [ data ]);

  function handleTreeSelect(treeData: ICatetorItem[]): any {
    return treeData.map(item => {
      if (!_.isEmpty(item.children)) {
        return {
          label: item.name,
          value: item.categoryId,
          children: handleTreeSelect(item.children),
        };
      }
      return {
        label: item.name,
        value: item.categoryId,
        children: [],
      };
    });
  }

  function handleSubmit() {
    field.validate((errors, values) => {
      if (!errors) {
        if (!data) {
          // 新增
          props.handleAddCategory({ ...values });
        } else {
          // 编辑
          props.handleEditorCategory({ ...values, categoryId: data.categoryId });
        }
      }
    });
  }

  return (
    <Dialog
      title={data ? i18n.t('Edit category').toString() : i18n.t('New category').toString()}
      visible={props.visible}
      onClose={props.handleOnCancel}
      onCancel={props.handleOnCancel}
      onOk={handleSubmit}
      style={{ width: 600 }}
      locale={locale().Dialog}
    >
      <Form {...formLayout} field={field}>
        <Form.Item label={i18n.t('Category name').toString()} required requiredMessage={i18n.t('Please enter a category name').toString()}>
          <Input name='name' defaultValue={_.get(data, 'name', '')} />
        </Form.Item>
        <Form.Item label={i18n.t('New category').toString()}>
          <Radio.Group
            dataSource={[
              { label: i18n.t('yes').toString(), value: 'yes' },
              { label: i18n.t('no').toString(), value: 'no' },
            ]}
            value={radioId}
            onChange={value => setRadioId(value as string)}
          />
        </Form.Item>
        {radioId === 'no' && (
          <Form.Item label={i18n.t('Attribution category').toString()}>
            <TreeSelect
              className={styles.inputEditor}
              dataSource={handleTreeSelect(catetoryData)}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              name='parentId'
              defaultValue={_.get(data, 'parentId', '')}
            />
          </Form.Item>
        )}
        <Form.Item label={i18n.t('The stage of the applet').toString()} required requiredMessage={i18n.t('Please select the stage name of the applet').toString()}>
          <Select
            className={styles.inputEditor}
            dataSource={PHASE_FLAGS}
            name='phase'
            defaultValue={_.get(data, 'phase', '')}
            locale={locale().Select}
          />
        </Form.Item>
        <Form.Item label={i18n.t('Mini Program Grouping Type').toString()} required requiredMessage={i18n.t('Please select the applet grouping type').toString()}>
          <Select
            className={styles.inputEditor}
            dataSource={groupType}
            name='type'
            defaultValue={_.get(data, 'type', '')}
            locale={locale().Select}
          />
        </Form.Item>
        <Form.Item label={i18n.t('Walkthrough Object Type').toString()}>
          <Select
            mode="multiple"
            className={styles.inputEditor}
            dataSource={DRILL_OBJ}
            name='supportScopeTypes'
            defaultValue={_.get(data, 'supportScopeTypes', [])}
            locale={locale().Select}
          />
        </Form.Item>
      </Form>
    </Dialog>
  );
};

export default CategoryDialog;
