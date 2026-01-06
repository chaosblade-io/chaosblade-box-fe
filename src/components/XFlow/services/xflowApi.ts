import axios, { AxiosResponse } from 'axios';
import type {
  XFlowData,
  LayoutRequest,
} from '../types/xflow';
import type {
  ApiResponse,
  NodeDetailsResponse,
  XFlowApiService as IXFlowApiService,
} from '../types/api';

/**
 * XFlow API 服务类
 * 负责与后端 XFlow 接口进行通信
 */
class XFlowApiService implements IXFlowApiService {
  private baseURL = '/api/chaos/xflow';

  /**
   * 创建 axios 实例
   */
  private api = axios.create({
    baseURL: this.baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // 添加响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      error => {
        console.error('API 请求失败:', error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 获取拓扑数据
   */
  async getTopology(): Promise<XFlowData> {
    try {
      const response = await this.api.get<XFlowData>('/topology');
      return response.data;
    } catch (error) {
      console.error('获取拓扑数据失败:', error);
      throw new Error('获取拓扑数据失败');
    }
  }

  /**
   * 刷新拓扑数据
   */
  async refreshTopology(): Promise<XFlowData> {
    try {
      const response = await this.api.post<XFlowData>('/refresh');
      return response.data;
    } catch (error) {
      console.error('刷新拓扑数据失败:', error);
      throw new Error('刷新拓扑数据失败');
    }
  }

  /**
   * 获取节点详情
   */
  async getNodeDetails(nodeId: string): Promise<NodeDetailsResponse> {
    try {
      const response = await this.api.get<NodeDetailsResponse>(`/nodes/${nodeId}`);
      return response.data;
    } catch (error) {
      console.error('获取节点详情失败:', error);
      throw new Error(`获取节点详情失败: ${nodeId}`);
    }
  }

  /**
   * 应用布局算法
   */
  async applyLayout(layoutRequest: LayoutRequest): Promise<XFlowData> {
    try {
      const response = await this.api.post<XFlowData>('/layout', layoutRequest);
      return response.data;
    } catch (error) {
      console.error('应用布局算法失败:', error);
      throw new Error('应用布局算法失败');
    }
  }
}

// 创建并导出单例实例
export const xflowApi = new XFlowApiService();
export default xflowApi;
