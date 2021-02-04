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
import {Typography} from "antd";
import {connect} from "react-redux";
import Actions from "../../../actions/Actions";
import {Line} from '@antv/g2plot';
import Task from "./index";
import _ from 'lodash';

const {Paragraph, Text} = Typography;

class TaskMonitoring extends React.Component {

    constructor(props) {
        super(props);
    }

    handleTaskMonitor() {
        const taskId = Task.getTaskId();
        const {queryTaskMonitor} = this.props;
        queryTaskMonitor({taskId});
    }

    componentDidMount() {
        this.handleTaskMonitor()
        this.logTime = setInterval(() => {
            this.handleTaskMonitor();
        }, 5000)
    }

    componentWillUnmount() {
        clearInterval(this.logTime);
    }

    render() {
        const {metrics} = this.props;
        if (_.isEmpty(metrics)) {
            return (
                <Paragraph id={"monitor"} style={{height: "100%"}}>暂无数据</Paragraph>
            )
        }
        this.metricsRender();
        return (
            <Paragraph id={"monitor"} style={{height: "100%"}}></Paragraph>
        );
    }

    metricsRender = () => {
        const {metrics} = this.props;
        if (_.isEmpty(metrics)) {
            return;
        }
        const line = new Line('monitor', {
            data: metrics,
            padding: 'auto',
            xField: 'date',
            yField: 'value',
            seriesField: 'ip',
            xAxis: {
                type: 'time',
            },
            // yAxis: {
            //     label: {
            //         // 数值格式化为千分位
            //         formatter: (v) => Number(v) / (1024*1024),
            //     },
            // },
            annotations: [
                // 低于中位数颜色变化
                {
                    top: true,
                    type: 'regionFilter',
                    start: ['min', 'median'],
                    end: ['max', '0'],
                    color: '#F4664A',
                },
                {
                    type: 'text',
                    position: ['min', 'median'],
                    content: '中位数',
                    offsetY: -4,
                    style: {
                        textBaseline: 'bottom',
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
        });
        line.render();
    }
}

const mapStateToProps = state => {
    const detail = state.taskDetail.toJS();
    return {
        metrics: detail.metrics,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        queryTaskMonitor: (query) => dispatch(Actions.queryTaskMonitor(query)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TaskMonitoring);