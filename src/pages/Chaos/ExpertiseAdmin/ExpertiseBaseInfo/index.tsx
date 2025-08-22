import React, { useState } from 'react';
import * as _ from 'lodash';
import classnames from 'classnames';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Form, Input, Select } from '@alicloud/console-components';
import { IBasicInfo } from 'config/interfaces/Chaos/expertiseEditor';

// 匹配中文、字母、数字、下划线、正反斜杠
// const NORMAL_TEXT_REG = /^[\u4e00-\u9fa5_a-zA-Z0-9\/',_——，。]*$/;

interface ExpertiseBaseInfoProps{
  data: IBasicInfo;
  tags: string[];
  onSearchTags: (data: any) => void;
  onFocusTags: (data: any) => void;
  onUpdateBasinfo: (data: IBasicInfo) => void;
}

export default function ExpertiseBaseInfo(props: ExpertiseBaseInfoProps) {

  const [ overflowError, setOverflowError ] = useState(false);
  const [ overLengthError, setOverLengthError ] = useState(false);


  function handleExpertiseName(name: string) {
    // if (!validateText(name)) {
    //   return;
    // }
    handleBaseInfoUpdate('name', name);
  }

  function handleExpertiseDesc(value: string) {
    // if (!validateText(value)) {
    //   return;
    // }
    handleBaseInfoUpdate('function_desc', value);
  }

  function handleExpertiseTag(value: string[]) {
    if (!_.isEmpty(value) && value.length > 5) {
      setOverflowError(true);
      return;
    }

    if (!_.isEmpty(value)) {
      const overLengthValue = _.filter(value, (v: string) => v.length > 30);
      if (!_.isEmpty(overLengthValue)) {
        setOverLengthError(true);
        return;
      }
    }
    handleBaseInfoUpdate('tags', value);
    setOverflowError(false);
    setOverLengthError(false);

  }

  function handleSearchTag(key: string) {
    const { onSearchTags } = props;
    onSearchTags({ key, type: 3 });
  }

  function handleKeyUp(e: any) {
    if (e.keyCode === 13) {
      const value = e.target.value;
      if (!_.isEmpty(value)) {
        handleExpertiseTag(_.uniq(value));
      }
    }
  }

  function getErrorMessage() {
    if (overflowError) {
      return i18n.t('Fill up to 5');
    }
    if (overLengthError) {
      return i18n.t('1 label can contain up to 30 characters');
    }
    return '';
  }

  // function getActiveDraftBaseInfo() {
  //   const { data } = props;
  //   return _.get(data, 'basic_info', {});
  // }

  function handleBaseInfoUpdate(field: string, value: string | string[]) {
    const { onUpdateBasinfo, data: baseInfo } = props;
    // const baseInfo = getActiveDraftBaseInfo();
    baseInfo[ field ] = value;
    onUpdateBasinfo(baseInfo);
  }

  // function validateText(text) {
  //   if (NORMAL_TEXT_REG.test(text)) {
  //     return true;
  //   }
  //   return false;
  // };

  const { data } = props;

  return (
    <div className={styles.warp}>
      <Form>
        <Form.Item label={i18n.t('Experience name').toString()} required requiredTrigger="onBlur">
          <Input
            value={data && data.name || ''}
            className={styles.experienceBase}
            maxLength={50}
            showLimitHint
            placeholder={i18n.t('Please enter the experience database name').toString()}
            name={i18n.t('Experience name')}
            onChange={handleExpertiseName}
          />
        </Form.Item>
        <Form.Item label={i18n.t('Experience description').toString()} required requiredTrigger="onBlur">
          <Input.TextArea
            value={data && data.function_desc}
            className={styles.experienceBaseDescribe}
            maxLength={1000}
            showLimitHint
            placeholder={i18n.t('Please enter the experience database description information').toString()}
            onChange={handleExpertiseDesc}
          />
        </Form.Item>
        <Form.Item label={i18n.t('Experience tag').toString()} required requiredTrigger="onBlur">
          <Select
            value={data && data.tags}
            className={styles.drillTag}
            onChange={handleExpertiseTag}
            onSearch={handleSearchTag}
            showSearch
            dataSource={props.tags}
            mode='tag'
            placeholder={i18n.t('Please enter a label').toString()}
            notFoundContent={i18n.t('After entering manually, click Enter to add').toString()}
            onKeyUp={handleKeyUp}
            onFocus={props.onFocusTags}
            locale={locale().Select}
          />
          <div className={classnames(styles.errorMessage, styles.messageHorizontal)}>{getErrorMessage()}</div>
        </Form.Item>
      </Form>
    </div>
  );
}

