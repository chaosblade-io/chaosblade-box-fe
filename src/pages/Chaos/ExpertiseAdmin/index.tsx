import Actions, { LinkButton } from '@alicloud/console-components-actions';
import React, { FC, useEffect, useState } from 'react';
import TagsSearch from 'pages/Chaos/ExperimentList/TagsSearch';
import Translation from 'components/Translation';
import _ from 'lodash';
import formatDate from '../lib/DateUtil';
import i18n from '../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Balloon, Button, Dialog, Message, Pagination, Search, Table, Tag } from '@alicloud/console-components';
import { ISearchExpertiseRes } from 'config/interfaces/Chaos/expertises';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { pushUrl, removeParams } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const ExpertiseAdmin: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { loading } = useSelector(state => {
    return {
      loading: state.loading.effects['expertises/getAdminExpertiseBase'],
    };
  });

  const [ dataSource, setDataSource ] = useState<ISearchExpertiseRes[]>([]);
  const [ page, setPage ] = useState(1);
  const [ key, setKey ] = useState('');
  const [ total, setTotal ] = useState(0);
  const [ tags, setTags ] = useState([]);
  const [ tagValues, setTagValues ] = useState<string[]>([]);

  useEffect(() => {
    // dispatch.pageHeader.setNameSpace(false);
    dispatch.pageHeader.setTitle(i18n.t('Drill Experience Base Management').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'expertise_admin',
        value: i18n.t('Drill Experience Base Management').toString(),
        path: '/chaos/expertise/admin',
      },
    ]));
    removeParams('expertiseId');
  }, []);

  useEffect(() => {
    getAdminExpertiseBase();
  }, [ page, key, tagValues ]);

  async function getAdminExpertiseBase() {
    const { Data } = await dispatch.expertises.getAdminExpertiseBase({ page, key, size: 10, tagNames: tagValues });
    if (!_.isEmpty(Data)) {
      const { content = [], total } = Data;
      setDataSource(content);
      setTotal(total);
    }
  }

  function handleSearchExpBase(value: string) {
    setKey(value);
    setPage(1);
  }

  function handleClearKey(e: any) {
    if (!e) {
      setKey(''); // 全部清空搜索值后默认显示全部
    }
  }

  function handlePageChange(value: number) {
    if (value) {
      setPage(value);
    }
  }

  function handleGoOnlineExperience(id: string) {
    // 调用上线接口
    Dialog.confirm({
      title: i18n.t('Confirm online').toString(),
      async onOk() {
        const { success } = await dispatch.expertises.goOnlineExpertise({ expertise_id: id });
        if (success) {
          Message.success(i18n.t('Successful operation'));
          getAdminExpertiseBase();
        }
      },
      locale: locale().Dialog,
    });
  }

  async function handleCloneExperience(name: string, id: string) {
    // 拷贝
    await dispatch.expertiseEditor.cloneExperience({ expertise_id: id, name }, () => {
      pushUrl(history, 'editor', { cloneState: 1 });
    });
  }

  function handleDeleteExperience(id: string) {
    // 调用删除接口
    Dialog.confirm({
      title: i18n.t('Confirm delete').toString(),
      async onOk() {
        const { success } = await dispatch.expertises.deleteExpertise({ expertise_id: id });
        if (success) {
          Message.success(i18n.t('Successfully deleted'));
          getAdminExpertiseBase();
        }
      },
      locale: locale().Dialog,
    });
  }

  function handleOfflineExperience(id: string) {
    // 下线接口
    Dialog.confirm({
      title: i18n.t('Confirm offline').toString(),
      async onOk() {
        const { success } = await dispatch.expertises.offlineExpertise({ expertise_id: id });
        if (success) {
          Message.success(i18n.t('Successful operation'));
          getAdminExpertiseBase();
        }
      },
      locale: locale().Dialog,
    });
  }

  function handleUpdateExpertise(record: ISearchExpertiseRes) {
    if (record && record.expertise_id) {
      (async function() {
        await dispatch.expertiseEditor.getExpertise({ expertise_id: record.expertise_id }, res => {
          if (res) {
            pushUrl(history, 'editor', { expertiseId: record.expertise_id });
          }
        });
      })();
    }
  }

  const handleNameHref: any = (value: string, index: number, record: ISearchExpertiseRes) => {
    if (record && record.name) {
      return <span className={styles.recordName} onClick={() => handleUpdateExpertise(record)}>{record.name}</span>;
    }
    return;
  };

  const renderOperation: any = (value: boolean, index: number, record: ISearchExpertiseRes) => {
    const { state, expertise_id: id, name } = record;

    return (
      <Actions>
        {
          !state ? <LinkButton onClick={() => handleGoOnlineExperience(id)}><Translation>Online</Translation></LinkButton> :
            <LinkButton onClick={() => handleOfflineExperience(id)}><Translation>Offline</Translation></LinkButton>
        }
        <LinkButton onClick={() => handleCloneExperience(name, id)}><Translation>Copy</Translation></LinkButton>
        <LinkButton onClick={() => handleDeleteExperience(id)}><Translation>Delete</Translation></LinkButton>
      </Actions>
    );
  };

  const renderTags: any = (value: string[]) => {
    if (!value || value.length === 0) return '-';
    return _.map(value, (item: string, index: number) => {
      if (index < 2) {
        return <Balloon.Tooltip key={item} trigger={<Tag key={item} className="text-ellipsis" type="primary" size="small" style={{ marginRight: '4px', maxWidth: '80px' }} title={item}>{item}</Tag>} align='b'>{item}</Balloon.Tooltip>;
      } else if (index === 2) {
        return <Balloon key={index} trigger={<span>...</span>} closable={false}>
          {_.map(value, (v: string, i: number) => {
            return i >= 2 && <Tag key={v} type="primary" size="small" title={item} style={{ marginRight: '4px' }}>{v}</Tag>;
          })}
        </Balloon>;
      }
    });
  };

  // 判断权限 经验库
  const handleCreateExpertise = async () => {
    pushUrl(history, '/chaos/expertise/editor');
  };

  async function getExperiseAdminSearchTags() {
    const { Data = false } = await dispatch.expertises.getExperiseAdminSearchTags({ key: '', type: 3 });
    if (Data) {
      setTags(Data);
    }
  }

  function handleSearchTags(value: string[]) {
    setTagValues(value);
  }
  return (
    <>
      <div className={styles.warp}>
        <div className={styles.searchButton}>
          <Button type="primary" onClick={handleCreateExpertise}><Translation>Create an experience base</Translation></Button>
          <TagsSearch
            data={tags}
            onSubmit={handleSearchTags}
            tagNames={tagValues}
            onFocus={getExperiseAdminSearchTags}
          />
          <Search
            className={styles.search}
            shape="simple"
            placeholder={i18n.t('Please input the experience base name').toString()}
            onSearch={handleSearchExpBase}
            onChange={handleClearKey}
          />
        </div>
        <div className={styles.tableContent}>
          <Table hasBorder={false} dataSource={loading ? [] : dataSource} loading={loading} locale={locale().Table}>
            <Table.Column title={i18n.t('Experience Base Name').toString()} dataIndex="name" width='20%' cell={handleNameHref} />
            <Table.Column title={i18n.t('Tag').toString()} dataIndex="tags" width='15%' cell={renderTags} />
            <Table.Column title={i18n.t('Create Time').toString()} dataIndex="gmt_create" width='20%' cell={formatDate} />
            <Table.Column title={i18n.t('Update Time').toString()} dataIndex="gmt_modified" width='20%' cell={formatDate} />
            <Table.Column title={i18n.t('Number of Calls').toString()} dataIndex="experiment_count" width='10%' />
            <Table.Column title={i18n.t('Operation').toString()} width='15s%' cell={renderOperation} />
          </Table>
        </div>
        <div className={styles.footerPagination}>
          <Pagination
            current={page}
            total={total}
            locale={locale().Pagination}
            shape="arrow-only"
            pageSizePosition="start"
            hideOnlyOnePage={true}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default ExpertiseAdmin;
