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
import {Form, Input, Modal} from "antd";
import _ from 'lodash'

class ScenarioParamForm extends React.Component {

    formRef = React.createRef()

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        }
    }

    onCreate = (values) => {
        this.props.onChange(false);
        if (_.isEmpty(values.groupName)) {
            values.groupName = this.state.groupName;
        }
        this.props.install(values);
    }

    onOK = () => {
        this.formRef.current
            .validateFields()
            .then(values => {
                this.onCreate(values);
                this.formRef.current.resetFields();
                this.setState({groupName: ""})
            })
            .catch(info => {
                console.log("validate field: ", info);
            });
    }


    render() {
        const {appName, groupName} = this.state;
        const {visible} = this.props
        const FormLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 12},
        };
        return (
            <Modal
                visible={visible}
                title="填写应用信息"
                okText="确定"
                cancelText="取消"
                onCancel={this.onCancel}
                onOk={this.onOK}
            >
                <Form
                    {...FormLayout}
                    ref={this.formRef}
                    name="applicationForm"
                >
                    <Form.Item
                        label="应用名"
                        name="appName"
                        rules={[{required: true, message: '请输入应用名称'}]}
                    >
                        <Input onChange={this.onAppNameChange} placeholder={appName}/>
                    </Form.Item>
                    <Form.Item label="应用分组名" name="groupName"
                               rules={[{required: false, message: '请输入应用分组名称，默认值：应用名-group'}]}>
                        <Input placeholder={groupName}/>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export default ScenarioParamForm;