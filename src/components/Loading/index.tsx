import React, { FC } from 'react';
import styles from './index.css';
import { Loading } from '@alicloud/console-components';

const FullScreenLoading: FC = props => {
  return (
    <div className={styles.fullScreen}>
      <Loading {...props} />
    </div>
  );
};

export default FullScreenLoading;
