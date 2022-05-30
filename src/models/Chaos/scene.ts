import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { ISelectData } from 'config/interfaces/Chaos/scene';

interface ISceneState {
  setSelectData: any[];
}

const DEFAULT_STATE: ISceneState = {
  setSelectData: [],
};


@dvaModel('scene')
class Scene extends BaseModel {

  state: ISceneState = DEFAULT_STATE;

  @reducer
  setSelectData(payload: ISelectData[]) {
    const newData: any[] = [];
    if (payload.length) {
      payload.forEach(it => {
        newData.push({
          label: it && it.code,
          value: it && it.functionId,
        });
      });
    }
    return {
      ...this.state,
      setSelectData: [ ...newData ],
    };
  }

  // 获取类目
  @effect()
  *queryCategoryData() {
    return yield this.effects.call(createServiceChaos('QuerySceneFunctionCategories'));
  }

}

export default new Scene().model;

declare global {
  interface Actions {
    scene: Scene;
  }
}
