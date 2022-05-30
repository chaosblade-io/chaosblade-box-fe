import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';
import { ISearchEditor } from 'config/interfaces/Chaos/functionParameter';

interface IFunctionParameterState {
  loading: boolean;
  functionParameters: any[];
}

const DEFAULT_STATE: IFunctionParameterState = {
  loading: false,
  functionParameters: [],
};

@dvaModel('functionParameters')
class FunctionParameters extends BaseModel {

  state: IFunctionParameterState = DEFAULT_STATE;


  @effect()
  *getSearchOPtions(url: string, payload: ISearchEditor, callback: (Data: string[]) => void) {
    const { Data } = yield this.effects.call(createServiceChaos(url), payload);
    callback && callback(Data);
  }

  // @effect()
  // *getFunctionParameters(payload: IFunctionId) {
  //   const { Data } = yield this.effects.call(createServiceChaos('QuerySceneFunctionParameters'), payload);
  //   yield this.effects.put(this.setFunctionParameters(payload, Data));
  // }

}

export default new FunctionParameters().model;

declare global {
  interface Actions {
    functionParameters: FunctionParameters;
  }
}
