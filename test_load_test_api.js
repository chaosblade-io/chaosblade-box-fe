/**
 * 压测定义API测试脚本
 * 用于测试压测定义管理的各个API接口
 */

const API_BASE_URL = 'http://1.94.151.57:7001';
const NAMESPACE = 'default';

// 测试数据
const testDefinition = {
  name: '测试压测定义-' + Date.now(),
  engineType: 'JMETER',
  endpoint: 'http://test.example.com',
  entry: 'URL',
  urlCase: {
    method: 'GET',
    path: '/api/test',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  namespace: NAMESPACE
};

// 通用请求函数
async function makeRequest(action, data) {
  const url = `${API_BASE_URL}/${action}`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      namespace: NAMESPACE,
      Lang: 'zh'
    })
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(`${action} 响应:`, result);
    return result;
  } catch (error) {
    console.error(`${action} 错误:`, error);
    throw error;
  }
}

// 测试函数
async function testCreateLoadTestDefinition() {
  console.log('\n=== 测试创建压测定义 ===');
  const result = await makeRequest('CreateLoadTestDefinition', testDefinition);
  if (result.success) {
    console.log('✅ 创建成功，ID:', result.result);
    return result.result;
  } else {
    console.log('❌ 创建失败:', result.message);
    return null;
  }
}

async function testGetLoadTestDefinition(id) {
  console.log('\n=== 测试查询压测定义详情 ===');
  const result = await makeRequest('GetLoadTestDefinition', { id });
  if (result.success) {
    console.log('✅ 查询成功:', result.result);
    return result.result;
  } else {
    console.log('❌ 查询失败:', result.message);
    return null;
  }
}

async function testUpdateLoadTestDefinition(id) {
  console.log('\n=== 测试更新压测定义 ===');
  const updateData = {
    id,
    name: testDefinition.name + '-更新',
    engineType: 'K6',
    endpoint: 'http://updated.example.com',
    entry: 'SCRIPT',
    contentRef: 'http://example.com/script.js'
  };
  
  const result = await makeRequest('UpdateLoadTestDefinition', updateData);
  if (result.success) {
    console.log('✅ 更新成功');
    return true;
  } else {
    console.log('❌ 更新失败:', result.message);
    return false;
  }
}

async function testQueryLoadTestDefinitions() {
  console.log('\n=== 测试分页查询压测定义 ===');
  const queryData = {
    pageNum: 1,
    pageSize: 10,
    name: '测试',
    engineType: 'JMETER'
  };
  
  const result = await makeRequest('QueryLoadTestDefinitions', queryData);
  if (result.success) {
    console.log('✅ 分页查询成功，总数:', result.result?.total || 0);
    console.log('数据:', result.result?.data || []);
    return result.result;
  } else {
    console.log('❌ 分页查询失败:', result.message);
    return null;
  }
}

async function testListAllLoadTestDefinitions() {
  console.log('\n=== 测试查询所有压测定义 ===');
  const result = await makeRequest('ListAllLoadTestDefinitions', {});
  if (result.success) {
    console.log('✅ 查询所有定义成功，数量:', result.result?.length || 0);
    return result.result;
  } else {
    console.log('❌ 查询所有定义失败:', result.message);
    return null;
  }
}

async function testDeleteLoadTestDefinition(id) {
  console.log('\n=== 测试删除压测定义 ===');
  const result = await makeRequest('DeleteLoadTestDefinition', { id });
  if (result.success) {
    console.log('✅ 删除成功');
    return true;
  } else {
    console.log('❌ 删除失败:', result.message);
    return false;
  }
}

// 主测试流程
async function runTests() {
  console.log('开始测试压测定义API...');
  
  try {
    // 1. 创建压测定义
    const createdId = await testCreateLoadTestDefinition();
    if (!createdId) {
      console.log('❌ 创建失败，停止后续测试');
      return;
    }

    // 2. 查询详情
    await testGetLoadTestDefinition(createdId);

    // 3. 更新定义
    await testUpdateLoadTestDefinition(createdId);

    // 4. 再次查询详情验证更新
    await testGetLoadTestDefinition(createdId);

    // 5. 分页查询
    await testQueryLoadTestDefinitions();

    // 6. 查询所有
    await testListAllLoadTestDefinitions();

    // 7. 删除定义
    await testDeleteLoadTestDefinition(createdId);

    // 8. 验证删除（应该查询不到）
    await testGetLoadTestDefinition(createdId);

    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    testCreateLoadTestDefinition,
    testGetLoadTestDefinition,
    testUpdateLoadTestDefinition,
    testQueryLoadTestDefinitions,
    testListAllLoadTestDefinitions,
    testDeleteLoadTestDefinition
  };
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.loadTestApiTests = {
    runTests,
    testCreateLoadTestDefinition,
    testGetLoadTestDefinition,
    testUpdateLoadTestDefinition,
    testQueryLoadTestDefinitions,
    testListAllLoadTestDefinitions,
    testDeleteLoadTestDefinition
  };
  
  // 自动运行测试（可选）
  // runTests();
}

// 测试压测策略创建
async function testCreateLoadTestStrategy(definitionId, experimentId) {
  console.log('\n=== 测试创建压测策略 ===');
  const strategyData = {
    enable: true,
    definitionId: definitionId,
    experimentId: experimentId,
    startBeforeFaultSec: 300, // 5分钟
    trafficDurationSec: 600,  // 10分钟
    abortOnLoadFailure: true
  };

  const result = await makeRequest('CreateLoadTestStrategy', strategyData);
  if (result.success) {
    console.log('✅ 压测策略创建成功，ID:', result.result);
    return result.result;
  } else {
    console.log('❌ 压测策略创建失败:', result.message);
    return null;
  }
}

// 完整的实验创建+压测策略测试流程
async function testExperimentWithLoadTestStrategy() {
  console.log('\n🚀 开始测试实验创建+压测策略集成流程...');

  try {
    // 1. 创建压测定义
    console.log('\n步骤1: 创建压测定义');
    const definitionId = await testCreateLoadTestDefinition();
    if (!definitionId) {
      console.log('❌ 压测定义创建失败，停止测试');
      return;
    }

    // 2. 模拟实验ID（实际应该是创建实验后返回的ID）
    const mockExperimentId = '1957308844015296513';
    console.log('\n步骤2: 使用模拟实验ID:', mockExperimentId);

    // 3. 创建压测策略
    console.log('\n步骤3: 创建压测策略');
    const strategyId = await testCreateLoadTestStrategy(definitionId, mockExperimentId);
    if (!strategyId) {
      console.log('❌ 压测策略创建失败');
      return;
    }

    // 4. 验证创建结果
    console.log('\n步骤4: 验证创建结果');
    await testGetLoadTestDefinition(definitionId);

    // 5. 清理测试数据
    console.log('\n步骤5: 清理测试数据');
    await testDeleteLoadTestDefinition(definitionId);

    console.log('\n🎉 实验创建+压测策略集成测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 更新导出对象
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    testCreateLoadTestDefinition,
    testGetLoadTestDefinition,
    testUpdateLoadTestDefinition,
    testQueryLoadTestDefinitions,
    testListAllLoadTestDefinitions,
    testDeleteLoadTestDefinition,
    testCreateLoadTestStrategy,
    testExperimentWithLoadTestStrategy
  };
}

if (typeof window !== 'undefined') {
  window.loadTestApiTests = {
    runTests,
    testCreateLoadTestDefinition,
    testGetLoadTestDefinition,
    testUpdateLoadTestDefinition,
    testQueryLoadTestDefinitions,
    testListAllLoadTestDefinitions,
    testDeleteLoadTestDefinition,
    testCreateLoadTestStrategy,
    testExperimentWithLoadTestStrategy
  };
}

console.log('压测定义API测试脚本已加载');
console.log('在浏览器控制台中运行:');
console.log('  - loadTestApiTests.runTests() // 基础API测试');
console.log('  - loadTestApiTests.testExperimentWithLoadTestStrategy() // 集成测试');
console.log('或在Node.js中运行: node test_load_test_api.js');
