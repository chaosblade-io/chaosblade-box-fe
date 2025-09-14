import React, { FC, useMemo, useState } from 'react';
import Translation from 'components/Translation';
import i18n from '../../../../../i18n';
import styles from '../index.css';
import { Table, Button, Icon, Dialog, Pagination } from '@alicloud/console-components';

export interface TestCaseItem {
  id: number;
  taskId: number;
  caseType: string;
  targetCount: number;
  faultsJson: string; // stringified JSON array
  createdAt: string;
  executionId: number;
  p50: number; // ms
  p95: number; // ms
  p99: number; // ms
  errRate: number; // %
}

interface ParsedFault {
  serviceName?: string;
  scope?: string;
  action?: string;
}

interface TestCasesResultsProps {
  testCases: TestCaseItem[];
  onExport: (format: 'HTML' | 'CSV' | 'JSON') => void;
}

const TestCasesResults: FC<TestCasesResultsProps> = ({ testCases, onExport }) => {
  const [ visible, setVisible ] = useState(false);
  const [ currentCaseId, setCurrentCaseId ] = useState<number | null>(null);
  const [ faultsByCase, setFaultsByCase ] = useState<Record<number, ParsedFault[]>>({});

  // 前端分页状态
  const [ page, setPage ] = useState(1);
  const [ pageSize, setPageSize ] = useState(10);

  const dataSource = useMemo(() => testCases || [], [ testCases ]);
  const total = dataSource.length;
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return dataSource.slice(start, start + pageSize);
  }, [ dataSource, page, pageSize ]);

  const parseFaults = (faultsJson: string): ParsedFault[] => {
    try {
      const arr = JSON.parse(faultsJson);
      if (Array.isArray(arr)) {
        return arr.map((item: any) => {
          const serviceName = item?.serviceName || item?.spec?.serviceName;
          const exp = item?.faultDefinition?.spec?.experiments?.[0];
          const scope = exp?.scope || exp?.target;
          const action = exp?.action;
          return { serviceName, scope, action };
        });
      }
    } catch (e) {
      // ignore
    }
    return [];
  };

  const columns = [
    { title: i18n.t('ID').toString(), dataIndex: 'id', width: 100 },
    { title: i18n.t('Case Type').toString(), dataIndex: 'caseType', width: 120 },
    { title: i18n.t('Targets').toString(), dataIndex: 'targetCount', width: 100 },
    { title: i18n.t('Created At').toString(), dataIndex: 'createdAt', width: 180 },
    { title: 'P50 (ms)', dataIndex: 'p50', width: 120, cell: (v: number) => <span>{Number(v ?? 0)} ms</span> },
    { title: 'P95 (ms)', dataIndex: 'p95', width: 120, cell: (v: number) => <span>{Number(v ?? 0)} ms</span> },
    { title: 'P99 (ms)', dataIndex: 'p99', width: 120, cell: (v: number) => <span>{Number(v ?? 0)} ms</span> },
    { title: i18n.t('Error Rate').toString(), dataIndex: 'errRate', width: 120, cell: (v: number) => <span>{Number(v ?? 0)}%</span> },
    {
      title: i18n.t('Faults').toString(),
      dataIndex: 'faultsJson',
      cell: (value: string, _: number, record: TestCaseItem) => {
        const faults = parseFaults(value);
        if (faults.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {faults.map((f, i) => {
              const name = `${f.scope || ''}-${f.action || ''}`.replace(/^-/,'');
              return (
                <Button key={i} size="small" onClick={() => {
                  setFaultsByCase(prev => ({ ...prev, [record.id]: faults }));
                  setCurrentCaseId(record.id);
                  setVisible(true);
                }}>
                  <Icon type="bug" style={{ marginRight: 4 }} />{name || 'fault'}
                </Button>
              );
            })}
          </div>
        );
      },
    },
  ];

  const currentFaults = currentCaseId ? faultsByCase[currentCaseId] || [] : [];

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Icon type="chart" />
          <Translation>Execution Results</Translation>
        </div>
        <div>
          <Button onClick={() => onExport('HTML')} style={{ marginRight: 8 }}>
            <Icon type="file-text" /> HTML
          </Button>
          <Button onClick={() => onExport('CSV')} style={{ marginRight: 8 }}>
            <Icon type="table" /> CSV
          </Button>
          <Button onClick={() => onExport('JSON')}>
            <Icon type="code" /> JSON
          </Button>
        </div>
      </div>

      <div className={styles.sectionContent}>
        <Table dataSource={pageData} columns={columns} hasBorder={false} />
        {total > pageSize && (
          <div style={{ paddingTop: 12, textAlign: 'right' }}>
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              pageSizeSelector="dropdown"
              pageSizeList={[10, 20, 50]}
              onChange={setPage}
              onPageSizeChange={(size: number) => { setPageSize(size); setPage(1); }}
            />
          </div>
        )}
      </div>

      <Dialog
        visible={visible}
        onClose={() => setVisible(false)}
        title={i18n.t('Injected Fault Details').toString()}
      >
        {!currentCaseId || currentFaults.length === 0 ? (
          <div style={{ color: '#999' }}>-</div>
        ) : (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Case #{currentCaseId}</div>
            {currentFaults.map((f, idx) => (
              <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div><b>Service</b>: {f.serviceName || '-'}</div>
                <div><b>Fault</b>: {(f.scope || '-') + '-' + (f.action || '-')}</div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default TestCasesResults;

