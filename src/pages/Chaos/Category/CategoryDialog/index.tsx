import React, { useEffect, useState } from 'react';
import _ from 'lodash';
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
  { label: '普通分组', value: '0' },
  { label: '全局观察分组', value: '1' },
  { label: '全局守护分组', value: '2' },
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
      title={data ? '编辑类目' : '新增类目'}
      visible={props.visible}
      onClose={props.handleOnCancel}
      onCancel={props.handleOnCancel}
      onOk={handleSubmit}
      style={{ width: 600 }}
    >
      <Form {...formLayout} field={field}>
        <Form.Item label="类目名称" required requiredMessage='请输入类目名称'>
          <Input name='name' defaultValue={_.get(data, 'name', '')} />
        </Form.Item>
        <Form.Item label="新增类目">
          <Radio.Group
            dataSource={[
              { label: '是', value: 'yes' },
              { label: '否', value: 'no' },
            ]}
            value={radioId}
            onChange={value => setRadioId(value as string)}
          />
        </Form.Item>
        {radioId === 'no' && (
          <Form.Item label="归属类目">
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
        <Form.Item label="小程序所属阶段" required requiredMessage='请选择小程序所属阶段名称'>
          <Select
            className={styles.inputEditor}
            dataSource={PHASE_FLAGS}
            name='phase'
            defaultValue={_.get(data, 'phase', '')}
          />
        </Form.Item>
        <Form.Item label="小程序分组类型" required requiredMessage='请选择小程序分组类型'>
          <Select
            className={styles.inputEditor}
            dataSource={groupType}
            name='type'
            defaultValue={_.get(data, 'type', '')}
          />
        </Form.Item>
        <Form.Item label="演练对象类型">
          <Select
            mode="multiple"
            className={styles.inputEditor}
            dataSource={DRILL_OBJ}
            name='supportScopeTypes'
            defaultValue={_.get(data, 'supportScopeTypes', [])}
          />
        </Form.Item>
      </Form>
    </Dialog>
  );
};

export default CategoryDialog;
