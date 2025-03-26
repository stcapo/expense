<template>
  <div class="goals">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <div slot="header" class="page-header">
            <h2 class="page-title">财务目标</h2>
            <div class="header-actions">
              <el-button type="primary" @click="showAddGoal">
                <i class="el-icon-plus"></i> 添加目标
              </el-button>
            </div>
          </div>
          
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="全部目标" name="all">
              <div class="filters">
                <el-select v-model="categoryFilter" placeholder="类别筛选" clearable @change="applyFilters">
                  <el-option
                    v-for="category in goalCategories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id">
                    <i :class="category.icon" style="margin-right: 8px;"></i>
                    {{ category.name }}
                  </el-option>
                </el-select>
                
                <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="applyFilters">
                  <el-option label="进行中" value="active"></el-option>
                  <el-option label="已暂停" value="inactive"></el-option>
                  <el-option label="已完成" value="completed"></el-option>
                </el-select>
                
                <el-select v-model="sortOption" placeholder="排序方式" @change="applyFilters">
                  <el-option label="优先级 (高到低)" value="priority-desc"></el-option>
                  <el-option label="优先级 (低到高)" value="priority-asc"></el-option>
                  <el-option label="进度 (高到低)" value="progress-desc"></el-option>
                  <el-option label="进度 (低到高)" value="progress-asc"></el-option>
                  <el-option label="目标日期 (近到远)" value="date-asc"></el-option>
                  <el-option label="目标日期 (远到近)" value="date-desc"></el-option>
                </el-select>
              </div>
              
              <el-empty v-if="filteredGoals.length === 0" description="暂无财务目标"></el-empty>
              
              <el-row :gutter="20" v-else>
                <el-col :xs="24" :sm="12" :md="8" v-for="goal in filteredGoals" :key="goal.id">
                  <GoalCard 
                    :goal="goal" 
                    @edit="editGoal" 
                    @delete="confirmDelete" 
                    @contribute="showContributeDialog(goal)" 
                  />
                </el-col>
              </el-row>
            </el-tab-pane>
            
            <el-tab-pane label="进行中" name="active">
              <el-empty v-if="activeGoals.length === 0" description="暂无进行中的目标"></el-empty>
              
              <el-row :gutter="20" v-else>
                <el-col :xs="24" :sm="12" :md="8" v-for="goal in activeGoals" :key="goal.id">
                  <GoalCard 
                    :goal="goal" 
                    @edit="editGoal" 
                    @delete="confirmDelete" 
                    @contribute="showContributeDialog(goal)" 
                  />
                </el-col>
              </el-row>
            </el-tab-pane>
            
            <el-tab-pane label="已完成" name="completed">
              <el-empty v-if="completedGoals.length === 0" description="暂无已完成的目标"></el-empty>
              
              <el-row :gutter="20" v-else>
                <el-col :xs="24" :sm="12" :md="8" v-for="goal in completedGoals" :key="goal.id">
                  <GoalCard 
                    :goal="goal" 
                    @edit="editGoal" 
                    @delete="confirmDelete" 
                    @contribute="showContributeDialog(goal)" 
                  />
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 添加/编辑目标对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="formDialogVisible" width="650px">
      <GoalForm 
        :edit-mode="editMode" 
        :goal-data="currentGoal" 
        @submitted="handleSubmit" 
        @cancel="formDialogVisible = false" 
      />
    </el-dialog>
    
    <!-- 添加存款对话框 -->
    <el-dialog title="添加存款" :visible.sync="contributeDialogVisible" width="400px">
      <el-form :model="contributionForm" :rules="contributionRules" ref="contributionForm" label-width="100px">
        <el-form-item label="目标" prop="goalName">
          <span>{{ contributionForm.goalName }}</span>
        </el-form-item>
        
        <el-form-item label="存款金额" prop="amount">
          <el-input-number 
            v-model="contributionForm.amount" 
            :min="1" 
            :precision="2"
            style="width: 200px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="contributionForm.date"
            type="date"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="contributeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveContribution">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import GoalCard from '@/components/goals/GoalCard.vue';
import GoalForm from '@/components/goals/GoalForm.vue';
import { loadTestData } from '@/utils/testDataLoader';

