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
import _ from "lodash";
import {Form, Input, Layout, Spin, Tree} from "antd";
import styles from "./index.module.scss";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import ExperimentCreating from "./index";
import {Errors} from "../../../constants/Errors";

const {TreeNode} = Tree;
const {Sider, Content, Footer} = Layout;

const FormLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

class MonitorStep extends React.Component {
    metricForm = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            initialized: false,
        };
    }

    componentDidMount() {
        const {queryMetricCategory, event} = this.props;
        queryMetricCategory();
        event(this);
    }

    isCreatingFromSelected() {
        const experimentId = ExperimentCreating.getExperimentId();
        return !_.isEmpty(experimentId);
    }

    initSelectedFinished() {
        if (!this.isCreatingFromSelected()) {
            return true;
        }
        const {metricSelected} = this.props;
        const {initialized} = this.state;
        return initialized || metricSelected !== null;
    }

    getMetricSelectedKey() {
        const {metricSelected} = this.props;
        const {initialized} = this.state;
        const editing = this.isCreatingFromSelected();
        if (editing && !initialized && !_.isEmpty(metricSelected)) {
            this.setState({initialized: true});
        }
        return metricSelected ? metricSelected.categoryId : '';
    }

    onMetricSelect(selectedKeys, info) {
        const selected = info.selectedNodes.length > 0 ? info.selectedNodes[0].dataRef : null;
        const {onMetricChanged} = this.props;
        if (_.isEmpty(selected)) {
            return;
        }
        onMetricChanged({metric: selected});
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

    updateMetricSelected(parameters) {
        if (_.isEmpty(parameters)) {
            return;
        }
        const params = [];
        const {metricSelected, onMetricChanged} = this.props;
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
        onMetricChanged({metric: metricSelected});
    }

    onFinish(finishFunc) {
        if (this.metricForm.current) {
            const {handleError} = this.props;
            this.metricForm.current.validateFields().then(values => {
                finishFunc();
                this.updateMetricSelected(values);
            }).catch(error => {
                const {errors} = error.errorFields[0];
                const message = errors?errors[0]:Errors.PARAMETER_ERROR.message;
                handleError(Errors.PARAMETER_ERROR.code, message);
            })
        } else {
            finishFunc();
            this.updateMetricSelected([]);
        }
    }

    getMetricInitialValues() {
        const {metricSelected} = this.props;
        if (_.isEmpty(metricSelected)) {
            return {};
        }
        if (_.isEmpty(metricSelected.params)) {
            return {};
        }
        const params = {}
        metricSelected.params.map(param => {
            params[param.name] = param.value;
        })
        return params;
    }

    render() {
        const {metricCategories, loading, metricSelected} = this.props;
        const finished = this.initSelectedFinished();
        return (
            <Layout className={styles.stepLayout}>
                {
                    finished && <Spin spinning={loading || !finished}>
                        <Layout>
                            <Sider>
                                {
                                    metricCategories.length > 0 && <Tree
                                        defaultExpandAll={true}
                                        defaultSelectedKeys={[this.getMetricSelectedKey()]}
                                        onSelect={this.onMetricSelect.bind(this)}
                                    >
                                        {this.metricCategoryTreeRender(metricCategories)}
                                    </Tree>
                                }
                            </Sider>
                            <Layout>
                                <Content>
                                    {
                                        _.isEmpty(metricSelected) ? <div></div> :
                                            _.isEmpty(metricSelected.params) ? '无参数' :
                                                <Form {...FormLayout} ref={this.metricForm}
                                                      // onFinish={this.onFinish()}
                                                      initialValues={this.getMetricInitialValues()}>
                                                    {metricSelected.params.map(param =>
                                                        <Form.Item label={param.name} name={param.name}
                                                                   rules={[{required: param.required ? true : false}]}>
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
        dimension: experiment.dimension,
        metricCategories: experiment.metricCategories,
        metricSelected: experiment.metricSelected,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        clearResult: () => dispatch(Actions.clearExperimentCreatingResult()),
        queryMetricCategory: query => dispatch(Actions.queryMetricCategory(query)),
        onMetricChanged: metric => dispatch(Actions.onMetricChanged(metric)),
        handleError: (code, message) => dispatch(Actions.handleError(code, message)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MonitorStep);