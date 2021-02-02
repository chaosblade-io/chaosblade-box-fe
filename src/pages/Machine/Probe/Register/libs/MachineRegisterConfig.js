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

import AnsibleRegister from "./AnsibleRegister";
import React from "react";
import HelmRegister from "./HelmRegister";
import SshRegister from "./SshRegister";
import ManualRegister from "./ManualRegister";
import ansibleLogo from '../../../../../assets/images/machine/ansible-logo.png'

const AnsibleRegisterConfig = {
    id: "page.machine.register.ansible",
    key: "ansible",
    imgAlt: "ansible",
    imgSrc: ansibleLogo,
    content: <AnsibleRegister/>,
};
const SshRegisterConfig = {
    id: "page.machine.register.ssh",
    key: "ssh",
    imgAlt: "ssh",
    imgSrc: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png",
    content: <SshRegister/>,
};
const ManualRegisterConfig = {
    id: "page.machine.register.manual",
    key: "manual",
    imgAlt: "manual",
    imgSrc: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png",
    content: <ManualRegister/>,
};
const HelmRegisterConfig = {
    id: "page.machine.register.helm",
    key: "helm",
    imgAlt: "helm",
    imgSrc: "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png",
    content: <HelmRegister/>,
};

export const HostRegisterConfig = [
    AnsibleRegisterConfig,
    SshRegisterConfig,
    ManualRegisterConfig,
]

export const KubernetesRegisterConfig = [
    HelmRegisterConfig,
]

export const ApplicationRegisterConfig = [
    AnsibleRegisterConfig,
    SshRegisterConfig,
    ManualRegisterConfig,
    HelmRegisterConfig,
]