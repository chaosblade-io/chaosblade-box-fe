import React, { FC, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './index.css';
import { Button, Icon, Select, Tag } from '@alicloud/console-components';

const { Group: TagGroup, Closeable: ClosableTag } = Tag;

interface IProps {
  data: string[];
  onSubmit: (params: any) => void;
  tagNames: string[];
  onFocus: () => void;
}

const TagsSearch: FC<IProps> = props => {
  const [ optionTags, setOptionTags ] = useState<string[] | null>(null);
  const [ searchTags, setSearchTags ] = useState<string[]>([]);
  const [ keyTags, setKeyTags ] = useState<string[] | string>('');
  const [ selectVisible, setSelectVisible ] = useState(false);

  useEffect(() => {
    const { tagNames } = props;
    if (!_.isEqual(tagNames, searchTags)) {
      setSearchTags([ ...tagNames ]);
    }
  }, [ props.tagNames ]);

  useEffect(() => {
    const { data } = props;
    if (_.isEmpty(keyTags)) {
      setOptionTags(data);
    }
  }, [ props.data ]);

  // useEffect(() => {
  //   const { onSubmit } = props;
  //   if (!_.isEmpty(searchTags)) {
  //     onSubmit && onSubmit(searchTags);
  //   }
  // }, [ searchTags ]);


  function handleSelectItem(value: string) {
    const exit = _.find(searchTags, (t: string) => t === value);
    if (!exit) {
      if (searchTags.length <= 4) {
        setSearchTags(_.concat(searchTags, value));
      }
    } else {
      setSearchTags(_.filter(searchTags, (t: string) => t !== value));
    }
  }

  function handleReset() {
    setSearchTags([]);
    setKeyTags([]);
    const { onSubmit } = props;
    onSubmit && onSubmit([]);
  }

  function handleSubmit() {
    const { onSubmit } = props;
    onSubmit && onSubmit(searchTags);
    setSelectVisible(false);
  }

  function renderOptions() {
    if (optionTags) {
      if (!_.isEmpty(optionTags)) {
        return optionTags.map(tag => {
          const exit = _.find(searchTags, (t: string) => t === tag);
          if (exit) {
            return <div className={classnames(styles.item, styles.chiosedTag)} onClick={() => handleSelectItem(tag)} key={tag} title={tag}>
              {tag}
              <Icon type="select" className={styles.selectIcon} />
            </div>;
          }
          return <div className={styles.item} onClick={() => handleSelectItem(tag)} key={tag} title={tag}>{tag}</div>;
        });
      }
      return <div className={styles.noItem}><Translation>No options</Translation></div>;
    }
    // if (_.isEmpty(keyTags)) {
    //   return <Icon type="loading" className={styles.loading} />;
    // }
  }

  function renderPopupContent() {
    return <div className={styles.tagContent}>
      <div className={styles.chiosed}>
        <div className={styles.tagsWord}>最多选择5个标签，当前已选{searchTags && searchTags.length}个：</div>
        <div className={styles.tagsList}>
          <TagGroup>
            {
              !_.isEmpty(searchTags) && searchTags.map(it => {
                return <ClosableTag
                  onClose={() => {
                    handleSelectItem(it);
                    return false;
                  }}
                  key={it}
                >{it}</ClosableTag>;
              })
            }
          </TagGroup>
        </div>
      </div>
      <div className={styles.optionContent}>
        {renderOptions()}
      </div>
      <div className={styles.actionButton}>
        <Button.Group>
          <Button type="primary" onClick={handleSubmit}>确定</Button>
          <span className={styles.reset} onClick={handleReset}>重置</span>
        </Button.Group>
      </div>
    </div>;
  }

  function handleSearch(val: string) {
    setKeyTags(val);
    const { data } = props;
    const reg = new RegExp(`(.*)(${val.split('').join(')(.*)(')})(.*)`, 'i');
    if (!_.isEmpty(val)) {
      const filterList: any = [];
      for (let i = 0; i < data.length; i++) {
        if (reg.test(data[i])) {
          filterList.push(data[i]);
        }
      }
      setOptionTags(filterList);
    } else {
      setOptionTags(data);
    }
  }

  function handleVisible(visible: boolean) {
    setSelectVisible(!selectVisible);
    if (!selectVisible) {
      setOptionTags(null);
      setKeyTags([]);
    }
    if (visible) {
      props.onFocus();
    }
  }

  function renderPlaceholder() {
    const { tagNames } = props;
    if (selectVisible) {
      return `已选${searchTags && searchTags.length}个标签`;
    }
    return `已选${tagNames && tagNames.length}个标签`;
  }

  return (
    <div className={styles.tagSearch}>
      <Select
        showSearch
        style={{ width: '100%' }}
        placeholder={renderPlaceholder()}
        onSearch={handleSearch}
        popupContent={renderPopupContent()}
        onVisibleChange={handleVisible}
        visible={selectVisible}
      />
    </div>
  );
};

export default TagsSearch;
