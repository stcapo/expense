<template>
  <el-row :gutter="20" class="stats-row">
    <el-col :span="8" v-for="stat in statsData" :key="stat.title">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-icon" :style="{backgroundColor: stat.color}">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-desc">{{ stat.description }}</div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'StatsCards',
  props: {
    statsData: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.stats-row {
  margin-top: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
}

.stat-icon i {
  font-size: 30px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}
</style>
