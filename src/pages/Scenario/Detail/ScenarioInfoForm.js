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
import {Form, Modal, Select, Tree, TreeSelect} from "antd";
import _ from 'lodash'
import {ScenarioConstants} from "../../../constants/ScenarioConstants";
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";

const {Option} = Select;
const {SHOW_CHILD} = TreeSelect;
const {TreeNode} = Tree

class ScenarioInfoForm extends React.Component {

    formRef = React.createRef()

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {getScenarioCategories} = this.props;
        getScenarioCategories()
    }

    onCancel = () => {
        this.props.onChange(false);
    }

    onUpdate = (values) => {
        const {scenarioId, onChange, updateScenario} = this.props;
        updateScenario({scenarioId, ...values});
        onChange(false);
    }

    onOK = () => {
        this.formRef.current
            .validateFields()
            .then(values => {
                this.onUpdate(values);
                this.formRef.current.resetFields();
            })
            .catch(info => {
                console.log("validate field: ", info);
            });
    }

    treeNode(data) {
        if (_.isEmpty(data)) {
            return [];
        }
        return data.map(item => {
            if (!_.isEmpty(item.children)) {
                return <TreeNode title={item.name} key={item.categoryId} value={item.categoryId}
                                 children={this.treeNode(item.children)}/>
            }
            return <TreeNode title={item.name} key={item.categoryId} value={item.categoryId}/>
        });
    }

    render() {
        const {visible, supportScopeTypes, categories, categoryIds, loading} = this.props
        const categoryKeys = [];
        if (!_.isEmpty(categoryIds)) {
            categoryIds.map(category => categoryKeys.push(category.categoryId));
        }
        const FormLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 12},
        };

        const cg = this.treeNode(categories);
        return (
            <Modal
                confirmLoading={loading}
                visible={visible}
                title="修改场景信息"
                okText="确定"
                cancelText="取消"
                onCancel={this.onCancel}
                onOk={this.onOK}
            >
                <Form
                    {...FormLayout}
                    ref={this.formRef}
                    name="scenarioInfoForm"
                    initialValues={{supportScopeTypes: supportScopeTypes, categoryIds: categoryKeys}}
                >
                    <Form.Item
                        label="场景维度"
                        name="supportScopeTypes"
                        rules={[{required: true, message: '请选择场景维度'}]}
                    >
                        <Select
                            mode="multiple"
                            size={"middle"}
                            placeholder="选择场景维度"
                            onChange={this.handleChange}
                            style={{width: '100%'}}
                        >
                            <Option key={ScenarioConstants.SUPPORT_HOST_SCOPE.desc}>
                                {ScenarioConstants.SUPPORT_HOST_SCOPE.desc}</Option>
                            <Option key={ScenarioConstants.SUPPORT_KUBERNETES_SCOPE.desc}>
                                {ScenarioConstants.SUPPORT_KUBERNETES_SCOPE.desc}</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="选择场景目录" name="categoryIds"
                               rules={[{required: false, message: '请选择场景目录'}]}>
                        <TreeSelect
                            treeCheckable
                            treeDefaultExpandAll
                            showSearch={true}
                            showCheckedStrategy={SHOW_CHILD}
                            placeholder={"请选择所归属的场景目录"}
                            style={{width: '100%'}}
                        >
                            {this.treeNode(categories)}
                        </TreeSelect>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    const scenario = state.scenarioDetail.toJS();
    return {
        scenarioId: scenario.scenarioId,
        categories: scenario.categories,
        supportScopeTypes: scenario.supportScopeTypes,
    }

}
const mapDispatchToProps = dispatch => {
    return {
        getScenarioCategories: query => dispatch(Actions.getScenarioCategories(query)),
        updateScenario: scenario => dispatch(Actions.updateScenario(scenario)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioInfoForm);