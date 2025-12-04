
/**
 * Mock 数据生成器
 */
function getMockGraphData(): GraphData {
  console.log('getMockGraphData: Starting to generate mock data');

  const nodes: MicroGraphNode[] = [
    // Namespace
    {
      id: 'k8s.infra.namespace/default',
      type: 'k8s.infra.namespace',
      domain: 'k8s.infra',
      name: 'default',
      namespace: 'default',
      labels: {},
      properties: {},
      status: 'running'
    },
    // Deployment
    {
      id: 'k8s.workload.deployment/default/nginx-deployment',
      type: 'k8s.workload.deployment',
      domain: 'k8s.workload',
      name: 'nginx-deployment',
      namespace: 'default',
      labels: { app: 'nginx' },
      properties: { replicas: 3 },
      status: 'running'
    },
    // ReplicaSet
    {
      id: 'k8s.workload.replicaset/default/nginx-rs-abc',
      type: 'k8s.workload.replicaset',
      domain: 'k8s.workload',
      name: 'nginx-rs-abc',
      namespace: 'default',
      labels: { app: 'nginx' },
      properties: { replicas: 3 },
      status: 'running'
    },
    // Pods
    {
      id: 'k8s.workload.pod/default/nginx-pod-1',
      type: 'k8s.workload.pod',
      domain: 'k8s.workload',
      name: 'nginx-pod-1',
      namespace: 'default',
      labels: { app: 'nginx' },
      properties: { phase: 'Running' },
      status: 'running'
    },
    {
      id: 'k8s.workload.pod/default/nginx-pod-2',
      type: 'k8s.workload.pod',
      domain: 'k8s.workload',
      name: 'nginx-pod-2',
      namespace: 'default',
      labels: { app: 'nginx' },
      properties: { phase: 'Running' },
      status: 'running'
    },
    {
      id: 'k8s.workload.pod/default/nginx-pod-3',
      type: 'k8s.workload.pod',
      domain: 'k8s.workload',
      name: 'nginx-pod-3',
      namespace: 'default',
      labels: { app: 'nginx' },
      properties: { phase: 'Running' },
      status: 'warning'
    },
    // Services
    {
      id: 'k8s.network.service/default/frontend-service',
      type: 'k8s.network.service',
      domain: 'k8s.network',
      name: 'frontend-service',
      namespace: 'default',
      labels: { app: 'frontend', tier: 'web' },
      properties: { type: 'LoadBalancer', clusterIP: '10.96.0.10', port: 80 },
      status: 'running'
    },
    {
      id: 'k8s.network.service/default/backend-service',
      type: 'k8s.network.service',
      domain: 'k8s.network',
      name: 'backend-service',
      namespace: 'default',
      labels: { app: 'backend', tier: 'api' },
      properties: { type: 'ClusterIP', clusterIP: '10.96.0.20', port: 8080 },
      status: 'running'
    },
    {
      id: 'k8s.network.service/default/database-service',
      type: 'k8s.network.service',
      domain: 'k8s.network',
      name: 'database-service',
      namespace: 'default',
      labels: { app: 'database', tier: 'data' },
      properties: { type: 'ClusterIP', clusterIP: '10.96.0.30', port: 5432 },
      status: 'running'
    },
    {
      id: 'k8s.network.service/default/cache-service',
      type: 'k8s.network.service',
      domain: 'k8s.network',
      name: 'cache-service',
      namespace: 'default',
      labels: { app: 'redis', tier: 'cache' },
      properties: { type: 'ClusterIP', clusterIP: '10.96.0.40', port: 6379 },
      status: 'running'
    },
    // Ingress
    {
      id: 'k8s.network.ingress/default/nginx-ingress',
      type: 'k8s.network.ingress',
      domain: 'k8s.network',
      name: 'nginx-ingress',
      namespace: 'default',
      labels: {},
      properties: { host: 'nginx.example.com' },
      status: 'running'
    },
    // ConfigMap
    {
      id: 'k8s.config.configmap/default/nginx-config',
      type: 'k8s.config.configmap',
      domain: 'k8s.config',
      name: 'nginx-config',
      namespace: 'default',
      labels: {},
      properties: {},
      status: 'running'
    },
    // Node
    {
      id: 'k8s.infra.node/node-1',
      type: 'k8s.infra.node',
      domain: 'k8s.infra',
      name: 'node-1',
      labels: { role: 'worker' },
      properties: { capacity: { cpu: '4', memory: '16Gi' } },
      status: 'running'
    }
  ];

  const edges: MicroGraphEdge[] = [
    // Namespace contains Deployment
    {
      id: 'edge-1',
      type: 'contains',
      source: 'k8s.infra.namespace/default',
      target: 'k8s.workload.deployment/default/nginx-deployment',
      properties: {}
    },
    // Deployment manages ReplicaSet
    {
      id: 'edge-2',
      type: 'manages',
      source: 'k8s.workload.deployment/default/nginx-deployment',
      target: 'k8s.workload.replicaset/default/nginx-rs-abc',
      properties: {}
    },
    // ReplicaSet creates Pods
    {
      id: 'edge-3',
      type: 'creates',
      source: 'k8s.workload.replicaset/default/nginx-rs-abc',
      target: 'k8s.workload.pod/default/nginx-pod-1',
      properties: {}
    },
    {
      id: 'edge-4',
      type: 'creates',
      source: 'k8s.workload.replicaset/default/nginx-rs-abc',
      target: 'k8s.workload.pod/default/nginx-pod-2',
      properties: {}
    },
    {
      id: 'edge-5',
      type: 'creates',
      source: 'k8s.workload.replicaset/default/nginx-rs-abc',
      target: 'k8s.workload.pod/default/nginx-pod-3',
      properties: {}
    },
    // Frontend Service selects Pods
    {
      id: 'edge-6',
      type: 'selects',
      source: 'k8s.network.service/default/frontend-service',
      target: 'k8s.workload.pod/default/nginx-pod-1',
      properties: {}
    },
    {
      id: 'edge-7',
      type: 'selects',
      source: 'k8s.network.service/default/frontend-service',
      target: 'k8s.workload.pod/default/nginx-pod-2',
      properties: {}
    },
    {
      id: 'edge-8',
      type: 'selects',
      source: 'k8s.network.service/default/frontend-service',
      target: 'k8s.workload.pod/default/nginx-pod-3',
      properties: {}
    },
    // Ingress routes to Frontend Service
    {
      id: 'edge-9',
      type: 'routes_to',
      source: 'k8s.network.ingress/default/nginx-ingress',
      target: 'k8s.network.service/default/frontend-service',
      properties: {}
    },
    // Service 调用关系链
    {
      id: 'edge-13',
      type: 'calls',
      source: 'k8s.network.service/default/frontend-service',
      target: 'k8s.network.service/default/backend-service',
      properties: { protocol: 'HTTP', port: 8080 }
    },
    {
      id: 'edge-14',
      type: 'calls',
      source: 'k8s.network.service/default/backend-service',
      target: 'k8s.network.service/default/database-service',
      properties: { protocol: 'PostgreSQL', port: 5432 }
    },
    {
      id: 'edge-15',
      type: 'calls',
      source: 'k8s.network.service/default/backend-service',
      target: 'k8s.network.service/default/cache-service',
      properties: { protocol: 'Redis', port: 6379 }
    },
    // Pods run on Node
    {
      id: 'edge-10',
      type: 'runs_on',
      source: 'k8s.workload.pod/default/nginx-pod-1',
      target: 'k8s.infra.node/node-1',
      properties: {}
    },
    {
      id: 'edge-11',
      type: 'runs_on',
      source: 'k8s.workload.pod/default/nginx-pod-2',
      target: 'k8s.infra.node/node-1',
      properties: {}
    },
    // Pod mounts ConfigMap
    {
      id: 'edge-12',
      type: 'mounts',
      source: 'k8s.workload.pod/default/nginx-pod-1',
      target: 'k8s.config.configmap/default/nginx-config',
      properties: {}
    }
  ];

  const result = {
    nodes,
    edges,
    domains: [
      {
        key: 'k8s.infra',
        name: '基础设施',
        color: '#3B82F6',
        icon: '🏗️',
        entityCount: 2
      },
      {
        key: 'k8s.workload',
        name: '工作负载',
        color: '#10B981',
        icon: '⚙️',
        entityCount: 5
      },
      {
        key: 'k8s.network',
        name: '网络',
        color: '#8B5CF6',
        icon: '🌐',
        entityCount: 5
      },
      {
        key: 'k8s.config',
        name: '配置',
        color: '#F59E0B',
        icon: '⚙️',
        entityCount: 1
      }
    ]
  };

  console.log('getMockGraphData: Returning data', {
    nodeCount: result.nodes.length,
    edgeCount: result.edges.length
  });

  return result;
}

