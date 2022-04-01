import React, { useState } from 'react';
import _ from 'lodash';
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
      return '最多填写5个！';
    }
    if (overLengthError) {
      return '1个标签最多包含30个字符！';
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
        <Form.Item label='演练名称' required requiredTrigger='onBlur'>
          <Input
            value={data && data.name || ''}
            className={styles.experienceBase}
            maxLength={50}
            showLimitHint
            placeholder='请输入演练名称'
            name='演练名称'
            onChange={handleExperienceName}
            disabled={props.disabled}
            data-autolog={'text=输入演练名称'}
          />
        </Form.Item>
        <Form.Item label='演练描述'>
          <Input.TextArea
            value={data && data.description}
            className={styles.experienceBaseDescribe}
            maxLength={1000}
            showLimitHint
            placeholder='请输入演练描述信息'
            onChange={handleExperienceDesc}
            disabled={props.disabled}
            data-autolog={'text=输入演练描述'}
          />
        </Form.Item>
        <Form.Item label='演练标签'>
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
            placeholder="请输入演练标签"
            notFoundContent="手动输入后点击回车添加"
            data-autolog={'text=输入演练标签'}

          />
          {getErrorTagsMessage() && <div className={styles.errorMessage}>{getErrorTagsMessage()}</div>}
        </Form.Item>
      </Form>
    </div>
  );
}

export default BaseInfo;
