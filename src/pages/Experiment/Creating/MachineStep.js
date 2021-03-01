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
import styles from "./index.module.scss";
import {Spin, Transfer} from "antd";
import _ from "lodash";
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";
import {ExperimentCreatingTabKey} from "../../../constants/ExperimentConstants";

class MachineStep extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.creatingFromMachine();
    }

    creatingFromMachine() {
        if (_.isEmpty(this.props.location)) {
            return false;
        }
        const {dimension, machineId, machineIp} = this.props.location;
        const {creatingFromMachine, clearResult} = this.props;
        if (dimension && machineId && machineIp) {
            clearResult();
            creatingFromMachine({dimension, machineIp, machineId});
            return true;
        }
        return false;
    }

    transferFilter = (inputValue, option) => {
        return option.description.indexOf(inputValue) > -1;
    };

    getTargetKeys = () => {
        const {machinesSelected, dimension} = this.props;
        if (_.isEmpty(machinesSelected)) {
            return [];
        }
        let keys = [];
        switch (dimension) {
            case ExperimentCreatingTabKey.HOST:
                machinesSelected.map(machine => {
                    keys.push(_.join([machine.machineId, machine.ip], '/'));
                });
                break;
            case ExperimentCreatingTabKey.NODE:
                machinesSelected.map(machine => {
                    keys.push(machine.nodeName);
                });
                break;
            case ExperimentCreatingTabKey.POD:
                machinesSelected.map(machine => {
                    keys.push(_.join([machine.namespace, machine.podName], '/'));
                });
                break;
            case ExperimentCreatingTabKey.CONTAINER:
                machinesSelected.map(machine => {
                    keys.push(_.join([machine.namespace, machine.podName, machine.containerName], '/'));
                });
                break;
        }
        return keys;
    }

    transferChange = (targetKeys) => {
        const {onMachinesChanged, dimension} = this.props;
        let machines = [];
        switch (dimension) {
            case ExperimentCreatingTabKey.HOST:
                targetKeys.map(key => {
                    let resources = _.split(key, '/');
                    if (_.isEmpty(resources[0]) || _.isEmpty(resources[1])) {
                        return;
                    }
                    machines.push({machineId: resources[0], ip: resources[1]});
                })
                break;
            case ExperimentCreatingTabKey.NODE:
                targetKeys.map(key => {
                    machines.push({nodeName: key})
                })
                break;
            case ExperimentCreatingTabKey.POD:
            case ExperimentCreatingTabKey.CONTAINER:
                targetKeys.map(key => {
                    let resources = _.split(key, '/');
                    if (resources.length === 2) {
                        machines.push({
                            namespace: resources[0],
                            podName: resources[1],
                        })
                    } else if (resources.length === 3) {
                        machines.push({
                            namespace: resources[0],
                            podName: resources[1],
                            containerName: resources[2],
                        })
                    }
                })
                break;
        }
        onMachinesChanged({machines: machines});
    }

    render() {
        const {titles, machines, pagination, loading} = this.props
        return (
            <div className={styles.stepMachineContent}>
                <Spin spinning={loading}>
                    <Transfer
                        dataSource={machines}
                        showSearch
                        targetKeys={this.getTargetKeys()}
                        onChange={this.transferChange}
                        filterOption={this.transferFilter}
                        render={item => item.title}
                        listStyle={{width: 510, height: 400}}
                        titles={titles}
                        pagination
                    />
                </Spin>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const creating = state.experimentCreating.toJS();
    return {
        loading: creating.loading,
        machinesSelected: creating.machinesSelected,
        dimension: creating.dimension,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        clearResult: () => dispatch(Actions.clearExperimentCreatingResult()),
        creatingFromMachine: machine => dispatch(Actions.creatingFromMachine(machine)),
        onMachinesChanged: machines => dispatch(Actions.onMachinesChanged(machines)),
        handleError: (code, message) => dispatch(Actions.handleError(code, message)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MachineStep);

