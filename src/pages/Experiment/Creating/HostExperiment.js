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
import {connect} from "react-redux";
import MachinesSelection from "./MachinesSelection";
import ExperimentSteps from "./ExperimentSteps";
import {Alert} from "antd";
import Actions from "../../../actions/Actions";
import _ from 'lodash'
import ExperimentCreating from "./index";

class HostExperiment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            creatingStepCurrent: 0,
            targetKeys: [],
            dimension: "host",
        }
    }

    componentDidMount() {
        const {query, page, pageSize, getMachinesForHostPageable, probeId} = this.props
        getMachinesForHostPageable({...query, page: page, pageSize: pageSize, probeId: probeId, original: "host"})
    }

    changeCreatingStepCurrentValue = (value) => {
        this.setState({creatingStepCurrent: value});
    }

    scenariosRender = () => {
        return (
            <span>选择演练场景</span>
        );
    }
    handleChange = (targetKeys) => {
        this.setState({targetKeys});
    }

    getMachines = () => {
        const {targetKeys} = this.state;
        const machines = [];
        targetKeys.map(target => {
            const values = _.split(target, "-")
            machines.push({
                machineId: values[0],
                ip: values[1],
            })
        })
        return machines;
    }

    createExperiment = (scenario, metric, name) => {
        const {createExperiment} = this.props;
        const {dimension} = this.state;
        createExperiment({
            categoryId: scenario.categories[0].categoryId,
            scenarioId: scenario.scenarioId,
            parameters: scenario.parameters,
            metrics: metric ? [metric] : [],
            machines: this.getMachines(),
            experimentName: name,
            dimension,
            collect: true
        })
    }

    updateExperiment = (scenario, metric, name) => {
        const {updateExperiment} = this.props;
        const {dimension} = this.state;
        updateExperiment({
            experimentId: ExperimentCreating.getExperimentId(),
            categoryId: scenario.categories[0].categoryId,
            scenarioId: scenario.scenarioId,
            parameters: scenario.parameters,
            metrics: metric ? [metric] : [],
            machines: this.getMachines(),
            experimentName: name,
            dimension,
            collect: true
        })
    }

    render() {
        const {creatingStepCurrent, targetKeys, dimension} = this.state;
        const {machines, machinesSelected} = this.props;
        if (_.isEmpty(targetKeys) && !_.isEmpty(machinesSelected)) {
            targetKeys.push(...machinesSelected)
        }
        return (
            <ExperimentSteps
                dimension={dimension}
                current={creatingStepCurrent}
                create={this.createExperiment.bind(this)}
                update={this.updateExperiment.bind(this)}
                onChange={this.changeCreatingStepCurrentValue.bind(this)}
                steps={[
                    <div>
                        <Alert style={{textAlign: "center"}}
                               message="请选择以下的机器进行实验"
                               type="info" showIcon closable/>
                        <MachinesSelection
                            machines={machines}
                            targetKeys={targetKeys}
                            handleChange={this.handleChange.bind(this)}
                            titles={
                                [<a onClick={() => {
                                    console.log("遇到问题点我查看？")
                                }}>切换成主机名称</a>]}/>
                    </div>,
                    this.scenariosRender()
                ]}
            />
        );
    }
}

const mapStateToProps = state => {
    const experimentCreating = state.experimentCreating.toJS();
    const {hosts} = experimentCreating
    return {
        loading: hosts.loading,
        refreshing: hosts.refreshing,
        machines: hosts.machines,
        pageSize: hosts.pageSize,
        page: hosts.page,
        pages: hosts.pages,
        total: hosts.total,
        machinesSelected: experimentCreating.machinesSelected,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForHostPageable: query => dispatch(Actions.getMachinesForHostPageable(query)),
        createExperiment: experiment => dispatch(Actions.createExperiment(experiment)),
        updateExperiment: experiment => dispatch(Actions.updateExperiment(experiment)),
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(HostExperiment);