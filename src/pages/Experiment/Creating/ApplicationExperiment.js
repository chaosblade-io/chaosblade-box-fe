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
import ExperimentSteps from "./ExperimentSteps";
import styles from "./index.module.scss";
import MachinesSelection from "./MachinesSelection";
import {Alert, Divider, Select} from "antd";

const {Option} = Select;

const provinceData = ['Zhejiang', 'Jiangsu'];
const cityData = {
    Zhejiang: ['Hangzhou', 'Ningbo', 'Wenzhou'],
    Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang'],
};

class ApplicationExperiment extends React.Component {
    constructor() {
        super();
        this.state = {
            creatingStepCurrent: 0,
            cities: cityData[provinceData[0]],
            secondCity: cityData[provinceData[0]][0],
        }
    }

    changeCreatingStepCurrentValue = (value) => {
        this.setState({creatingStepCurrent: value});
    }

    handleProvinceChange = value => {
        this.setState({cities: cityData[value]});
        this.setState({secondCity: cityData[value][0]});
    };

    onSecondCityChange = value => {
        this.setState({secondCity: value});
    };

    machinesRender = () => {
        const {cities, secondCity} = this.state;
        return (
            <div style={{textAlign: "center"}}>
                <Alert message="请先选择应用，再选择应用分组，然后选择机器进行实验" type="info" showIcon closable/>
                <div style={{paddingLeft: 16, marginTop: 30, marginBottom: 16}}>
                    选择应用：
                    <Select
                        style={{width: 300}}
                        defaultValue={provinceData[0]}
                        onChange={this.handleProvinceChange}
                        showSearch
                        placeholder={"item.placeholder"}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }>
                        {provinceData.map(province => (
                            <Option key={province}>{province}</Option>
                        ))}
                    </Select>
                    <span style={{marginLeft: 30}}>选择应用分组：</span>
                    <Select
                        style={{width: 300}}
                        value={secondCity}
                        showSearch
                        placeholder={"item.placeholder"}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={this.onSecondCityChange}
                    >
                        {cities.map(city => (
                            <Option key={city}>{city}</Option>
                        ))}
                    </Select>
                </div>
                <Divider dashed/>
                <MachinesSelection/>
            </div>
        );
    }

    scenariosRender = () => {
        return (
            <span>选择演练场景</span>
        );
    }

    monitorRender = () => {
        return (
            <span>接入稳态监控</span>
        );
    }

    render() {
        const {creatingStepCurrent} = this.state;
        return (
            <ExperimentSteps current={creatingStepCurrent}
                             onChange={this.changeCreatingStepCurrentValue.bind(this)}
                             steps={[
                                 this.machinesRender(), this.scenariosRender()
                             ]}
            />
        );
    }
}

export default ApplicationExperiment;