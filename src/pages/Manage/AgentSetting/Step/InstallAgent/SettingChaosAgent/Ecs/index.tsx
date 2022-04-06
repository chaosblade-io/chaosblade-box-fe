import HeadHandler from './HeadHandler';
import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import TableList from './TableList';
import { IQueryPluginStatusResult, IQueryPluginsResult } from 'config/interfaces';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const Ecs: FC = () => {
  const dispatch = useDispatch();
  const [ dataSource, setDataSource ] = useState<IQueryPluginStatusResult[]>([]);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ page, setPage ] = useState<number>(1);
  const [ pageSize, setPageSize ] = useState<number>(10);
  const [ totalCount, setTotalCount ] = useState<number>(0);
  const [ filterText, setFilterText ] = useState<string>(''); // 搜索框
  const [ searchKeywordList, setSearchKeywordList ] = useState<string[]>([]); // 搜索内容
  const [ searchFilterKey, setSearchFilterKey ] = useState<string>(''); // 搜索过滤key
  const [ ids, setIds ] = useState<string[]>([]);
  const [ successIntanceIds, setSuccessIntanceIds ] = useState<string[]>([]);
  const [ failInstanceIds, setFailInstanceIds ] = useState<string[]>([]);

  const installStatusLoopInterval = useRef<{[key: number]: any}>({});
  const installStatusLoopIntervalId = useRef<number>(0);

  // 列表
  const fetchTableList = useCallback(async (pageIndex?: number) => {
    try {
      setIsLoading(true);
      const searchKey = searchKeywordList.join(',');
      const filters = { [ searchFilterKey ]: searchKey };

      const { Data = {} } = await dispatch.agentSetting.getQueryWaitInstallPlugin({
        PageNumber: pageIndex || page,
        PageSize: pageSize,
        ...filters,
      });
      const { totalItem, result } = Data as IQueryPluginsResult;
      handleFormat(result);
      setTotalCount(totalItem);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  }, [ page, searchKeywordList, searchFilterKey, pageSize ]);

  // 处理数据
  const handleFormat = (data: IQueryPluginStatusResult[]) => {
    const dataSource: IQueryPluginStatusResult[] = [];
    data.forEach(item => {
      let ip: any;
      let pluginStatusShow: any = '';
      let publicIpShow: any;

      if (item.pluginType === 'CHAOS_AGENT') {
        publicIpShow = '（公）';
      } else {
        publicIpShow = '（主机）';
      }

      if (item.publicIp && item.privateIp) {
        ip = (
          <span>
            {item.publicIp + publicIpShow}
            <br />
            {item.privateIp + '（私）'}
          </span>
        );
      } else if (!item.publicIp && item.privateIp) {
        ip = (
          <span>
            {item.privateIp + '（私）'}
          </span>
        );
      } else if (item.publicIp && !item.privateIp) {
        ip = <span> {item.publicIp + publicIpShow}</span>;
      }

      switch (item.pluginStatus) {
        case 0:
          pluginStatusShow = '待安装';
          break;
        case 1:
          pluginStatusShow = '安装中';
          break;
        case -1:
          pluginStatusShow = '安装失败';
          break;
        case 2:
          pluginStatusShow = '在线';
          break;
        case 3:
          pluginStatusShow = '离线';
          break;
        case 4:
          pluginStatusShow = '卸载中';
          break;
        case 5:
          pluginStatusShow = '卸载失败';
          break;
        default:
          break;
      }

      dataSource.push({
        instanceId: item.instanceId,
        instanceName: item.instanceName,
        pluginStatus: item.pluginStatus,
        pluginStatusShow,
        ip,
        pluginType: item.pluginType,
        canAutoInstall: item.canAutoInstall,
        osType: item.osType,
        networkType: item.networkType,
        configurationId: 'xxx',
        enable: false,
      });
    });

    setDataSource(dataSource);
  };

  useEffect(() => {
    fetchTableList();
  }, [ fetchTableList ]);

  const handleSearchChange = (val: string) => {
    setFilterText(val);
  };

  const handleFilterSearch = (val: string, filterKey: string) => {
    const _searchKeywordList: string[] = [ ...searchKeywordList ];
    if (!val) return;

    if (filterKey === 'InstanceNameList' && searchKeywordList.length === 1) return;

    if (!_searchKeywordList.includes(val)) {
      _searchKeywordList.push(val);
    }

    setSearchKeywordList(_searchKeywordList);
    setSearchFilterKey(filterKey);
    setFilterText('');
  };

  const handleFilterSearchChange = () => {
    setSearchKeywordList([]);
    setFilterText('');
  };

  const tagSearchClose = (_: any, e: any) => {
    const _searchKeywordList: string[] = [ ...searchKeywordList ];
    const _val = e.getAttribute('data-id') || '';
    const searchList = _searchKeywordList.filter(item => item !== _val);
    setSearchKeywordList(searchList);
    return true;
  };

  const fetchAdd = async (dataSource: IQueryPluginStatusResult[], ids: string[], name: string, group: string) => {
    setDataSource(dataSource);
    const { Data: res = {} } = await dispatch.agentSetting.getBatchInstallPlugin({
      InstanceIds: ids.join(','),
      AppName: name,
      AppGroupName: group,
    });
    if (res) {
      const instanceIds = res;
      const successIntanceIds: string[] = [];
      const failInstanceIds: string[] = [];

      Object.keys(instanceIds).forEach(key => {
        if (instanceIds[key]) {
          successIntanceIds.push(key);
        } else {
          failInstanceIds.push(key);
        }
      });
      setIds(ids);
      setSuccessIntanceIds(successIntanceIds);
      setFailInstanceIds(failInstanceIds);
    }
  };

  const handleInstallStatusLoop = async (dataSource: IQueryPluginStatusResult[], instanceIds: string, intervalId: number) => {
    const { Data: res = {} } = await dispatch.agentSetting.getBatchQueryPluginStatus({
      Loop: true,
      InstanceIds: instanceIds,
    });
    if (res) {
      const _data = res;
      const _dataSource = [ ...dataSource ] as IQueryPluginStatusResult[];
      let successCount = 0;

      Object.keys(_data).forEach(item => {
        _dataSource.forEach(pluginItem => {
          if (item === pluginItem.instanceId) {
            pluginItem.pluginStatus = _data[item];
          }
        });

        if (_data[item] === 2) {
          successCount++;
        }
      });

      setDataSource(_dataSource);

      if (successCount === Object.keys(_data).length) {
        clearInterval(installStatusLoopInterval.current[intervalId]);
        installStatusLoopInterval.current[intervalId] = null;
        setSuccessIntanceIds([]);
        setFailInstanceIds([]);
      }
    }
  };

  const handleInstallOvertime = (intervalId: number) => {
    clearInterval(installStatusLoopInterval.current[intervalId]);
    installStatusLoopInterval.current[intervalId] = null;
    setSuccessIntanceIds([]);
    setFailInstanceIds([]);
    handleInstallFailed(999);
  };

  const handleInstallFailed = (status?: number) => {
    const _dataSource = [ ...dataSource ] as IQueryPluginStatusResult[];
    const pluginStatus = status || -1;

    // 只有超时的才展示超时的
    _dataSource.forEach(item => {
      if (failInstanceIds.indexOf(item.instanceId) !== -1) {
        if (item.pluginStatus === 1) {
          item.pluginStatus = pluginStatus;
        }
      }
    });

    setDataSource(_dataSource);
  };

  useEffect(() => {
    if (successIntanceIds.length) {
      ((intervalId, dataSource) => {
        installStatusLoopInterval.current[installStatusLoopIntervalId.current] = setInterval(() => {
          handleInstallStatusLoop(dataSource, successIntanceIds.join(','), intervalId);
        }, 2000);
      })(installStatusLoopIntervalId.current, dataSource);

      setTimeout(() => {
        handleInstallOvertime(installStatusLoopIntervalId.current);
      }, 61000);

      installStatusLoopIntervalId.current++;
    }

    if (failInstanceIds.length) {
      handleInstallFailed();
    }

    return () => {
      Object.keys(installStatusLoopInterval.current).forEach(item => {
        clearInterval(installStatusLoopInterval.current[+item]);
      });
    };
  }, [ successIntanceIds, failInstanceIds, ids, dataSource ]);

  const handlePaginationChange = (pageIndex: number) => {
    setPage(pageIndex);
  };

  const handleOnPageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
  };

  return (
    <>
      <HeadHandler
        filterText={filterText}
        searchKeywordList={searchKeywordList}
        searchFilterKey={searchFilterKey}
        handleSearchChange={handleSearchChange}
        handleFilterSearch={handleFilterSearch}
        handleFilterSearchChange={handleFilterSearchChange}
        tagSearchClose={tagSearchClose}
        clearFilter={() => setSearchKeywordList([])}
      />
      <TableList
        totalCount={totalCount}
        pageSize={pageSize}
        isLoading={isLoading}
        dataSource={dataSource}
        handleOnPageSizeChange={handleOnPageSizeChange}
        handlePaginationChange={handlePaginationChange}
        fetchAdd={fetchAdd}
      />
    </>
  );
};

export default memo(Ecs);
