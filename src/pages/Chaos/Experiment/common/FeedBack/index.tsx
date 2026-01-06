import React from 'react';
import * as _ from 'lodash';
import locale from 'utils/locale';
import { Balloon, Form, Input, Radio, Select } from '@alicloud/console-components';

const FormItem = Form.Item;
const { Group: RadioGroup } = Radio;
const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

interface FeedBackProps{
  data: any;
  onSpecialDomChange: (data: any) => void;
}

function FeedBack(props: FeedBackProps) {

  function handleChange(value: string, option: any) {
    const { onSpecialDomChange, data } = props;
    const optionItem = { ...option, value };
    const options = _.get(data, 'extra.options', []);
    const newOptions: any[] = [];
    if (!_.isEmpty(options)) {
      options.forEach((o: any) => {
        if (o.key === option.key) {
          o = optionItem;
        }
        newOptions.push(o);
      });
    }
    const newData = {
      ...data,
      extra: {
        ...data.extra,
        options: newOptions,
      },
    };
    onSpecialDomChange && onSpecialDomChange(newData);
  }

  function renderOptions(option: any) {
    const { description, format, value = '' } = option;
    const type = _.get(format, 'type', '');
    const { required = false, options = [], writable = false, defaultValue = '', placeholder = '' } = format || {};
    if (type === 'text') {
      return <FormItem label={description}>
        <Balloon trigger={(<p style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>)} closable={false}>
          <div>{value}</div>
        </Balloon>
      </FormItem>;
    }
    if (type === 'input') {
      return <FormItem label={description} required={required}>
        <Input
          value={value}
          placeholder={placeholder}
          disabled={!writable}
          defaultValue={defaultValue}
          onChange={(value: string) => handleChange(value, option)}
        />
      </FormItem>;
    }
    if (type === 'radio') {
      return <FormItem label={description} required={required}>
        <RadioGroup
          value={value}
          dataSource={options}
          onChange={value => handleChange(value as string, option as any)}
        ></RadioGroup>
      </FormItem>;
    }
    if (type === 'select') {
      return <FormItem label={description} {...formItemLayout} required={required}>
        <Select
          value={value}
          style={{ width: '100%' }}
          onChange={(value: string) => handleChange(value, option)}
          dataSource={options}
          locale={locale().Select}
        />
      </FormItem>;
    }
  }

  const { data } = props;
  const options = _.get(data, 'extra.options', []);

  return <Form {...formItemLayout} size='small'>{!_.isEmpty(options) && options.map((option: any) => renderOptions(option))}</Form>;
}

export default FeedBack;
