import React from 'react';
import ScopeLists from './ScopeLists';
import styles from './index.css';
import { Form, Select } from '@alicloud/console-components';
import { IFlowGroup, IHost, IOption } from 'config/interfaces/Chaos/experiment';
import { SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';

const { Item: FormItem } = Form;
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 9 },
};

interface CloudProps {
  data: IFlowGroup;
  cloudList: IOption[];
  onCloudChange: () => void;
  onCloudFocus: () => void;
  onScopeChange: (value: IHost[]) => void;
}

export default function CloudServer(props: CloudProps) {
  const { cloudList, data: { cloudServiceType, hosts, cloudServiceName } } = props;
  return (
    <Form {...formItemLayout}>
      <FormItem label="云服务" required>
        <Select
          value={cloudServiceName || cloudServiceType}
          className={styles.application}
          placeholder="请选择云服务"
          filterLocal={false}
          dataSource={cloudList}
          onChange={props.onCloudChange}
          onFocus={props.onCloudFocus}
        />
      </FormItem>
      <FormItem label="云服务实例" required wrapperCol={{ span: 22 }}>
        <ScopeLists
          value={hosts}
          isApp={false}
          onChange={props.onScopeChange}
          type={cloudServiceType as string}
          scopeType={SCOPE_TYPE.CLOUD}
          listTips={`${cloudServiceName}实例`}
          noSearch={false}
        />
      </FormItem>
    </Form>
  );
}
