import i18n from '../../../i18n';

export const FunctionParameterConstants = {
  PARAMETER_TYPE_MATCHER: 0,
  PARAMETER_TYPE_ACTION: 1,
  PARAMETER_TYPE_USER: 2,
  PARAMETER_COMPONENT_TYPE_INPUT: 'input',
  PARAMETER_COMPONENT_TYPE_PASSWORD: 'password',
  PARAMETER_COMPONENT_TYPE_NUMBER_INPUT: 'number',
  PARAMETER_COMPONENT_TYPE_RADIO: 'radio',
  PARAMETER_COMPONENT_TYPE_SELECT: 'select',
  PARAMETER_COMPONENT_TYPE_SELECT_REMOTE: 'select_remote',
  PARAMETER_COMPONENT_TYPE_SEARCH: 'search',
  PARAMETER_COMPONENT_TYPE_TIME: 'time',
  PARAMETER_COMPONENT_TYPE_DATE: 'date',
  PARAMETER_COMPONENT_TYPE_JSON: 'json',
  PARAMETER_COMPONENT_TYPE_YAML: 'yaml',
  PARAMETER_COMPONENT_TYPE_CODE: 'code',
};

export const COMPONENT_TYPES = {
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_RADIO ]: i18n.t('Single box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_PASSWORD ]: i18n.t('Password box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SEARCH ]: i18n.t('Search box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_INPUT ]: i18n.t('Input box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT ]: i18n.t('Drop down selection box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT_REMOTE ]: i18n.t('Dropdown selection box (remote)'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_NUMBER_INPUT ]: i18n.t('Number input box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_TIME ]: i18n.t('Time selection box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_DATE ]: i18n.t('Date selection box'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_JSON ]: i18n.t('Rich Text Edit Box (JSON)'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_YAML ]: i18n.t('Rich Text Edit Box (YAML)'),
  [ FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_CODE ]: i18n.t('Code edit box'),
};
