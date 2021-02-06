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
import ExperimentCreating from "./index";
import {Errors} from "../../../constants/Errors";

const {TreeNode} = Tree;
const {Sider, Content, Footer} = Layout;

const pageSize = 16;
const FormLayout = {
    labelCol: {span: 8},
    wrapperCol: {span: 12},
};

class ScenarioStep extends React.Component {
    scenarioForm = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            initialized: false
        };
    }

    componentDidMount() {
        const {getScenarioCategories, event} = this.props;
        getScenarioCategories();
        this.creatingFromScenario();
        event(this);
    }

    creatingFromScenario() {
        if (_.isEmpty(this.props.location)) {
            return false;
        }
        const {dimension, categoryId, scenarioId} = this.props.location;
        const {creatingFromScenario, clearResult} = this.props;
        if (dimension && categoryId && scenarioId) {
            clearResult();
            creatingFromScenario({dimension, categoryId, scenarioId});
            return true;
        }
        return false;
    }

    isCreatingFromSelected() {
        const experimentId = ExperimentCreating.getExperimentId();
        if (!_.isEmpty(experimentId)) {
            return true;
        }
        if (_.isEmpty(this.props.location)) {
            return false;
        }
        const {categoryId, scenarioId} = this.props.location;
        return !_.isEmpty(categoryId) && !_.isEmpty(scenarioId);
    }

    initSelectedFinished() {
        if (!this.isCreatingFromSelected()) {
            return true;
        }
        const {scenarioSelected} = this.props;
        const {initialized} = this.state;
        return initialized || scenarioSelected !== null;
    }

    onCategorySelect = (selectedKeys) => {
        const {
            getScenariosPageable,
            dimension,
            onScenarioCategoryChanged,
            scenarioCategoryIdSelected,
            onScenarioChanged
        } = this.props;
        const categoryId = selectedKeys[0];
        onScenarioChanged(null);
        if (categoryId !== scenarioCategoryIdSelected) {
            onScenarioCategoryChanged({categoryId});
            getScenariosPageable({
                categoryId: categoryId,
                scopeType: dimension,
                status: ScenarioConstants.STATUS_PUBLISH.code,
                pageSize,
            })
        }
    }

    onScenarioSelect = (scenario) => {
        const {scenarioSelected, onScenarioChanged} = this.props;
        if (scenarioSelected !== null && scenario.scenarioId === scenarioSelected.scenarioId) {
            scenario.parameters.map(scenarioParam => {
                scenarioSelected.parameters.map(selectedParam => {
                    if (scenarioParam.name === selectedParam.name) {
                        scenarioParam.value = selectedParam.value;
                    }
                });
            })
        }
        onScenarioChanged({scenario});
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

    getScenarioCategorySelectedKey = () => {
        const {scenarioCategoryIdSelected, getScenariosPageable, dimension} = this.props;
        const {initialized} = this.state;
        const editing = this.isCreatingFromSelected();
        if (editing && !initialized && !_.isEmpty(scenarioCategoryIdSelected)) {
            getScenariosPageable({
                categoryId: scenarioCategoryIdSelected,
                scopeType: dimension,
                status: ScenarioConstants.STATUS_PUBLISH.code,
                pageSize,
            });
            this.setState({initialized: true});
        }
        return scenarioCategoryIdSelected;
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
                console.log("error: ", error);
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

    render() {
        const {categories, scenarios, loading, scenarioSelected} = this.props;
        const finished = this.initSelectedFinished();
        return (
            <Layout>
                {
                    finished &&
                    <Spin spinning={loading || !finished}>
                        <Layout className={styles.stepLayout}>
                            <Sider>
                                {
                                    categories.length > 0 && <Tree
                                        defaultExpandAll={true}
                                        defaultSelectedKeys={[this.getScenarioCategorySelectedKey()]}
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
                                        renderItem={item => (
                                            <List.Item>
                                                <Card
                                                    className={scenarioSelected && item.scenarioId === scenarioSelected.scenarioId ?
                                                        styles.stepCardSelected
                                                        :
                                                        styles.stepCardNoSelected}
                                                    hoverable
                                                    onClick={this.onScenarioSelect.bind(this, item)}
                                                    style={{textAlign: 'center', height: 64}}
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
                                                                <Input/>
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
    }
}

const mapDispatchToProps = dispatch => {
    return {
        clearResult: () => dispatch(Actions.clearExperimentCreatingResult()),
        getScenarioCategories: query => dispatch(Actions.getScenarioCategories(query)),
        getScenariosPageable: query => dispatch(Actions.getScenariosPageable(query)),
        creatingFromScenario: scenario => dispatch(Actions.creatingFromScenario(scenario)),
        onScenarioCategoryChanged: categoryId => dispatch(Actions.onScenarioCategoryChanged(categoryId)),
        onScenarioChanged: scenario => dispatch(Actions.onScenarioChanged(scenario)),
        handleError: (code, message) => dispatch(Actions.handleError(code, message)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioStep);