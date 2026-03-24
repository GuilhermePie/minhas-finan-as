import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/Dashboard.vue') },
  { path: '/accounts', component: () => import('../views/Accounts.vue') },
  { path: '/transactions', component: () => import('../views/Transactions.vue') },
  { path: '/monthly', component: () => import('../views/MonthlyExpenses.vue') },
  { path: '/bills', component: () => import('../views/Bills.vue') }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
