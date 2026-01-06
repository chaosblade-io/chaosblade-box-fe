import React, { FC, useState, useMemo } from 'react';
import { Icon } from '@alicloud/console-components';
import { TraceData, SpanData } from '../../types';
import styles from './index.css';

interface TraceWaterfallProps {
  trace: TraceData;
  compact?: boolean; // 紧凑模式（用于内嵌显示）
}

const TraceWaterfall: FC<TraceWaterfallProps> = ({ trace, compact = false }) => {
  // 构建 Span 树结构
  const spanTree = useMemo(() => {
    const spanMap = new Map(trace.spans.map(s => [s.spanId, s]));
    const roots: SpanData[] = [];
    const children = new Map<string, SpanData[]>();

    trace.spans.forEach(span => {
      if (!span.parentSpanId) {
        roots.push(span);
      } else {
        if (!children.has(span.parentSpanId)) {
          children.set(span.parentSpanId, []);
        }
        children.get(span.parentSpanId)!.push(span);
      }
    });

    return { roots, children };
  }, [trace.spans]);

  // 默认展开所有有子节点的 Span
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(() => {
    const allParentSpanIds = new Set<string>();
    trace.spans.forEach(span => {
      if (span.parentSpanId) {
        allParentSpanIds.add(span.parentSpanId);
      }
    });
    return allParentSpanIds;
  });
  const [selectedSpan, setSelectedSpan] = useState<SpanData | null>(null);

  // 切换 Span 展开/折叠
  const toggleSpan = (spanId: string) => {
    setExpandedSpans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spanId)) {
        newSet.delete(spanId);
      } else {
        newSet.add(spanId);
      }
      return newSet;
    });
  };

  // 格式化持续时间
  const formatDuration = (microseconds: number) => {
    const ms = microseconds / 1000;
    if (ms < 1) return `${microseconds.toFixed(0)} μs`;
    if (ms < 1000) return `${ms.toFixed(2)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // 渲染 Span 行
  const renderSpan = (span: SpanData, depth: number): React.ReactNode => {
    const hasChildren = spanTree.children.has(span.spanId);
    const isExpanded = expandedSpans.has(span.spanId);
    const startOffset = span.startTime / 1000; // 转换为毫秒
    const duration = span.duration / 1000; // 转换为毫秒
    const totalDuration = trace.duration;

    // 计算时间线位置和宽度（百分比）
    const leftPercent = (startOffset / totalDuration) * 100;
    const widthPercent = (duration / totalDuration) * 100;

    const isSelected = selectedSpan?.spanId === span.spanId;

    return (
      <React.Fragment key={span.spanId}>
        <div
          className={`${styles.spanRow} ${isSelected ? styles.spanRowSelected : ''}`}
          onClick={() => setSelectedSpan(span)}
        >
          {/* Span 信息 */}
          <div className={styles.spanInfo} style={{ paddingLeft: depth * 20 + 8 }}>
            {hasChildren && (
              <Icon
                type={isExpanded ? 'arrow-down' : 'arrow-right'}
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSpan(span.spanId);
                }}
                style={{ cursor: 'pointer', marginRight: 4 }}
              />
            )}
            {!hasChildren && <span style={{ width: 16, display: 'inline-block' }} />}
            <span className={styles.serviceName}>{span.serviceName}</span>
            <span className={styles.operationName}>{span.operationName}</span>
            <span className={styles.spanKind}>[{span.kind.toUpperCase()}]</span>
          </div>

          {/* 时间线 */}
          <div className={styles.spanTimeline}>
            <div
              className={styles.spanBar}
              style={{
                left: `${leftPercent}%`,
                width: `${Math.max(widthPercent, 0.5)}%`,
                background: span.status === 'error' ? '#EF4444' : '#3B82F6',
              }}
              title={`${span.serviceName} - ${span.operationName}\n${formatDuration(span.duration)}`}
            />
          </div>

          {/* 持续时间 */}
          <div className={styles.spanDuration}>{formatDuration(span.duration)}</div>
        </div>

        {/* 子 Span */}
        {hasChildren && isExpanded && (
          <>
            {spanTree.children.get(span.spanId)!.map(childSpan =>
              renderSpan(childSpan, depth + 1)
            )}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={`${styles.waterfallChart} ${compact ? styles.compact : ''}`}>
      {/* Trace 基本信息 */}
      <div className={styles.traceInfo}>
        <div className={styles.traceInfoItem}>
          <span className={styles.traceInfoLabel}>服务：</span>
          <span>{trace.serviceName}</span>
        </div>
        <div className={styles.traceInfoItem}>
          <span className={styles.traceInfoLabel}>操作：</span>
          <span>{trace.operationName}</span>
        </div>
        <div className={styles.traceInfoItem}>
          <span className={styles.traceInfoLabel}>总时长：</span>
          <span>{formatDuration(trace.duration * 1000)}</span>
        </div>
        <div className={styles.traceInfoItem}>
          <span className={styles.traceInfoLabel}>Span 数量：</span>
          <span>{trace.spanCount}</span>
        </div>
        <div className={styles.traceInfoItem}>
          <span className={styles.traceInfoLabel}>状态：</span>
          <span style={{ color: trace.status === 'success' ? '#10B981' : '#EF4444' }}>
            {trace.status === 'success' ? '成功' : '失败'}
          </span>
        </div>
      </div>

      {/* 时间线标尺 */}
      <div className={styles.timelineRuler}>
        <div className={styles.rulerLabel}>0 ms</div>
        <div className={styles.rulerLabel}>{(trace.duration / 4).toFixed(0)} ms</div>
        <div className={styles.rulerLabel}>{(trace.duration / 2).toFixed(0)} ms</div>
        <div className={styles.rulerLabel}>{((trace.duration * 3) / 4).toFixed(0)} ms</div>
        <div className={styles.rulerLabel}>{trace.duration.toFixed(0)} ms</div>
      </div>

      {/* Span 列表 */}
      <div className={styles.spanList}>
        {spanTree.roots.map(span => renderSpan(span, 0))}
      </div>

      {/* Span 详情面板 */}
      {selectedSpan && !compact && (
        <div className={styles.spanDetailPanel}>
          <div className={styles.spanDetailHeader}>
            <h4>Span 详情</h4>
            <Icon type="close" size="small" onClick={() => setSelectedSpan(null)} style={{ cursor: 'pointer' }} />
          </div>
          <div className={styles.spanDetailContent}>
            {/* 基本信息 */}
            <div className={styles.spanDetailSection}>
              <div className={styles.spanDetailSectionTitle}>基本信息</div>
              <div className={styles.spanDetailRow}>
                <span className={styles.spanDetailLabel}>Span ID:</span>
                <span className={styles.spanDetailValue}>{selectedSpan.spanId}</span>
              </div>
              <div className={styles.spanDetailRow}>
                <span className={styles.spanDetailLabel}>服务:</span>
                <span className={styles.spanDetailValue}>{selectedSpan.serviceName}</span>
              </div>
              <div className={styles.spanDetailRow}>
                <span className={styles.spanDetailLabel}>操作:</span>
                <span className={styles.spanDetailValue}>{selectedSpan.operationName}</span>
              </div>
              <div className={styles.spanDetailRow}>
                <span className={styles.spanDetailLabel}>类型:</span>
                <span className={styles.spanDetailValue}>{selectedSpan.kind.toUpperCase()}</span>
              </div>
              <div className={styles.spanDetailRow}>
                <span className={styles.spanDetailLabel}>状态:</span>
                <span className={styles.spanDetailValue} style={{ color: selectedSpan.status === 'ok' ? '#10B981' : '#EF4444' }}>
                  {selectedSpan.status === 'ok' ? 'OK' : 'ERROR'}
                  {selectedSpan.statusMessage && ` - ${selectedSpan.statusMessage}`}
                </span>
              </div>
            </div>

            {/* Attributes / Tags */}
            {(selectedSpan.attributes || selectedSpan.tags) && (
              <div className={styles.spanDetailSection}>
                <div className={styles.spanDetailSectionTitle}>Attributes</div>
                {Object.entries(selectedSpan.attributes || selectedSpan.tags || {}).map(([key, value]) => (
                  <div key={key} className={styles.spanDetailRow}>
                    <span className={styles.spanDetailLabel}>{key}:</span>
                    <span className={styles.spanDetailValue}>{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Events / Logs */}
            {((selectedSpan.events && selectedSpan.events.length > 0) || (selectedSpan.logs && selectedSpan.logs.length > 0)) && (
              <div className={styles.spanDetailSection}>
                <div className={styles.spanDetailSectionTitle}>Events</div>
                {(selectedSpan.events || selectedSpan.logs || []).map((event: any, index: number) => (
                  <div key={index} className={styles.eventItem}>
                    <div className={styles.eventTime}>
                      {event.name || 'Log'} @ {formatDuration(event.timeUnixNano ? event.timeUnixNano / 1000 : event.timestamp)}
                    </div>
                    {(event.attributes || event.fields) && (
                      <div className={styles.eventFields}>
                        {Object.entries(event.attributes || event.fields || {}).map(([key, value]) => (
                          <div key={key} className={styles.eventField}>
                            <span className={styles.eventFieldKey}>{key}:</span>
                            <span className={styles.eventFieldValue}>{JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TraceWaterfall;

