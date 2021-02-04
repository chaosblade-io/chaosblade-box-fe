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
import Actions from "../../../actions/Actions";
import {
    AndroidOutlined,
    AppleOutlined,
    AppstoreOutlined,
    MailOutlined,
    QuestionCircleOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {Alert, Divider, Form, Input, Layout, Menu, Tabs, Tooltip} from "antd";
import {connect} from "react-redux";
import MachinesSelection from "./MachinesSelection";
import ExperimentSteps from "./ExperimentSteps";

const {TabPane} = Tabs
const {TextArea} = Input
const {SubMenu} = Menu
const {Content, Sider} = Layout;

const FormLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 12},
};
const NodeNameTips = '请填写 Node 名称，多个名称之间使用逗号分隔，例如 aa,bb。必填项';
const PodNamespaceTips = '请填写 Namespace，仅支持填写一个。必填项';
const PodNameTips = '请填写 Pod 名称，多个名称之间使用逗号分隔，例如 aa,bb。必填项';
const ContainerNameTips = '请填写 Container 名称，多个名称之间使用逗号分隔，例如 aa,bb。非必填项';
const ContainerIndexTips = '请填写 Container 索引位置，起始值是 0。非必填项';
const EnableCollectAlert =
    <Alert style={{textAlign: "center"}} message="数据采集已经开启，请选择下方演练资源目标" type="info" showIcon closable/>;
const DisableCollectAlert =
    <Alert style={{textAlign: "center"}} message="数据采集没有开启，需要手动填写演练资源目标" type="warning" showIcon closable/>;


class KubernetesExperiment extends React.Component {

    constructor() {
        super();
        this.state = {
            creatingStepCurrent: 0,
            targetStepCurrent: 0,
            podNamespace: "",
            podNames: "",
            containerNames: "",
            containerIndex: "",
            nodeNames: "",
            tabKey: "container", // container | pod | node
            scenarioOpenKeys: ['sub1'],
        }
    }

    componentDidMount() {
        const {getClusterInfo, queryCollectStatus} = this.props
        queryCollectStatus();
        getClusterInfo()
    }

    podNamespaceValueChange = (value) => {
        this.setState({podNamespace: value})
    }

    podNamesValueChange = (value) => {
        this.setState({podNames: value})
    }

    containerNamesValueChange = (value) => {
        this.setState({containerNames: value})
    }

    containerIndexValueChange = (value) => {
        this.setState({containerIndex: value})
    }


    nodeNamesValueChange = (value) => {
        this.setState({nodeNames: value})
    }

    onFinish = (values) => {
    }

    collectContainersEnabledRender = () => {
        return (
            <div>
                <MachinesSelection titles={
                    [
                        <div style={{display: "inline-block"}}>
                            <a onClick={() => {
                                console.log("遇到问题点我查看？")
                            }}>切换成名称</a>
                            <Divider type={"vertical"}/>
                            机器不可选&nbsp;
                            <Tooltip title="机器处于已被禁用状态，在机器列表页面启用后可选。">
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </div>
                    ]}/>
            </div>
        );
    }

    collectContainersDisabledRender = () => {
        return (
            <div>
                <Form {...FormLayout} ref={this.formRef} name="control-ref" onFinish={this.onFinish}>
                    <Form.Item name="namespace" label="namespace" help={PodNamespaceTips}
                               rules={[{required: true}]}>
                        <Input onChange={this.podNamespaceValueChange}/>
                    </Form.Item>
                    <Form.Item name="pods" label="pods" help={PodNameTips} rules={[{required: true}]}>
                        <TextArea onChange={this.podNamesValueChange}/>
                    </Form.Item>
                    <Form.Item name="containerName" label="containerName" help={ContainerNameTips}
                               rules={[{required: false}]}>
                        <Input onChange={this.containerNamesValueChange}/>
                    </Form.Item>
                    <Form.Item name="containerIndex" label="containerIndex" help={ContainerIndexTips}
                               rules={[{required: false}]}>
                        <Input onChange={this.containerNamesValueChange}/>
                    </Form.Item>
                </Form>
            </div>
        )
    }

    collectPodsDisabledRender = () => {
        return (
            <div>
                <Form {...FormLayout} ref={this.formRef} name="control-ref" onFinish={this.onFinish}>
                    <Form.Item name="namespace" label="namespace" help={PodNamespaceTips}
                               rules={[{required: true}]}>
                        <Input onChange={this.podNamespaceValueChange}/>
                    </Form.Item>
                    <Form.Item name="pods" label="pods" help={PodNameTips} rules={[{required: true}]}>
                        <TextArea onChange={this.podNamesValueChange}/>
                    </Form.Item>
                    <Form.Item name="container" label="container" help={ContainerNameTips}
                               rules={[{required: false}]}>
                        <Input onChange={this.containerNamesValueChange}/>
                    </Form.Item>
                </Form>
            </div>
        )
    }

    collectPodsEnabledRender = () => {
        return (
            <div>
                <MachinesSelection titles={
                    [
                        <div style={{display: "inline-block"}}>
                            <a onClick={() => {
                                console.log("遇到问题点我查看？")
                            }}>切换成Pod名称</a>
                            <Divider type={"vertical"}/>
                            机器不可选&nbsp;
                            <Tooltip title="机器处于已被禁用状态，在机器列表页面启用后可选。">
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </div>
                    ]}/>
            </div>
        );
    };

