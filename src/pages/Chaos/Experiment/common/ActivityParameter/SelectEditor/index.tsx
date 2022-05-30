import React, { useState } from 'react';
import _ from 'lodash';
import i18n from '../../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IOption, IParamter } from 'config/interfaces/Chaos/experiment';
import { Select, Switch } from '@alicloud/console-components';

const { Option: SelectOption } = Select;

interface SelectEditorProps{
  parameter: IParamter;
  onChange: (id: string, type: string, alias: string, value: number | string | boolean, component: IComponent) => void;
  disabled: boolean;
  isSwitch: boolean;
  width: number;
}

function SelectEditor(props: SelectEditorProps) {

  const [ selectValue, setSelectValue ] = useState(props.parameter && props.parameter.value || '');

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
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, selectValue, component);
  }

  const { parameter, onChange, disabled, isSwitch } = props;
  const { errorMessage } = parameter;

  let type = '';
  // let linkage = null;
  let options: IOption[] = [];
  let defaultValue = '';
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      type = component.type;
      // linkage = component.linkage || {};
      options = component.options as IOption[];
      defaultValue = component.defaultValue as string;
      opLevel = component.opLevel;
    }
  }

  if (type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT) {
    return null;
  }

  const defaultState = _.get(parameter, 'defaultState', true);
  if (!handleIsVisible(parameter, defaultState)) {
    return null;
  }

  let value = defaultValue;
  if (!_.isNull(parameter) && !_.isUndefined(parameter)) {
    value = parameter.value as string || '';
  }
  return (
    <div className={isSwitch ? styles.paramesItem : undefined}>
      <Select
        value={value}
        className={isSwitch ? styles.switchEditStyle : styles.select}
        disabled={disabled || false}
        hasClear
        onChange={value => {
          setSelectValue(value);
          onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, value, parameter.component);
        }}
        locale={locale().Select}
      >
        {
          options && options.map(option => (
            <SelectOption
              key={`parameter-select-${option.key}`}
              value={option.key}
            >
              {option.value}
            </SelectOption>
          ))
        }
      </Select>
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

export default SelectEditor;
