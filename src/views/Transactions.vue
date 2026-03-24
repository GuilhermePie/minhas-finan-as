<template>
  <div class="space-y-6 pb-20">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-white">Transações</h2>
      <button 
        @click="openModal()"
        class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-primary-500/20 w-fit flex items-center gap-2"
      >
        <Plus class="w-4 h-4" /> Nova Transação
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div class="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-sm flex items-center justify-between relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-bl-full blur-xl -mr-6 -mt-6 group-hover:bg-success/10 transition-colors"></div>
        <div class="relative z-10 w-full pr-4">
          <p class="text-sm text-slate-400 mb-1">Total de Entradas</p>
          <p class="text-3xl font-bold text-success">{{ formatCurrency(totals.income) }}</p>
        </div>
        <div class="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0 relative z-10">
          <ArrowDownLeft class="w-7 h-7" />
        </div>
      </div>
      <div class="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-sm flex items-center justify-between relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-bl-full blur-xl -mr-6 -mt-6 group-hover:bg-danger/10 transition-colors"></div>
        <div class="relative z-10 w-full pr-4">
          <p class="text-sm text-slate-400 mb-1">Total de Saídas</p>
          <p class="text-3xl font-bold text-danger">{{ formatCurrency(totals.expense) }}</p>
        </div>
        <div class="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0 relative z-10">
          <ArrowUpRight class="w-7 h-7" />
        </div>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="bg-dark-800 rounded-2xl border border-dark-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr class="bg-dark-900/40 border-b border-dark-700">
              <th class="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[35%]">
                Descrição
              </th>
              <th class="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Categoria
              </th>
              <th 
                @click="sortBy('date')" 
                class="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-dark-700/50 hover:text-white transition-colors group select-none"
              >
                <div class="flex items-center gap-2">
                  Data
                  <component :is="getSortIcon('date')" class="w-3.5 h-3.5 transition-colors" :class="{'text-primary-400': sortKey === 'date', 'opacity-0 group-hover:opacity-100': sortKey !== 'date'}" />
                </div>
              </th>
              <th 
                @click="sortBy('amount')" 
                class="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:bg-dark-700/50 hover:text-white transition-colors group select-none"
              >
                <div class="flex items-center justify-end gap-2">
                  <component :is="getSortIcon('amount')" class="w-3.5 h-3.5 transition-colors" :class="{'text-primary-400': sortKey === 'amount', 'opacity-0 group-hover:opacity-100': sortKey !== 'amount'}" />
                  Valor
                </div>
              </th>
              <th class="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right w-24">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-700">
            <tr v-for="t in sortedTransactions" :key="t.id" class="hover:bg-dark-700/40 transition-colors group">
              <td class="py-4 px-6">
                <div class="flex items-center gap-4">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    :class="t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
                  >
                    <ArrowDownLeft v-if="t.type === 'income'" class="w-5 h-5" />
                    <ArrowUpRight v-else class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-white">{{ t.description }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-300">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-dark-700/80 text-slate-300 border border-dark-600">
                  {{ t.category }}
                </span>
              </td>
              <td class="py-4 px-6 text-slate-400 text-sm whitespace-nowrap">
                {{ formatDate(t.date) }}
              </td>
              <td class="py-4 px-6 text-right font-bold w-32 whitespace-nowrap" :class="t.type === 'income' ? 'text-success' : 'text-danger'">
                {{ t.type === 'income' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
              </td>
              <td class="py-4 px-6 w-24">
                <div class="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openModal(t)" class="p-2 text-slate-400 hover:text-white bg-dark-800 hover:bg-dark-600 rounded-lg transition-colors border border-transparent hover:border-dark-500">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="deleteTransaction(t.id)" class="p-2 text-slate-400 hover:text-danger bg-dark-800 hover:bg-dark-600 rounded-lg transition-colors border border-transparent hover:border-danger/30">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="sortedTransactions.length === 0">
              <td colspan="5" class="py-12 text-center text-slate-400">
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
          <label class="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
          <input 
            v-model="form.description" 
            type="text" 
            required
            class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
            placeholder="Ex: Almoço, Uber, Salário"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
            <select 
              v-model="form.type"
              class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors appearance-none"
            >
              <option value="income">Entrada (Receita)</option>
              <option value="expense">Saída (Despesa)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
            <input 
              v-model.number="form.amount" 
              type="number" 
              step="0.01"
              min="0"
              required
              class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
            <select 
              v-model="form.category" 
              required
              class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors appearance-none"
            >
              <option value="" disabled>Selecione uma categoria</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Transporte">Transporte</option>
              <option value="Moradia">Moradia</option>
              <option value="Saúde">Saúde</option>
              <option value="Educação">Educação</option>
              <option value="Lazer">Lazer</option>
              <option value="Compras">Compras</option>
              <option value="Contas">Contas</option>
              <option value="Salário">Salário</option>
              <option value="Transferência">Transferência</option>
              <option value="Renda Extra">Renda Extra</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Data</label>
            <input 
              v-model="form.date" 
              type="date" 
              required
              class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button type="button" @click="closeModal" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-dark-700 transition-colors">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 transition-colors">
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
  category: '',
  date: new Date().toISOString().split('T')[0]
})

const openModal = (transaction = null) => {
  if (transaction) {
    editingTransaction.value = transaction
    form.value = { ...transaction }
  } else {
    editingTransaction.value = null
    form.value = { 
      description: '', 
      type: 'expense', 
      amount: 0, 
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
