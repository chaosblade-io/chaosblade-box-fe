import NamespaceSelector from 'components/PageHeaderExtra/NamespaceSelector';
import React, { FC } from 'react';
import styles from './index.css';
import { useSelector } from 'dva';

const ExperimentListHeader: FC = () => {
  const pageState = useSelector((state: any) => {
    return state.pageHeader;
  });
  const { showNameSpace } = pageState;
  return (
    <>
      <div className={styles.container}>
        <div className={styles.containerHeaderLetf}>
          {
            showNameSpace && <NamespaceSelector />
          }
        </div>
      </div>
    </>
  );
};

export default ExperimentListHeader;
