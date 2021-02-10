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
    MinusCircleOutlined,
    PlusOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import {Alert, Button, Form, Input, Layout, Menu, Space, Tabs, Tooltip} from "antd";
import {connect} from "react-redux";
import ExperimentSteps from "./ExperimentSteps";
import MachineStep from "./MachineStep";
import {GenPagination} from "../../../libs/Pagination";
import ExperimentCreating from "./index";
import _ from 'lodash'
import {ExperimentCreatingTabKey} from "../../../constants/ExperimentConstants";

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

const defaultActive = "pod";

class KubernetesExperiment extends React.Component {

    constructor() {
        super();
    }

    getMachinesByDimension(activeKey) {
        const {
            getPodsPageable,
            getNodesPageable,
            podPage,
            podPageSize,
            nodePage,
            nodePageSize
        } = this.props;
        switch (activeKey) {
            case ExperimentCreatingTabKey.NODE:
                getNodesPageable({page: nodePage, pageSize: nodePageSize});
                break;
            case ExperimentCreatingTabKey.CONTAINER:
            case ExperimentCreatingTabKey.POD:
                getPodsPageable({page: podPage, pageSize: podPageSize});
        }
    }

    componentDidMount() {
        const {
            getClusterInfo,
            queryCollectStatus,
            onDimensionChanged,
            dimension
        } = this.props
        const id = ExperimentCreating.getExperimentId();
        queryCollectStatus();
        getClusterInfo();
        let activeKey = dimension;
        if (_.isEmpty(id) && _.isEmpty(dimension)) {
            activeKey = defaultActive
            onDimensionChanged({dimension: activeKey});
        }
        this.getMachinesByDimension(activeKey);
    }

    onFinish = (values) => {
        const {onMachinesChanged} = this.props;
        onMachinesChanged({machines: values.machines});
    }

    collectContainersEnabledRender = () => {
        const {podPage, podPageSize, podTotal, containers, getPodsPageable} = this.props;
        return (
            <MachineStep
                machines={containers}
                pagination={GenPagination(podPage, podPageSize, podTotal,
                    (page, pageSize) => getPodsPageable({page, pageSize}))}
                titles={
                    [
                        <div style={{display: "inline-block"}}>
                            {/*<a onClick={() => {*/}
                            {/*    console.log("遇到问题点我查看？")*/}
                            {/*}}>切换成名称</a>*/}
                            {/*<Divider type={"vertical"}/>*/}
                            机器不可选&nbsp;
                            <Tooltip title="机器处于已被禁用状态，在机器列表页面启用后可选。">
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </div>
                    ]}
            />
        );
    }

