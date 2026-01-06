import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect, reducer } from 'utils/libs/sre-utils-dva';
import { getActiveNamespace } from 'utils/libs/sre-utils';
import { getLanguage } from 'utils/util';
import { getRequirePrefix } from 'utils/util';
import {
  ICreateLoadTestDefinitionReq,
  IUpdateLoadTestDefinitionReq,
  IDeleteLoadTestDefinitionReq,
  IGetLoadTestDefinitionReq,
  IQueryLoadTestDefinitionsReq,
  IListAllLoadTestDefinitionsReq,
  ILoadTestDefinition,
  IUploadJmxFileReq,
  IJmxFileUploadResponse,
  ICreateLoadTestStrategyReq,
  IGetLoadTestStrategyByExperimentIdReq,
  IUpdateLoadTestStrategyReq,
  IDeleteLoadTestStrategyReq,
  ILoadTestStrategy,
  ILoadTestTask,
  IGetLoadTestTaskReq,
  IGetLoadTestResultsReq,
  IGetLoadTestMetricsReq,
  IStopLoadTestTaskReq,
  ILoadTestMetrics,
} from 'config/interfaces/Chaos/experimentTask';

interface ILoadTestDefinitionState {
  definitions: ILoadTestDefinition[];
  currentDefinition: ILoadTestDefinition | null;
  total: number;
  loading: boolean;
  strategies: ILoadTestStrategy[];
  currentStrategy: ILoadTestStrategy | null;
  tasks: ILoadTestTask[];
  currentTask: ILoadTestTask | null;
  metrics: ILoadTestMetrics | null;
}

const DEFAULT_STATE: ILoadTestDefinitionState = {
  definitions: [],
  currentDefinition: null,
  total: 0,
  loading: false,
  strategies: [],
  currentStrategy: null,
  tasks: [],
  currentTask: null,
  metrics: null,
};

@dvaModel('loadTestDefinition')
class LoadTestDefinition extends BaseModel {
  state: ILoadTestDefinitionState = DEFAULT_STATE;

  @reducer
  setDefinitions(definitions: ILoadTestDefinition[], total = 0) {
    return {
      ...this.state,
      definitions,
      total,
    };
  }

  @reducer
  setCurrentDefinition(definition: ILoadTestDefinition | null) {
    return {
      ...this.state,
      currentDefinition: definition,
    };
  }

  @reducer
  setLoading(loading: boolean) {
    return {
      ...this.state,
      loading,
    };
  }

  @reducer
  addDefinition(definition: ILoadTestDefinition) {
    return {
      ...this.state,
      definitions: [ definition, ...this.state.definitions ],
      total: this.state.total + 1,
    };
  }

  @reducer
  updateDefinition(updatedDefinition: ILoadTestDefinition) {
    const definitions = this.state.definitions.map(def =>
      (def.id === updatedDefinition.id ? updatedDefinition : def),
    );
    return {
      ...this.state,
      definitions,
      currentDefinition: this.state.currentDefinition?.id === updatedDefinition.id
        ? updatedDefinition
        : this.state.currentDefinition,
    };
  }

  @reducer
  removeDefinition(id: string) {
    const definitions = this.state.definitions.filter(def => def.id !== id);
    return {
      ...this.state,
      definitions,
      total: this.state.total - 1,
      currentDefinition: this.state.currentDefinition?.id === id
        ? null
        : this.state.currentDefinition,
    };
  }

  @reducer
  setStrategies(strategies: ILoadTestStrategy[]) {
    return {
      ...this.state,
      strategies,
    };
  }

  @reducer
  setCurrentStrategy(strategy: ILoadTestStrategy | null) {
    return {
      ...this.state,
      currentStrategy: strategy,
    };
  }

  @reducer
  addStrategy(strategy: ILoadTestStrategy) {
    return {
      ...this.state,
      strategies: [ strategy, ...this.state.strategies ],
    };
  }

  @reducer
  setTasks(tasks: ILoadTestTask[]) {
    return {
      ...this.state,
      tasks,
    };
  }

  @reducer
  setCurrentTask(task: ILoadTestTask | null) {
    return {
      ...this.state,
      currentTask: task,
    };
  }

  @reducer
  setMetrics(metrics: ILoadTestMetrics | null) {
    return {
      ...this.state,
      metrics,
    };
  }

