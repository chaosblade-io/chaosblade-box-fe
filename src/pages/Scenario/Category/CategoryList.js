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

    componentDidMount() {
        const {getScenarioCategories} = this.props;
        getScenarioCategories()
    }

    treeNode(data) {
        if (_.isEmpty(data)) {
            return;
        }
        return data.map(item => {
            if (item.children) {
                return <TreeNode title={item.name} key={item.categoryId} dataRef={item}>
                    {this.treeNode(item.children)}
                </TreeNode>
            }
            return <TreeNode title={item.name} key={item.categoryId} dataRef={item}/>
        });
    }

    render() {
        const {categories, getScenarioCategories} = this.props;
        return (
            <div>
                {
                    categories.length > 0 && <Tree defaultExpandAll={true} showLine={true}>
                        {this.treeNode(categories)}
                    </Tree>
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