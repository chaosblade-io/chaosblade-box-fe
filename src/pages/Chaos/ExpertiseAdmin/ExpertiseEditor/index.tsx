import BaseInfo from 'pages/Chaos/ExpertiseAdmin/ExpertiseBaseInfo';
import CreateExpertiseInfo from 'pages/Chaos/ExpertiseAdmin/CreateExpertiseInfo';
import React, { useEffect, useState } from 'react';
import StepOne from 'pages/Chaos/Experiment/ExperimentEditor/StepOne';
import StepTwo from 'pages/Chaos/Experiment/ExperimentEditor/StepTwo';
import * as _ from 'lodash';
import i18n from '../../../../i18n';
import styles from './index.css';
import { IBasicInfo } from 'config/interfaces/Chaos/expertiseEditor';
import { Step, Tab } from '@alicloud/console-components';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';
import { parseQuery, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const { Item } = Tab;
const { Item: StepItem } = Step;

function ExpertiseEditor() {
  const dispatch = useDispatch();
  const history = useHistory();
  const expertise = useSelector(({ expertiseEditor }) => expertiseEditor.expertise);
  const tags = useSelector(({ experimentDataSource }) => experimentDataSource.tags);

  const [ currentStep, setCurrentStep ] = useState(0);
  const [ isEdit, setIsEdit ] = useState<boolean>(false);
  const [ inited, setInited ] = useState<boolean>(false);
  const [ isEnterCreate, setIsEnterCreate ] = useState<boolean>(false); // 新增模式下是否进入创建

  useEffect(() => {
    dispatch.pageHeader.setNameSpace(false);
    dispatch.pageHeader.setTitle(i18n.t('Experience configuration').toString());
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'expertise_editor',
        value: i18n.t('Experience configuration').toString(),
        path: '/chaos/expertise/edtior',
      },
    ]));
    const parsed = parseQuery();
    const { expertiseId, cloneState } = parsed;
    if (!_.isEmpty(parsed)) {
      // 后台管理部分
      if (expertiseId) {
        // 后台更新经验
        (async function() {
          await dispatch.expertiseEditor.getExpertise({
            expertise_id: expertiseId,
          }, (res: any) => {
            if (res) {
              setInited(true);
              setIsEdit(true);
            }
          });
        })();
      } else {
        // 后台创建经验
        if (!cloneState) {
          // 不是拷贝的时候清空
          dispatch.expertiseEditor.setClearExpertise();
        }
        setInited(true);
        setIsEdit(false);
        setIsEnterCreate(true);
      }
    }
  }, []);

  function handleNext() {
    const s = currentStep + 1;
    setCurrentStep(s > 2 ? 2 : s);
  }

  function handlePrev(step?: number) {
    if (step === 0) {
      setCurrentStep(0);
    } else {
      const s = currentStep - 1;
      setCurrentStep(s < 0 ? 0 : s);
    }
  }

  function handleBackDetail() {
    pushUrl(history, '/chaos/expertise/admin/');
  }

  function renderStep() {
    // 保证StepOne渲染的时候已经获取到flowGroups
    if (!inited) {
      return null;
    }

    if (currentStep === 0) {
      return (
        <StepOne
          isExpertise={true}
          isEdit={isEdit}
          onNext={handleNext}
          onBack={handleBackDetail}
        />
      );
    }
    if (currentStep === 1) {
      return (
        <StepTwo
          isExpertise={true}
          isEdit={isEdit}
          onNext={handleNext}
          onPrev={handlePrev}
          onBack={handleBackDetail}
        />
      );
    }
    return <CreateExpertiseInfo
      isEdit={isEdit}
      onPrev={handlePrev}
      onBack={handleBackDetail}
    />;
  }

  function handleTagSearch(key: any) {
    (async function() {
      await dispatch.experimentDataSource.getTags(key);
    })();
  }

  function handleTagFocus() {
    (async function() {
      await dispatch.experimentDataSource.getTags({ key: '', type: 3 });
    })();
  }

  function handleUpdateBaseInfo(baseInfo: IBasicInfo) {
    (async function() {
      await dispatch.expertiseEditor.setUpdateBasicInfo(baseInfo);
    })();
  }

  function renderBaseInfo() {
    const baseInfo = _.get(expertise, 'basic_info', {});
    return <BaseInfo
      data={baseInfo as IBasicInfo}
      tags={tags}
      onSearchTags={handleTagSearch}
      onFocusTags={handleTagFocus}
      onUpdateBasinfo={handleUpdateBaseInfo}
    />;
  }

  return <div className={styles.informationContainer}>
    {/* 基本信息 */}
    { renderBaseInfo() }
    <Tab shape="wrapped">
      <Item title={i18n.t('Configure').toString()}>
        {
          <div className={styles.configureItem}>
            {
              /* 编辑模式 或者 新增模式下点击立即创建 */
              (isEdit || isEnterCreate) &&
              <div>
                <Step current={currentStep} shape="circle" labelPlacement="hoz" className={styles.steps}>
                  <StepItem title={i18n.t('Drill object').toString()} content={i18n.t('Applications and failures').toString()} />
                  <StepItem title={i18n.t('Global configuration').toString()} content={i18n.t('Global parameter settings').toString()}/>
                  <StepItem title={i18n.t('Information configuration').toString()} content={i18n.t('Experience information configuration').toString()}/>
                </Step>
                {renderStep()}
              </div>
            }
          </div>
        }
      </Item>
    </Tab>
  </div>;

}

export default ExpertiseEditor;
