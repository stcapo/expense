import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const STORAGE_KEY = 'expense-tracker-data'

// 获取初始数据（尝试从localStorage加载）
const getInitialState = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      return JSON.parse(savedData)
    }
  } catch (e) {
    console.error('无法从本地存储加载数据', e)
  }
  
  // 如果没有保存的数据或加载失败，返回默认初始状态
  return {
    expenses: [],
    incomes: [],
    goals: [],
    incomeCategories: [
      { id: 'salary', name: '工资收入', icon: 'el-icon-money', color: '#4CAF50' },
      { id: 'bonus', name: '奖金', icon: 'el-icon-present', color: '#FF9800' },
      { id: 'investment', name: '投资收益', icon: 'el-icon-data-line', color: '#2196F3' },
      { id: 'parttime', name: '兼职收入', icon: 'el-icon-s-cooperation', color: '#9C27B0' },
      { id: 'gift', name: '礼金收入', icon: 'el-icon-box', color: '#E91E63' },
      { id: 'other', name: '其他收入', icon: 'el-icon-more', color: '#607D8B' }
    ],
    goalCategories: [
      { id: 'housing', name: '购房', icon: 'el-icon-house', color: '#673AB7' },
      { id: 'car', name: '购车', icon: 'el-icon-truck', color: '#2196F3' },
      { id: 'travel', name: '旅行', icon: 'el-icon-place', color: '#3F51B5' },
      { id: 'education', name: '教育', icon: 'el-icon-reading', color: '#9C27B0' },
      { id: 'wedding', name: '婚礼', icon: 'el-icon-present', color: '#E91E63' },
      { id: 'retirement', name: '退休', icon: 'el-icon-user', color: '#FF9800' },
      { id: 'other', name: '其他', icon: 'el-icon-more', color: '#9E9E9E' }
    ],
    categories: [
      { id: 'food', name: '餐饮', icon: 'el-icon-food', color: '#FF9800' },
      { id: 'shopping', name: '购物', icon: 'el-icon-shopping-bag', color: '#E91E63' },
      { id: 'housing', name: '住房', icon: 'el-icon-house', color: '#673AB7' },
      { id: 'transportation', name: '交通', icon: 'el-icon-truck', color: '#2196F3' },
      { id: 'entertainment', name: '娱乐', icon: 'el-icon-film', color: '#00BCD4' },
      { id: 'health', name: '医疗健康', icon: 'el-icon-first-aid-kit', color: '#4CAF50' },
      { id: 'education', name: '教育', icon: 'el-icon-reading', color: '#9C27B0' },
      { id: 'travel', name: '旅行', icon: 'el-icon-place', color: '#3F51B5' },
      { id: 'other', name: '其他', icon: 'el-icon-more', color: '#9E9E9E' }
    ],
    budget: {
      total: 5000,
      categoryLimits: {}
    },
    settings: {
      currency: 'CNY',
      language: 'zh-CN',
      theme: 'light'
    }
  }
}

// 添加数据转换函数
const normalizeGoalData = (goal) => {
  // 规范化goal对象，确保所有需要的字段都存在并符合期望的格式
  return {
    ...goal,
    // 确保这些字段存在且类型正确
    id: goal.id || `goal_${Date.now()}`,
    targetAmount: parseFloat(goal.targetAmount) || 0,
    currentAmount: parseFloat(goal.currentAmount) || 0,
    // 优先使用targetDate，如果不存在则使用deadline
    targetDate: goal.targetDate || goal.deadline || new Date().toISOString().substr(0, 10),
    // 处理优先级：如果是字符串则转换为数字
    priority: typeof goal.priority === 'number' ? 
              goal.priority : 
              (goal.priority === 'high' ? 5 : 
               goal.priority === 'medium' ? 3 : 
               goal.priority === 'low' ? 1 : 3),
    // 处理活跃状态：根据isActive或status字段
    isActive: typeof goal.isActive === 'boolean' ? 
              goal.isActive : 
              (goal.status === 'inProgress')
  };
};

