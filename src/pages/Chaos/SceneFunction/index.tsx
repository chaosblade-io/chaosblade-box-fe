import FunctionsList from './functionsList';
import React, { useEffect, useState } from 'react';
import styles from './index.css';
import { Balloon, Button, Dropdown, Icon, Menu, Search, Tab } from '@alicloud/console-components';
import { ICategories } from 'config/interfaces/Chaos/scene';
import { IFunction } from 'config/interfaces/Chaos/experiment';
import { SCOPE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { CHAOS_DEFAULT_BREADCRUMB_ITEM as chaosDefaultBreadCrumb } from 'config/constants/Chaos/chaos';

import { getParams, pushUrl } from 'utils/libs/sre-utils';
import { useDispatch } from 'utils/libs/sre-utils-dva';
import { useHistory } from 'dva';

export default function SceneFunctions() {
  const dispatch = useDispatch();
  const history = useHistory();

  const scopeType = getParams('scopeType') || SCOPE_TYPE.K8S + '';

  // const [ scopeType, setScopeType ] = useState(SCOPE_TYPE.HOST);
  /** 嵌套tab数据 */
  const [ tabs, setTabs ] = useState<ICategories[]>([]);
  /** 当前选择tab 数组 */
  const [ selTabs, setSelTabs ] = useState<string[]>([]);

  const [ searchKey, setSearchKey ] = useState(''); // 搜索内容，如果为空，显示类目，否则显示搜索结果
  const [ seletedFun, setSeletedFun ] = useState<any>(); // 被选择的场景
  const [ ballonVisible, setBallonVisible ] = useState(() => {
    if (localStorage.getItem('createByCode')) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    dispatch.pageHeader.setTitle('演练场景');
    dispatch.pageHeader.setBreadCrumbItems(chaosDefaultBreadCrumb.concat([ // 修改面包屑
      {
        key: 'scenes',
        value: '演练场景',
        path: '/chaos/scenes',
      },
    ]));
    dispatch.pageHeader.showBackArrow(true);
  }, []);

  useEffect(() => {
    getCategoriesLs();
  }, [ scopeType ]);
  useEffect(() => {
    // 重置tab默认选项
    if (tabs?.length > 0) {
      const defaultSel = getDefaultSel(tabs[0]);
      setSelTabs(defaultSel);
    }
  }, [ tabs, searchKey ]);

  const getDefaultSel = (info: any) => {
    const ids: any = [];
    const { categoryId: id1, children: ch1 } = info;
    ids.push(id1);
    if (ch1?.length > 0) {
      const { categoryId: id2, children: ch2 } = ch1[0];
      ids.push(id2);
      if (ch2?.length > 0) {
        const { categoryId: id3 } = ch2[0];
        ids.push(id3);
      }
    }
    return ids;
  };
  const getCategoriesLs = async () => {
    const cates = await dispatch.experimentScene.getCategories({
      phase: 1 << 1, // eslint-disable-line no-bitwise
      scopeType,
      filterNoChild: true,
    });
    setTabs(cates);
  };

  /** tab 选项切换，_index: 0：第一层tab， 1: 第二层tab */
  function handleTabChang(value: any, _index: number, parentId?: any) {
    if (_index === 0) {
      const tempTab = tabs.find(item => item.categoryId === value);
      if (tempTab) {
        setSelTabs(getDefaultSel(tempTab));
      }
    } else if (_index === 1) {
      setSelTabs([ selTabs[0], value ]);
    } else if (_index === 2) {
      setSelTabs([ selTabs[0], parentId, value ]);
    }
  }

  function handleSelected(fun: IFunction) {
    fun && setSeletedFun(fun);
  }

  const handleCreateByFunction = () => {
    const { code = '' } = seletedFun;
    dispatch.experimentEditor.setClearExperiment();
    code && pushUrl(history, '/chaos/experiment/editor', {
      code,
    });
  };

  function handleCloseBall() {
    setBallonVisible(false);
    localStorage.setItem('createByCode', '1');
  }
  const lastId = selTabs?.length === 3 ? selTabs[2] : null;
  const renderTabItem = (temp: any) => {
    const { name, children, categoryId } = temp;
    let title = temp.name;
    if (children?.length > 0) {
      const selItem = lastId ? children.find((item: any) => item.categoryId === lastId) : null;
      title = (
        <Dropdown trigger={<span>{name} {selItem ? `/ ${selItem.name}` : ''} <Icon type="arrow-down" /></span>} afterOpen={() => console.log('after open')}>
          <Menu onItemClick={(key: any) => {
            handleTabChang(key, 2, categoryId);
          }}>
            {children?.map((item: any) => <Menu.Item key={item.categoryId}><span className={item.categoryId === lastId ? styles.link : ''}>{item.name}</span></Menu.Item>)}
          </Menu>
        </Dropdown>
      );
    }
    return (
      <Tab.Item title={title} key={`${children?.length > 0 ? '--' : ''}${temp.categoryId}`}></Tab.Item>
    );
  };

  const renderTabs = () => {
    return <Tab shape='wrapped' activeKey={selTabs?.[0]} onChange={value => handleTabChang(value, 0)}>
      {tabs?.map(item => {
        return (
          <Tab.Item title={item.name} key={item.categoryId}>
            <Tab shape='pure' activeKey={`${selTabs.length === 3 ? '--' : ''}${selTabs?.[1]}`} className={styles.tabSecond} onChange={value => {
              if (!String(value).startsWith('--')) {
                handleTabChang(value, 1);
              }
            }}>
              {item.children?.map((temp: any) => renderTabItem(temp))}
            </Tab>
          </Tab.Item>
        );
      })}
    </Tab>;
  };
  return (
    <div>
      <div className={styles.searchContent}>
        <Button.Group>
          <Button type={scopeType === SCOPE_TYPE.K8S + '' ? 'primary' : 'normal'} onClick={() => pushUrl(history, '/chaos/scenes', { scopeType: SCOPE_TYPE.K8S })}>Kubernetes</Button>
          <Button type={scopeType === SCOPE_TYPE.HOST + '' ? 'primary' : 'normal'} onClick={() => pushUrl(history, '/chaos/scenes', { scopeType: SCOPE_TYPE.HOST })}>主机</Button>
        </Button.Group>&nbsp;&nbsp;
        <Search
          onSearch={value => setSearchKey(value)}
          style={{ width: '400px', marginRight: 8 }}
          onChange={value => setSearchKey(value)}
        />
        <Balloon
          trigger={<Button type='primary' onClick={handleCreateByFunction} id='content'>创建演练</Button>}
          align="t"
          visible={ballonVisible}
          popupContainer='content'
          onClose={handleCloseBall}
        >
          <div>选中场景可以由此直接创建演练啦~</div>
        </Balloon>
      </div>
      {searchKey &&
        <>
          <div>搜索结果：</div>
          <FunctionsList
            searchKey={searchKey}
            scopeType={scopeType}
            seletedFun={seletedFun}
            onSelected={handleSelected}
          />
        </> ||
        <>
          {renderTabs()}
          <FunctionsList
            selTabs={selTabs}
            scopeType={scopeType}
            seletedFun={seletedFun}
            onSelected={handleSelected}
          />
        </>
      }
    </div>
  );
}
