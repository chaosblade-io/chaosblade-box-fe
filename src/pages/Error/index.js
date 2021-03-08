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

import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import queryString from 'query-string';
import Actions from "../../actions/Actions";
import {message} from "antd";

class Error extends Component {

    constructor(props) {
        super(props);
        this.state = {
            errorCode: -1,
            errorMessage: null,
        }
    }

    static getDerivedStateFromProps(nextProps) {
        const {errorCode, errorMessage, clearError} = nextProps;
        if (errorCode > -1 && !_.isEmpty(errorMessage)) {
            clearError && clearError();
            message.error(errorMessage);
        }
        return null;
    }

    componentDidCatch(error, errorInfo) {
        const {handlerCriticalError} = this.props;
        handlerCriticalError && handlerCriticalError(error.stack);

        if (this.isDebug()) {
            window.location.href = '/500';
        } else {
            return message.error('发生未知错误！', 2, onclose);
        }
    }

    isDebug() {
        const parsed = queryString.parse(window.location.search);
        return !_.isEmpty(parsed)
            && !_.isUndefined(parsed.debug)
            && !_.isNull(parsed.debug)
            && (parsed.debug === '1' || parsed.debug === 1);
    }

    render() {
        const {children} = this.props;
        return (
            <Fragment>
                {children}
            </Fragment>
        );
    }

}

const mapPropsToState = state => {
    const error = state.error.toJS();
    return {
        requestId: error.requestId,
        errorCode: error.code,
        errorMessage: error.message
    };
};

const mapDispatchToState = dispatch => {
    return {
        clearError: () => dispatch(Actions.clearError()),
        handlerCriticalError: error => dispatch(Actions.handleCriticalError(error))
    };
};

export default connect(mapPropsToState, mapDispatchToState)(Error);