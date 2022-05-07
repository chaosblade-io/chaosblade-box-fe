import React, { useState } from 'react';
import styles from './index.css';
import { Button } from '@alifd/next';
import { getLanguage } from '../../utils/util';
import { publish } from 'tiny-pubsub';
import { useTranslation } from 'react-i18next';

const SwitchLanguage = () => {
  const { i18n } = useTranslation();
  const _isEnglish = getLanguage() === 'en';
  const [ isEnglish, setIsEnglish ] = useState(_isEnglish);
  return (
    <div className={styles.languageButtonStyle}>
      <Button
        className={`${styles.englishPart} ${isEnglish ? `${styles.isEnglish}` : null}`}
        onClick={() => {
          i18n.changeLanguage('en');
          localStorage.setItem('lang', 'en');
          publish('language-change', 'en');
          setIsEnglish(true);
          window.location.reload();
        }}
      >
        EN
      </Button>
      <Button
        className={`${styles.chinesePart} ${isEnglish ? 'null' : `${styles.isEnglish}`}`}
        onClick={() => {
          i18n.changeLanguage('zh');
          localStorage.setItem('lang', 'zh');
          publish('language-change', 'zh');
          setIsEnglish(false);
          window.location.reload();
        }}
      >
        中文
      </Button>
    </div>
  );
};
export default SwitchLanguage;
