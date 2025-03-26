<template>
  <el-card class="goal-card" :body-style="{ padding: '0px' }">
    <div class="goal-header" :style="{ backgroundColor: goal.color || '#409EFF' }">
      <div class="goal-category">
        <i :class="categoryIcon"></i> {{ categoryName }}
      </div>
      <div class="goal-actions">
        <el-button size="mini" type="text" icon="el-icon-edit" @click="$emit('edit', goal)"></el-button>
        <el-button size="mini" type="text" icon="el-icon-delete" @click="$emit('delete', goal)"></el-button>
      </div>
    </div>
    
    <div class="goal-content">
      <div class="goal-info">
        <h3 class="goal-name">{{ goal.name }}</h3>
        <div class="goal-priority">
          <el-rate
            v-model="goal.priority"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}">
          </el-rate>
        </div>
        <div class="goal-amounts">
          <div class="amount-item">
            <span class="amount-label">目标金额</span>
            <span class="amount-value">¥{{ goal.targetAmount.toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">已存金额</span>
            <span class="amount-value">¥{{ goal.currentAmount.toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span class="amount-label">剩余金额</span>
            <span class="amount-value">¥{{ (goal.targetAmount - goal.currentAmount).toFixed(2) }}</span>
          </div>
        </div>
        <div class="goal-dates">
          <div class="date-item">
            <span class="date-label">开始日期</span>
            <span class="date-value">{{ goal.startDate }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">目标日期</span>
            <span class="date-value">{{ goal.targetDate }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">剩余天数</span>
            <span class="date-value">{{ getRemainingDays() }}</span>
          </div>
        </div>
        <div class="goal-description" v-if="goal.description">
          <span class="description-label">描述:</span>
          <p class="description-text">{{ goal.description }}</p>
        </div>
      </div>
      
      <div class="goal-progress">
        <GoalProgress :percentage="getPercentage()" :color="goal.color" />
        
        <div class="prediction" v-if="goal.isActive && getPercentage() < 100">
          <i class="el-icon-time"></i>
          预计完成: {{ getPredictedCompletionDate() }}
        </div>
      </div>
    </div>
    
    <div class="goal-footer">
      <el-button size="small" type="primary" :disabled="!goal.isActive" @click="$emit('contribute')">
        添加存款
      </el-button>
      <el-tag 
        size="small" 
        :type="goal.isActive ? 'success' : 'info'">
        {{ goal.isActive ? '进行中' : '已暂停' }}
      </el-tag>
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex';
import GoalProgress from './GoalProgress.vue';

export default {
  name: 'GoalCard',
  components: {
    GoalProgress
  },
  props: {
    goal: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters(['goalCategoryById']),
    categoryIcon() {
      const category = this.goalCategoryById(this.goal.category);
      return category ? category.icon : 'el-icon-more';
    },
    categoryName() {
      const category = this.goalCategoryById(this.goal.category);
      return category ? category.name : '其他';
    },
    normalizedGoal() {
      return {
        ...this.goal,
        targetAmount: parseFloat(this.goal.targetAmount) || 0,
        currentAmount: parseFloat(this.goal.currentAmount) || 0,
        isActive: typeof this.goal.isActive === 'boolean' ? this.goal.isActive : true,
        targetDate: this.goal.targetDate || this.goal.deadline || new Date().toISOString().substr(0, 10),
        priority: typeof this.goal.priority === 'number' ? 
                  this.goal.priority : 
                  (this.goal.priority === 'high' ? 5 : 
                   this.goal.priority === 'medium' ? 3 : 
                   this.goal.priority === 'low' ? 1 : 3)
      };
    }
  },
  methods: {
    getPercentage() {
      const goal = this.normalizedGoal;
      return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
    },
    getRemainingDays() {
      const today = new Date();
      const goal = this.normalizedGoal;
      const targetDate = new Date(goal.targetDate);
      const timeDiff = targetDate - today;
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return daysDiff > 0 ? daysDiff : 0;
    },
    getPredictedCompletionDate() {
      const goal = this.normalizedGoal;
      if (goal.currentAmount >= goal.targetAmount) {
        return '已完成';
      }
      
      const today = new Date();
      const startDate = new Date(goal.startDate);
      const daysSinceStart = Math.max(Math.ceil((today - startDate) / (1000 * 3600 * 24)), 1);
      
      const dailySavingRate = goal.currentAmount / daysSinceStart;
      
      if (dailySavingRate <= 0) {
        return '无法预测';
      }
      
      const remainingAmount = goal.targetAmount - goal.currentAmount;
      const daysNeeded = Math.ceil(remainingAmount / dailySavingRate);
      
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + daysNeeded);
      
      return completionDate.toLocaleDateString('zh-CN');
    }
  }
}
</script>

<style scoped>
.goal-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  color: white;
}

.goal-category {
  font-weight: bold;
}

.goal-actions .el-button {
  color: white;
  margin-left: 5px;
}

.goal-content {
  display: flex;
  padding: 15px;
}

.goal-info {
  flex: 1;
}

.goal-name {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.goal-priority {
  margin-bottom: 15px;
}

.goal-amounts, .goal-dates {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.amount-item, .date-item {
  min-width: 120px;
  margin-right: 15px;
  margin-bottom: 5px;
}

.amount-label, .date-label, .description-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 3px;
}

.amount-value, .date-value {
  font-weight: bold;
}

.goal-description {
  margin-top: 10px;
}

.description-text {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.goal-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 150px;
}

.prediction {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.goal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #EBEEF5;
  padding: 10px 15px;
  background-color: #F8F9FB;
}
</style>
