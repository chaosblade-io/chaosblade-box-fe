import { TraceData, REDMetrics, TraceListFilter } from '../types';

/**
 * Trace 服务 - 用于获取服务的 Trace 数据
 */
class TraceService {
  /**
   * 获取指定服务的 Trace 列表
   */
  async getTracesByService(
    serviceId: string,
    filter: TraceListFilter
  ): Promise<{ traces: TraceData[]; total: number; redMetrics: REDMetrics }> {
    // TODO: 替换为真实的 API 调用
    // const response = await fetch(`/api/chaos/traces?serviceId=${serviceId}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(filter)
    // });
    // return response.json();

    // 模拟数据
    return this.getMockTraces(serviceId, filter);
  }

  /**
   * 获取 Trace 详情
   */
  async getTraceDetail(traceId: string): Promise<TraceData> {
    // TODO: 替换为真实的 API 调用
    // const response = await fetch(`/api/chaos/traces/${traceId}`);
    // return response.json();

    // 模拟数据
    const mockData = await this.getMockTraces('service-1', {
      timeRange: { start: Date.now() - 3600000, end: Date.now() },
    });
    return mockData.traces.find(t => t.traceId === traceId) || mockData.traces[0];
  }

  /**
   * 生成模拟 Trace 数据
   */
  private getMockTraces(
    serviceId: string,
    filter: TraceListFilter
  ): Promise<{ traces: TraceData[]; total: number; redMetrics: REDMetrics }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const traces: TraceData[] = [];
        const traceCount = 20;

        for (let i = 0; i < traceCount; i++) {
          const startTime = Date.now() - Math.random() * 3600000;
          const duration = 50 + Math.random() * 500; // 50-550ms
          const status = Math.random() > 0.1 ? 'success' : 'error';
          const spanCount = 5 + Math.floor(Math.random() * 10);

          traces.push({
            traceId: `trace-${serviceId}-${i}`,
            spanCount,
            duration,
            startTime,
            endTime: startTime + duration,
            serviceName: serviceId,
            operationName: `/api/payment/${i % 3 === 0 ? 'create' : i % 3 === 1 ? 'query' : 'update'}`,
            status,
            spans: this.generateMockSpans(
              `trace-${serviceId}-${i}`,
              spanCount,
              startTime,
              duration,
              status
            ),
          });
        }

        // 计算 RED 指标
        const successTraces = traces.filter(t => t.status === 'success');
        const errorTraces = traces.filter(t => t.status === 'error');
        const durations = traces.map(t => t.duration).sort((a, b) => a - b);

        const redMetrics: REDMetrics = {
          rate: traces.length / 60, // 每秒请求数
          totalRequests: traces.length,
          errorCount: errorTraces.length,
          errorPercentage: (errorTraces.length / traces.length) * 100,
          p50: durations[Math.floor(durations.length * 0.5)],
          p95: durations[Math.floor(durations.length * 0.95)],
          p99: durations[Math.floor(durations.length * 0.99)],
          avg: durations.reduce((a, b) => a + b, 0) / durations.length,
          max: Math.max(...durations),
          min: Math.min(...durations),
        };

        resolve({
          traces,
          total: traces.length,
          redMetrics,
        });
      }, 300);
    });
  }

  /**
   * 生成模拟 Span 数据
   */
  private generateMockSpans(
    traceId: string,
    count: number,
    traceStartTime: number,
    traceDuration: number,
    traceStatus: 'success' | 'error'
  ) {
    const spans = [];
    const services = ['gateway', 'payment-service', 'order-service', 'user-service', 'database'];
    
    let currentTime = 0;
    let parentSpanId: string | undefined = undefined;

    for (let i = 0; i < count; i++) {
      const spanId = `span-${i}`;
      const serviceName = services[i % services.length];
      const duration = (traceDuration / count) * (0.8 + Math.random() * 0.4);
      const status = i === count - 1 && traceStatus === 'error' ? 'error' : 'ok';

      spans.push({
        spanId,
        traceId,
        parentSpanId: i === 0 ? undefined : parentSpanId,
        operationName: `${serviceName}.process`,
        serviceName,
        startTime: currentTime * 1000, // 转换为微秒
        duration: duration * 1000, // 转换为微秒
        tags: {
          'http.method': 'POST',
          'http.status_code': status === 'error' ? 500 : 200,
          'span.kind': i === 0 ? 'server' : 'client',
        },
        logs: [],
        status,
        kind: (i === 0 ? 'server' : 'client') as any,
      });

      currentTime += duration;
      if (i % 2 === 0) {
        parentSpanId = spanId;
      }
    }

    return spans;
  }
}

export const traceService = new TraceService();

