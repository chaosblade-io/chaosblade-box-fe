import React, { FC, memo, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import i18n from '../../../../../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Dialog, Field, Form, Input, Radio, Select } from '@alicloud/console-components';
import { IQueryPluginStatusResult } from 'config/interfaces';
import { getCookie } from '@alicloud/cookie';
import { getParams } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';

import CustomSelect from 'pages/Chaos/Experiment/common/CustomSelect';

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

interface IProps {
  dataSource: IQueryPluginStatusResult[];
  records: IQueryPluginStatusResult[];
  onClose: () => void;
  fetchAdd: (data: IQueryPluginStatusResult[], ids: string[], name: string, group: string) => void;
}

interface IHaveNameGroup {
  label: string;
  value: string;
}

const InstallDialog: FC<IProps> = ({ dataSource, records, onClose, fetchAdd }) => {
  const dispatch = useDispatch();
  const [ haveGroupList, setHaveGroupList ] = useState<IHaveNameGroup[]>([]); // 分组数据
  const field = Field.useField();
  const { init } = field;
  const [ fieldValues, setFieldValues ] = useState<any>({ appType: 1 });

  // 应用名称
  useEffect(() => {
    const getAppGroup = async () => {
      const namespace = getParams('ns') ?? window.curNamespace ?? getCookie('curNamespace') ?? 'default';
      const { AppName } = fieldValues;
      const args: any = { namespace, region: getParams('region'), appType: '0' };
      if (AppName) {
        args.app_id = AppName;
      }
      const { Data: res = [] } = await dispatch.agentSetting.getGetUserApplicationGroups({ args: JSON.stringify(args) });
      setHaveGroupList(res);
    };
    if (fieldValues?.AppName && fieldValues?.appType === 1) {
      setHaveGroupList([]);
      getAppGroup();
    }
  }, [ fieldValues?.AppName ]);

  const onOkSubmit = () => {
    field.validate((errors, values: any) => {
      const { appType, AppName, cAppName, AppGroupName, cAppGroupName } = values;
      const name = appType === 1 ? AppName : cAppName;
      const group = appType === 1 ? AppGroupName : cAppGroupName;
      if (name && group) {
        handleInstall(dataSource, records, name, group);
      }
    });
  };

  const handleInstall = (dataSource: IQueryPluginStatusResult[], records: IQueryPluginStatusResult[], name: string, group: string) => {
    const _dataSource = _.cloneDeep(dataSource) as IQueryPluginStatusResult[];
    const ids: string[] = [];
    // 遍历需要安装的数组
    records.forEach(item => {
      ids.push(item.instanceId);
    });
    // 安装中
    _dataSource.forEach(item => {
      if (ids.indexOf(item.instanceId) !== -1) {
        item.pluginStatus = 1;
      }
    });
    fetchAdd(_dataSource, ids, name, group);
    onClose();
  };

  return (
    <Dialog
      visible={true}
      title={i18n.t('Install the probe').toString()}
      style={{ minWidth: '500px' }}
      okProps={{
        children: i18n.t('Install').toString(),
      }}
      onCancel={onClose}
      onClose={onClose}
      onOk={onOkSubmit}
      locale={locale().Dialog}
    >
      <div className={styles.content}>
        <Form {...formItemLayout} field={field} onChange={values => setFieldValues(values)}>
          <FormItem label={i18n.t('Application').toString()}>
            <RadioGroup name="appType" defaultValue={fieldValues.appType}>
              <Radio value={1}>
                <Translation>Existing application</Translation>
              </Radio>
              <Radio value={2}>
                <Translation>Add application</Translation>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={i18n.t('Application Name').toString()} required>
            {fieldValues.appType !== 1 &&
              <Input
                placeholder={i18n.t('Please input application name').toString()}
                type="text"
                maxLength={60}
                showLimitHint
                {...init('cAppName', {
                  rules: [
                    {
                      required: true,
                      message: i18n.t('Please enter a valid name').toString(),
                    },
                    {
                      pattern: /^[\w|\||-]*$/g,
                      message: i18n.t('Please enter a valid name').toString(),
                    },
                  ],
                })}
              /> ||
              <CustomSelect
                params={{ filterDisabled: true, appType: 0 }}
                placeholder={i18n.t('Please select an app name').toString()}
                name="AppName"
                value={fieldValues.AppName}
                onChange={(value, action, item) => {
                  setFieldValues({ ...fieldValues, AppName: item.label });
                }}
              />
            }
          </FormItem>
          <FormItem label={i18n.t('Group Name').toString()} required>
            {fieldValues.appType !== 1 &&
              <Input
                placeholder={i18n.t('Please enter a group name')}
                type="text"
                maxLength={60}
                showLimitHint
                trim
                {...init('cAppGroupName', {
                  rules: [
                    {
                      pattern: /^[\w|\||-]*$/g,
                      message: i18n.t('Please enter a valid name').toString(),
                    },
                  ],
                })}
              /> ||
              <Select
                name="AppGroupName"
                style={{ width: '100%' }}
                dataSource={haveGroupList}
                placeholder={i18n.t('Please select a specific application group')}
                locale={locale().Select}
              />
            }
          </FormItem>
        </Form>
      </div>
    </Dialog>
  );
};

export default memo(InstallDialog);
