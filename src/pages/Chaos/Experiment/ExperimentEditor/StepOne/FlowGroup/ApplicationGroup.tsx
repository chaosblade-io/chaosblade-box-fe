import React from 'react';
import ScopeLists from './ScopeLists';
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
        return '请选择部署类型为主机的类型';
      }
      if (scopeType === SCOPE_TYPE.K8S) {
        return '请选择部署类型为Kubernetes的类型';
      }
      return '请选择演练应用';
    }
    return '请选择演练应用';
  }

  return (
    <Form {...formItemLayout}>
      {!disableAppSel &&
        <FormItem label="演练应用" className={styles.itemLine}>
          <CustomSelect params={{ filterDisabled: true, appType: scopeType, osType }} appInfo={data} value={appId} placeholder={renderPlaceholder()} onChange={props.onAppChange} />
          <Balloon trigger={
            <span className={styles.applications} style={{ left: '50%' }}>找不到应用?</span>
          } triggerType="click" popupClassName={styles.scopeBalloon}>
            <ul>
              <p>应用说明:</p>
              <li>1. 应用类型分为:主机和Kubernetes；
                <li>1.1:两种类型分别对应Ecs安装和Kubernetes安装两种方式。</li>
                <li>1.2:不同的应用类型,可选择的演练场景也会有差异。</li>
              </li>
              <li>2.如果查询不到应用,您可按以下方式查看:
                <li>2.1.如未接入应用,请先<a href={`/chaos/freshapplication/access?ns=${getActiveNamespace()}`} target={'_blank'}>应用接入</a>。</li>
                <li>2.2:如果应用已接入,请确认应用下面存在活跃的机器,您可点击<a href={`/chaos/application?ns=${getActiveNamespace()}`} target={'_blank'}>应用管理</a>查看。</li>
              </li>
            </ul>
          </Balloon>
        </FormItem>
      }
      <FormItem label="应用分组">
        <Select
          value={appGroups}
          className={styles.application}
          showSearch
          placeholder="请选择应用分组"
          // filterLocal={false}
          dataSource={props.groups}
          mode='multiple'
          onChange={props.onGroupChange}
          onFocus={props.onGroupFocus}
        />
      </FormItem>
      <FormItem label="机器选择">
        <RadioGroup
          value={props.scopeSelectType}
          onChange={props.onSelectTypeChange as any}
        >
          <Radio id="ips" value={SELECT_TYPE.IPS}>
            指定IP选择
          </Radio>
          <Radio id="percent" value={SELECT_TYPE.PERCENT} disabled={props.total === 0 && props.scopeSelectType !== SELECT_TYPE.PERCENT}>
            百分比选择
          </Radio>
        </RadioGroup>
      </FormItem>
      {props.showScopes && props.scopeSelectType === SELECT_TYPE.IPS &&
        <FormItem label="机器列表" required wrapperCol={{ span: 22 }}>
          <ScopeLists
            value={hosts}
            isApp={true}
            onChange={props.onScopeChange}
            appId={appId}
            appGroup={appGroups}
            experimentObj={props.experimentObj}
            scopeType={props.scopeType}
            listTips='机器列表'
          />
        </FormItem>
      }
      {
        props.scopeSelectType === SELECT_TYPE.PERCENT &&
        <FormItem label="百分比选择" required wrapperCol={{ span: 22 }}>
          <span className={styles.rangeTips}>当前机器总数{props.total}台，已选机器{props.taskNumber}台</span>
          <span className={styles.rangeContent}>
            <Range value={hostPercent as number} marks={{ 0: '', 100: '100%' }} className={styles.range} onChange={props.onRangeChange} marksPosition='above'/>
            <span>【注意】每次演练开始前按照百分比重新选择机器数量。</span>
          </span>

        </FormItem>
      }
    </Form>
  );
}

export default ApplicationGroup;
