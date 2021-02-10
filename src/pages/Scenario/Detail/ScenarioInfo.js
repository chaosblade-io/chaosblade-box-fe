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
import {Button, Descriptions, PageHeader} from "antd";
import {ScenarioConstants} from "../../../constants/ScenarioConstants";
import Actions from "../../../actions/Actions";
import ScenarioInfoForm from "./ScenarioInfoForm";
import _ from 'lodash'

class ScenarioInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            scenarioFormVisible: false,
        }
    }

    componentDidMount() {
        const {getScenarioCategories} = this.props;
        getScenarioCategories({});
    }


    edit = () => {
        this.setState({scenarioFormVisible: true})
    }

    onScenarioFormChange = (visible) => {
        this.setState({scenarioFormVisible: visible})
    }

    render() {
        const {
            name,
            description,
            code,
            status,
            createTime,
            modifyTime,
            original,
            version,
            supportScopeTypes,
            categoryIds
        } = this.props;
        const {scenarioFormVisible} = this.state;
        const categoryNames = [];
        if (!_.isEmpty(categoryIds)) {
            categoryIds.map(category => categoryNames.push(category.categoryName))
        }
        return (
            <div>
                <PageHeader
                    onBack={() => window.history.back()}
                    title={name}
                    subTitle={description}
                    extra={[
                        <Button key="edit" type="primary" onClick={() => this.edit()}>
                            编辑信息
                        </Button>,
                    ]}
                >
                    <ScenarioInfoForm
                        visible={scenarioFormVisible}
                        categoryIds={categoryIds}
                        onChange={this.onScenarioFormChange.bind(this)}
                    />
                    <Descriptions size="default" column={2}>
                        <Descriptions.Item label="code">{code}</Descriptions.Item>
                        <Descriptions.Item
                            label="status">{status ? ScenarioConstants.STATUS[status].desc : 'unknown'}</Descriptions.Item>
                        <Descriptions.Item label="original">{original}</Descriptions.Item>
                        <Descriptions.Item label="version">{version}</Descriptions.Item>
                        <Descriptions.Item label="createTime">{createTime}</Descriptions.Item>
                        <Descriptions.Item label="modifyTime">{modifyTime}</Descriptions.Item>
                        <Descriptions.Item label="supportScopeTypes">{supportScopeTypes}</Descriptions.Item>
                        <Descriptions.Item label="categoryIds">
                            {categoryNames.map(name => <span>{name}&nbsp;</span>)}
                        </Descriptions.Item>
                    </Descriptions>
                </PageHeader>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const scenario = state.scenarioDetail.toJS();
    return {
        loading: scenario.loading,
        scenarioId: scenario.scenarioId,
        name: scenario.name,
        code: scenario.code,
        description: scenario.description,
        status: scenario.status,
        version: scenario.version,
        original: scenario.original,
        supportScopeTypes: scenario.supportScopeTypes,
        categoryIds: scenario.categoryIds,
        createTime: scenario.createTime,
        modifyTime: scenario.modifyTime,
        categories: scenario.categories,
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getScenarioCategories: query => dispatch(Actions.getScenarioCategories(query))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioInfo);