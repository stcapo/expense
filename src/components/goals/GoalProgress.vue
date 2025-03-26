<template>
  <div class="goal-progress">
    <el-progress 
      type="circle" 
      :percentage="percentage" 
      :color="progressColor"
      :stroke-width="12"
      :width="size">
      <div class="progress-content">
        <div class="progress-text">{{ label || '进度' }}</div>
        <div class="progress-value">{{ percentage }}%</div>
      </div>
    </el-progress>
  </div>
</template>

<script>
export default {
  name: 'GoalProgress',
  props: {
    percentage: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 120
    }
  },
  computed: {
    progressColor() {
      if (this.color) return this.color;
      
      if (this.percentage < 30) return '#f56c6c';
      if (this.percentage < 70) return '#e6a23c';
      return '#67c23a';
    }
  }
}
</script>

<style scoped>
.goal-progress {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.progress-text {
  font-size: 12px;
  color: #909399;
}

.progress-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-top: 5px;
}
</style>
