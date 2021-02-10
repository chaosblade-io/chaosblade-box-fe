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
import _ from 'lodash'
import queryString from "query-string";
import ParameterList from "./ParameterList";
import ScenarioInfo from "./ScenarioInfo";
import {Divider, Spin} from "antd";

class ScenarioDetail extends React.Component {

    constructor(props) {
        super(props);
    }

    static getScenarioId() {
        const parsed = queryString.parse(window.location.search);
        const {id} = parsed;
        return id;
    }

    componentDidMount() {
        const {getScenarioById} = this.props;
        const id = ScenarioDetail.getScenarioId();
        getScenarioById({scenarioId: id})
    }

    onFinish = (values) => {
        const {updateScenario, scenario} = this.props;
        const supportScopeTypes = [values.supportScopeTypes];
        const categoryIds = [values.categoryIds];
        _.merge(scenario, {categoryIds, supportScopeTypes})
        updateScenario(scenario)
    }

    render() {
        const {name, loading} = this.props;
        return _.isEmpty(name) ? <Spin spinning={loading}></Spin>
            :
            <div>
                <ScenarioInfo/>
                <Divider dashed/>
                <ParameterList/>
            </div>
    }
}

const mapStateToProps = state => {
    const scenario = state.scenarioDetail.toJS();
    return {
        loading: scenario.loading,
        name: scenario.name,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getScenarioById: scenarioId => dispatch(Actions.getScenarioById(scenarioId)),
        updateScenario: scenario => dispatch(Actions.updateScenario(scenario)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioDetail);