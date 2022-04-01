import ExpertiseList from 'pages/Chaos/ExpertiseList';
import React, { FC } from 'react';
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
      title="新建演练"
      visible={props.visible}
      onClose={props.handleClose}
      className={styles.DialogExperience}
      footer={false}
    >
      <div className={styles.warp}>
        <ExpertiseList onEmpty={props.onEmpty} hideEmpty={props.hideEmpty} noFooter={true} onChose={props.handleChoseCreate} />
      </div>
    </Dialog>
  );
};

export default ExpertiseCard;
