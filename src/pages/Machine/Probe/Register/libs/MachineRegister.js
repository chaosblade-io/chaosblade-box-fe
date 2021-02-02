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
import {Card, Col, Row, Tabs} from "antd";
import {FormattedMessage} from "react-intl";

const {TabPane} = Tabs

class MachineRegister extends React.Component {
    render() {
        const {config, description} = this.props;
        return (
            <div>
                <Row>
                    <Tabs defaultActiveKey="ansible" card={"card"}>
                        {
                            config.map(item => (
                                    <TabPane
                                        tab={
                                            <Col span={4}>
                                                <Card
                                                    style={{width: 300}}
                                                    bordered={true}
                                                    hoverable={true}
                                                    title={
                                                        <>
                                                            <FormattedMessage id={item.id}/>
                                                        </>
                                                    }

                                                    cover={<img alt={item.imgAlt} src={item.imgSrc}
                                                                style={{
                                                                    width: 296,
                                                                    height: 182
                                                                }}/>}
                                                />
                                            </Col>
                                        }
                                        key={item.key}>
                                        {item.content}
                                    </TabPane>
                                )
                            )
                        }
                    </Tabs>
                </Row>
            </div>
        );
    }
}

export default MachineRegister;