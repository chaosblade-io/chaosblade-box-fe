import React, { FC, useEffect } from 'react';

import { Form, Input, Message } from '@alicloud/console-components';

const FormItem = Form.Item;

import styles from './index.css';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

import { getParams, removeParams } from 'utils/libs/sre-utils';

const actionConf = {
  0: {
    title: '账号登陆',
    method: 'onLogin',
  },
  1: {
    title: '账号登录',
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
      return Message.error('确认密码错误，请检查！');
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
    return (
      <>
        <FormItem required>
          <Input name="name" trim placeholder="用户名"/>
        </FormItem>
        <FormItem required>
          <Input name="password" trim htmlType="password" placeholder="密码"/>
        </FormItem>
        <FormItem label="">
          <Form.Submit className={styles.orangeBtn} size="large" style={{ width: '100%', marginTop: '6px' }} validate onClick={handleSubmit} >
            登录
          </Form.Submit>
        </FormItem>
        <div className={styles.helpText}><span>找回密码</span>｜<span onClick={() => onChangeAction(1)}>立即注册</span></div>
      </>
    );
  };
  const renderRegist = () => {
    return (
      <>
        <FormItem required>
          <Input name="name" trim placeholder="用户名"/>
        </FormItem>
        <FormItem required>
          <Input name="password" trim htmlType="password" placeholder="密码"/>
        </FormItem>
        <FormItem required>
          <Input name="passwordConfirme" trim htmlType="password" placeholder="确认密码"/>
        </FormItem>
        <FormItem label="">
          <Form.Submit className={styles.orangeBtn} size="large" style={{ width: '100%', marginTop: '6px' }} validate onClick={handleSubmit} >
            注册
          </Form.Submit>
        </FormItem>
        <div className={styles.helpText}><span onClick={() => onChangeAction(0)}>返回登录</span></div>
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
