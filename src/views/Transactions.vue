<template>
  <div class="space-y-6 pb-20">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-content-main">Transações</h2>
      <button 
        @click="openModal()"
        class="px-4 py-2 bg-primary-600-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-primary-500/20 w-fit flex items-center gap-2"
      >
        <Plus class="w-4 h-4" /> Nova Transação
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div class="bg-app-surface rounded-2xl p-6 border border-app-border shadow-sm flex items-center justify-between relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-bl-full blur-xl -mr-6 -mt-6 group-hover:bg-success/10 transition-colors"></div>
        <div class="relative z-10 w-full pr-4">
          <p class="text-sm text-content-muted mb-1">Total de Entradas</p>
          <p class="text-3xl font-bold text-success">{{ formatCurrency(totals.income) }}</p>
        </div>
        <div class="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0 relative z-10">
          <ArrowDownLeft class="w-7 h-7" />
        </div>
      </div>
      <div class="bg-app-surface rounded-2xl p-6 border border-app-border shadow-sm flex items-center justify-between relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-bl-full blur-xl -mr-6 -mt-6 group-hover:bg-danger/10 transition-colors"></div>
        <div class="relative z-10 w-full pr-4">
          <p class="text-sm text-content-muted mb-1">Total de Saídas</p>
          <p class="text-3xl font-bold text-danger">{{ formatCurrency(totals.expense) }}</p>
        </div>
        <div class="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 relative z-10">
          <ArrowUpRight class="w-7 h-7" />
        </div>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="bg-app-surface rounded-2xl border border-app-border shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr class="bg-app-bg/40 border-b border-app-border">
              <th class="py-4 px-6 text-xs font-semibold text-content-muted uppercase tracking-wider w-[35%]">
                Descrição
              </th>
              <th class="py-4 px-6 text-xs font-semibold text-content-muted uppercase tracking-wider">
                Categoria
              </th>
              <th 
                @click="sortBy('date')" 
                class="py-4 px-6 text-xs font-semibold text-content-muted uppercase tracking-wider cursor-pointer hover:bg-app-surface-hover/50 hover:text-content-main transition-colors group select-none"
              >
                <div class="flex items-center gap-2">
                  Data
                  <component :is="getSortIcon('date')" class="w-3.5 h-3.5 transition-colors" :class="{'text-primary-400': sortKey === 'date', 'opacity-0 group-hover:opacity-100': sortKey !== 'date'}" />
                </div>
              </th>
              <th 
                @click="sortBy('amount')" 
                class="py-4 px-6 text-xs font-semibold text-content-muted uppercase tracking-wider text-right cursor-pointer hover:bg-app-surface-hover/50 hover:text-content-main transition-colors group select-none"
              >
                <div class="flex items-center justify-end gap-2">
                  <component :is="getSortIcon('amount')" class="w-3.5 h-3.5 transition-colors" :class="{'text-primary-400': sortKey === 'amount', 'opacity-0 group-hover:opacity-100': sortKey !== 'amount'}" />
                  Valor
                </div>
              </th>
              <th class="py-4 px-6 text-xs font-semibold text-content-muted uppercase tracking-wider text-right w-24">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-app-border">
            <tr v-for="t in sortedTransactions" :key="t.id" class="hover:bg-app-surface-hover/40 transition-colors group">
              <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    :class="t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
                  >
                    <ArrowDownLeft v-if="t.type === 'income'" class="w-5 h-5" />
                    <ArrowUpRight v-else class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-content-main">{{ t.description }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-content-muted">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-app-surface-hover/80 text-content-muted border border-app-border-hover">
                  {{ t.category }}
                </span>
              </td>
              <td class="py-4 px-6 text-content-muted text-sm whitespace-nowrap">
                {{ formatDate(t.date) }}
              </td>
              <td class="py-4 px-6 text-right font-bold w-32 whitespace-nowrap" :class="t.type === 'income' ? 'text-success' : 'text-danger'">
                {{ t.type === 'income' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
              </td>
              <td class="py-4 px-6 w-24">
                <div class="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openModal(t)" class="p-2 text-content-muted hover:text-content-main bg-app-surface hover:bg-app-border rounded-lg transition-colors border border-transparent hover:border-app-border-hover">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="deleteTransaction(t.id)" class="p-2 text-content-muted hover:text-danger bg-app-surface hover:bg-app-border rounded-lg transition-colors border border-transparent hover:border-danger/30">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="sortedTransactions.length === 0">
              <td colspan="5" class="py-12 text-center text-content-muted">
                <ArrowUpDown class="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Nenhuma transação encontrada.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Modal :isOpen="isModalOpen" :title="editingTransaction ? 'Editar Transação' : 'Nova Transação'" @close="closeModal">
      <form @submit.prevent="saveTransaction" class="space-y-4 pb-2">
        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Descrição</label>
          <input 
            v-model="form.description" 
            type="text" 
            required
            class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
            placeholder="Ex: Almoço, Uber, Salário"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-content-muted mb-1">Tipo</label>
            <select 
              v-model="form.type"
              class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors appearance-none"
            >
              <option value="income">Entrada (Receita)</option>
              <option value="expense">Saída (Despesa)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-content-muted mb-1">Valor (R$)</label>
            <input 
              v-model.number="form.amount" 
              type="number" 
              step="0.01"
              min="0"
              required
              class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Conta de Origem/Destino</label>
          <select 
            v-model="form.accountId"
            required
            class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors appearance-none mb-4"
          >
            <option value="" disabled>Selecione uma conta</option>
            <option v-for="acc in financeStore.accounts.filter(a => ['asset', 'checking', 'investment', 'reserve'].includes(a.type))" :key="acc.id" :value="acc.id">
              {{ acc.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-content-muted mb-1">Categoria</label>
            <select 
              v-model="form.category" 
              required
              class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors appearance-none"
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Transporte">Transporte</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Gastos Fixos">Gastos Fixos</option>
              <option value="Pet">Pet</option>
              <option value="Saúde">Saúde</option>
              <option value="Restaurante">Restaurante</option>
              <option value="Lazer">Lazer</option>
              <option value="Compras">Compras</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-content-muted mb-1">Data</label>
            <input 
              v-model="form.date" 
              type="date" 
              required
              class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button type="button" @click="closeModal" class="px-4 py-2 rounded-lg text-sm font-medium text-content-muted hover:text-content-main hover:bg-app-surface-hover transition-colors">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-2 rounded-lg text-sm font-medium text-content-main bg-primary-600 hover:bg-primary-500 transition-colors">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowUpRight, ArrowDownLeft, Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Modal from '../components/Modal.vue'
import Swal from 'sweetalert2'

const financeStore = useFinanceStore()

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), "dd 'de' MMM, yyyy", { locale: ptBR })
  } catch (e) {
    return dateStr
  }
}

