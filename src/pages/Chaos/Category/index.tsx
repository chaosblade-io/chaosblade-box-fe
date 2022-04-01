import CategoryDialog from './CategoryDialog';
import React, { useEffect, useState } from 'react';
import TreeNodeLabel from './TreeNodeLabel';
import _ from 'lodash';
import styles from './index.css';
import { Button, Message, Tree } from '@alicloud/console-components';
import { ICategoryEditorParams, ICatetorItem } from 'config/interfaces/Chaos/scene';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const Category = () => {
  const dispatch = useDispatch();
  const [ catetoryData, setCatetoryData ] = useState<ICatetorItem[]>([]);
  const [ visible, setVisible ] = useState(false);
  const [ flag, setFlag ] = useState(false);
  const [ record, setRecord ] = useState<ICatetorItem | null>(null);

  useEffect(() => {
    dispatch.pageHeader.setTitle('类目管理页');
  }, []);

  useEffect(() => {
    (async function() {
      const { Data = false } = await dispatch.scene.queryCategoryData();
      if (Data) {
        setCatetoryData(Data);
      }
    })();
  }, [ flag ]);

  function handleOnCancel() {
    setVisible(!visible);
    setRecord(null);
  }

  function handleEditTree(item: ICatetorItem) {
    setRecord(item);
    setVisible(true);
  }

  async function deleteCategory(categoryId: string) {
    const { Success = false } = await dispatch.category.deleteCategory({ categoryId });
    if (Success) {
      setFlag(!flag);
      setVisible(false);
      Message.success('操作成功');
    }
  }

  function handleDeconstructionTree(treeData: ICatetorItem[]) {
    return treeData.map((item: ICatetorItem) => {
      if (!_.isEmpty(item.children)) {
        return (
          <Tree.Node
            key={item.categoryId}
            label={
              <TreeNodeLabel
                categoryId={item.categoryId}
                data={item}
                handleEditTree={handleEditTree}
                deleteCategory={deleteCategory}
              />
            }
          >
            {handleDeconstructionTree(item.children)}
          </Tree.Node>
        );
      }
      return (
        <Tree.Node
          key={item.categoryId}
          label={
            <TreeNodeLabel
              categoryId={item.categoryId}
              data={item}
              handleEditTree={handleEditTree}
              deleteCategory={deleteCategory}
            />
          }
        />
      );

    });
  }

  async function handleAddCategory(params: ICategoryEditorParams) {
    const res = await dispatch.category.addCategory({ ...params });
    const { Success = false } = res;
    if (Success) {
      Message.success('操作成功');
      setFlag(!flag);
      setVisible(false);
    }
  }

  async function handleEditorCategory(params: ICategoryEditorParams) {
    const { Success = false } = await dispatch.category.updateCategory({ ...params });
    if (Success) {
      Message.success('操作成功');
      setFlag(!flag);
      setVisible(false);
      setRecord(null);
    }
  }

  return (
    <>
      <div className={styles.category}>
        <div>
          <Button onClick={handleOnCancel} type="primary">
            新增类目
          </Button>
        </div>
        <div className={styles.treeData}>
          <Tree selectable={false}>
            {handleDeconstructionTree(catetoryData)}
          </Tree>
        </div>
      </div>
      <CategoryDialog
        handleOnCancel={handleOnCancel}
        catetoryData={catetoryData}
        handleAddCategory={handleAddCategory}
        data={record}
        visible={visible}
        handleEditorCategory={handleEditorCategory}
      />
    </>
  );
};

export default Category;
