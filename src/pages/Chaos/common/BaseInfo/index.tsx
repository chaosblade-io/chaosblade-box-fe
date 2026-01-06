import React, { useState } from 'react';
import * as _ from 'lodash';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Form, Input, Select } from '@alicloud/console-components';
import { IBaseInfo } from 'config/interfaces/Chaos/experiment';
// import { ILabel } from 'config/interfaces/Chaos/components';

// 匹配中文、字母、数字、下划线、正反斜杠
// const NORMAL_TEXT_REG = /^[\u4e00-\u9fa5_a-zA-Z0-9\/',_——，。]*$/;

const formLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 6 },
};

interface BaseInfoProps {
  data: IBaseInfo;
  disabled: boolean;
  onUpdateBasinfo: (data: IBaseInfo) => void;
  onFocusTags: () => void;
  // onFocusWorkSpace: () => void;
  tags: string[];
  // workSpaces: ILabel[];
}

function BaseInfo(props: BaseInfoProps) {

  const [ overflowError, setOverflowError ] = useState<boolean>(false);
  const [ overLengthError, setOverLengthError ] = useState<boolean>(false);

  function handleExperienceName(name: string) {
    handleBaseInfoUpdate('name', name);
  }

  function handleExperienceDesc(value: string) {
    handleBaseInfoUpdate('description', value);
  }


  // actionType: number
  function handleExperimentTag(value: []) {
    if (!_.isEmpty(value) && value.length > 5) {
      setOverflowError(true);
      return;
    }
    handleBaseInfoUpdate('tags', value);
    setOverflowError(false);
    setOverLengthError(false);
  }

  function getErrorTagsMessage() {
    if (overflowError) {
      return i18n.t('Fill up to 5');
    }
    if (overLengthError) {
      return i18n.t('1 label can contain up to 30 characters');
    }
    return '';
  }

  function handleBaseInfoUpdate(field: string, value: string | []) {
    const { data, onUpdateBasinfo } = props;
    data[ field ] = value;
    onUpdateBasinfo(data);
  }

  const { data } = props;

  return (
    <div className={styles.warp}>
      <Form {...formLayout}>
        <Form.Item label={i18n.t('Drill name').toString()} required requiredTrigger='onBlur'>
          <Input
            value={data && data.name || ''}
            className={styles.experienceBase}
            maxLength={50}
            showLimitHint
            placeholder={i18n.t('Please enter a drill name').toString()}
            name={i18n.t('Drill name')}
            onChange={handleExperienceName}
            disabled={props.disabled}
            data-autolog={`text=${i18n.t('Please enter a drill name').toString()}`}
          />
        </Form.Item>
        <Form.Item label={i18n.t('Walkthrough Description').toString()}>
          <Input.TextArea
            value={data && data.description}
            className={styles.experienceBaseDescribe}
            maxLength={1000}
            showLimitHint
            placeholder={i18n.t('Please enter a walkthrough description').toString()}
            onChange={handleExperienceDesc}
            disabled={props.disabled}
            data-autolog={`text=${i18n.t('Please enter a walkthrough description').toString()}`}
          />
        </Form.Item>
        <Form.Item label={i18n.t('Walkthrough Tags').toString()}>
          <Select
            value={data && data.tags}
            className={styles.drillTag}
            onChange={handleExperimentTag}
            // onSearch={handleSearchTag}
            showSearch
            dataSource={props.tags}
            mode='tag'
            disabled={props.disabled}
            onFocus={props.onFocusTags}
            placeholder={i18n.t('Please enter a walkthrough tag').toString()}
            notFoundContent={i18n.t('After entering manually, click Enter to add').toString()}
            data-autolog={`text=${i18n.t('Enter a walkthrough tag')}`}
            locale={locale().Select}
          />
          {getErrorTagsMessage() && <div className={styles.errorMessage}>{getErrorTagsMessage()}</div>}
        </Form.Item>
      </Form>
    </div>
  );
}

export default BaseInfo;
