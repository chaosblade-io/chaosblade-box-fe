import React from 'react';
import Translation from 'components/Translation';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../../../i18n';
import { Form, Input, Radio } from '@alicloud/console-components';
import { IExperimentTask } from 'config/interfaces/Chaos/experimentTask';


const { Group: RadioGroup } = Radio;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    fixedSpan: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

const formspecialDomLayout = {
  labelCol: {
    fixedSpan: 0,
  },
  wrapperCol: {
    span: 24,
  },
};

interface DialogFromProps{
  data: IExperimentTask;
  value: any;
  onFormChange: (data: any) => void;
  specialDom: any;
}

function DialogFrom(props: DialogFromProps) {

  function handleChange(value: number | string, label: string) {
    const { onFormChange } = props;
    const changeData: any = {};
    changeData[label] = value;
    onFormChange && onFormChange(changeData);
  }

  const { specialDom, data, value } = props;
  const { experimentName, startTime } = data;
  return <Form {...formItemLayout} size='small'>
    <FormItem label={i18n.t('Drill name').toString()} >
      <p>{experimentName || ''}</p>
    </FormItem>
    <FormItem label={i18n.t('Execution time').toString()}>
      <p>{startTime && formatDate(startTime)}</p>
    </FormItem>
    <FormItem label={i18n.t('In conclusion').toString()}>
      <RadioGroup
        value={value && value.expectationStatus}
        onChange={value => handleChange(value as string, 'expectationStatus')}
      >
        <Radio value={1}>
          <Translation>In line with expectations</Translation>
        </Radio>
        <Radio value={0}>
          <Translation>Not as expected</Translation>
        </Radio>
      </RadioGroup>
    </FormItem>
    <FormItem label={i18n.t('Affect normal business').toString()}>
      <RadioGroup
        value={value && value.businessStatus}
        onChange={value => handleChange(value as string, 'businessStatus')}
      >
        <Radio value={1}>
          <Translation>Influence</Translation>
        </Radio>
        <Radio value={0}>
          <Translation>Does not affect</Translation>
        </Radio>
      </RadioGroup>
    </FormItem>
    {specialDom && <FormItem {...formspecialDomLayout} size='medium'>
      {specialDom()}
    </FormItem>}
    <FormItem label={i18n.t('Illustrate').toString()}>
      <Input.TextArea placeholder={i18n.t('Please enter business description information').toString()} onChange={value => handleChange(value, 'memo')} maxLength={200} showLimitHint/>
    </FormItem>
  </Form>;
}

export default DialogFrom;
