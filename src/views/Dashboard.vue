<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-full blur-[20px] -mr-10 -mt-10"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <h3 class="text-slate-400 font-medium text-sm">Dinheiro Guardado / Investido</h3>
          <div class="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
            <PiggyBank class="w-5 h-5" />
          </div>
        </div>
        <div class="relative z-10">
          <p class="text-3xl font-bold text-white">{{ formatCurrency(investedBalance) }}</p>
          <div class="flex items-center gap-2 mt-2 text-sm">
            <TrendingUp class="w-4 h-4 text-success" />
            <span class="text-success">Rendendo</span>
            <span class="text-slate-500">nas suas reservas</span>
          </div>
        </div>
      </div>

      <div class="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-bl-full blur-[20px] -mr-10 -mt-10"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <h3 class="text-slate-400 font-medium text-sm">Total Disponível</h3>
          <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <ArrowUpRight class="w-5 h-5" />
          </div>
        </div>
        <div class="relative z-10">
          <p class="text-3xl font-bold text-white">{{ formatCurrency(financeStore.balance) }}</p>
          <div class="flex items-center gap-2 mt-2 text-sm">
            <span class="text-slate-400">
              Pronto para uso em {{ financeStore.accounts.filter(a => ['asset', 'checking'].includes(a.type) && !a.isInvestment && !a.name.toLowerCase().includes('reserva')).length }} contas
            </span>
          </div>
        </div>
      </div>

      <div class="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-bl-full blur-[20px] -mr-10 -mt-10"></div>
        <div class="flex items-center justify-between mb-4 relative z-10">
          <h3 class="text-slate-400 font-medium text-sm">Total em Dívidas</h3>
          <div class="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <ArrowDownRight class="w-5 h-5" />
          </div>
        </div>
        <div class="relative z-10">
          <p class="text-3xl font-bold text-white">{{ formatCurrency(financeStore.debts) }}</p>
          <div class="flex items-center gap-2 mt-2 text-sm">
            <span class="text-slate-400">Cartões e financiamentos</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Transactions -->
      <div class="col-span-1 lg:col-span-2 bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-white">Transações Recentes</h2>
          <router-link to="/transactions" class="text-sm font-medium text-primary-500 hover:text-primary-400">Ver todas</router-link>
        </div>
        
        <div class="space-y-4">
          <div v-for="t in financeStore.transactions.slice(0, 4)" :key="t.id" class="flex items-center justify-between p-4 rounded-xl hover:bg-dark-700/50 transition-colors border border-transparent hover:border-dark-600">
            <div class="flex items-center gap-4">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
              >
                <ArrowDownLeft v-if="t.type === 'income'" class="w-6 h-6" />
                <ArrowUpRight v-else class="w-6 h-6" />
              </div>
              <div>
                <p class="font-medium text-white">{{ t.description }}</p>
                <p class="text-xs text-slate-400">{{ t.category }} • {{ formatDate(t.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-bold" :class="t.type === 'income' ? 'text-success' : 'text-danger'">
                {{ t.type === 'income' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Bills -->
      <div class="col-span-1 bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-sm flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-white">Próximas Contas</h2>
          <router-link to="/bills" class="text-sm font-medium text-primary-500 hover:text-primary-400">Ver todas</router-link>
        </div>

        <div class="space-y-4 flex-1">
          <div v-for="bill in financeStore.upcomingBills.slice(0, 3)" :key="bill.id" class="flex items-center justify-between p-4 rounded-xl border border-dark-700 bg-dark-900/50">
            <div>
              <p class="font-medium text-white">{{ bill.name }}</p>
              <p class="text-xs flex items-center gap-1 mt-1" :class="isLate(bill.dueDate) ? 'text-danger' : 'text-slate-400'">
                <Calendar class="w-3 h-3" /> 
                {{ isLate(bill.dueDate) ? 'Venceu em' : 'Vence em' }} {{ formatDate(bill.dueDate) }}
              </p>
            </div>
            <div class="text-right flex flex-col items-end">
              <p class="font-bold text-white">{{ formatCurrency(bill.amount || bill.balance) }}</p>
              <button @click="handlePayment(bill, bill.itemType)" class="text-xs font-medium px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded-md mt-2 transition-colors">
                Pagar
              </button>
            </div>
          </div>
          <div v-if="financeStore.upcomingBills.length === 0" class="text-center py-6 text-slate-400 text-sm h-full flex items-center justify-center flex-col gap-2">
            <span class="text-2xl">🎉</span>
            Nenhuma conta pendente!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowDownLeft, Calendar, PiggyBank } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ObjectHelper = {} // placeholder
import { handlePayment } from '../utils/paymentOptions'
const financeStore = useFinanceStore()

const investedBalance = computed(() => {
  return financeStore.accounts
    .filter(a => 
      ['investment', 'reserve'].includes(a.type) || 
      (a.type === 'asset' && (a.isInvestment || a.name.toLowerCase().includes('reserva') || a.name.toLowerCase().includes('investimento')))
    )
    .reduce((acc, a) => acc + a.balance, 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateStr) => {
  return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR })
}

const isLate = (dateStr) => {
  if (isToday(parseISO(dateStr))) return false
  return isPast(parseISO(dateStr))
}
</script>
