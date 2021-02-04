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
import {connect} from "react-redux";
import {Tree} from "antd";
import _ from 'lodash';

const {TreeNode} = Tree

class CategoryList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editing: false
        }
    }

    componentDidMount() {
        const {getScenarioCategories} = this.props;
        getScenarioCategories()
    }

    treeNode(data) {
        if (_.isEmpty(data)) {
            return;
        }
        return data.map(item => {
            return (
                <TreeNode title={item.name} key={item.categoryId} dataRef={item}>
                    {
                        _.isEmpty(item.children) ? <></> : this.treeNode(item.children)
                    }
                </TreeNode>
            );
        });
    }

    save() {
        this.setState({editing: false});
    }

    edit() {
        this.setState({editing: true});
    }

    render() {
        const {categories, getScenarioCategories} = this.props;
        const {editing} = this.state;
        return (
            <div>
                {/*<div style={{paddingBottom: 16}}>*/}
                {/*    {*/}
                {/*        editing ?*/}
                {/*            <Button type={"primary"} onClick={this.save.bind(this)}>保存修改</Button>*/}
                {/*            :*/}
                {/*            <Button type={"primary"} onClick={this.edit.bind(this)}>编辑目录</Button>*/}
                {/*    }*/}
                {/*</div>*/}
                {
                    !_.isEmpty(categories) ?
                        <Tree defaultExpandAll={true} showLine={true}>
                            {this.treeNode(categories)}
                        </Tree>
                        :
                        <div></div>
                }
            </div>
        );
    }
}

const mapStateToProps = state => {
    const category = state.category.toJS();
    return {
        categories: category.categories
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getScenarioCategories: query => dispatch(Actions.getScenarioCategories(query))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryList)