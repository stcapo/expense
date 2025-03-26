# 收入数据显示错误分析

## 问题描述

尽管测试数据 JSON 文件中包含完整的收入数据，但收入页面显示为空。收入数据无法正确加载或显示在界面上。

## 可能原因分析

### 1. 存储键名不匹配

在 `src/store/index.js` 中，本地存储使用的键名为：
```javascript
const STORAGE_KEY = 'expense-tracker-data'
```

但在新的代码中，我们修改了键名：
```javascript
const STORAGE_KEY = 'finance-tracker-data'
```

这导致应用无法找到正确存储的数据。

### 2. 数据导入方式问题

在 `Settings.vue` 的数据导入功能中，处理收入数据的代码可能有问题：

```javascript
// 可能没有正确处理incomes数组
if (importData.expenses) {
  this.$store.commit('setExpenses', importData.expenses)
}
// 缺少类似下面的代码
// if (importData.incomes) {
//   this.$store.commit('setIncomes', importData.incomes)
// }
```

### 3. 初始状态问题

`store/index.js` 中的 `getInitialState` 函数可能没有正确初始化 `incomes` 数组，导致即使加载了数据也不显示。

### 4. 组件渲染逻辑

`Incomes.vue` 可能存在条件渲染逻辑，当收入数组为空时不显示任何内容：

```javascript
v-if="filteredIncomes.length > 0"
```

### 5. 测试数据文件路径问题

我们创建了 `test-data-complete.json`，但在设置页面导入时，可能选择了错误的文件或路径。

## 解决方案

1. 统一存储键名，在 `src/store/index.js` 中修改：
   ```javascript
   const STORAGE_KEY = 'expense-tracker-data' // 或保持一致的其他名称
   ```

2. 修改 `Settings.vue` 中的导入逻辑，确保处理收入数据：
   ```javascript
   if (importData.incomes) {
     this.$store.commit('setIncomes', importData.incomes)
   }
   ```

3. 检查初始化逻辑，确保 `incomes` 数组正确初始化

4. 通过浏览器控制台检查 Vuex 状态，确认收入数据是否正确加载

5. 在设置页面导入正确的 `test-data-complete.json` 文件
