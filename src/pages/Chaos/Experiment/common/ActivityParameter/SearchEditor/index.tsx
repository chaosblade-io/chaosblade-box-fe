import React, { useState } from 'react';
import * as _ from 'lodash';
import i18n from '../../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IArgs, IComponent, IHost, IParamter } from 'config/interfaces/Chaos/experiment';
import { Loading, Select, Switch } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

interface SearchEditorProps {
  parameter: IParamter;
  onChange: (id: string, type: string, alias: string, value: number | string | boolean, component?: IComponent) => void;
  disabled: boolean;
  isSwitch: boolean;
  width: number;
  scopes: IHost[];
  code?: string;
  argumentsList: IArgs[];
}

function SearchEditor(props: SearchEditorProps) {

  const dispatch = useDispatch();

  const [ results, setResults ] = useState<string[]>([]);
  const [ loading, setLoading ] = useState(false);
  const [ searchInputValue, setSearchInputValue ] = useState('');
  const [ dataValue, setDataValue ] = useState(props.parameter && props.parameter.value || '');

  function handleIsVisible(parameter: IParamter, defaultState: boolean) {
    if (_.isEmpty(parameter)) {
      return defaultState;
    }
    if (_.isBoolean(parameter.state)) {
      return parameter.state;
    }
    return true;

  }

  function handleSwitchChange(value: boolean) {
    const { parameter, onChange } = props;
    const { component } = parameter;
    component.opLevel = value ? 0 : 1;
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, dataValue, component);
  }

  function handleSearch(requestUrl: string, value: string) {
    const { argumentsList, scopes, code } = props;
    handleDoRequest(requestUrl, value, argumentsList, code, _.defaultTo(scopes, []));
  }

  function handleDoRequest(url: string, value: string, argumentsList: IArgs[], code: string | undefined, scopes: IHost[]) {
    _.throttle(() => {
      if (!_.isEmpty(url) && !loading) {
        setLoading(true);
        setSearchInputValue(value);
        handleAlSetRequest(url, value, argumentsList, code, scopes);
      }
    }, 500)();
  }

  function handleAlSetRequest(url: string, value: string, args: IArgs[], code: string | undefined, scopes: IHost[]) {
    const runParams = _.fromPairs(_.map(args, (arg: IArgs) => {
      return [ arg.alias, arg.value ];
    })) as any;
    (async function() {
      // await dispatch.experimentEditor.getExperimentBaseInfo({ experimentId });
      await dispatch.functionParameters.getSearchOPtions(url, { value, hosts: scopes, runParams, appCode: code }, (data: string[]) => {
        if (data) {
          setResults(data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
    })();
  }

  function handleCustomValue() {
    if (!_.isEmpty(searchInputValue)) {
      setResults(_.uniq(_.concat(results, searchInputValue)));
      setSearchInputValue('');
    }
  }

  const { parameter, onChange, disabled, isSwitch } = props;
  const { errorMessage } = parameter;

  let type = '';
  // let linkage = null;
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

  if (type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SEARCH) {
    return null;
  }

  const defaultState = _.get(parameter, 'defaultState', true);
  if (!handleIsVisible(parameter, defaultState)) {
    return null;
  }

  return (
    <div className={isSwitch ? styles.paramesItem : undefined}>
      <Select
        value={parameter ? parameter.value : ''}
        className={isSwitch ? styles.switchEditStyle : styles.search}
        disabled={disabled || false}
        showSearch
        hasClear
        filterLocal={false}
        notFoundContent={
          loading
            ? (
              <div className={styles.loading}>
                <Loading size="medium"/>
              </div>
            ) : ''
        }
        dataSource={results}
        onSearch={ value => {
          handleSearch(requestUrl, value);
        }}
        onBlur={handleCustomValue}
        onKeyUp={e => {
          if (e.keyCode === 13) {
            handleCustomValue();
          }
        }}
        onChange={value => {
          setDataValue(value);
          onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, value, parameter.component);
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

export default SearchEditor;
