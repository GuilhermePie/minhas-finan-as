<template>
  <div class="space-y-6 pb-20">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-white">Despesas Mensais</h2>
      <button 
        @click="openModal()"
        class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-primary-500/20 w-fit flex items-center gap-2"
      >
        <Plus class="w-4 h-4" /> Nova Despesa
      </button>
    </div>

    <!-- Bills List -->
    <div class="space-y-4">
      <div 
        v-for="bill in sortedBills" 
        :key="bill.id" 
        class="group bg-dark-800 rounded-2xl p-5 border border-dark-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all relative overflow-hidden"
        :class="{ 'opacity-60 grayscale-[50%]': bill.paid, 'border-danger/30 bg-danger/5': isLate(bill.dueDate) && !bill.paid }"
      >
        <div class="flex items-center gap-4 relative z-10 w-full sm:w-auto pr-10 sm:pr-0">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="[
              bill.paid ? 'bg-success/20 text-success' : 
              isLate(bill.dueDate) ? 'bg-danger/20 text-danger' : 'bg-primary-500/20 text-primary-400'
            ]"
          >
            <CheckCircle v-if="bill.paid" class="w-6 h-6" />
            <AlertCircle v-else-if="isLate(bill.dueDate)" class="w-6 h-6" />
            <Calendar v-else class="w-6 h-6" />
          </div>
          <div class="flex-1 truncate">
            <h4 class="font-semibold text-white text-lg flex items-center gap-2 truncate" :class="{ 'line-through text-slate-400': bill.paid }">
              {{ bill.name }}
              <span v-if="bill.isInstallment && bill.totalInstallments" class="text-xs bg-dark-700 text-slate-300 px-2 py-0.5 rounded-full border border-dark-600 truncate no-underline">
                {{ bill.currentInstallment }}/{{ bill.totalInstallments }}
              </span>
            </h4>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm truncate" :class="getDueDateColor(bill, isLate(bill.dueDate))">
                <span v-if="bill.paid">Pago</span>
                <span v-else-if="isLate(bill.dueDate)">Venceu {{ formatDate(bill.dueDate) }}</span>
                <span v-else>Vence {{ formatDate(bill.dueDate) }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 relative z-10">
          <!-- Actions on hover/mobile (always present but visible via CSS) -->
          <div class="flex gap-1.5 sm:opacity-0 sm:-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
            <button @click="openModal(bill)" class="p-2 text-slate-400 hover:text-white bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
              <Edit2 class="w-4 h-4" />
            </button>
            <button @click="deleteBill(bill.id)" class="p-2 text-slate-400 hover:text-danger bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <p class="text-xl font-bold text-white whitespace-nowrap">{{ formatCurrency(bill.amount) }}</p>

          <button 
            v-if="!bill.paid"
            @click="handlePayment(bill, 'bill')" 
            class="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-success/10 text-success hover:bg-success/20 border border-success/20 flex-shrink-0"
          >
            Pagar
          </button>
          <div v-else class="px-4 py-2 rounded-lg font-medium text-sm text-success bg-success/5 border border-success/10 cursor-default flex-shrink-0">
            Pago
          </div>
        </div>
      </div>
      
      <div v-if="financeStore.bills.length === 0" class="text-center py-10 bg-dark-800 rounded-2xl border border-dark-700">
        <Receipt class="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 class="text-lg font-medium text-white mb-1">Nenhuma conta mensal</h3>
        <p class="text-slate-400 text-sm">Adicione suas despesas recorrentes aqui.</p>
      </div>
    </div>

    <!-- Modal -->
    <Modal :isOpen="isModalOpen" :title="editingBill ? 'Editar Despesa' : 'Nova Despesa'" @close="closeModal">
      <form @submit.prevent="saveBill" class="space-y-4 pb-2">
        <div>
          <label class="block text-sm font-medium text-slate-400 mb-1">Nome da Conta / Despesa</label>
          <input 
            v-model="form.name" 
            type="text" 
            required
            class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="Ex: Aluguel, Internet..."
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
            <input 
              v-model.number="form.amount" 
              type="number" 
              step="0.01"
              min="0"
              required
              class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="0.00"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">Data de Vencimento</label>
            <input 
              v-model="form.dueDate" 
              type="date" 
              required
              class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div class="pt-2 border-t border-dark-700">
          <div class="flex items-center gap-3 mb-4">
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.isInstallment" class="sr-only peer">
              <div class="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              <span class="ml-3 text-sm font-medium text-slate-300">É uma compra parcelada?</span>
            </label>
          </div>

          <div v-if="form.isInstallment" class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Parcela Atual</label>
              <input 
                v-model.number="form.currentInstallment" 
                type="number" 
                min="1"
                class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Ex: 1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Total de Parcelas</label>
              <input 
                v-model.number="form.totalInstallments" 
                type="number" 
                min="2"
                class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="Ex: 12"
              />
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.paid" class="sr-only peer">
            <div class="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
            <span class="ml-3 text-sm font-medium text-slate-300">Marcar como paga</span>
          </label>
        </div>

        <div class="pt-6 flex justify-end gap-3">
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
import { Calendar, CheckCircle, AlertCircle, Plus, Edit2, Trash2, Receipt } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Modal from '../components/Modal.vue'

import Swal from 'sweetalert2'
import { handlePayment } from '../utils/paymentOptions'

const financeStore = useFinanceStore()

const sortedBills = computed(() => {
  return [...financeStore.bills].sort((a, b) => {
    if (a.paid && !b.paid) return 1
    if (!a.paid && b.paid) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR })
  } catch(e) {
    return dateStr
  }
}

const isLate = (dateStr) => {
  if (!dateStr) return false
  try {
    if (isToday(parseISO(dateStr))) return false
    return isPast(parseISO(dateStr))
  } catch(e) {
    return false
  }
}

const getDueDateColor = (bill, late) => {
  if (bill.paid) return 'text-success'
  if (late) return 'text-danger font-medium'
  return 'text-slate-400'
}

// Modal Form State
const isModalOpen = ref(false)
const editingBill = ref(null)
const form = ref({
  name: '',
  amount: 0,
  dueDate: new Date().toISOString().split('T')[0],
  paid: false,
  isInstallment: false,
  currentInstallment: 1,
  totalInstallments: 1
})

const openModal = (bill = null) => {
  if (bill) {
    editingBill.value = bill
    form.value = { ...bill }
  } else {
    editingBill.value = null
    form.value = {
      name: '',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      paid: false,
      isInstallment: false,
      currentInstallment: 1,
      totalInstallments: 1
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveBill = () => {
  if (editingBill.value) {
    financeStore.editBill(editingBill.value.id, form.value)
  } else {
    financeStore.addBill(form.value)
  }
  closeModal()
}

const deleteBill = (id) => {
  Swal.fire({
    title: 'Excluir despesa?',
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
      financeStore.deleteBill(id)
      Swal.fire({
        title: 'Excluído!',
        text: 'A despesa foi removida com sucesso.',
        icon: 'success',
        background: '#1e293b',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1'
      })
    }
  })
}
</script>
