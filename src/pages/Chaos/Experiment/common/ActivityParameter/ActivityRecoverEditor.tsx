import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styles from './ActivityRecoverEditor.css';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IComponent, IField, INode, ITolerance } from 'config/interfaces/Chaos/experiment';
import { Input, NumberPicker, Radio, Select } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const Option = Select.Option;
const { Group: RadioGroup } = Radio;

interface ActivityRecoverEditorProps {
  disabled: boolean;
  isExpertise: boolean;
  data: INode;
  onChange: (value: INode) => void;
}

export default function ActivityRecoverEditor(props: ActivityRecoverEditorProps) {

  const dispatch = useDispatch();

  const [ and, setTrue ] = useState<boolean>(true);

  useEffect(() => {
    let and;
    const { data: node } = props;

    if (!_.isEmpty(node)) {
      const fields = _.get(node, 'fields', []);
      if (!_.isEmpty(fields)) {
        const field = fields[0];
        and = _.get(field, 'and', false);
      }
    }
    setTrue(and as boolean);
  }, [ props.data ]);

  function getDefaultValueFromComponent(component: IComponent) {
    const { defaultValue } = _.defaultTo(component, {}) as any;
    return _.defaultTo(defaultValue, '');
  }

  function handleIsComponentVisible(field: IField | ITolerance) {
    const { component } = field;
    if (!_.isEmpty(component)) {
      const linkage = component.linkage;
      if (!_.isEmpty(linkage)) {
        const defaultState = linkage.defaultState;
        if (!_.isNull(defaultState) && !_.isUndefined(defaultState)) {
          return defaultState;
        }
      }
    }
    if (_.isBoolean(field.state)) {
      return field.state;
    }
    return true;
  }

  function renderComponent(field: IField | ITolerance, editorType: string, component: JSX.Element) {
    let type = '';
    if (!_.isEmpty(field.component)) {
      type = field.component.type;
    }

    if (_.isString(editorType) && type !== editorType && !(_.isEmpty(type) && editorType === FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_INPUT)) {
      return null;
    }

    if (_.isArray(editorType) && _.indexOf(editorType, type) === -1) {
      return null;
    }

    if (!handleIsComponentVisible(field)) {
      return null;
    }
    return component;
  }

  function renderSelect(field: IField, displayFields: IField[]) {
    const { disabled } = props;
    const select = (
      <Select
        disabled={disabled}
        value={field.alias}
        style={{ width: '30%' }}
        autoWidth={false}
        onChange={alias => handleSelectChange(alias, field)}
      >
        {
          _.map(displayFields, (f: IField) => {
            return <Option value={f.alias} key={f.alias}>{f.name}</Option>;
          })
        }
      </Select>
    );
    return select;
  }

  function renderOperation(field: IField) {
    const { disabled } = props;
    const { operation = {}, operations = [] } = field;

    let value;
    if (!_.isEmpty(operation)) {
      value = operation.value;
    } else {
      value = '';
    }

    const select = (
      <Select
        disabled={disabled}
        value={value}
        style={{ width: '30%' }}
        onChange={val => handleOperationChange(val, field)}
      >
        {
          !_.isEmpty(operations) && operations.map(o => {
            return <Option value={o.value} key={o.value}>{o.label}</Option>;
          })
        }
      </Select>
    );
    return select;
  }

  function renderNumberInput(field: IField | ITolerance, isTolerance = false) {
    const { disabled } = props;
    const { value } = field;
    const numberInput = (
      <NumberPicker
        disabled={disabled}
        value={value as number}
        max={100}
        min={1}
        onChange={val => handleValueChange(val, field, isTolerance)}
        style={{ width: 160 }}
      />
    );
    return renderComponent(field, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_NUMBER_INPUT, numberInput);
  }

  function renderInput(field: IField | ITolerance, isTolerance = false) {
    const { disabled } = props;
    const { value } = field;
    const input = (
      <Input
        disabled={disabled}
        value={value}
        style={{ width: '30%' }}
        onChange={val => handleValueChange(val, field, isTolerance)}
      />
    );
    return renderComponent(field, FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_INPUT, input);
  }

  function renderUnit(field: IField | ITolerance, tole?: boolean) {
    const { unit } = field;
    return (
      <span style={{ marginLeft: 8 }}>{unit}<span style={{ marginLeft: 3 }}>{tole && '(1 ~ 100)'}</span></span>
    );
  }

  function renderField(field: IField, displayFields: IField[], idx: number) {
    const { disabled } = props;
    let component: IComponent = field.component;
    if (_.isEmpty(component)) {
      component = {
        cipherText: '',
        defaultValue: '',
        requestUrl: '',
        required: true,
        unit: '',
        linkage: {
          condition: '',
          defaultState: true,
          depends: '',
        },
        type: 'input',
      };
    }

    return (
      <div className={styles.rules} key={idx}>
        {renderSelect(field, displayFields)}
        {renderOperation(field)}
        <span className={styles.units}>
          <div>
            {renderNumberInput(field)}
            {renderInput(field)}
          </div>
          {renderUnit(field)}
        </span>
        {
          !disabled && idx !== 0 && (
            <div
              className={styles.deleteRow}
              onClick={() => handleDeleteField(idx)}
            >-</div>
          )
        }
      </div>
    );
  }

  function handleDeleteField(idx: number) {
    const { isExpertise, data: node } = props;
    let { fields } = node;
    fields = _.filter(fields, (_: any, index: number) => index !== idx);
    if (isExpertise) {
      dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, fields });
    } else {
      // 每次都删除最后一条field
      dispatch.experimentEditor.setAddOrUpdateGuardNode({
        ...node,
        fields,
      });
    }
  }

  function handleValueChange(value: string | number, field: IField | ITolerance, isTolerance: boolean) {
    const { isExpertise, data: node, onChange } = props;

    if (!isTolerance) {
      const { fields } = node;
      const newFields = _.map(fields, (f: IField) => {
        // 这里直接比较引用即可，需要把operation置空
        if (f === field) {
          return {
            ...field,
            value,
          };
        }
        return { ...f };

      });

      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, fields: newFields } as INode);
      } else {
        dispatch.experimentEditor.setAddOrUpdateGuardNode({
          ...node,
          fields: newFields,
        } as INode);
      }

    } else {
      const { tolerance } = node;
      const newTolerance = _.map(tolerance, (t: ITolerance) => {
        // 这里直接比较引用即可
        if (t === field) {
          return {
            ...field,
            value,
          };
        }
        return { ...t };

      });
      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, tolerance: newTolerance });
      } else {
        dispatch.experimentEditor.setAddOrUpdateGuardNode({
          ...node,
          tolerance: newTolerance,
        });
      }
      onChange && onChange({ ...node, tolerance: newTolerance });
    }
  }

  function handleSelectChange(alias: string, field: IField) {
    // 找到相应的displayField
    const { isExpertise, data: node } = props;
    const { fields, displayFields } = node;

    // 先找到模板
    const displayField = _.find(displayFields, ({ alias: expectedAlias }: IField) => expectedAlias === alias);
    if (_.isEmpty(displayField)) {
      return;
    }

    const newFields = _.map(fields, (f: IField) => {
      // 这里直接比较引用即可，需要把operation置空
      if (f === field) {
        return {
          ...field,
          ...displayField,
          operation: {},
        };
      }
      return { ...f };

    });

    if (isExpertise) {
      dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, fields: newFields });
    } else {
      dispatch.experimentEditor.setAddOrUpdateGuardNode({
        ...node,
        fields: newFields,
      });
    }
  }

  function handleOperationChange(val: string, field: IField) {
    const { data: node, isExpertise } = props;
    const { fields } = node;
    const { operations } = field as IField;

    // 找到选中的operation对象
    let operation = _.find(operations, (o: IField) => o.value === val);
    if (_.isEmpty(operation)) {
      operation = {} as any;
    }

    const newFields = _.map(fields, (f: IField) => {
      // 这里直接比较引用即可，需要把operation置空
      if (f === field) {
        return {
          ...field,
          operation,
        };
      }
      return { ...f };

    });

    if (isExpertise) {
      dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, fields: newFields } as INode);
    } else {
      dispatch.experimentEditor.setAddOrUpdateGuardNode({
        ...node,
        fields: newFields,
      } as INode);
    }
  }

  function handleAddField() {
    const { isExpertise, data: node } = props;
    const { fields = [], displayFields = [] } = node;
    if (!_.isEmpty(displayFields)) {
      // 取第一条displayField做模板
      const firstDisplayField = displayFields[0];
      const field = {
        ...firstDisplayField,
        and,
        operation: {},
        value: getDefaultValueFromComponent(firstDisplayField.component),
      };
      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, fields: [ ...fields, field ] as IField[] });
      } else {
        dispatch.experimentEditor.setAddOrUpdateGuardNode({
          ...node,
          fields: [ ...fields, field ] as IField[],
        });
      }
    }
  }

  function handleAndChange(val: string | number | boolean) {
    const and = String(val) === 'and';
    const { isExpertise, data: node } = props;
    const { fields } = node;

    if (!_.isEmpty(fields)) {
      const newFields = _.map(fields, (field: IField) => {
        return {
          ...field,
          and,
        };
      });
      if (isExpertise) {
        dispatch.expertiseEditor.setAddOrUpdateExpertiseGuardNode({ ...node, fields: newFields });
      } else {
        dispatch.experimentEditor.setAddOrUpdateGuardNode({ ...node, fields: newFields });
      }
    }
  }

  function renderTolerance() {
    const { data: node, disabled } = props;
    if (_.isEmpty(node)) {
      return null;
    }

    const { tolerance } = node;
    if (_.isEmpty(tolerance)) {
      return null;
    }

    return _.map(tolerance, (t: ITolerance, idx: number) => {
      const { component } = t;
      return (
        <div className={styles.tole} key={idx}>
          { component && component.required && <span className={styles.required}></span> }
          { disabled && <span style={{ width: '30%' }}>{t.name}：</span> }
          { !disabled && <Input value={t.name} readOnly={true} style={{ width: '30%' }}/> }
          <span className={styles.unitsTole}>
            {renderNumberInput(t, true)}
            {renderInput(t, true)}
            {renderUnit(t, true)}
          </span>
        </div>
      );
    });
  }

  const { data: node, disabled } = props;
  if (_.isEmpty(node)) {
    return null;
  }

  const { fields = [], displayFields = [] } = node;
  return (
    <div>
      <div>
        {
          _.map(fields, (field: IField, idx: number) => {
            return renderField(field, displayFields, idx);
          })
        }
      </div>
      { !disabled && fields.length > 0 && <div className={styles.addRow} onClick={handleAddField}>+</div>}
      <div className={styles.rowSeparator}></div>
      {fields.length > 0 && <RadioGroup disabled={disabled} value={and ? 'and' : 'or'} onChange={handleAndChange as any}>
        <Radio id="and" value="and">且</Radio>
        <Radio id="or" value="or">或</Radio>
      </RadioGroup>}
      <div className={styles.recoverRules}>恢复策略</div>
      <div>
        {renderTolerance()}
      </div>
    </div>
  );
}
