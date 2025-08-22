import React from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import copy from 'copy-to-clipboard';
import i18n from '../../../../i18n';
import styles from './index.css';
import { Icon, Message, Step } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
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
      Message.success(i18n.t('Copy successfully'));
    } else {
      Message.error(i18n.t('Replication failed'));
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
      <p><Translation>AppName can only contain letters, numbers and special characters _-</Translation></p>
      {renderCodeCopy([ i18n.t('-Dproject.name=application name -Dproject.group.name=application group name') ])}
      <div className={styles.jvmParam}><Translation>Please replace the above values according to the actual situation. The default values of the above configuration are as follows</Translation>: </div>
      <ul className={styles.ulList}>
        <li>project.name: <Translation>Defaults value</Translation> chaos-default-app</li>
        <li>project.group.name: <Translation>Defaults value</Translation> chaos-default-app-group</li>
      </ul>
      <Message title='' type="warning" className={styles.jvmWaring}>
        <Translation>   "Note: On the machine where the fault rehearsal probe has been deployed, modify the JVM startup parameters and restart, the application will automatically recognize and take effect without redeploying the fault rehearsal probe"</Translation>
      </Message>
    </div>;
  }

  function renderPod() {
    return <div>
      <p><Translation>The value of the tag can only contain letters, numbers and special characters_-</Translation></p>
      <div className={styles.podWord}><Translation>In the template (YAML format) add the following labels configuration to the spec &gt; template &lt; labels level</Translation>: </div>
      {renderCodeCopy([ 'labels:', `chaos/app-instance: ${i18n.t('ApplicationName')}`, `chaos/app-group: ${i18n.t('Application group name')}` ])}
      <div className={styles.podWord}><Translation>Replace the above values according to the actual situation. If you do not configure the above values, it will be recognized again whether it contains</Translation><span className={styles.tag}>app-group-name(<Translation>Container Service Application Configuration</Translation>)</span>、<span className={styles.tag}>app.kubernetes.io/name</span>、<span className={styles.tag}>app</span>、<span className={styles.tag}>k8s-app</span><Translation>The label configuration is used as the application name, and the default application group name format is</Translation>: <span className={styles.nameStyle}><Translation>Application name-group</Translation></span>。</div>
      <div className={styles.podWord} style={{ margin: '14px 0' }}><Translation>According to the label identification application, the label priority is as follows</Translation>: chaos/app-instance {'>'} app-group-name {'>'} app.kubernetes.io/name {'>'} k8s-app {'>'} app。</div>
      <div className={styles.podWord}><span className={styles.nameStyle}><Translation>Notice</Translation>: </span><Translation>The default application attribution is no longer supported in kubernetes mode, please follow the prompts above to configure the label</Translation></div>
    </div>;
  }

  function handleHref(params: { ns?: string, region?: string, iis?: string }) {
    pushUrl(history, '/manage/setting', params);
  }

  function renderStep() {
    let steps: any[];
    if (way === 'k8s') {
      steps = [
        { title: i18n.t('Configure Pod Labels'), content: renderPod() },
        { title: i18n.t('Use the chart package to automatically install fault drill probes'), content: <div className={styles.imageContent}><img src={require('../imgs/agentK8s.png')} /></div> },
      ];
    } else if (language === 'java') {
      steps = [
        { title: i18n.t('Configure JVM startup parameters'), content: renderJVM() },
        { title: i18n.t('Just start the app'), content: '' },
        { title: <span><Translation>Enter the probe management page, click</Translation><a onClick={() => handleHref({ region: 'public' })} target="_black"><Translation>Install the Troubleshooting Probe</Translation></a></span>, content: <div className={styles.imageContent}><img src={require('../imgs/agentHostAuto.png')} /></div> },
        { title: i18n.t('Fill in the application, application group information, IP, ssh user, and ssh password. If you already have an application, select the application name and application group, and click Install'), content: <div className={styles.imageContent}><img src={require('../imgs/agentApp.png')} /></div> },
      ];
    } else {
      steps = [
        { title: <span><Translation>Enter the probe management page, click</Translation><a onClick={() => handleHref({})} target="_black"><Translation>Install the Troubleshooting Probe</Translation></a></span>, content: <div className={styles.imageContent}><img src={require('../imgs/agentHostAuto.png')} /></div> },
        { title: i18n.t('Fill in the application, application group information, IP, ssh user, and ssh password. If you already have an application, select the application name and application group, and click Install'), content: <div className={styles.imageContent}><img src={require('../imgs/agentApp.png')} /></div> },
      ];
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
