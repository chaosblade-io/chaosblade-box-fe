import AceEditor from 'react-ace';
import React, { FC, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import classnames from 'classnames';
import i18n from '../../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Dialog, Input, Select, Switch } from '@alicloud/console-components';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IParamter } from 'config/interfaces/Chaos/experiment';

import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import 'brace/mode/groovy';
import 'brace/mode/java';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/python';
import 'brace/mode/yaml';
import 'brace/theme/github';
import 'brace/theme/monokai';

const SUPPORT_TYPES = [
  FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_JSON,
  FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_YAML,
  FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_CODE,
];

interface IProps {
  parameter: IParamter;
  isSwitch: boolean;
  onChange: (id: string, type: string, alias: string, value: string | number | boolean, component: IComponent) => void;
  width: number;
  disabled: boolean;
  full?: boolean;
}

const HighlightTextAreaEditor: FC<IProps> = props => {

  const [ textValue, setTextValue ] = useState(props.parameter && props.parameter.value || '');
  const [ fullscreen, setFullscreen ] = useState(false);
  const [ collapsed, setCollapsed ] = useState(false);
  const [ mode, setMode ] = useState('java');

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
    onChange && onChange(parameter.parameterId, parameter.type, parameter.alias, textValue, component);
  }

  function switchFullscreen() {
    setFullscreen(!fullscreen);
  }

  function switchPanel() {
    setCollapsed(!collapsed);
  }

  // props可传入with
  const { parameter, onChange, isSwitch, disabled } = props;
  const type = 'json';
  let linkage = {};
  let defaultValue = '';
  let opLevel;

  if (!_.isEmpty(parameter)) {
    const { component } = parameter;
    if (!_.isEmpty(component)) {
      // type = component.type;
      linkage = component.linkage || {};
      defaultValue = component.defaultValue as string;
      opLevel = component.opLevel;
    }
  }


  if (_.indexOf(SUPPORT_TYPES, type) === -1) {
    return null;
  }

  const defaultState = _.get(linkage, 'defaultState', true);
  if (!isVisible(parameter, defaultState)) {
    return null;
  }

  let value = defaultValue;
  if (!_.isNull(parameter) && !_.isUndefined(parameter)) {
    value = parameter.value as string || '';
  }

  return (
    <div className={isSwitch ? styles.paramesItem : styles.content} style={{ display: !props.full && isSwitch ? 'flex' : 'block' }}>
      {
        (props.full && !disabled) &&
        <div style={{ marginBottom: 8 }}>
          <Translation>Language</Translation>
          <Select
            size="small"
            value={mode}
            onChange={value => setMode(value)}
            dataSource={[ 'java', 'groovy' ]}
            style={{ marginLeft: 8 }}
            locale={locale().Select}
          />
        </div>
      }
      {
        disabled ?
          <Input.TextArea
            disabled={disabled}
            value={value}
            className={classnames(isSwitch ? styles.switchEditStyle : styles.textarea, (props.full || collapsed) ? styles.fullStyle : undefined)}
          /> :
          <AceEditor
            className={classnames(isSwitch ? styles.switchEditStyle : styles.textarea, props.full ? styles.fullStyle : styles.editor)}
            mode={mode}
            theme={'githup'}
            width={isSwitch ? '71%' : '100%'}
            height={collapsed ? '300px' : '30px'}
            name={`${_.lowerCase('java')}Editor`}
            fontSize={12}
            showPrintMargin={false}
            showGutter={false}
            highlightActiveLine={false}
            value={value}
            editorProps={{
              $blockScrolling: true,
            }}
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
            }}
            onChange={(value: string) => {
              setTextValue(value);
              onChange && onChange(parameter.parameterId!, parameter.type!, parameter.alias!, value, parameter.component!);
            }}
          />
      }
      {
        !props.full &&
        <div className={styles.fullScreenBtn} style={{ right: isSwitch ? '125px' : '5px' }}>
          <div onClick={switchFullscreen}><Translation>Full screen</Translation></div>
          <div onClick={switchPanel}>{!collapsed ? i18n.t('Expand').toString() : i18n.t('Fold').toString()}</div>
        </div>
      }
      {isSwitch && !props.full ?
        <span className={styles.paramesContro}>
          <span className={styles.switchValue}>
            {opLevel === 0 ? i18n.t('Operational').toString() : i18n.t('Inoperable').toString()}
          </span>
          <Switch
            checked={opLevel === 0}
            size="small"
            onChange={handleSwitchChange}
            style={{ top: '4px' }}
          />
        </span>
        : null
      }
      <Dialog
        visible={fullscreen}
        onClose={switchFullscreen}
        footer={false}
        title={parameter && parameter.name ? parameter.name : null}
        locale={locale().Dialog}
      >
        <HighlightTextAreaEditor {...props} full={true} />
      </Dialog>
    </div>
  );

};

export default HighlightTextAreaEditor;
