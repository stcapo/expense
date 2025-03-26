<template>
  <div class="chart-container">
    <div ref="chartContainer" class="chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ChartContainer',
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
      if (!this.$refs.chartContainer) return
      
      // 初始化图表
      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chartContainer)
      }
      
      let option
      
      if (this.chartType === 'monthly') {
        // 月度趋势图表
        const months = this.chartData.months
        const values = this.chartData.values
        
        option = {
          title: {
            text: '月度支出趋势',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            formatter: '{b}: ¥{c}'
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
              data: values,
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
              },
              markPoint: {
                data: [
                  { type: 'max', name: '最大值' },
                  { type: 'min', name: '最小值' }
                ]
              }
            }
          ]
        }
      } else if (this.chartType === 'category') {
        // 类别分析图表
        const data = this.chartData.data
        
        option = {
          title: {
            text: '类别支出占比',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b}: ¥{c} ({d}%)'
          },
          series: [
            {
              name: '支出类别',
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
                  const item = this.chartData.items.find(cat => cat.name === params.name)
                  return item ? item.color : '#909399'
                }
              }
            }
          ]
        }
      } else if (this.chartType === 'payment') {
        // 支付方式分析图表
        const data = this.chartData.data
        
        option = {
          title: {
            text: '支付方式占比',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b}: ¥{c} ({d}%)'
          },
          series: [
            {
              name: '支付方式',
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
      } else if (this.chartType === 'categoryByMonth') {
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
.chart-container {
  height: 400px;
  margin-top: 20px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
