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
import {Button, Card, Divider, Form, Input, Layout, List, Menu, Steps, Tree} from "antd";
import styles from "./index.module.scss";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import _ from 'lodash';
import ExperimentCreating from "./index";
import {ScenarioConstants} from "../../../constants/ScenarioConstants";

const {Step} = Steps;
const {Sider, Content, Footer} = Layout;
const {SubMenu} = Menu;
const {TreeNode} = Tree;

const StepsConfig = [
    {
        title: "选择资源",
        description: "必填项",
    },
    {
        title: "选择场景",
        description: "必填项",
    },
    {
        title: "接入监控",
        description: "非必填项",
    },
    {
        title: "填写名称",
        description: "非必填项",
    },
]

const FormLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

class ExperimentSteps extends React.Component {

    scenarioForm = React.createRef();
    experimentNameForm = React.createRef();
    metricForm = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            experimentName: "",
            scenarioSelected: null,
            metricSelected: null,
            categoryId: "",
        }
    }

    componentDidMount() {
        const {getScenarioCategories, queryMetricCategory} = this.props;
        getScenarioCategories();
        queryMetricCategory();
    }

    onCreatingTabChange = current => {
        this.props.onChange(current);
    }
    onCreatingNext = () => {
        const current = this.props.current + 1;
        this.stepChange(current);
        this.props.onChange(current);
    }
    onCreatingPre = () => {
        this.props.onChange(this.props.current - 1);
    }

    stepChange = (current) => {
        if (current === 1) {
            const {categories, scenarios, getScenarioCategories, getScenariosPageable} = this.props;
            if (_.isEmpty(scenarios) || _.isEmpty(categories)) {
                getScenarioCategories();
            }
        }
        if (current === 2) {
            this.onScenarioFormFinish();
        }
        if (current === 3) {
            this.onMetricFormFinish();
        }
    }

    onCategorySelect = (selectedKeys) => {
        const {getScenariosPageable, dimension, scenarioSelected} = this.props;
        this.setState({scenarioSelected: null});
        const categoryId = selectedKeys[0]
        getScenariosPageable({
            categoryId: categoryId,
            scopeType: dimension,
            status: ScenarioConstants.STATUS_PUBLISH.code
        })
        this.setState({categoryId})
    }

    metricCategoryTreeRender(data) {
        if (_.isEmpty(data)) {
            return <span>暂不支持接入</span>
        }
        return data.map(item => {
            if (item.children) {
                return <TreeNode title={item.name} key={item.categoryId} dataRef={item}>
                    {this.metricCategoryTreeRender(item.children)}
                </TreeNode>
            }
            return <TreeNode title={item.name} key={item.categoryId} dataRef={item}/>
        })
    }

    getMetricSelectedKey() {
        const {metricSelected} = this.props;
        return metricSelected ? [metricSelected] : [];
    }

    onMetricCategorySelect(selectedKeys, info) {
        const metricSelected = info.selectedNodes.length > 0 ? info.selectedNodes[0].dataRef : null;
        if (metricSelected) {
            this.setState({metricSelected});
        }
    }

    updateMetricSelected(parameters) {
        if (_.isEmpty(parameters)) {
            return;
        }
        const params = [];
        const {metricSelected} = this.state;
        _.forEach(parameters, (value, key) => {
            if (value === undefined || value === null) {
                return;
            }
            if (key === "metricName") {
                metricSelected.name = value;
                return;
            }
            return params.push({
                name: key,
                value: value
            });
        })
        metricSelected.params = params;
        this.setState({metricSelected})
    }

    onMetricFormFinish() {
        this.metricForm.current ?
            this.metricForm.current.validateFields()
                .then(values => {
                    this.updateMetricSelected(values);
                })
            :
            this.updateMetricSelected([]);
    }

    monitorRender = () => {
        const {metricCategories} = this.props;
        const {metricSelected} = this.state;
        return (
            <Layout className={styles.stepLayout}>
                <Sider>
                    {
                        metricCategories.length > 0 && <Tree
                            defaultExpandAll={true}
                            defaultSelectedKeys={this.getMetricSelectedKey()}
                            onSelect={this.onMetricCategorySelect.bind(this)}
                        >
                            {this.metricCategoryTreeRender(metricCategories)}
                        </Tree>
                    }
                </Sider>
                <Divider dashed type={"vertical"}/>
                <Content>
                    {
                        _.isEmpty(metricSelected) ? <div></div> :
                            _.isEmpty(metricSelected.params) ? '无参数' :
                                <Form {...FormLayout} ref={this.metricForm}
                                      onFinish={this.onMetricFormFinish}
                                      initialValues={metricSelected.params}>
                                    {metricSelected.params.map(param =>
                                        <Form.Item label={param.name} name={param.name}>
                                            <Input placeholder={param.code}/>
                                        </Form.Item>
                                    )}
                                    <Form.Item label={'监控名称'} name={'metricName'}>
                                        <Input placeholder={metricSelected.name}/>
                                    </Form.Item>
                                </Form>
                    }
                </Content>
            </Layout>
        );
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

    getScenarioSelectedKey = () => {
        const {categories, scenarioSelected} = this.props;
        return scenarioSelected ? [scenarioSelected] : [];
    }

    onScenarioClick = (scenario) => {
        this.setState({scenarioSelected: scenario})
    }

    onScenarioFormFinish = () => {
        this.scenarioForm.current ?
            this.scenarioForm.current.validateFields()
                .then(values => {
                    this.updateScenarioSelected(values);
                })
            :
            this.updateScenarioSelected([]);
    }

    updateScenarioSelected = (parameters) => {
        if (_.isEmpty(parameters)) {
            return;
        }
        const params = [];
        _.forEach(parameters, (value, key) => {
            if (value === undefined || value === null) {
                return;
            }
            return params.push({
                name: key,
                value: value
            });
        })
        const {scenarioSelected, categoryId} = this.state;
        scenarioSelected.parameters = params;
        scenarioSelected.categoryIds = [categoryId];
        this.setState({scenarioSelected: scenarioSelected})
    }

    scenariosRender = () => {
        const {categories, scenarios} = this.props;
        const {scenarioSelected} = this.state;
        const formLayout = {
            wrapperCol: {span: 14, offset: 4},
        };
        return (
            <Layout>
                <Layout className={styles.stepLayout}>
                    <Sider>
                        {
                            categories.length > 0 && <Tree
                                defaultExpandAll={true}
                                defaultSelectedKeys={this.getScenarioSelectedKey()}
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
                                            onClick={this.onScenarioClick.bind(this, item)}
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
                                                  onFinish={this.onScenarioFormFinish}
                                                  initialValues={scenarioSelected.parameters}>
                                                {scenarioSelected.parameters.map(param =>
                                                    <Form.Item label={param.paramName} name={param.paramName}
                                                               help={param.description}>
                                                        <Input/>
                                                    </Form.Item>
                                                )}
                                            </Form>
                                }
                            </Card>
                        </Footer>
                    </Layout>
                </Layout>
            </Layout>
        );
    }

    onExperimentNameFormChange = () => {
        if (this.experimentNameForm.current) {
            this.experimentNameForm.current.validateFields()
                .then(values => {
                    this.setState(values);
                })
        }
    }

    experimentNameRender = () => {
        const name = this.getExperimentName();
        return (
            <div style={{marginTop: 30}}>
                <Form {...FormLayout} ref={this.experimentNameForm} name="experimentForm"
                      onChange={this.onExperimentNameFormChange}
                      initialValues={{experimentName: name}}>
                    <Form.Item name="experimentName" label="实验名称" help={"不填写时使用默认值"}>
                        <Input placeholder={name}/>
                    </Form.Item>
                </Form>
            </div>
        );
    }

    createExperiment = () => {
        const {create} = this.props;
        const {scenarioSelected, metricSelected, experimentName} = this.state;
        create(scenarioSelected, metricSelected, experimentName);
    }

    updateExperiment = () => {
        const {update} = this.props;
        const {scenarioSelected, metricSelected, experimentName} = this.state;
        update(scenarioSelected, metricSelected, experimentName);
    }

    getExperimentName = () => {
        const {experimentName, dimension, scenarioSelected} = this.props;
        if (!_.isEmpty(experimentName)) {
            return experimentName;
        }
        if (!_.isEmpty(this.state.experimentName)) {
            return this.state.experimentName;
        }
        const values = [];
        if (!_.isEmpty(dimension)) {
            values.push(dimension);
        }
        if (!_.isEmpty(scenarioSelected)) {
            values.push(scenarioSelected.name);
        }
        values.push(new Date().getTime());
        return _.join(values, "-");
    }

    render() {
        const {current, steps} = this.props;
        const id = ExperimentCreating.getExperimentId();
        return (
            <div>
                <Steps direction="horizontal" size="default" current={current}
                       onChange={this.onCreatingTabChange}>
                    {
                        StepsConfig.map(s => {
                            return <Step title={s.title} description={s.description}/>;
                        })
                    }
                </Steps>
                <div className={styles.stepContent}>
                    <div className={current === 0 ? styles.fadeIn : styles.step}>
                        {steps[0]}
                    </div>
                    <div className={current === 1 ? styles.fadeIn : styles.step}>
                        {this.scenariosRender()}
                    </div>
                    <div className={current === 2 ? styles.fadeIn : styles.step}>
                        {this.monitorRender()}
                    </div>
                    <div className={current === 3 ? styles.fadeIn : styles.step}>
                        {this.experimentNameRender()}
                    </div>
                </div>
                <Divider dashed/>
                <div className={styles.stepsAction}>
                    {current > 0 && (
                        <Button style={{marginRight: 8}} onClick={() => this.onCreatingPre()}>
                            上一步
                        </Button>
                    )}
                    {current < StepsConfig.length - 1 && (
                        <Button type="primary" onClick={() => this.onCreatingNext()}>
                            下一步
                        </Button>
                    )}
                    {current === StepsConfig.length - 1 && (
                        id ?
                            <span></span>
                            :
                            <Button
                                type="primary"
                                onClick={() => this.createExperiment()}
                            >
                                创建实验
                            </Button>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const experiment = state.experimentCreating.toJS();
    return {
        experimentName: experiment.experimentName,
        categories: experiment.categories || [],
        scenarios: experiment.scenarios.scenarios || [],
        scenarioSelected: experiment.scenarioSelected,
        dimension: experiment.dimension,
        metricCategories: experiment.metricCategories,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getScenarioCategories: query => dispatch(Actions.getScenarioCategories(query)),
        getScenariosPageable: query => dispatch(Actions.getScenariosPageable(query)),
        queryMetricCategory: query => dispatch(Actions.queryMetricCategory(query)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentSteps);