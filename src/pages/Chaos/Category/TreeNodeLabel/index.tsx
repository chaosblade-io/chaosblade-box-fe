import React from 'react';
import {
  Button,
  Dialog,
} from '@alicloud/console-components';
import { ICatetorItem } from 'config/interfaces/Chaos/scene';

interface IProps {
  data: ICatetorItem;
  handleEditTree: (params: ICatetorItem) => void;
  categoryId: string;
  deleteCategory: (categoryId: string) => void;
}

const TreeNodeLabel = (props: IProps) => {
  const { data, handleEditTree, categoryId, deleteCategory } = props;
  return (
    <div>
      <span>{data.name}</span>
      <Button
        text
        type="primary"
        onClick={() => {
          handleEditTree(data);
        }}
        style={{ marginLeft: 10, marginBottom: 3 }}
      >
        编辑
      </Button>
      <Button
        text
        type="primary"
        onClick={() => {
          Dialog.confirm({
            title: '确认删除',
            content: '删除后此节点下的所有节点都会被删除，请谨慎操作',
            onOk: () => deleteCategory(categoryId),
          });
        }}
        style={{ marginLeft: 10, marginBottom: 3 }}
      >
        删除
      </Button>
    </div>
  );
};

export default TreeNodeLabel;
