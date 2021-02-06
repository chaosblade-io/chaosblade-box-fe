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
import ExperimentSteps from "./ExperimentSteps";
import {Alert} from "antd";
import Actions from "../../../actions/Actions";
import MachineStep from "./MachineStep";
import {GenPagination} from "../../../libs/Pagination";

const pageSize = 24;

class HostExperiment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            targetKeys: [],
            dimension: "host",
        }
    }

    componentDidMount() {
        const {query, page, getMachinesForHostPageable, probeId} = this.props
        getMachinesForHostPageable({...query, page: page, pageSize, probeId: probeId})
    }

    render() {
        const {page, total, machines, getMachinesForHostPageable} = this.props
        return (
            <ExperimentSteps
                dimension="host"
                machineStep={
                    <div>
                        <Alert style={{textAlign: "center"}}
                               message="请选择以下的机器进行实验"
                               type="info" showIcon closable/>
                        <MachineStep
                            machines={machines}
                            pagination={GenPagination(page, pageSize, total,
                                (page, pageSize) => getMachinesForHostPageable({page, pageSize}))}
                            titles={
                                [<a onClick={() => {
                                    console.log("遇到问题点我查看？")
                                }}>切换成主机名称</a>]}/>
                    </div>
                }
            />
        );
    }
}

const mapStateToProps = state => {
    const experimentCreating = state.experimentCreating.toJS();
    const {hosts} = experimentCreating
    return {
        machines: hosts.machines,
        page: hosts.page,
        total: hosts.total,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        getMachinesForHostPageable: query => dispatch(Actions.getMachinesForHostPageable({...query, original: "host"})),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HostExperiment);