    collectNodesEnabledRender = () => {
        return (
            <div>
                <MachinesSelection titles={
                    [
                        <div style={{display: "inline-block"}}>
                            <a onClick={() => {
                                console.log("遇到问题点我查看？")
                            }}>切换成节点名称</a>
                            <Divider type={"vertical"}/>
                            机器不可选&nbsp;
                            <Tooltip title="机器处于已被禁用状态，在机器列表页面启用后可选。">
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </div>
                    ]}/>
            </div>
        );
    };

    collectNodesDisabledRender = () => {
        return (
            <div>
                <Form {...FormLayout} ref={this.formRef} name="control-ref" onFinish={this.onFinish}>
                    <Form.Item name="nodeName" label="nodeName" help={NodeNameTips}
                               rules={[{required: true}]}>
                        <Input onChange={this.nodeNamesValueChange}/>
                    </Form.Item>
                </Form>
            </div>
        );
    };

    onTabChange = (activeKey) => {
        const {getScenarioCategories, getScenariosPageable} = this.props;
        this.setState({tabKey: activeKey});
        getScenarioCategories({page: 1, pageSize: 1000})
    }

    rootSubmenuKeys = ['sub1', 'sub2', 'sub4'];

    onOpenChange = keys => {
        // const latestOpenKey = keys.find(key => this.scenarioOpenKeys.indexOf(key) === -1);
        // if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        //     this.setState({scenarioOpenKeys: keys})
        // } else {
        //     this.setState({scenarioOpenKeys: latestOpenKey ? [latestOpenKey] : []})
        // }
    };

    machinesRender = () => {
        const {collect} = this.props;
        return (
            <Tabs defaultActiveKey="pod" onChange={this.onTargetTabChange}>
                <TabPane tab={<span><AndroidOutlined/>创建 Container 实验</span>} key="container">
                    {
                        collect ? this.collectContainersEnabledRender() : this.collectContainersDisabledRender()
                    }
                </TabPane>
                <TabPane tab={<span><AppleOutlined/>创建 POD 实验</span>} key="pod">
                    {
                        collect ? this.collectPodsEnabledRender() : this.collectPodsDisabledRender()
                    }
                </TabPane>
                <TabPane tab={<span> <AndroidOutlined/>创建 NODE 实验</span>} key="node">
                    {
                        collect ? this.collectNodesEnabledRender() : this.collectNodesDisabledRender()
                    }
                </TabPane>
            </Tabs>
        );
    }
    scenariosRender = () => {
        const {categories} = this.props;
        return (
            <Layout>
                <Layout>
                    <Sider>
                        <Menu mode="inline" defaultOpenKeys={this.scenarioOpenKeys}
                              onOpenChange={this.onOpenChange}>
                            <SubMenu key="sub1" icon={<MailOutlined/>} title="Navigation One">
                                <Menu.Item key="1">Option 1</Menu.Item>
                                <Menu.Item key="2">Option 2</Menu.Item>
                                <Menu.Item key="3">Option 3</Menu.Item>
                                <Menu.Item key="4">Option 4</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub2" icon={<AppstoreOutlined/>} title="Navigation Two">
                                <Menu.Item key="5">Option 5</Menu.Item>
                                <Menu.Item key="6">Option 6</Menu.Item>
                                <SubMenu key="sub3" title="Submenu">
                                    <Menu.Item key="7">Option 7</Menu.Item>
                                    <Menu.Item key="8">Option 8</Menu.Item>
                                </SubMenu>
                            </SubMenu>
                            <SubMenu key="sub4" icon={<SettingOutlined/>} title="Navigation Three">
                                <Menu.Item key="9">Option 9</Menu.Item>
                                <Menu.Item key="10">Option 10</Menu.Item>
                                <Menu.Item key="11">Option 11</Menu.Item>
                                <Menu.Item key="12">Option 12</Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Sider>
                    <Content>
                        演练场景内容
                    </Content>
                </Layout>
            </Layout>
        );
    }

    monitorRender = () => {
        return (
            <span>接入稳态监控</span>
        );
    }

    onTargetTabChange = current => {
        this.setState({targetStepCurrent: current});
    }

    changeCreatingStepCurrentValue = (value) => {
        this.setState({creatingStepCurrent: value});
    }

    render() {
        const {creatingStepCurrent} = this.state;
        const {collect} = this.props;
        return (
            <ExperimentSteps current={creatingStepCurrent} onChange={this.changeCreatingStepCurrentValue.bind(this)}
                             name={"POD-CPU"}
                             steps={[
                                 <div>
                                     {collect ? EnableCollectAlert : DisableCollectAlert}
                                     {this.machinesRender()}
                                 </div>,
                                 this.scenariosRender()
                             ]}
            />
        );
    }

}

const mapStateToProps = state => {
    const experiment = state.experimentCreating.toJS();
    return {
        categories: experiment.categories,
        collect: experiment.collect,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getClusterInfo: () => dispatch(Actions.getClusterInfo()),
        getKubernetesNamespaces: () => dispatch(Actions.getKubernetesNamespaces()),
        getPodsPageable: query => dispatch(Actions.getMachinesForPodPageable(query)),
        getNodesPageable: query => dispatch(Actions.getMachinesForNodePageable(query)),

        queryCollectStatus: () => dispatch(Actions.queryCollectStatus()),
        // scenarioCategory
        getScenarioCategories: (query) => dispatch(Actions.getScenarioCategories(query)),
        // scenario: kubernetes container|pod|node /
        getScenariosPageable: query => dispatch(Actions.getScenariosPageable(query)),

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KubernetesExperiment);