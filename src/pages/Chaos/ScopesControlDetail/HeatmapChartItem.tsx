import React, { FC } from 'react';
import Translation from 'components/Translation';
import * as _ from 'lodash';
import i18n from '../../../i18n';
import moment from 'moment';
import styles from './index.css';
import { Balloon } from '@alicloud/console-components';
import { IScopeControlHeatmapChartData } from 'config/interfaces/Chaos/scopesControl';

interface IProps {
  data: IScopeControlHeatmapChartData[];
}

const Tooltip = Balloon.Tooltip;

const chartList: FC<IProps> = props => {
  const { data: monthList } = props;

  function renderMonthTitle() {
    switch (monthList[0].month) {
      case 1:
        return i18n.t('January');
      case 2:
        return i18n.t('February');
      case 3:
        return i18n.t('March');
      case 4:
        return i18n.t('April');
      case 5:
        return i18n.t('May');
      case 6:
        return i18n.t('June');
      case 7:
        return i18n.t('July');
      case 8:
        return i18n.t('August');
      case 9:
        return i18n.t('September');
      case 10:
        return i18n.t('October');
      case 11:
        return i18n.t('November');
      default:
        return i18n.t('December');
    }
  }

  function addEmptyContent(number: any) {
    const emptyArr: any = [];
    for (let i = 0; i < number; i++) {
      emptyArr.push({});
    }
    return emptyArr;
  }

  function getMonthDays(year: number, month: number) {
    const date = new Date(year, month, 0);
    return date.getDate();
  }

  function renderList() {
    // beforeDay: 前面有多少空格； 6 - afterDay 后面有多少空格, 当前月除外；
    const { year, month, day: beforeDay } = monthList[0];
    const { day: afterDay } = _.last(monthList)!;
    const beforeArr = addEmptyContent(beforeDay);
    const afterArr = addEmptyContent(6 - afterDay!);
    let newDay: any[] = [];
    if (month !== moment().get('month') + 1) {
      newDay = _.concat(beforeArr, monthList, afterArr);
    } else {
      if (!_.isEmpty(monthList)) {
        const featurArr = addEmptyContent(getMonthDays(year as number, month) - monthList.length);
        newDay = _.concat(beforeArr, monthList, featurArr);
      }
    }
    return newDay;
  }

  function handleTotalStyle(item: IScopeControlHeatmapChartData) {
    const { total } = item;
    if (total > 50) {
      return styles.manyTotal;
    }
    if (total >= 21 && total <= 50) {
      return styles.middleTotal;
    }
    if (total >= 1 && total <= 20) {
      return styles.littleTotal;
    }
    return styles.noTotal;
  }

  function renderTooltip(item: IScopeControlHeatmapChartData) {
    const { date, total } = item;
    return <div className={styles.toolText} key={`${date}${total}`}>
      <div className={styles.toolTitle}>{date}</div>
      <div><Translation>Number of executions</Translation>:{total}</div>
    </div>;
  }

  return (
    <div className={styles.monthChart}>
      <div className={styles.monthTitle}>{renderMonthTitle()}</div>
      <div className={styles.monthContent}>
        <ul className={styles.ulList}>
          {Array.from(renderList()).map((item: IScopeControlHeatmapChartData, idx: number) => {
            if (_.isEmpty(item)) {
              return <div className={styles.emptyContent} key={`${item}${idx}`}></div>;
            }
            return <Tooltip trigger={
              <li key={idx} className={handleTotalStyle(item)}>{ }</li>
            } align="r">
              {renderTooltip(item)}
            </Tooltip>;
          })}
        </ul>
      </div>
    </div>
  );
};
export default chartList;
