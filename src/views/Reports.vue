<template>
  <div class="reports">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <ReportHeader 
            slot="header" 
            :report-type="reportType" 
            :time-range="timeRange" 
            :date-range="dateRange" 
            @report-type-change="handleReportTypeChange" 
            @time-range-change="handleTimeRangeChange"
            @date-range-change="handleDateRangeChange" 
          />
          
          <ChartContainer 
            :chart-type="reportType" 
            :chart-data="mainChartData" 
          />
        </el-card>
      </el-col>
    </el-row>
    
    <StatsCards :stats-data="statsData" />
    
    <el-row :gutter="20" class="details-row">
      <el-col :span="reportType === 'monthly' ? 24 : 12">
        <el-card>
          <div slot="header" class="card-header">
            <span>{{ detailsTitle }}</span>
          </div>
          <DetailsTable 
            :report-type="reportType" 
            :data="detailsTableData" 
            :label-name="detailsLabelName" 
          />
        </el-card>
      </el-col>
      
      <el-col :span="12" v-if="reportType !== 'monthly'">
        <el-card>
          <div slot="header" class="card-header">
            <span>{{ secondaryTitle }}</span>
          </div>
          <SecondaryChart 
            :chart-type="secondaryChartType" 
            :chart-data="secondaryChartData" 
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ReportHeader from '@/components/reports/ReportHeader.vue'
import ChartContainer from '@/components/reports/ChartContainer.vue'
import StatsCards from '@/components/reports/StatsCards.vue'
import DetailsTable from '@/components/reports/DetailsTable.vue'
import SecondaryChart from '@/components/reports/SecondaryChart.vue'

