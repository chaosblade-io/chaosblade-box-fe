import MiniFlow from 'pages/Chaos/common/MiniFlow';
import React from 'react';
import * as _ from 'lodash';
import { IActivity, IExperimentTask } from 'config/interfaces/Chaos/experimentTask';
import { TASK } from 'config/constants/Chaos/Node';

interface TaskFlowProps{
  data: IExperimentTask;
  selectNode: IActivity;
  onActivitedClick: (node: IActivity) => void;
  onTryAgain: (node: IActivity, callBack: (res: any) => void) => void;
  onCheck: (checked: boolean, node: IActivity, callBack: (res: any) => void) => void;
  permission?: number;
}

export default function TaskFlow(props: TaskFlowProps) {

  function handleDecorateNodes(activities: IActivity[]) {
    let stage: string;
    if (!_.isEmpty(activities)) {
      _.map(activities, (activity: IActivity) => {
        if (activity.phase === 'PREPARE') {
          stage = 'prepare';
        } else if (activity.phase === 'ATTACK') {
          stage = 'attack';
        } else if (activity.phase === 'CHECK') {
          stage = 'check';
        } else if (activity.phase === 'RECOVER') {
          stage = 'recover';
        }
        activity.stage = stage;
        activity.id = activity.activityId;
        activity.nodeType = TASK;
      });
      return activities;
    }
    return [];
  }

  const { data, onActivitedClick, onTryAgain, selectNode, onCheck } = props;
  const activities = _.get(data, 'activities', []);
  return <MiniFlow
    editable={false}
    nodes={handleDecorateNodes(activities)}
    selectedNode={selectNode!}
    onNodeClick={onActivitedClick as any}
    onTryAgain={onTryAgain}
    running={true}
    onCheck={onCheck}
    permission={props.permission}
  />;
}
