import React, { memo } from 'react';
import Translation from 'components/Translation';
import styles from './index.css';

import { Icon } from '@alicloud/console-components';


const Index: React.FC = () => {

  return (
    <div className={styles.finish}>
      <div className={styles.tips}>
        <div className={styles.pHeader} style={{ color: 'green' }}><Icon type="check-circle" /> <Translation>Data migration succeeded</Translation></div>
        <div className={styles.desp}><Translation>After the data migration is successful, you can jump to the public cloud to view</Translation></div>
      </div>
    </div>
  );
};

export default memo(Index);
