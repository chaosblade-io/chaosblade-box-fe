import React from 'react';
import _ from 'lodash';
import formatDate from 'pages/Chaos/lib/DateUtil';
import styles from './index.css';
import { Balloon, Icon, Tag } from '@alicloud/console-components';
import { IBaseInfo } from 'config/interfaces/Chaos/experiment';
import { handleIsAdmin } from 'pages/Chaos/lib/BetaFlag';

const Tooltip = Balloon.Tooltip;

interface BaseInfoViewProps {
  baseInfo: IBaseInfo;
  onEditExperimentBaseInfo: () => void;
  permission?: number;
}

function BaseInfoView(props: BaseInfoViewProps) {
  // 有编辑权限才可编辑基本信息
  const { baseInfo, permission } = props;
  let descriptionLength = 0;
  const nameLength = baseInfo && baseInfo.name?.replace(/[^\x00-\xff]/g, '01').length; // eslint-disable-line
  if (baseInfo && baseInfo.description) {
    descriptionLength = baseInfo.description?.replace(/[^\x00-\xff]/g, '01').length; // eslint-disable-line
  }

  return (
    <div>
      <div className={styles.item}>
        <div className={styles.infomation}>基本信息</div>
        {handleIsAdmin(permission as number, 2) &&
          <a className={styles.editInfo} onClick={props.onEditExperimentBaseInfo}><span><Icon type="edit" className={styles.Icon}/></span>编辑基本信息</a>
        }
      </div>
      <div className={styles.infoContent}>
        <div className={styles.infoList}>
          <div className={styles.item}>
            <div className={styles.label}>演练名称</div>
            {
              nameLength > 49 ?
                <Tooltip trigger={
                  <div className={styles.nameLong}>{baseInfo && baseInfo.name}</div>
                } align="b" className={styles.value}>
                  {baseInfo && baseInfo.name}
                </Tooltip>
                :
                <div className={styles.value}>{baseInfo && baseInfo.name}</div>
            }
          </div>
          <div className={styles.item}>
            <div className={styles.label}>演练描述</div>
            {descriptionLength > 98 ?
              <Tooltip trigger={
                <div className={styles.valueLong}>{baseInfo && baseInfo.description}</div>
              } align="b" className={styles.value}>
                {baseInfo && baseInfo.description}
              </Tooltip>
              :
              <div className={styles.value}>{baseInfo && baseInfo.description}</div>
            }
          </div>
          <div className={styles.item}>
            <div className={styles.label}>创建时间</div>
            <div className={styles.value}>{formatDate(baseInfo && baseInfo.gmtCreate!)}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.label}>标签</div>
            <div className={styles.value}>
              {
                baseInfo && _.map(_.defaultTo(baseInfo.tags, []), (tag: string, n: number) => (
                  <Tag key={`experiment-tag-${n}`} className={styles.tag} title={tag}
                    size="medium">{tag}</Tag>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BaseInfoView;
