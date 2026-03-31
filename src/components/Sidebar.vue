<template>
  <aside class="w-64 border-r border-app-surface-hover bg-app-bg lg:bg-app-bg/80 backdrop-blur flex flex-col transition-all duration-300">
    <div class="p-6 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
        <Wallet class="w-5 h-5 text-content-main" />
      </div>
      <span class="text-xl font-bold tracking-tight text-content-main">Finanças</span>
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
            : 'text-content-muted hover:text-content-main hover:bg-app-surface'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5" />
        {{ item.name }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-app-surface-hover">
      <div class="mb-4">
        <!-- Tema Visual Swatches -->
        <div class="flex items-center gap-3 px-2 py-1">
          <button 
            @click="financeStore.theme = 'midnight'"
            class="w-5 h-5 rounded-full transition-all focus:outline-none ring-offset-app-bg"
            :class="financeStore.theme === 'midnight' ? 'ring-2 ring-primary-500 ring-offset-2 scale-110 shadow-sm' : 'hover:scale-110 opacity-60 hover:opacity-100 grayscale-[0.3]'"
            title="Dark"
            style="background: linear-gradient(135deg, #09090b 50%, #4f46e5 50%); border: 1px solid #27272a;"
          ></button>
          
          <button 
            @click="financeStore.theme = 'light'"
            class="w-5 h-5 rounded-full transition-all focus:outline-none ring-offset-app-bg"
            :class="financeStore.theme === 'light' ? 'ring-2 ring-primary-500 ring-offset-2 scale-110 shadow-sm' : 'hover:scale-110 opacity-60 hover:opacity-100 grayscale-[0.3]'"
            title="Light"
            style="background: linear-gradient(135deg, #f8fafc 50%, #94a3b8 50%); border: 1px solid #cbd5e1;"
          ></button>

          <button 
            @click="financeStore.theme = 'premium'"
            class="w-5 h-5 rounded-full transition-all focus:outline-none ring-offset-app-bg"
            :class="financeStore.theme === 'premium' ? 'ring-2 ring-primary-500 ring-offset-2 scale-110 shadow-sm' : 'hover:scale-110 opacity-60 hover:opacity-100 grayscale-[0.3]'"
            title="Premium"
            style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); border: 1px solid #8B5CF6;"
          ></button>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-app-surface/50 border border-app-border">
        <p class="text-xs text-content-muted mb-1">Saldo Total</p>
        <p class="text-lg font-semibold text-content-main" :class="balanceColor">
          {{ formatCurrency(financeStore.balance) }}
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { LayoutDashboard, CreditCard, ArrowRightLeft, Wallet, CalendarRange, Receipt } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'

const financeStore = useFinanceStore()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Contas & Cartões', path: '/accounts', icon: CreditCard },
  { name: 'Transações', path: '/transactions', icon: ArrowRightLeft },
  { name: 'Gastos por Mês', path: '/monthly', icon: CalendarRange },
  { name: 'Contas Fixas', path: '/fixed-expenses', icon: Receipt },
]

const balanceColor = computed(() => {
  return financeStore.balance >= 0 ? 'text-success' : 'text-danger'
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
