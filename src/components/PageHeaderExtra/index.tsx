import NamespaceSelector from './NamespaceSelector';
import React, { FC, memo } from 'react';
import styles from './index.css';

const PageHeaderExtra: FC = () => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.containerHeaderLetf}>
          <NamespaceSelector />
        </div>
      </div>
    </>
  );
};

export default memo(PageHeaderExtra);
