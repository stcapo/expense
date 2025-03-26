<template>
  <div id="app">
    <el-container class="main-container">
      <el-aside width="200px">
        <SideBar />
      </el-aside>
      <el-container>
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import Header from '@/components/Header.vue'

export default {
  name: 'App',
  components: {
    SideBar,
    Header
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

#app {
  height: 100vh;
}

.main-container {
  height: 100%;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.el-main {
  background-color: #f5f7fa;
  color: #333;
  padding: 20px;
}
</style>
