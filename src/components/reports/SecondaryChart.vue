<template>
  <div ref="secondaryChart" class="secondary-chart"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'SecondaryChart',
  props: {
    chartType: {
      type: String,
      required: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartType() {
      this.initChart()
    },
    chartData: {
      handler() {
        this.initChart()
      },
      deep: true
    }
  },
  methods: {
    initChart() {
      if (!this.$refs.secondaryChart) return
      
      // 初始化图表
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.secondaryChart)
      }
      
      let option
      
      if (this.chartType === 'categoryByMonth') {
        // 按月份显示每个类别的支出
        const months = this.chartData.months
        const seriesData = this.chartData.series
        
        option = {
          title: {
            text: '月度类别支出',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: this.chartData.legendData,
            bottom: 10
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
          series: seriesData
        }
      } else if (this.chartType === 'paymentCount') {
        // 展示每种支付方式的交易次数
        const data = this.chartData.data
        
        option = {
          title: {
            text: '支付方式使用次数',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}次 ({d}%)'
          },
          series: [
            {
              name: '使用次数',
              type: 'pie',
              radius: '55%',
              center: ['50%', '50%'],
              data: data,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              itemStyle: {
                color: (params) => {
                  const item = this.chartData.items.find(p => p.name === params.name)
                  return item ? item.color : '#909399'
                }
              }
            }
          ]
        }
      }
      
      this.chart.setOption(option)
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  }
}
</script>

<style scoped>
.secondary-chart {
  height: 350px;
}
</style>
