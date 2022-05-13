import React from 'react';
import ScopeLists from './ScopeLists';
import Translation from 'components/Translation';
import i18n from '../../../../../../i18n';
import styles from './index.css';
import { Balloon, Form, Radio, Range, Select } from '@alicloud/console-components';
import { IApp, IAppLications, IFlowGroup, IHost } from 'config/interfaces/Chaos/experiment';
import { SCOPE_TYPE, SELECT_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { getActiveNamespace, parseQuery } from 'utils/libs/sre-utils';

import CustomSelect from 'pages/Chaos/Experiment/common/CustomSelect';

const { Item: FormItem } = Form;
const { Group: RadioGroup } = Radio;
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 9 },
};

interface ApplicationGroupProps {
  data: IFlowGroup;
  applications: IAppLications[];
  onAppChange: (value: string, actionType: string, item: IApp) => void;
  onAppFocus: () => void;
  onGroupChange: (value: string[]) => void;
  onGroupFocus: () => void;
  onScopeChange: (value: IHost[]) => void;
  groups: string[];
  validateApp?: 'warning' | 'error' | 'success' | 'loading' | undefined;
  showScopes: boolean;
  scopeSelectType: any;
  experimentObj?: number | string;
  scopeType?: number | string | undefined;
  osType?: number | string | undefined;
  onSelectTypeChange: (scopeSelectType: any) => void;
  onRangeChange: (value: string | number) => void;
  total: number;
  taskNumber: number;
  disableAppSel?: boolean; // 兼容故障详情编辑机器功能
}

function ApplicationGroup(props: ApplicationGroupProps) {
  const query = parseQuery();
  const { expertiseId } = query;
  const { scopeType, data, osType, disableAppSel } = props;
  const { appGroups, hosts, appId, hostPercent } = data;

  function renderPlaceholder() {
    if (expertiseId) {
      if (scopeType === SCOPE_TYPE.HOST) {
        return i18n.t('Please select the deployment type as host');
      }
      if (scopeType === SCOPE_TYPE.K8S) {
        return i18n.t('Please select a deployment type of kubernetes');
      }
      return i18n.t('Please select a drill application');
    }
    return i18n.t('Please select a drill application');
  }

  return (
    <Form {...formItemLayout}>
      {!disableAppSel &&
        <FormItem label={<Translation>Drill application</Translation>} className={styles.itemLine}>
          <CustomSelect params={{ filterDisabled: true, appType: scopeType, osType }} appInfo={data} value={appId} placeholder={renderPlaceholder()} onChange={props.onAppChange} />
          <Balloon trigger={
            <span className={styles.applications} style={{ left: '50%' }}><Translation>Can't find app</Translation>?</span>
          } triggerType="click" popupClassName={styles.scopeBalloon}>
            <ul>
              <p><Translation>Application Notes</Translation>:</p>
              <li>1. <Translation>Application types are divided into host and kubernetes</Translation>； </li>
              <li>1. <Translation>Application types are divided into host and kubernetes</Translation>；
                <li>1.1:<Translation>The two types correspond to ECS installation and kubernetes installation respectively.</Translation></li>
                <li>1.2:<Translation>Different application types have different drill scenarios to choose from.</Translation></li>
              </li>
              <li>2.<Translation>If no application can be queried, you can view it in the following ways</Translation>:
                <li>2.1.如未接入应用,请先<a href={`/chaos/freshapplication/access?ns=${getActiveNamespace()}`} target={'_blank'}><Translation>Application access</Translation></a>。</li>
                <li>2.2:如果应用已接入,请确认应用下面存在活跃的机器,您可点击<a href={`/chaos/application?ns=${getActiveNamespace()}`} target={'_blank'}><Translation>Application management</Translation></a>查看。</li>
              </li>
            </ul>
          </Balloon>
        </FormItem>
      }
      <FormItem label={<Translation>Application group</Translation>}>
        <Select
          value={appGroups}
          className={styles.application}
          showSearch
          placeholder={i18n.t('Please select an app group')}
          // filterLocal={false}
          dataSource={props.groups}
          mode='multiple'
          onChange={props.onGroupChange}
          onFocus={props.onGroupFocus}
        />
      </FormItem>
      <FormItem label={<Translation>Machine selection</Translation>}>
        <RadioGroup
          value={props.scopeSelectType}
          onChange={props.onSelectTypeChange as any}
        >
          <Radio id="ips" value={SELECT_TYPE.IPS}>
          Specify IP selection
          </Radio>
          <Radio id="percent" value={SELECT_TYPE.PERCENT} disabled={props.total === 0 && props.scopeSelectType !== SELECT_TYPE.PERCENT}>
          Percentage selection
          </Radio>
        </RadioGroup>
      </FormItem>
      {props.showScopes && props.scopeSelectType === SELECT_TYPE.IPS &&
        <FormItem label={<Translation>Machine list</Translation>} required wrapperCol={{ span: 22 }}>
          <ScopeLists
            value={hosts}
            isApp={true}
            onChange={props.onScopeChange}
            appId={appId}
            appGroup={appGroups}
            experimentObj={props.experimentObj}
            scopeType={props.scopeType}
            listTips={i18n.t('Machine list')}
          />
        </FormItem>
      }
      {
        props.scopeSelectType === SELECT_TYPE.PERCENT &&
        <FormItem label={<Translation>Percentage selection</Translation>} required wrapperCol={{ span: 22 }}>
          <span className={styles.rangeTips}>当前机器总数{props.total}台，已选机器{props.taskNumber}台</span>
          <span className={styles.rangeContent}>
            <Range value={hostPercent as number} marks={{ 0: '', 100: '100%' }} className={styles.range} onChange={props.onRangeChange} marksPosition='above'/>
            <span><Translation>[note] re select the number of machines according to the percentage before each drill.</Translation></span>
          </span>
        </FormItem>
      }
    </Form>
  );
}

export default ApplicationGroup;
