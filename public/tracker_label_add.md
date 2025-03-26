# 添加财务目标设定与跟踪功能分析

## 功能概述

添加新的侧边栏标签"财务目标"，允许用户设定长期或短期的财务目标（如购房、购车、旅游等），并跟踪目标完成进度。系统会显示目标达成的预计时间和剩余金额等信息。

## 需要修改的文件

1. **src/components/SideBar.vue** 
   - 添加新的菜单项"财务目标"，使用适当的图标（如`el-icon-trophy`或`el-icon-star-on`）

2. **src/router/index.js**
   - 添加新的路由配置`/goals`，指向财务目标页面

3. **src/store/index.js**
   - 在state中添加新的`goals`数组
   - 添加对应的mutations和actions: `setGoals`, `addGoal`, `updateGoal`, `deleteGoal`
   - 添加相关getters，如`goalsByCategory`, `activeGoals`, `completedGoals`等

4. **src/views/Settings.vue**
   - 更新导入/导出功能，包含goals数据
   - 在清除数据功能中添加goals清空逻辑

## 需要新增的文件

1. **src/views/Goals.vue**
   - 财务目标主页面，包含目标列表和添加按钮
   - 实现目标过滤和分类显示
   - 显示完成百分比和剩余时间

2. **src/components/goals/GoalForm.vue**
   - 用于添加和编辑目标的表单组件
   - 包含名称、金额、日期、类别等输入项

3. **src/components/goals/GoalCard.vue**
   - 显示单个目标信息及进度的卡片组件
   - 包含进度条、编辑和删除按钮

4. **src/components/goals/GoalProgress.vue**
   - 显示目标进度的组件，包含环形进度条
   - 可重用于Dashboard展示

5. **src/views/Dashboard.vue (修改)**
   - 添加目标进度概览模块
   - 显示即将完成的目标

## 数据结构设计

新增的数据结构：

```javascript
goals: [
  {
    id: String,           // 唯一标识
    name: String,         // 目标名称
    targetAmount: Number, // 目标金额
    currentAmount: Number, // 当前已存金额
    startDate: String,    // 开始日期
    targetDate: String,   // 目标完成日期
    category: String,     // 目标类别 (如 housing, car, travel, education等)
    priority: Number,     // 优先级 (1-5)
    description: String,  // 详细描述
    color: String,        // 显示颜色
    isActive: Boolean     // 是否活跃
  }
]

// 可能需要的目标类别
goalCategories: [
  { id: 'housing', name: '购房', icon: 'el-icon-house', color: '#673AB7' },
  { id: 'car', name: '购车', icon: 'el-icon-truck', color: '#2196F3' },
  { id: 'travel', name: '旅行', icon: 'el-icon-place', color: '#3F51B5' },
  { id: 'education', name: '教育', icon: 'el-icon-reading', color: '#9C27B0' },
  { id: 'wedding', name: '婚礼', icon: 'el-icon-present', color: '#E91E63' },
  { id: 'retirement', name: '退休', icon: 'el-icon-user', color: '#FF9800' },
  { id: 'other', name: '其他', icon: 'el-icon-more', color: '#9E9E9E' }
]
```

## 对项目整体的影响

### 数据管理影响

1. **数据持久化**
   - 需要确保goals数据与现有的expenses和incomes一起保存到localStorage
   - 修改Settings.vue中的导入/导出和清除数据功能，包含goals数据

2. **数据关联**
   - 可考虑添加"目标存款"交易类型，允许用户记录为特定目标存款
   - 未来可实现从收入中自动分配一定比例到各目标

3. **计算逻辑**
   - 基于开始日期、目标日期和当前金额计算进度
   - 基于月度平均存款计算预期完成日期

### 项目结构影响

整体影响可控，不需要大幅调整现有结构：

1. **新增主要功能模块**
   - 功能模块与现有收入/支出管理并列
   - 复用Element UI组件保持一致性

2. **Dashboard整合**
   - 在Dashboard上添加目标进度概览
   - 展示重要目标的完成情况

### 扩展可能性

1. **目标提醒**
   - 当目标即将完成或落后计划时提醒用户

2. **存款计划**
   - 根据目标优先级自动推荐月度存款分配
   - 基于用户收支状况预测目标实现可能性

3. **目标模板**
   - 提供常见财务目标的模板，方便用户快速创建

## 实现难点

1. **进度计算**
   - 需要考虑时间和金额两个维度的进度
   - 可能需要设计合理的进度显示算法

2. **用户体验**
   - 目标状态变化的可视化效果
   - 如何直观展示多个目标的优先级和进度

3. **数据一致性**
   - 确保goals数据与系统其他部分协调一致
   - 防止用户输入无效的目标参数（如过去的日期）
