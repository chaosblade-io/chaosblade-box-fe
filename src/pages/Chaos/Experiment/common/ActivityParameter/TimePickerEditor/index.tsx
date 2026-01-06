import React, { FC, useState } from 'react';
import * as _ from 'lodash';
import i18n from '../../../../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IParamter } from 'config/interfaces/Chaos/experiment';
import { Switch, TimePicker } from '@alicloud/console-components';

interface IProps {
  parameter: IParamter;
  isSwitch: boolean;
  htmlType?: string;
  onChange: (id: string, type: string, alias: string, value: string | number | boolean, component: IComponent) => void;
  width: number;
  disabled: boolean;
}

const TimePickerEditor: FC<IProps> = props => {

  const { parameter, onChange, disabled, isSwitch } = props;
  const [ timeValue, setTimeValue ] = useState<any>(parameter && parameter.value || '');

  function isVisible(parameter: any, defaultState: any) {
    if (_.isEmpty(parameter)) {
      return defaultState;
    }
    if (_.isBoolean(parameter.state)) {
      return parameter.state;
    }
    return true;

  }

  function handleSwitchChange(value: boolean) {
    const { component } = parameter;
    component.opLevel = value ? 0 : 1;
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, timeValue, component);
  }

  const { errorMessage } = parameter;

  let type = '';
  let linkage = {};
  let defaultValue: any = moment().valueOf();
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      type = component.type;
      linkage = component.linkage || {};
      defaultValue = component.defaultValue;
      opLevel = component.opLevel;
    }
  }

  if (type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_TIME) {
    return null;
  }

  const defaultState = _.get(linkage, 'defaultState', true);

  if (!isVisible(parameter, defaultState)) {
    return null;
  }

  let value = defaultValue;
  if (!_.isNull(parameter) && !_.isUndefined(parameter)) {
    value = parameter.value;
  }

  if (!_.isEmpty(value) && !_.isNumber(value)) {
    value = parseInt(value);
  }

  if (_.isNumber(value) && value.constructor.name !== 'Moment') {
    value = moment(value);
  }

  return (
    <div className={isSwitch ? styles.paramesItem : ''}>
      <TimePicker
        value={value}
        className={isSwitch ? styles.switchEditStyle : styles.timePicker}
        disabled={disabled || false}
        onChange={timeValue => {
          let time: any = null;
          if (!_.isEmpty(timeValue)) {
            if (timeValue.constructor.name !== 'Moment') {
              time = moment(timeValue).valueOf();
            } else {
              time = timeValue.valueOf();
            }
          }
          setTimeValue(time);
          onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, (time as number), parameter.component);
        }}
      />
      {isSwitch ?
        <span className={styles.paramesContro}>
          <span className={styles.switchValue}>
            {opLevel === 0 ? i18n.t('Operational').toString() : i18n.t('Inoperable').toString()}
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

};

export default TimePickerEditor;
