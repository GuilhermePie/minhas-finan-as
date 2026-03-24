<template>
  <div class="space-y-6 pb-20">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Gastos por Mês</h2>
    </div>

    <div v-if="Object.keys(groupedExpenses).length === 0" class="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
      <CalendarIcon class="w-12 h-12 text-slate-500 mx-auto mb-3" />
      <h3 class="text-lg font-medium text-white mb-1">Nenhum gasto registrado</h3>
      <p class="text-slate-400 text-sm">Suas saídas aparecerão organizadas por mês aqui.</p>
    </div>

    <!-- Grouped lists -->
    <div v-for="(group, monthName) in groupedExpenses" :key="monthName" class="space-y-4">
      <!-- Month Header -->
      <div class="flex items-center justify-between border-b border-dark-700 pb-2 mt-8 first:mt-0">
        <h3 class="text-xl font-bold text-primary-400 capitalize">{{ monthName }}</h3>
        <p class="text-lg font-bold text-danger">{{ formatCurrency(group.total) }}</p>
      </div>

      <!-- Transactions -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="t in group.transactions" :key="t.id" class="bg-dark-800 rounded-2xl p-5 border border-dark-700 shadow-sm flex items-center justify-between group">
          <div class="flex items-center gap-4 truncate pr-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-danger/10 text-danger">
              <ArrowUpRight class="w-5 h-5" />
            </div>
            <div class="truncate">
              <h4 class="font-medium text-white truncate">{{ t.description }}</h4>
              <p class="text-xs text-slate-400 mt-0.5">{{ t.category }} • {{ formatDate(t.date) }}</p>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <p class="font-bold text-danger">-{{ formatCurrency(t.amount) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Calendar as CalendarIcon, ArrowUpRight } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const financeStore = useFinanceStore()

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR })
  } catch (e) {
    return dateStr
  }
}

const groupedExpenses = computed(() => {
  const expenses = financeStore.transactions.filter(t => t.type === 'expense')
  
  // Sort from newest to oldest
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date))

  const grouped = {}

  expenses.forEach(t => {
    let monthName = ''
    try {
      const d = parseISO(t.date)
      monthName = format(d, "MMMM 'de' yyyy", { locale: ptBR })
    } catch(e) {
      monthName = 'Mês Desconhecido'
    }

    if (!grouped[monthName]) {
      grouped[monthName] = {
        total: 0,
        transactions: []
      }
    }

    grouped[monthName].transactions.push(t)
    grouped[monthName].total += t.amount
  })

  return grouped
})
</script>
