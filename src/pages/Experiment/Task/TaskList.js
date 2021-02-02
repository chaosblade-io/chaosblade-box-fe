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
import {Space, Table} from "antd";
import Task from "./index";

class TaskList extends React.Component {
    render() {
        return (
            <div><span>演练任务列表</span>
                <Table columns={this.TableColumns}
                       dataSource={[]}
                />
            </div>

        );
    }

    TableColumns = [
        {
            title: "开始时间",
            dataIndex: "startTime",
            key: "startTime",
        },
        {
            title: "结束时间",
            dataIndex: "endTime",
            key: "endTime",
        },
        {
            title: "实验状态",
            dataIndex: "taskStatus",
            key: "taskStatus",
            render: (text, record) => {
                let status = Task.getTaskStatus(record.status, record.resultStatus);
                return <span>{status.desc}</span>
            }
        },
        {
            title: "操作",
            dataIndex: "operator",
            key: "operator",
            render: (text, record) => (
                <Space size="middle">
                    <a>详情</a>
                    <a>删除</a>
                </Space>
            )
        }
    ]
}

export default TaskList;