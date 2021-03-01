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
                <Button onClick={() => this.scrollToAnchor("Task")}>查看任务</Button>
                <Button onClick={() => this.editExperiment()} style={{marginLeft: 8}}>编辑实验</Button>
                <Button onClick={() => this.startExperiment()} type="primary" style={{marginLeft: 8}}>执行实验</Button>
            </Affix>
        );
    }

    experimentTaskRender = () => {
        const {loading, tasks, page, pageSize, total, query, getTaskByExperimentId} = this.props;
        const experimentId = ExperimentDetail.getExperimentId();

        return (
            <div id={"Task"}>
                <Descriptions title="实验任务列表"></Descriptions>
                <Table columns={this.TaskColumns}
                       dataSource={loading ? [] : tasks}
                       locale={{
                           emptyText: <span><a>任务不存在</a></span>
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
            <Descriptions title="实验信息" extra={this.experimentOperationRender()}>
                <Descriptions.Item label="实验名称">{experimentName ? experimentName : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{createTime ? createTime : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label="总执行次数">{taskCount ? taskCount : 0}</Descriptions.Item>
                <Descriptions.Item
                    label="上次执行时间">{lastTaskCreateTime ? lastTaskCreateTime : '未执行'}</Descriptions.Item>
                <Descriptions.Item label="上次执行状态">
                    {TaskInfo.statusRender(lastTaskStatus, lastTaskResult)}
                </Descriptions.Item>

            </Descriptions>
        );
    }

    experimentMachineRender = () => {
        const {dimension, machines} = this.props;
        return (
            <Descriptions title="实验范围" bordered>
                <Descriptions.Item label="实验维度" span={3}>{dimension ? dimension : '主机维度'}</Descriptions.Item>
                <Descriptions.Item label="实验机器" span={3}>
                    <Row gutter={8}>
                        {_.isEmpty(machines) ? <Col>无机器</Col>
                            :
                            machines.map(machine => {
                                let m = '';
                                switch (dimension) {
                                    case ExperimentCreatingTabKey.HOST:
                                        m= machine.ip;
                                        break;
                                    case ExperimentCreatingTabKey.NODE:
                                        m= machine.nodeName;
                                        break;
                                    case ExperimentCreatingTabKey.POD:
                                        m= _.join([machine.namespace, machine.podName], '/');
                                        break;
                                    case ExperimentCreatingTabKey.CONTAINER:
                                        m= _.join([machine.namespace, machine.podName, machine.containerName], '/');
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
            <Descriptions title="实验场景" bordered column={4}>
                <Descriptions.Item label="场景名称"
                                   span={2}>{scenario && scenario.name ? scenario.name : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label="场景目录"
                                   span={2}>{scenario && scenario.categories ? scenario.categories[0].categoryName : 'unknown'}</Descriptions.Item>
                <Descriptions.Item label="场景参数" span={4}>
                    <Row gutter={8}>
                        {(scenario && !_.isEmpty(scenario.parameters)) ?
                            scenario.parameters.map(param => {
                                if (param.value === undefined || param.value === null) {
                                    return;
                                }
                                return <Col span={6}>{param.name}:{param.value}</Col>;
                            }) : <Col>无参数</Col>}
                    </Row>
                </Descriptions.Item>
            </Descriptions>
        );
    }

    experimentMonitorRender = () => {
        const {metrics} = this.props;
        if (_.isEmpty(metrics)) {
            return (
                <Descriptions title="实验监控" bordered column={4}>
                    <Descriptions.Item span={4}>无数据</Descriptions.Item>
                </Descriptions>
            );
        }
        const metric = metrics[0];
        return (
            <Descriptions title="实验监控" bordered column={4}>
                {_.isEmpty(metrics) ?
                    <Descriptions.Item span={4}>无数据</Descriptions.Item>
                    :
                    <>
                        <Descriptions.Item label="稳态名称"
                                           span={2}>{metric.name ? metric.name : 'unknown'}</Descriptions.Item>
                        {/*<Descriptions.Item label="监控图形"*/}
                        {/*                   span={2}>{monitor.component ? monitor.component.chart : 'unknown'}</Descriptions.Item>*/}
                        <Descriptions.Item label="稳态预期" span={2}>稳态预期</Descriptions.Item>
                        <Descriptions.Item label="兜底策略" span={2}>兜底策略</Descriptions.Item>
                        <Descriptions.Item label="配置参数" span={2}>
                            <Row gutter={8}>
                                {(!_.isEmpty(metric.params)) ?
                                    metric.params.map(param => {
                                        return <Col span={6}>{param.name}:{param.value}</Col>;
                                    }) : <Col>无参数</Col>}
                            </Row>
                        </Descriptions.Item>
                        <Descriptions.Item label="测试数据图表" span={2}>
                            Come soon...
                        </Descriptions.Item>
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
            title: "序号",
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: "任务ID",
            dataIndex: "taskId",
            key: "taskId",
            className: `${styles.hidden}`
        },
        {
            title: "名称",
            dataIndex: 'taskName',
            key: 'taskName',
        },
        {
            title: "状态",
            dataIndex: 'taskStatus',
            key: 'taskStatus',
            render: (text, record) => {
                let status = Task.getTaskStatus(record.status, record.resultStatus);
                return <span>{status.desc}</span>
            }
        },
        {
            title: "开始时间",
            dataIndex: 'startTime',
            key: 'startTime',
        },
        {
            title: "结束时间",
            dataIndex: 'endTime',
            key: 'endTime',
        },
        {
            title: "操作",
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