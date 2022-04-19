import React, { FC } from 'react';
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
    const errorMessage = '删除失败';

    if (res && res.Data) {
      Message.success('删除成功');
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
          Message.error(`环境数量最多为 ${nameSpaceListCount} 个`);
        } else if (!isNamespaceValid) {
          Message.error('环境名称重复');
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
    const errorMessage = '新增失败';
    if (res && name === ns) {
      Message.success('新增成功');
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
        title={isdele ? '删除环境' : '添加环境'}
        footerActions={[ 'ok', 'cancel' ]}
        closeable={true}
        onOk={isdele ? handleDelNamespace : handleSubmit}
        {...props}
      >
        <div>
          <>
            {isdele ? (
              <>
                <p className={styles.containerTips}>
                  <Icon type="warning" size='large'/>
                  {'确认删除'} <span>&nbsp;{delnamespacename}&nbsp;</span> {'环境吗?'}
                </p>
              </>
            ) : (
              <>
                <Form
                  inline
                  field={myfield}
                  className={styles.containerForm}
                >
                  <FormItem label="环境名称">
                    <Input
                      maxLength={ 20 }
                      trim
                      placeholder="请输入环境名称(仅允许输入小写字母、数字)"
                      className={styles.containerInput}
                      {...init('newNameSpace', {
                        rules: [
                          {
                            required: true,
                            message: '不能为空',
                          },
                          {
                            pattern: /^[0-9a-z]*$/,
                            message: '仅支持小写字母与数字的组合',
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
                        {`环境数量最多为 ${nameSpaceListCount} 个`}
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