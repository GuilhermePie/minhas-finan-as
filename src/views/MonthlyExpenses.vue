<template>
  <div class="space-y-6 pb-20">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-content-main">Gastos por Mês</h2>
      <button @click="openBudgetModal()" class="flex items-center gap-2 px-4 py-2 bg-primary-600-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20">
        <Target class="w-5 h-5" />
        <span class="hidden sm:inline">Nova Meta</span>
      </button>
    </div>

    <div v-if="Object.keys(groupedExpenses).length === 0" class="text-center py-12 bg-app-surface rounded-2xl border border-app-border">
      <CalendarIcon class="w-12 h-12 text-content-faint mx-auto mb-3" />
      <h3 class="text-lg font-medium text-content-main mb-1">Nenhum gasto registrado</h3>
      <p class="text-content-muted text-sm">Suas saídas aparecerão organizadas por mês aqui.</p>
    </div>

    <!-- Grouped lists -->
    <div v-for="(group, monthName) in groupedExpenses" :key="monthName" class="space-y-4">
      <!-- Month Header -->
      <div class="flex items-center justify-between border-b border-app-border pb-2 mt-8 first:mt-0">
        <h3 class="text-xl font-bold text-primary-400 capitalize">{{ monthName }}</h3>
        <p class="text-lg font-bold text-danger">{{ formatCurrency(group.total) }}</p>
      </div>

      <!-- Progress Bars (Budgets Chart) -->
      <div v-if="budgetsList.length > 0" class="bg-app-surface p-6 rounded-2xl border border-app-border mt-4 mb-6 shadow-sm">
        <h4 class="text-sm font-semibold text-content-muted mb-5 uppercase tracking-wider">Acompanhamento de Metas</h4>
        <div class="space-y-6">
          <div v-for="b in budgetsList" :key="b.id" class="relative group cursor-pointer" @click="openBudgetModal(b)">
            <div class="flex justify-between items-center mb-1.5 relative z-10">
              <span class="font-medium text-content-main text-sm">{{ b.category }}</span>
              <span class="text-xs">
                <span :class="getBudgetSpent(b, group.transactions) > b.limit ? 'text-danger font-bold' : 'text-content-muted'">
                  {{ formatCurrency(getBudgetSpent(b, group.transactions)) }}
                </span>
                <span class="text-content-faint"> / {{ formatCurrency(b.limit) }}</span>
              </span>
            </div>
            <div class="h-3 w-full bg-app-bg rounded-full overflow-hidden relative z-10 border border-app-border">
              <div 
                class="h-full rounded-full transition-all duration-1000 ease-out relative"
                :class="getBudgetSpent(b, group.transactions) > b.limit ? 'bg-danger' : 'bg-success'"
                :style="{ width: Math.min((getBudgetSpent(b, group.transactions) / b.limit) * 100, 100) + '%' }"
              >
                <div class="absolute inset-0 bg-white/20"></div>
              </div>
            </div>
            
            <p v-if="getBudgetSpent(b, group.transactions) > b.limit" class="text-[11px] text-danger font-medium mt-1.5 relative z-10">
              Atenção: Você passou do limite estabelecido!
            </p>
            
            <!-- Hover Actions -->
            <div class="absolute -inset-x-3 -inset-y-2 bg-app-surface-hover/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-end gap-2 pr-4 transition-opacity z-20 pointer-events-none">
              <button @click.stop="openBudgetModal(b)" class="pointer-events-auto p-1.5 bg-app-border rounded-lg text-content-muted hover:text-content-main hover:bg-primary-500 transition-colors shadow-lg"><Edit2 class="w-3.5 h-3.5" /></button>
              <button @click.stop="deleteBudget(b.id)" class="pointer-events-auto p-1.5 bg-app-border rounded-lg text-content-muted hover:text-content-main hover:bg-danger transition-colors shadow-lg"><Trash2 class="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div v-if="group.transactions.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="t in group.transactions" :key="t.id" class="bg-app-surface rounded-2xl p-5 border border-app-border shadow-sm flex items-center justify-between group">
          <div class="flex items-center gap-4 truncate pr-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-danger/10 text-danger">
              <ArrowUpRight class="w-5 h-5" />
            </div>
            <div class="truncate">
              <h4 class="font-medium text-content-main truncate">{{ t.description }}</h4>
              <p class="text-xs text-content-muted mt-0.5">{{ t.category }} • {{ formatDate(t.date) }}</p>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <p class="font-bold text-danger">-{{ formatCurrency(t.amount) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-content-faint py-2">
        Nenhuma despesa registrada neste mês.
      </div>
    </div>

    <!-- Modal Form -->
    <Modal :isOpen="isModalOpen" :title="editingBudgetId ? 'Editar Meta de Gasto' : 'Nova Meta de Gasto'" @close="closeBudgetModal">
      <form @submit.prevent="saveBudget" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Categoria</label>
          <select 
            v-model="form.category"
            required
            class="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-content-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none transition-all"
          >
            <option value="" disabled>Selecione a categoria</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Moradia">Moradia</option>
            <option value="Saúde">Saúde</option>
            <option value="Educação">Educação</option>
            <option value="Lazer">Lazer</option>
            <option value="Compras">Compras</option>
            <option value="Contas">Contas</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Limite (R$)</label>
          <input 
            v-model.number="form.limit" 
            type="number" 
            step="0.01" 
            min="0" 
            required 
            placeholder="Ex: 800" 
            class="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-content-main placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
          >
        </div>

        <div class="pt-4 flex gap-3">
          <button type="button" @click="closeBudgetModal" class="flex-1 px-4 py-2.5 bg-app-surface-hover hover:bg-app-border text-content-main rounded-xl font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" class="flex-1 px-4 py-2.5 bg-primary-600-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20">
            Salvar Meta
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar as CalendarIcon, ArrowUpRight, Target, Edit2, Trash2 } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Modal from '../components/Modal.vue'

const financeStore = useFinanceStore()

const budgetsList = computed(() => financeStore.budgets || [])

const getBudgetSpent = (budget, transactions) => {
  return transactions
    .filter(t => t.category === budget.category)
    .reduce((sum, t) => sum + t.amount, 0)
}

// Modal logic
const isModalOpen = ref(false)
const editingBudgetId = ref(null)
const form = ref({
  category: '',
  limit: 0
})

const openBudgetModal = (budget = null) => {
  if (budget) {
    editingBudgetId.value = budget.id
    form.value = { category: budget.category, limit: budget.limit }
  } else {
    editingBudgetId.value = null
    form.value = { category: '', limit: 0 }
  }
  isModalOpen.value = true
}

const closeBudgetModal = () => {
  isModalOpen.value = false
}

const saveBudget = () => {
  if (editingBudgetId.value) {
    financeStore.editBudget(editingBudgetId.value, { ...form.value })
  } else {
    financeStore.addBudget({ ...form.value })
  }
  closeBudgetModal()
}

const deleteBudget = (id) => {
  if (confirm('Tem certeza que deseja remover esta meta?')) {
    financeStore.deleteBudget(id)
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
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

  // Always initialize current month so budgets show up even if no expenses yet
  const currentMonthName = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })
  grouped[currentMonthName] = {
    total: 0,
    transactions: []
  }

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

    // Since we pre-initialized current month, check if this is a duplicate or avoid pushing twice
    if (monthName === currentMonthName && grouped[monthName].transactions.find(x => x.id === t.id)) {
      return
    }

    grouped[monthName].transactions.push(t)
    grouped[monthName].total += t.amount
  })

  // remove current month if no expenses AND no budgets (optional, but keep it if budgets exist)
  if (grouped[currentMonthName].transactions.length === 0 && (financeStore.budgets || []).length === 0) {
    delete grouped[currentMonthName]
  }

  return grouped
})
</script>
