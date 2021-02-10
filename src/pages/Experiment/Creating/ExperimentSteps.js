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
import {Button, Divider, Steps} from "antd";
import styles from "./index.module.scss";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import ExperimentCreating from "./index";
import ScenarioStep from "./ScenarioStep";
import MonitorStep from "./MonitorStep";
import NameStep from "./NameStep";
import _ from "lodash";

const {Step} = Steps;

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

class ExperimentSteps extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current: 0,
        }
    }

    onCreatingTabChange = current => {
        this.setState({current});
    }

    machineEvent = child => {
        this._machine = child;
    }
    scenarioEvent = child => {
        this._scenario = child;
    }
    monitorEvent = child => {
        this._monitor = child;
    }

    changeCurrent(current) {
        this.setState({current});
    }

    componentWillUnmount() {
        const {clearResult} = this.props;
        clearResult();
    }

    onCreatingNext = () => {
        const current = this.state.current + 1;
        switch (current) {
            case 2:
                this._scenario.onFinish(this.changeCurrent.bind(this, current));
                break;
            case 3:
                this._monitor.onFinish(this.changeCurrent.bind(this, current));
                break;
            default:
                this.changeCurrent(current);
        }
    }

    onCreatingPre = () => {
        const current = this.state.current - 1;
        this.setState({current});
    }

    getMachines = () => {
        const {machinesSelected} = this.props;
        const machines = [];
        machinesSelected.map(target => {
            const values = _.split(target, "-")
            machines.push({
                machineId: values[0],
                ip: values[1],
            })
        })
        return machines;
    }

    createExperiment = () => {
        const {
            scenarioSelected,
            metricSelected,
            experimentName,
            dimension,
            createExperiment,
            collect,
            scenarioCategoryIdSelected,
            machinesSelected
        } = this.props;
        createExperiment({
            categoryId: scenarioCategoryIdSelected,
            scenarioId: scenarioSelected.scenarioId,
            parameters: scenarioSelected.parameters,
            metrics: metricSelected ? [metricSelected] : [],
            experimentName,
            machines: machinesSelected,
            dimension,
            collect,
        });
    }

    updateExperiment = () => {
        const {
            scenarioSelected,
            metricSelected,
            experimentName,
            dimension,
            updateExperiment,
            collect,
            scenarioCategoryIdSelected,
            machinesSelected
        } = this.props;
        updateExperiment({
            experimentId: ExperimentCreating.getExperimentId(),
            categoryId: scenarioCategoryIdSelected,
            scenarioId: scenarioSelected.scenarioId,
            parameters: scenarioSelected.parameters,
            metrics: metricSelected ? [metricSelected] : [],
            experimentName,
            machines: machinesSelected,
            dimension,
            collect,
        })
    }

    render() {
        const {machineStep, dimension} = this.props;
        const {current} = this.state;
        const id = ExperimentCreating.getExperimentId();
        return (
            <div>
                <Steps direction="horizontal" size="default" current={current}
                >
                    {
                        StepsConfig.map(s => {
                            return <Step title={s.title} description={s.description}/>;
                        })
                    }
                </Steps>
                <div className={styles.stepContent}>
                    {
                        current === 0 ?
                            <div className={styles.fadeIn}>
                                {
                                    // React.cloneElement(
                                    //     machineStep,
                                    //     {dimension, current, event: this.machineEvent}
                                    // )
                                    // // <Element dimension={dimension} current={current} event={this.machineEvent}/>
                                    machineStep
                                }

                            </div>
                            :
                            <div className={styles.step}></div>
                    }
                    {
                        current === 1 ?
                            <div className={styles.fadeIn}>
                                <ScenarioStep dimension={dimension} current={current} event={this.scenarioEvent}/>
                            </div>
                            :
                            <div className={styles.step}></div>
                    }
                    {
                        current === 2 ?
                            <div className={styles.fadeIn}>
                                <MonitorStep dimension={dimension} current={current} event={this.monitorEvent}/>
                            </div>
                            :
                            <div className={styles.step}></div>
                    }
                    {
                        current === 3 ?
                            <div className={styles.fadeIn}>
                                <NameStep dimension={dimension} current={current}/>
                            </div>
                            :
                            <div className={styles.step}></div>
                    }
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
                            <Button
                                type="primary"
                                onClick={() => this.updateExperiment()}
                            >
                                更新实验
                            </Button>
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
        loading: experiment.loading,
        experimentName: experiment.experimentName,
        categories: experiment.categories || [],
        scenarios: experiment.scenarios.scenarios || [],
        scenarioSelected: experiment.scenarioSelected,
        dimension: experiment.dimension,
        metricCategories: experiment.metricCategories,
        metricSelected: experiment.metricSelected,
        machinesSelected: experiment.machinesSelected,
        scenarioCategoryIdSelected: experiment.scenarioCategoryIdSelected,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        clearResult: () => dispatch(Actions.clearExperimentCreatingResult()),
        createExperiment: experiment => dispatch(Actions.createExperiment(experiment)),
        updateExperiment: experiment => dispatch(Actions.updateExperiment(experiment)),
        onMachinesChanged: machines => dispatch(Actions.onMachinesChanged(machines))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentSteps);