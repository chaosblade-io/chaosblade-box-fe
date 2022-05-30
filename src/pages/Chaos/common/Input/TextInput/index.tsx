import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './index.css';
import { Balloon, Icon, Input } from '@alicloud/console-components';
import { ITextInputProps } from 'config/interfaces/Chaos/components';

export default function TextInput(props: ITextInputProps) {

  const {
    labelPlacement,
    direction,
    value,
    defaultValue,
    type,
    label,
    required,
    maxLength,
    wrapperStyle,
    labelStyle,
    tip,
    icon,
    errorMessage,
    htmlType,
    textbefore,
    onClickIcon,
    iconTip,
    autoheight,
    alias,
  } = props;

  let inputClass = styles.input;
  if (maxLength && maxLength > 0) {
    inputClass = classnames(styles.limit, inputClass);
  }
  if (errorMessage) {
    inputClass = classnames(styles.error, inputClass);
  }

  let labelClass = styles.label;
  let containerClass = styles.container;
  let errorMessageClass = styles.errorMessage;
  let requiredClass = '';

  if (direction === 'vertical') {
    containerClass = classnames(containerClass, styles.vertical);
    labelClass = classnames(labelClass, styles.labelVertical);
    inputClass = classnames(styles.inputVertical, inputClass);
  } else {
    containerClass = classnames(containerClass, styles.horizontal);
    errorMessageClass = classnames(errorMessageClass, styles.messageHorizontal);
    inputClass = classnames(styles.inputHorizontal, inputClass);

    if (labelPlacement === 'left') {
      labelClass = classnames(labelClass, styles.labelHorizontal, styles.labelLeft);
    } else {
      labelClass = classnames(labelClass, styles.labelHorizontal, styles.labelRight);
    }
  }

  if (required) {
    if (labelPlacement === 'left') {
      requiredClass = styles.requiredRight;
    } else {
      requiredClass = styles.requiredLeft;
    }
  }

  if (type === 'textarea') {
    containerClass = classnames(styles.textarea, containerClass);
  }

  return (
    <div className={styles.wrapper} style={wrapperStyle}>
      <div className={containerClass}>
        <div className={labelClass}>
          <span className={requiredClass} style={labelStyle}>{label}</span>
          {label !== alias && <div style={{ color: '#555555', fontSize: 12 }} className={styles.tip}>({alias})</div>}
          {
            tip && tip.length > 0 && direction === 'vertical'
              ? (
                <p className={styles.tip}>{tip}</p>
              )
              : ''
          }
        </div>
        <div className={inputClass}>
          {
            maxLength && maxLength > 0 && type !== 'search'
              ? (<div className={styles.length}>{value ? value.length : 0}/{maxLength}</div>)
              : ''
          }
          {
            !type || type === 'text'
              ? (
                <Input
                  hasClear={!icon || !_.isNumber(props.maxLength) || Number(props.maxLength) <= 0}
                  {...props}
                  defaultValue={defaultValue}
                  label=''
                  addonTextBefore={textbefore}
                  htmlType={htmlType}
                  innerAfter={
                    icon && <Balloon trigger={
                      <Icon
                        type={icon}
                        size="medium"
                        onClick={onClickIcon}
                        className={styles.iconTips}
                      />
                    } closable={true}>
                      {iconTip}
                    </Balloon>
                  }
                />
              ) : ''
          }
          {
            type === 'textarea'
              ? (
                <Input.TextArea
                  autoHeight={_.defaultTo(autoheight, { minRows: 6, maxRows: 6 })}
                  {..._.omit(props, 'hasClear')}
                />
              ) : ''
          }
        </div>
        {
          tip && tip.length > 0 && direction !== 'vertical'
            ? (
              <Balloon trigger={<Icon className={styles.tips} type="question-circle"/>} closable={false}>
                {tip}
              </Balloon>

            )
            : ''
        }
      </div>
      <div className={errorMessageClass}>{errorMessage}</div>
    </div>
  );
}
