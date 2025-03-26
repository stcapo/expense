<template>
  <div class="income-form">
    <el-form :model="form" :rules="rules" ref="incomeForm" label-width="80px">
      <el-form-item label="金额" prop="amount">
        <el-input-number v-model="form.amount" :min="0.01" :precision="2" :step="1" :controls="false"></el-input-number>
      </el-form-item>
      
      <el-form-item label="类别" prop="category">
        <el-select v-model="form.category" placeholder="选择收入类别">
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="form.description" :rows="2"></el-input>
      </el-form-item>
      
      <el-form-item label="收入来源" prop="source">
        <el-select v-model="form.source" placeholder="选择收入来源">
          <el-option label="工资" value="salary"></el-option>
          <el-option label="投资" value="investment"></el-option>
          <el-option label="副业" value="sidejob"></el-option>
          <el-option label="红包" value="gift"></el-option>
          <el-option label="退款" value="refund"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'IncomeForm',
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    incomeData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      form: {
        id: null,
        amount: 0,
        category: '',
        date: new Date().toISOString().substr(0, 10),
        description: '',
        source: 'salary'
      },
      rules: {
        amount: [
          { required: true, message: '请输入收入金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择收入类别', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        source: [
          { required: true, message: '请选择收入来源', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    categories() {
      return this.$store.state.incomeCategories
    }
  },
  created() {
    if (this.editMode && this.incomeData) {
      this.form = { ...this.incomeData }
    }
  },
  methods: {
    submitForm() {
      this.$refs.incomeForm.validate((valid) => {
        if (valid) {
          const incomeData = { ...this.form }
          
          if (!this.editMode) {
            // 新增模式，生成唯一ID
            incomeData.id = Date.now().toString()
          }
          
          this.$emit('submitted', incomeData)
        } else {
          return false
        }
      })
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.income-form {
  padding: 10px;
}
</style>
