import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
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
        Message.error(i18n.t('This walkthrough already exists, please do not add it again'));
      } else {
        Message.success(i18n.t('Added successfully'));
        props.getExperimentTotals();
      }
    }
  }

  function renderContent(data: any) {
    return (
      <div>
        <div>{data.label}</div>
        <div className={styles.workspaceName}><Translation>From space</Translation>: {data.workspaceName}</div>
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
      title={i18n.t('Add walkthrough').toString()}
      onOk={handleSave}
      onCancel={props.onCancel}
      onClose={props.onCancel}
      locale={locale().Dialog}
    >
      <div className={styles.warp}>
        <div className={styles.top}><Translation>Walkthroughs can be selected to add to this space from other spaces with Edit Walkthrough permissions</Translation></div>
        <div className={styles.item}>
          <span className={styles.left}><Translation>Choose a walkthrough</Translation></span>
          <Select
            autoHighlightFirstItem={false}
            placeholder={i18n.t('Please select the drill you want to add').toString()}
            className={styles.select}
            notFoundContent={i18n.t('There are currently no exercises to choose from').toString()}
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
            locale={locale().Select}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default AddExperiment;
