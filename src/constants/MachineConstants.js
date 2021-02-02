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

const MachineConstants = {

    MACHINE_STATUS_WAIT: {
        code: 0,
        desc: "page.machine.status.wait",
    },
    MACHINE_STATUS_INSTALLING: {
        code: 1,
        desc: "page.machine.status.installing",
    },
    MACHINE_STATUS_INSTALL_FAILED: {
        code: -1,
        desc: "page.machine.status.install.failed",
    },
    MACHINE_STATUS_ONLINE: {
        code: 2,
        desc: "page.machine.status.online",
    },
    MACHINE_STATUS_OFFLINE: {
        code: 3,
        desc: "page.machine.status.offline",
    },
    MACHINE_STATUS_UNINSTALLING: {
        code: 4,
        desc: "page.machine.status.uninstalling",
    },
    MACHINE_STATUS_UNINSTALL_FAILED: {
        code: 5,
        desc: "page.machine.status.uninstall.failed",
    },
    MACHINE_STATUS_BANING: {
        code: 9,
        desc: 'page.machine.status.baning',
    },

    MACHINE_STATUS: {
        "0": "page.machine.status.wait",
        "1": "page.machine.status.installing",
        "-1": "page.machine.status.install.failed",
        "2": "page.machine.status.online",
        "3": "page.machine.status.offline",
        "4": "page.machine.status.uninstalling",
        "5": "page.machine.status.uninstall.failed",

        "9": 'page.machine.status.baning',
    },

    MACHINE_TYPE_HOST: {
        code: 0,
        desc: "host"
    },
    MACHINE_TYPE_NODE: {
        code: 1,
        desc: "node",
    },
    MACHINE_TYPE_POD: {
        code: 2,
        desc: "pod",
    },

}

export default MachineConstants;
