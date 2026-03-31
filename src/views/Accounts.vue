<template>
  <div class="space-y-6 pb-20">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-content-main">Contas e Cartões</h2>
      <button 
        @click="openModal()"
        class="px-4 py-2 bg-primary-600-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-primary-500/20 w-fit flex items-center gap-2"
      >
        <Plus class="w-4 h-4" /> Nova Conta
      </button>
    </div>

    <!-- Assets (Contas Bancárias) -->
    <div class="mb-8">
      <h3 class="text-lg font-medium text-content-muted mb-4">Minhas Contas</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="account in accounts" :key="account.id" class="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-6 border border-app-border shadow-sm hover:border-app-border-hover transition-colors relative overflow-hidden group">
          <div class="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button @click="openModal(account)" class="p-1.5 text-content-muted hover:text-content-main bg-app-surface-hover hover:bg-app-border rounded-md transition-colors">
              <Edit2 class="w-4 h-4" />
            </button>
            <button @click="deleteAccount(account.id)" class="p-1.5 text-content-muted hover:text-danger bg-app-surface-hover hover:bg-app-border rounded-md transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-app-surface-hover flex items-center justify-center text-content-muted">
                <Landmark class="w-5 h-5" />
              </div>
              <h4 class="font-medium text-content-main pr-16 flex items-center gap-2">
                {{ account.name }}
                <span v-if="account.type === 'reserve' || account.isInvestment" class="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full border border-primary-500/20 shrink-0">
                  Reserva
                </span>
                <span v-if="account.type === 'investment'" class="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full border border-success/20 shrink-0">
                  Investimento
                </span>
              </h4>
            </div>
            <div>
              <p class="text-sm text-content-muted mb-1">Saldo Atual</p>
              <p class="text-2xl font-bold text-content-main">{{ formatCurrency(account.balance) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debts (Cartões e Ferramentas) -->
    <div>
      <h3 class="text-lg font-medium text-content-muted mb-4">Cartões de Crédito e Empréstimos</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="debt in debts" :key="debt.id" class="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl p-6 border border-app-border shadow-sm hover:border-danger/20 transition-colors relative overflow-hidden group">
          <div class="absolute inset-0 bg-danger/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button @click="openModal(debt)" class="p-1.5 text-content-muted hover:text-content-main bg-app-surface-hover hover:bg-app-border rounded-md transition-colors">
              <Edit2 class="w-4 h-4" />
            </button>
            <button @click="deleteAccount(debt.id)" class="p-1.5 text-content-muted hover:text-danger bg-app-surface-hover hover:bg-app-border rounded-md transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-app-surface-hover flex items-center justify-center text-content-muted shrink-0">
                  <CreditCard class="w-5 h-5" />
                </div>
                <h4 class="font-medium text-content-main truncate pr-14 flex items-center gap-2">
                  {{ debt.name }}
                  <span v-if="debt.isInstallment && debt.totalInstallments" class="text-xs bg-app-surface-hover text-content-muted px-2 py-0.5 rounded-full border border-app-border-hover truncate no-underline">
                    {{ debt.currentInstallment }}/{{ debt.totalInstallments }}
                  </span>
                </h4>
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div>
                <p class="text-sm text-content-muted mb-1">Fatura Atual / Dívida Total</p>
                <p class="text-2xl font-bold text-danger">{{ formatCurrency(debt.balance) }}</p>
              </div>
              <button 
                @click.stop="handlePayment(debt, 'debt')"
                class="px-3 py-1.5 rounded-lg font-medium text-xs transition-colors bg-success/10 text-success hover:bg-success/20 border border-success/20 flex-shrink-0 z-30"
              >
                Pagar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Modal :isOpen="isModalOpen" :title="editingAccount ? 'Editar Conta' : 'Nova Conta'" @close="closeModal">
      <form @submit.prevent="saveAccount" class="space-y-4 pb-2">
        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Nome da Conta</label>
          <input 
            v-model="form.name" 
            type="text" 
            required
            class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="Ex: Nubank, Itaú..."
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Tipo</label>
          <select 
            v-model="form.type"
            class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:border-primary-500 transition-colors appearance-none"
          >
            <option value="checking">Conta Corrente</option>
            <option value="investment">Investimento</option>
            <option value="reserve">Reserva</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="loan">Empréstimo / Financiamento</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Saldo Atual / Dívida Total (R$)</label>
          <input 
            v-model.number="form.balance" 
            type="number" 
            step="0.01" 
            required
            class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="0.00"
          />
        </div>

        <div v-if="['loan', 'credit_card', 'debt'].includes(form.type)">
          <label class="block text-sm font-medium text-content-muted mb-1">Data de Vencimento da Fatura/Parcela</label>
          <input 
            v-model="form.dueDate" 
            type="date" 
            class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:border-primary-500 transition-colors mb-2"
          />
        </div>

        <div v-if="['loan', 'credit_card', 'debt'].includes(form.type)" class="pt-2 border-t border-app-border mt-4">
          <div class="flex items-center gap-3 mb-4">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.isInstallment" class="sr-only peer">
              <div class="w-11 h-6 bg-app-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              <span class="ml-3 text-sm font-medium text-content-muted">É um financiamento parcelado?</span>
            </label>
          </div>

          <div v-if="form.isInstallment" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-content-muted mb-1">Parcela Atual</label>
              <input 
                v-model.number="form.currentInstallment" 
                type="number" 
                min="1"
                class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Ex: 1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-content-muted mb-1">Total de Parcelas</label>
              <input 
                v-model.number="form.totalInstallments" 
                type="number" 
                min="2"
                class="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2.5 text-content-main focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Ex: 12"
              />
            </div>
          </div>
        </div>

        <div class="pt-4 flex justify-end gap-3 border-t border-app-border mt-4">
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
import { Landmark, CreditCard, Plus, Edit2, Trash2 } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'
import Modal from '../components/Modal.vue'
import { handlePayment } from '../utils/paymentOptions'
import Swal from 'sweetalert2'

const financeStore = useFinanceStore()

const accounts = computed(() => financeStore.accounts.filter(a => ['asset', 'checking', 'investment', 'reserve'].includes(a.type)))
const debts = computed(() => financeStore.accounts.filter(a => ['debt', 'loan', 'credit_card'].includes(a.type)))

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// Modal and Form State
const isModalOpen = ref(false)
const editingAccount = ref(null)
const form = ref({
  name: '',
  type: 'checking',
  balance: 0,
  dueDate: new Date().toISOString().split('T')[0],
  isInstallment: false,
  isInvestment: false,
  currentInstallment: 1,
  totalInstallments: 1
})

const openModal = (account = null) => {
  if (account) {
    editingAccount.value = account
    form.value = { ...account }
  } else {
    editingAccount.value = null
    form.value = { name: '', type: 'checking', balance: 0, dueDate: new Date().toISOString().split('T')[0], isInstallment: false, isInvestment: false, currentInstallment: 1, totalInstallments: 1 }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveAccount = () => {
  if (editingAccount.value) {
    financeStore.editAccount(editingAccount.value.id, form.value)
  } else {
    financeStore.addAccount(form.value)
  }
  closeModal()
}

const deleteAccount = (id) => {
  Swal.fire({
    title: 'Excluir conta?',
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
      financeStore.deleteAccount(id)
      Swal.fire({
        title: 'Excluído!',
        text: 'A conta foi removida com sucesso.',
        icon: 'success',
        background: '#1e293b',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1'
      })
    }
  })
}
</script>
