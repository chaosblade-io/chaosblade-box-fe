import React, { FC, memo } from 'react';
import Translation from 'components/Translation';
import styles from './index.css';

import { pushUrl } from 'utils/libs/sre-utils';
import { useHistory } from 'dva';

interface IProps {
  flag?: any;
  style: any;
  hasThree?: boolean | undefined;
}

const NoData: FC<IProps> = props => {
  const { flag, style, hasThree } = props;
  const history = useHistory();

  function gotoInstall(): void {
    pushUrl(history, '/chaos/agentmanage/setting/step', {
      iis: 1,
    });
  }

  const renderContent = () => {
    if (flag === 'CONTAINER') {
      return <div><Translation>There is currently no user cluster (only supports Alibaba Cloud's container service)</Translation></div>;
    }
    return (
      <>
        <div>
          <Translation>There may be the following reasons</Translation>:
        </div>
        <div>
          <Translation>First, there is currently no data that meets the filter criteria</Translation>
        </div>
        <div className={styles.link}>
          <Translation>Second, no data report has been received recently, please confirm</Translation>
          {origin !== 'cis.console' ? (
            <span onClick={gotoInstall} className={styles.active_span}>
              <Translation>Probe</Translation>
            </span>
          ) : (
            <span>
              &nbsp;<Translation>Probe</Translation>&nbsp;
            </span>
          )}
          <Translation>Is online</Translation>
        </div>
        {hasThree &&
          <div><Translation>Third, there may be no interdependence between your applications, please open the display independent application node in the application filter in the upper right corner</Translation></div>
        }
      </>
    );
  };

  return (
    <div className={styles.content} style={{ ...style }} >
      <div>
        <div className={styles.notDataBg} />
        <div className={styles.notDataText}>
          <div>
            <Translation>No data</Translation>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default memo(NoData);
