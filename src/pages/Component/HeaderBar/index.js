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
import {Breadcrumb} from "antd";
import styles from './HeaderBar.module.scss'
import {Link, withRouter} from 'react-router-dom';
import {NavigationConfig} from "../Metadata/navigation";

const NavigationMap = NavigationConfig.reduce((map, obj) => {
    map[obj.path] = obj.name;
    if (obj.subs.length > 0) {
        obj.subs.reduce(
            (_, sub) => {
                map[sub.path] = sub.name;
                return map
            }, {}
        )
    }
    return map;
}, {})

const HeaderBar = withRouter(props => {
    const {location} = props;
    console.log(location)
    const pathSnippets = location.pathname.split('/').filter(i => i);
    console.log(pathSnippets);
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        console.log({url})

        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{NavigationMap[url]}</Link>
            </Breadcrumb.Item>
        );
    });
    const breadcrumbItems = [].concat(extraBreadcrumbItems);
    return (
        <Breadcrumb className={styles.Breadcrumb}>{breadcrumbItems}</Breadcrumb>
    );
});

export default HeaderBar;