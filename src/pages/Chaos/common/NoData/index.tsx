import React, { FC, memo } from 'react';
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
      return <div>暂无用户集群(只支持阿里云的容器服务)</div>;
    }
    return (
      <>
        <div>
          可能有如下原因：
        </div>
        <div>
          第一, 暂无符合筛选条件的数据
        </div>
        <div className={styles.link}>
          第二, 最近没有收到数据上报，请确认
          {origin !== 'cis.console' ? (
            <span onClick={gotoInstall} className={styles.active_span}>
              探针
            </span>
          ) : (
            <span>
              &nbsp;探针&nbsp;
            </span>
          )}
          是否在线
        </div>
        {hasThree &&
          <div>第三，您的应用之间可能没有相互依赖关系，请在右上角应用筛选中打开展示独立应用节点。</div>
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
            暂无数据
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default memo(NoData);