export default {
  name: 'Reports',
  components: {
    ReportHeader,
    ChartContainer,
    StatsCards,
    DetailsTable,
    SecondaryChart
  },
  data() {
    return {
      reportType: 'monthly',
      timeRange: '6',
      dateRange: null
    }
  },
  computed: {
    ...mapState(['expenses', 'categories']),
    filteredExpenses() {
      if (this.reportType === 'monthly') {
        // 对于月度趋势，根据timeRange筛选数据
        const now = new Date()
        let startDate
        
        if (this.timeRange === 'year') {
          // 当年1月1日
          startDate = new Date(now.getFullYear(), 0, 1)
        } else {
          // 最近N个月
          startDate = new Date()
          startDate.setMonth(startDate.getMonth() - parseInt(this.timeRange))
        }
        
        return this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startDate && expenseDate <= now
        })
      } else {
        // 对于其他报表类型，使用dateRange筛选
        if (!this.dateRange || this.dateRange.length !== 2) {
          return this.expenses
        }
        
        const startDate = new Date(this.dateRange[0])
        const endDate = new Date(this.dateRange[1])
        endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
        
        return this.expenses.filter(expense => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startDate && expenseDate <= endDate
        })
      }
    },
    monthlyData() {
      const data = {}
      
      // 初始化月份数据
      const now = new Date()
      let months = 0
      
      if (this.timeRange === 'year') {
        // 当年所有月份
        months = now.getMonth() + 1
      } else {
        // 最近N个月
        months = parseInt(this.timeRange)
      }
      
      for (let i = 0; i < months; i++) {
        const d = new Date()
        if (this.timeRange === 'year') {
          // 当年的月份，从1月开始
          d.setMonth(i)
        } else {
          // 最近N个月，倒序
          d.setMonth(d.getMonth() - i)
        }
        
        const year = d.getFullYear()
        const month = d.getMonth()
        const key = `${year}-${month + 1}`
        const monthName = d.toLocaleString('zh-CN', { year: 'numeric', month: 'short' })
        
        data[key] = {
          month: monthName,
          expenses: [],
          totalExpense: 0,
          avgExpense: 0,
          maxExpense: 0,
          count: 0,
          topCategory: '',
          categoryExpenses: {}
        }
      }
      
      // 统计每月数据
      this.filteredExpenses.forEach(expense => {
        const expenseDate = new Date(expense.date)
        const year = expenseDate.getFullYear()
        const month = expenseDate.getMonth()
        const key = `${year}-${month + 1}`
        
        if (data[key]) {
          const amount = parseFloat(expense.amount)
          
          data[key].expenses.push(expense)
          data[key].totalExpense += amount
          data[key].maxExpense = Math.max(data[key].maxExpense, amount)
          data[key].count += 1
          
          // 统计类别支出
          if (!data[key].categoryExpenses[expense.category]) {
            data[key].categoryExpenses[expense.category] = 0
          }
          data[key].categoryExpenses[expense.category] += amount
        }
      })
      
      // 计算均值和排名
      Object.keys(data).forEach(key => {
        const monthData = data[key]
        const daysInMonth = new Date(parseInt(key.split('-')[0]), parseInt(key.split('-')[1]), 0).getDate()
        
        monthData.avgExpense = monthData.count > 0 ? monthData.totalExpense / daysInMonth : 0
        
        // 找出支出最多的类别
        let maxCategory = ''
        let maxAmount = 0
        
        Object.keys(monthData.categoryExpenses).forEach(catId => {
          if (monthData.categoryExpenses[catId] > maxAmount) {
            maxAmount = monthData.categoryExpenses[catId]
            maxCategory = catId
          }
        })
        
        monthData.topCategory = this.getCategoryName(maxCategory)
      })
      
      // 转换为数组并排序
      let result = Object.keys(data).map(key => data[key])
      
      if (this.timeRange === 'year') {
        // 按月份顺序排序（从1月到12月）
        result.sort((a, b) => {
          const monthA = new Date(a.month).getMonth()
          const monthB = new Date(b.month).getMonth()
          return monthA - monthB
        })
      } else {
        // 按时间倒序排序（最近的月份在前）
        result.sort((a, b) => {
          const dateA = new Date(a.month)
          const dateB = new Date(b.month)
          return dateB - dateA
        })
      }
      
      return result
    },
    categoryData() {
      const data = {}
      
      // 初始化类别数据
      this.categories.forEach(category => {
        data[category.id] = {
          id: category.id,
          name: category.name,
          color: category.color,
          value: 0,
          count: 0,
          percentage: 0
        }
      })
      
      // 统计各类别支出
      let totalExpense = 0
      this.filteredExpenses.forEach(expense => {
        const amount = parseFloat(expense.amount)
        totalExpense += amount
        
        if (data[expense.category]) {
          data[expense.category].value += amount
          data[expense.category].count += 1
        }
      })
      
      // 计算百分比
      Object.keys(data).forEach(key => {
        data[key].percentage = totalExpense > 0 ? (data[key].value / totalExpense) * 100 : 0
      })
      
      // 转换为数组并按金额降序排序
      return Object.values(data)
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
    },
    paymentData() {
      const methodMap = {
        'alipay': '支付宝',
        'wechat': '微信',
        'cash': '现金',
        'credit': '信用卡',
        'debit': '借记卡'
      }
      
      const data = {}
      const colors = {
        'alipay': '#1890ff',
        'wechat': '#52c41a',
        'cash': '#faad14',
        'credit': '#f5222d',
        'debit': '#722ed1'
      }
      
      // 初始化支付方式数据
      Object.keys(methodMap).forEach(method => {
        data[method] = {
          id: method,
          name: methodMap[method],
          color: colors[method] || '#909399',
          value: 0,
          count: 0,
          percentage: 0
        }
      })
      
      // 统计各支付方式支出
      let totalExpense = 0
      this.filteredExpenses.forEach(expense => {
        const amount = parseFloat(expense.amount)
        totalExpense += amount
        
        if (data[expense.paymentMethod]) {
          data[expense.paymentMethod].value += amount
          data[expense.paymentMethod].count += 1
        }
      })
      
      // 计算百分比
      Object.keys(data).forEach(key => {
        data[key].percentage = totalExpense > 0 ? (data[key].value / totalExpense) * 100 : 0
      })
      
      // 转换为数组并按金额降序排序
      return Object.values(data)
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
    },
    mainChartData() {
      if (this.reportType === 'monthly') {
        return {
          months: this.monthlyData.map(item => item.month),
          values: this.monthlyData.map(item => item.totalExpense)
        }
      } else if (this.reportType === 'category') {
        return {
          data: this.categoryData.map(item => ({
            name: item.name,
            value: item.value
          })),
          items: this.categoryData
        }
      } else if (this.reportType === 'payment') {
        return {
          data: this.paymentData.map(item => ({
            name: item.name,
            value: item.value
          })),
          items: this.paymentData
        }
      }
      
      return {}
    },
    secondaryChartType() {
      return this.reportType === 'category' ? 'categoryByMonth' : 'paymentCount'
    },
    secondaryChartData() {
      if (this.reportType === 'category') {
        // 按月份显示每个类别的支出
        const months = this.monthlyData.map(item => item.month)
        
        // 获取前5个主要类别
        const topCategories = this.categoryData.slice(0, 5)
        const legendData = topCategories.map(cat => cat.name)
        
        const seriesData = topCategories.map(category => {
          const data = this.monthlyData.map(month => {
            let value = 0
            month.expenses.forEach(expense => {
              if (expense.category === category.id) {
                value += parseFloat(expense.amount)
              }
            })
            return value
          })
          
          return {
            name: category.name,
            type: 'bar',
            stack: '总量',
            data: data,
            itemStyle: {
              color: category.color
            }
          }
        })
        
        return {
          months,
          series: seriesData,
          legendData
        }
      } else if (this.reportType === 'payment') {
        // 展示每种支付方式的交易次数
        return {
          data: this.paymentData.map(item => ({
            name: item.name,
            value: item.count
          })),
          items: this.paymentData
        }
      }
      
      return {}
    },
    detailsTitle() {
      const titleMap = {
        'monthly': '月度支出详情',
        'category': '类别支出详情',
        'payment': '支付方式详情'
      }
      return titleMap[this.reportType] || '详细数据'
    },
    secondaryTitle() {
      const titleMap = {
        'category': '支出类别分布',
        'payment': '支付方式分布'
      }
      return titleMap[this.reportType] || '详细数据'
    },
    detailsLabelName() {
      const labelMap = {
        'category': '类别名称',
        'payment': '支付方式'
      }
      return labelMap[this.reportType] || '名称'
    },
    detailsTableData() {
      return this.reportType === 'monthly' ? this.monthlyData : 
             (this.reportType === 'category' ? this.categoryData : this.paymentData)
    },
    statsData() {
      const totalAmount = this.filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
      const count = this.filteredExpenses.length
      const avgAmount = count > 0 ? totalAmount / count : 0
      
      // 寻找最大支出
      let maxExpense = { amount: 0 }
      if (count > 0) {
        maxExpense = this.filteredExpenses.reduce((max, expense) => {
          return parseFloat(expense.amount) > parseFloat(max.amount) ? expense : max
        }, { amount: 0 })
      }
      
      // 按日期获取第一条和最后一条记录
      const sortedByDate = [...this.filteredExpenses].sort((a, b) => new Date(a.date) - new Date(b.date))
      const firstDate = sortedByDate.length > 0 ? new Date(sortedByDate[0].date) : new Date()
      const lastDate = sortedByDate.length > 0 ? new Date(sortedByDate[sortedByDate.length - 1].date) : new Date()
      
      // 计算日期范围内的天数
      const daysDiff = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1
      const dailyAvg = daysDiff > 0 ? totalAmount / daysDiff : 0
      
      return [
        {
          title: '总支出',
          value: `¥${totalAmount.toFixed(2)}`,
          description: `共${count}笔交易`,
          icon: 'el-icon-money',
          color: '#409EFF'
        },
        {
          title: '平均支出',
          value: `¥${avgAmount.toFixed(2)}`,
          description: '每笔交易平均',
          icon: 'el-icon-data-line',
          color: '#67C23A'
        },
        {
          title: '日均支出',
          value: `¥${dailyAvg.toFixed(2)}`,
          description: `${daysDiff}天内平均`,
          icon: 'el-icon-date',
          color: '#E6A23C'
        }
      ]
    }
  },
  methods: {
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId)
      return category ? category.name : '未分类'
    },
    handleReportTypeChange(type) {
      this.reportType = type
    },
    handleTimeRangeChange(range) {
      this.timeRange = range
    },
    handleDateRangeChange(range) {
      this.dateRange = range
    }
  },
  created() {
    // 设置默认日期范围为当月
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

.details-row {
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
}
</style>
