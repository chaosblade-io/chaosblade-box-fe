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
import {Affix, Button, Col, Descriptions, Divider, Row, Space, Table} from "antd";
import {GenPagination} from "../../../libs/Pagination";
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";
import _ from 'lodash';
import queryString from "query-string";
import * as request from "../../Machine/libs/request";
import Task from "../Task";
import styles from './index.module.scss';
import TaskInfo from "../Task/TaskInfo";
import {ExperimentCreatingTabKey} from "../../../constants/ExperimentConstants";
import {FormattedMessage} from "react-intl";


class ExperimentDetail extends React.Component {

    constructor(props) {
        super(props);
    }

    static getExperimentId() {
        const parsed = queryString.parse(window.location.search);
        const {id} = parsed;
        return id;
    }

    static getDerivedStateFromProps(nextProps) {
        const {history, taskId, clearExperimentDetailResult} = nextProps;
        if (!_.isEmpty(taskId)) {
            clearExperimentDetailResult();
            history.push(`/experiment/task/?${request.generateUrlSearch({id: taskId})}`)
        }
        return null;
    }

    componentDidMount() {
        const {getExperimentById, getTaskByExperimentId} = this.props;
        const experimentId = ExperimentDetail.getExperimentId();
        getExperimentById(experimentId)
        getTaskByExperimentId(experimentId)
    }

    editExperiment = () => {
        const experimentId = ExperimentDetail.getExperimentId();
        const {history, clearExperimentDetailResult} = this.props;
        clearExperimentDetailResult();
        history.push(`/experiment/creating/?${request.generateUrlSearch({id: experimentId})}`);
    }

    startExperiment = () => {
        const experimentId = ExperimentDetail.getExperimentId();
        const {startExperiment} = this.props;
        startExperiment(experimentId);
    }

    experimentOperationRender = () => {
        const top = 20
        return (
            <Affix offsetTop={top}>
                <Button onClick={() => this.scrollToAnchor("Task")}><FormattedMessage
                    id={'page.experiment.operation.detail'}/></Button>
                <Button onClick={() => this.editExperiment()} style={{marginLeft: 8}}><FormattedMessage
                    id={'page.experiment.operation.edit'}/></Button>
                <Button onClick={() => this.startExperiment()} type="primary" style={{marginLeft: 8}}><FormattedMessage
                    id={'page.experiment.operation.run'}/></Button>
            </Affix>
        );
    }

