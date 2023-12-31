import agentSetting from './Manage/AgentSetting';
import agentTools from './Manage/AgentSetting/tools';
import application from './Chaos/application';
import archIndex from './Chaos/overview';
import category from './Chaos/category';
import experimentDataSource from './Chaos/experimentDataSource';
import experimentDetail from './Chaos/experimentDetail';
import experimentEditor from './Chaos/experimentEditor';
import experimentList from './Chaos/experimentList';
import experimentScene from './Chaos/experimentScene';
import experimentTask from './Chaos/experimentTask';
import expertiseEditor from './Chaos/expertiseEditor';
import expertises from './Chaos/expertises';
import functionParameters from './Chaos/functionParameter';
import homeModel from './home';
import loginUser from './Chaos/loginUser';
import pageHeader from './pageHeader';
import scene from './Chaos/scene';
import scopesControl from './Chaos/scopesControl';
import workspace from './Chaos/workspace';

const models = [
  pageHeader,
  homeModel,
  archIndex,
  agentSetting,
  experimentList,
  experimentEditor,
  experimentDetail,
  experimentDataSource,
  experimentScene,
  loginUser,
  expertises,
  expertiseEditor,
  functionParameters,
  application,
  scopesControl,
  experimentTask,
  scene,
  workspace,
  category,
  agentTools,
];

export default models;
