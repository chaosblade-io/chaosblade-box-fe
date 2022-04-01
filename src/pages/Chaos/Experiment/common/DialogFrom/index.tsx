import React from 'react';
import formatDate from 'pages/Chaos/lib/DateUtil';
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
    <FormItem label='演练名称' >
      <p>{experimentName || ''}</p>
    </FormItem>
    <FormItem label='执行时间'>
      <p>{startTime && formatDate(startTime)}</p>
    </FormItem>
    <FormItem label='结论'>
      <RadioGroup
        value={value && value.expectationStatus}
        onChange={value => handleChange(value as string, 'expectationStatus')}
      >
        <Radio value={1}>
          符合预期
        </Radio>
        <Radio value={0}>
          不符合预期
        </Radio>
      </RadioGroup>
    </FormItem>
    <FormItem label='影响正常业务'>
      <RadioGroup
        value={value && value.businessStatus}
        onChange={value => handleChange(value as string, 'businessStatus')}
      >
        <Radio value={1}>
          影响
        </Radio>
        <Radio value={0}>
          不影响
        </Radio>
      </RadioGroup>
    </FormItem>
    {specialDom && <FormItem {...formspecialDomLayout} size='medium'>
      {specialDom()}
    </FormItem>}
    <FormItem label='说明'>
      <Input.TextArea placeholder="请输入业务说明信息" onChange={value => handleChange(value, 'memo')} maxLength={200} showLimitHint/>
    </FormItem>
  </Form>;
}

export default DialogFrom;
