      <el-menu-item index="/goals">
        <i class="el-icon-trophy"></i>
        <span slot="title">财务目标</span>
      </el-menu-item><template>
  <div class="sidebar">
    <div class="logo-container">
      <h1 class="logo-title">智能消费记账系统</h1>
    </div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-vertical"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      :router="true"
    >
      <el-menu-item index="/">
        <i class="el-icon-s-home"></i>
        <span slot="title">总览</span>
      </el-menu-item>
      <el-menu-item index="/incomes">
        <i class="el-icon-top"></i>
        <span slot="title">收入记录</span>
      </el-menu-item>
      <el-menu-item index="/income-categories">
        <i class="el-icon-coin"></i>
        <span slot="title">收入类别</span>
      </el-menu-item>
      <el-menu-item index="/expenses">
        <i class="el-icon-bottom"></i>
        <span slot="title">支出记录</span>
      </el-menu-item>
      <el-menu-item index="/categories">
        <i class="el-icon-s-grid"></i>
        <span slot="title">支出类别</span>
      </el-menu-item>
      <el-menu-item index="/reports">
        <i class="el-icon-s-data"></i>
        <span slot="title">报表分析</span>
      </el-menu-item>
      <el-menu-item index="/budget">
        <i class="el-icon-s-finance"></i>
        <span slot="title">预算管理</span>
      </el-menu-item>
      <el-menu-item index="/goals">
        <i class="el-icon-star-on"></i>
        <span slot="title">财务目标</span>
      </el-menu-item>
      <el-menu-item index="/settings">
        <i class="el-icon-setting"></i>
        <span slot="title">设置</span>
      </el-menu-item>
      
     
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  computed: {
    activeIndex() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-title {
  color: #fff;
  font-size: 18px;
  margin: 0;
  text-align: center;
  font-weight: 600;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-item {
  height: 56px;
  line-height: 56px;
}
</style>
