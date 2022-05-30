import Actions, { LinkButton } from '@alicloud/console-components-actions';
import InstallDialog from './InstallDialog';
import ManualDialog from 'pages/Manage/AgentSetting/common/ManualDialog';
import React, { FC, memo, useRef, useState } from 'react';
import Translation from 'components/Translation';
import classnames from 'classnames';
import i18n from '../../../../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Button, Icon, Message, Pagination, Table } from '@alicloud/console-components';
import { IQueryPluginStatusResult } from 'config/interfaces';
import { OS_TYPE } from 'pages/Chaos/lib/FlowConstants';

interface IPorps {
  totalCount: number;
  pageSize: number;
  isLoading: boolean;
  dataSource: IQueryPluginStatusResult[];
  handleOnPageSizeChange: (pageSize: number) => void;
  handlePaginationChange: (pageIndex: number) => void;
  fetchAdd: (dataSource: IQueryPluginStatusResult[], ids: string[], name: string, group: string) => void;
}

const v_a_b_r_r = classnames({ [styles.v_a_b]: true, [styles.mr10]: true, [styles.red]: true });

const TableList: FC<IPorps> = props => {
  const {
    totalCount,
    pageSize,
    isLoading,
    dataSource,
    handleOnPageSizeChange,
    handlePaginationChange,
    fetchAdd,
  } = props;

  const [ records, setRecords ] = useState<IQueryPluginStatusResult[]>([]);
  const [ showInstallDialog, setShowInstallDialog ] = useState<boolean>(false);
  const [ showManualDialog, setShowManualDialog ] = useState<boolean>(false);
  const [ ostype, setosType ] = useState(NaN);
  const recordsRef = useRef<any[]>([]);

  // 自动安装
  const handleInstallDialog = (records: IQueryPluginStatusResult[]) => {
    setRecords(records);
    setShowInstallDialog(true);
  };

  // 手动安装
  const handleManualDialog = (record: IQueryPluginStatusResult) => {
    setShowManualDialog(!showManualDialog);
    setosType(record && record.osType!);
  };

  // 表格筛选
  const onChange = (selectedRowKeys: any[], records: any[]) => {
    recordsRef.current = records.filter(item => item.pluginStatus !== 2);
  };

  // 表格筛选
  const getProps = (record: IQueryPluginStatusResult) => {
    return { disabled: !record.canAutoInstall };
  };

  // 批量安装
  const handleInstallGroup = () => {
    if (!recordsRef.current.length) {
      Message.warning({
        content: i18n.t('Please select a machine before installing').toString(),
        duration: 4000,
      });
      return;
    }
    handleInstallDialog(recordsRef.current);
  };

  const renderOsType: any = (value: number) => {
    if (value === OS_TYPE.LINUX) return 'linux';
  };

  // 渲染
  const render: any = (value: string, index: number, record:IQueryPluginStatusResult) => {
    let label;
    if (record.networkType === 'classic') {
      return <span><Translation>Not currently supported</Translation></span>;
    }

    switch (record.pluginStatus) {
      case 0:
        label = (
          <>
            <LinkButton
              onClick={() => handleInstallDialog([ record ])}>
              <Translation>Click install</Translation>
            </LinkButton>
            <LinkButton onClick={() => handleManualDialog(record)}>
              <Translation>Manual installation</Translation>
            </LinkButton>
          </>
        );
        break;
      case 1:
        label = (
          <span>
            <span className={styles.mr10}>
              <Translation>Installing</Translation>
            </span>
            <Icon type={'loading'} size='small' />
          </span>
        );
        break;
      case 2:
        label = (
          <span>
            <span className={classnames({ [styles.v_a_b]: true, [styles.mr10]: true })} style={{ color: 'green' }}>
              <Translation>Successful installation</Translation>
            </span>
            <Icon type={'success'} size='small' />
          </span>
        );
        break;
      case 3:
        label = (
          <>
            {<LinkButton onClick={() => handleInstallDialog([ record ])} >
              <Translation>Click install</Translation>
            </LinkButton>}
            <LinkButton onClick={() => handleManualDialog(record)}>
              <Translation>Manual installation</Translation>
            </LinkButton>
          </>
        );
        break;
      case -1:
        label = (
          <>
            <span>
              <span className={v_a_b_r_r}>
                <Translation>Installation failed</Translation>
              </span>
              <Icon type={'error'} size='small' />
            </span>
            <LinkButton onClick={() => handleInstallDialog([ record ])}>
              <Translation>Retry</Translation>
            </LinkButton>
            <LinkButton
              onClick={() => handleManualDialog(record)}
            >
              <Translation>Manual installation</Translation>
            </LinkButton>
          </>
        );
        break;
      case 999:
        label = (
          <>
            <span>
              <span className={v_a_b_r_r}>
                <Translation>Installation timed out</Translation>
              </span>
              <Icon type={'error'} size='small' />
            </span>
            <LinkButton
              onClick={() => handleInstallDialog([ record ])}
            >
              <Translation>Retry</Translation>
            </LinkButton>
            <LinkButton
              onClick={() => handleManualDialog(record)}
            >
              <Translation>Manual installation</Translation>
            </LinkButton>
          </>
        );
        break;
      default:
        break;
    }

    return (
      <Actions style={{ justifyContent: 'center' }}>
        { label }
      </Actions>
    );
  };

  return (
    <>
      <Table
        className={styles.content}
        dataSource={dataSource}
        loading={isLoading}
        primaryKey={'instanceId'}
        rowSelection={{ onChange, getProps }}
        hasBorder={false}
        locale={locale().Table}
      >
        <Table.Column
          title={i18n.t('Instance name/hostname').toString()}
          dataIndex={'instanceName'}
          align={'center'}
        />
        <Table.Column
          title={i18n.t('Plugin type').toString()}
          dataIndex={'pluginType'}
          align={'center'}
        />
        <Table.Column
          title={i18n.t('Operating system').toString()}
          dataIndex={'osType'}
          align={'center'}
          cell={renderOsType}
        />
        <Table.Column title={'IP'} dataIndex={'ip'} align={'center'} />
        <Table.Column
          title={i18n.t('Plugin status').toString()}
          dataIndex={'pluginStatusShow'}
          align={'center'}
        />
        <Table.Column
          title={i18n.t('Operation').toString()}
          cell={render}
          align={'center'}
        />
      </Table>
      <div className={styles.footer}>
        <Button
          size={'small'}
          style={{ marginLeft: '45px' }}
          onClick={handleInstallGroup}
        >
          <Translation>Bulk install</Translation>
        </Button>
        <Pagination
          total={totalCount}
          defaultCurrent={1}
          onChange={handlePaginationChange}
          className={styles.pagination}
          pageSize={pageSize}
          onPageSizeChange={handleOnPageSizeChange}
          pageSizeSelector='dropdown'
          pageSizeList={[ 10, 20, 50, 100 ]}
          locale={locale().Pagination}
        />
      </div>
      {showInstallDialog && (
        <InstallDialog
          dataSource={dataSource}
          records={records}
          onClose={() => setShowInstallDialog(false)}
          fetchAdd={fetchAdd}
        />
      )}
      {showManualDialog && (
        <ManualDialog
          isInstall={true}
          onClose={() => setShowManualDialog(false)}
          ostype={ostype}
        />
      )}
    </>
  );
};

export default memo(TableList);
