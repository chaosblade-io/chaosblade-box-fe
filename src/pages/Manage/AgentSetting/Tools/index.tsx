import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
// import styles from './index.css';
import { Button, Icon, Message, Table } from '@alicloud/console-components';
import { IGetListResItem } from 'config/interfaces/Manage/AgentSetting/tools';
import { DEFAULT_BREADCRUMB_ITEM as defaultBreadCrumbItem } from 'config/constants';
import { parseQuery } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';

import { breadCrumbConf } from 'config/constants/Manage';

export default function Tools() {
  const dispatch = useDispatch();
  const parsed = parseQuery();
  const [ dataSource, setDataSource ] = useState<IGetListResItem[]>([]);
  const [ actionData, setActionData ] = useState<any>(null);
  const [ isUpdate, setIsUpdate ] = useState(false);
  const [ loadingInstall, setLoadingInstall ] = useState(false);

  const { id, mode } = parsed;

  useEffect(() => {
    dispatch.pageHeader.setTitle(i18n.t('Tool management').toString());
    dispatch.pageHeader.showBackArrow(true);
    dispatch.pageHeader.setBreadCrumbItems(
      [ defaultBreadCrumbItem ].concat([{
        ...breadCrumbConf[/\agentmanage\//.test(location.pathname) ? 'ahaos' : 'manage'],
      }, {
        key: 'setting/tools',
        value: i18n.t('Tool management').toString(),
        path: location.pathname,
      }]),
    );
  }, []);

  useEffect(() => {
    (async function() {
      await dispatch.agentTools.getChaosToolsList({
        installMode: mode,
        operateId: parsed.id,
      }, (res: IGetListResItem[]) => {
        res && setDataSource(res);
      });
    })();
  }, [ isUpdate ]);

  async function handleUninstall(record: IGetListResItem) {
    record && await dispatch.agentTools.uninstallChaosTools({
      operateId: id,
      installMode: mode,
      name: record && record.name,
      version: record && record.latest,
    }, (res: boolean) => {
      res && Message.success(i18n.t('Successful operation'));
      res && setIsUpdate(!isUpdate);
    });
  }

  async function handleSubmit() {
    setLoadingInstall(true);
    actionData && dispatch.agentTools.installChaosTools({
      operateId: id,
      installMode: mode,
      toolsNamespace: 'chaosblade',
      name: actionData && actionData.name,
      version: actionData && actionData.latest,
    }, (res: boolean) => {
      if (res) {
        Message.success(i18n.t('Successful operation'));
        setIsUpdate(!isUpdate);
      }
      setLoadingInstall(false);
    });
  }

  const renderAction: any = (value: string, index: number, record: IGetListResItem) => {
    const { installed, unInstalled } = record;
    record && setActionData(record);
    if (installed) {
      if (unInstalled) {
        return <Button text type='primary' onClick={() => handleUninstall(record)}>
          <Translation>Uninstall</Translation>
        </Button>;
      }
      return <span>
        <Translation>Installed</Translation>
        <Icon type={'success'} size='small' /> </span>;
    }
    if (!installed) return <Button text type='primary' loading={loadingInstall} onClick={() => handleSubmit()}><Translation>Install</Translation></Button>;
  };

  return (
    <div>
      <Table hasBorder={false} dataSource={dataSource} locale={locale().Table}>
        <Table.Column title={i18n.t('Tool name').toString()} dataIndex='name' />
        <Table.Column title={i18n.t('Latest version').toString()} dataIndex='latest' />
        <Table.Column title={i18n.t('Description').toString()} dataIndex='description' width='60%' />
        {/* <Table.Column title='相关地址' dataIndex='webSite' width='20%'/> */}
        <Table.Column title={i18n.t('Operation').toString()} cell={renderAction} />
      </Table>
      {/* <Dialog
        visible={visible}
        onCancel={() => setVisible(false)}
        onClose={() => setVisible(false)}
        className={styles.dialogContent}
        onOk={handleSubmit}
      >
        <div>
          <div className={styles.item}>
            <div className={styles.label}>命名空间：</div>
            <Input onChange={value => { setNameSpace(value); }} className={styles.value} value={nameSpace}></Input>
          </div>
        </div>
      </Dialog> */}
    </div>
  );
}
