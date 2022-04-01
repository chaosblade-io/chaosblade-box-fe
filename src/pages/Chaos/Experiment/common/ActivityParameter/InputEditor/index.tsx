import React, { useState } from 'react';
import TextInput from 'pages/Chaos/common/Input/TextInput';
import _ from 'lodash';
import styles from './index.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IParamter } from 'config/interfaces/Chaos/experiment';
import { Switch } from '@alicloud/console-components';

interface InputEditorProps {
  parameter: IParamter;
  isSwitch: boolean;
  htmlType?: string;
  onChange: (id: string, type: string, alias: string, value: string | number | boolean, component: IComponent) => void;
  width: number;
  disabled: boolean;
}

export default function InputEditor(props: InputEditorProps) {

  const [ inputValue, setInputValue ] = useState(props.parameter?.value || props.parameter?.component?.defaultValue || '');

  function handleIsVisible(parameter: IParamter, defaultState: boolean) {
    if (_.isEmpty(parameter)) {
      return defaultState;
    }
    if (_.isBoolean(parameter.state)) {
      return parameter.state;
    }
    return true;

  }

  const handleSwitchChange = (value: boolean) => {
    const { parameter, onChange } = props;
    const { component } = parameter;
    component.opLevel = value ? 0 : 1;
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, inputValue, component);
  };

  const { isSwitch, onChange, parameter, disabled, htmlType } = props;
  let required = false;
  let type = '';
  let linkage = {};
  let defaultValue = '';
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      required = component.required;
      type = component.type;
      linkage = component.linkage || {};
      defaultValue = component.defaultValue as string;
      opLevel = component.opLevel;
    }
  }

  if (!_.isEmpty(type) && type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_INPUT && type !== FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_PASSWORD) {
    return null;
  }

  const defaultState = _.get(linkage, 'defaultState', true);
  if (!handleIsVisible(parameter, defaultState)) {
    return null;
  }

  // let value: any = defaultValue;
  // if (!_.isNull(parameter.value) && !_.isUndefined(parameter.value)) {
  //   value = parameter.value as string;
  // }

  // 报错信息
  const errorMessage = _.get(parameter, 'errorMessage', '');
  return (
    <div className={isSwitch ? styles.paramesItem : ''}>
      <TextInput
        value={inputValue as string}
        htmlType={htmlType!}
        direction="vertical"
        label={parameter && parameter.name}
        tip={parameter && parameter.description}
        required={required}
        errorMessage={errorMessage!}
        defaultValue={defaultValue}
        disabled={disabled || false}
        wrapperStyle={{ paddingTop: 0 }}
        labelStyle={{ fontSize: 12, color: '#262626', lineHeight: '18px' }}
        onChange={(value: string) => {
          setInputValue(value);
          onChange && onChange(parameter.parameterId!, parameter.type!, parameter.alias!, value, parameter.component!);
        }}
        className={isSwitch ? styles.switchEditStyle : ''}
        alias={_.get(parameter, 'alias', '')}
      />
      {isSwitch ?
        <span className={styles.paramesContro}>
          <span className={styles.switchValue}>
            { opLevel === 0 ? '可操作' : '不可操作'}
          </span>
          <Switch
            checked={opLevel === 0}
            size="small"
            onChange={handleSwitchChange}
          />
        </span> : null
      }
    </div>
  );
}
