/*
 * Copyright 1999-2021 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react";
import {ScenarioConstants} from "../../../constants/ScenarioConstants";
import _ from "lodash";
import {Card, Divider, Form, Input, Layout, List, Spin, Tree} from "antd";
import styles from "./index.module.scss";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {Errors} from "../../../constants/Errors";
import {GenPagination} from "../../../libs/Pagination";

const {TreeNode} = Tree;
const {Sider, Content, Footer} = Layout;

const FormLayout = {
    labelCol: {span: 8},
    wrapperCol: {span: 12},
};

class ScenarioStep extends React.Component {
    scenarioForm = React.createRef();

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {
            getScenarioCategories,
            event,
            dimension,
            scenarioSelectedFromExperiment,
            scenarioCategoryIdSelected
        } = this.props;
        event(this);
        getScenarioCategories({dimension, scenarioCategoryIdSelected});
        if (scenarioSelectedFromExperiment !== null) {
            this.onScenarioSelect(scenarioSelectedFromExperiment.scenarioId);
        }
    }

    onCategorySelect = (selectedKeys) => {
        const {
            getScenariosPageable,
            dimension,
            onScenarioCategoryChanged,
            scenarioCategoryIdSelected,
            onScenarioChanged,
            page,
            pageSize
        } = this.props;
        const categoryId = selectedKeys[0];
        onScenarioChanged(null);
        if (categoryId !== scenarioCategoryIdSelected) {
            onScenarioCategoryChanged({categoryId});
            getScenariosPageable({
                categoryId: categoryId,
                scopeType: dimension,
                status: ScenarioConstants.STATUS_PUBLISH.code,
                page,
                pageSize,
            })
        }
    }

    onScenarioSelect = (scenarioId) => {
        const {getScenarioById, machinesSelected, dimension} = this.props;
        getScenarioById({scenarioId, dimension, machines: machinesSelected})
    }

    scenarioCategoryTreeRender(data) {
        if (_.isEmpty(data)) {
            return <span>暂无数据</span>
        }
        return data.map(item => {
            if (item.children) {
                return <TreeNode title={item.name} key={item.categoryId} dataRef={item}>
                    {this.scenarioCategoryTreeRender(item.children)}
                </TreeNode>
            }
            return <TreeNode title={item.name} key={item.categoryId} dataRef={item}/>
        });
    }

    onFinish(finishFunc) {
        const {handleError} = this.props;
        if (this.scenarioForm.current) {
            this.scenarioForm.current.validateFields().then(values => {
                finishFunc();
                this.updateScenarioSelected(values);
            }).catch(error => {
                const {errors} = error.errorFields[0];
                const message = errors ? errors[0] : Errors.PARAMETER_ERROR.message;
                handleError(Errors.PARAMETER_ERROR.code, message);
            })
        } else {
            handleError(Errors.PARAMETER_ERROR.code, '必须选择一个场景');
        }
    }

    updateScenarioSelected = (parameters) => {
        if (_.isEmpty(parameters)) {
            return;
        }
        const params = [];
        _.forEach(parameters, (value, key) => {
            return params.push({
                name: key,
                value: value,
            });
        })
        const {scenarioSelected, scenarioCategoryIdSelected, onScenarioChanged} = this.props;
        scenarioSelected.parameters = params;
        scenarioSelected.categoryIds = [scenarioCategoryIdSelected];
        onScenarioChanged({scenario: scenarioSelected});
    }

    getScenarioParameterValues() {
        const {scenarioSelected} = this.props;
        if (scenarioSelected === null) {
            return {};
        }
        if (_.isEmpty(scenarioSelected.parameters)) {
            return {};
        }
        const params = {};
        scenarioSelected.parameters.map(param => {
            params[param.name] = param.value
        });
        return params;
    }

    getScenariosList() {
        const {
            scenarioSelected,
            categories,
            dimension,
            page,
            pageSize,
            getScenariosPageable,
            scenarioCategoryIdSelected
        } = this.props;
        if (scenarioCategoryIdSelected !== '' || categories.length === 0) {
            return;
        }
        let firstCategoryId = '';
        if (scenarioSelected === null) {
            firstCategoryId = categories[0].categoryId;
            for (let i = 0; i < categories.length; i++) {
                if (categories[i].parentId !== '') {
                    firstCategoryId = categories[i].categoryId;
                    break;
                }
            }
        } else {
            firstCategoryId = scenarioSelected.categoryId;
        }
        getScenariosPageable({
            categoryId: firstCategoryId,
            scopeType: dimension,
            status: ScenarioConstants.STATUS_PUBLISH.code,
            page,
            pageSize,
        })
    }

    render() {
        const {
            categories,
            scenarios,
            loading,
            scenarioSelected,
            getScenariosPageable,
            page,
            pageSize,
            dimension,
            total,
            scenarioCategoryIdSelected
        } = this.props;
        return (
            <Layout>
                {
                    <Spin spinning={loading}>
                        <Layout className={styles.stepLayout}>
                            <Sider>
                                {
                                    categories.length > 0 && <Tree
                                        defaultExpandAll={true}
                                        defaultSelectedKeys={[scenarioCategoryIdSelected]}
                                        onSelect={this.onCategorySelect.bind(this)}
                                    >
                                        {this.scenarioCategoryTreeRender(categories)}
                                    </Tree>
                                }
                            </Sider>
                            <Layout>
                                <Content>
                                    <List
                                        grid={{gutter: 8, column: 4}}
                                        dataSource={scenarios}
                                        pagination={GenPagination(page, pageSize, total, () => {
                                            getScenariosPageable({
                                                categoryId: scenarioCategoryIdSelected,
                                                scopeType: dimension,
                                                status: ScenarioConstants.STATUS_PUBLISH.code,
                                                page,
                                                pageSize,
                                            })
                                        })}
                                        renderItem={item => (
                                            <List.Item>
                                                <Card
                                                    className={scenarioSelected && item.scenarioId === scenarioSelected.scenarioId ?
                                                        styles.stepCardSelected
                                                        :
                                                        styles.stepCardNoSelected}
                                                    hoverable
                                                    onClick={this.onScenarioSelect.bind(this, item.scenarioId)}
                                                    style={{textAlign: 'center', height: 72}}
                                                    title={null}
                                                >
                                                    {item.name}
                                                </Card>
                                            </List.Item>
                                        )}
                                    />
                                </Content>
                                <Divider dashed/>
                                <Footer>
                                    <Card title={<span>场景参数</span>}>
                                        {
                                            _.isEmpty(scenarioSelected) ? <div></div> :
                                                _.isEmpty(scenarioSelected.parameters) ? '无参数' :
                                                    <Form {...FormLayout} ref={this.scenarioForm}
                                                          initialValues={this.getScenarioParameterValues()}>
                                                        {scenarioSelected.parameters.map(param =>
                                                            <Form.Item label={param.name} name={param.name}
                                                                       help={param.description}
                                                                       rules={[{required: param.required ? true : false}]}>
                                                                <Input disabled={param.component ?
                                                                    param.component.editable ? false : true : false}/>
                                                            </Form.Item>
                                                        )}
                                                    </Form>
                                        }
                                    </Card>
                                </Footer>
                            </Layout>
                        </Layout>
                    </Spin>
                }
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    const experiment = state.experimentCreating.toJS();
    return {
        loading: experiment.loading,
        experimentName: experiment.experimentName,
        categories: experiment.categories || [],
        scenarios: experiment.scenarios.scenarios || [],
        scenarioSelected: experiment.scenarioSelected,
        dimension: experiment.dimension,
        scenarioCategoryIdSelected: experiment.scenarioCategoryIdSelected,
        page: experiment.scenarios.page,
        pageSize: experiment.scenarios.pageSize,
        total: experiment.scenarios.total,
        machinesSelected: experiment.machinesSelected,
        scenarioSelectedFromExperiment: experiment.scenarioSelectedFromExperiment,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        clearResult: () => dispatch(Actions.clearExperimentCreatingResult()),
        getScenarioCategories: query => dispatch(Actions.getScenarioCategories(query)),
        getScenariosPageable: query => dispatch(Actions.getScenariosPageable(query)),
        onScenarioCategoryChanged: categoryId => dispatch(Actions.onScenarioCategoryChanged(categoryId)),
        onScenarioChanged: scenario => dispatch(Actions.onScenarioChanged(scenario)),
        handleError: (code, message) => dispatch(Actions.handleError(code, message)),
        getScenarioById: scenarioId => dispatch(Actions.getScenarioById(scenarioId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioStep);