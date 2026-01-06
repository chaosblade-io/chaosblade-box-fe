import DatePickerEditor from './DatePickerEditor';
import HighlightTextAreaEditor from './HighlightTextAreaEditor';
import InputEditor from './InputEditor';
import NumberInputEditor from './NumberInputEditor';
import RadioEditor from './RadioEditor';
import React from 'react';
import RemotelySelectEditor from './RemotelySelectEditor';
import SearchEditor from './SearchEditor';
import SelectEditor from './SelectEditor';
import TimePickerEditor from './TimePickerEditor';
import * as _ from 'lodash';
import styles from './ActivityParameterEditor.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IArgs, IComponent, IHost, IParamter } from 'config/interfaces/Chaos/experiment';

interface ActivityParameterEditorProps {
  parameter: IParamter;
  onChange?: (parameterId: string, type: any, alias: string, value: string | number | boolean, component?: IComponent) => void;
  width?: number;
  isSwitch?: boolean;
  argumentsList?: IArgs[];
  scopes?: IHost[];
  code?: string;
  opLevel?: boolean;
  disabled?: boolean;
  configurationIds?: string[];
  key?: any;
}

function ActivityParameterEditor(props: ActivityParameterEditorProps): JSX.Element | null {

  function handleIsVisible(parameter: IParamter) {
    if (!_.isEmpty(parameter)) {
      const { component } = parameter;
      if (!_.isEmpty(component)) {
        const linkage = component.linkage;
        if (!_.isEmpty(linkage)) {
          const defaultState = linkage.defaultState;
          if (!_.isNull(defaultState) && !_.isUndefined(defaultState)) {
            return defaultState;
          }
        }
      }
    }
    if (_.isBoolean(parameter.state)) {
      return parameter.state;
    }
    return true;

  }

  function getParameterComponentIfy(parameter: IParamter, editorType: string, componentType: JSX.Element) {
    let type = '';
    if (!_.isEmpty(parameter)) {
      const { component } = parameter;
      if (!_.isEmpty(component)) {
        type = component.type;
      }
    }

    if (_.isString(editorType) && type !== editorType && !(_.isEmpty(type) && editorType === FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_INPUT)) {
      return null;
    }

    if (_.isArray(editorType) && _.indexOf(editorType, type) === -1) {
      return null;
    }

    if (!handleIsVisible(parameter)) {
      return null;
    }
    return componentType;
  }

  function renderNumberInput() {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);
    // isSwitch 后台经验创建
    const numberInput = (
      <NumberInputEditor
        parameter={parameter}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_NUMBER_INPUT, numberInput), parameter);
  }

  function renderInput(type: string) {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);
    const input = (
      <InputEditor
        parameter={parameter}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return getParameterComponentIfy(parameter, type, input);
  }

  function renderPassword(type: string) {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);
    const inputPassword = (
      <InputEditor
        parameter={parameter}
        htmlType="password"
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );
    return getParameterComponentIfy(parameter, type, inputPassword);
  }

  function renderRadio() {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);
    const radio = (
      <RadioEditor
        parameter={parameter}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_RADIO, radio), parameter);
  }

  function renderSelect() {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);
    const select = (
      <SelectEditor
        parameter={parameter}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT, select), parameter);
  }

  function renderSearch() {
    const { parameter, argumentsList, scopes, code, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);

    const search = (
      <SearchEditor
        parameter={parameter}
        argumentsList={argumentsList!}
        scopes={scopes!}
        code={code}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SEARCH, search), parameter);
  }

  function renderRemotelySelect() {
    const { parameter, argumentsList, scopes, code, onChange, disabled, width, isSwitch, configurationIds } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);

    const remotelySelect = (
      <RemotelySelectEditor
        parameter={parameter}
        argumentsList={argumentsList!}
        configurationIds={configurationIds}
        scopes={scopes!}
        code={code}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT_REMOTE, remotelySelect), parameter);
  }

  function renderTimePicker() {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);
    const timePicker = (
      <TimePickerEditor
        parameter={parameter}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_TIME, timePicker), parameter);
  }

  function renderDatePicker() {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);

    const datePicker = (
      <DatePickerEditor
        parameter={parameter}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_DATE, datePicker), parameter);
  }

  function renderRichEditor(type: string) {
    const { parameter, onChange, disabled, width, isSwitch } = props;
    const disable = disabled || (!isSwitch && parameter.component && parameter.component.opLevel);

    const editor = (
      <HighlightTextAreaEditor
        parameter={parameter}
        onChange={onChange!}
        disabled={disable as boolean}
        width={width!}
        isSwitch={isSwitch!}
      />
    );

    return withLabel(getParameterComponentIfy(parameter, type, editor), parameter);
  }

  function withLabel(component: JSX.Element | null, parameter: IParamter, style = {}) {
    if (_.isNull(component)) {
      return '';
    }

    let required = false;

    if (!_.isEmpty(parameter)) {
      const { component: parameterComponent } = parameter;
      if (!_.isEmpty(parameterComponent)) {
        required = parameterComponent.required;
      }
    }
    const { name, description, alias = '' } = parameter;
    return (
      <div className={styles.parameterContainer} style={style}>
        <div className={styles.label}>
          <span className={required ? styles.required : ''}>{name}</span>
          {name !== alias && <div style={{ color: '#555555' }} className={styles.description}>({alias})</div>}
          {
            description && <p className={styles.description}>{description}</p>
          }
        </div>
        {component}
      </div>
    );
  }

  const { parameter } = props;
  if (_.isEmpty(parameter)) {
    return null;
  }

  return (
    <div>
      {renderNumberInput()}
      {renderInput(FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_INPUT)}
      {renderPassword(FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_PASSWORD)}
      {renderRadio()}
      {renderSelect()}
      {renderSearch()}
      {renderRemotelySelect()}
      {renderTimePicker()}
      {renderDatePicker()}
      {renderRichEditor(FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_YAML)}
      {renderRichEditor(FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_JSON)}
      {renderRichEditor(FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_CODE)}
    </div>
  );
}

export default ActivityParameterEditor;
