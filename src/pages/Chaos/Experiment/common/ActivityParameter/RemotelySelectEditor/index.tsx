import React, { useState } from 'react';
import * as _ from 'lodash';
import i18n from '../../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IArgs, IComponent, IHost, IParamter } from 'config/interfaces/Chaos/experiment';
import { ISearchEditor } from 'config/interfaces/Chaos/functionParameter';
import { Loading, Select, Switch } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

interface RemotelySelectEditorProps{
  parameter: IParamter;
  onChange: (id: string, type: string, alias: string, value: number | string | boolean, component?: IComponent) => void;
  disabled: boolean;
  isSwitch: boolean;
  width: number;
  scopes: IHost[];
  code?: string;
  argumentsList: IArgs[];
  configurationIds?: string[];
}

function RemotelySelectEditor(props: RemotelySelectEditorProps) {
  const dispatch = useDispatch();

  const [ results, setResults ] = useState<string[]>([]);
  const [ loading, setLoading ] = useState(false);
  // const [ remotelySelectInputValue, setRemotelySelectInputValue ] = useState('');
  const [ selectValue, setSelectValue ] = useState<any>(props.parameter && props.parameter.value || '');

  function handleIsVisible(parameter: IParamter, defaultState: boolean) {
    if (_.isEmpty(parameter)) {
      return defaultState;
    }
    if (_.isBoolean(parameter.state)) {
      return parameter.state;
    }
    return true;

  }

  function handleLoadData(requestUrl: string) {
    const { argumentsList, scopes, code, parameter, configurationIds = [] } = props;
    const alias = parameter && parameter.alias;
    handleDoRequest(requestUrl, argumentsList, configurationIds, code, _.defaultTo(scopes, []), alias);
  }

  function handleDoRequest(url: string, argumentsList: IArgs[], configurationIds: string[], code: string | undefined, scopes: IHost[], alias: string) {
    _.throttle(() => {
      if (!_.isEmpty(url) && !loading) {
        setLoading(true);
        handleAlSetRequest(url, argumentsList, code, scopes, alias, configurationIds);
      }
    }, 500)();
  }

  function handleAlSetRequest(url: string, args: IArgs[], code: string | undefined, scopes: IHost[], alias: string, configurationIds: string[]) {
    const runParams: any = {};
    args?.forEach((item: any) => {
      item.argumentList.forEach((temp:any) => {
        runParams[temp.alias] = temp.value;
      });
    });
    (async function() {
      await dispatch.functionParameters.getSearchOPtions(url, { hosts: scopes, runParams, appCode: code, alias, configurationIds } as ISearchEditor, (data: string[]) => {
        if (data?.length > 0) {
          setResults(data);
        }
        setLoading(false);
      });
    })();
  }

  // function handleCustomValue(value: string) {
  //   if (!_.isEmpty(value)) {
  //     setResults(_.uniq(_.concat(results, value)));
  //     setSelectValue(value);
  //     onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, value, parameter.component);
  //   }
  // }

  function handleSwitchChange(value: boolean) {
    const { parameter, onChange } = props;
    const { component } = parameter;
    component.opLevel = value ? 0 : 1;
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, selectValue, component);
  }

  const { parameter, onChange, disabled, isSwitch } = props;
  const { errorMessage } = parameter;

  let type = '';
  // let linkage = {};
  let requestUrl = '';
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      requestUrl = component.requestUrl;
      type = component.type;
      // linkage = component.linkage || {};
      opLevel = component.opLevel;
    }
  }

  if (type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT_REMOTE) {
    return null;
  }

  const defaultState = _.get(parameter, 'defaultState', true);
  if (!handleIsVisible(parameter, defaultState)) {
    return null;
  }
  let _results = results;
  // if (!_.isEmpty(parameter) && !_.isEmpty(parameter.value)) {
  //   _results = _.uniq(_.concat(_results, parameter.value)) as string[];
  // }
  if (selectValue) {
    _results = _.uniq(_.concat(_results, selectValue)) as string[];
  }
  return (
    <div className={isSwitch ? styles.paramesItem : undefined}>
      <Select
        value={selectValue}
        className={isSwitch ? styles.switchEditStyle : styles.remoteSelect}
        disabled={disabled || false}
        hasClear
        showSearch
        state={errorMessage ? 'error' : undefined}
        filterLocal={false}
        notFoundContent={
          loading
            ? (
              <div className={styles.loading}>
                <Loading size="medium"/>
              </div>
            ) : ''
        }
        dataSource={_results}
        onVisibleChange={ visible => {
          if (visible) {
            handleLoadData(requestUrl);
          }
        }}
        onBlur={() => {
          onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, selectValue, parameter.component);
        }}
        // onKeyUp={e => {
        //   if (e.keyCode === 13) {
        //     handleCustomValue();
        //   }
        // }}
        onChange={(value: string, actionType: string) => {
          let _value = value;
          if (actionType === 'enter') {
            _value = selectValue;
          }
          setSelectValue(_value);
          onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, _value, parameter.component);
        }}
        onSearch={value => {
          setSelectValue(value);
        }}
        locale={locale().Select}
      />
      {isSwitch ?
        <span className={styles.paramesContro}>
          <span className={styles.switchValue}>
            { opLevel === 0 ? i18n.t('Operational').toString() : i18n.t('Inoperable').toString()}
          </span>
          <Switch
            checked={opLevel === 0}
            size="small"
            onChange={handleSwitchChange}
          />
        </span> : null
      }
      <div className={styles.errorMessage}>{errorMessage}</div>
    </div>
  );
}

export default RemotelySelectEditor;
