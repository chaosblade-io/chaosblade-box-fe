import BaseInfo from 'pages/Chaos/common/BaseInfo';
import BaseInfoView from 'pages/Chaos/common/BaseInfoView';
import ExperimentTaskHistory from 'pages/Chaos/Experiment/common/ExperimentTaskHistory';
import React, { FC, useEffect, useState } from 'react';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import _ from 'lodash';
import styles from './index.css';
import { IBaseInfo, ISearchKey } from 'config/interfaces/Chaos/experiment';
import { Step, Tab } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { parseQuery, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const { Item } = Tab;
const { Item: StepItem } = Step;

const ExperimentEditor: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { experiment, tags } = useSelector(state => {
    return {
      ...state.experimentEditor,
      ...state.experimentDataSource,
    };
  });
  // const workSpaces = useSelector(({ experimentDataSource }) => experimentDataSource.workSpaces);

  const [ currentStep, setCurrentStep ] = useState(0);
  const [ currentId, setCurrentId ] = useState<any>(null);
  const [ isEdit, setIsEdit ] = useState<boolean>(false);
  const parsed = parseQuery();

  useEffect(() => {
    dispatch.pageHeader.setTitle('演练配置');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'workspace',
        value: '空间管理',
        path: '/chaos/workspace/list',
      },
      {
        key: 'experiment_editor',
        value: '演练配置',
        path: '/chaos/experiment/edtior',
      },
    ]));
    if (!_.isEmpty(parsed)) {
      dispatch.experimentEditor.setClearExperiment();
      const { id: experimentId, expertiseId, code } = parsed;
      if (!_.isEmpty(experimentId)) {
        setCurrentId(experimentId);
        setIsEdit(true);
        (async function() {
          await dispatch.experimentEditor.getExperimentBaseInfo({ experimentId });
        })();
        // 查询flow定义，如果服务端返回数据，则当前为编辑模式
        (async function() {
          await dispatch.experimentEditor.getExperiment({ experimentId }, ({ flowInfo }) => {
            if (!_.isEmpty(flowInfo)) {
              setIsEdit(true);
            }
          });
        })();
      } else {
        if (expertiseId) {
          dispatch.experimentEditor.setClearExperiment();
          (async function() {
            await dispatch.experimentEditor.getExperimentByExpertise({ expertise_id: expertiseId });
          })();
        } else if (code) {
          dispatch.experimentEditor.setClearExperiment();
          (async function() {
            await dispatch.experimentEditor.getExperimentByAppCode({ appCode: code });
          })();
        }
      }
    }
  }, []);

  function renderBaseInfo() {
    return <BaseInfoView
      baseInfo={_.get(experiment, 'baseInfo', {}) as IBaseInfo}
      onEditExperimentBaseInfo={handleGoEditBase}
    />;
  }

  function handleGoEditBase() {
    pushUrl(history, '/chaos/baseInfo/editor', {
      pass: 'detail',
    });
  }

  function handleUpdataBasinfo(baseInfo: IBaseInfo) {
    dispatch.experimentEditor.setUpdateBaseInfo(baseInfo);
  }

  // 基本信息tag请求
  function handleSearchTag(key: ISearchKey) {
    (async function() {
      await dispatch.experimentDataSource.getTags(key);
    })();
  }

  function handleTagFocus() {
    handleSearchTag({ key: '', type: 0 });
  }

  // function handleFocusWorkSpace() {
  //   // 流程基本信息空间
  //   (async function() {
  //     await dispatch.experimentDataSource.getWorkSpaces();
  //   })();
  // }

  function handleNext() {
    const s = currentStep + 1;
    setCurrentStep(s > 2 ? 2 : s);
  }

  function handlePrev() {
    const s = currentStep - 1;
    setCurrentStep(s < 0 ? 0 : s);
  }

  function handleBackDetail() {
    dispatch.experimentEditor.setClearExperiment();
    pushUrl(history, '/chaos/experiment/detail');
  }

  function renderSteps() {
    if (currentStep === 0) {
      return (
        <StepOne
          isEdit={isEdit}
          onNext={handleNext}
          onBack={handleBackDetail}
          isExpertise={false}
        />
      );
    }
    if (currentStep === 1) {
      return (
        <StepTwo
          experimentId={currentId}
          isEdit={isEdit}
          onNext={handleNext}
          onPrev={handlePrev}
          onBack={handleBackDetail}
          isExpertise={false}
        />
      );
    }
  }

  return (
    <div className={styles.experimentEditor}>
      {/* 基本信息 */}
      {!isEdit ? <BaseInfo
        onUpdateBasinfo={handleUpdataBasinfo}
        tags={tags as []}
        // workSpaces={workSpaces}
        data={_.get(experiment, 'baseInfo', {}) as IBaseInfo}
        disabled={currentStep === 2}
        onFocusTags={handleTagFocus}
        // onFocusWorkSpace={handleFocusWorkSpace}
      /> : renderBaseInfo()}
      <Tab className={styles.tabs} shape="wrapped">
        <Item title="配置">
          {
            <div className={styles.configureItem}>
              {
                <div>
                  <Step current={currentStep} shape="circle" labelPlacement="hoz" className={styles.steps}>
                    <StepItem title="演练对象" content='应用和故障' />
                    <StepItem title="全局配置" content='全局参数设置'/>
                  </Step>
                  {renderSteps()}
                </div>
              }
            </div>
          }
        </Item>
        <Item title="记录">
          <ExperimentTaskHistory experimentId={currentId}/>
        </Item>
      </Tab>
    </div>
  );
};

export default ExperimentEditor;
