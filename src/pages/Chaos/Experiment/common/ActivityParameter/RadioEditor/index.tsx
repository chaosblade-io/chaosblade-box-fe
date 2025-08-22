import React, { useState } from 'react';
import * as _ from 'lodash';
import i18n from '../../../../../../i18n';
import styles from './index.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IOption, IParamter } from 'config/interfaces/Chaos/experiment';
import { Radio, Switch } from '@alicloud/console-components';

const { Group: RadioGroup } = Radio;

interface RadioEditorProps {
  parameter: IParamter;
  onChange: (id: string, type: string, alias: string, value: number | string | boolean, component: IComponent) => void;
  disabled: boolean;
  isSwitch: boolean;
  width: number;
}

function RadioEditor(props: RadioEditorProps) {
  const [ radioValue, setRadioValue ] = useState(props.parameter && props.parameter.value || false);

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
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, radioValue, component);
  }

  const { parameter, onChange, disabled, isSwitch } = props;
  const { errorMessage } = parameter;

  let type = '';
  // let linkage = {};
  let options: IOption[] = [];
  let defaultValue = false;
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      type = component.type;
      // linkage = component.linkage || {};
      options = component.options as IOption[];
      defaultValue = component.defaultValue as boolean;
      opLevel = component.opLevel;
    }
  }

  if (type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_RADIO) {
    return null;
  }

  const defaultState = _.get(parameter, 'defaultState', true);
  if (!handleIsVisible(parameter, defaultState)) {
    return null;
  }

  let value = defaultValue;
  if (!_.isNull(parameter) && !_.isUndefined(parameter)) {
    value = parameter.value as boolean || false;
  }

  return (
    <div className={isSwitch ? styles.paramesItem : ''}>
      <RadioGroup
        value={value}
        disabled={disabled || false}
        onChange={value => {
          setRadioValue(value);
          onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, value, parameter.component);
        }}
        className={isSwitch ? styles.switchEditStyle : ''}
      >
        {
          options && options.map(option => (
            <Radio
              className={styles.radio}
              key={`parameter-radio-${option.key}`}
              value={option.key}
              label={option.value}
            />
          ))
        }
      </RadioGroup>
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

export default RadioEditor;
