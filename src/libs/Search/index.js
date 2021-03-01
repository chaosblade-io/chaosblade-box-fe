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

import {Button, Col, Form, Input, Row, Select} from "antd";
import React from "react";
import _ from "lodash";
import './index.css'
import {FormattedMessage} from "react-intl";

export const getFields = (props) => {
    const {InputSearchFields, SelectSearchFields} = props;
    const {Option} = Select;
    const children = [];

    InputSearchFields.map((item) => {
        children.push(
            <Col span={6} key={item.key}>
                <Form.Item name={`${item.name}`} label={`${item.label}`}>
                    <Input placeholder={item.placeholder}/>
                </Form.Item>
            </Col>,
        );
    });
    SelectSearchFields.map(item => {
        children.push(
            <Col span={6} key={item.key}>
                <Form.Item name={`${item.name}`} label={`${item.label}`}>
                    <Select
                        showSearch
                        placeholder={item.placeholder}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }>
                        {item.options.map(option => {
                            return <Option value={option.code} title={option.code} key={option.code}>
                                <FormattedMessage id={option.desc}/>
                            </Option>
                        })}
                    </Select>
                </Form.Item>
            </Col>
        )
    });
    return children;
};

export const getSearch = (self) => {
    return (
        <Col key={"search"} span={6} style={{textAlign: 'right'}}>
            <Button type="primary" htmlType="submit"><FormattedMessage id={"button.text.search"}/></Button>
            <Button style={{margin: '0 8px',}} onClick={() => {
                self.formRef.current.resetFields();
            }}><FormattedMessage id={"button.text.clear"}/></Button>
        </Col>
    )
}


export const getSearchForm = (self) => {
    const col = 4
    const children = getFields(self.props);
    children.push(getSearch(self))
    let rows = []
    let chunk = _.chunk(children, col);
    for (let i = 0; i < chunk.length; i++) {
        rows.push(
            <Row gutter={16} justify={"end"} key={i}>
                {chunk[i]}
            </Row>
        )
    }
    return (
        <Form ref={self.formRef} name="advanced_search" className="ant-advanced-search-form" onFinish={self.onFinish}>
            {rows}
        </Form>
    );
}

export const getEmptyContent = (noDataRender, noSearchResultRender, query) => {
    if (_.isEmpty(query)) {
        return noDataRender
    }
    const {searchKey, state, results} = query;
    if (_.isEmpty(searchKey) && _.isEmpty(state) && _.isEmpty(results)) {
        return noDataRender
    }
    return noSearchResultRender
}