    collectDisabledRender = () => {
        const {dimension, machinesSelected} = this.props;
        console.log(machinesSelected);
        return (
            <div>
                <Form ref={this.formRef} name="control-ref" onFinish={this.onFinish}
                      initialValues={{machines: machinesSelected}}>
                    <Form.List name={'machines'}>
                        {
                            (fields, {add, remove}) => (
                                <>
                                    {
                                        fields.map(field => (
                                            dimension === ExperimentCreatingTabKey.NODE ?
                                                <Space key={field.key} style={{padding: 16}} align="baseline">
                                                    <Form.Item {...field}
                                                               fieldKey={[field.fieldKey, 'nodeName']}
                                                               name={[field.name, 'nodeName']}
                                                               label="nodeName"
                                                               help={NodeNameTips}
                                                               rules={[{required: true}]}>
                                                        <Input/>
                                                    </Form.Item>
                                                    <MinusCircleOutlined onClick={() => remove(field.name)}/>
                                                </Space>
                                                :
                                                <Space key={field.key} style={{padding: 16}} align="baseline">
                                                    <Form.Item {...field}
                                                               fieldKey={[field.fieldKey, 'namespace']}
                                                               name={[field.name, 'namespace']}
                                                               label="namespace"
                                                               help={PodNamespaceTips}
                                                               rules={[{required: true}]}>
                                                        <Input/>
                                                    </Form.Item>
                                                    <Form.Item {...field}
                                                               fieldKey={[field.fieldKey, 'podName']}
                                                               name={[field.name, 'podName']}
                                                               label="podName"
                                                               help={PodNameTips}
                                                               rules={[{required: true}]}>
                                                        <Input/>
                                                    </Form.Item>
                                                    {
                                                        dimension === ExperimentCreatingTabKey.CONTAINER
                                                            ?
                                                            <Form.Item {...field}
                                                                       fieldKey={[field.fieldKey, 'containerName']}
                                                                       name={[field.name, 'containerName']}
                                                                       label="containerName"
                                                                       help={ContainerNameTips}
                                                                       rules={[{required: false}]}>
                                                                <Input/>
                                                            </Form.Item>
                                                            :
                                                            <></>
                                                    }
                                                    <MinusCircleOutlined onClick={() => remove(field.name)}/>
                                                </Space>
                                        ))
                                    }
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                            Add field
                                        </Button>
                                    </Form.Item>
                                </>
                            )
                        }
                    </Form.List>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">提交（临时方案）</Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }

    collectPodsEnabledRender = () => {
        const {podPage, podPageSize, podTotal, pods, getPodsPageable} = this.props;
        return (
            <MachineStep
                machines={pods}
                pagination={GenPagination(podPage, podPageSize, podTotal,
                    (page, pageSize) => getPodsPageable({page, pageSize}))}
                titles={
                    [
                        <div style={{display: "inline-block"}}>
                            {/*<a onClick={() => {*/}
                            {/*    console.log("遇到问题点我查看？")*/}
                            {/*}}>切换成Pod名称</a>*/}
                            {/*<Divider type={"vertical"}/>*/}
                            机器不可选&nbsp;
                            <Tooltip title="机器处于已被禁用状态，在机器列表页面启用后可选。">
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </div>
                    ]}/>
        );
    };

    collectNodesEnabledRender = () => {
        const {nodePage, nodePageSize, nodeTotal, nodes, getNodesPageable} = this.props;
        return (
            <MachineStep
                machines={nodes}
                pagination={GenPagination(nodePage, nodePageSize, nodeTotal,
                    (page, pageSize) => getNodesPageable({page, pageSize}))}
                titles={
                    [
                        <div style={{display: "inline-block"}}>
                            {/*<a onClick={() => {*/}
                            {/*    console.log("遇到问题点我查看？")*/}
                            {/*}}>切换成节点名称</a>*/}
                            {/*<Divider type={"vertical"}/>*/}
                            机器不可选&nbsp;
                            <Tooltip title="机器处于已被禁用状态，在机器列表页面启用后可选。">
                                <QuestionCircleOutlined/>
                            </Tooltip>
                        </div>
                    ]}/>
        );
    };

    machinesRender = () => {
        const {collect, dimension} = this.props;
        return (
            dimension ?
                <Tabs defaultActiveKey={dimension} onChange={this.onTargetTabChange}>
                    <TabPane tab={<span><AndroidOutlined/>创建 Container 实验</span>} key="container">
                        {
                            collect ? this.collectContainersEnabledRender() : this.collectDisabledRender()
                        }
                    </TabPane>
                    <TabPane tab={<span><AppleOutlined/>创建 POD 实验</span>} key="pod">
                        {
                            collect ? this.collectPodsEnabledRender() : this.collectDisabledRender()
                        }
                    </TabPane>
                    <TabPane tab={<span> <AndroidOutlined/>创建 NODE 实验</span>} key="node">
                        {
                            collect ? this.collectNodesEnabledRender() : this.collectDisabledRender()
                        }
                    </TabPane>
                </Tabs>
                :
                <div></div>
        );
    }

    onTargetTabChange = current => {
        const {onDimensionChanged} = this.props;
        this.getMachinesByDimension(current);
        onDimensionChanged({dimension: current});
    }

    render() {
        const {collect, dimension} = this.props;
        return (
            dimension ?
                <ExperimentSteps dimension={dimension}
                                 machineStep={
                                     <div>
                                         {collect ? EnableCollectAlert : DisableCollectAlert}
                                         {this.machinesRender()}
                                     </div>
                                 }
                /> :
                <div></div>
        );
    }

}

const mapStateToProps = state => {
    const experiment = state.experimentCreating.toJS();
    const {pods, nodes} = experiment;
    return {
        podPage: pods.page,
        podPageSize: pods.pageSize,
        podTotal: pods.total,
        pods: pods.machines,
        containers: pods.containers,
        nodePage: nodes.page,
        nodePageSize: nodes.pageSize,
        nodeTotal: nodes.total,
        nodes: nodes.machines,
        collect: experiment.collect,
        // collect: false,
        dimension: experiment.dimension,
        machinesSelected: experiment.machinesSelected
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getClusterInfo: () => dispatch(Actions.getClusterInfo()),
        getKubernetesNamespaces: () => dispatch(Actions.getKubernetesNamespaces()),
        getPodsPageable: query => dispatch(Actions.getMachinesForPodPageable(query)),
        getNodesPageable: query => dispatch(Actions.getMachinesForNodePageable(query)),
        queryCollectStatus: () => dispatch(Actions.queryCollectStatus()),
        onDimensionChanged: dimension => dispatch(Actions.onDimensionChanged(dimension)),
        onMachinesChanged: machines => dispatch(Actions.onMachinesChanged(machines))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(KubernetesExperiment);