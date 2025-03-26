<template>
  <div class="income-categories">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <div slot="header" class="card-header">
            <span>收入类别管理</span>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddCategory">
              添加类别
            </el-button>
          </div>
          
          <el-table
            :data="incomeCategories"
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
            <el-table-column label="本月收入" width="180">
              <template slot-scope="scope">
                ¥{{ getCategoryIncome(scope.row.id).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="占比" width="180">
              <template slot-scope="scope">
                {{ getCategoryPercentage(scope.row.id).toFixed(2) }}%
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
            <span>类别收入分析</span>
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
  name: 'IncomeCategories',
  data() {
    return {
      dialogVisible: false,
      editMode: false,
      categoryForm: {
        id: '',
        name: '',
        icon: 'el-icon-money',
        color: '#67C23A'
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
        { value: 'el-icon-money', label: '钱' },
        { value: 'el-icon-coin', label: '硬币' },
        { value: 'el-icon-wallet', label: '钱包' },
        { value: 'el-icon-bank-card', label: '银行卡' },
        { value: 'el-icon-s-finance', label: '财务' },
        { value: 'el-icon-data-line', label: '图表' },
        { value: 'el-icon-s-cooperation', label: '合作' },
        { value: 'el-icon-present', label: '礼物' },
        { value: 'el-icon-house', label: '房屋' },
        { value: 'el-icon-box', label: '盒子' },
        { value: 'el-icon-s-shop', label: '商店' },
        { value: 'el-icon-more', label: '其他' }
      ],
      pieChart: null
    }
  },
  computed: {
    ...mapState(['incomeCategories', 'incomes']),
    ...mapGetters(['incomesByCategory', 'totalMonthlyIncomes', 'currentMonthIncomes']),
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
        icon: 'el-icon-money',
        color: '#67C23A'
      }
      this.dialogVisible = true
    },
    editCategory(category) {
      this.editMode = true
      this.categoryForm = { ...category }
      this.dialogVisible = true
    },
    confirmDelete(category) {
      if (this.isSystemCategory(category.id)) {
        this.$message.warning('系统默认类别不能删除')
        return
      }
      
      // 检查该类别是否有关联的收入
      const hasIncomes = this.incomes.some(i => i.category === category.id)
      
      if (hasIncomes) {
        this.$confirm('该类别下有收入记录，删除后这些记录将转为"其他"类别。是否继续?', '警告', {
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
      // 首先更新所有使用该类别的收入记录
      this.incomes.forEach(income => {
        if (income.category === categoryId) {
          income.category = 'other'
          this.$store.dispatch('updateIncome', income)
        }
      })
      
      // 删除类别
      this.$store.dispatch('deleteIncomeCategory', categoryId)
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
          
          if (!this.editMode) {
            // 新增模式，生成唯一ID
            categoryData.id = 'inc_' + Date.now().toString()
          }
          
          // 保存类别
          if (this.editMode) {
            this.$store.dispatch('updateIncomeCategory', categoryData)
          } else {
            this.$store.dispatch('addIncomeCategory', categoryData)
          }
          
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
      const systemCategories = ['salary', 'bonus', 'investment', 'other']
      return systemCategories.includes(categoryId)
    },
    getCategoryIncome(categoryId) {
      return this.incomesByCategory[categoryId] || 0
    },
    getCategoryPercentage(categoryId) {
      const categoryIncome = this.getCategoryIncome(categoryId)
      return this.totalMonthlyIncomes > 0 ? (categoryIncome / this.totalMonthlyIncomes * 100) : 0
    },
    initPieChart() {
      if (!this.$refs.pieChart) return
      
      // 准备数据
      const data = this.incomeCategories.map(category => {
        const value = this.incomesByCategory[category.id] || 0
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
            name: '类别收入',
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
