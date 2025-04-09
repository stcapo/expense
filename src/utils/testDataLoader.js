/**
 * 从测试数据文件加载数据到Vuex store
 * 在开发环境中使用这个工具来加载测试数据
 */

/**
 * 加载test-data-complete.json中的数据到store
 * @param {Object} store - Vuex store实例
 */
export const loadTestData = (store) => {
  console.log('开始加载测试数据...');
  
  fetch('/test.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('测试数据加载成功，开始处理数据...');
      
      // 加载支出数据
      if (data.expenses && data.expenses.length > 0) {
        console.log(`加载 ${data.expenses.length} 条支出数据`);
        store.commit('setExpenses', data.expenses);
      }
      
      // 加载收入数据
      if (data.incomes && data.incomes.length > 0) {
        console.log(`加载 ${data.incomes.length} 条收入数据`);
        store.commit('setIncomes', data.incomes);
      }
      
      // 加载目标数据
      if (data.goals && data.goals.length > 0) {
        console.log(`加载 ${data.goals.length} 条目标数据`);
        store.commit('setGoals', data.goals);
      }
      
      // 加载分类数据
      if (data.categories && data.categories.length > 0) {
        console.log(`加载 ${data.categories.length} 个支出分类`);
        store.commit('setCategories', data.categories);
      }
      
      // 加载收入分类数据
      if (data.incomeCategories && data.incomeCategories.length > 0) {
        console.log(`加载 ${data.incomeCategories.length} 个收入分类`);
        store.commit('setIncomeCategories', data.incomeCategories);
      }
      
      // 加载目标分类数据
      if (data.goalCategories && data.goalCategories.length > 0) {
        console.log(`加载 ${data.goalCategories.length} 个目标分类`);
        store.commit('setGoalCategories', data.goalCategories);
      }
      
      // 加载预算数据
      if (data.budget) {
        console.log('加载预算数据');
        store.commit('setBudget', data.budget);
      }
      
      // 加载设置数据
      if (data.settings) {
        console.log('加载设置数据');
        store.commit('setSettings', data.settings);
      }
      
      console.log('测试数据加载完成!');
    })
    .catch(error => {
      console.error('加载测试数据失败:', error);
    });
};

/**
 * 检查store中是否已有数据，如果没有则加载测试数据
 * @param {Object} store - Vuex store实例
 */
export const loadTestDataIfEmpty = (store) => {
  // 检查store中是否已有数据
  if (
    (!store.state.expenses || store.state.expenses.length === 0) &&
    (!store.state.incomes || store.state.incomes.length === 0) &&
    (!store.state.goals || store.state.goals.length === 0)
  ) {
    console.log('Store中没有数据，加载测试数据...');
    loadTestData(store);
  } else {
    console.log('Store中已有数据，跳过测试数据加载');
  }
};

export default {
  loadTestData,
  loadTestDataIfEmpty
}; 