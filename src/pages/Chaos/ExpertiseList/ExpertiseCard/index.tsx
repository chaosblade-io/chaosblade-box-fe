import FlowThumbnail from '../FlowThumbnail';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import classnames from 'classnames';
import i18n from '../../../../i18n';
import styles from './index.css';
import { Balloon, Button, Message, Tag } from '@alicloud/console-components';
import { pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

interface IProps {
  expertise: any;
  noFooter?: boolean;
  hover?: boolean;
  onClick: (expertise: any) => void;
  isSelect: boolean;
}

const ExpertiseCard: FC<IProps> = props => {
  const dispatch = useDispatch();
  const { expertise } = props;
  const history = useHistory();
  const nodes = _.get(expertise, 'flow.activities', []);
  let activeBorder;
  // if (props && props.hover) {
  //   activeBorder = styles.hoverBorder;
  // } else {
  // }
  if (props && props.isSelect) {
    activeBorder = styles.foucsBorder;
  }
  const thumbnailContainerRef = useRef<any | null>(null);
  const [ thumbnailContainerWidth, setThumbnailContainerWidth ] = useState(0);


  useLayoutEffect(() => {
    if (thumbnailContainerRef && thumbnailContainerRef.current) {
      setThumbnailContainerWidth(thumbnailContainerRef.current.clientWidth);
    }
  });

  function handleClick() {
    if (expertise && !_.isEmpty(expertise)) {
      props.onClick && props.onClick(expertise);
    }
  }

  function handleExpertiseDetail() {
    const { expertise_id } = expertise;
    pushUrl(history, '/chaos/expertise/detail/', {
      expertiseId: expertise_id,
    });
  }

  function handleCreateExperiment() {
    const scope_type = _.get(expertise, 'scope_type', []);
    const type: string[] = [];
    scope_type.forEach((item: number) => {
      if (item === 0) {
        type.push(i18n.t('Host'));
      }
      if (item === 2) {
        type.push('Kubernetes');
      }
    });
    Message.show({
      type: 'notice',
      title: (<Translation>{`${i18n.t('Supported by current experience')}${type.join(',')}${i18n.t('Application type')}`}</Translation>),
      // title: (i18n.t(`Current experience supports ${type.join(',')} application types`)),
    });
    dispatch.experimentEditor.setClearExperiment();
    pushUrl(history, '/chaos/experiment/editor/', { expertiseId: expertise && expertise.expertise_id });
  }

  function renderScopeType() {
    const scope_type = _.get(expertise, 'scope_type', []);
    return scope_type.map((item: number, index: number) => {
      if (item === 0) {
        return (
          <Balloon
            closable={false}
            key={`${item}scope${index}`}
            trigger={<img className={styles.machinetype} src="https://img.alicdn.com/imgextra/i4/O1CN01pLgvOf1WxB137tbc2_!!6000000002854-55-tps-16-16.svg" alt=""/>}
          >
            <span><Translation>Host</Translation></span>
          </Balloon>
        );
      }
      if (item === 2) {
        return (
          <Balloon
            closable={false}
            key={`${item}scope${index}`}
            trigger={ <img className={styles.machinetype} src="https://img.alicdn.com/imgextra/i2/O1CN01N1ebdb27JSSGoC0RF_!!6000000007776-55-tps-16-16.svg" alt=""/>}
          >
            <span><Translation>Kubernetes</Translation></span>
          </Balloon>
        );
      }
      return null;
    });
  }

  return (
    <div className={classnames(styles.card, activeBorder)} onClick={handleClick}>
      <div className={styles.title}>
        {renderScopeType()}
        <div className={styles.titleWords} title={expertise && expertise.name}>{expertise && expertise.name}</div>
      </div>
      <div className={styles.describe} title={expertise && expertise.function_desc}>{expertise && expertise.function_desc}</div>
      <div>
        {expertise && expertise.tags.map((item: string, index: number) => {
          return <Tag type="normal" size="medium" style={{ marginRight: 4, marginTop: 6 }}
            key={`${item}${index}`}>
            {item}
          </Tag>;
        })}
      </div>
      <div
        ref={thumbnailContainerRef}
        className={styles.thumbnail}
        style={{ backgroundImage: 'url(https://img.alicdn.com/tfs/TB1Rmf9h5DsXe8jSZR0XXXK6FXa-252-124.svg)' }}
      >
        <FlowThumbnail
          nodes={nodes}
          containerWidth={thumbnailContainerWidth}
          containerHeight={123}
        />
      </div>
      {!props.noFooter ? <div className={styles.ButtonGroup}>
        <Button type='primary' className={styles.addRun} onClick={handleCreateExperiment}><Translation>create drill</Translation></Button>
        <Button type='normal' onClick={handleExpertiseDetail}><Translation>See details</Translation></Button>
      </div> : null}
    </div>
  );
};

export default ExpertiseCard;
