<template>
  <div class="expense-form">
    <el-form :model="form" :rules="rules" ref="expenseForm" label-width="80px">
      <el-form-item label="金额" prop="amount">
        <el-input-number v-model="form.amount" :min="0.01" :precision="2" :step="1" :controls="false"></el-input-number>
      </el-form-item>
      
      <el-form-item label="类别" prop="category">
        <el-select v-model="form.category" placeholder="选择支出类别">
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
      
      <el-form-item label="支付方式" prop="paymentMethod">
        <el-select v-model="form.paymentMethod" placeholder="选择支付方式">
          <el-option label="支付宝" value="alipay"></el-option>
          <el-option label="微信" value="wechat"></el-option>
          <el-option label="现金" value="cash"></el-option>
          <el-option label="信用卡" value="credit"></el-option>
          <el-option label="借记卡" value="debit"></el-option>
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
  name: 'ExpenseForm',
  props: {
    editMode: {
      type: Boolean,
      default: false
    },
    expenseData: {
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
        paymentMethod: 'alipay'
      },
      rules: {
        amount: [
          { required: true, message: '请输入支出金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择支出类别', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        paymentMethod: [
          { required: true, message: '请选择支付方式', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    categories() {
      return this.$store.state.categories
    }
  },
  created() {
    if (this.editMode && this.expenseData) {
      this.form = { ...this.expenseData }
    }
  },
  methods: {
    submitForm() {
      this.$refs.expenseForm.validate((valid) => {
        if (valid) {
          const expenseData = { ...this.form }
          
          if (!this.editMode) {
            // 新增模式，生成唯一ID
            expenseData.id = Date.now().toString()
          }
          
          this.$emit('submitted', expenseData)
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
.expense-form {
  padding: 10px;
}
</style>
