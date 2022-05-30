import ActivityParameterEditor from 'pages/Chaos/Experiment/common/ActivityParameter/ActivityParameterEditor';
import React, { useRef, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import classnames from 'classnames';
import formatDate from 'pages/Chaos/lib/DateUtil';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Balloon, Button, Dialog, Icon, Input, Loading, Tab, Tag } from '@alicloud/console-components';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IActivity, IActivityTask, IApp } from 'config/interfaces/Chaos/experimentTask';
import { getPlugin } from '../plugins/getPlugin';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';

const { Group: TagGroup } = Tag;
const sucessSty = { border: '1px solid #1E8E3E', background: 'rgba(30,142,62,0.10)' };
const failSty = { border: '1px solid #D93026', background: 'rgba(217,48,38,0.10)' };
const waitSty = { border: '1px solid #F69C00', background: 'rgba(246,156,0,0.10)' };
const rejectSty = { border: '1px solid #cccccc', background: '#cccccc75' };

interface TaskInfoProps{
  data: IActivityTask;
  activity: IActivity;
  // logs: ILog[];
  chartMetric: any[];
  paramer: any;
  activitiing: any;
  currentActivity: any
  clearCurrentActivity: () => void;
}

export default function TaskInfo(props: TaskInfoProps): any {
  const dispatch = useDispatch();
  const [ executeVisible, setExecuteVisible ] = useState(false);
  const [ executeTab, setExcuteTab ] = useState<string | number>('run'); // run 执行记录 pour: 故障注入日志
  const [ dialogTitle, setDialogTitle ] = useState<any>('');
  const [ ipInfo, setIpInfo ] = useState<any>({});
  const [ parameterVisible, setParameterVisible ] = useState(false);
  const [ logVisible, setLogVisible ] = useState(false);

  const [ loadingResult, setLoadingResult ] = useState(false);
  const [ resultInfo, setResultInfo ] = useState<any>(null); // 调试信息

  const [ hostDetail, setHostDetail ] = useState<any>(null);

  const currHost: any = useRef(null);

  // const [ currHost, setCurrHost ] = useState<IApp|null>(null);

  const chaosContext = useSelector(({ loginUser }) => loginUser);

  const [ searchIps, setSearchIps ] = useState<string>('');

  function balloonSty(result: string) {
    if (result === 'SUCCESS') {
      return sucessSty;
    } else if (result === 'FAILED') {
      return failSty;
    } else if (result === 'REJECTED') {
      return rejectSty;
    }
    return waitSty;
  }

  const onRefresh = () => {
    const current: any = currHost.current;
    if (!current) return;
    getHostResultDetail(current.taskId);
  };

  function colorTagType(result: string) {
    if (result === 'SUCCESS') {
      // return 'pale-green';
      return 'green';
    } else if (result === 'FAILED') {
      // return 'misty-rose';
      return 'red';
    } else if (result === 'REJECTED') {
      return '#cccccc';
    }
    // return 'light-goldenrod-yellow';
    return 'yellow';
  }
  function handleShowExecuteInfo(item: IApp) {
    setExecuteVisible(true);
    setExcuteTab('run');
    const title: any = <Tab className={styles.logTabs} triggerType="click" onChange={value => setExcuteTab(value)} extra={<Button type="primary" onClick={() => onRefresh()} style={{ margin: '-12px 32px 0 0', fontSize: '14px' }} text><Icon type="refresh"/> 刷新</Button>}>
      <Tab.Item key='run' title={i18n.t('Machine execution information').toString()}></Tab.Item>
    </Tab>;
    setDialogTitle(title);
    setIpInfo(item);
  }

  function onClose() {
    if (parameterVisible) {
      const { clearCurrentActivity } = props;
      setParameterVisible(false);
      clearCurrentActivity && clearCurrentActivity();
    }
    setExecuteVisible(false);
    setLogVisible(false);
  }

  function formatData(data: any) {
    try {
      const res = JSON.stringify(JSON.parse(data), null, 2);
      return res;
    } catch (e) {
      console.log(e);
    }
    return data;
  }

  // function getLevelClass(content: string) {
  //   if (!_.isEmpty(content)) {
  //     if (content.includes('DEBUG')) {
  //       return styles.debug;
  //     } else if (content.includes('INFO')) {
  //       return styles.info;
  //     } else if (content.includes('WARN')) {
  //       return styles.warn;
  //     } else if (content.includes('ERROR')) {
  //       return styles.error;
  //     }
  //   }
  //   return styles.debug;
  // }
  function renderInfoDetail() {
    const { paramer, data, currentActivity } = props;
    const paramerList = !_.isEmpty(currentActivity) ? paramer : data;
    // if (logVisible) {
    //   return (
    //     <div className={styles.logShowContent}>
    //       { logs ? logs.map(log => {
    //         const { content } = log;
    //         const _index = content.indexOf(']') + 2;
    //         return <div className={classnames(styles.logShow, getLevelClass(log.content))}><strong> {content.substring(0, _index)}</strong>{content.substring(_index)}</div>;
    //       }) : <Loading className={styles.loadingStyle}></Loading>}
    //     </div>
    //   );
    // }
    if (parameterVisible && !_.isEmpty(paramerList)) {
      return (
        !_.isEmpty(paramerList && paramerList.arguments) && paramerList.arguments.map((arg: any) => {
          return (
            <ActivityParameterEditor
              key={arg.parameterId}
              parameter={arg}
              disabled={true}
              width={800}
              isSwitch={false}
            />
          );
        })
      );
    }
    if (executeVisible && !_.isEmpty(ipInfo)) {
      return renderExecute();
    }
  }
  const renderDebugInfo = () => {
    const { extraInfo } = resultInfo || {};
    const { origin_request, origin_response } = extraInfo || {};
    const empty = <pre className={styles.infoContent}>无</pre>;
    if (!origin_request && !origin_response) {
      return (
        <>
          <div className={styles.infoTitle}><Translation>Debug info</Translation></div>
          {empty}
        </>
      );
    }
    return (
      <div>
        <div className={styles.infoTitle}><Translation>Debug info</Translation></div>
        <div style={{ marginLeft: '16px', marginTop: '8px' }}>
          <strong><Translation>Request data</Translation>: </strong>
          {origin_request && <pre className={styles.infoContent} dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON.parse(origin_request), null, 4) }}></pre> || empty}
          <strong><Translation>Response data</Translation>: </strong>
          {origin_response && <pre className={styles.infoContent} dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON.parse(origin_response), null, 4) }}></pre> || empty}
        </div>
      </div>
    );
  };
  const renderExecute = () => {
    if (executeTab === 'run') {
      const info = resultInfo || {};
      const startTime = _.get(info, 'startTime', '');
      const endTime = _.get(info, 'endTime', '');
      const solution = _.get(info, 'solution', '');
      return (
        <Loading visible={loadingResult} style={{ display: 'block' }}>
          <div className={styles.infoContainer}>
            { hostDetail &&
              <>
                <div className={styles.infoTitle}><Translation>Basic Information</Translation></div>
                <div className={styles.detailInfo}>
                  <div><span><Translation>Machine name</Translation>: </span>
                    {hostDetail.deviceName}
                  </div>
                  <div><span><Translation>IP address</Translation>: </span>
                    {hostDetail.deviceType === 0 &&
                      <a target="_blank" href={ `${location.origin}/chaos/experiment/scope/detail?id=${hostDetail.deviceConfigurationId}`}>{hostDetail.ip} <Icon type="external-link" size="xs" /></a> || hostDetail.ip
                    }
                  </div>
                  <div><span><Translation>Container name</Translation>: </span>
                    {hostDetail.ip}
                  </div>
                  <div><span><Translation>Machine type</Translation>: </span>{hostDetail.type}</div>
                  {hostDetail.clusterName && <div><span><Translation>Cluster</Translation>: </span>{hostDetail.clusterName}</div>}
                  {hostDetail.kubNamespace && <div><span>namepace: </span>{hostDetail.kubNamespace}</div>}
                  <div><span><Translation>Start time</Translation>: </span>{formatDate(startTime)}</div>
                  {endTime && <div><span><Translation>End Time</Translation>: </span>{formatDate(endTime)}</div>}
                </div>
              </>
            }
            {/* {info.hostIp && <div className={styles.infoTitle}>{`【${info.hostIp}】${info.deviceName}`}</div>} */}
            {/* <div className={styles.infoContent}>
            </div> */}
            {info.data && !_.isNil(info.data) &&
              <>
                <div className={styles.infoTitle}><Translation>Information</Translation></div>
                <div className={styles.infoContent}><pre>{formatData(info.data)}</pre></div>
              </>
            }
            {info.errorMessage &&
              <>
                <div className={styles.infoTitle}><Translation>Mistake</Translation></div>
                <div className={styles.infoContent}><Translation>Reason</Translation>: {info.errorMessage}</div>
              </>
            }
            {solution &&
              <>
                <div className={styles.infoTitle}><Translation>Check</Translation></div>
                <pre className={styles.infoContent} dangerouslySetInnerHTML={{ __html: solution }}></pre>
              </>
            }
            {chaosContext?.isAdmin && renderDebugInfo()}
          </div>
        </Loading>
      );
    }
  };

  // 获取调试信息
  const getHostResultDetail = async (miniAppTaskId: any) => {
    setLoadingResult(true);
    const res = await dispatch.experimentTask.QueryMiniAppTask({ miniAppTaskId });
    setLoadingResult(false);
    if (res) {
      setResultInfo(res);
    }
  };
  const getHostDetail = async (appConfigurationId: string) => {
    const res = await dispatch.experimentTask.QueryMiniAppTaskInfo({ appConfigurationId });
    if (res) {
      setHostDetail(res);
    }
  };
  const clickHostItem = (item: IApp) => {
    getHostResultDetail(item.taskId);
    getHostDetail(item.appConfigurationId);
    handleShowExecuteInfo(item);
    currHost.current = item;
  };
  const renderHostItem = (item: IApp, index: number, type: number) => {
    return (
      <Balloon
        key={index}
        trigger={
          type === 1 ? <Tag key={index} color={colorTagType(item.result)} style={{ marginRight: 8, marginBottom: 8, cursor: 'pointer' } } onClick={() => clickHostItem(item)} size='small'>{item.hostIp}</Tag> :
            <div className={styles.content} style={balloonSty(item.result)} onClick={() => clickHostItem(item)}></div>
        }
        closable={false}
        align='t'
      >
        {item.hostIp}
      </Balloon>
    );
  };
  function renderManyMachines(apps: IApp[]) {
    const showAppLs = apps.filter(item => {
      const { deviceName, hostIp } = item;
      return !searchIps || (deviceName + ' ' + hostIp).indexOf(searchIps) !== -1;
    });
    const type = showAppLs.length > 12 ? 0 : 1;
    return (
      <div className={styles.ipsContent}>
        {apps.length > 12 &&
          <Input hasClear placeholder={i18n.t('Fuzzy search...').toString()} className={styles.ipsSearch} onChange={value => setSearchIps(_.trim(value))}/>
        }
        <div className={styles.ips}>
          {showAppLs.map((item: IApp, idx: number) => {
            return renderHostItem(item, idx, type);
          })}
        </div>
      </div>
    );
  }

  function renderMachineInfo() {
    const { data } = props;
    const apps = data && data.apps;
    const number = _.groupBy(apps, 'result');
    const successNum = number.SUCCESS && number.SUCCESS.length;
    const failNum = number.FAILED && number.FAILED.length;
    const readyNum = number.READY && number.READY.length;
    const rejectNum = number.REJECTED && number.REJECTED.length;
    const userCheckState = data && data.userCheckState;
    return <div className={styles.machine}>
      <TagGroup>
        <Tag type="normal" size="small"><Translation>Success</Translation>: <span className={styles.success}>{successNum || 0}</span></Tag>
        <Tag type="normal" size="small"><Translation>Fail</Translation>: <span className={styles.faile}>{failNum || 0}</span></Tag>
        <Tag type="normal" size="small"><Translation>Skip execution</Translation>: <span style={{ color: 'grey' }}>{rejectNum || 0}</span></Tag>
        <Tag type="normal" size="small"><Translation>Wait to run</Translation>: {readyNum || 0}</Tag>
      </TagGroup>
      <div className={styles.machineDetail}>
        <div className={styles.detailTop}>
          <div className={styles.iconAndWord}>
            <Icon type="cloud-machine" className={styles.titleIcon}/>
            <div className={styles.title}><Translation>Machine</Translation>（<span>{apps && apps.length}</span>）</div>
          </div>
          <div className={styles.iconAndWord}>
            <Icon type="help" className={styles.tipsIcon}/>
            <div className={styles.tips}><Translation>Click on the machine to view details
            </Translation></div>
          </div>
        </div>
        {apps && renderManyMachines(apps)}
      </div>
      <div className={styles.userCheckState}>
        <div className={styles.checkStateLabel}><Translation>User confirmation result</Translation></div>
        {userCheckState === ExperimentConstants.EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_PASSED &&
          <div className={styles.checkPass}><Translation>Continue implement</Translation></div>}
        {
          userCheckState === ExperimentConstants.EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_FAILED && <div className={styles.checkFailed}><Translation>Terminate the drill</Translation></div>
        }
        { (!userCheckState || userCheckState === ExperimentConstants.EXPERIMENT_ACTIVITY_TASK_USER_CHECK_STATE_WAITING) && <div>-</div>}
      </div>
    </div>;
  }

  function handleShowParameter() {
    const { data, currentActivity, paramer } = props;
    const paramerList = !_.isEmpty(currentActivity) ? paramer : data;
    const argumentsParams = _.get(paramerList, 'arguments', []);
    if (!_.isEmpty(argumentsParams)) {
      const miniAppName = _.get(paramerList, 'miniAppName', '');
      setParameterVisible(true);
      setDialogTitle(`${miniAppName}${i18n.t('Node execution parameters').toString()}`);
    } else {
      return;
    }
  }

  // function handleShowLog() {
  //   const { data, getLogs } = props;
  //   const miniAppName = _.get(data, 'miniAppName', '');
  //   getLogs && getLogs();
  //   setLogVisible(true);
  //   setDialogTitle(`${miniAppName}节点执行日志`);
  // }

  const { data, activity, chartMetric, currentActivity, paramer } = props;
  const activityTaskId = _.get(activity, 'activityTaskId', '');
  const miniAppCode = _.get(activity, 'miniAppCode', '');
  const Plugin = getPlugin(miniAppCode, { code: miniAppCode, data: chartMetric, id: activityTaskId });
  const paramerList = !_.isEmpty(currentActivity) ? paramer : data;
  const argumentsParams = _.get(paramerList, 'arguments', []);
  let noParamsStyle;
  if (!argumentsParams.length) {
    noParamsStyle = styles.noParamsStyle;
  }

  return <div className={styles.infoContent}>
    <Tab shape="capsule" size="small" defaultActiveKey={1}>
      <Tab.Item title={i18n.t('Machine information').toString()} key={1}>
        {!_.isEmpty(data) && renderMachineInfo()}
      </Tab.Item>
      {React.isValidElement(Plugin) && !_.isEmpty(data) ? <Tab.Item title={i18n.t('Execution dynamics').toString()} key={2}>
        <div>
          {Plugin}
        </div>
      </Tab.Item> : null }
    </Tab>
    <div className={styles.actionCon}>
      {!_.isEmpty(data) && <span className={classnames(styles.action, noParamsStyle)} onClick={handleShowParameter} title={!argumentsParams.length ? i18n.t('This node has no parameter configuration').toString() : ''}><Translation>Parameter</Translation></span>}
      {/* {!_.isEmpty(data) && <span className={styles.actionLine}>|</span>} */}
      {/* <span className={styles.action} onClick={handleShowLog}>日志</span> */}
    </div>
    <Dialog
      title={dialogTitle}
      className={styles.infoDialog}
      style={{ width: '90%' }}
      visible={parameterVisible || logVisible || executeVisible}
      footer={false}
      onOk={onClose}
      onClose={onClose}
      locale={locale().Dialog}
    >
      {renderInfoDetail()}
    </Dialog>
  </div>;
}
