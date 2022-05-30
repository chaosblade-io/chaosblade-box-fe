import React, { useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import i18n from '../../../../../../i18n';
import styles from './index.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IParamter } from 'config/interfaces/Chaos/experiment';
import { NumberPicker, Switch } from '@alicloud/console-components';

interface NumberInputEditorProps {
  parameter: IParamter;
  onChange: (id: string, type: string, alias: string, value: number | string | boolean, component: IComponent) => void;
  disabled: boolean;
  isSwitch: boolean;
  width: number;
}
export default function NumberInputEditor(props: NumberInputEditorProps) {

  const [ numberValue, setNumberValue ] = useState(props.parameter?.value || props.parameter?.component?.defaultValue || 0);

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
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, numberValue, component);
  }

  const { parameter, onChange, disabled, isSwitch } = props;
  const errorMessage = _.get(parameter, 'errorMessage', '');
  const inputClass = errorMessage ? styles.error : '';

  let type = '';
  let linkage = {};
  // let defaultValue: number | string = '';
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      type = component.type;
      linkage = component.linkage || {};
      // defaultValue = component.defaultValue as number | string;
      opLevel = component.opLevel;
    }
  }

  if (type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_NUMBER_INPUT) {
    return null;
  }

  const defaultState = _.get(linkage, 'defaultState', true);
  if (!handleIsVisible(parameter, defaultState)) {
    return null;
  }

  // let value = defaultValue;
  // if (!_.isNull(parameter.value) && !_.isUndefined(parameter.value)) {
  //   value = parameter.value as string | number;
  // }

  // if (value && !_.isNumber(value)) {
  //   value = parseInt(value as string);
  // }

  return (
    <div className={isSwitch ? styles.paramesItem : ''}>
      <div className={classnames(inputClass, isSwitch ? styles.switchEditStyle : styles.numWidth)}>
        <NumberPicker
          value={numberValue as number}
          disabled={disabled || false}
          onChange={numberValue => {
            setNumberValue(numberValue);
            onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, numberValue, parameter.component);
          }}
        />
      </div>
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
