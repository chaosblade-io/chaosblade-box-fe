import AccessStepComponent from 'pages/Chaos/Application/AccessStepComponent';
import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import classnames from 'classnames';
import i18n from '../../../../i18n';
import styles from './index.css';
import { Message } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { useDispatch } from 'utils/libs/sre-utils-dva';

// import MarkD from 'components/MarkD';

function ApplicationAccess() {
  const dispatch = useDispatch();
  const [ deployWay, setDeployWay ] = useState('host'); // 默认选择第一个
  const [ language, setLanguage ] = useState('java');

  useEffect(() => {
    dispatch.pageHeader.setTitle(<Translation>Application access</Translation>);
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'application',
        value: i18n.t('Application management'),
        path: '/chaos/application',
      },
      {
        key: 'freshapplication_access',
        value: i18n.t('Application access'),
        path: '/chaos/freshapplication/access',
      },
    ]));
  }, [ ]);


  function handleChiose(type: string, key: string) {
    if (type === 'way') {
      setDeployWay(key);
      setLanguage('java');
    } else if (type === 'language') {
      setLanguage(key);
    }
  }

  function renderCard(key: string, href: string, chiose: string, word: string, type: string) {
    let chioseStyle;
    let chioseName;
    let imgSrc = href;
    if (key === deployWay || key === language) {
      chioseStyle = styles.chioseCard;
      chioseName = styles.chioseName;
      imgSrc = chiose;
    }
    return <div className={classnames(styles.card, chioseStyle)} key={key} onClick={() => handleChiose(type, key)}>
      <img src={imgSrc} className={styles.img} />
      <div className={classnames(styles.name, chioseName)}>{word}</div>
    </div>;
  }

  function renderCardContent(val: string[], value: string[], type: string) {
    // val第一个卡片信息，value第二个卡片信息， type是操作内容
    return <div className={styles.cardContent}>
      {renderCard(val[0], val[1], val[2], val[3], type)}
      {renderCard(value[0], value[1], value[2], value[3], type)}
    </div>;
  }

  function renderHost() {
    return <div>
      <div className={styles.contentChiose}>
        <div className={styles.title}><Translation>Application management, please select application language</Translation></div>
        {renderCardContent([ 'java', 'https://img.alicdn.com/tfs/TB18mMPJ7L0gK0jSZFtXXXQCXXa-24-32.png', 'https://img.alicdn.com/tfs/TB1gSMWJ7T2gK0jSZFkXXcIQFXa-24-32.png', 'Java' ], [ 'other', 'https://img.alicdn.com/tfs/TB1OT.TJ.Y1gK0jSZFCXXcwqXXa-26-30.png', 'https://img.alicdn.com/tfs/TB18U4dbP39YK4jSZPcXXXrUFXa-26-30.png', '其它' ], 'language')}
      </div>
      {
        language === 'java' && <div className={styles.guide}><Translation>Specify the application and application group by configuring the JVM startup parameters, which is used to accurately divide the application / application group to which the machine belongs (it does not conflict with the application / application group specified when installing the probe). The configuration steps are as follows:</Translation></div>
      }
      <AccessStepComponent
        way={deployWay}
        language={language}
      />
    </div>;
  }

  return (
    <div className={styles.appAccess}>
      <div className={styles.contentChiose}>
        <div className={styles.title}><Translation>Please select application deployment method</Translation></div>
        {renderCardContent([ 'host', 'https://img.alicdn.com/tfs/TB1TV0WaDM11u4jSZPxXXahcXXa-28-28.png', 'https://img.alicdn.com/tfs/TB15tsRJ.Y1gK0jSZFMXXaWcVXa-28-28.png', 'host' ], [ 'k8s', 'https://img.alicdn.com/tfs/TB1T5UQJVP7gK0jSZFjXXc5aXXa-30-30.png', 'https://img.alicdn.com/tfs/TB1k7J4fycKOu4jSZKbXXc19XXa-30-30.png', 'Kubernetes' ], 'way')}
      </div>
      {deployWay === 'host' ?
        renderHost()
        :
        <div>
          <div className={styles.guide}><Translation>Identify the application / application group to which it belongs through the pod tag. The configuration is as follows:</Translation></div>
          <AccessStepComponent
            way={deployWay}
            language={language}
          />
          <Message title='' type="warning" className={styles.jvmWaring}><Translation>In the cluster where the fault drill probe has been deployed, modifying the pod tag can take effect without redeploying the fault drill probe.</Translation>
          </Message>
        </div>}
    </div>
  );

}

export default ApplicationAccess;
