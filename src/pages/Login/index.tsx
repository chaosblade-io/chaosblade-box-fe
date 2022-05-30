import React, { FC, useEffect } from 'react';
import Translation from 'components/Translation';
import i18n from '../../i18n';
import { Form, Input, Message } from '@alicloud/console-components';
import { getLanguage } from '../../utils/util';

const FormItem = Form.Item;

import styles from './index.css';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

import { getParams, removeParams } from 'utils/libs/sre-utils';

const actionConf = {
  0: {
    title: i18n.t('Account login'),
    method: 'onLogin',
  },
  1: {
    title: i18n.t('Account login'),
    method: 'onRegister',
  },
};

const Login: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const action = Number(getParams('type'));

  useEffect(() => {
    dispatch.loginUser.setLoginUser({} as any); // 兼容手动输入login页面
    return () => {
      removeParams('id');
    };
  }, []);

  const handleSubmit = async (values: any, error: any) => {
    if (error) {
      return;
    }
    if (action === 1 && values.password !== values.passwordConfirme) {
      // 判断登陆密码和确认密码是否一直
      return Message.error(i18n.t('Confirm password is incorrect, please check'));
    }
    const params = {
      userName: values.name,
      password: values.password,
    };
    const method = actionConf[action]?.method;
    if (method) {
      const res = await dispatch.loginUser[method](params);
      if (res) {
        if (action === 1) {
          pushUrl(history, '/login', { type: 0 });
        } else if (res) {
          pushUrl(history, '/index');
        }
      }
    }
  };
  const onChangeAction = (type: number) => {
    pushUrl(history, '/login', { type });
  };
  const renderLogin = () => {
    const language = getLanguage();
    let nameRequiredMessage,
      passwordRequiredMessage;
    if (language === 'zh') {
      nameRequiredMessage = 'name 是必填字段';
      passwordRequiredMessage = 'password 是必填字段';
    } else {
      nameRequiredMessage = 'name is a required field';
      passwordRequiredMessage = 'password is a required field';
    }

    return (
      <>
        <FormItem required requiredMessage={nameRequiredMessage}>
          <Input name="name" trim placeholder={i18n.t('Username')}/>
        </FormItem>
        <FormItem required requiredMessage={passwordRequiredMessage}>
          <Input name="password" trim htmlType="password" placeholder={i18n.t('password')}/>
        </FormItem>
        <FormItem label="">
          <Form.Submit className={styles.orangeBtn} size="large" style={{ width: '100%', marginTop: '6px' }} validate onClick={handleSubmit} >
            <Translation>Login</Translation>
          </Form.Submit>
        </FormItem>
        <div className={styles.helpText}><span><Translation>Retrieve password</Translation></span>｜<span onClick={() => onChangeAction(1)}><Translation>Sign up now</Translation></span></div>
      </>
    );
  };
  const renderRegist = () => {
    const language = getLanguage();
    let nameRequiredMessage,
      passwordRequiredMessage;
    if (language === 'zh') {
      nameRequiredMessage = 'name 是必填字段';
      passwordRequiredMessage = 'password 是必填字段';
    } else {
      nameRequiredMessage = 'name is a required field';
      passwordRequiredMessage = 'password is a required field';
    }
    return (
      <>
        <FormItem required requiredMessage={nameRequiredMessage}>
          <Input name="name" trim placeholder={i18n.t('Username').toString()}/>
        </FormItem>
        <FormItem required requiredMessage={passwordRequiredMessage}>
          <Input name="password" trim htmlType="password" placeholder={i18n.t('Password').toString()}/>
        </FormItem>
        <FormItem required>
          <Input name="passwordConfirme" trim htmlType="password" placeholder={i18n.t('Confirm Password')}/>
        </FormItem>
        <FormItem label="">
          <Form.Submit className={styles.orangeBtn} size="large" style={{ width: '100%', marginTop: '6px' }} validate onClick={handleSubmit} >
            <Translation>Register</Translation>
          </Form.Submit>
        </FormItem>
        <div className={styles.helpText}><span onClick={() => onChangeAction(0)}><Translation>Back to login</Translation></span></div>
      </>
    );
  };
  return (
    <div className={styles.login}>
      <div className={styles.loginBox}>
        <div className={styles.header}>{actionConf[action]?.title}</div>
        <Form
          className={styles.form}
          labelTextAlign="left"
          size="large"
          labelAlign="inset"
        >
          {action === 0 && renderLogin()}
          {action === 1 && renderRegist()}
        </Form>
      </div>
    </div>
  );
};

export default Login;