    experimentTaskRender = () => {
        const {loading, tasks, page, pageSize, total, query, getTaskByExperimentId} = this.props;
        const experimentId = ExperimentDetail.getExperimentId();

        return (
            <div id={"Task"}>
                <Descriptions title={<FormattedMessage id={'page.experiment.detail.task'}/>}></Descriptions>
                <Table columns={this.TaskColumns}
                       dataSource={loading ? [] : tasks}
                       locale={{
                           emptyText: <span><a>Empty</a></span>
                       }}
                       rowKey={record => record.taskId}
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getTaskByExperimentId({...query, page, pageSize, experimentId})
                       )}
                />
            </div>
        );
    }

    experimentInfoRender = () => {
        const {experimentName, taskCount, createTime, lastTaskCreateTime, lastTaskStatus, lastTaskResult} = this.props;
        return (
            <Descriptions title={<FormattedMessage id={'page.experiment.detail.info'}/>}
                          extra={this.experimentOperationRender()}>
                <Descriptions.Item label={<FormattedMessage
                    id={'page.experiment.detail.info.name'}/>}>{experimentName ? experimentName : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage
                    id={'page.experiment.detail.info.createTime'}/>}>{createTime ? createTime : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage
                    id={'page.experiment.detail.info.taskCount'}/>}>{taskCount ? taskCount : 0}</Descriptions.Item>
                <Descriptions.Item
                    label={<FormattedMessage
                        id={'page.experiment.detail.info.latestTaskCreateTime'}/>}>{lastTaskCreateTime ? lastTaskCreateTime :
                    <FormattedMessage id={'page.experiment.detail.info.status.waiting'}/>}</Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id={'page.experiment.detail.info.latestTaskStatus'}/>}>
                    {TaskInfo.statusRender(lastTaskStatus, lastTaskResult)}
                </Descriptions.Item>

            </Descriptions>
        );
    }

    experimentMachineRender = () => {
        const {dimension, machines} = this.props;
        return (
            <Descriptions title={<FormattedMessage id={'page.experiment.detail.scope'}/>} bordered>
                <Descriptions.Item label={<FormattedMessage id={'page.experiment.detail.scope.dimension'}/>}
                                   span={3}>{dimension ? dimension :
                    <FormattedMessage id={'page.machine.tab.host'}/>}</Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id={'page.experiment.detail.scope.resource'}/>} span={3}>
                    <Row gutter={8}>
                        {_.isEmpty(machines) ? <Col>Empty</Col>
                            :
                            machines.map(machine => {
                                let m = '';
                                switch (dimension) {
                                    case ExperimentCreatingTabKey.HOST:
                                        m = machine.ip;
                                        break;
                                    case ExperimentCreatingTabKey.NODE:
                                        m = machine.nodeName;
                                        break;
                                    case ExperimentCreatingTabKey.POD:
                                        m = _.join([machine.namespace, machine.podName], '/');
                                        break;
                                    case ExperimentCreatingTabKey.CONTAINER:
                                        m = _.join([machine.namespace, machine.podName, machine.containerName], '/');
                                        break;
                                }
                                return <Col span={6}>{m}</Col>;
                            })}
                    </Row>
                </Descriptions.Item>
            </Descriptions>
        );
    }

    experimentScenarioRender = () => {
        const {scenarios} = this.props;
        const scenario = _.isEmpty(scenarios) ? null : scenarios[0];
        return (
            <Descriptions title={<FormattedMessage id={'page.experiment.detail.scenario'}/>} bordered column={4}>
                <Descriptions.Item label={<FormattedMessage id={'page.experiment.detail.scenario.name'}/>}
                                   span={2}>{scenario && scenario.name ? scenario.name : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id={'page.experiment.detail.scenario.category'}/>}
                                   span={2}>{scenario && scenario.categories ? scenario.categories[0].categoryName : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label={<FormattedMessage id={'page.experiment.detail.scenario.parameter'}/>}
                                   span={4}>
                    <Row gutter={8}>
                        {(scenario && !_.isEmpty(scenario.parameters)) ?
                            scenario.parameters.map(param => {
                                if (param.value === undefined || param.value === null) {
                                    return;
                                }
                                return <Col span={6}>{param.name}:{param.value}</Col>;
                            }) : <Col>Empty</Col>}
                    </Row>
                </Descriptions.Item>
            </Descriptions>
        );
    }

    experimentMonitorRender = () => {
        const {metrics} = this.props;
        if (_.isEmpty(metrics)) {
            return (
                <Descriptions title={<FormattedMessage id={'page.experiment.detail.monitor'}/>} bordered column={4}>
                    <Descriptions.Item span={4}>No Data</Descriptions.Item>
                </Descriptions>
            );
        }
        const metric = metrics[0];
        return (
            <Descriptions title={<FormattedMessage id={'page.experiment.detail.monitor'}/>} bordered column={4}>
                {_.isEmpty(metrics) ?
                    <Descriptions.Item span={4}>无数据</Descriptions.Item>
                    :
                    <>
                        <Descriptions.Item label={<FormattedMessage id={'page.experiment.detail.monitor.state.name'}/>}
                                           span={2}>{metric.name ? metric.name : 'unknown'}</Descriptions.Item>
                        {/*<Descriptions.Item label="监控图形"*/}
                        {/*                   span={2}>{monitor.component ? monitor.component.chart : 'unknown'}</Descriptions.Item>*/}
                        <Descriptions.Item
                            label={<FormattedMessage id={'page.experiment.detail.monitor.state.expected'}/>} span={2}>{
                            <FormattedMessage id={'page.experiment.detail.monitor.expected'}/>}</Descriptions.Item>
                        <Descriptions.Item
                            label={<FormattedMessage id={'page.experiment.detail.monitor.state.protect'}/>}
                            span={2}><FormattedMessage
                            id={'page.experiment.detail.monitor.state.protect'}/></Descriptions.Item>
                        <Descriptions.Item
                            label={<FormattedMessage id={'page.experiment.detail.monitor.state.config'}/>} span={2}>
                            <Row gutter={8}>
                                {(!_.isEmpty(metric.params)) ?
                                    metric.params.map(param => {
                                        return <Col span={6}>{param.name}:{param.value}</Col>;
                                    }) : <Col>Empty</Col>}
                            </Row>
                        </Descriptions.Item>
                        {/*<Descriptions.Item label="测试数据图表" span={2}>*/}
                        {/*    Come soon...*/}
                        {/*</Descriptions.Item>*/}
                    </>}
            </Descriptions>
        );
    }

    render() {
        return (
            <div>
                <div className={styles.detailDescription}>
                    {this.experimentInfoRender()}
                    <Divider dashed/>
                    {this.experimentMachineRender()}
                    <Divider dashed/>
                    {this.experimentScenarioRender()}
                    <Divider dashed/>
                    {this.experimentMonitorRender()}
                    <Divider dashed/>
                    {this.experimentTaskRender()}
                </div>
            </div>
        );
    }

    scrollToAnchor = (anchor) => {
        if (anchor) {
            let dom = document.getElementById(anchor);
            if (dom) {
                dom.scrollIntoView({block: 'start', behavior: 'smooth'});
            }
        }
    }

    operationRender = (text, record, index) => {
        return (
            <Space size="middle">
                <a href={`/experiment/task/?${request.generateUrlSearch({id: record.taskId})}`}>查看详情</a>
            </Space>
        );
    }

    TaskColumns = [
        {
            title: <FormattedMessage id={"page.column.title.index"}/>,
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: <FormattedMessage id={"page.experiment.detail.task.id"}/>,
            dataIndex: "taskId",
            key: "taskId",
            className: `${styles.hidden}`
        },
        {
            title: <FormattedMessage id={"page.experiment.detail.task.name"}/>,
            dataIndex: 'taskName',
            key: 'taskName',
        },
        {
            title: <FormattedMessage id={"page.experiment.detail.task.status"}/>,
            dataIndex: 'taskStatus',
            key: 'taskStatus',
            render: (text, record) => {
                let status = Task.getTaskStatus(record.status, record.resultStatus);
                return <span>{status.desc}</span>
            }
        },
        {
            title: <FormattedMessage id={"page.experiment.detail.task.startTime"}/>,
            dataIndex: 'startTime',
            key: 'startTime',
        },
        {
            title: <FormattedMessage id={'page.experiment.detail.task.endTime'}/>,
            dataIndex: 'endTime',
            key: 'endTime',
        },
        {
            title: <FormattedMessage id={'page.experiment.detail.task.operation'}/>,
            dataIndex: 'operation',
            key: 'operation',
            render: this.operationRender,
        },
    ]
}

const mapStateToProps = state => {
    const detail = state.experimentDetail.toJS()
    return {
        loading: detail.loading,
        refreshing: detail.loading,
        experimentName: detail.experimentName,
        taskCount: detail.taskCount,
        dimension: detail.dimension,
        createTime: detail.createTime,
        lastTaskCreateTime: detail.lastTaskCreateTime,
        lastTaskStatus: detail.lastTaskStatus,
        lastTaskResult: detail.lastTaskResult,
        machines: detail.machines,
        scenarios: detail.scenarios,
        metrics: detail.metrics,
        tasks: detail.tasks,
        taskId: detail.taskId,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getExperimentById: experimentId => dispatch(Actions.getExperimentById(experimentId)),
        getTaskByExperimentId: experimentId => dispatch(Actions.getTaskByExperimentId(experimentId)),
        clearExperimentDetailResult: () => dispatch(Actions.clearExperimentDetailResult()),
        startExperiment: experimentId => dispatch(Actions.startExperiment(experimentId)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ExperimentDetail);