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
import {Layout, Menu, Radio} from "antd";
import {NavigationConfig} from "../Component/Metadata/navigation";
import {Link} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import styles from './index.module.scss'
import Actions from "../../actions/Actions";
import {connect} from "react-redux";
import _ from 'lodash';

const {SubMenu} = Menu
const {Sider} = Layout;


class ConsoleSider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
        };
    }

    componentWillMount() {
        const {querySystemInfo} = this.props;
        querySystemInfo()
    }

    changeLocale = e => {
        const {changeLocale} = this.props;
        let locale = e.target.value;
        changeLocale({locale: locale});
    };

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        const {locale} = this.props;
        const {preLocale} = prevProps;
        const {passLocale} = this.props;
        if (!_.isEmpty(locale) && locale !== preLocale) {
            passLocale(locale);
        }
    }

    onCollapse = collapsed => {
        this.setState({collapsed});
    };

    render() {
        const {locale, location, version} = this.props;
        const {collapsed} = this.state;
        return (
            <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
                <div className={styles.changeLocale}>
                    {locale ?
                        <Radio.Group onChange={this.changeLocale} defaultValue={locale}
                                     size={collapsed ? 'small' : 'normal'}>
                            <Radio.Button key="en" value={"en"}>
                                English
                            </Radio.Button>
                            <Radio.Button key="cn" value={"zh"}>
                                中文
                            </Radio.Button>
                        </Radio.Group>
                        :
                        <span></span>
                    }
                </div>
                <h1 className={styles.logo}>{collapsed ? 'CHAOS' : 'CHAOS-PLATFORM'}</h1>
                {
                    version ? <h4 className={styles.logo}>{collapsed ? version : version}</h4> : <span></span>
                }
                <Menu theme="dark"
                      defaultSelectedKeys={['/machine']}
                      selectedKeys={[location.pathname]}
                      mode="inline"
                      defaultOpenKeys={['/overview', '/machine', '/chaostools', '/scenario', '/experiment']}>
                    {NavigationConfig.map(nav => (
                        nav.subs.length === 0 ?
                            <Menu.Item key={nav.key} icon={nav.icon} title={nav.name}>
                                <Link to={nav.path}/>
                                <FormattedMessage id={nav.id}/>
                            </Menu.Item>
                            :
                            <SubMenu key={nav.key} icon={nav.icon} title={
                                <>
                                    <FormattedMessage id={nav.id}/>
                                </>
                            }>
                                {nav.subs.map(
                                    nav => (
                                        <Menu.Item key={nav.key} icon={nav.icon}
                                                   title={nav.name}>
                                            <Link to={nav.path}/>
                                            <FormattedMessage id={nav.id}/>
                                        </Menu.Item>
                                    )
                                )}
                            </SubMenu>
                    ))}
                </Menu>
            </Sider>
        );
    }
}

const mapStateToProps = state => {
    const console = state.sider.toJS();
    return {
        locale: console.locale,
        version: console.version,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        changeLocale: (locale) => dispatch(Actions.changeLocale(locale)),
        querySystemInfo: () => dispatch(Actions.querySystemInfo()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsoleSider);