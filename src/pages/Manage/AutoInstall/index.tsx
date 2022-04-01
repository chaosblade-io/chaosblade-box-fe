import React, { FC, memo, useEffect, useState } from 'react';
import _ from 'lodash';
import styles from './index.css';
import { getActiveRegion } from 'utils/libs/sre-utils';

import { Button, Dialog, Field, Form, Input, Message, Radio, Select } from '@alicloud/console-components';
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    fixedSpan: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

import { getParams } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';

import CustomSelect from 'pages/Chaos/Experiment/common/CustomSelect';

const { Group: RadioGroup } = Radio;

interface IProps {
  onClose: () => void;
}

interface IHaveNameGroup {
  label: string;
  value: string;
}

const Index: FC<IProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const [ haveGroupList, setHaveGroupList ] = useState<IHaveNameGroup[]>([]); // 分组数据
  const [ loading, setLoading ] = useState<boolean>(false); // 提交数据loading

  const field = Field.useField();
  const [ fieldValues, setFieldValues ] = useState<any>({ appType: 1 });
  const [ currApp, setCurrApp ] = useState<any>(null);

  useEffect(() => {
    setFieldValues({ ...fieldValues, AppName: undefined, AppGroupName: undefined });
  }, [ fieldValues?.appType ]);

  useEffect(() => {
    const getAppGroup = async () => {
      const namespace = getParams('ns') ?? window.curNamespace ?? 'default';
      const args: any = { namespace, region: getActiveRegion(), appType: '0' };
      if (currApp) {
        args.app_id = currApp.app_id;
      }
      const { Data: res = [] } = await dispatch.agentSetting.getGetUserApplicationGroups(args);
      setHaveGroupList(res);
    };
    if (fieldValues?.AppName && fieldValues?.appType === 1) {
      setHaveGroupList([]);
      getAppGroup();
    }
  }, [ currApp?.app_id ]);

  const onOkSubmit = async (values: any) => {
    setLoading(true);
    const params = _.cloneDeep(values);
    if (params.appType === 1) {
      params.AppName = currApp?.app_name;
      params.AppId = currApp?.app_id;
    }
    delete params.appType;
    const { Data = false, Code = '' } = await dispatch.agentSetting.getInstallPlugin(params);
    setLoading(false);
    if (Data) {
      Message.success('探针安装中，这可能需要几分钟，请稍等查看...');
      onClose();
    } else {
      let msg = '探针自动安装失败，请尝试手动安装。';
      if (Code === 'plugin.instance.not.exist') {
        msg = '当前的实例不存在，请选择可用的实例';
      }
      Message.error(msg);
    }
  };
  const checkField = (rule: any, value: string, callback: any, field: string) => {
    if (field === 'InstanceId' && /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/.test(value) === false) {
      callback('请填写合法的机器IP地址');
    } else if (field === 'SshPort' && !(/^[1-9]\d*$/.test(value) && Number(value) >= 1 && Number(value) <= 65535)) {
      callback('请填写合法的端口');
    } else if ([ 'AppName', 'AppGroupName' ].includes(field) && /^[\w|\||-]*$/g.test(value) === false) {
      callback(`请填写合法的${field === 'AppName' ? '应用' : '分组'}名称`);
    } else {
      callback();
    }
  };
  return (
    <Dialog
      visible={true}
      title={'安装探针'}
      style={{ width: '680px' }}
      okProps={{
        children: '安装',
      }}
      footer={false}
      onCancel={onClose}
      onClose={onClose}
    >
      <div className={styles.installDialog}>
        <Form {...formItemLayout} field={field} onChange={values => {
          setFieldValues(values);
        }}>
          <FormItem required label="应用">
            <RadioGroup name="appType" defaultValue={fieldValues.appType}>
              <Radio value={1}>已有应用</Radio>
              <Radio value={2}>新增应用</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label="选择应用"
            required
          >
            {fieldValues.appType === 1 &&
              <CustomSelect
                params={{ filterDisabled: true, appType: 0 }}
                placeholder='请选择应用名称'
                name="AppName"
                value={fieldValues.AppName}
                onChange={(value, action, item) => {
                  // setFieldValues({ ...fieldValues, _AppName: item.app_name });
                  setCurrApp(item);
                }}
              /> || <Input value={fieldValues.AppName} placeholder="请输入应用名称" name="AppName" />
            }
          </FormItem>
          <FormItem
            label="应用分组"
            // required
            validator={(rule, value, callback) => checkField(rule, value, callback, 'AppGroupName')}
          >
            {fieldValues.appType === 1 &&
              <Select
                showSearch
                value={fieldValues.AppGroupName}
                style={{ width: '100%' }}
                dataSource={haveGroupList}
                placeholder="请选择应用分组"
                name="AppGroupName"
              /> || <Input value={fieldValues.AppGroupName} placeholder="请输入应用分组" name="AppGroupName" />
            }
          </FormItem>
          <FormItem
            label="IP"
            required
            validator={(rule, value, callback) => checkField(rule, value, callback, 'InstanceId')}
          >
            <Input placeholder="请输入机器IP" name="InstanceId" />
          </FormItem>
          <FormItem
            label="端口"
            validator={(rule, value, callback) => checkField(rule, value, callback, 'SshPort')}
          >
            <Input placeholder="请输入端口" name="SshPort" defaultValue={22} />
          </FormItem>
          <FormItem
            label="SSH 用户"
            required
            validator={(rule, value, callback) => checkField(rule, value, callback, 'SshUser')}
          >
            <Input placeholder="请输入SSH 用户" name="SshUser" />
          </FormItem>
          <FormItem
            label="SSH 密码"
            // required
            // validator={(rule, value, callback) => checkField(rule, value, callback, 'SshPassword')}
          >
            <Input htmlType="password" placeholder="请输入SSH 密码" name="SshPassword" />
          </FormItem>
          <div style={{ textAlign: 'right' }}>
            <Form.Submit
              validate
              type="primary"
              loading={loading}
              onClick={(value: any) => onOkSubmit(value)}
              style={{ marginRight: 10 }}
            >
              安装
            </Form.Submit>
            <Button onClick={() => onClose()}>取消</Button>
          </div>
        </Form>
      </div>
    </Dialog>
  );
};

export default memo(Index);