  // API Effects
  @effect()
  *createLoadTestDefinition(payload: ICreateLoadTestDefinitionReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      const { Data } = yield this.effects.call(createServiceChaos('CreateLoadTestDefinition'), payload);
      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to create load test definition:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *updateLoadTestDefinition(payload: IUpdateLoadTestDefinitionReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      const { Data } = yield this.effects.call(createServiceChaos('UpdateLoadTestDefinition'), payload);
      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to update load test definition:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *deleteLoadTestDefinition(payload: IDeleteLoadTestDefinitionReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      // 将参数拼接到URL后面，而不是放在请求体内
      const url = `DeleteLoadTestDefinition?id=${payload.id}&namespace=${payload.Namespace || 'default'}`;
      const { Data } = yield this.effects.call(createServiceChaos(url), {});
      yield this.effects.put(this.removeDefinition(payload.id));
      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to delete load test definition:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *getLoadTestDefinition(payload: IGetLoadTestDefinitionReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      const url = `GetLoadTestDefinition?id=${payload.id}&namespace=${payload.Namespace || 'default'}`;

      const { Data } = yield this.effects.call(createServiceChaos(url), {});
      yield this.effects.put(this.setCurrentDefinition(Data));
      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to get load test definition:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *queryLoadTestDefinitions(payload: IQueryLoadTestDefinitionsReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      const { Data } = yield this.effects.call(createServiceChaos('QueryLoadTestDefinitions'), payload);
      yield this.effects.put(this.setDefinitions(Data.data || [], Data.total || 0));
      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to query load test definitions:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *listAllLoadTestDefinitions(payload: IListAllLoadTestDefinitionsReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));

      // 兼容不同网关返回格式，且防御性处理避免解构 undefined
      const req: any = {
        ...(payload || {}),
        // 兼容大小写 Namespace/NameSpace
        Namespace: (payload as any)?.Namespace || (payload as any)?.NameSpace || getActiveNamespace(),
        Lang: (payload as any)?.Lang || (getLanguage() === 'zh' ? 'zh' : 'en'),
      };

      const resp = yield this.effects.call(createServiceChaos('ListAllLoadTestDefinitions'), req);

      let list: any[] = [];
      if (resp?.Data) {
        list = resp.Data;
      } else if (resp?.result) {
        list = resp.result;
      } else if (Array.isArray(resp)) {
        list = resp;
      } else if (resp?.data) {
        list = resp.data;
      }

      // 兜底
      if (!Array.isArray(list)) {
        list = [];
      }

      yield this.effects.put(this.setDefinitions(list, list.length));
      callback && callback(list);
      return list;
    } catch (error) {
      console.error('Failed to list all load test definitions:', error);
      // 失败时也不要打爆页面，置空状态
      yield this.effects.put(this.setDefinitions([], 0));
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *uploadJmxFile(payload: IUploadJmxFileReq, callback?: (data: IJmxFileUploadResponse) => void) {
    try {
      yield this.effects.put(this.setLoading(true));

      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('endpoint', payload.endpoint);
      // 兼容不同服务端大小写命名空间字段
      const ns = getActiveNamespace();
      formData.append('namespace', ns);
      formData.append('Namespace', ns);
      formData.append('NameSpace', ns);
      formData.append('Lang', getLanguage() === 'zh' ? 'zh' : 'en');

      // 直接使用fetch进行文件上传
      const prefix = getRequirePrefix();
      const response = yield this.effects.call(fetch, `${prefix}/UploadJmxFile`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = yield this.effects.call(response.json.bind(response));

      console.log('Upload API raw response:', data);

      // 统一提取返回的文件信息（兼容 result / Data / 直接对象）
      let result: any = null;
      if (data?.success === true) {
        result = data?.result ?? data?.Data ?? data;
      } else {
        result = data?.result ?? data?.Data ?? (data && typeof data === 'object' ? data : null);
      }

      // 兼容后端返回字符串路径的情况：包装为预期对象结构
      if (typeof result === 'string') {
        result = {
          uploadPath: result,
          accessUrl: result,
          fileName: payload.file?.name,
          originalFileName: payload.file?.name,
          fileType: payload.file?.type,
          fileSize: payload.file?.size,
          uploadTime: Date.now(),
          uploadDate: new Date().toISOString(),
        };
      }

      // 如果看起来是有效的文件响应对象，则返回
      if (result && (result.uploadPath || result.accessUrl || result.fileName || result.originalFileName)) {
        callback && callback(result);
        return result;
      }

      // 到这里说明响应结构不符合预期，给出更可诊断的错误
      console.warn('Unexpected upload response shape:', data);
      throw new Error(data?.message || 'Upload failed');

    } catch (error) {
      console.error('Failed to upload JMX file:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *createLoadTestStrategy(payload: ICreateLoadTestStrategyReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      const { Data } = yield this.effects.call(createServiceChaos('CreateLoadTestStrategy'), payload);

      if (Data) {
        // 创建成功后，可以选择性地添加到本地状态
        const newStrategy: ILoadTestStrategy = {
          id: Data,
          enable: payload.enable,
          definitionId: payload.definitionId,
          experimentId: payload.experimentId,
          startBeforeFaultSec: payload.startBeforeFaultSec,
          trafficDurationSec: payload.trafficDurationSec,
          abortOnLoadFailure: payload.abortOnLoadFailure,
          namespace: payload.NameSpace || 'default',
          createdAt: new Date().toISOString(),
        };
        yield this.effects.put(this.addStrategy(newStrategy));
      }

      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to create load test strategy:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *getLoadTestStrategyByExperimentId(payload: IGetLoadTestStrategyByExperimentIdReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));

      const prefix = getRequirePrefix();
      const response = yield this.effects.call(fetch, `${prefix}/GetLoadTestStrategyByExperimentId?experimentId=${payload.experimentId}&namespace=${getActiveNamespace()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = yield this.effects.call(response.json.bind(response));
      console.log('API Response:', data);

      if (data && data.success) {
        const strategies = data.result ? (Array.isArray(data.result) ? data.result : [ data.result ]) : [];
        yield this.effects.put(this.setStrategies(strategies));
        callback && callback(strategies);
        return strategies;
      }
      console.error('API returned unsuccessful response:', data);
      throw new Error(data?.message || 'Get load test strategies failed');

    } catch (error) {
      console.error('Failed to get load test strategies by experiment id:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *updateLoadTestStrategy(payload: IUpdateLoadTestStrategyReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      const { Data } = yield this.effects.call(createServiceChaos('UpdateLoadTestStrategy'), payload);
      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to update load test strategy:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *deleteLoadTestStrategy(payload: IDeleteLoadTestStrategyReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      const { Data } = yield this.effects.call(createServiceChaos('DeleteLoadTestStrategy'), payload);
      callback && callback(Data);
      return Data;
    } catch (error) {
      console.error('Failed to delete load test strategy:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }

  @effect()
  *getLoadTestTask(payload: IGetLoadTestTaskReq, callback?: (data: any) => void) {
    try {
      // 使用GET请求获取压测任务状态
      const prefix = getRequirePrefix();
      const response = yield this.effects.call(fetch, `${prefix}/GetLoadTestTask?taskId=${payload.taskId}&namespace=${getActiveNamespace()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = yield this.effects.call(response.json.bind(response));

      if (result.success) {
        yield this.effects.put(this.setCurrentTask(result.result));
        callback && callback(result.result);
        return result.result;
      }
      throw new Error(result.message || 'Get load test task failed');

    } catch (error) {
      console.error('Failed to get load test task:', error);
      throw error;
    }
  }

  @effect()
  *getLoadTestResults(payload: IGetLoadTestResultsReq, callback?: (data: any) => void) {
    try {
      // 使用GET请求获取压测结果
      const prefix = getRequirePrefix();
      const response = yield this.effects.call(fetch, `${prefix}/GetLoadTestResults?taskId=${payload.taskId}&namespace=${getActiveNamespace()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = yield this.effects.call(response.json.bind(response));

      if (data.success) {
        callback && callback(data.result);
        return data.result;
      }
      throw new Error(data.success || 'Get load test results failed');

    } catch (error) {
      console.error('Failed to get load test results:', error);
      throw error;
    }
  }

  @effect()
  *getLoadTestMetrics(payload: IGetLoadTestMetricsReq, callback?: (data: any) => void) {
    try {
      // 使用GET方法，参数拼接到URL后面
      const prefix = getRequirePrefix();
      const response = yield this.effects.call(fetch, `${prefix}/performance/${payload.executionId}/series?namespace=${getActiveNamespace()}&Lang=${getLanguage() === 'zh' ? 'zh' : 'en'}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = yield this.effects.call(response.json.bind(response));

      if (result.success) {
        // 根据API返回格式，数据在result.result中
        const metricsData = result.result;
        yield this.effects.put(this.setMetrics(metricsData));
        callback && callback(metricsData);
        return metricsData;
      }
      throw new Error(result.message || 'Get metrics failed');

    } catch (error) {
      console.error('Failed to get load test metrics:', error);
      throw error;
    }
  }


  @effect()
  *stopLoadTestTask(payload: IStopLoadTestTaskReq, callback?: (data: any) => void) {
    try {
      yield this.effects.put(this.setLoading(true));
      // 使用POST请求停止压测任务
      const prefix = getRequirePrefix();
      const response = yield this.effects.call(fetch, `${prefix}/StopLoadTestTask?taskId=${payload.taskId}&namespace=${getActiveNamespace()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace: getActiveNamespace(),
          Lang: getLanguage() === 'zh' ? 'zh' : 'en',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = yield this.effects.call(response.json.bind(response));

      if (result.success) {
        callback && callback(result.result);
        return result.result;
      }
      throw new Error(result.message || 'Stop load test task failed');

    } catch (error) {
      console.error('Failed to stop load test task:', error);
      throw error;
    } finally {
      yield this.effects.put(this.setLoading(false));
    }
  }
}

export default new LoadTestDefinition().model;

declare global {
  interface Actions {
    loadTestDefinition: LoadTestDefinition;
  }
}
