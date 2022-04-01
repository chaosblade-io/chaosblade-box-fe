import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import styles from './index.css';
import { IFunction, IFunctionsResult } from 'config/interfaces/Chaos/experiment';
import { Pagination } from '@alicloud/console-components';
import { useDispatch } from 'utils/libs/sre-utils-dva';
interface IFunctionsProps {
  searchKey?: string;
  selTabs?: string[];
  scopeType: number|string,
  onSelected: (fun: any) => void;
  seletedFun: IFunction;
}

export default function functionsList(props: IFunctionsProps) {
  const { onSelected, seletedFun, searchKey, selTabs, scopeType } = props;
  const dispatch = useDispatch();
  const [ pageSize, setPageSize ] = useState(16);
  const [ total, setTotal ] = useState(0);
  const [ page, setPage ] = useState(1);
  const [ functions, setFunctions ] = useState<any[]>([]);
  const seletStyle = styles.seleted;
  const seletedCard = styles.seletedCard;
  const noSelected = styles.Card;

  useEffect(() => {
    if (searchKey) {
      (async function() {
        await dispatch.experimentScene.searchFunctions({
          key: searchKey,
          phase: 1 << 1, // eslint-disable-line no-bitwise,
          page,
          scopeType,
          k8sResourceType: 0,
          size: pageSize,
        } as any, ({ data: funcs = [], total, pageSize }) => {
          if (searchKey) {
            setFunctions(funcs);
            setTotal(total);
            setPageSize(pageSize);
          }
        });
      })();
    }
  }, [ searchKey, page ]);
  useEffect(() => {
    const categoryId = selTabs?.[1];
    if (!categoryId) {
      return;
    }
    (async function() {
      await dispatch.experimentScene.getFunctionsByCategoryId({
        page,
        categoryId,
        phase: 1 << 1, // eslint-disable-line no-bitwise
        scopeType,
        size: pageSize,
        k8sResourceType: 0,
      } as any, (data: IFunctionsResult) => {
        if (data) {
          if (categoryId) {
            const { data: funcs, total, pageSize } = data;
            setTotal(total);
            setPageSize(pageSize);
            setFunctions(funcs);
          }
        }
      });
    })();
  }, [ selTabs, page ]);
  useEffect(() => {
    if (!_.isEmpty(functions)) {
      onSelected(functions[0]);
      return;
    }
    onSelected(null);
  }, [ functions ]);

  function handleSelectFun(fun: any) {
    onSelected(fun);
  }

  function isSelectStyle(fun: any) {
    if (seletedFun?.functionId === fun.functionId) {
      return seletedCard;
    }
    return noSelected;
  }

  return (
    <div className={styles.funContent}>
      <div className={styles.funList}>
        {!_.isEmpty(functions) ? _.map(functions, fun => <div key={fun.functionId} className={classnames(styles.listCard, isSelectStyle(fun))} onClick={() => handleSelectFun(fun)}>
          <div className={seletedFun?.functionId === fun.functionId ? seletStyle : styles.radio}>
            {(seletedFun?.functionId === fun.functionId) && <div className={styles.selectedCon}></div>}
          </div>
          <span>{fun && fun.name}</span>
        </div>) : <div className={styles.noDate}>
          <img src="https://img.alicdn.com/imgextra/i3/O1CN01H4HfE81gkUDbZQBkD_!!6000000004180-55-tps-98-64.svg" alt="" style={{ marginLeft: 35 }}/>
          <div style={{ marginTop: 16 }}>当前分类暂无场景，请重新选择</div>
        </div>}
      </div>
      <Pagination
        style={{ textAlign: 'right' }}
        current={page}
        onChange={page => setPage(page)}
        pageSize={pageSize}
        total={total}
        hideOnlyOnePage={true}
      />
      {!_.isEmpty(functions) && <div className={styles.funInfo}>
        {seletedFun && seletedFun.description}
      </div>}
    </div>
  );
}
