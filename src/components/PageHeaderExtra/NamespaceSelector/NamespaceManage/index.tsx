import React, { FC } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Balloon, Dialog, Field, Form, Icon, Input, Message } from '@alicloud/console-components';
import { DialogProps } from '@alicloud/console-components/types/dialog';
import { INsListData } from 'config/interfaces';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const FormItem = Form.Item;

interface ExpandedNamespaceProps extends DialogProps {
  isdele: number;
  delnamespace: string;
  delnamespacename: string;
  datanslist: INsListData[];
  onChange?: () => void;
  onCancel?: () => void;
  onAddChange?: (name: string) => void;
}

const NamespaceManage: FC<ExpandedNamespaceProps> = props => {
  const dispatch = useDispatch();
  const myfield = Field.useField();
  const { init } = myfield;
  const { isdele, delnamespace, delnamespacename, datanslist } = props;
  const nameSpaceListCount = Number(50) || 20;

  async function handleDelNamespace() {
    const res = await dispatch.homeModel.DeleteNamespace({ NamespaceId: delnamespace });
    const errorMessage = i18n.t('Failed to delete');

    if (res) {
      Message.success(i18n.t('Successfully deleted'));
      props.onCancel && props.onCancel();
      props.onChange && props.onChange();
    } else {
      Message.error(errorMessage);
    }
  }

  // 新增环境校验
  async function handleSubmit() {
    myfield.validate((errors: object[], values: any) => {
      if (!errors) {
        const { newNameSpace } = values;
        const isNamespaceValid = datanslist.every((item: INsListData) => item.name !== newNameSpace);
        if (datanslist && datanslist.length > nameSpaceListCount) {
          Message.error(`${i18n.t('The maximum number of environments is')} ${nameSpaceListCount} ${i18n.t('Number')}`);
        } else if (!isNamespaceValid) {
          Message.error(i18n.t('Environment name is duplicated'));
        } else {
          handleAddNamespace(newNameSpace);
        }
      }
    });
  }

  // 发起新增请求
  async function handleAddNamespace(ns: string) {
    const res = await dispatch.homeModel.CreateNamespace({ Name: ns });
    const { name } = res?.Data || {};
    const errorMessage = i18n.t('Add failed');
    if (res && name === ns) {
      Message.success(i18n.t('Added successfully'));
      props.onCancel && props.onCancel();
      props.onChange && props.onChange();
      props.onAddChange && props.onAddChange(ns);
    } else {
      Message.error(errorMessage);
    }
  }

  return (
    <>
      <Dialog
        style={{
          minWidth: '400px',
        }}
        title={isdele ? i18n.t('Delete environment').toString() : i18n.t('Add environment').toString()}
        footerActions={[ 'ok', 'cancel' ]}
        closeable={true}
        onOk={isdele ? handleDelNamespace : handleSubmit}
        {...props}
        locale={locale().Dialog}
      >
        <div>
          <>
            {isdele ? (
              <>
                <p className={styles.containerTips}>
                  <Icon type="warning" size='large'/>
                  <Translation>Confirm deletion</Translation> <span>&nbsp;{delnamespacename}&nbsp;</span> <Translation>Environment</Translation>?
                </p>
              </>
            ) : (
              <>
                <Form
                  inline
                  field={myfield}
                  className={styles.containerForm}
                >
                  <FormItem label={i18n.t('Environment name').toString()}>
                    <Input
                      maxLength={ 20 }
                      trim
                      placeholder={i18n.t('Please enter an environment name (only lowercase letters and numbers are allowed)').toString()}
                      className={styles.containerInput}
                      {...init('newNameSpace', {
                        rules: [
                          {
                            required: true,
                            message: i18n.t('Can not be empty'),
                          },
                          {
                            pattern: /^[0-9a-z]*$/,
                            message: i18n.t('Only lowercase letters and numbers are supported'),
                          },
                        ],
                        getValueFormatter: value => {
                          return value.replace(/[A-Z]*/g, (v: string) => {
                            return v.toLowerCase();
                          });
                        },
                      })}
                    />
                    <Balloon
                      trigger={
                        <Icon
                          type="prompt"
                          className={styles.containerIcon}
                          size='small'
                        />
                      }
                      triggerType="hover"
                    >
                      <span style={{ color: 'black' }}>
                        {`${i18n.t('The maximum number of environments is')} ${nameSpaceListCount} ${i18n.t('Number')}`}
                      </span>
                    </Balloon>
                  </FormItem>
                </Form>
              </>
            )}
          </>
        </div>
      </Dialog>
    </>
  );
};

export default NamespaceManage;
