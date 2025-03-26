<template>
  <div class="details-table">
    <div v-if="reportType === 'monthly'" class="table-responsive">
      <el-table
        :data="data"
        style="width: 100%"
        :header-cell-style="{background:'#f5f7fa'}"
        stripe>
        <el-table-column prop="month" label="月份" width="120"></el-table-column>
        <el-table-column prop="totalExpense" label="总支出" width="150">
          <template slot-scope="scope">
            ¥{{ parseFloat(scope.row.totalExpense).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="avgExpense" label="日均支出" width="150">
          <template slot-scope="scope">
            ¥{{ parseFloat(scope.row.avgExpense).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="maxExpense" label="最大单笔" width="150">
          <template slot-scope="scope">
            ¥{{ parseFloat(scope.row.maxExpense).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="count" label="交易笔数" width="120"></el-table-column>
        <el-table-column prop="topCategory" label="主要类别"></el-table-column>
      </el-table>
    </div>
    <div v-else class="table-responsive">
      <el-table
        :data="data"
        style="width: 100%"
        :header-cell-style="{background:'#f5f7fa'}"
        stripe>
        <el-table-column prop="name" :label="labelName"></el-table-column>
        <el-table-column prop="value" label="支出金额" width="150">
          <template slot-scope="scope">
            ¥{{ parseFloat(scope.row.value).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比" width="120">
          <template slot-scope="scope">
            {{ scope.row.percentage.toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="count" label="交易笔数" width="120"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailsTable',
  props: {
    reportType: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    labelName: {
      type: String,
      default: '名称'
    }
  }
}
</script>

<style scoped>
.details-table {
  margin-top: 10px;
}

.table-responsive {
  overflow-x: auto;
}
</style>
