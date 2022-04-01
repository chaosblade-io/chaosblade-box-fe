import React from 'react';
import styles from './index.css';
import { Icon, Pagination, Table } from '@alicloud/console-components';

interface IProps{
  width: string | number;
  height: string | number;
  tableProps: {
    primaryKey: string,
    hasBorder: boolean,
    dataSource: any[];
    rowSelection: any,
  };
  paginationProps: {
    total: number;
    pageSize: number;
    current: number;
    pageShowCount: number;
  };
  selectedContent: any;
  tableColumnProps: {
    title: any;
    dataIndex: string;
    style: {},
  }
  [key: string]: any;
}

export default function ListSelect(props: IProps) {
  return <div className={styles.listContent} style={{ width: props.width, height: props.height }}>
    <div className={styles.tableList}>
      <Table
        className={styles.table}
        size='small'
        {...props.tableProps}
      >
        <Table.Column {...props.tableColumnProps}/>
      </Table>
      <Pagination
        className={styles.paginationSty}
        type='simple'
        {...props.paginationProps}
      />
    </div>
    <Icon type="switch" className={styles.icon}/>
    {props.selectedContent}
  </div>;
}
