import ExpertiseList from 'pages/Chaos/ExpertiseList';
import React, { FC } from 'react';
import i18n from '../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Dialog } from '@alicloud/console-components';

interface IProps {
  visible: boolean;
  handleClose: () => void;
  onEmpty: () => void;
  handleChoseCreate: (value: any) => void;
  hideEmpty: boolean; //  是否显示从空白创建card
}

const ExpertiseCard: FC<IProps> = props => {
  return (
    <Dialog
      title={i18n.t('New drill').toString()}
      visible={props.visible}
      onClose={props.handleClose}
      className={styles.DialogExperience}
      footer={false}
      locale={locale().Dialog}
    >
      <div className={styles.warp}>
        <ExpertiseList onEmpty={props.onEmpty} hideEmpty={props.hideEmpty} noFooter={true} onChose={props.handleChoseCreate} />
      </div>
    </Dialog>
  );
};

export default ExpertiseCard;
