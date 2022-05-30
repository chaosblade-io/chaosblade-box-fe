import React, { Fragment, useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import formatDate from 'pages/Chaos/lib/DateUtil';
import moment from 'moment';
import styles from './index.css';
import { ExperimentConstants } from 'config/constants/Chaos/ExperimentConstants';
import { IExperimentTask } from 'config/interfaces/Chaos/experimentTask';
import { Progress, Tag } from '@alicloud/console-components';

const { Group: TagGroup } = Tag;
interface TaskBasicProps {
  data: IExperimentTask;
  scheduler: any;
}

let timer: NodeJS.Timeout;

export default function TaskBasic(props: TaskBasicProps) {

  const [ duration, setDuration ] = useState<any>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    timer = setInterval(() => {
      const duration = getTaskDuration();
      setDuration(duration);
    }, 1000);
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [ duration ]);

  function getTaskDuration() {
    const { data } = props;

    if (!_.isEmpty(data)) {
      const startTime = _.get(data, 'startTime', '');
      const endTime = _.get(data, 'endTime', new Date().getTime());

      const start = moment(startTime);
      const end = moment(endTime);

      const duration = moment.duration(end.diff(start));

      const days = _.floor(duration.as('days'));
      const hours = _.floor(duration.as('hours'));
      const minutes = _.floor(duration.as('minutes'));
      const seconds = _.floor(duration.as('seconds'));

      return {
        days,
        hours: hours - days * 24,
        minutes: minutes - hours * 60,
        seconds: seconds - minutes * 60,
      };
    }

    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  function renderDuration() {
    return (
      <span>
        {
          duration.days > 0
            ? (
              <Fragment>
                <span>{duration.days}</span>
                <span>days</span>
              </Fragment>
            ) : ''
        }
        {
          duration.hours > 0
            ? (
              <Fragment>
                <span>{duration.hours}</span>
                <span>hours</span>
              </Fragment>
            ) : ''
        }
        {
          duration.minutes > 0
            ? (
              <Fragment>
                <span>{duration.minutes}</span>
                <span>mins</span>
              </Fragment>
            ) : ''
        }
        <span>{duration.seconds}</span>
        <span>s</span>
      </span>
    );
  }

  function getStateCount() {
    const { data } = props;

    if (!_.isEmpty(data)) {
      const activitiesData = _.get(data, 'activities', []);
      const activities = _.map(activitiesData, (activity: any) => {
        if (_.lowerCase(activity.phase) !== 'check' && activity.runResult === ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED) {
          return {
            ...activity,
            runResult: ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR,
          };
        }
        return activity;
      });
      const running = _.filter(activities, (activity: any) => activity.state === 'RUNNING');
      const groupByResult = _.groupBy(activities, 'runResult');

      const success = _.size(groupByResult[ ExperimentConstants.EXPERIMENT_TASK_RESULT_SUCCESS ]);
      const failed = _.size(groupByResult[ ExperimentConstants.EXPERIMENT_TASK_RESULT_FAILED ]);
      const error = _.size(groupByResult[ ExperimentConstants.EXPERIMENT_TASK_RESULT_ERROR ]);
      const rejected = _.size(groupByResult[ ExperimentConstants.EXPERIMENT_TASK_RESULT_REJECTED ]);
      const stopped = _.size(groupByResult[ ExperimentConstants.EXPERIMENT_TASK_RESULT_STOPPED ]);

      return {
        success,
        failed: failed + stopped,
        error,
        wait: _.size(activities) - success - failed - error - rejected - stopped - _.size(running),
      };
    }

    return {
      success: 0,
      failed: 0,
      error: 0,
      wait: 0,
    };
  }

  const { data, scheduler } = props;
  const activities = _.get(data, 'activities', []);
  const progressNum = _.groupBy(activities, 'state').FINISHED;
  const progressBarWidth = (progressNum && progressNum.length) / (activities && activities.length) || 0;
  const stateCount = getStateCount();
  const schedulerConfig = !_.isNil(scheduler) && scheduler.schedulerConfig;
  const cronExpression = _.get(schedulerConfig, 'cronExpression', '');

  return <div className={styles.basicContent}>
    <div className={styles.title}><Translation>Basic Information</Translation></div>
    {cronExpression && <div className={styles.basicItem}>
      <div className={styles.label}><Translation>Timed operation</Translation></div>
      <div className={styles.value}>{cronExpression}</div>
    </div>}
    <div className={styles.basicItem}>
      <div className={styles.label}><Translation>Start time</Translation></div>
      <div className={styles.value}>{formatDate(data && data.startTime)}</div>
    </div>
    {data && data.endTime && <div className={styles.basicItem}>
      <div className={styles.label}><Translation>End Time</Translation></div>
      <div className={styles.value}>{formatDate(data && data.endTime)}</div>
    </div>}
    <div className={styles.basicItem}>
      <div className={styles.label}><Translation>Drill time</Translation></div>
      <div className={styles.value}>{renderDuration()}</div>
    </div>
    <div className={styles.basicItem}>
      <div className={styles.label}><Translation>Exercise progress</Translation></div>
      <div className={styles.value}>
        <Progress percent={progressBarWidth * 100}/>
      </div>
    </div>
    <div className={styles.basicItem}>
      <div className={styles.label}><Translation>Exercise results</Translation></div>
      <div className={styles.value}>
        <TagGroup>
          <Tag type="normal" size="small">
            <span><Translation>Run successfully</Translation>: <span style={{ color: '#1E8E3E' }}>{stateCount.success}</span></span>
          </Tag>
          <Tag type="normal" size="small">
            <span><Translation>Not as expected</Translation>: <span style={{ color: '#f69b00' }}>{stateCount.failed}</span></span>
          </Tag>
          <Tag type="normal" size="small">
            <span><Translation>Abnormal</Translation>: <span style={{ color: '#d93027' }}>{stateCount.error}</span></span>
          </Tag>
          <Tag type="normal" size="small">
            <span style={{ color: '#151515' }}><Translation>Wait to run</Translation>: {stateCount.wait >= 0 ? stateCount.wait : 0}</span>
          </Tag>
        </TagGroup>
      </div>
    </div>
  </div>;
}
