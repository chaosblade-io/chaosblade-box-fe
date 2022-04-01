import produce from 'immer';
import { AnyAction, EffectOptions, EffectsCommandMap } from './types';
import { EFFECTS, MODEL, NAMESPACE, REDUCERS, STATE, SUBSCRIPTIONS } from './symbol';
import { modelsContainer } from './container';

const dvaModel = (namespace: string) => (target: any) => {
  const tmpInstance = new target();
  const { state } = tmpInstance;

  modelsContainer.set(namespace, tmpInstance);
  Reflect.defineMetadata(NAMESPACE, namespace, target.prototype);
  Reflect.defineMetadata(STATE, state, target.prototype);

  const reducers = Reflect.getMetadata(REDUCERS, target.prototype);
  const effects = Reflect.getMetadata(EFFECTS, target.prototype);
  const subscriptions = Reflect.getMetadata(SUBSCRIPTIONS, target.prototype);

  const model = {
    namespace,
    state,
    reducers,
    effects,
    subscriptions,
  };
  Reflect.defineMetadata(MODEL, model, target.prototype);
};

const effect = (effectOptions?: EffectOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const func = function *(action: AnyAction, effects: EffectsCommandMap) {
      const namespace = action.type.split('/')[0];
      const currentThis = modelsContainer.get(namespace);
      currentThis.effects = effects;
      return yield* descriptor.value.apply(currentThis, action.payload);
    };

    if (!Reflect.getMetadata(EFFECTS, target)) {
      Reflect.defineMetadata(EFFECTS, {}, target);
    }
    const effects = Reflect.getMetadata(EFFECTS, target);
    effects[propertyKey] = effectOptions ? [ func, effectOptions ] : func;

    return {
      ...descriptor,
      value(...args: any[]) {
        if (args?.length && args[args.length - 1]?.withNameSpace) {
          const namespace = Reflect.getMetadata(NAMESPACE, target) ?? '';
          args.pop();
          return {
            type: `${namespace}/${propertyKey}`,
            payload: args,
          } as any;
        }
        return {
          type: `${propertyKey}`,
          payload: args,
        } as any;
      },
    };
  };
};

const subscription = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  if (!Reflect.hasMetadata(SUBSCRIPTIONS, target)) {
    Reflect.defineMetadata(SUBSCRIPTIONS, {}, target);
  }
  const subscriptions = Reflect.getMetadata(SUBSCRIPTIONS, target);
  subscriptions[propertyKey] = (...args: any[]) => {
    const namespace = Reflect.getMetadata(NAMESPACE, target);
    const currentThis = modelsContainer.get(namespace);
    const result = descriptor.value.apply(currentThis, args);
    return result;
  };
  return descriptor;
};

const reducer = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

  const func = (state: any, action: AnyAction) => {
    const namespace = action.type.split('/')[0];
    const currentThis = modelsContainer.get(namespace);
    currentThis[STATE] = state;
    const newState = descriptor.value.apply(currentThis, action.payload);
    currentThis[STATE] = newState;
    return newState;
  };

  if (!Reflect.getMetadata(REDUCERS, target)) {
    Reflect.defineMetadata(REDUCERS, {}, target);
  }
  const reducers = Reflect.getMetadata(REDUCERS, target);
  reducers[propertyKey] = func;

  return {
    ...descriptor,
    value(...args: any[]) {

      if (args?.length && args[args.length - 1]?.withNameSpace) {
        const namespace = Reflect.getMetadata(NAMESPACE, target) ?? '';
        args.pop();
        return {
          type: `${namespace}/${propertyKey}`,
          payload: args,
        } as any;
      }
      return {
        type: `${propertyKey}`,
        payload: args,
      } as any;
    },
  };
};

const reducerImmer = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

  const func = (state: any, action: AnyAction) => {
    const namespace = action.type.split('/')[0];
    const currentThis = modelsContainer.get(namespace);
    const nextState = produce(state, (draft: any) => {
      currentThis[STATE] = draft;
      const res = descriptor.value.apply(currentThis, action.payload);
      if (res) {
        return res;
      }
    });
    currentThis[STATE] = nextState;
    return nextState;
  };

  if (!Reflect.getMetadata(REDUCERS, target)) {
    Reflect.defineMetadata(REDUCERS, {}, target);
  }
  const reducers = Reflect.getMetadata(REDUCERS, target);
  reducers[propertyKey] = func;

  return {
    ...descriptor,
    value(...args: any[]) {
      if (args?.length && args[args.length - 1]?.withNameSpace) {
        const namespace = Reflect.getMetadata(NAMESPACE, target) ?? '';
        args.pop();
        return {
          type: `${namespace}/${propertyKey}`,
          payload: args,
        } as any;
      }
      return {
        type: `${propertyKey}`,
        payload: args,
      } as any;
    },
  };
};

export {
  dvaModel,
  effect,
  subscription,
  reducer,
  reducerImmer,
};
