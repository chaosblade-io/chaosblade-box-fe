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

import 'antd/dist/antd.less';
// import 'antd/dist/antd.dark.less'; // 引入官方提供的暗色 less 样式入口文件
// import 'antd/dist/antd.compact.less'; // 引入官方提供的紧凑 less 样式入口文件
import PathRouter from "./PathRouter";

import {Layout, Menu} from 'antd';
import React from "react";
import './index.css'
import {withRouter} from "react-router-dom";
import HeaderBar from "./pages/Component/HeaderBar";
import configureStore from "./stores/configureStore";
import {createBrowserHistory} from 'history';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';

import {IntlProvider} from 'react-intl';
import {Messages} from "./locales";
import HistoryContext from "./libs/Request/HistoryContext";
import Error from "./pages/Error";
import ConsoleSider from "./pages/Sider";

const {SubMenu} = Menu
const {Header, Content, Footer, Sider} = Layout;


class Console extends React.Component {
    constructor(props) {
        super(props);
        const {store, persistor} = this.createStore();
        this.store = store;
        this.persistor = persistor;
        this.history = createBrowserHistory();
        this.state = {
            locale: "zh",
        };
    }

    changeLocale = e => {
        this.setState({locale: e.target.value});
    };

    createStore() {
        return {...configureStore()};
    }

    render() {
        const {locale} = this.state;
        const {store, persistor} = this;
        const {location} = this.props;
        return (
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <Error>
                        <HistoryContext.Provider value={this.history}>
                            <Layout style={{minHeight: '100vh'}}>
                                <IntlProvider locale={locale} messages={Messages[locale]}>
                                    <ConsoleSider
                                        location={location}
                                        locale={locale}
                                        changeLocale={this.changeLocale.bind(this)}
                                    />
                                    <Layout className="site-layout">
                                        <Header className="site-layout-background" style={{padding: 0}}/>
                                        <Content style={{margin: '0 16px'}}>
                                            <HeaderBar/>
                                            <div className="site-layout-background"
                                                 style={{padding: 24, minHeight: 360}}>
                                                <PathRouter/>
                                            </div>
                                        </Content>
                                        <Footer style={{textAlign: 'center'}}>
                                            Created by CHAOSBLADE-IO</Footer>
                                    </Layout>
                                </IntlProvider>
                            </Layout>
                        </HistoryContext.Provider>
                    </Error>
                </PersistGate>
            </Provider>
        );
    }
}

export default withRouter(Console);