<template>
  <div class="header">
    <div class="left">
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>
    <div class="right">
      <el-button-group v-if="showIncomeButton()">
        <el-button type="success" size="small" icon="el-icon-top" @click="showAddIncome">
          添加收入
        </el-button>
        <el-button type="danger" size="small" icon="el-icon-bottom" @click="showAddExpense">
          添加支出
        </el-button>
      </el-button-group>
      
      <el-button v-if="$route.path === '/incomes'" type="success" size="small" icon="el-icon-plus" @click="showAddIncome">
        添加收入
      </el-button>
      
      <el-button v-if="$route.path === '/expenses'" type="danger" size="small" icon="el-icon-plus" @click="showAddExpense">
        添加支出
      </el-button>
    </div>
    
    <!-- 添加收入对话框 -->
    <el-dialog title="添加收入" :visible.sync="incomeDialogVisible" width="500px">
      <IncomeForm @submitted="handleIncomeSubmit" @cancel="incomeDialogVisible = false" />
    </el-dialog>
    
    <!-- 添加支出对话框 -->
    <el-dialog title="添加支出" :visible.sync="expenseDialogVisible" width="500px">
      <ExpenseForm @submitted="handleExpenseSubmit" @cancel="expenseDialogVisible = false" />
    </el-dialog>
  </div>
</template>

<script>
import ExpenseForm from '@/components/ExpenseForm.vue'
import IncomeForm from '@/components/IncomeForm.vue'

export default {
  name: 'Header',
  components: {
    ExpenseForm,
    IncomeForm
  },
  data() {
    return {
      expenseDialogVisible: false,
      incomeDialogVisible: false
    }
  },
  computed: {
    pageTitle() {
      const routePath = this.$route.path
      const routeMap = {
        '/': '总览',
        '/incomes': '收入记录',
        '/income-categories': '收入类别',
        '/expenses': '支出记录',
        '/categories': '支出类别',
        '/reports': '报表分析',
        '/budget': '预算管理',
        '/settings': '设置'
      }
      return routeMap[routePath] || '个人财务管理'
    }
  },
  methods: {
    showIncomeButton() {
      return this.$route.path === '/'
    },
    showAddExpense() {
      this.expenseDialogVisible = true
    },
    showAddIncome() {
      this.incomeDialogVisible = true
    },
    handleExpenseSubmit(expense) {
      this.$store.dispatch('addExpense', expense)
      this.expenseDialogVisible = false
      this.$message({
        message: '支出记录添加成功',
        type: 'success'
      })
    },
    handleIncomeSubmit(income) {
      this.$store.dispatch('addIncome', income)
      this.incomeDialogVisible = false
      this.$message({
        message: '收入记录添加成功',
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}
</style>
