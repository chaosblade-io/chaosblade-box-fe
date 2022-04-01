import React, { FC, memo } from 'react';
import styles from './index.css';
import { AGENT_SEARCH } from 'config/constants';
import { Button, Icon, Search, Tag } from '@alicloud/console-components';

interface IPorps {
  filterText: string;
  searchKeywordList: string[];
  searchFilterKey: string;
  handleSearchChange: (val: string) => void;
  handleFilterSearch: (val: string, filterKey: string) => void;
  handleFilterSearchChange: () => void;
  tagSearchClose: (val: string, e?: any) => boolean;
  clearFilter: () => void;
}


const HeadHandler: FC<IPorps> = props => {
  const {
    filterText,
    searchKeywordList,
    searchFilterKey,
    handleSearchChange,
    handleFilterSearch,
    handleFilterSearchChange,
    tagSearchClose,
    clearFilter,
  } = props;

  return (
    <div className={styles.content}>
      <Search
        value={filterText}
        filter={AGENT_SEARCH}
        defaultFilterValue={'PrivateIpList'}
        onChange={handleSearchChange}
        onSearch={handleFilterSearch}
        onFilterChange={handleFilterSearchChange}
      />
      <span className={styles.info}> 当前仅支持精确查询 </span>
      <div>
        {searchKeywordList.length > 0 && (
          <span>
            <Icon type="filter" size="xs" />
            &nbsp;筛选：
          </span>
        )}
        {searchKeywordList.length > 0 &&
          searchKeywordList.map(item => (
            <Tag.Closeable
              key={item}
              onClose={tagSearchClose}
              data-id={item}
            >
              {AGENT_SEARCH.find(v => v.value === searchFilterKey)?.value +
                ': ' +
                item}
            </Tag.Closeable>
          ))}
        {searchKeywordList.length > 0 && (
          <Button
            onClick={clearFilter}
            style={{ background: '#fff', border: 'none' }}
          >
            清空
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(HeadHandler);