export default {
  name: 'Goals',
  components: {
    GoalCard,
    GoalForm
  },
  data() {
    return {
      activeTab: 'all',
      categoryFilter: '',
      statusFilter: '',
      sortOption: 'priority-desc',
      formDialogVisible: false,
      contributeDialogVisible: false,
      editMode: false,
      currentGoal: null,
      contributionForm: {
        goalId: '',
        goalName: '',
        amount: 100,
        date: new Date().toISOString().substr(0, 10)
      },
      contributionRules: {
        amount: [
          { required: true, message: '请输入存款金额', trigger: 'blur' },
          { type: 'number', min: 1, message: '金额必须大于0', trigger: 'blur' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    ...mapState(['goals', 'goalCategories']),
    ...mapGetters(['activeGoals', 'completedGoals']),
    dialogTitle() {
      return this.editMode ? '编辑财务目标' : '添加财务目标';
    },
    filteredGoals() {
      let filtered = [...this.goals];
      
      // 应用类别筛选
      if (this.categoryFilter) {
        filtered = filtered.filter(goal => goal.category === this.categoryFilter);
      }
      
      // 应用状态筛选
      if (this.statusFilter) {
        switch (this.statusFilter) {
          case 'active':
            filtered = filtered.filter(goal => goal.isActive && goal.currentAmount < goal.targetAmount);
            break;
          case 'inactive':
            filtered = filtered.filter(goal => !goal.isActive);
            break;
          case 'completed':
            filtered = filtered.filter(goal => goal.currentAmount >= goal.targetAmount);
            break;
        }
      }
      
      // 应用排序
      switch (this.sortOption) {
        case 'priority-desc':
          filtered.sort((a, b) => b.priority - a.priority);
          break;
        case 'priority-asc':
          filtered.sort((a, b) => a.priority - b.priority);
          break;
        case 'progress-desc':
          filtered.sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount));
          break;
        case 'progress-asc':
          filtered.sort((a, b) => (a.currentAmount / a.targetAmount) - (b.currentAmount / b.targetAmount));
          break;
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
          break;
        case 'date-desc':
          filtered.sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate));
          break;
      }
      
      return filtered;
    }
  },
  mounted() {
    console.log('Goals组件已挂载');
    console.log('当前goals数据:', this.goals);
    console.log('当前goalCategories数据:', this.goalCategories);
    
    // 如果没有goals数据，尝试手动加载测试数据
    if (!this.goals || this.goals.length === 0) {
      console.log('未检测到goals数据，尝试手动加载测试数据...');
      this.loadTestData();
    }
  },
  methods: {
    handleTabClick() {
      // Tab点击处理
    },
    applyFilters() {
      // 筛选逻辑已在computed属性中实现
    },
    showAddGoal() {
      this.editMode = false;
      this.currentGoal = null;
      this.formDialogVisible = true;
    },
    editGoal(goal) {
      this.editMode = true;
      this.currentGoal = { ...goal };
      this.formDialogVisible = true;
    },
    confirmDelete(goal) {
      this.$confirm(`确定要删除"${goal.name}"目标吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('deleteGoal', goal.id);
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    handleSubmit(goal) {
      if (this.editMode) {
        this.$store.dispatch('updateGoal', goal);
        this.$message({
          message: '目标更新成功',
          type: 'success'
        });
      } else {
        this.$store.dispatch('addGoal', goal);
        this.$message({
          message: '目标添加成功',
          type: 'success'
        });
      }
      this.formDialogVisible = false;
    },
    showContributeDialog(goal) {
      this.contributionForm.goalId = goal.id;
      this.contributionForm.goalName = goal.name;
      this.contributionForm.amount = 100; // 默认值
      this.contributionForm.date = new Date().toISOString().substr(0, 10);
      this.contributeDialogVisible = true;
    },
    saveContribution() {
      this.$refs.contributionForm.validate((valid) => {
        if (valid) {
          const goal = this.goals.find(g => g.id === this.contributionForm.goalId);
          if (goal) {
            const updatedGoal = { ...goal };
            updatedGoal.currentAmount += this.contributionForm.amount;
            
            this.$store.dispatch('updateGoal', updatedGoal);
            
            // 可选: 添加一条支出记录，表示向目标存钱
            const expense = {
              id: Date.now().toString(),
              amount: this.contributionForm.amount,
              category: 'other', // 或者添加一个专门的类别
              date: this.contributionForm.date,
              description: `存款到目标: ${goal.name}`,
              paymentMethod: 'cash' // 默认值
            };
            this.$store.dispatch('addExpense', expense);
            
            this.$message({
              message: '存款添加成功',
              type: 'success'
            });
            this.contributeDialogVisible = false;
          }
        } else {
          return false;
        }
      });
    },
    // 添加测试数据加载方法
    loadTestData() {
      loadTestData(this.$store);
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
