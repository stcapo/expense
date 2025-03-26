<template>
  <div class="budget">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <div slot="header" class="card-header">
            <span>预算管理</span>
            <el-button type="primary" size="small" @click="showEditTotalBudget">
              设置总预算
            </el-button>
          </div>
          
          <!-- 预算总览 -->
          <div class="budget-overview">
            <div class="budget-progress">
              <div class="budget-title">
                <div>本月总预算</div>
                <div class="budget-amount">¥{{ budget.total.toFixed(2) }}</div>
              </div>
              <el-progress 
                :percentage="budgetPercentage" 
                :color="budgetProgressColor"
                :format="formatBudget"
                :stroke-width="20">
              </el-progress>
              <div class="budget-status">
                <div>
                  <div>已使用</div>
                  <div class="amount">¥{{ totalMonthlyExpenses.toFixed(2) }}</div>
                </div>
                <div>
                  <div>剩余</div>
                  <div class="amount" :class="budgetRemainingClass">
                    ¥{{ budgetRemaining.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 类别预算表 -->
          <div class="category-budget-table">
            <div class="table-title">类别预算分配</div>
            
            <el-table
              :data="categoryBudgets"
              style="width: 100%"
              :header-cell-style="{background:'#f5f7fa'}"
              stripe>
              <el-table-column width="80">
                <template slot-scope="scope">
                  <div class="category-icon-preview" :style="{backgroundColor: scope.row.color}">
                    <i :class="scope.row.icon"></i>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="类别名称"></el-table-column>
              <el-table-column label="已使用/预算" width="200">
                <template slot-scope="scope">
                  <div v-if="scope.row.budget > 0">
                    <div class="budget-text">
                      ¥{{ scope.row.spent.toFixed(2) }} / ¥{{ scope.row.budget.toFixed(2) }}
                    </div>
                    <el-progress 
                      :percentage="getBudgetPercentage(scope.row)" 
                      :color="getBudgetColor(scope.row)"
                      :show-text="false">
                    </el-progress>
                  </div>
                  <span v-else>未设置</span>
                </template>
              </el-table-column>
              <el-table-column label="剩余" width="150">
                <template slot-scope="scope">
                  <span v-if="scope.row.budget > 0" :class="scope.row.remaining >= 0 ? 'positive' : 'negative'">
                    ¥{{ scope.row.remaining.toFixed(2) }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    @click="editCategoryBudget(scope.row)">
                    设置预算
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header" class="card-header">
            <span>预算分配</span>
          </div>
          <div class="chart-container">
            <div ref="budgetPieChart" class="chart"></div>
          </div>
        </el-card>
        
        <el-card style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span>支出与预算比较</span>
          </div>
          <div class="chart-container">
            <div ref="budgetBarChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 设置总预算对话框 -->
    <el-dialog title="设置总预算" :visible.sync="totalBudgetDialogVisible" width="400px">
      <el-form :model="totalBudgetForm" ref="totalBudgetForm" label-width="100px">
        <el-form-item label="月度总预算" prop="total">
          <el-input-number 
            v-model="totalBudgetForm.total" 
            :min="0" 
            :step="100" 
            :precision="2"
            style="width: 200px;">
          </el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="totalBudgetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTotalBudget">确定</el-button>
      </div>
    </el-dialog>
    
    <!-- 设置类别预算对话框 -->
    <el-dialog title="设置类别预算" :visible.sync="categoryBudgetDialogVisible" width="400px">
      <el-form :model="categoryBudgetForm" ref="categoryBudgetForm" label-width="100px">
        <el-form-item label="类别" prop="categoryId">
          <div>{{ categoryBudgetForm.categoryName }}</div>
        </el-form-item>
        <el-form-item label="月度预算" prop="budget">
          <el-input-number 
            v-model="categoryBudgetForm.budget" 
            :min="0" 
            :step="100" 
            :precision="2"
            style="width: 200px;">
          </el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="categoryBudgetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategoryBudget">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as echarts from 'echarts'

export default {
  name: 'Budget',
  data() {
    return {
      totalBudgetDialogVisible: false,
      categoryBudgetDialogVisible: false,
      totalBudgetForm: {
        total: 0
      },
      categoryBudgetForm: {
        categoryId: '',
        categoryName: '',
        budget: 0
      },
      budgetPieChart: null,
      budgetBarChart: null
    }
  },
  computed: {
    ...mapState(['budget', 'categories', 'expenses']),
    ...mapGetters(['currentMonthExpenses', 'totalMonthlyExpenses', 'expensesByCategory']),
    budgetPercentage() {
      return this.budget.total > 0 ? (this.totalMonthlyExpenses / this.budget.total) * 100 : 0
    },
    budgetRemaining() {
      return this.budget.total - this.totalMonthlyExpenses
    },
    budgetProgressColor() {
      if (this.budgetPercentage < 70) return '#67C23A'
      if (this.budgetPercentage < 90) return '#E6A23C'
      return '#F56C6C'
    },
    budgetRemainingClass() {
      return this.budgetRemaining >= 0 ? 'positive' : 'negative'
    },
    categoryBudgets() {
      return this.categories.map(category => {
        const budget = this.budget.categoryLimits[category.id] || 0
        const spent = this.expensesByCategory[category.id] || 0
        const remaining = budget - spent
        
        return {
          ...category,
          budget,
          spent,
          remaining
        }
      })
    }
  },
  methods: {
    formatBudget(percentage) {
      return percentage >= 100 ? '超出预算' : `${percentage.toFixed(0)}%`
    },
    getBudgetPercentage(category) {
      return category.budget > 0 ? Math.min((category.spent / category.budget) * 100, 100) : 0
    },
    getBudgetColor(category) {
      const percentage = this.getBudgetPercentage(category)
      if (percentage < 70) return '#67C23A'
      if (percentage < 90) return '#E6A23C'
      return '#F56C6C'
    },
    showEditTotalBudget() {
      this.totalBudgetForm.total = this.budget.total
      this.totalBudgetDialogVisible = true
    },
    saveTotalBudget() {
      const newBudget = { ...this.budget }
      newBudget.total = this.totalBudgetForm.total
      
      this.$store.dispatch('setBudget', newBudget)
      this.totalBudgetDialogVisible = false
      
      this.$message({
        message: '总预算设置成功',
        type: 'success'
      })
      
      this.updateCharts()
    },
    editCategoryBudget(category) {
      this.categoryBudgetForm = {
        categoryId: category.id,
        categoryName: category.name,
        budget: category.budget
      }
      this.categoryBudgetDialogVisible = true
    },
    saveCategoryBudget() {
      const newBudget = { ...this.budget }
      newBudget.categoryLimits = { ...newBudget.categoryLimits }
      newBudget.categoryLimits[this.categoryBudgetForm.categoryId] = this.categoryBudgetForm.budget
      
      this.$store.dispatch('setBudget', newBudget)
      this.categoryBudgetDialogVisible = false
      
      this.$message({
        message: '类别预算设置成功',
        type: 'success'
      })
      
      this.updateCharts()
    },
    initBudgetPieChart() {
      if (!this.$refs.budgetPieChart) return
      
      // 准备数据 - 只包含有预算的类别
      const categoryBudgets = this.categoryBudgets
        .filter(category => category.budget > 0)
        .map(category => ({
          name: category.name,
          value: category.budget,
          itemStyle: { color: category.color }
        }))
      
      // 添加未分配预算
      const allocatedBudget = categoryBudgets.reduce((sum, cat) => sum + cat.value, 0)
      const unallocated = Math.max(0, this.budget.total - allocatedBudget)
      
      if (unallocated > 0) {
        categoryBudgets.push({
          name: '未分配预算',
          value: unallocated,
          itemStyle: { color: '#E0E0E0' }
        })
      }
      
      // 初始化图表
      if (!this.budgetPieChart) {
        this.budgetPieChart = echarts.init(this.$refs.budgetPieChart)
      }
      
      // 设置选项
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ¥{c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: categoryBudgets.map(item => item.name)
        },
        series: [
          {
            name: '预算分配',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: categoryBudgets
          }
        ]
      }
      
      this.budgetPieChart.setOption(option)
    },
    initBudgetBarChart() {
      if (!this.$refs.budgetBarChart) return
      
      // 准备数据 - 只包含有预算的类别
      const categories = this.categoryBudgets
        .filter(category => category.budget > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5) // 只展示前5个类别
      
      const categoryNames = categories.map(item => item.name)
      const budgetValues = categories.map(item => item.budget)
      const spentValues = categories.map(item => item.spent)
      
      // 初始化图表
      if (!this.budgetBarChart) {
        this.budgetBarChart = echarts.init(this.$refs.budgetBarChart)
      }
      
      // 设置选项
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params) {
            const budgetValue = params[0].value
            const spentValue = params[1].value
            const percentage = budgetValue > 0 ? Math.round((spentValue / budgetValue) * 100) : 0
            
            return `${params[0].name}<br/>
                    预算: ¥${budgetValue.toFixed(2)}<br/>
                    已用: ¥${spentValue.toFixed(2)}<br/>
                    比例: ${percentage}%`
          }
        },
        legend: {
          data: ['预算', '已用']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '¥{value}'
            }
          }
        ],
        yAxis: [
          {
            type: 'category',
            data: categoryNames,
            axisLabel: {
              formatter: function(value) {
                return value.length > 4 ? value.substring(0, 4) + '...' : value
              },
              interval: 0
            }
          }
        ],
        series: [
          {
            name: '预算',
            type: 'bar',
            itemStyle: {
              color: '#91cc75'
            },
            stack: '总量',
            data: budgetValues
          },
          {
            name: '已用',
            type: 'bar',
            stack: '已用',
            itemStyle: {
              color: '#5470c6'
            },
            data: spentValues,
            barWidth: 10
          }
        ]
      }
      
      this.budgetBarChart.setOption(option)
    },
    updateCharts() {
      this.$nextTick(() => {
        this.initBudgetPieChart()
        this.initBudgetBarChart()
      })
    },
    handleResize() {
      if (this.budgetPieChart) this.budgetPieChart.resize()
      if (this.budgetBarChart) this.budgetBarChart.resize()
    }
  },
  mounted() {
    this.updateCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.budgetPieChart) {
      this.budgetPieChart.dispose()
      this.budgetPieChart = null
    }
    if (this.budgetBarChart) {
      this.budgetBarChart.dispose()
      this.budgetBarChart = null
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-overview {
  margin-bottom: 30px;
}

.budget-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.budget-amount {
  font-size: 20px;
  font-weight: bold;
}

.budget-status {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.amount {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

.category-budget-table {
  margin-top: 20px;
}

.table-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}

.category-icon-preview {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto;
}

.category-icon-preview i {
  font-size: 20px;
}

.budget-text {
  margin-bottom: 5px;
  font-size: 14px;
}

.chart-container {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
