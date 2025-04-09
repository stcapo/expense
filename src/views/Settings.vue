<template>
  <div class="settings">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header">
            <span>应用设置</span>
          </div>
          
          <el-form :model="settingsForm" label-width="100px" size="medium">
            <el-form-item label="货币符号">
              <el-select v-model="settingsForm.currency" placeholder="选择货币符号">
                <el-option label="人民币 (¥)" value="CNY"></el-option>
                <el-option label="美元 ($)" value="USD"></el-option>
                <el-option label="欧元 (€)" value="EUR"></el-option>
                <el-option label="英镑 (£)" value="GBP"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="语言">
              <el-select v-model="settingsForm.language" placeholder="选择语言">
                <el-option label="简体中文" value="zh-CN"></el-option>
                <el-option label="英文" value="en-US" disabled></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="主题">
              <el-radio-group v-model="settingsForm.theme">
                <el-radio label="light">浅色</el-radio>
                <el-radio label="dark" disabled>深色</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存设置</el-button>
              <el-button @click="resetSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card style="margin-top: 20px;">
          <div slot="header" class="card-header">
            <span>数据管理</span>
          </div>
          
          <div class="data-actions">
            <div class="action-item">
              <div class="action-title">导出数据</div>
              <div class="action-desc">将您的所有支出数据导出为JSON文件，便于备份。</div>
              <el-button type="primary" plain @click="exportData">导出数据</el-button>
            </div>
            
            <el-divider></el-divider>
            
            <div class="action-item">
              <div class="action-title">导入数据</div>
              <div class="action-desc">从之前导出的备份文件中恢复您的数据。</div>
              <el-upload
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange">
                <el-button plain>选择文件</el-button>
              </el-upload>
            </div>
            
            <el-divider></el-divider>
            
            <div class="action-item danger-zone">
              <div class="action-title">清空数据</div>
              <div class="action-desc">删除所有支出记录和设置。此操作不可逆，请谨慎操作！</div>
              <el-button type="danger" plain @click="confirmClearData">清空数据</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header">
            <span>关于应用</span>
          </div>
          
          <div class="about-section">
            <div class="app-logo">
              <i class="el-icon-money"></i>
            </div>
            
            <h2 class="app-name">基于Python的智能消费记账系统</h2>
            <p class="app-version">版本 1.0.0</p>
            
            <div class="app-description">
              <p>基于Python的智能消费记账系统是一款结合人工智能技术的现代财务管理工具，通过数据分析和机器学习算法，为您提供精准的消费洞察和智能理财建议。</p>
            </div>
            
            <div class="feature-list">
              <h3>功能特点</h3>
              <ul>
                <li>智能消费分类与识别</li>
                <li>基于机器学习的预算推荐</li>
                <li>多维度数据可视化分析</li>
                <li>消费趋势预测与提醒</li>
                <li>智能存款目标规划</li>
                <li>跨平台数据同步与备份</li>
              </ul>
            </div>
            
            <div class="usage-tips">
              <h3>使用技巧</h3>
              <p>充分利用系统的智能分析功能，定期查看消费洞察报告，可以帮助您发现潜在的节省机会，优化消费结构，实现更科学的个人财务管理。</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Settings',
  data() {
    return {
      settingsForm: {
        currency: 'CNY',
        language: 'zh-CN',
        theme: 'light'
      },
      importFile: null
    }
  },
  computed: {
    ...mapState(['settings', 'expenses', 'incomes', 'categories', 'incomeCategories', 'budget'])
  },
  created() {
    this.settingsForm = { ...this.settings }
  },
  methods: {
    saveSettings() {
      this.$store.dispatch('setSettings', { ...this.settingsForm })
      
      this.$message({
        message: '设置保存成功',
        type: 'success'
      })
    },
    resetSettings() {
      this.settingsForm = { ...this.settings }
      
      this.$message({
        message: '设置已重置',
        type: 'info'
      })
    },
    exportData() {
      // 准备要导出的数据
      const exportData = {
        expenses: this.expenses,
        incomes: this.$store.state.incomes,
        categories: this.categories,
        incomeCategories: this.$store.state.incomeCategories,
        budget: this.budget,
        settings: this.settings,
        exportDate: new Date().toISOString()
      }
      
      // 转换为JSON字符串
      const jsonData = JSON.stringify(exportData, null, 2)
      
      // 创建Blob对象
      const blob = new Blob([jsonData], { type: 'application/json' })
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expense-tracker-export-${new Date().toISOString().slice(0, 10)}.json`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      this.$message({
        message: '数据导出成功',
        type: 'success'
      })
    },
    handleFileChange(file) {
      if (file && file.raw) {
        this.importFile = file.raw
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target.result)
            
            this.$confirm('导入将覆盖当前所有数据，是否继续？', '确认导入', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              // 导入数据
              if (importData.expenses) {
                this.$store.commit('setExpenses', importData.expenses)
              }
              
              if (importData.incomes) {
                this.$store.commit('setIncomes', importData.incomes)
              }
              
              if (importData.categories) {
                this.$store.commit('setCategories', importData.categories)
              }
              
              if (importData.incomeCategories) {
                this.$store.commit('setIncomeCategories', importData.incomeCategories)
              }
              
              if (importData.budget) {
                this.$store.commit('setBudget', importData.budget)
              }
              
              if (importData.settings) {
                this.$store.commit('setSettings', importData.settings)
                this.settingsForm = { ...importData.settings }
              }
              
              // 保存到localStorage
              localStorage.setItem('expense-tracker-data', JSON.stringify({
                expenses: this.$store.state.expenses,
                incomes: this.$store.state.incomes,
                categories: this.$store.state.categories,
                incomeCategories: this.$store.state.incomeCategories,
                budget: this.$store.state.budget,
                settings: this.$store.state.settings
              }))
              
              this.$message({
                message: '数据导入成功',
                type: 'success'
              })
            }).catch(() => {
              this.$message({
                message: '已取消导入',
                type: 'info'
              })
            })
          } catch (error) {
            this.$message.error('导入失败：文件格式不正确')
          }
        }
        reader.readAsText(file.raw)
      }
    },
    confirmClearData() {
      this.$confirm('清空数据将删除所有支出记录和设置，此操作不可逆！是否继续？', '危险操作', {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true
      }).then(() => {
        // 重置数据
        this.$store.commit('setExpenses', [])
        this.$store.commit('setIncomes', [])
        
        // 重置预算
        this.$store.commit('setBudget', {
          total: 5000,
          categoryLimits: {}
        })
        
        // 保存到localStorage
        localStorage.setItem('expense-tracker-data', JSON.stringify({
          expenses: this.$store.state.expenses,
          incomes: this.$store.state.incomes,
          categories: this.$store.state.categories,
          incomeCategories: this.$store.state.incomeCategories,
          budget: this.$store.state.budget,
          settings: this.$store.state.settings
        }))
        
        this.$message({
          message: '数据已清空',
          type: 'success'
        })
      }).catch(() => {
        this.$message({
          message: '已取消操作',
          type: 'info'
        })
      })
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

.data-actions {
  padding: 10px 0;
}

.action-item {
  margin-bottom: 20px;
}

.action-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.action-desc {
  color: #606266;
  margin-bottom: 15px;
}

.danger-zone .action-title {
  color: #F56C6C;
}

.about-section {
  text-align: center;
  padding: 20px 0;
}

.app-logo {
  font-size: 60px;
  color: #409EFF;
  margin-bottom: 20px;
}

.app-name {
  font-size: 24px;
  margin-bottom: 5px;
}

.app-version {
  color: #909399;
  margin-bottom: 20px;
}

.app-description {
  text-align: left;
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-list {
  text-align: left;
  margin-bottom: 20px;
}

.feature-list h3 {
  margin-bottom: 10px;
}

.feature-list ul {
  padding-left: 20px;
  line-height: 1.8;
}

.usage-tips {
  text-align: left;
  line-height: 1.6;
}

.usage-tips h3 {
  margin-bottom: 10px;
}
</style>