export default new Vuex.Store({
  state: getInitialState(),
  getters: {
    currentMonthIncomes: (state) => {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      return state.incomes.filter(income => {
        const incomeDate = new Date(income.date)
        return incomeDate.getMonth() === currentMonth && 
               incomeDate.getFullYear() === currentYear
      })
    },
    
    totalMonthlyIncomes: (state, getters) => {
      return getters.currentMonthIncomes.reduce((total, income) => {
        return total + parseFloat(income.amount)
      }, 0)
    },
    
    incomesByCategory: (state, getters) => {
      const result = {}
      
      // 初始化所有类别为0
      state.incomeCategories.forEach(category => {
        result[category.id] = 0
      })
      
      // 累加每个类别的收入
      getters.currentMonthIncomes.forEach(income => {
        result[income.category] += parseFloat(income.amount)
      })
      
      return result
    },
    
    incomeCategoryById: (state) => (id) => {
      return state.incomeCategories.find(category => category.id === id)
    },
    
    // 计算月度净收入（收入-支出）
    monthlyNetIncome: (state, getters) => {
      return getters.totalMonthlyIncomes - getters.totalMonthlyExpenses
    },
    
    // 计算每月收入趋势
    totalIncomesByMonth: (state) => {
      const incomesByMonth = {}
      
      state.incomes.forEach(income => {
        const date = new Date(income.date)
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`
        
        if (!incomesByMonth[key]) {
          incomesByMonth[key] = 0
        }
        
        incomesByMonth[key] += parseFloat(income.amount)
      })
      
      return incomesByMonth
    },
    
    // 目标相关的getters
    goalsByCategory: (state) => {
      const result = {}
      
      state.goalCategories.forEach(category => {
        result[category.id] = state.goals.filter(goal => goal.category === category.id)
      })
      
      return result
    },
    
    activeGoals: (state) => {
      return state.goals.filter(goal => goal.isActive)
    },
    
    completedGoals: (state) => {
      return state.goals.filter(goal => goal.currentAmount >= goal.targetAmount)
    },
    
    upcomingGoals: (state) => {
      const now = new Date()
      return state.goals
        .filter(goal => goal.isActive && goal.currentAmount < goal.targetAmount)
        .sort((a, b) => {
          const aCompletion = a.currentAmount / a.targetAmount
          const bCompletion = b.currentAmount / b.targetAmount
          return bCompletion - aCompletion
        })
        .slice(0, 3)
    },
    
    goalCategoryById: (state) => (id) => {
      return state.goalCategories.find(category => category.id === id)
    },
    currentMonthExpenses: (state) => {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      return state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear
      })
    },
    
    totalExpensesByMonth: (state) => {
      const expensesByMonth = {}
      
      state.expenses.forEach(expense => {
        const date = new Date(expense.date)
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`
        
        if (!expensesByMonth[key]) {
          expensesByMonth[key] = 0
        }
        
        expensesByMonth[key] += parseFloat(expense.amount)
      })
      
      return expensesByMonth
    },
    
    expensesByCategory: (state, getters) => {
      const result = {}
      
      // 初始化所有类别为0
      state.categories.forEach(category => {
        result[category.id] = 0
      })
      
      // 累加每个类别的支出
      getters.currentMonthExpenses.forEach(expense => {
        result[expense.category] += parseFloat(expense.amount)
      })
      
      return result
    },
    
    categoryById: (state) => (id) => {
      return state.categories.find(category => category.id === id)
    },
    
    totalMonthlyExpenses: (state, getters) => {
      return getters.currentMonthExpenses.reduce((total, expense) => {
        return total + parseFloat(expense.amount)
      }, 0)
    },
    
    budgetRemaining: (state, getters) => {
      return state.budget.total - getters.totalMonthlyExpenses
    },
    
    budgetPercentage: (state, getters) => {
      return (getters.totalMonthlyExpenses / state.budget.total) * 100
    }
  },
  mutations: {
    setIncomes(state, incomes) {
      state.incomes = incomes
    },
    
    addIncome(state, income) {
      state.incomes.push(income)
    },
    
    updateIncome(state, updatedIncome) {
      const index = state.incomes.findIndex(i => i.id === updatedIncome.id)
      if (index !== -1) {
        state.incomes.splice(index, 1, updatedIncome)
      }
    },
    
    deleteIncome(state, incomeId) {
      state.incomes = state.incomes.filter(i => i.id !== incomeId)
    },
    
    setIncomeCategories(state, categories) {
      state.incomeCategories = categories
    },
    
    addIncomeCategory(state, category) {
      state.incomeCategories.push(category)
    },
    
    updateIncomeCategory(state, updatedCategory) {
      const index = state.incomeCategories.findIndex(c => c.id === updatedCategory.id)
      if (index !== -1) {
        state.incomeCategories.splice(index, 1, updatedCategory)
      }
    },
    
    deleteIncomeCategory(state, categoryId) {
      state.incomeCategories = state.incomeCategories.filter(c => c.id !== categoryId)
    },
    
    // 目标相关的mutations
    setGoals(state, goals) {
      // 规范化所有goal对象
      state.goals = goals.map(goal => normalizeGoalData(goal));
    },
    
    addGoal(state, goal) {
      // 规范化新添加的goal对象
      state.goals.push(normalizeGoalData(goal));
    },
    
    updateGoal(state, updatedGoal) {
      const index = state.goals.findIndex(g => g.id === updatedGoal.id);
      if (index !== -1) {
        // 规范化更新的goal对象
        state.goals.splice(index, 1, normalizeGoalData(updatedGoal));
      }
    },
    
    deleteGoal(state, goalId) {
      state.goals = state.goals.filter(g => g.id !== goalId)
    },
    
    setGoalCategories(state, categories) {
      state.goalCategories = categories
    },
    setExpenses(state, expenses) {
      state.expenses = expenses
    },
    
    addExpense(state, expense) {
      state.expenses.push(expense)
    },
    
    updateExpense(state, updatedExpense) {
      const index = state.expenses.findIndex(e => e.id === updatedExpense.id)
      if (index !== -1) {
        state.expenses.splice(index, 1, updatedExpense)
      }
    },
    
    deleteExpense(state, expenseId) {
      state.expenses = state.expenses.filter(e => e.id !== expenseId)
    },
    
    setCategories(state, categories) {
      state.categories = categories
    },
    
    addCategory(state, category) {
      state.categories.push(category)
    },
    
    updateCategory(state, updatedCategory) {
      const index = state.categories.findIndex(c => c.id === updatedCategory.id)
      if (index !== -1) {
        state.categories.splice(index, 1, updatedCategory)
      }
    },
    
    deleteCategory(state, categoryId) {
      state.categories = state.categories.filter(c => c.id !== categoryId)
    },
    
    setBudget(state, budget) {
      state.budget = budget
    },
    
    setSettings(state, settings) {
      state.settings = settings
    }
  },
  actions: {
    // 添加一条收入记录
    addIncome({ commit, state }, income) {
      commit('addIncome', income)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 更新一条收入记录
    updateIncome({ commit, state }, income) {
      commit('updateIncome', income)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 删除一条收入记录
    deleteIncome({ commit, state }, incomeId) {
      commit('deleteIncome', incomeId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 添加一个收入类别
    addIncomeCategory({ commit, state }, category) {
      commit('addIncomeCategory', category)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 更新一个收入类别
    updateIncomeCategory({ commit, state }, category) {
      commit('updateIncomeCategory', category)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 删除一个收入类别
    deleteIncomeCategory({ commit, state }, categoryId) {
      commit('deleteIncomeCategory', categoryId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 目标相关的actions
    addGoal({ commit, state }, goal) {
      commit('addGoal', goal)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    updateGoal({ commit, state }, goal) {
      commit('updateGoal', goal)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    deleteGoal({ commit, state }, goalId) {
      commit('deleteGoal', goalId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    setGoalCategories({ commit, state }, categories) {
      commit('setGoalCategories', categories)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    // 添加一条支出记录
    addExpense({ commit, state }, expense) {
      commit('addExpense', expense)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 更新一条支出记录
    updateExpense({ commit, state }, expense) {
      commit('updateExpense', expense)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 删除一条支出记录
    deleteExpense({ commit, state }, expenseId) {
      commit('deleteExpense', expenseId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 添加一个支出类别
    addCategory({ commit, state }, category) {
      commit('addCategory', category)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 更新一个支出类别
    updateCategory({ commit, state }, category) {
      commit('updateCategory', category)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 删除一个支出类别
    deleteCategory({ commit, state }, categoryId) {
      commit('deleteCategory', categoryId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 设置预算
    setBudget({ commit, state }, budget) {
      commit('setBudget', budget)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    
    // 设置应用设置
    setSettings({ commit, state }, settings) {
      commit('setSettings', settings)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }
})
