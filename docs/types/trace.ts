/**
 * Trace 相关类型定义
 * 参考 OpenTelemetry 和 Jaeger 的数据模型
 */

export interface Trace {
  traceId: string;
  spanCount: number;
  duration: number; // 微秒
  startTime: number; // 时间戳（毫秒）
  endTime: number;
  serviceName: string;
  operationName: string;
  status: 'success' | 'error';
  spans: Span[];
}

export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: number; // 微秒
  duration: number; // 微秒
  tags: Record<string, any>;
  logs: SpanLog[];
  status: 'ok' | 'error';
  kind: 'client' | 'server' | 'producer' | 'consumer' | 'internal';
}

export interface SpanLog {
  timestamp: number; // 微秒
  fields: Record<string, any>;
}

export interface REDMetrics {
  // Rate - 请求速率
  rate: {
    total: number; // 总请求数
    rps: number; // 每秒请求数
  };
  
  // Errors - 错误率
  errors: {
    total: number; // 错误总数
    percentage: number; // 错误百分比
  };
  
  // Duration - 延迟分布
  duration: {
    p50: number; // 中位数（毫秒）
    p95: number; // 95分位数（毫秒）
    p99: number; // 99分位数（毫秒）
    avg: number; // 平均值（毫秒）
    max: number; // 最大值（毫秒）
    min: number; // 最小值（毫秒）
  };
}

export interface TraceListFilter {
  timeRange: {
    start: number;
    end: number;
  };
  serviceName?: string;
  operationName?: string;
  minDuration?: number; // 微秒
  maxDuration?: number; // 微秒
  status?: 'success' | 'error' | 'all';
  tags?: Record<string, string>;
}

export interface TraceListResponse {
  traces: Trace[];
  total: number;
  redMetrics: REDMetrics;
}

export interface ServiceDependency {
  parent: string;
  child: string;
  callCount: number;
}

