import Actions, { LinkButton } from '@alicloud/console-components-actions';
import ManualDialog from '../../common/ManualDialog';
import React, { FC, memo, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import moment from 'moment';
import styles from './index.css';
import { Balloon, Icon, Table, Tag } from '@alicloud/console-components';
import { IListKubernetesClusterResultDatas } from 'config/interfaces';
import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';

interface IProps {
  dataSource: IListKubernetesClusterResultDatas[];
  agentType: number;
  isLoading: boolean;
  statusType: string;
  style?: any;
  handleDataSource: (data: IListKubernetesClusterResultDatas[]) => void;
  handleSetStatusType: (status: string) => void;
}

const ClusterTableList: FC<IProps> = props => {
  const {
    dataSource,
    isLoading,
    agentType,
  } = props;
  const history = useHistory();

  const [ showManualDialog, setShowManualDialog ] = useState<boolean>(false);
  const [ pluginType, setPluginType ] = useState<string>('');
  // const [ selectedRowKeys, setSelectedRowKeys ] = useState<string[]>([]);

  const goTabList = (clusterId: string | number) => {
    pushUrl(history, '/manage/setting/k8sHost', { clusterId });
  };

  // 手动卸载
  const toggleManualDialog = (pluginType: string) => {
    setShowManualDialog(!showManualDialog);
    setPluginType(pluginType);
  };

  // 集群名称
  const renderClusterName: any = (value: string, index: number, record: IListKubernetesClusterResultDatas) => {
    return (
      <>
        <a className="action" onClick={() => { goTabList(record.ClusterId); }}>
          {value}
        </a>
        <br />
        <span className="text-muted">{record.ClusterId}</span>
      </>
    );
  };
  const renderVersion: any = (value: string, index: number, record: IListKubernetesClusterResultDatas) => {
    if (record.Upgrade && (agentType === 1 || agentType === 3)) {
      return <Balloon
        trigger={
          (<span>
            <Icon type="star-circle1" size='xs' className="text-warning" style={{ marginRight: '4px' }} />
            <span className="text-primary vertical-align-middle cursor-default">{record.Version}</span>
          </span>)
        }
        triggerType="hover"
      >
        <span style={{ color: 'black' }}>
          <Translation>Upgradable to version</Translation> {record.UpgradeVersion}
        </span>
      </Balloon>;
    }
    return <span>{record.Version}</span>;
  };

  const renderConnectTime: any = (value: string) => {
    return <span>{value
      ? moment(value).format('YYYY-MM-DD HH:mm:ss')
      : ''}</span>;
  };

  const renderTools: any = (value: string[]) => {
    if (value && value.length) {
      return value.map(it => {
        return <Tag key={it} style={{ marginRight: '4px' }}>{it}</Tag>;
      });
    }
    return '';
  };

  // 渲染
  const render: any = (value: string, index: number, record: IListKubernetesClusterResultDatas) => {
    return (
      <Actions>
        {(record.OnlineCount && record.OnlineCount > 0) ? <LinkButton
          text
          type='primary'
          onClick={() =>
            toggleManualDialog(record.PluginType)
          }
          style={{ cursor: 'pointer' }}
        >
          <Translation>Uninstall manually</Translation>
        </LinkButton> : ''}
        <LinkButton
          text
          type='primary'
          onClick={() => {
            pushUrl(history, 'setting/tools', { id: record.ClusterId, mode: 'k8s' });
          }}
          style={{ marginLeft: 8 }}
        >
          <Translation>Install the drill tool</Translation>
        </LinkButton>
      </Actions>
    );
  };

  return (
    <>
      <Table
        style={props.style ? props.style : { padding: '8px' }}
        dataSource={dataSource}
        loading={isLoading}
        className={styles.content}
        hasBorder={false}
        locale={locale().Table}
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: handleSelectList,
        // }}
      >
        <Table.Column
          title={i18n.t('Cluster name/ID').toString()}
          dataIndex={'ClusterName'}
          align={'center'}
          lock
          cell={renderClusterName}
        />
        <Table.Column title={i18n.t('Plugin type').toString()} width={140} dataIndex={'PluginType'} align={'center'} />
        <Table.Column
          title={i18n.t('"Number of nodes').toString()}
          width={100}
          dataIndex={'OnlineCount'}
          align={'center'}
        />
        <Table.Column
          title={i18n.t('Probe version').toString()}
          width={100}
          cell={renderVersion}
          align={'center'}
        />
        <Table.Column
          title={i18n.t('Tools installed').toString()}
          dataIndex={'chaosTools'}
          cell={renderTools}
          align={'center'}
        />
        <Table.Column title={i18n.t('Start Time').toString()} dataIndex={'ConnectTime'} cell={renderConnectTime} align={'center'} />
        <Table.Column
          title={i18n.t('Operation').toString()}
          width={200}
          lock="right"
          cell={render}
          align={'center'}
        />
      </Table>
      {showManualDialog && (
        <ManualDialog
          pluginType={pluginType}
          isUninstall={true}
          isClusterUninstall={true}
          onClose={() => setShowManualDialog(false)}
        />
      )}
    </>
  );
};

export default memo(ClusterTableList);
