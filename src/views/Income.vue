<template>
  <div class="income">
    <el-card>
      <div slot="header" class="card-header">
        <div class="filter-section">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="handleDateRangeChange"
          ></el-date-picker>
          
          <el-select v-model="categoryFilter" placeholder="类别筛选" clearable @change="handleFilterChange">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
          
          <el-select v-model="receiveMethodFilter" placeholder="收款方式筛选" clearable @change="handleFilterChange">
            <el-option label="支付宝" value="alipay"></el-option>
            <el-option label="微信" value="wechat"></el-option>
            <el-option label="现金" value="cash"></el-option>
            <el-option label="银行转账" value="bank"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
          
          <el-input
            placeholder="搜索描述"
            v-model="searchQuery"
            clearable
            @change="handleFilterChange"
            prefix-icon="el-icon-search"
            style="width: 200px"
          ></el-input>
        </div>
        
        <el-button type="success" icon="el-icon-plus" @click="showAddIncome">
          添加收入
        </el-button>
      </div>
      
      <div class="stats-banner">
        <div class="stat-item">
          <div class="stat-title">收入总计</div>
          <div class="stat-value">¥{{ filteredTotal.toFixed(2) }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-title">记录数量</div>
          <div class="stat-value">{{ filteredIncomes.length }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-title">平均收入</div>
          <div class="stat-value">
            ¥{{ filteredIncomes.length ? (filteredTotal / filteredIncomes.length).toFixed(2) : '0.00' }}
          </div>
        </div>
      </div>
      
      <el-table
        :data="paginatedIncomes"
        style="width: 100%"
        :header-cell-style="{background:'#f5f7fa'}"
        stripe>
        <el-table-column label="日期" width="120" sortable prop="date">
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
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column label="收款方式" width="120">
          <template slot-scope="scope">
            {{ getReceiveMethodName(scope.row.receiveMethod) }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120" sortable prop="amount" align="right">
          <template slot-scope="scope">
            ¥{{ parseFloat(scope.row.amount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              circle
              @click="editIncome(scope.row)"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              @click="confirmDelete(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredIncomes.length">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑收入对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <IncomeForm 
        :edit-mode="editMode" 
        :income-data="currentIncome" 
        @submitted="handleSubmit" 
        @cancel="dialogVisible = false" 
      />
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import IncomeForm from '@/components/IncomeForm.vue'

export default {
  name: 'Income',
  components: {
    IncomeForm
  },
  data() {
    return {
      dialogVisible: false,
      editMode: false,
      currentIncome: null,
      dateRange: null,
      categoryFilter: '',
      receiveMethodFilter: '',
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      pickerOptions: {
        shortcuts: [
          {
            text: '本月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setDate(1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 1)
              start.setDate(1)
              end.setDate(0)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 3)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapState(['incomes', 'incomeCategories']),
    categories() {
      return this.incomeCategories
    },
    dialogTitle() {
      return this.editMode ? '编辑收入' : '添加收入'
    },
    filteredIncomes() {
      return this.incomes.filter(income => {
        // 日期筛选
        if (this.dateRange && this.dateRange.length === 2) {
          const incomeDate = new Date(income.date)
          const startDate = new Date(this.dateRange[0])
          const endDate = new Date(this.dateRange[1])
          endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
          
          if (incomeDate < startDate || incomeDate > endDate) {
            return false
          }
        }
        
        // 类别筛选
        if (this.categoryFilter && income.category !== this.categoryFilter) {
          return false
        }
        
        // 收款方式筛选
        if (this.receiveMethodFilter && income.receiveMethod !== this.receiveMethodFilter) {
          return false
        }
        
        // 描述搜索
        if (this.searchQuery && !income.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          return false
        }
        
        return true
      }).sort((a, b) => new Date(b.date) - new Date(a.date)) // 按日期降序排序
    },
    paginatedIncomes() {
      const startIndex = (this.currentPage - 1) * this.pageSize
      return this.filteredIncomes.slice(startIndex, startIndex + this.pageSize)
    },
    filteredTotal() {
      return this.filteredIncomes.reduce((total, income) => {
        return total + parseFloat(income.amount)
      }, 0)
    }
  },
  methods: {
    showAddIncome() {
      this.editMode = false
      this.currentIncome = null
      this.dialogVisible = true
    },
    editIncome(income) {
      this.editMode = true
      this.currentIncome = { ...income }
      this.dialogVisible = true
    },
    confirmDelete(income) {
      this.$confirm('确定要删除这条收入记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('deleteIncome', income.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })          
      })
    },
    handleSubmit(income) {
      if (this.editMode) {
        this.$store.dispatch('updateIncome', income)
        this.$message({
          message: '收入记录更新成功',
          type: 'success'
        })
      } else {
        this.$store.dispatch('addIncome', income)
        this.$message({
          message: '收入记录添加成功',
          type: 'success'
        })
      }
      this.dialogVisible = false
    },
    handleDateRangeChange() {
      this.currentPage = 1
    },
    handleFilterChange() {
      this.currentPage = 1
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    handleCurrentChange(page) {
      this.currentPage = page
    },
    getCategoryName(categoryId) {
      const category = this.incomeCategories.find(c => c.id === categoryId)
      return category ? category.name : '未分类'
    },
    getCategoryColor(categoryId) {
      const category = this.incomeCategories.find(c => c.id === categoryId)
      return category ? category.color : '#909399'
    },
    getReceiveMethodName(method) {
      const methodMap = {
        'alipay': '支付宝',
        'wechat': '微信',
        'cash': '现金',
        'bank': '银行转账',
        'other': '其他'
      }
      return methodMap[method] || method
    }
  },
  created() {
    // 设置默认日期范围为本月
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    this.dateRange = [
      start.toISOString().substr(0, 10),
      now.toISOString().substr(0, 10)
    ]
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stats-banner {
  display: flex;
  margin-bottom: 20px;
  background-color: #f0f9ff;
  border-radius: 4px;
  padding: 15px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 15px;
}

.stat-item:not(:last-child) {
  border-right: 1px solid #e0e6ed;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
