import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/incomes',
    name: 'Incomes',
    component: () => import('@/views/Incomes.vue')
  },
  {
    path: '/income-categories',
    name: 'IncomeCategories',
    component: () => import('@/views/IncomeCategories.vue')
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: () => import('@/views/Expenses.vue')
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/Categories.vue')
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Reports.vue')
  },
  {
    path: '/budget',
    name: 'Budget',
    component: () => import('@/views/Budget.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue')
  },
  {
    path: '/goals',
    name: 'Goals',
    component: () => import('@/views/Goals.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
