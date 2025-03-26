<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="card-header">
            <span>本月收入</span>
          </div>
          <div class="card-content">
            <div class="amount income-color">¥{{ totalMonthlyIncomes.toFixed(2) }}</div>
            <div class="compare-info">
              <el-tag size="small" type="success" effect="plain">
                <i class="el-icon-top"></i> 比上月增长 {{ getIncomeGrowth() }}%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="card-header">
            <span>本月支出</span>
          </div>
          <div class="card-content">
            <div class="amount expense-color">¥{{ totalMonthlyExpenses.toFixed(2) }}</div>
            <el-progress 
              :percentage="budgetPercentage" 
              :color="budgetProgressColor"
              :format="formatBudget"
              :stroke-width="10">
            </el-progress>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="card-header">
            <span>本月结余</span>
          </div>
          <div class="card-content">
            <div class="amount" :class="monthlyNetIncomeClass">
              ¥{{ monthlyNetIncome.toFixed(2) }}
            </div>
            <div class="balance-ratio">
              收支比: {{ (totalMonthlyExpenses > 0 ? (totalMonthlyIncomes / totalMonthlyExpenses * 100) : 0).toFixed(0) }}%
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="box-card" shadow="hover">
          <div slot="header" class="card-header">
            <span>快速添加</span>
          </div>
          <div class="card-content quick-actions">
            <el-button 
              type="success" 
              icon="el-icon-top" 
              size="small" 
              @click="openIncomeDialog">
              添加收入
            </el-button>
            <el-button 
              type="danger" 
              icon="el-icon-bottom" 
              size="small" 
              @click="openExpenseDialog">
              添加支出
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="8">
        <el-card>
          <div slot="header" class="card-header">
            <span>支出分类</span>
          </div>
          <div class="chart-container">
            <div ref="categoryChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header" class="card-header">
            <span>收入分类</span>
          </div>
          <div class="chart-container">
            <div ref="incomeCategoryChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header" class="card-header">
            <span>收支对比</span>
          </div>
          <div class="chart-container">
            <div ref="compareChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header">
            <span>最近收支趋势</span>
          </div>
          <div class="chart-container">
            <div ref="trendChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header">
            <span>最近收入记录</span>
            <el-button 
              style="float: right; padding: 3px 0" 
              type="text"
              @click="$router.push('/incomes')">
              查看全部
            </el-button>
          </div>
          <el-table 
            :data="recentIncomes" 
            style="width: 100%"
            :header-cell-style="{background:'#f5f7fa'}"
            stripe>
            <el-table-column label="日期" width="100">
              <template slot-scope="scope">
                {{ scope.row.date }}
              </template>
            </el-table-column>
            <el-table-column label="类别" width="120">
              <template slot-scope="scope">
                <el-tag :style="{ backgroundColor: getIncomeCategoryColor(scope.row.category), color: '#fff' }">
                  {{ getIncomeCategoryName(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="金额" width="100" align="right">
              <template slot-scope="scope">
                ¥{{ parseFloat(scope.row.amount).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div slot="header" class="card-header">
            <span>最近支出记录</span>
            <el-button 
              style="float: right; padding: 3px 0" 
              type="text"
              @click="$router.push('/expenses')">
              查看全部
            </el-button>
          </div>
          <el-table 
            :data="recentExpenses" 
            style="width: 100%"
            :header-cell-style="{background:'#f5f7fa'}"
            stripe>
            <el-table-column label="日期" width="100">
              <template slot-scope="scope">
                {{ scope.row.date }}
              </template>
            </el-table-column>
            <el-table-column label="类别" width="120">
              <template slot-scope="scope">
                <el-tag :style="{ backgroundColor: getCategoryColor(scope.row.category), color: '#fff' }">
                  {{ getCategoryName(scope.row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="金额" width="100" align="right">
              <template slot-scope="scope">
                ¥{{ parseFloat(scope.row.amount).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 添加支出对话框 -->
    <el-dialog title="添加支出" :visible.sync="dialogVisible" width="500px">
      <ExpenseForm @submitted="handleSubmit" @cancel="dialogVisible = false" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ExpenseForm from '@/components/ExpenseForm.vue'
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  components: {
    ExpenseForm
  },
  data() {
    return {
      dialogVisible: false,
      categoryChart: null,
      incomeCategoryChart: null,
      compareChart: null,
      trendChart: null
    }
  },
  computed: {
    ...mapState(['budget', 'categories', 'incomeCategories']),
    ...mapGetters([
      'currentMonthExpenses',
      'totalMonthlyExpenses',
      'budgetRemaining',
      'budgetPercentage',
      'expensesByCategory',
      'totalExpensesByMonth',
      'currentMonthIncomes',
      'totalMonthlyIncomes',
      'incomesByCategory',
      'totalIncomesByMonth',
      'monthlyNetIncome'
    ]),
    monthlyNetIncomeClass() {
      return this.monthlyNetIncome >= 0 ? 'positive' : 'negative'
    },
    budgetProgressColor() {
      if (this.budgetPercentage < 70) return '#67C23A'
      if (this.budgetPercentage < 90) return '#E6A23C'
      return '#F56C6C'
    },
    budgetRemainingClass() {
      return this.budgetRemaining >= 0 ? 'positive' : 'negative'
    },
    recentExpenses() {
      return [...this.currentMonthExpenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    },
    recentIncomes() {
      return [...this.currentMonthIncomes]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    }
  },
  methods: {
    formatBudget(percentage) {
      return percentage >= 100 ? '超出预算' : `${percentage.toFixed(0)}%`
    },
    getIncomeGrowth() {
      // 计算上月收入
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthKey = `${lastMonth.getFullYear()}-${lastMonth.getMonth() + 1}`
      
      const lastMonthIncome = this.totalIncomesByMonth[lastMonthKey] || 0
      
      if (lastMonthIncome === 0) return 0
      
      const growth = ((this.totalMonthlyIncomes - lastMonthIncome) / lastMonthIncome) * 100
      return growth.toFixed(1)
    },
    openIncomeDialog() {
      this.$router.push('/incomes')
    },
    getIncomeCategoryName(categoryId) {
      const category = this.incomeCategories.find(c => c.id === categoryId)
      return category ? category.name : '未分类'
    },
    getIncomeCategoryColor(categoryId) {
      const category = this.incomeCategories.find(c => c.id === categoryId)
      return category ? category.color : '#909399'
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      return category ? category.name : '未分类'
    },
    getCategoryColor(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      return category ? category.color : '#909399'
    },
    openExpenseDialog() {
      this.dialogVisible = true
    },
    handleSubmit(expense) {
      this.$store.dispatch('addExpense', expense)
      this.dialogVisible = false
      this.$message({
        message: '支出记录添加成功',
        type: 'success'
      })
      this.initCharts()
    },
    initCategoryChart() {
      if (!this.$refs.categoryChart) return
      
      // 准备数据
      const data = this.categories.map(category => {
        const value = this.expensesByCategory[category.id] || 0
        return {
          name: category.name,
          value: value,
          itemStyle: { color: category.color }
        }
      }).filter(item => item.value > 0)
      
      // 初始化图表
      this.categoryChart = echarts.init(this.$refs.categoryChart)
      
      // 设置选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ¥{c} ({d}%)'
        },
        series: [
          {
            name: '支出类别',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: data
          }
        ]
      }
      
      this.categoryChart.setOption(option)
    },
    initIncomeCategoryChart() {
      if (!this.$refs.incomeCategoryChart) return
      
      // 准备数据
      const data = this.incomeCategories.map(category => {
        const value = this.incomesByCategory[category.id] || 0
        return {
          name: category.name,
          value: value,
          itemStyle: { color: category.color }
        }
      }).filter(item => item.value > 0)
      
      // 初始化图表
      this.incomeCategoryChart = echarts.init(this.$refs.incomeCategoryChart)
      
      // 设置选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ¥{c} ({d}%)'
        },
        series: [
          {
            name: '收入类别',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: data
          }
        ]
      }
      
      this.incomeCategoryChart.setOption(option)
    },
    initCompareChart() {
      if (!this.$refs.compareChart) return
      
      // 准备数据
      const months = []
      const incomes = []
      const expenses = []
      
      // 获取最近6个月的数据
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`
        const monthName = d.toLocaleString('zh-CN', { month: 'short' })
        
        months.push(monthName)
        incomes.push(this.totalIncomesByMonth[monthKey] || 0)
        expenses.push(this.totalExpensesByMonth[monthKey] || 0)
      }
      
      // 初始化图表
      this.compareChart = echarts.init(this.$refs.compareChart)
      
      // 设置选项
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const income = params[0].value.toFixed(2)
            const expense = params[1].value.toFixed(2)
            const net = (params[0].value - params[1].value).toFixed(2)
            
            return `${params[0].name}<br/>
                   收入: ¥${income}<br/>
                   支出: ¥${expense}<br/>
                   结余: ¥${net}`
          }
        },
        legend: {
          data: ['收入', '支出']
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '收入',
            type: 'bar',
            data: incomes,
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '支出',
            type: 'bar',
            data: expenses,
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      }
      
      this.compareChart.setOption(option)
    },
    initTrendChart() {
      if (!this.$refs.trendChart) return
      
      // 处理数据
      const months = []
      const incomes = []
      const expenses = []
      const balance = []
      
      // 获取最近6个月的数据
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`
        const monthName = d.toLocaleString('zh-CN', { month: 'short' })
        
        const monthIncome = this.totalIncomesByMonth[monthKey] || 0
        const monthExpense = this.totalExpensesByMonth[monthKey] || 0
        
        months.push(monthName)
        incomes.push(monthIncome)
        expenses.push(monthExpense)
        balance.push(monthIncome - monthExpense)
      }
      
      // 初始化图表
      this.trendChart = echarts.init(this.$refs.trendChart)
      
      // A设置选项
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let tooltip = params[0].name + '<br/>'
            
            params.forEach(param => {
              const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
              tooltip += marker + param.seriesName + ': ¥' + param.value.toFixed(2) + '<br/>'
            })
            
            return tooltip
          }
        },
        legend: {
          data: ['收入', '支出', '结余']
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '¥{value}'
          }
        },
        series: [
          {
            name: '收入',
            data: incomes,
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#67C23A'
            }
          },
          {
            name: '支出',
            data: expenses,
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#F56C6C'
            }
          },
          {
            name: '结余',
            data: balance,
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#409EFF'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(64, 158, 255, 0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(64, 158, 255, 0.1)'
                }
              ])
            }
          }
        ]
      }
      
      this.trendChart.setOption(option)
    },
    initCharts() {
      this.$nextTick(() => {
        this.initCategoryChart()
        this.initIncomeCategoryChart()
        this.initCompareChart()
        this.initTrendChart()
      })
    },
    handleResize() {
      if (this.categoryChart) this.categoryChart.resize()
      if (this.incomeCategoryChart) this.incomeCategoryChart.resize()
      if (this.compareChart) this.compareChart.resize()
      if (this.trendChart) this.trendChart.resize()
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.categoryChart) {
      this.categoryChart.dispose()
      this.categoryChart = null
    }
    if (this.incomeCategoryChart) {
      this.incomeCategoryChart.dispose()
      this.incomeCategoryChart = null
    }
    if (this.compareChart) {
      this.compareChart.dispose()
      this.compareChart = null
    }
    if (this.trendChart) {
      this.trendChart.dispose()
      this.trendChart = null
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100px;
}

.amount {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.income-color {
  color: #67C23A;
}

.expense-color {
  color: #F56C6C;
}

.compare-info {
  margin-top: 5px;
}

.balance-ratio {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.budget-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.budget-label {
  color: #606266;
}

.budget-value {
  font-weight: bold;
  font-size: 18px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

.chart-row {
  margin-top: 20px;
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
