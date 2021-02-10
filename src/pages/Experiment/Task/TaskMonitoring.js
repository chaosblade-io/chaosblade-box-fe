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
import Actions from "../../../actions/Actions";
import {Line} from '@antv/g2plot';
import Task from "./index";
import _ from 'lodash';
import {ExperimentConstants} from "../../../constants/ExperimentConstants";

const chartOptions = {
    data: [],
    padding: 'auto',
    xField: 'date',
    yField: 'value',
    // seriesField: 'ip',
    color: '#F4664A',
    yAxis: {
        label: {
            formatter: (v) => Number(v),
        },
    },
    annotations: [
        {
            top: true,
            type: 'regionFilter',
            start: ['min', 'median'],
            end: ['max', '0'],
            color: '#4aa5f4',
        },
        {
            type: 'text',
            position: ['min', 'median'],
            content: '中位数',
            offsetY: -4,
            style: {
                textBaseline: 'bottom',
                stroke: '#F4664A'
            },
        },
        {
            type: 'line',
            start: ['min', 'median'],
            end: ['max', 'median'],
            style: {
                stroke: '#F4664A',
                lineDash: [2, 2],
            },
        },
    ],
};

class TaskMonitoring extends React.Component {

    constructor(props) {
        super(props);
    }

    taskMetricsRender() {
        const taskId = Task.getTaskId();
        const {queryTaskMonitor} = this.props;
        queryTaskMonitor({taskId});
        this.updateChart();
    }

    updateChart() {
        const {metrics, status, resultStatus} = this.props;
        console.log(metrics);
        if (_.isEmpty(metrics)) {
            return;
        }
        if (_.isEmpty(this.chart)) {
            this.chart = new Line('monitor', chartOptions);
            this.chart.render();
        }
        chartOptions.data = metrics;
        this.chart.update(chartOptions);
        const taskStatus = Task.getTaskStatus(status, resultStatus);
        if (taskStatus === ExperimentConstants.TASK_END_SUCCESS) {
            clearInterval(this.metricTime);
        }
    }

    componentDidMount() {
        this.metricTime = setInterval(() => {
            this.taskMetricsRender();
        }, 3000)
    }

    componentWillUnmount() {
        clearInterval(this.metricTime);
    }

    render() {
        const {metrics} = this.props;
        return <div>
            <div id={"monitor"}>{_.isEmpty(metrics) ? '暂无数据' : ''}</div>
        </div>
    }
}

const mapStateToProps = state => {
    const detail = state.taskDetail.toJS();
    const {monitor} = detail;
    return {
        name: monitor.name,
        metrics: monitor.metrics,
        status: detail.status,
        resultStatus: detail.resultStatus,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        queryTaskMonitor: (query) => dispatch(Actions.queryTaskMonitor(query)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TaskMonitoring);