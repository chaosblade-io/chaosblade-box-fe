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
import {Transfer} from "antd";
import styles from "./index.module.scss";

class MachinesSelection extends React.Component {

    constructor(props) {
        super(props);
    }

    filterOption = (inputValue, option) => {
        return option.description.indexOf(inputValue) > -1;
    };

    render() {
        const {titles, machines, targetKeys, handleChange} = this.props
        return (
            <div className={styles.stepMachineContent}>
                <Transfer
                    dataSource={machines}
                    showSearch
                    targetKeys={targetKeys}
                    onChange={handleChange}
                    filterOption={this.filterOption}
                    render={item => item.ip}
                    pagination={{pageSize: 24}}
                    oneWay
                    listStyle={{width: 510}}
                    titles={titles}
                />
            </div>
        );
    }
}

export default MachinesSelection;