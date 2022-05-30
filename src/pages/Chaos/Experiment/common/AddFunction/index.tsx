import React, { useEffect, useState } from 'react';
import Translation from 'components/Translation';
import _ from 'lodash';
import i18n from '../../../../../i18n';
import locale from 'utils/locale';
import styles from './index.css';
import { Button, Dialog, Icon, Menu, Pagination, Search } from '@alicloud/console-components';
import { IFunction, IFunctionsResult, INode } from 'config/interfaces/Chaos/experiment';
import { NODE_TYPE } from 'pages/Chaos/lib/FlowConstants';
import { useDispatch } from 'utils/libs/sre-utils-dva';

const { SubMenu, Item } = Menu;
interface AddFunctionProps {
  scopeType?: number | string;
  visible: boolean;
  k8sResourceType?: number | string;
  nodeType?: number | string;
  phase?: number;
  onClose: () => void;
  onSelect: (data: INode) => void;
  title: string;
  searchable: boolean;
  isApplication?: boolean;
  cloudServiceType?: string;
  osType?: number;
}

function AddFunction(props: AddFunctionProps): JSX.Element {
  const dispatch = useDispatch();
  // const groups = useSelector(({ experimentDataSource }) => experimentDataSource.groups);

  const [ categories, setCategories ] = useState<any[]>([]);
  const [ categoryId, setCategoryId ] = useState<string | any[]>('');
  const [ page, setPage ] = useState<number>(1);
  const [ pageSize, setPageSize ] = useState(1);
  const [ total, setTotal ] = useState(1);
  const [ func, setFunc ] = useState<IFunction | null>(null);
  const [ functions, setFunctions ] = useState<any[]>([]);
  const [ searchKey, setSearchKey ] = useState('');
  const [ defaultOpenKeys, setDefaultOpenKeys ] = useState<any[]>([]);
  const [ isSearching, setIsSearching ] = useState(false);
  const [ searchFlag, setSearchFlag ] = useState(false);

  useEffect(() => {
    if (!props.visible) {
      // 关闭对话框，全部清空
      setCategories([]);
      setCategoryId('');
      setPage(1);
      setFunc(null);
      setFunctions([]);
      setSearchKey('');
      setDefaultOpenKeys([]);
      setIsSearching(false);
    }
  }, [ props.visible ]);

  useEffect(() => {
    setPage(1);
    setCategories([]);
    setCategoryId('');
    setFunctions([]);
    setFunc(null);
    setDefaultOpenKeys([]);

    if (isSearching) {
      const { phase, scopeType, k8sResourceType } = props;
      // 请求搜索接口
      (async function() {
        await dispatch.experimentScene.searchFunctions({
          key: searchKey,
          phase,
          page: 1,
          scopeType,
          k8sResourceType: k8sResourceType!,
        } as any, ({ data: funcs = [], pageSize = 1, total = 1 }) => {
          setTotal(total);
          setPageSize(pageSize);
          setFunctions(funcs);
        });
      })();
    } else {
      setSearchKey('');
    }
  }, [ isSearching, searchFlag ]);

  useEffect(() => {
    if (!props.visible) {
      return;
    }

    if (!isSearching) {
      // 根据phase请求类目
      const { phase, scopeType, nodeType, cloudServiceType, osType } = props;
      if (nodeType === NODE_TYPE.OBSERVER) {
        (async function() {
          await dispatch.experimentScene.getGlobalCategories(cates => {
            if (!_.isEqual(categories, cates)) {
              setCategories(cates);
            }
          });
        })();
      } else if (nodeType === NODE_TYPE.RECOVER) {
        (async function() {
          await dispatch.experimentScene.getGuardCategories(cates => {
            if (!_.isEqual(categories, cates)) {
              setCategories(cates);
            }
          });
        })();
      } else {
        (async function() {
          const cates = await dispatch.experimentScene.getCategories({ phase, scopeType, filterNoChild: true, cloudServiceType, osType } as any);
          if (!_.isEqual(categories, cates)) {
            setCategories(cates);
          }
        })();
      }

    }
  }, [ props.visible, props.phase, props.scopeType, props.nodeType, isSearching, props.osType ]);

  useEffect(() => {
    // 类目变化，选中第1个子类目
    if (categories.length > 0) {
      let cate = categories[0];
      while (cate.children && cate.children.length > 0) {
        cate = cate.children[0];
      }
      setCategoryId(cate.categoryId);
    }
  }, [ categories ]);

  useEffect(() => {
    // 切换类目，页码置为1
    setPage(1);

    // 切换类目，设置setDefaultOpenKeys
    const defaultOpenKeys: any[] = [];
    traverse(categories, defaultOpenKeys);
    if (defaultOpenKeys.length > 0) {
      // 如果数组为空，则表示选中一级菜单
      setDefaultOpenKeys([ ...defaultOpenKeys ]);
    } else if (categories.length > 0) {
      // 否则取第一个类目
      setDefaultOpenKeys([ categories[0].categoryId ]);
    }

    function traverse(objs: any[], paths: any[]) {
      for (const obj of objs) {
        if (obj.children && obj.children.length > 0) {
          paths.push(obj.categoryId);
          if (traverse(obj.children, paths)) {
            return true;
          }
          paths.pop();

        } else if (obj.categoryId !== categoryId) {
          continue;
        } else {
          return true;
        }
      }
      return false;
    }

  }, [ categoryId ]);

  useEffect(() => {
    if (!props.visible) {
      return;
    }
    // 切换类目或页码，重新获取functions
    const { phase, scopeType, k8sResourceType, osType } = props;
    if (isSearching) {
      // 请求搜索接口，翻页
      (async function() {
        await dispatch.experimentScene.searchFunctions({
          key: searchKey,
          phase,
          page,
          scopeType,
          k8sResourceType: k8sResourceType!,
          osType,
        } as any, ({ data: funcs = [], total = 1, pageSize = 1 }) => {
          setTotal(total);
          setPageSize(pageSize);
          if (!_.isEqual(functions, funcs)) {
            setFunctions(funcs);
          }
        });
      })();
    } else if (categoryId && page) {
      (async function() {
        await dispatch.experimentScene.getFunctionsByCategoryId({
          page,
          categoryId,
          phase,
          scopeType,
          k8sResourceType: k8sResourceType!,
          size: 12,
          osType,
        } as any, (data: IFunctionsResult) => {
          if (data) {
            const { data: funcs, total, pageSize } = data;
            setTotal(total);
            setPageSize(pageSize);
            if (!_.isEqual(functions, funcs)) {
              setFunctions(funcs);
            }
          }
        });
      })();
    }
  }, [ props.phase, props.scopeType, categoryId, page, props.k8sResourceType, props.osType ]);

  useEffect(() => {
    // functions变了，默认选中第一个
    if (functions.length > 0) {
      setFunc(functions[0]);
    } else {
      // 没有小程序，把选中的function置为null
      setFunc(null);
    }
  }, [ functions ]);

  const handleClose = () => {
    props.onClose();
  };

  const handleOnSearchChange = (value: string) => setSearchKey(value);
  const handleOnSearch = () => {
    setIsSearching(true);
    setSearchFlag(!searchFlag);
  };

  const toggleSearching = () => {
    setIsSearching(!isSearching);
  };

  const handleItemClick = (cateId: string) => {
    if (cateId !== categoryId) {
      // 切换类目，页码变成第1页
      setCategoryId(cateId);
    }
  };

  const handleFunctionClick = (functionId: string) => {
    const funcs = functions.filter(f => f.functionId === functionId);
    if (funcs.length > 0) {
      setFunc(funcs[0]);
    }
  };

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const renderMenu = (categories: any[]) => {
    return (
      <Menu
        className={styles.categoryList}
        selectMode="single"
        defaultOpenKeys={defaultOpenKeys}
        selectedKeys={categoryId}
        hasSelectedIcon={false}
        onItemClick={handleItemClick}
        inlineIndent={10}
      >
        {renderSubMenu(categories)}
      </Menu>
    );
  };

  const renderSubMenu = (categories: any[]) => {
    const menus: any = [];
    for (const cate of categories) {
      const { categoryId: id, name, children } = cate;
      if (children && children.length > 0) {
        menus.push((
          <SubMenu key={id} label={name}>
            { renderSubMenu(children) }
          </SubMenu>
        ));
      } else {
        menus.push(<Item key={id}>{name}</Item>);
      }
    }
    return menus;
  };

  const handleSelect = async () => {
    const { phase } = props;
    // 全局小程序接口是不需要phase这个参数的，只在流程节点时有phase传入，全局时候是undefined，以此来区分流程节点or全局节点
    if ((phase && func && !func.arguments) || (phase && !func)) {
      // 流程节点没有参数，去查询
      // const { getFunctionParameters } = props;
      const data = await new Promise((resolve, reject) => {
        const functionId = _.get(func, 'functionId', '');
        (async function() {
          await dispatch.experimentScene.getFunctionParameters({ functionId }, (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        })();
      });
      _.set(func as IFunction, 'arguments', data);
    }

    const { onSelect } = props;
    // 深拷贝，不要污染原来的小程序对象
    onSelect(_.cloneDeep(func as any));
    handleClose();
  };

  return (
    <Dialog
      title={props.title}
      visible={props.visible}
      footer={<div className={styles.btnRow}>
        <Button className={styles.btn} type="primary" disabled={functions.length === 0} onClick={handleSelect} data-autolog={`text=${i18n.t('Confirm selection of applet').toString()}`}><Translation>Confirm</Translation></Button>
        <Button className={styles.btn} type="normal" onClick={handleClose} data-autolog={`${i18n.t('Deselect applet')}`}><Translation>cancel</Translation></Button>
      </div>}
      onCancel={handleClose}
      onClose={handleClose}
      style={{ minWidth: 968 }}
      locale={locale().Dialog}
    >
      <div className={styles.container}>
        { props.searchable ? <div className={styles.searchBox}>
          <Icon
            type="search"
            size="xs"
            className={styles.icon}
          />
          <Search
            className={styles.search}
            value={searchKey}
            onChange={handleOnSearchChange}
            onSearch={handleOnSearch}
            placeholder={i18n.t('Search for fault titles').toString()}
            searchText={i18n.t('Search').toString()}
            hasIcon={false}
          />
        </div> : null }
        <div className={styles.contentBox}>
          <div className={styles.categoryBox}>
            {
              /* NOTICE: defaultOpenKeys.length > 0 不能省，一定要实例初始化时一起传入，否则该配置不生效 */
              !isSearching && defaultOpenKeys.length > 0 && renderMenu(categories)
            }
            {
              isSearching &&
              <p>
                <span><Translation>Search results</Translation>:</span>
                <span
                  className={styles.clearSearch}
                  onClick={toggleSearching}
                ><Translation>Empty</Translation></span>
              </p>
            }
          </div>
          <div className={styles.listBox}>
            <ul className={styles.functionList}>
              {
                _.isEmpty(functions) ? <div><Translation>There is no scene in the current category</Translation></div> : functions.map(({ name, functionId }) => {
                  let isSelected = false;
                  if (func) {
                    if (func.functionId === functionId) {
                      isSelected = true;
                    }
                  }
                  return (
                    <li
                      className={isSelected ? styles.selectedFunc : undefined}
                      key={functionId}
                      onClick={() => handleFunctionClick(functionId)}
                      data-autolog={`text=${i18n.t('Click the applet').toString()}`}
                    >{name}</li>
                  );
                })
              }
            </ul>
            <Pagination
              shape="arrow-only"
              current={page}
              total={total}
              pageSize={pageSize}
              hideOnlyOnePage={true}
              locale={locale().Pagination}
              onChange={current => handlePageChange(current)}
            />
            {
              func ?
                <div className={styles.descriptionBox}>
                  <p>{func.description}</p>
                </div>
                :
                <div style={{ minHeight: 220 }}></div>
            }
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default AddFunction;
