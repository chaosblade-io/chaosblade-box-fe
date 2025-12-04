/**
 * Kubernetes 资源类型定义
 */

// K8s 资源类型
export type K8sResourceType =
  // 基础设施域
  | 'k8s.infra.namespace'
  | 'k8s.infra.node'
  | 'k8s.infra.persistentvolume'
  // 工作负载域
  | 'k8s.workload.deployment'
  | 'k8s.workload.replicaset'
  | 'k8s.workload.statefulset'
  | 'k8s.workload.daemonset'
  | 'k8s.workload.pod'
  // 网络域
  | 'k8s.network.service'
  | 'k8s.network.ingress'
  // 配置域
  | 'k8s.config.configmap'
  | 'k8s.config.secret'
  | 'k8s.config.persistentvolumeclaim';

// K8s 域类型
export type K8sDomain = 
  | 'k8s.infra'
  | 'k8s.workload'
  | 'k8s.network'
  | 'k8s.config';

// Pod 详细信息
export interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  phase: string;
  podIP?: string;
  hostIP?: string;
  nodeName?: string;
  containers: ContainerInfo[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
  creationTimestamp: string;
  restartCount: number;
}

// 容器信息
export interface ContainerInfo {
  name: string;
  image: string;
  ready: boolean;
  restartCount: number;
  state: string;
}

// Deployment 详细信息
export interface DeploymentInfo {
  name: string;
  namespace: string;
  replicas: number;
  availableReplicas: number;
  readyReplicas: number;
  updatedReplicas: number;
  labels: Record<string, string>;
  selector: Record<string, string>;
  strategy: string;
  creationTimestamp: string;
}

// Service 详细信息
export interface ServiceInfo {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIPs?: string[];
  ports: ServicePort[];
  selector: Record<string, string>;
  labels: Record<string, string>;
  creationTimestamp: string;
}

export interface ServicePort {
  name?: string;
  protocol: string;
  port: number;
  targetPort: number | string;
  nodePort?: number;
}

// Ingress 详细信息
export interface IngressInfo {
  name: string;
  namespace: string;
  ingressClassName?: string;
  rules: IngressRule[];
  tls?: IngressTLS[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
  creationTimestamp: string;
}

export interface IngressRule {
  host?: string;
  paths: IngressPath[];
}

export interface IngressPath {
  path: string;
  pathType: string;
  backend: {
    serviceName: string;
    servicePort: number | string;
  };
}

export interface IngressTLS {
  hosts: string[];
  secretName: string;
}

// ConfigMap 详细信息
export interface ConfigMapInfo {
  name: string;
  namespace: string;
  data: Record<string, string>;
  binaryData?: Record<string, string>;
  labels: Record<string, string>;
  creationTimestamp: string;
}

// Secret 详细信息
export interface SecretInfo {
  name: string;
  namespace: string;
  type: string;
  data: Record<string, string>;
  labels: Record<string, string>;
  creationTimestamp: string;
}

// PersistentVolumeClaim 详细信息
export interface PVCInfo {
  name: string;
  namespace: string;
  status: string;
  volumeName?: string;
  storageClassName?: string;
  accessModes: string[];
  capacity?: Record<string, string>;
  labels: Record<string, string>;
  creationTimestamp: string;
}

// Node 详细信息
export interface NodeInfo {
  name: string;
  status: string;
  roles: string[];
  version: string;
  osImage: string;
  kernelVersion: string;
  containerRuntime: string;
  capacity: NodeResources;
  allocatable: NodeResources;
  conditions: NodeCondition[];
  addresses: NodeAddress[];
  labels: Record<string, string>;
  creationTimestamp: string;
}

export interface NodeResources {
  cpu: string;
  memory: string;
  pods: string;
  ephemeralStorage?: string;
}

export interface NodeCondition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime: string;
}

export interface NodeAddress {
  type: string;
  address: string;
}

