import React, { useEffect, useState } from 'react';
import styles from './index.css';
import { Dialog, Message, Select } from '@alicloud/console-components';
import { getParams } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';


const AddExperiment = (props: any) => {
  const workspaceId = getParams('workspaceId');
  const dispatch = useDispatch();
  const [ dataSource, setDataSource ] = useState([]);
  const [ addParams, setAddParams ] = useState([]);
  const [ searchKey, setSearchKey ] = useState('');
  const [ page, setPage ] = useState(1);


  useEffect(() => {
    (async function() {
      if (workspaceId && props.visible) {
        const { Data = false } = await dispatch.experimentList.searchExperiments({ searchKey, page, workspaceId });
        if (Data) {
          setDataSource(dataSource.concat(Data));
        }
      }
    })();
  }, [ searchKey, page, props.visible ]);

  async function addExprtiment() {
    const { Success, Data } = await dispatch.experimentList.addWorkspaceExperiment({ workspaceId, workspaceExperimentList: addParams });
    if (Success) {
      if (Data.duplicateExperiments.length !== 0) {
        Message.error('该演练已存在，请勿重复添加');
      } else {
        Message.success('添加成功');
        props.getExperimentTotals();
      }
    }
  }

  function renderContent(data: any) {
    return (
      <div>
        <div>{data.label}</div>
        <div className={styles.workspaceName}>来自空间：{data.workspaceName}</div>
      </div>
    );
  }

  function handleChange(value: any, actionType: string, items: any) {
    setAddParams(items.map((item: { value: string; label: string; }) => {
      return {
        experimentId: item.value,
        experimentName: item.label,
      };
    }));
  }

  function handleSearch(value: string) {
    setSearchKey(value);
  }

  function handleScroll(e: any) {
    const scrollHeight = e.target.scrollHeight; // 内容总高度
    const clientHeight = e.target.clientHeight; // 窗口高度
    const scrollTop = e.target.scrollTop; // 滚动高度
    if (scrollTop + clientHeight === scrollHeight) {
      setPage(page + 1);
    }
  }

  function handleSave() {
    addExprtiment();
    props.onCancel && props.onCancel();
  }

  return (
    <Dialog
      visible={props.visible}
      title='添加演练'
      onOk={handleSave}
      onCancel={props.onCancel}
      onClose={props.onCancel}
    >
      <div className={styles.warp}>
        <div className={styles.top}>可以从有“编辑演练”权限的其他空间选择演练添加到此空间。</div>
        <div className={styles.item}>
          <span className={styles.left}>选择演练</span>
          <Select
            autoHighlightFirstItem={false}
            placeholder='请选择想要添加的演练'
            className={styles.select}
            notFoundContent={'当前暂无可供选择添加的演练'}
            mode='multiple'
            showSearch
            dataSource={dataSource.map((item: any) => {
              return {
                label: item.experimentName,
                value: item.experimentId,
                workspaceName: item.workspaceName,
              };
            })}
            itemRender={renderContent}
            popupClassName={styles.popup}
            onChange={handleChange}
            onSearch={handleSearch}
            menuProps={{ onScroll: handleScroll }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default AddExperiment;