// Sorting logic
const sortKey = ref('date')
const sortAsc = ref(false)

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const getSortIcon = (key) => {
  if (sortKey.value !== key) return ArrowUpDown
  return sortAsc.value ? ArrowUp : ArrowDown
}

const sortedTransactions = computed(() => {
  const arr = [...financeStore.transactions]
  
  arr.sort((a, b) => {
    let valA = a[sortKey.value]
    let valB = b[sortKey.value]
    
    if (sortKey.value === 'amount') {
      // Amount comparison directly
    } else if (sortKey.value === 'date') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    } else {
      valA = String(valA).toLowerCase()
      valB = String(valB).toLowerCase()
    }
    
    if (valA < valB) return sortAsc.value ? -1 : 1
    if (valA > valB) return sortAsc.value ? 1 : -1
    return 0
  })
  
  return arr
})

const totals = computed(() => {
  return financeStore.transactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount
    else acc.expense += t.amount
    return acc
  }, { income: 0, expense: 0 })
})

// Modal and Form State
const isModalOpen = ref(false)
const editingTransaction = ref(null)
const form = ref({
  description: '',
  type: 'expense',
  amount: 0,
  accountId: '',
  category: '',
  date: new Date().toISOString().split('T')[0]
})

const openModal = (transaction = null) => {
  if (financeStore.accounts.filter(a => ['asset', 'checking', 'investment', 'reserve'].includes(a.type)).length === 0) {
    Swal.fire({
      title: 'Aviso',
      text: 'Você precisa ter pelo menos uma Conta criada para adicionar transações.',
      icon: 'warning',
      background: '#1e293b',
      color: '#f8fafc'
    })
    return
  }

  if (transaction) {
    editingTransaction.value = transaction
    form.value = { ...transaction, accountId: transaction.accountId || '' }
  } else {
    editingTransaction.value = null
    form.value = { 
      description: '', 
      type: 'expense', 
      amount: 0, 
      accountId: '',
      category: '', 
      date: new Date().toISOString().split('T')[0] 
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveTransaction = () => {
  if (editingTransaction.value) {
    financeStore.editTransaction(editingTransaction.value.id, form.value)
  } else {
    financeStore.addTransaction(form.value)
  }
  closeModal()
}

const deleteTransaction = (id) => {
  Swal.fire({
    title: 'Excluir transação?',
    text: "Você não poderá reverter esta ação!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#334155',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar',
    background: '#1e293b',
    color: '#f8fafc'
  }).then((result) => {
    if (result.isConfirmed) {
      financeStore.deleteTransaction(id)
      Swal.fire({
        title: 'Excluído!',
        text: 'A transação foi removida com sucesso.',
        icon: 'success',
        background: '#1e293b',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1'
      })
    }
  })
}
</script>
