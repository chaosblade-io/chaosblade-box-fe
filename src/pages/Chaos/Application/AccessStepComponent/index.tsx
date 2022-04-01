import React from 'react';
import _ from 'lodash';
import copy from 'copy-to-clipboard';
import styles from './index.css';
import { Icon, Message, Step } from '@alicloud/console-components';
import { parseQuery, pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';


interface IPorps {
  way: string;
  language: string;
}


function AccessStepComponent(props: IPorps) {
  const { way, language } = props;
  const history = useHistory();

  function handleCpoy() {
    const code = (document as any).getElementById('code').innerText;
    if (copy(code)) {
      Message.success('复制成功');
    } else {
      Message.error('复制失败');
    }
  }

  function renderCodeCopy(code: string[]) {
    return <div className={styles.codeContent}>
      <span id='code'>
        {code.map(c => (
          <div className={styles.codeLine}>{c}</div>
        ))}
      </span>
      <div className={styles.copy} onClick={handleCpoy}>
        <Icon type="copy" className={styles.copyIcon} />
      </div>
    </div>;
  }

  function renderJVM() {
    return <div>
      <p>AppName 只能包含字母、数字和特殊字符 _-。</p>
      {renderCodeCopy([ '-Dproject.name=应用名 -Dproject.group.name=应用分组名' ])}
      <div className={styles.jvmParam}>请根据实际情况替换以上的值，上述配置默认值如下：</div>
      <ul className={styles.ulList}>
        <li>project.name: 默认值 ahas-default-app</li>
        <li>project.group.name: 默认值 ahas-default-app-group</li>
      </ul>
      <Message title='' type="warning" className={styles.jvmWaring}>
        注意：在已部署故障演练探针的机器上，修改 JVM 启动参数并重启，应用会自动识别并生效，无需重新部署故障演练探针。
      </Message>
    </div>;
  }

  function renderPod() {
    return <div>
      <p>标签的值只能包含字母、数字和特殊字符_-。</p>
      <div className={styles.podWord}>在模板（YAML 格式）中将以下 lables 配置添加到 spec {'>'} template {'>'} labels 层级下：</div>
      {renderCodeCopy([ 'labels:', 'ahas.aliyun/app-instance: 应用名', 'ahas.aliyun/app-group: 应用分组名' ])}
      <div className={styles.podWord}>根据实际情况替换以上的值，如果不配置以上的值，会再次识别是否包含<span className={styles.tag}>app-group-name(容器服务应用配置)</span>、<span className={styles.tag}>edas.oam.acname(EDAS应用配置)</span>、<span className={styles.tag}>app</span>、<span className={styles.tag}>k8s-app</span>标签配置作为应用名，应用分组名格式默认为：<span className={styles.nameStyle}>应用名-group</span>。</div>
      <div className={styles.podWord} style={{ margin: '14px 0' }}>根据标签识别应用，标签优先级如下：ahas.aliyun/app-instance {'>'} app-group-name {'>'} edas.oam.acname {'>'} app {'>'} k8s-app。</div>
      <div className={styles.podWord}><span className={styles.nameStyle}>注意：</span>kubernetes模式下不再支持默认的应用归属，请按照上面提示配置标签。</div>
    </div>;
  }

  function renderImge(href: string, height: number) {
    return <div className={styles.imageContent}>
      <img src={href} style={{ height }} />
    </div>;
  }

  const renderStepFour = () => {
    return <div>
      <div className={styles.altWord}>已有应用，则选择应用名称与应用分组，点击「安装」即可。</div>
      <div className={styles.imageContent} style={{ marginBottom: 20 }}>
        <img style={{ height: 344 }} src='https://img.alicdn.com/tfs/TB1jf_bLq61gK0jSZFlXXXDKFXa-1924-692.png' />
      </div>
      <div className={styles.altWord}>新增应用，填写完成应用名称与应用分组后，点击「安装」即可。</div>
      <div className={styles.imageContent}>
        <img style={{ height: 362 }} src='https://img.alicdn.com/tfs/TB1GSebMrH1gK0jSZFwXXc7aXXa-1924-728.png' />
      </div>
    </div>;
  };

  function handleHref(params: {ns?: string, region?: string, iis?: string}) {
    pushUrl(history, '/manage/setting', params);
  }

  function renderStep() {
    const { region } = parseQuery();
    let steps: any[];
    if (way === 'k8s') {
      steps = [
        { title: '配置 Pod 标签', content: renderPod() },
        { title: <span>自建环境安装 <span style={{ color: '#0070cc' }}>helm</span>/部署故障演练探针 <span style={{ color: '#0070cc' }}> ack-ahas-pilot</span></span>, content: '' },
      ];
    } else if (language === 'java') {
      if (region !== 'public') {
        steps = [
          { title: '配置 JVM 启动参数', content: renderJVM() },
          { title: '启动应用即可', content: '' },
          { title: <span>进入探针管理页面，点击<a onClick={() => handleHref({})} target="_black">安装故障演练探针</a></span>, content: renderImge('https://img.alicdn.com/tfs/TB1PJYRficKOu4jSZKbXXc19XXa-1924-488.png', 242) },
          { title: '选择 ECS 机器', content: renderImge('https://img.alicdn.com/tfs/TB13puCJ4z1gK0jSZSgXXavwpXa-1924-568.png', 282) },
          { title: '点击「安装」按钮', content: renderImge('https://img.alicdn.com/tfs/TB1JZSKJW61gK0jSZFlXXXDKFXa-1924-312.png', 154) },
          { title: '填写应用、应用分组信息', content: renderStepFour() },
        ];
      } else {
        steps = [
          { title: '配置 JVM 启动参数', content: renderJVM() },
          { title: '启动应用即可', content: '' },
          { title: <span>进入探针管理页面，点击<a onClick={() => handleHref({ region: 'public' })} target="_black">安装故障演练探针</a></span>, content: renderImge('https://img.alicdn.com/tfs/TB1cCCfMEH1gK0jSZSyXXXtlpXa-1920-724.png', 362) },
          { title: '选择 Linux 主机', content: renderImge('https://img.alicdn.com/tfs/TB1GWSfMEY1gK0jSZFMXXaWcVXa-1924-628.png', 312) },
          { title: '复制命令，填写应用/应用分组', content: renderImge('https://img.alicdn.com/tfs/TB1Ugayd639YK4jSZPcXXXrUFXa-1924-364.png', 180) },
          { title: '登录主机，执行以上命令', content: '' },
        ];
      }
    } else {
      if (region !== 'public') {
        steps = [
          { title: <span>进入探针管理页面，点击<a onClick={() => handleHref({})} target="_black">安装故障演练探针</a></span>, content: renderImge('https://img.alicdn.com/tfs/TB1PJYRficKOu4jSZKbXXc19XXa-1924-488.png', 242) },
          { title: '选择 ECS 机器', content: renderImge('https://img.alicdn.com/tfs/TB13puCJ4z1gK0jSZSgXXavwpXa-1924-568.png', 282) },
          { title: '点击「安装」按钮', content: renderImge('https://img.alicdn.com/tfs/TB1JZSKJW61gK0jSZFlXXXDKFXa-1924-312.png', 154) },
          { title: '填写应用、应用分组信息', content: renderStepFour() },
        ];
      } else {
        steps = [
          { title: <span>进入探针管理页面，点击<a onClick={() => handleHref({ region: 'public' })} target="_black">安装故障演练探针</a></span>, content: renderImge('https://img.alicdn.com/tfs/TB1PJYRficKOu4jSZKbXXc19XXa-1924-488.png', 242) },
          { title: '选择 Linux 主机', content: renderImge('https://img.alicdn.com/tfs/TB1GWSfMEY1gK0jSZFMXXaWcVXa-1924-628.png', 312) },
          { title: '复制命令，填写应用/应用分组', content: renderImge('https://img.alicdn.com/tfs/TB1Ugayd639YK4jSZPcXXXrUFXa-1924-364.png', 180) },
          { title: '登录主机，执行以上命令', content: '' },
        ];
      }
    }
    return _.map(steps, (item: any, index: number) => {
      return <Step.Item key={index} title={item.title} content={item.content} />;
    });
  }

  return (
    <div className={styles.stepContent}>
      <Step
        direction="ver"
        shape="circle"
        animation={false}
        readOnly={true}
      >
        {renderStep()}
      </Step>
    </div>
  );
}

export default AccessStepComponent;
