<template>
  <aside class="w-64 border-r border-dark-800 bg-dark-900 lg:bg-dark-900/80 backdrop-blur flex flex-col transition-all duration-300">
    <div class="p-6 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
        <Wallet class="w-5 h-5 text-white" />
      </div>
      <span class="text-xl font-bold tracking-tight text-white">Finanças</span>
    </div>

    <nav class="flex-1 px-4 py-4 space-y-1">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="[
          $route.path === item.path 
            ? 'bg-primary-500/10 text-primary-500' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-dark-800">
      <div class="p-4 rounded-xl bg-dark-800/50 border border-dark-700">
        <p class="text-xs text-slate-400 mb-1">Saldo Total</p>
        <p class="text-lg font-semibold text-white" :class="balanceColor">
          {{ formatCurrency(financeStore.balance) }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { LayoutDashboard, CreditCard, Receipt, ArrowRightLeft, Wallet, CalendarRange } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'

const financeStore = useFinanceStore()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Contas & Cartões', path: '/accounts', icon: CreditCard },
  { name: 'Transações', path: '/transactions', icon: ArrowRightLeft },
  { name: 'Gastos por Mês', path: '/monthly', icon: CalendarRange },
  { name: 'Despesas Mensais', path: '/bills', icon: Receipt },
]

const balanceColor = computed(() => {
  return financeStore.balance >= 0 ? 'text-success' : 'text-danger'
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
