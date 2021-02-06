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
import Actions from "../../../actions/Actions";
import {connect} from "react-redux";
import {Col, Row, Space, Table} from "antd";
import {getSearchForm} from "../../../libs/Search";
import {GenPagination} from "../../../libs/Pagination";
import {FormattedMessage} from "react-intl";
import styles from './index.module.scss';
import * as request from "../../Machine/libs/request";
import {ScenarioConstants} from "../../../constants/ScenarioConstants";
import _ from "lodash";

const SelectSearchFields = [
    {
        key: "status",
        name: "status",
        label: "状态",
        placeholder: "请选择场景状态",
        options: [
            ScenarioConstants.STATUS_READY,
            ScenarioConstants.STATUS_PUBLISH
        ]
    },
]

const InputSearchFields = [
    {
        key: "name",
        name: "name",
        label: "场景名",
        placeholder: "请填写场景名"
    },
    {
        key: "code",
        name: "code",
        label: "唯一码",
        placeholder: "请填写唯一码"
    }
]


class ScenarioList extends React.Component {

    static defaultProps = {
        InputSearchFields: InputSearchFields,
        SelectSearchFields: SelectSearchFields,
    }
    formRef = React.createRef()

    constructor(props) {
        super(props);
        this.state = {
            query: props.query || {},
        };
    }

    componentDidMount() {
        const {query, page, pageSize, getScenariosPageable, getScenarioCategories} = this.props
        getScenariosPageable({...query, page: page, pageSize: pageSize});
        getScenarioCategories();
    }

    onFinish = (values) => {
        const {query, page, pageSize, getScenariosPageable} = this.props
        getScenariosPageable({...query, page: page, pageSize: pageSize, ...values})
    };

    online = (scenarioId) => {
        const {unbanScenario} = this.props;
        unbanScenario({scenarioId});
    }

    offline = (scenarioId) => {
        const {banScenario} = this.props;
        banScenario({scenarioId});
    }

    edit = (scenarioId) => {
        const {history} = this.props;
        history.push(`/scenario/detail/?${request.generateUrlSearch({id: scenarioId})}`);
    }

    TableColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            index: "index",
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: "场景ID",
            dataIndex: "scenarioId",
            key: "scenarioId",
            className: `${styles.hidden}`
        },
        {
            title: '场景名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '唯一码',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                return <span>{ScenarioConstants.STATUS[text].desc}</span>
            }
        },
        {
            title: '类目',
            dataIndex: 'categories',
            key: 'categories',
            render: (text, record) => {
                let rows = []
                if (!_.isEmpty(text)) {
                    text.map(category => {
                        rows.push(
                            <Row>
                                <Col>{category.categoryName}</Col>
                            </Row>
                        )
                    })
                }
                return (
                    <div>
                        {_.isEmpty(rows) ? <span>未配置</span> : rows}
                    </div>
                );
            }
        },
        {
            title: '来源',
            dataIndex: 'original',
            key: 'original'
        },
        {
            title: '版本号',
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: '调用次数',
            dataIndex: 'count',
            key: 'count'
        },
        {
            title: '操作', dataIndex: "operation", key: "operation", render: (text, record) => {
                const scenarioId = record.scenarioId;
                return (
                    <Space size="middle">
                        {
                            record.status === ScenarioConstants.STATUS_READY.code ?
                                <a onClick={this.online.bind(this, scenarioId)}>上架</a>
                                :
                                <a onClick={this.offline.bind(this, scenarioId)}>下架</a>
                        }
                        <a onClick={this.edit.bind(this, scenarioId)}>编辑</a>
                    </Space>
                );
            },
        },
    ]

    render() {
        const {loading, scenarios, page, total, pageSize, query, getScenariosPageable} = this.props;
        return (
            <div className="application-machine-table">
                {getSearchForm(this)}
                <Table columns={this.TableColumns}
                       dataSource={loading ? [] : scenarios}
                       primaryKey="scenarioId"
                       loading={loading}
                       rowKey={record => record.code}
                       pagination={GenPagination(page, pageSize, total, (page, pageSize) => getScenariosPageable({
                           ...query,
                           page,
                           pageSize
                       }))}
                />
            </div>
        )
    }
}

const mapStateToProps = state => {
    const scenario = state.scenario.toJS();
    return {
        loading: scenario.loading,
        refreshing: scenario.refreshing,
        scenarios: scenario.scenarios,
        pageSize: scenario.pageSize,
        page: scenario.page,
        pages: scenario.pages,
        total: scenario.total,
        categories: scenario.categories,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getScenarioCategories: query => dispatch(Actions.getScenarioCategories(query)),
        getScenariosPageable: query => dispatch(Actions.getScenariosPageable(query)),
        banScenario: scenarioId => dispatch(Actions.banScenario(scenarioId)),
        unbanScenario: scenarioId => dispatch(Actions.unbanScenario(scenarioId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioList);