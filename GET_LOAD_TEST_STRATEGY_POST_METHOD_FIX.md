# GetLoadTestStrategyByExperimentId POST方法修复

## 问题描述

用户反馈`GetLoadTestStrategyByExperimentId`接口实际使用的是POST方法，但我们的代码中错误地使用了GET方法。

### 实际接口调用方式
```bash
POST http://localhost:8082/api/chaos/GetLoadTestStrategyByExperimentId
Content-Type: application/json

{
  "experimentId": "1958598136545050625",
  "namespace": "default",
  "Namespace": "default", 
  "Lang": "zh"
}
```

## 修复方案

### 修复前（错误的GET方法）
```typescript
@effect()
*getLoadTestStrategyByExperimentId(payload: IGetLoadTestStrategyByExperimentIdReq, callback?: (data: any) => void) {
  try {
    yield this.effects.put(this.setLoading(true));
    
    // 使用GET请求，参数放在URL中（错误）
    const prefix = getRequirePrefix();
    const namespace = payload.Namespace || payload.namespace || getActiveNamespace();
    const response = yield this.effects.call(fetch, `${prefix}/GetLoadTestStrategyByExperimentId?experimentId=${payload.experimentId}&namespace=${namespace}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // 复杂的响应处理...
  } catch (error) {
    console.error('Failed to get load test strategies by experiment id:', error);
    throw error;
  } finally {
    yield this.effects.put(this.setLoading(false));
  }
}
```

### 修复后（正确的POST方法）
```typescript
@effect()
*getLoadTestStrategyByExperimentId(payload: IGetLoadTestStrategyByExperimentIdReq, callback?: (data: any) => void) {
  try {
    yield this.effects.put(this.setLoading(true));
    
    // 使用POST请求，参数放在请求体中
    const { Data } = yield this.effects.call(createServiceChaos('GetLoadTestStrategyByExperimentId'), payload);
    
    yield this.effects.put(this.setStrategies(Data || []));
    callback && callback(Data);
    return Data;
  } catch (error) {
    console.error('Failed to get load test strategies by experiment id:', error);
    throw error;
  } finally {
    yield this.effects.put(this.setLoading(false));
  }
}
```

## 修复优势

### 1. 代码简化
- **修复前**: 需要手动构建URL、处理fetch调用、解析响应
- **修复后**: 使用标准的`createServiceChaos`函数，代码更简洁

### 2. 参数处理自动化
- **修复前**: 需要手动处理namespace参数的兼容性
- **修复后**: `createServiceChaos`自动添加`namespace`、`Namespace`、`Lang`参数

### 3. 错误处理一致性
- **修复前**: 需要手动处理HTTP状态码和响应格式
- **修复后**: 使用统一的错误处理机制

### 4. 与其他API保持一致
- 所有其他Chaos API都使用`createServiceChaos`
- 保持代码风格和调用方式的一致性

## createServiceChaos函数说明

`createServiceChaos`函数会自动处理以下内容：

```typescript
return (params: CommonReq = {}) => {
  const namespace = getActiveNamespace();
  const args = {
    ...params, 
    namespace,
    Lang: getLanguage() === 'zh' ? 'zh' : 'en',
    Namespace: namespace,
  };
  return request({
    url: `${prefix}/${action}`,
    method: 'post',  // 固定使用POST方法
    data: args,
    // ...其他配置
  });
};
```

## 影响范围

### 修改的文件
- `src/models/Chaos/loadTestDefinition.ts` - 修复API调用方法

### 不影响的文件
- `src/pages/Chaos/Experiment/ExperimentEditor/StepTwo/index.tsx` - 调用方式不变
- `src/pages/Chaos/Experiment/ExperimentDetail/index.tsx` - 调用方式不变

### 调用方式保持不变
```typescript
// 页面中的调用方式不需要修改
const strategies = await dispatch.loadTestDefinition.getLoadTestStrategyByExperimentId({
  experimentId,
  Namespace: 'default',
});
```

## 验证方法

### 1. 网络请求检查
在浏览器开发者工具的Network标签页应该能看到：
```
POST http://localhost:8082/api/chaos/GetLoadTestStrategyByExperimentId
```

### 2. 请求体检查
请求体应该包含：
```json
{
  "experimentId": "1958598136545050625",
  "namespace": "default",
  "Namespace": "default",
  "Lang": "zh"
}
```

### 3. 功能验证
- ✅ 演练配置页面：编辑时正确加载现有策略
- ✅ 演练详情页面：正确展示压测策略信息
- ✅ 不再出现400错误："Required String parameter 'experimentId' is not present"

## 总结

这次修复解决了API调用方法不匹配的问题：

1. **恢复正确的POST方法**: 从错误的GET方法改回正确的POST方法
2. **简化代码实现**: 使用标准的`createServiceChaos`函数
3. **提高代码一致性**: 与其他Chaos API保持一致的调用方式
4. **自动参数处理**: 自动添加必要的namespace和Lang参数

现在`GetLoadTestStrategyByExperimentId`接口应该能够正常工作，不再出现参数传递错误！
