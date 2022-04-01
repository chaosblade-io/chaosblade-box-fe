import AccessStepComponent from 'pages/Chaos/Application/AccessStepComponent';
import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
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
    dispatch.pageHeader.setTitle('应用接入');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'application',
        value: '应用管理',
        path: '/chaos/application',
      },
      {
        key: 'freshapplication_access',
        value: '应用接入',
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
        <div className={styles.title}>请选择应用语言</div>
        {renderCardContent([ 'java', 'https://img.alicdn.com/tfs/TB18mMPJ7L0gK0jSZFtXXXQCXXa-24-32.png', 'https://img.alicdn.com/tfs/TB1gSMWJ7T2gK0jSZFkXXcIQFXa-24-32.png', 'Java' ], [ 'other', 'https://img.alicdn.com/tfs/TB1OT.TJ.Y1gK0jSZFCXXcwqXXa-26-30.png', 'https://img.alicdn.com/tfs/TB18U4dbP39YK4jSZPcXXXrUFXa-26-30.png', '其它' ], 'language')}
      </div>
      {
        language === 'java' && <div className={styles.guide}>通过配置 JVM 启动参数来指定应用和应用分组，用于精确划分该机器所归属的应用/应用分组（与安装探针时指定的应用/应用分组不冲突）。配置步骤如下：</div>
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
        <div className={styles.title}>请选择应用部署方式</div>
        {renderCardContent([ 'host', 'https://img.alicdn.com/tfs/TB1TV0WaDM11u4jSZPxXXahcXXa-28-28.png', 'https://img.alicdn.com/tfs/TB15tsRJ.Y1gK0jSZFMXXaWcVXa-28-28.png', '主机' ], [ 'k8s', 'https://img.alicdn.com/tfs/TB1T5UQJVP7gK0jSZFjXXc5aXXa-30-30.png', 'https://img.alicdn.com/tfs/TB1k7J4fycKOu4jSZKbXXc19XXa-30-30.png', 'Kubernetes' ], 'way')}
      </div>
      {deployWay === 'host' ?
        renderHost()
        :
        <div>
          <div className={styles.guide}>通过 Pod 标签识别其所归属的应用/应用分组，配置如下：</div>
          <AccessStepComponent
            way={deployWay}
            language={language}
          />
          <Message title='' type="warning" className={styles.jvmWaring}>
            在已部署故障演练探针的集群，修改 Pod 标签即可生效，无需重新部署故障演练探针。
          </Message>
        </div>}
    </div>
  );

}

export default ApplicationAccess;
