/* Probe Task Proxy Service: calls chaosblade-box-starter proxy endpoints.
 * All endpoints are transparent proxies; handle raw HTTP status and body.
 */

export interface PageQuery { page?: number; size?: number }

export interface SystemItem {
  id: number;
  systemKey?: string;
  name: string;
  description?: string;
  owner?: string;
  defaultEnvironment?: string;
}

export interface ApiItem {
  id: number;
  systemId: number;
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  tags?: string[] | string;
  version?: string;
  baseUrl?: string;
  contentType?: string;
  headersTemplate?: string; // JSON string with placeholders
  authType?: string;
  authTemplate?: string; // JSON string
  pathParams?: string; // JSON string
  queryParams?: string; // JSON string
  bodyTemplate?: string; // JSON string
  variables?: string; // JSON string
}

export interface TopologyResponse {
  success?: boolean;
  data?: {
    topology?: any;
    nodes: Array<{ id: number; topologyId: number; nodeKey: string; name: string; layer: number; protocol: string }>;
    edges?: Array<any>;
  };
}

export interface FaultTypeItem {
  faultTypeId: number;
  faultCode: string;
  name: string;
  description?: string;
  category?: string;
  enabled?: boolean;
  displayOrder?: number;
  paramConfig: string; // JSON string
}

export interface CreateProbeTaskPayload {
  name: string;
  description?: string;
  systemId: number;
  apiId: number;
  createdBy?: string;
  updatedBy?: string;
  faultConfigurations: Array<{
    nodeId: number;
    faultscript: any; // ChaosBlade CRD
  }>;
  taskSlo?: Array<{ node_id: number; p95: number; p99: number; errRate: number }>;
  apiDefinition: {
    code?: string;
    name?: string;
    method: string;
    urlTemplate: string;
    headers?: string; // JSON string
    queryParams?: string; // JSON string
    bodyMode?: string;
    contentType?: string;
    bodyTemplate?: string; // JSON string
    apiId: number;
  };
  requestNum: number;
}

const BASE_PREFIX = ''; // devServer proxies /api -> starter-host

async function handleResponse(res: Response) {
  const text = await res.text();
  // Try JSON first
  let parsed: any;
  try { parsed = text ? JSON.parse(text) : undefined; } catch (_) { /* ignore */ }
  if (!res.ok) {
    const err = new Error(parsed?.message || text || res.statusText);
    (err as any).status = res.status;
    (err as any).body = parsed ?? text;
    throw err;
  }
  return parsed ?? text;
}

const commonHeaders = { Accept: 'application/json' } as const;

export const probeProxy = {
  async getSystems(params: PageQuery = {}) {
    const url = new URL('/chaos/systems', window.location.origin);
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.size) url.searchParams.set('size', String(params.size));
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET',
      headers: commonHeaders,
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async getApis(systemId: number, query: Record<string, any> = {}) {
    const url = new URL(`/chaos/systems/${encodeURIComponent(systemId)}/apis`, window.location.origin);
    Object.entries(query).forEach(([ k, v ]) => v != null && url.searchParams.set(k, String(v)));
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<{ success?: boolean; data?: { items: ApiItem[] } }>;
  },

  async getTopology(apiId: number) {
    const url = new URL(`/chaos/topologies/${encodeURIComponent(apiId)}/topology`, window.location.origin);
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<TopologyResponse>;
  },

  async getFaultTypes() {
    const url = new URL('/chaos/fault-types', window.location.origin);
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<{ success?: boolean; data?: { items: FaultTypeItem[] } }>;
  },

  async createProbeTask(payload: CreateProbeTaskPayload) {
    const url = new URL('/chaos/probe-tasks', window.location.origin);
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...commonHeaders },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Detection Tasks APIs
  async getDetectionTasks(params: { page?: number; size?: number; keyword?: string; status?: string } = {}) {
    const url = new URL('/chaos/detection-tasks', window.location.origin);
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.size) url.searchParams.set('size', String(params.size));
    if (params.keyword) url.searchParams.set('keyword', params.keyword);
    if (params.status) url.searchParams.set('status', params.status);
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<{ success?: boolean; data?: { items: any[]; total: number; page: number; size: number } }>;
  },

  async getDetectionTaskDetails(taskId: number) {
    // Prefer chaos path; if backend exposes non-chaos aggregated endpoint, adjust here as needed
    const url = new URL(`/chaos/detection-tasks/${encodeURIComponent(taskId)}`, window.location.origin);
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<{ success?: boolean; data?: any }>;
  },

  async getTaskExecutions(taskId: number, params: { page?: number; size?: number } = {}) {
    const url = new URL(`/chaos/detection-tasks/${encodeURIComponent(taskId)}/executions`, window.location.origin);
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.size) url.searchParams.set('size', String(params.size));
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<{ success?: boolean; data?: { items: any[]; total: number; page: number; size: number } }>;
  },

  // Execution Proxy APIs with '/chaos' path (consistent with other endpoints)
  async listTaskExecutions(params: { taskId?: number; status?: string; namespace?: string; startDate?: string; endDate?: string; page?: number; size?: number } = {}) {
    const url = new URL('/chaos/task-executions', window.location.origin);
    Object.entries(params).forEach(([ k, v ]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<{ success?: boolean; data?: { items: any[]; total: number; page: number; size: number } }>;
  },

  async getExecutionDetails(executionId: number | string) {
    const url = new URL(`/chaos/task-executions/${encodeURIComponent(executionId)}`, window.location.origin);
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'GET', headers: commonHeaders, credentials: 'include',
    });
    return handleResponse(res) as Promise<{ success?: boolean; data?: any }>;
  },

  async executeTask(taskId: number | string, body: any = { options: { dryRun: false } }) {
    const url = new URL(`/chaos/detection-tasks/${encodeURIComponent(taskId)}/execute`, window.location.origin);
    const res = await fetch(url.toString().replace(window.location.origin, BASE_PREFIX + '/api'), {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...commonHeaders }, credentials: 'include', body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};

export default probeProxy;
