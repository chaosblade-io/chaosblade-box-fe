import createService from 'utils/createService';
import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { ILoginUserState } from 'config/interfaces/Chaos/context';

const DEFAULT_STATE: ILoginUserState = {
  userId: null,
  isAdmin: false,
};

@dvaModel('loginUser')
class LoginUser extends BaseModel {

  state: ILoginUserState = DEFAULT_STATE;

  @reducer
  setLoginUser(payload: ILoginUserState) {
    return {
      ...payload,
    };
  }
  @effect()
  *getLoginUser() {
    // const res = yield this.effects.call(createServiceChaos('LoginUserInfo'));
    const res = JSON.parse('{"code":200,"Data":{"admin":false,"aliAccount":false,"betaFlag":0,"currentUserId":"259399978","grayEnable":false,"hacker":false,"mainUser":"259399978","mfaPresent":false,"secureTransport":false,"stsNoLogin":false,"stsUser":false,"subUser":false,"userId":"259399978","userName":"camix"},"success":true}');
    const { code, Data = {} } = res || {};
    if (code === 200) {
      yield this.effects.put(this.setLoginUser(Data));
    }
    return Data;
  }

  @effect()
  *onLogin(payload) {
    // const res: any = yield this.effects.call(createService('UserLogin'), payload);
    console.log(payload);
    const res = JSON.parse('{"code":200,"Data":{"id":1,"userId":"259399978","userName":"camix"},"success":true}');
    const { code, Data = {} } = res || {};
    if (code === 200) {
      yield this.effects.put(this.setLoginUser(Data));
      return Data;
    }
    return null;
  }
  @effect()
  *onLoginout() {
    const res = yield this.effects.call(createServiceChaos('UserLoginout'));
    const { code } = res || {};
    if (code === 200) {
      yield this.effects.put(this.setLoginUser({} as any));
    }
    return code === 200;
  }
  @effect()
  *onRegister(payload) {
    const res: any = yield this.effects.call(createService('UserRegister'), payload);
    const { code } = res || {};
    return code === 200;
  }
}

export default new LoginUser().model;

declare global {
  interface Actions {
    loginUser: LoginUser;
  }
}
