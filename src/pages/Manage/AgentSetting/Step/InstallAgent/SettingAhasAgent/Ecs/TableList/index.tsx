import Actions, { LinkButton } from '@alicloud/console-components-actions';
import InstallDialog from './InstallDialog';
import ManualDialog from 'pages/Manage/AgentSetting/common/ManualDialog';
import React, { FC, memo, useRef, useState } from 'react';
import classnames from 'classnames';
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
        content: '请先选择机器，再进行安装',
        duration: 4000,
      });
      return;
    }
    handleInstallDialog(recordsRef.current);
  };

  function renderOsType(value: number) {
    if (value === OS_TYPE.LINUX) return 'linux';
    if (value === OS_TYPE.WINDOWS) return 'windows';
  }

  // 渲染
  const render = (value: string, index: number, record:IQueryPluginStatusResult) => {
    let label;

    if (record.networkType === 'classic') {
      return <span>暂不支持</span>;
    }

    switch (record.pluginStatus) {
      case 0:
        label = (
          <>
            {record.osType !== OS_TYPE.WINDOWS && <LinkButton
              onClick={() => handleInstallDialog([ record ])}>
                单击安装
            </LinkButton>}
            <LinkButton onClick={() => handleManualDialog(record)}>
                手动安装
            </LinkButton>
          </>
        );
        break;
      case 1:
        label = (
          <span>
            <span className={styles.mr10}>
              安装中
            </span>
            <Icon type={'loading'} size='small' />
          </span>
        );
        break;
      case 2:
        label = (
          <span>
            <span className={classnames({ [styles.v_a_b]: true, [styles.mr10]: true })} style={{ color: 'green' }}>
            安装成功
            </span>
            <Icon type={'success'} size='small' />
          </span>
        );
        break;
      case 3:
        label = (
          <>
            {record.osType !== OS_TYPE.WINDOWS && <LinkButton onClick={() => handleInstallDialog([ record ])} >
              单击安装
            </LinkButton>}
            <LinkButton onClick={() => handleManualDialog(record)}>
              手动安装
            </LinkButton>
          </>
        );
        break;
      case -1:
        label = (
          <>
            <span>
              <span className={v_a_b_r_r}>
              安装失败
              </span>
              <Icon type={'error'} size='small' />
            </span>
            <LinkButton onClick={() => handleInstallDialog([ record ])}>
              重试
            </LinkButton>
            <LinkButton
              onClick={() => handleManualDialog(record)}
            >
              手动安装
            </LinkButton>
          </>
        );
        break;
      case 999:
        label = (
          <>
            <span>
              <span className={v_a_b_r_r}>
              安装超时
              </span>
              <Icon type={'error'} size='small' />
            </span>
            <LinkButton
              onClick={() => handleInstallDialog([ record ])}
            >
              重试
            </LinkButton>
            <LinkButton
              onClick={() => handleManualDialog(record)}
            >
              手动安装
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
      >
        <Table.Column
          title={'实例name/主机名'}
          dataIndex={'instanceName'}
          align={'center'}
        />
        <Table.Column
          title={'插件类型'}
          dataIndex={'pluginType'}
          align={'center'}
        />
        <Table.Column
          title={'操作系统'}
          dataIndex={'osType'}
          align={'center'}
          cell={renderOsType}
        />
        <Table.Column title={'IP'} dataIndex={'ip'} align={'center'} />
        <Table.Column
          title={'插件状态'}
          dataIndex={'pluginStatusShow'}
          align={'center'}
        />
        <Table.Column
          title={'操作'}
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
          批量安装
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
