import React, { memo, useState } from 'react';

import styles from './index.css';
import { Dialog, Dropdown, Icon, Menu } from '@alicloud/console-components';
import { experienceCards, videoCards } from './constants';

interface Props {
  showGuide: boolean;
  skipUrl: (str: string, params?:any) => void;
}

const Guide: React.FC<Props> = props => {
  const { showGuide, skipUrl } = props; // 是否显示引导信息
  const [ isExpend, setIsExpend ] = useState(!showGuide); // 是否折叠引导card
  const [ isExpendVideos, setExpandVideos ] = useState(true); // 是否折叠video card
  const [ isShowVideos, setShowVideos ] = useState(true); // 是否显示video card
  const [ selVideo, setSelVideo ] = useState(''); // 当前选中的视频
  if (isExpend) {
    return (
      <div className={styles.segment}>
        <div className={styles.header} style={{ margin: 0 }}>
          <div className={styles.title}>欢迎体验故障演练</div>
          <div className={styles.btn} data-type="link" onClick={() => setIsExpend(!isExpend)}>展开</div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className={styles.segment}>
        <div className={styles.header}>
          <div className={styles.title}>欢迎体验故障演练</div>
          <div className={styles.btn} data-type="link" onClick={() => setIsExpend(!isExpend)}>收起</div>
        </div>
        <div className={styles.cards}>
          {experienceCards.map((item, index) => {
            const { title, desp, icons, btn, skipInfo } = item;
            return (
              <div key={index} className={styles.cardItem} style={{ textAlign: 'center' }}>
                <div className={styles.cardTitle}>{title}</div>
                <div className={styles.cardDesp}>{desp}</div>
                <div className={styles.cardIcons}>
                  {icons}
                </div>
                {skipInfo?.type &&
                  <a href={skipInfo?.url} target={skipInfo?.type}><div className={styles.btn} data-type={btn.type}>{btn.text} {btn.icon}</div></a> ||
                  <div className={styles.btn} data-type={btn.type} onClick={() => skipUrl(skipInfo?.url, skipInfo?.params)}>{btn.text} {btn.icon}</div>
                }
              </div>
            );
          })}
        </div>
      </div>
      { false &&
        <div className={styles.segment}>
          <div className={styles.header} style={{ marginBottom: '0px' }}>
            <div className={styles.title}>功能介绍与产品使用讲解</div>
            <div className={styles.rightBtns}>
              <div className={styles.btn} data-type="link" onClick={() => setExpandVideos(!isExpendVideos)}>{isExpendVideos ? '收起' : '展开'}</div>
              <div>
                <Dropdown trigger={<Icon type="ellipsis-vertical" size="xs" />} afterOpen={() => console.log('after open')}>
                  <Menu>
                    <Menu.Item onClick={() => setShowVideos(!isShowVideos)}>不再显示</Menu.Item>
                  </Menu>
                </Dropdown>
              </div>
            </div>
          </div>
          { isExpendVideos &&
            <div className={styles.cards} style={{ marginTop: '12px' }}>
              {videoCards.map((item, index) => {
                const { title, url } = item;
                return (
                  <div key={index} className={styles.cardItem} onClick={() => setSelVideo(url)}>
                    <div className={styles.videoContent}>
                      <video src={url}>
                        浏览器不支持视频标签！
                      </video>
                      <Icon type="playcircle-fill" size="large"/>
                    </div>
                    <div className={styles.cardTitle} style={{ margin: '4px 0 0 0' }}>{title}</div>
                  </div>
                );
              })}
            </div>
          }
          {selVideo &&
            <Dialog
              visible={true}
              footer={false}
              style={{ width: '90%' }}
              onCancel={() => setSelVideo('')}
              onClose={() => setSelVideo('')}
            >
              <video muted controls src={selVideo} style={{ width: '100%', height: '90vh' }}>
                浏览器不支持视频标签！
              </video>
            </Dialog>
          }
        </div>
      }
    </>
  );
};

export default memo(Guide);
