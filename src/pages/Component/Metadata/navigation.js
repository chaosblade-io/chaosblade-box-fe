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

import {DesktopOutlined, FileOutlined, ProjectOutlined} from "@ant-design/icons";
import React from "react";

export const NavigationConfig = [
    {
        id: "menu.machine",
        key: "/machine",
        path: "/machine",
        name: "机器管理",
        icon: <DesktopOutlined/>,
        subs: [
            {
                id: "menu.machine.list",
                key: "/machine/list",
                path: "/machine/list",
                name: "机器列表",
            },
            {
                id: "menu.machine.register",
                key: "/machine/register",
                path: "/machine/register",
                name: "机器注册",
            },
            {
                id: "menu.machine.probe",
                key: "/machine/probe",
                path: "/machine/probe",
                name: "探针管理",
            },
        ]
    },
    {
        id: "menu.chaostools",
        key: "/chaostools",
        path: "/chaostools",
        name: "实验工具",
        icon: <ProjectOutlined/>,
        subs: [
            {
                id: "menu.chaostools.market",
                key: "/chaostools/market",
                path: "/chaostools/market",
                name: "工具市场",
            },
        ]
    },
    {
        id: "menu.scenario",
        key: "/scenario",
        path: "/scenario",
        name: "场景管理",
        icon: <FileOutlined/>,
        subs: [
            {
                id: "menu.scenario.list",
                key: "/scenario/list",
                path: "/scenario/list",
                name: "场景列表",
            },
            {
                id: "menu.scenario.category",
                key: "/scenario/category",
                path: "/scenario/category",
                name: "场景目录",
            }
        ]
    },
    {
        id: "menu.experiment",
        key: "/experiment",
        path: "/experiment",
        name: "实验管理",
        icon: <ProjectOutlined/>,
        subs: [
            {
                id: "menu.experiment.list",
                key: "/experiment/list",
                path: "/experiment/list",
                name: "实验列表",
            },
            {
                id: "menu.experiment.creating",
                key: "/experiment/creating",
                path: "/experiment/creating",
                name: "创建实验",
            },
        ]
    },
]
