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
import {Errors} from "../../../constants/Errors";

const SelectSearchFields = [
    {
        key: "status",
        name: "status",
        label: <FormattedMessage id={"page.scenario.column.title.status"}/>,
        placeholder: <FormattedMessage id={"page.scenario.prompt.status"}/>,
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
        label:<FormattedMessage id={"page.scenario.column.title.scenario_name"}/>,
        placeholder: "page.scenario.prompt.scenario_name",
    },
    {
        key: "code",
        name: "code",
        label: <FormattedMessage id={"page.scenario.column.title.unique_code"}/>,
        placeholder: "page.scenario.prompt.unique_code",
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
        getScenarioCategories({});
    }

    onFinish = (values) => {
        const {query, page, pageSize, getScenariosPageable} = this.props
        getScenariosPageable({...query, page: page, pageSize: pageSize, ...values})
        this.setState({query: values});
    };

    online = (record) => {
        const {unbanScenario, handleError} = this.props;
        if (_.isEmpty(record.categories) || _.isEmpty(record.supportScopeTypes)) {
            handleError(Errors.PARAMETER_ERROR.code, '请先编辑配置 supportScopeTypes 和 categories');
            return;
        }
        unbanScenario({scenarioId: record.scenarioId});
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
            title:  <FormattedMessage id={"page.scenario.column.title.scenario_name"}/>,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <FormattedMessage id={"page.scenario.column.title.unique_code"}/>,
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: <FormattedMessage id={"page.scenario.column.title.status"}/>,
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => {
                return <span>{ScenarioConstants.STATUS[text].desc}</span>
            }
        },
        {
            title: <FormattedMessage id={"page.scenario.column.title.category"}/>,
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
            title:<FormattedMessage id={"page.scenario.column.title.source"}/>,
            dataIndex: 'original',
            key: 'original'
        },
        {
            title: <FormattedMessage id={"page.scenario.column.title.version"}/>,
            dataIndex: 'version',
            key: 'version',
        },
        {
            title: <FormattedMessage id={"page.scenario.column.title.usage_times"}/>,
            dataIndex: 'count',
            key: 'count'
        },
        {
            title: <FormattedMessage id={"page.scenario.column.title.operation"}/>, dataIndex: "operation", key: "operation", render: (text, record) => {
                const scenarioId = record.scenarioId;
                return (
                    <Space size="middle">
                        {
                            record.status === ScenarioConstants.STATUS_READY.code ?
                                <a onClick={this.online.bind(this, record)}><FormattedMessage id={"page.scenario.column.detail.enable"}/></a>
                                :
                                <a onClick={this.offline.bind(this, scenarioId)}><FormattedMessage id={"page.scenario.column.detail.disable"}/></a>
                        }
                        <a onClick={this.edit.bind(this, scenarioId)}><FormattedMessage id={"page.scenario.column.detail.edit"}/></a>
                    </Space>
                );
            },
        },
    ]

    render() {
        const {loading, scenarios, page, total, pageSize, getScenariosPageable} = this.props;
        const {query} = this.state;
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
        handleError: (code, message) => dispatch(Actions.handleError(code, message)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioList);