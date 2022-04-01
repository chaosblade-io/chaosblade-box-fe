import React, { useState } from 'react';
import _ from 'lodash';
import convertFilter from 'pages/Chaos/lib/ConvertFilter';
import styles from './index.css';
import { Button, Dialog, Icon, Input, Message, Select } from '@alicloud/console-components';
import { IBasicInfo, ITems } from 'config/interfaces/Chaos/expertiseEditor';
import { getActiveNamespace, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch, useSelector } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

const { Group: ButtonGroup } = Button;
interface CreateExpertiseInfoProps{
  isEdit: boolean;
  onPrev: (index?: number) => void;
  onBack: () => void;
}

// 匹配中文、字母、数字、下划线、正反斜杠
// const NORMAL_TEXT_REG = /^[\u4e00-\u9fa5_a-zA-Z0-9\/',_——，。]*$/;


export default function CreateExpertiseInfo(props: CreateExpertiseInfoProps) {
  const dispatch = useDispatch();
  const history = useHistory();
  const expertise = useSelector(({ expertiseEditor }) => expertiseEditor.expertise, (preProps, state) => {
    return preProps === state;
  });

  const [ visible, setVisible ] = useState(false);
  const [ updateVisible, setupdateVisible ] = useState(false);
  const [ expertiseid, setExpertiseId ] = useState('');

  function handleBackgroundDesc(value: string) {
    // if (!validateText(value)) {
    //   return;
    // }
    handleBaseInfoUpdate('background_desc', value);
  }

  function handleDesignConcept(value: string) {
    // if (!validateText(value)) {
    //   return;
    // }
    handleBaseInfoUpdate('design_concept', value);
  }

  function handleEvaluationInfo(value: string, item: any) {
    // if (!validateText(value)) {
    //   return;
    // }
    handleEvaluatingUpdate('desc', { ...item, desc: value });
  }

  function handleBaseInfoUpdate(field: string, value: string) {
    // const { updateExpertiseBaseInfo } = props;
    const baseInfo: IBasicInfo = getActiveDraftBaseInfo();
    baseInfo[ field ] = value;
    dispatch.expertiseEditor.setUpdateBasicInfo(baseInfo);
  }

  // function validateText(text) {
  //   if (NORMAL_TEXT_REG.test(text)) {
  //     return true;
  //   }
  //   return false;
  // };

  function getActiveDraftBaseInfo() {
    return _.get(expertise, 'basic_info', {}) as IBasicInfo;
  }

  function handleEvaluatingUpdate(name: string, value: string) {
    dispatch.expertiseEditor.setUpdateEvaluating(value);
  }

  function handleAddEvaluation() {
    dispatch.expertiseEditor.setUpdateEvaluating({});
  }

  function handleDeleteEvaluation(item: any) {
    dispatch.expertiseEditor.setDeleteEvaluating(item);
  }

  function handleCreateFinish() {
    const { isEdit } = props;
    const baseInfo = getActiveDraftBaseInfo();
    const items = _.get(expertise, 'evaluation_info.items', [{}]);
    const runTime = _.get(expertise, 'executable_info.run_time.items', []);
    const flow = _.get(expertise, 'executable_info.flow', {});

    if (!baseInfo.name || !baseInfo.function_desc || !baseInfo.tags || baseInfo.tags && !baseInfo.tags.length) {
      return Message.error('请填写完整的基本信息！');
    } else if (!baseInfo.background_desc || !baseInfo.design_concept || !items[0].desc || !runTime.length) {
      return Message.error('请将信息填写完整！');
    }
    if (isEdit) {
      (async function() {
        await dispatch.expertiseEditor.updateExpertise({
          ..._.set(expertise, 'executable_info.flow', convertFilter.convertFilterSubmit(flow)),
        }, (res: any) => {
          if (res) {
            setExpertiseId(res);
            setupdateVisible(true);
          }
        });
      })();
    } else {
      (async function() {
        await dispatch.expertiseEditor.createExpertise(_.set(expertise, 'executable_info.flow', convertFilter.convertFilterSubmit(flow)), (res: any) => {
          if (res) {
            setExpertiseId(res);
            setVisible(true);
          }
        });
      })();
    }

  }

  function handleRunTimeChange(value: string) {
    // if (!validateText(value)) {
    //   return;
    // }
    // props.updateRunTime(value)
    dispatch.expertiseEditor.setUpdateRunTime(value);
  }

  function handleToDetail() {
    pushUrl(history, '/chaos/expertise/detail/', { expertiseId: expertiseid });
  }

  function handleToCreate() {
    dispatch.expertiseEditor.setClearExpertise();
    // 返回时不携带参数，pushUrl会把所有参数都带回去
    history.push(`/chaos/expertise/editor?ns=${getActiveNamespace()}`);
    props.onPrev(0);
  }

  const baseInfo = getActiveDraftBaseInfo();
  const items = _.get(expertise, 'evaluation_info.items', [{}]);
  const runTime = _.get(expertise, 'executable_info.run_time.items', []);

  return <div className={styles.warp}>
    <div>
      <div className={styles.infoItem}>
        <div className={styles.label}>
          <span className={styles.required}>*</span>
          执行环境
        </div>
        <div className={styles.value}>
          <Select
            value={runTime}
            className={styles.selectRunTime}
            mode="tag"
            placeholder="请输入演练经验的执行环境并按下回车键"
            onChange={handleRunTimeChange}
            dataSource={[]}
            hasArrow={false}
          />
        </div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.label}>
          <span className={styles.required}>*</span>
          背景
        </div>
        <div className={styles.value}>
          <Input.TextArea
            value={baseInfo && baseInfo.background_desc}
            maxLength={1000}
            placeholder="请输入演练经验的背景"
            showLimitHint
            onChange={handleBackgroundDesc}
          />
        </div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.label}>
          <span className={styles.required}>*</span>
          架构弱点
        </div>
        <div className={styles.value}>
          <Input.TextArea
            value={baseInfo && baseInfo.design_concept}
            maxLength={1000}
            placeholder="请输入演练经验的架构弱点"
            showLimitHint
            onChange={handleDesignConcept}
          />
        </div>
      </div>
      {items.map((eva: ITems, idx: number) => {
        return <div className={styles.infoItem} key={eva.id}>
          <div className={styles.label}>
            {idx === 0 ? <span className={styles.required}>*</span> : null}
            {idx === 0 ? '评测' : null}
          </div>
          <div className={styles.value}>
            <Input.TextArea
              value={eva.desc}
              maxLength={1000}
              placeholder="请输入演练经验的评测"
              showLimitHint
              onChange={value => handleEvaluationInfo(value, eva)}
            />
          </div>
          {idx === 0 ? <Icon type="add" className={styles.addIcon} onClick={handleAddEvaluation}/>
            : <Icon type="minus" className={styles.addIcon} onClick={() => handleDeleteEvaluation(eva)}/>
          }
        </div>;
      })}
    </div>
    <div>
      <div>
        <div className='DividerEdit'></div>
        <ButtonGroup>
          <Button
            style={{ marginRight: '10px' }}
            onClick={() => props.onPrev()}
            type="normal"
          >
          上一步
          </Button>
          <Button
            onClick={handleCreateFinish}
            style={{ marginRight: '10px' }}
            type="primary"
          >
          完成
          </Button>
          {
            props.isEdit && <Button type='normal' onClick={props.onBack}>取消编辑</Button>
          }
        </ButtonGroup>
      </div>
    </div>
    <Dialog
      className={styles.successDialog}
      title={
        <div className={styles.success}>
          <Icon type="success-filling" className={styles.successIcon}/>
          <span className={styles.successTitle}>成功</span>
        </div>}
      visible={visible || updateVisible}
      closeable={false}
      footer={
        <ButtonGroup>
          <Button type="primary" onClick={handleToDetail} style={{ marginRight: 8 }}>经验详情</Button>
          <Button type="normal" onClick={handleToCreate}>继续创建</Button>
        </ButtonGroup>
      }
    >
      <div className={styles.successContent}>{visible ? '演练经验创建成功。' : '演练经验更新成功。'}</div>
    </Dialog>
  </div>;
}
