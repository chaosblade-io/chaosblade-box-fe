import React, { FC, useState } from 'react';
import _ from 'lodash';
import i18n from '../../../../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { DatePicker, Switch } from '@alicloud/console-components';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IParamter } from 'config/interfaces/Chaos/experiment';

interface IProps {
  parameter: IParamter;
  isSwitch: boolean;
  onChange: (id: string, type: string, alias: string, value: string | number | boolean, component: IComponent) => void;
  width: number;
  disabled: boolean;
}

const DatePickerEditor: FC<IProps> = props => {

  const { parameter, onChange, disabled, isSwitch } = props;

  const [ dateValue, setDateValue ] = useState<string | number | boolean>(parameter && parameter.value || '');

  function isVisible(parameter: IParamter, defaultState: boolean) {
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
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, dateValue, component);
  }

  function handleChange(dateValue: any) {
    let date: any = null;
    if (!_.isEmpty(dateValue)) {
      if (dateValue.constructor.name !== 'Moment') {
        date = moment(dateValue).valueOf();
      } else {
        date = dateValue.valueOf();
      }
    }
    setDateValue(date);
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, date, parameter.component);
  }

  let type = '';
  let linkage = {};
  let defaultValue: number | string | boolean = moment().valueOf();
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      type = component.type;
      linkage = component.linkage;
      defaultValue = component.defaultValue;
      opLevel = component.opLevel;
    }
  }

  if (type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_DATE) {
    return null;
  }
  const defaultState = _.get(linkage, 'defaultState', true);
  if (!isVisible(parameter, defaultState)) {
    return null;
  }

  let value: any = defaultValue;
  if (!_.isNull(parameter) && !_.isUndefined(parameter)) {
    value = parameter.value;
  }

  if (!_.isEmpty(value) && !_.isNumber(value)) {
    value = parseInt(value);
  }

  if (_.isNumber(value) && value.constructor.name !== 'Moment') {
    value = moment(value as number);
  }

  return (
    <div className={isSwitch ? styles.paramesItem : undefined}>
      <DatePicker
        value={value}
        disabled={disabled || false}
        onChange={handleChange}
        className={isSwitch ? styles.switchEditStyle : styles.DatePicker}
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
      <div className={styles.errorMessage}>{parameter && parameter.errorMessage}</div>
    </div>
  );
};

export default DatePickerEditor;
