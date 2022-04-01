import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';
import styles from './index.css';
import { Collapse, Dialog, Message } from '@alicloud/console-components';
import { OS_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { useDispatch } from 'utils/libs/sre-utils-dva';

interface IPorps {
  pluginType?: string;
  isUninstall?: boolean;
  configurationId?: string;
  onClose: () => void;
  isInstall?: boolean; // 安装高可用探针区分
  isClusterUninstall?: boolean; // 集群探针卸载
  ostype?: number;
  status?: number; // 探针状态，来区分windows操作
}

const ManualDialog: FC<IPorps> = ({ pluginType, isUninstall, configurationId, onClose, isInstall, isClusterUninstall, ostype }) => {
  const dispatch = useDispatch();
  const [ manualCmd, setManualCmd ] = useState<any>('');
  const [ dowloadUrl, setDowloadUrl ] = useState('');

  const javaAgentDom = useMemo(() => {
    return (
      <Collapse accordion>
        <Collapse.Panel
          title={'非容器化应用服务器'}
        >
          <div>在JVM启动参数中去除以下参数并启动JVM 即可：</div>
          <pre>
            -Dproject.name=&lt;AppName&gt; -javaagent:/opt/aliyunahas/agent/ahas-java-agent.jar
          </pre>
        </Collapse.Panel>

        <Collapse.Panel title="Docker">
          <div>步骤一</div>
          <div>通过docker ps -a 找到ahas java agent容器并删除</div>
          <pre>sudo docker rm &lt;dockerID&gt;</pre>
          <div>步骤二</div>
          <div>停止并删除含有ahas java agent的应用容器，重新运行不含有下列参数的应用容器</div>
          <pre>
            --volumes-from ahas-java-agent \ --env JAVA_OPTS="-Dproject.name=&lt;AppName&gt;
            -javaagent:/var/lib/aliyunahas/agent/ahas-java-agent.jar"
          </pre>
        </Collapse.Panel>

        <Collapse.Panel title="Docker Compose">
          <div>
            还原之前备份的docker-compose.yaml文件，并重新拉起docker
          </div>
        </Collapse.Panel>

        <Collapse.Panel title="Sentinel SDK pom依赖方式">
          <div>如果使用 POM 依赖方式接入的 Sentinel SDK，直接去掉 POM 依赖：</div>
          <pre>
            &lt;dependency&gt;
            <br />
            &nbsp;&nbsp;&lt;groupId&gt;com.alibaba.csp&lt;/groupId&gt;
            <br />
            &nbsp;&nbsp;&lt;artifactId&gt;sentinel-transport-ahas-gw&lt;/artifactId&gt;
            <br />
            &nbsp;&nbsp;&lt;version&gt;${'{当前版本号}'}&lt;/version&gt;
            <br />
            &lt;/dependency&gt;
          </pre>
        </Collapse.Panel>
        <Collapse.Panel title="Sentinel SDK jar包依赖方式">
          <div>如果使用的 jar 包依赖，请直接在工程中去掉 Sentinel 相关的 jar 包即可。</div>
        </Collapse.Panel>
      </Collapse>
    );
  }, []);

  const fetchManualCmd = useCallback(async () => {
    let action: string;
    const params: any = { Mode: 'host', OsType: ostype };
    if (isUninstall) {
      action = 'QueryUninstallCommand';
    } else {
      action = 'QueryInstallCommand';
    }
    if (!isInstall) {
      params.ConfigurationId = configurationId;
    }
    if (isClusterUninstall) {
      setManualCmd('helm delete --purge ahas');
    } else {
      const { Data } = await dispatch.agentSetting.getQueryUninstallAndInstallCommand(action, params);
      // 安装接口返回数据
      Data && Data.command_install && setManualCmd(Data && Data.command_install);
      // 卸载接口返回数据
      Data && Data.command_uninstall && setManualCmd(Data && Data.command_uninstall);
      // windows安装数据
      Data && Data.command_file_download && setDowloadUrl(Data && Data.command_file_download);

    }
  }, [ pluginType, isUninstall, configurationId, isClusterUninstall ]);

  useEffect(() => {
    if (pluginType?.toUpperCase() === 'AHAS_AGENT' || isInstall) {
      fetchManualCmd();
    } else {
      setManualCmd(javaAgentDom);
    }
  }, [ fetchManualCmd ]);

  function renderContent() {
    if (ostype === OS_TYPE.WINDOWS && !isUninstall) {
      return <div>
        <div className={styles.title}>before. 如果曾安装过探针</div>
        <div className={styles.item}>1. 清除旧探针：win键+R 输入cmd，打开cmd（Windows命令行），在命令行中利用taskkill，杀掉原有的旧探针</div>
        <div className={styles.code}>taskkill /im aliyunahas.exe -f</div>
        <div className={styles.item}>2. 清除故障注入工具：进入C:\中，查看当前目录下是否有chaosblade文件夹，或以chaosblade开头的压缩包，如果有则都删除掉</div>
        <div className={styles.title}>1. 下载</div>
        <div className={styles.item}>可直接在浏览器上输入以下地址，直接进行下载，下载得到 aliyunahas.zip ，将文件复制到C:\中</div>
        <div className={styles.item}>· aliyunahas.exe下载地址： <a href={dowloadUrl} download target='_blank'>{dowloadUrl}</a></div>
        <div className={styles.title}>2. 解压</div>
        <div className={styles.item}>1. 将文件解压到C盘的C:\目录下</div>
        <div className={styles.item}>2. 将解压后C:\aliyunahas文件夹中的，C:\aliyunahas\chaosblade文件夹移至C:\目录下</div>
        <div className={styles.code}>mv C:\aliyunahas\chaosblade C:\</div>

        <div className={styles.title}>3. 启动探针</div>
        <div className={styles.item}>win键+R 输入cmd，打开cmd（Windows命令行），在命令行中启动探针</div>
        <div className={styles.code}>{manualCmd}</div>
        <div className={styles.title}>参数说明：</div>
        <div className={styles.item}>· appInstance：应用名称，自定义即可</div>
        <div className={styles.item}>· appGroup： 应用分组名称，自定义即可</div>

        <div className={styles.item}>确定探针是否启动成功，win键+R 输入cmd，打开cmd（Windows命令行），在cmd中利用 tasklist 来查看进程运行情况：</div>
        <div className={styles.code}>
          <div>C:\Users\Administrator{'>'}tasklist /FI "IMAGENAME eq aliyunahas.exe" /NH</div>
          <div className={styles.command}>
            <span>aliyunahas.exe</span>
            <span>5928 RDP-Tcp#16</span>
            <span>2&emsp;&emsp;&emsp;23,428 K</span>
          </div>
        </div>
      </div>;
    }
    if (ostype === OS_TYPE.WINDOWS && isUninstall) {
      return <div>
        <div className={styles.title} style={{ marginBottom: 8 }}>手动卸载探针探针</div>
        <div className={styles.item}>1. 清除旧探针：win键+R 输入cmd，打开cmd（Windows命令行），在命令行中利用taskkill，杀掉原有的旧探针</div>
        <div className={styles.code}>taskkill /im aliyunahas.exe -f</div>
        <div className={styles.item}>2. 清除故障注入工具：进入C:\中，查看当前目录下是否有chaosblade文件夹，或以chaosblade开头的压缩包，如果有则都删除掉</div>
      </div>;
    }
    if (isInstall || (isUninstall && !isClusterUninstall)) {
      return (
        <div style={{ position: 'relative' }}>
          <div className={styles.copyBtn}>
            <a onClick={() => onCopy(manualCmd)} >点击复制</a>
          </div>
          <div style={{ paddingTop: 20 }}>
            {manualCmd}
          </div>
        </div>
      );
    }
    const cmdLong = `blades=($(kubectl get blade | grep -v NAME | awk '{print $1}' | tr '\n' ' ')) && kubectl patch blade $blades --type merge -p '{"metadata":{"finalizers":[]}}'`; // eslint-disable-line
    return (
      <div>
        <div className={styles.item}>1. 执行以下Helm命令卸载探针</div>
        {renderCode('helm delete ahas -n ahas', true)}
        <div className={styles.item}>2. 卸载完成后，可执行一下命令查询ahas命令空间的探针pod是否已卸载完成</div>
        {renderCode('kubectl get pods -n ahas', true)}
        <div className={styles.item}>3. 如果卸载异常，在确保所有演练已终止的情况下，执行以下命令删除异常状态的演练</div>
        {renderCode(cmdLong, true)}
        <div className={styles.item}>4. 执行后可执行下面命令确认所有的chaosblade资源均被删除<a href={dowloadUrl} download target='_blank'>{dowloadUrl}</a></div>
        {renderCode('kubectl get chaosblade', true)}
      </div>
    );
  }
  const renderCode = (cmd: string, withCopy: boolean) => {
    return (
      <div className={styles.code}>
        {withCopy &&
          <div className={styles.copyBtn}>
            <a onClick={() => onCopy(cmd)} >点击复制</a>
          </div>
        }
        {cmd}
      </div>
    );
  };
  const onCopy = (cmd: string) => {
    copy(cmd);
    Message.success('复制成功');
  };

  return (
    <Dialog
      visible={true}
      title={isUninstall ? '单机手动卸载插件' : '单机手动安装插件'}
      footerActions={[ 'cancel' ]}
      style={{ minWidth: '600px' }}
      onClose={onClose}
      onCancel={onClose}
      shouldUpdatePosition
    >
      <div className={styles.content}>
        {renderContent()}
      </div>
    </Dialog>
  );
};

export default memo(ManualDialog);

