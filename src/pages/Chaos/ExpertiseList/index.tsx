import ExpertiseCard from './ExpertiseCard';
import React, { FC, useEffect, useState } from 'react';
import TagsSearch from 'pages/Chaos/ExperimentList/TagsSearch';
import styles from './index.css';
import { Button, Icon, Loading, Pagination, Search, Select } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';

import { ISearchExpertiseRes } from 'config/interfaces/Chaos/expertises';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

interface IProps {
  noFooter: boolean;
  onChose: (value: any) => void;
  onEmpty: () => void;
  hideEmpty?: boolean; //  是否显示从空白创建card
}

const DATA = [
  {
    value: '0',
    label: '主机',
  },
  {
    value: '2',
    label: 'Kubernetes',
  },
];

const ExpertiseList: FC<IProps> = props => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [ selectId, setSelectId ] = useState('');
  const [ page, setPage ] = useState(1);
  const [ size, setSize ] = useState(10);
  const { expertiseData, expertiseTotal, loading } = useSelector(state => {
    return {
      expertiseData: state.expertises.expertise.expertises,
      expertiseTotal: state.expertises.expertise.total,
      loading: state.loading.effects['expertises/getExpertiseBase'],
    };
  });
  const [ key, setKey ] = useState('');
  const [ tags, setTags ] = useState([]);
  const [ tagValues, setTagValues ] = useState<string[]>([]);
  const [ scopeType, setScopeType ] = useState('');

  useEffect(() => {
    if (!props.noFooter) {
      dispatch.pageHeader.setNameSpace(false);
      dispatch.pageHeader.setTitle('演练经验库');
      dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
        {
          key: 'experiments_list',
          value: '演练经验库',
          path: '/chaos/expertise/list',
        },
      ]));
      return () => dispatch.expertises.clearExperiseList();
    }
  }, []);

  useEffect(() => {
    (async function() {
      await dispatch.expertises.getExpertiseBase({ page, size, key, tagNames: tagValues, scopeType });
    })();
  }, [ page, size, key, tagValues, scopeType ]);

  async function getExperiseSearchTags() {
    const { Data = false } = await dispatch.expertises.getExperiseSearchTags({ key: '' });
    if (Data) {
      setTags(Data);
    }
  }

  function handleOnSelect(value: ISearchExpertiseRes) {
    const { onChose } = props;
    onChose && onChose(value);
    setSelectId(value && value.expertise_id);
  }

  function handlePaginationChange(value: number) {
    value && setPage(value);
  }

  function handlePageSizeChange(value: number) {
    value && setSize(value);
  }

  function renderExpertise() {
    if (expertiseData.length !== 0 || props.noFooter) {
      return (
        <>
          {props.noFooter && !props.hideEmpty &&
           <div className={styles.emptyCard} onClick={props.onEmpty}>
             <div className={styles.iconContent}>
               <Icon type="add" className={styles.addIcon} />
               <div>从空白创建</div>
             </div>
           </div>
          }
          {expertiseData.map((item: ISearchExpertiseRes) => {
            const isSelect = item.expertise_id === selectId;
            return (
              <div className={styles.cardList} key={item.expertise_id}>
                <ExpertiseCard
                  // hover={props.noFooter}
                  noFooter={props.noFooter}
                  expertise={item}
                  isSelect={isSelect}
                  onClick={handleOnSelect}
                />
              </div>
            );
          })}
          <Pagination
            className={styles.Pagination}
            current={page}
            total={expertiseTotal}
            pageSize={size}
            hideOnlyOnePage={true}
            pageSizeSelector="dropdown"
            pageSizePosition="start"
            onChange={handlePaginationChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      );
    }
    if (key || tagValues.length !== 0) {
      return (
        <div className={styles.noData}>
          <div>
            <img style={{ width: 100 }} src="https://img.alicdn.com/tfs/TB1SxZ2u639YK4jSZPcXXXrUFXa-238-230.png" alt=""/>
            <div style={{ textAlign: 'center' }}>未匹配到经验库</div>
          </div>
        </div>
      );
    }
  }

  function handleSearchTags(value: string[]) {
    setTagValues(value);
  }

  return (
    <>
      <div className={styles.searchOpt}>
        <div>
          <TagsSearch
            data={tags}
            onSubmit={handleSearchTags}
            tagNames={tagValues}
            onFocus={getExperiseSearchTags}
          />
          <Search
            shape={'simple'}
            placeholder='请输入经验库名称'
            onSearch={value => setKey(value)}
            onChange={value => {
              if (!value) {
                setKey(value);
              }
            }}
            hasClear
          />
          <Select
            dataSource={DATA}
            placeholder='请选择应用类型'
            style={{ marginLeft: 8, width: 140 }}
            onChange={e => setScopeType(e)}
            hasClear={!!scopeType}
            value={scopeType}
          />
        </div>
        <Button type="primary" onClick={() => pushUrl(history, '/chaos/expertise/admin')}>经验库管理</Button>
      </div>
      {props.noFooter ?
        <div className={styles.TemplatesContent}>
          {renderExpertise()}
        </div> :
        <Loading visible={loading} style={{ display: 'block' }}>
          <div className={styles.TemplatesContent}>
            {renderExpertise()}
          </div>
        </Loading>
      }
    </>
  );
};

export default ExpertiseList;
