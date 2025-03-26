<template>
  <div class="card-header">
    <div class="title">报表分析</div>
    <div>
      <el-select v-model="reportTypeValue" placeholder="报表类型" @change="handleReportTypeChange">
        <el-option label="月度趋势" value="monthly"></el-option>
        <el-option label="类别分析" value="category"></el-option>
        <el-option label="支付方式分析" value="payment"></el-option>
      </el-select>
      
      <el-select 
        v-if="reportTypeValue === 'monthly'" 
        v-model="timeRangeValue" 
        placeholder="时间范围"
        @change="handleTimeRangeChange">
        <el-option label="最近6个月" value="6"></el-option>
        <el-option label="最近12个月" value="12"></el-option>
        <el-option label="今年" value="year"></el-option>
      </el-select>
      
      <el-date-picker
        v-if="reportTypeValue === 'category' || reportTypeValue === 'payment'"
        v-model="dateRangeValue"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        :picker-options="pickerOptions"
        @change="handleDateRangeChange">
      </el-date-picker>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportHeader',
  props: {
    reportType: {
      type: String,
      required: true
    },
    timeRange: {
      type: String,
      required: true
    },
    dateRange: {
      type: Array,
      default: () => null
    }
  },
  data() {
    return {
      reportTypeValue: this.reportType,
      timeRangeValue: this.timeRange,
      dateRangeValue: this.dateRange,
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
            text: '最近3个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setMonth(start.getMonth() - 3)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '今年',
            onClick(picker) {
              const end = new Date()
              const start = new Date(end.getFullYear(), 0, 1)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  watch: {
    reportType(val) {
      this.reportTypeValue = val
    },
    timeRange(val) {
      this.timeRangeValue = val
    },
    dateRange(val) {
      this.dateRangeValue = val
    }
  },
  methods: {
    handleReportTypeChange() {
      this.$emit('report-type-change', this.reportTypeValue)
    },
    handleTimeRangeChange() {
      this.$emit('time-range-change', this.timeRangeValue)
    },
    handleDateRangeChange() {
      this.$emit('date-range-change', this.dateRangeValue)
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

.title {
  font-size: 16px;
  font-weight: 500;
}
</style>
