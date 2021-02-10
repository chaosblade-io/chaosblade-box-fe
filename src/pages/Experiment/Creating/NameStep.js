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
import {Form, Input} from "antd";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import _ from "lodash";

const FormLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 16},
};

class NameStep extends React.Component {
    experimentNameForm = React.createRef();

    constructor(props) {
        super(props);
    }

    onExperimentNameFormChange = () => {
        if (this.experimentNameForm.current) {
            this.experimentNameForm.current.validateFields()
                .then(values => {
                    const {onExperimentNameChanged} = this.props;
                    onExperimentNameChanged({name: values['experimentName']});
                })
        }
    }

    getExperimentName = () => {
        const {experimentName, dimension, scenarioSelected, onExperimentNameChanged} = this.props;
        if (!_.isEmpty(experimentName)) {
            return experimentName;
        }
        const values = [];
        if (!_.isEmpty(dimension)) {
            values.push(dimension);
        }
        if (!_.isEmpty(scenarioSelected)) {
            values.push(scenarioSelected.name);
        }
        values.push(new Date().getTime());
        let name = _.join(values, "-");
        onExperimentNameChanged({name});
        return name;
    }

    render() {
        const experimentName = this.getExperimentName();
        return (
            <div style={{marginTop: 30}}>
                <Form {...FormLayout} ref={this.experimentNameForm} name="experimentForm"
                      onChange={this.onExperimentNameFormChange}
                      initialValues={{experimentName: experimentName}}>
                    <Form.Item name="experimentName" label="实验名称" help={"不填写时使用默认值"}>
                        <Input placeholder={experimentName}/>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const experiment = state.experimentCreating.toJS();
    return {
        loading: experiment.loading,
        dimension: experiment.dimension,
        experimentName: experiment.experimentName,
        scenarioSelected: experiment.scenarioSelected,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onExperimentNameChanged: name => dispatch(Actions.onExperimentNameChanged(name)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NameStep);