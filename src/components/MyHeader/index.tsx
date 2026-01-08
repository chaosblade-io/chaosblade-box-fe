import React, { FC, useState } from 'react';
import SwitchButton from '../../components/SwitchButton';
import Translation from 'components/Translation';
import i18n from '../../i18n';
import locale from '../../utils/locale';
import { Balloon, Button, Dialog, Form, Input, Message } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const FormItem = Form.Item;

import styles from './index.css';

const MyHeader: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const loginInfo = useSelector(({ loginUser }) => loginUser);

  const [ visible, setVisible ] = useState<boolean>(false);
  const [ changePasswordVisible, setChangePasswordVisible ] = useState<boolean>(false);

  const logout = async () => {
    const res = await dispatch.loginUser.onLoginout();
    if (res) {
      pushUrl(history, '/login');
    }
  };

  const handleChangePassword = async (values: any, error: any) => {
    if (error) {
      return;
    }
    if (values.newPassword !== values.confirmPassword) {
      Message.error(i18n.t('Confirm password is incorrect, please check'));
      return;
    }
    try {
      const res = await dispatch.loginUser.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      if (res) {
        Message.success(i18n.t('Password changed successfully'));
        setChangePasswordVisible(false);
      }
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as any).message : undefined;
      Message.error(errorMessage || i18n.t('Failed to change password'));
    }
  };

  const handleOpenChangePassword = () => {
    setChangePasswordVisible(true);
    setVisible(false);
  };
  const notLogin = location.pathname === '/login' || !loginInfo?.userName;
  return (
    <div className={styles.myHeader}>
      <div className={ styles.mhContent}>
        <div className={styles.logo}><img src={require('../../imgs/logo.png')}/></div>
        <div className={styles.right}>
          <div className={styles.velaItem}>
            <SwitchButton />
          </div>
          <Balloon
            align="bl"
            visible={visible}
            trigger={<div className={styles.userInfo}>{notLogin ? <Translation>Not logged in</Translation> : loginInfo?.userName || <Translation>Not logged in</Translation>}</div>}
            triggerType="hover"
            onClose={() => setVisible(false)}
            onVisibleChange={setVisible}
          >
            <div style={{ width: '266px' }}>
              <div><Translation>Username</Translation>: {loginInfo?.userName}</div>
              <br />
              <Button type="primary" style={{ width: '266px', marginBottom: '8px' }} onClick={handleOpenChangePassword}><Translation>Change Password</Translation></Button>
              <Button type="normal" style={{ width: '266px' }} onClick={logout}><Translation>Sign out</Translation></Button>
            </div>
          </Balloon>
        </div>
      </div>
      <Dialog
        visible={changePasswordVisible}
        title={i18n.t('Change Password').toString()}
        footer={false}
        onClose={() => { setChangePasswordVisible(false); }}
        locale={locale().Dialog}
        className={styles.changePasswordDialog}
        style={{ minWidth: '480px' }}
      >
        <div className={styles.dialogContent}>
          <Form
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            size="large"
          >
            <FormItem
              label={i18n.t('Old Password').toString()}
              required
              requiredMessage={i18n.t('Old password is required').toString()}
            >
              <Input
                name="oldPassword"
                htmlType="password"
                placeholder={i18n.t('Please enter old password').toString()}
                className={styles.passwordInput}
              />
            </FormItem>
            <FormItem
              label={i18n.t('New Password').toString()}
              required
              requiredMessage={i18n.t('New password is required').toString()}
            >
              <Input
                name="newPassword"
                htmlType="password"
                placeholder={i18n.t('Please enter new password').toString()}
                className={styles.passwordInput}
              />
            </FormItem>
            <FormItem
              label={i18n.t('Confirm Password').toString()}
              required
              requiredMessage={i18n.t('Please confirm new password').toString()}
            >
              <Input
                name="confirmPassword"
                htmlType="password"
                placeholder={i18n.t('Please confirm new password').toString()}
                className={styles.passwordInput}
              />
            </FormItem>
            <FormItem label="">
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => { setChangePasswordVisible(false); }}
                  className={styles.cancelButton}
                >
                  <Translation>Cancel</Translation>
                </Button>
                <Form.Submit
                  type="primary"
                  validate
                  onClick={handleChangePassword}
                  className={styles.confirmButton}
                >
                  <Translation>Confirm</Translation>
                </Form.Submit>
              </div>
            </FormItem>
          </Form>
        </div>
      </Dialog>
    </div>
  );
};

export default MyHeader;
