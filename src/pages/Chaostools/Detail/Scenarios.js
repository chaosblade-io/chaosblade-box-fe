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
import {Alert, Button, Table, Tabs} from "antd";
import {FormattedMessage} from "react-intl";
import _ from 'lodash';
import ChaostoolsDetail from "./index";

const {TabPane} = Tabs;

class Scenarios extends React.Component {

    TableColumns = [
        {
            title: <FormattedMessage id={"page.machine.host.column.title.index"}/>,
            key: "index",
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: 'name',
            key: "name",
            dataIndex: 'name',
        },
        {
            title: 'longDesc',
            key: "longDesc",
            dataIndex: 'longDesc',
        },
    ]

    constructor(props) {
        super(props);
    }

    importScenarios = (scenarios, file) => {
        const {name, version, importScenarios} = this.props;
        importScenarios({name, version, scenarios}, file);
    }

    fetchScenarios = () => {
        const {fetchChaostoolsScenarios, version, scenarioFiles} = this.props;
        if (!_.isEmpty(scenarioFiles)) {
            const name = ChaostoolsDetail.getToolsName();
            scenarioFiles.map(file => fetchChaostoolsScenarios(name, version, file));
        }
    }

    componentDidMount() {
        this.fetchScenarios();
    }

    render() {
        const {scenarios} = this.props;
        return (
            <div>
                <h3 id="scenarios">实验场景列表</h3>
                <Tabs>
                    {
                        !_.isEmpty(scenarios) ? scenarios.map(item => {
                                return (
                                    <TabPane tab={item.file} key={item.file}>
                                        {
                                            item.importScenarioCount > 0 ?
                                                <Alert message={"成功导入 "+item.importScenarioCount+" 个场景"} type="success"/>
                                                :
                                                <Button
                                                    onClick={() => this.importScenarios(item.scenarios, item.file)}>导入实验场景</Button>
                                        }
                                        <Table columns={this.TableColumns}
                                               rowKey={record => record.index}
                                               dataSource={item.scenarioList}
                                               locale={{
                                                   emptyText: <span>没有场景数据，请点击
                                   <a>&nbsp;刷新&nbsp;</a>重试
                               </span>
                                               }}
                                        />
                                    </TabPane>
                                );
                            }) :
                            <span>暂无数据</span>
                    }
                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const detail = state.chaostoolsDetail.toJS();
    const {scenarios, versionInfo, tools} = detail;
    return {
        name: tools.name,
        version: versionInfo.version,
        scenarioFiles: versionInfo.scenarioFiles,
        scenarios: scenarios,
    }

}
const mapDispatchToProps = dispatch => {
    return {
        fetchChaostoolsScenarios: (name, version, file) => dispatch(Actions.fetchChaostoolsScenarios(name, version, file)),
        importScenarios: (scenarios, file) => dispatch(Actions.importScenarios(scenarios, file)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Scenarios);