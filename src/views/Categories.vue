<template>
  <div class="categories">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <div slot="header" class="card-header">
            <span>支出类别管理</span>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddCategory">
              添加类别
            </el-button>
          </div>
          
          <el-table
            :data="categories"
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
            <el-table-column label="预算" width="180">
              <template slot-scope="scope">
                {{ getCategoryBudget(scope.row.id) }}
              </template>
            </el-table-column>
            <el-table-column label="本月支出" width="180">
              <template slot-scope="scope">
                ¥{{ getCategoryExpense(scope.row.id).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  circle
                  @click="editCategory(scope.row)"
                ></el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  :disabled="isSystemCategory(scope.row.id)"
                  @click="confirmDelete(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card>
          <div slot="header" class="card-header">
            <span>类别支出分析</span>
          </div>
          <div class="chart-container">
            <div ref="pieChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 添加/编辑类别对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="categoryForm" :rules="rules" ref="categoryForm" label-width="100px">
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="categoryForm.name" autocomplete="off"></el-input>
        </el-form-item>
        
        <el-form-item label="图标" prop="icon">
          <el-select v-model="categoryForm.icon" placeholder="选择图标">
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value">
              <i :class="icon.value" style="margin-right: 8px;"></i>
              {{ icon.label }}
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="categoryForm.color"></el-color-picker>
        </el-form-item>
        
        <el-form-item label="类别预算" prop="budget">
          <el-input-number 
            v-model="categoryForm.budget" 
            :min="0" 
            :step="100" 
            :precision="2"
            :controls="false"
            style="width: 200px;"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as echarts from 'echarts'

export default {
  name: 'Categories',
  data() {
    return {
      dialogVisible: false,
      editMode: false,
      categoryForm: {
        id: '',
        name: '',
        icon: 'el-icon-more',
        color: '#409EFF',
        budget: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入类别名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        icon: [
          { required: true, message: '请选择图标', trigger: 'change' }
        ],
        color: [
          { required: true, message: '请选择颜色', trigger: 'change' }
        ]
      },
      iconOptions: [
        { value: 'el-icon-food', label: '餐饮' },
        { value: 'el-icon-shopping-bag', label: '购物' },
        { value: 'el-icon-house', label: '住房' },
        { value: 'el-icon-truck', label: '交通' },
        { value: 'el-icon-film', label: '娱乐' },
        { value: 'el-icon-first-aid-kit', label: '医疗' },
        { value: 'el-icon-reading', label: '教育' },
        { value: 'el-icon-place', label: '旅行' },
        { value: 'el-icon-money', label: '财务' },
        { value: 'el-icon-goods', label: '日用品' },
        { value: 'el-icon-present', label: '礼物' },
        { value: 'el-icon-mobile-phone', label: '通讯' },
        { value: 'el-icon-s-finance', label: '投资' },
        { value: 'el-icon-more', label: '其他' }
      ],
      pieChart: null
    }
  },
  computed: {
    ...mapState(['categories', 'budget', 'expenses']),
    ...mapGetters(['expensesByCategory', 'currentMonthExpenses']),
    dialogTitle() {
      return this.editMode ? '编辑类别' : '添加类别'
    }
  },
  methods: {
    showAddCategory() {
      this.editMode = false
      this.categoryForm = {
        id: '',
        name: '',
        icon: 'el-icon-more',
        color: '#409EFF',
        budget: 0
      }
      this.dialogVisible = true
    },
    editCategory(category) {
      this.editMode = true
      this.categoryForm = {
        ...category,
        budget: this.budget.categoryLimits[category.id] || 0
      }
      this.dialogVisible = true
    },
    confirmDelete(category) {
      if (this.isSystemCategory(category.id)) {
        this.$message.warning('系统默认类别不能删除')
        return
      }
      
      // 检查该类别是否有关联的支出
      const hasExpenses = this.expenses.some(e => e.category === category.id)
      
      if (hasExpenses) {
        this.$confirm('该类别下有支出记录，删除后这些记录将转为"其他"类别。是否继续?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteCategory(category.id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })          
        })
      } else {
        this.$confirm('确定要删除该类别吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteCategory(category.id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })          
        })
      }
    },
    deleteCategory(categoryId) {
      // 首先更新所有使用该类别的支出记录
      this.expenses.forEach(expense => {
        if (expense.category === categoryId) {
          expense.category = 'other'
          this.$store.dispatch('updateExpense', expense)
        }
      })
      
      // 删除类别
      this.$store.dispatch('deleteCategory', categoryId)
      this.$message({
        type: 'success',
        message: '删除成功!'
      })
      
      // 更新图表
      this.initPieChart()
    },
    submitForm() {
      this.$refs.categoryForm.validate((valid) => {
        if (valid) {
          const categoryData = { ...this.categoryForm }
          const budgetValue = categoryData.budget
          delete categoryData.budget
          
          if (!this.editMode) {
            // 新增模式，生成唯一ID
            categoryData.id = 'cat_' + Date.now().toString()
          }
          
          // 保存类别
          if (this.editMode) {
            this.$store.dispatch('updateCategory', categoryData)
          } else {
            this.$store.dispatch('addCategory', categoryData)
          }
          
          // 更新预算
          const newBudget = { ...this.budget }
          newBudget.categoryLimits = { ...newBudget.categoryLimits }
          newBudget.categoryLimits[categoryData.id] = budgetValue
          this.$store.dispatch('setBudget', newBudget)
          
          this.dialogVisible = false
          
          this.$message({
            message: this.editMode ? '类别更新成功' : '类别添加成功',
            type: 'success'
          })
          
          // 更新图表
          this.initPieChart()
        } else {
          return false
        }
      })
    },
    isSystemCategory(categoryId) {
      // 定义不能删除的系统类别
      const systemCategories = ['food', 'shopping', 'housing', 'transportation', 'other']
      return systemCategories.includes(categoryId)
    },
    getCategoryBudget(categoryId) {
      const budget = this.budget.categoryLimits[categoryId]
      return budget ? `¥${budget.toFixed(2)}` : '未设置'
    },
    getCategoryExpense(categoryId) {
      return this.expensesByCategory[categoryId] || 0
    },
    initPieChart() {
      if (!this.$refs.pieChart) return
      
      // 准备数据
      const data = this.categories.map(category => {
        const value = this.expensesByCategory[category.id] || 0
        return {
          name: category.name,
          value: value,
          itemStyle: { color: category.color }
        }
      }).filter(item => item.value > 0)
      
      // 按金额排序
      data.sort((a, b) => b.value - a.value)
      
      // 初始化图表
      if (!this.pieChart) {
        this.pieChart = echarts.init(this.$refs.pieChart)
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
          data: data.map(item => item.name)
        },
        series: [
          {
            name: '类别支出',
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
            data: data
          }
        ]
      }
      
      this.pieChart.setOption(option)
    },
    handleResize() {
      if (this.pieChart) this.pieChart.resize()
    }
  },
  mounted() {
    this.initPieChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.pieChart) {
      this.pieChart.dispose()
      this.pieChart = null
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

.chart-container {
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
