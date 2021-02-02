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
import {Col, Row, Space, Table} from "antd";
import {getEmptyContent, getSearchForm} from "../../../libs/Search";
import {GenPagination} from "../../../libs/Pagination";
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {FormattedMessage} from "react-intl";
import styles from "./List.module.scss"
import * as request from "../../Machine/libs/request";
import _ from "lodash";
import Task from "../Task";
import {ExperimentConstants} from "../../../constants/ExperimentConstants";

const InputSearchFields = [
    {
        key: "experimentName",
        name: "experimentName",
        label: "实验名称",
        placeholder: "请填写实验名称"
    },
];

const SelectSearchFields = [
    {
        key: "status",
        name: "status",
        label: "实验状态",
        placeholder: "请选择实验状态",
        options: [
            ExperimentConstants.TASK_WAIT,
            ExperimentConstants.TASK_SUCCESS,
            ExperimentConstants.TASK_FAILED,
            ExperimentConstants.TASK_RUNNING
        ]
    },
];

class ExperimentList extends React.Component {

    formRef = React.createRef()

    static defaultProps = {
        InputSearchFields: InputSearchFields,
        SelectSearchFields: SelectSearchFields,
    }

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    componentDidMount() {
        const {query, page, pageSize, getExperimentsPageable} = this.props
        getExperimentsPageable({...query, page: page, pageSize: pageSize})
    }

    onFinish = (values) => {
        const {query, page, pageSize, getExperimentsPageable} = this.props
        getExperimentsPageable({...query, page: page, pageSize: pageSize, ...values})
    };

    render() {
        const {loading, experiments, page, total, pageSize, query, getExperimentsPageable} = this.props;
        return (
            <div className="application-machine-table">
                {getSearchForm(this)}
                <Table columns={this.TableColumns}
                       dataSource={loading ? [] : experiments}
                       primaryKey="experimentId"
                       locale={{
                           emptyText: getEmptyContent("实验不存在", "查找不到实验", query)
                       }}
                       loading={loading}
                       pagination={GenPagination(page, pageSize, total,
                           (page, pageSize) => getExperimentsPageable({...query, page, pageSize}))}
                />
            </div>
        )
    }

    TableColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            key: "index",
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: "实验ID",
            dataIndex: "experimentId",
            key: "experimentId",
            className: `${styles.hidden}`
        },
        {
            title: '演练名称',
            dataIndex: 'experimentName',
            key: 'experimentName',
        },
        {
            title: '最近运行状态',
            dataIndex: 'lastTaskResult',
            key: 'lastTaskResult',
            render: (text, record) => {
                const status = Task.getTaskStatus(record.lastTaskStatus, record.lastTaskResult);
                return <span>{status.desc}</span>
            }
        },
        {
            title: '场景概览',
            dataIndex: 'scenarios',
            key: 'scenarios',
            render: (text, record) => {
                let rows = []
                if (!_.isEmpty(text)) {
                    text.map(scenario => {
                        rows.push(
                            <Row>
                                <Col><a onClick={() => {
                                }}>{scenario.name}</a></Col>
                            </Row>
                        )
                    })
                }
                return (
                    <div>
                        {rows}
                    </div>
                );
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '修改时间',
            dataIndex: 'modifyTime',
            key: 'modifyTime',
        },
        {
            title: '最近运行时间',
            dataIndex: 'lastTaskStartTime',
            key: 'lastTaskStartTime',
        },
        {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => (
                <Space size="middle">
                    <a href={`/experiment/detail/?${request.generateUrlSearch({id: record.experimentId})}`}>详情</a>
                </Space>
            ),
        },
    ];
}

const mapStateToProps = state => {
    const experiment = state.experiment.toJS();
    return {
        loading: experiment.loading,
        refreshing: experiment.refreshing,
        experiments: experiment.experiments,
        pageSize: experiment.pageSize,
        page: experiment.page,
        pages: experiment.pages,
        total: experiment.total,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getExperimentsPageable: query => dispatch(Actions.getExperimentsPageable(query))
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(ExperimentList);