import React, { FC, memo, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../i18n';
import locale from 'utils/locale';
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
      Message.success(i18n.t('The probe is being installed, this may take a few minutes, please check later...'));
      onClose();
    } else {
      let msg = i18n.t('The automatic installation of the probe failed, please try to install it manually');
      if (Code === 'plugin.instance.not.exist') {
        msg = i18n.t('The current instance does not exist, please select an available instance');
      }
      Message.error(msg);
    }
  };
  const checkField = (rule: any, value: string, callback: any, field: string) => {
    if (field === 'InstanceId' && /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/.test(value) === false) {
      callback(i18n.t('Please fill in the legitimate machine IP address'));
    } else if (field === 'SshPort' && !(/^[1-9]\d*$/.test(value) && Number(value) >= 1 && Number(value) <= 65535)) {
      callback(i18n.t('Please fill in valid port'));
    } else if ([ 'AppName', 'AppGroupName' ].includes(field) && /^[\w|\||-]*$/g.test(value) === false) {
      callback(`${i18n.t('Please fill in legal')}${field === 'AppName' ? i18n.t('Application') : i18n.t('Group')}${i18n.t('Name')}`);
    } else {
      callback();
    }
  };
  return (
    <Dialog
      visible={true}
      title={i18n.t('Install the probe').toString()}
      style={{ width: '680px' }}
      okProps={{
        children: i18n.t('Install').toString(),
      }}
      footer={false}
      onCancel={onClose}
      onClose={onClose}
      locale={locale().Dialog}
    >
      <div className={styles.installDialog}>
        <Form {...formItemLayout} field={field} onChange={values => {
          setFieldValues(values);
        }}>
          <FormItem required label={i18n.t('Application').toString()}>
            <RadioGroup name="appType" defaultValue={fieldValues.appType}>
              <Radio value={1}><Translation>Existing application</Translation></Radio>
              <Radio value={2}><Translation>Add application</Translation></Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label={i18n.t('Choose application').toString()}
            required
          >
            {fieldValues.appType === 1 &&
              <CustomSelect
                params={{ filterDisabled: true, appType: 0 }}
                placeholder={i18n.t('Please select an app name').toString()}
                name="AppName"
                value={fieldValues.AppName}
                onChange={(value, action, item) => {
                  // setFieldValues({ ...fieldValues, _AppName: item.app_name });
                  setCurrApp(item);
                }}
              /> || <Input value={fieldValues.AppName} placeholder={i18n.t('Please input application name').toString()} name="AppName" />
            }
          </FormItem>
          <FormItem
            label={i18n.t('Application group').toString()}
            // required
            validator={(rule, value, callback) => checkField(rule, value, callback, 'AppGroupName')}
          >
            {fieldValues.appType === 1 &&
              <Select
                showSearch
                value={fieldValues.AppGroupName}
                style={{ width: '100%' }}
                dataSource={haveGroupList}
                placeholder={i18n.t('Please select an app group')}
                name="AppGroupName"
                locale={locale().Select}
              /> || <Input value={fieldValues.AppGroupName} placeholder={i18n.t('Please input application group').toString()} name="AppGroupName" />
            }
          </FormItem>
          <FormItem
            label={i18n.t('IP').toString()}
            required
            validator={(rule, value, callback) => checkField(rule, value, callback, 'InstanceId')}
          >
            <Input placeholder={i18n.t('Please input the machine ip').toString()} name="InstanceId" />
          </FormItem>
          <FormItem
            label={i18n.t('port').toString()}
            validator={(rule, value, callback) => checkField(rule, value, callback, 'SshPort')}
          >
            <Input placeholder={i18n.t('Please enter the port')} name="SshPort" defaultValue={22} />
          </FormItem>
          <FormItem
            label={i18n.t('SSH user').toString()}
            required
            validator={(rule, value, callback) => checkField(rule, value, callback, 'SshUser')}
          >
            <Input placeholder={i18n.t('Please enter SSH user').toString()} name="SshUser" />
          </FormItem>
          <FormItem
            label={i18n.t('SSH password').toString()}
            // required
            // validator={(rule, value, callback) => checkField(rule, value, callback, 'SshPassword')}
          >
            <Input htmlType="password" placeholder={i18n.t('Please enter SSH password').toString()} name="SshPassword" />
          </FormItem>
          <div style={{ textAlign: 'right' }}>
            <Form.Submit
              validate
              type="primary"
              loading={loading}
              onClick={(value: any) => onOkSubmit(value)}
              style={{ marginRight: 10 }}
            >
              <Translation>Install</Translation>
            </Form.Submit>
            <Button onClick={() => onClose()}><Translation>cancel</Translation></Button>
          </div>
        </Form>
      </div>
    </Dialog>
  );
};

export default memo(Index);

