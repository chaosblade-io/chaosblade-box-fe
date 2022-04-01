// import createService from 'utils/createService';
import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { IMigrationState } from 'config/interfaces/Chaos/migration';

const DEFAULT_STATE: IMigrationState = {
  finishInfo: null,
};

@dvaModel('migration')
class Migration extends BaseModel {

  state: IMigrationState = DEFAULT_STATE;

  @reducer
  changeState(payload: IMigrationState) {
    return {
      ...payload,
    };
  }
  @effect()
  *getMigrationConf() {
    const res = yield this.effects.call(createServiceChaos('GetMigrationConfiguration'));
    const { Data = false } = res || {};
    return Data;
  }
  @effect()
  *checkCloudAccount(payload) {
    const res = yield this.effects.call(createServiceChaos('CheckCloudAccount'), payload);
    const { Data = false } = res || {};
    return Data;
  }
  @effect()
  *checkDbAccount(payload) {
    const res = yield this.effects.call(createServiceChaos('CheckDbAccount'), payload);
    const { Data = false } = res || {};
    return Data;
  }
  @effect()
  *saveMigrationConf(payload) {
    const res = yield this.effects.call(createServiceChaos('SaveMigrationConfiguration'), payload);
    const { Data = false } = res || {};
    return Data;
  }
  @effect()
  *startMigration(payload) {
    const res = yield this.effects.call(createServiceChaos('StartMigration'), payload);
    const { Data = false } = res || {};
    return Data;
  }
  @effect()
  *queryMigrationResult(payload) {
    const res = yield this.effects.call(createServiceChaos('QueryMigrationResult'), payload);
    const { Data = false } = res || {};
    return Data;
  }
}

export default new Migration().model;

declare global {
  interface Actions {
    migration: Migration;
  }
}
