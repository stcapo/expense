<template>
  <div class="goal-form">
    <el-form :model="form" :rules="rules" ref="goalForm" label-width="100px">
      <el-form-item label="目标名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      
      <el-form-item label="目标金额" prop="targetAmount">
        <el-input-number v-model="form.targetAmount" :min="1" :precision="2"></el-input-number>
      </el-form-item>
      
      <el-form-item label="当前存款" prop="currentAmount">
        <el-input-number v-model="form.currentAmount" :min="0" :max="form.targetAmount" :precision="2"></el-input-number>
      </el-form-item>
      
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="目标日期" prop="targetDate">
        <el-date-picker
          v-model="form.targetDate"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="目标类别" prop="category">
        <el-select v-model="form.category" placeholder="选择目标类别">
          <el-option
            v-for="item in goalCategories"
            :key="item.id"
            :label="item.name"
            :value="item.id">
            <i :class="item.icon" style="margin-right: 8px;"></i>
            {{ item.name }}
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="优先级" prop="priority">
        <el-rate v-model="form.priority" :max="5" show-score></el-rate>
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="form.description" :rows="3"></el-input>
      </el-form-item>
      
      <el-form-item label="状态" prop="isActive">
        <el-switch v-model="form.isActive" active-text="活跃" inactive-text="已暂停"></el-switch>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'GoalForm',
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    goalData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      form: {
        id: null,
        name: '',
        targetAmount: 10000,
        currentAmount: 0,
        startDate: new Date().toISOString().substr(0, 10),
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().substr(0, 10),
        category: 'other',
        priority: 3,
        description: '',
        color: '',
        isActive: true
      },
      rules: {
        name: [
          { required: true, message: '请输入目标名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        targetAmount: [
          { required: true, message: '请输入目标金额', trigger: 'blur' },
          { type: 'number', min: 1, message: '金额必须大于0', trigger: 'blur' }
        ],
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        targetDate: [
          { required: true, message: '请选择目标日期', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择目标类别', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    ...mapState(['goalCategories'])
  },
  created() {
    if (this.editMode && this.goalData) {
      this.form = { ...this.goalData };
    }
  },
  methods: {
    submitForm() {
      this.$refs.goalForm.validate((valid) => {
        if (valid) {
          const goalData = { ...this.form };
          
          if (!this.editMode) {
            // 新增模式，生成唯一ID
            goalData.id = 'goal_' + Date.now().toString();
            
            // 设置颜色为类别颜色
            const category = this.goalCategories.find(c => c.id === goalData.category);
            if (category) {
              goalData.color = category.color;
            }
          }
          
          this.$emit('submitted', goalData);
        } else {
          return false;
        }
      });
    },
    cancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
.goal-form {
  padding: 10px;
}
</style>
