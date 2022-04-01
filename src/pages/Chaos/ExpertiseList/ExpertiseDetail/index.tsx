import ActivityEditor from 'pages/Chaos/Experiment/common/ActivityEditor';
import MiniFlowView from 'pages/Chaos/common/MInFlowView';
import React, { FC, useEffect, useState } from 'react';
import _ from 'lodash';
import styles from './index.css';
import { Button, Tag } from '@alicloud/console-components';
import { INode } from 'config/interfaces/Chaos/experiment';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';
import { useQuery } from 'utils/libs/sre-utils-hooks';


const ExpertiseDetail: FC = () => {
  const dispatch = useDispatch();
  const expertiseId = useQuery('expertiseId');
  const history = useHistory();
  const [ activityEditorVisible, setActivityEditorVisible ] = useState(false);
  const [ currentNode, setCurrentNode ] = useState<INode | null>(null);
  const { expertiseInfo } = useSelector(state => {
    return {
      expertiseInfo: state.expertises.expertiseInfo,
    };
  });

  const state = _.get(expertiseInfo, 'basic_info.state', 0);
  useEffect(() => {
    dispatch.pageHeader.setNameSpace(false);
    dispatch.pageHeader.setTitle('演练经验库详情页');
    dispatch.pageHeader.setHeaderExtra(
      <div style={{ textAlign: 'right' }}>
        {state ? <Button type='primary' onClick={handleCreateExp}>创建演练</Button> : null}
      </div>,
    );
    dispatch.pageHeader.showBackArrow(true);
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'expertise_list',
        value: '演练经验库',
        path: '/chaos/expertise/list',
      },
      {
        key: 'expertise_detail',
        value: '演练经验库详情',
        path: '/chaos/expertise/detail',
      },
    ]));
  }, []);

  useEffect(() => {
    if (expertiseId) {
      (async function() {
        await dispatch.expertises.getExpertiseDetail({ expertise_id: expertiseId });
      })();
    }
  }, []);

  function handleCreateExp() {
    dispatch.experimentEditor.setClearExperiment();
    pushUrl(history, '/chaos/experiment/editor', {
      expertiseId,
    });
  }

  function handleNodeClick(node: INode) {
    setCurrentNode(node);
    setActivityEditorVisible(true);
  }

  function handleActivityEditorClose() {
    setCurrentNode(null);
    setActivityEditorVisible(false);
  }

  const basicInfo = _.get(expertiseInfo, 'basic_info', null);
  const executableInfo = _.get(expertiseInfo, 'executable_info', null);
  const evaluationInfo = _.get(expertiseInfo, 'evaluation_info', { items: [] });
  const runMode = _.get(executableInfo, 'flow.runMode', '');
  const runTime = _.get(executableInfo, 'run_time', '');
  return (
    <div className={styles.warp}>
      <div className={styles.baseInfo}>
        <div className={styles.title}>基本信息</div>
        <div>
          <div className={styles.baseInfoItem}>
            <div className={styles.label}>经验名称</div>
            <div className={styles.value} title={basicInfo! && basicInfo!.name}>{basicInfo && basicInfo.name}</div>
          </div>
          <div className={styles.baseInfoItem}>
            <div className={styles.label}>经验描述</div>
            <div className={styles.value} title={basicInfo! && basicInfo!.function_desc}>{basicInfo && basicInfo.function_desc}</div>
          </div>
          <div className={styles.baseInfoItem}>
            <div className={styles.label}>标签</div>
            <div className={styles.value}>
              {!_.isEmpty(basicInfo) && basicInfo!.tags.map((tag: string) => {
                return <Tag type="primary" size="small" key={tag} className={styles.tagCss}>{tag}</Tag>;
              })}
            </div>
          </div>
          <div className={styles.baseInfoItem}>
            <div className={styles.label}>背景</div>
            <div className={styles.value} title={basicInfo! && basicInfo!.background_desc}>{basicInfo && basicInfo.background_desc}</div>
          </div>
          <div className={styles.baseInfoItem}>
            <div className={styles.label}>架构弱点</div>
            <div className={styles.value} title={basicInfo! && basicInfo!.design_concept}>{basicInfo && basicInfo.design_concept}</div>
          </div>
        </div>
      </div>
      <div className={styles.flows}>
        <div className={styles.title}>演练流程</div>
        <div className={styles.runEnvironment}>
          <div className={styles.runTitle}>运行环境</div>
          <div>
            {!_.isEmpty(runTime) && runTime.items.map((it: string) => {
              return <Tag type='primary' size='small' key={it} className={styles.tagCss}>{it}</Tag>;
            })}
          </div>
        </div>
        <div>
          {!_.isEmpty(expertiseInfo) && <MiniFlowView
            isExpertise
            experiment={executableInfo}
            runMode={runMode}
            onNodeClick={node => handleNodeClick(node as INode)}
          />}
        </div>
      </div>
      <div>
        <div className={styles.title}>其它信息</div>
        <div className={styles.baseInfoItem}>
          <div className={styles.label}>评测</div>
          <div className={styles.value} >
            {
              !_.isEmpty(evaluationInfo) && Array.from(evaluationInfo.items).map((e: any, idx: number) => {
                return <li className={styles.valueItem} key={idx} title={e.desc}>{e.desc}</li>;
              })
            }
          </div>
        </div>
      </div>
      {currentNode &&
        <ActivityEditor
          disabled
          readOnly
          isExpertise={true}
          visible={activityEditorVisible}
          data={currentNode!}
          onClose={handleActivityEditorClose}
        />
      }
    </div>
  );
};

export default ExpertiseDetail;
