<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-content-main">Despesas Fixas</h2>
        <p class="text-sm text-content-muted">Gerencie suas contas que se repetem todo mês.</p>
      </div>
      <button @click="openModal()" class="flex items-center gap-2 px-4 py-2 bg-primary-600-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20">
        <Plus class="w-5 h-5" />
        <span class="hidden sm:inline">Nova Conta</span>
      </button>
    </div>

    <!-- Lista de Contas Fixas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="bill in fixedBills" :key="bill.id" class="p-5 rounded-2xl border border-app-border bg-app-surface shadow-sm relative group overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 z-0"></div>
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
              <Receipt class="w-5 h-5" />
            </div>
            <div class="flex gap-2">
              <button @click="openModal(bill)" class="p-1.5 text-content-muted hover:text-content-main bg-app-surface-hover/50 hover:bg-app-border rounded-lg transition-colors">
                <Edit2 class="w-4 h-4" />
              </button>
              <button @click="confirmDelete(bill.id)" class="p-1.5 text-content-muted hover:text-danger bg-app-surface-hover/50 hover:bg-app-border rounded-lg transition-colors">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 class="text-lg font-bold text-content-main mb-1">{{ bill.name }}</h3>
          <p class="text-sm text-content-muted mb-4">Próximo vencimento: {{ formatDate(bill.dueDate) }}</p>
          <div class="pt-4 border-t border-app-border flex justify-between items-end">
            <span class="text-sm font-medium text-content-muted">Valor Atual</span>
            <span class="text-xl font-bold text-content-main">{{ formatCurrency(bill.amount) }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="fixedBills.length === 0" class="col-span-full py-12 text-center border-2 border-dashed border-app-border rounded-2xl text-content-muted">
        Nenhuma despesa fixa cadastrada.
      </div>
    </div>

    <!-- Modal Form -->
    <Modal :isOpen="isModalOpen" :title="editingId ? 'Editar Despesa' : 'Nova Despesa Fixa'" @close="closeModal">
      <form @submit.prevent="saveBill" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Nome da Conta</label>
          <input v-model="form.name" type="text" required placeholder="Ex: Água, Luz, Aluguel" class="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-content-main placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Valor (R$)</label>
          <input v-model.number="form.amount" type="number" step="0.01" min="0" required placeholder="0,00" class="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-content-main placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium text-content-muted mb-1">Próximo Vencimento</label>
          <input v-model="form.dueDate" type="date" required class="w-full bg-app-bg border border-app-border rounded-xl px-4 py-2.5 text-content-main focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all [color-scheme:dark]">
        </div>

        <div class="pt-4 flex gap-3">
          <button type="button" @click="closeModal" class="flex-1 px-4 py-2.5 bg-app-surface-hover hover:bg-app-border text-content-main rounded-xl font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" class="flex-1 px-4 py-2.5 bg-primary-600-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Receipt, Edit2, Trash2 } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/finance'
import Modal from '../components/Modal.vue'

const financeStore = useFinanceStore()
const fixedBills = computed(() => financeStore.bills.filter(b => b.isFixed))

const isModalOpen = ref(false)
const editingId = ref(null)

const defaultForm = {
  name: '',
  amount: '',
  dueDate: '',
  isFixed: true,
  paid: false
}

const form = ref({ ...defaultForm })

const openModal = (bill = null) => {
  if (bill) {
    editingId.value = bill.id
    form.value = { ...bill }
  } else {
    editingId.value = null
    const today = new Date().toISOString().split('T')[0]
    form.value = { ...defaultForm, dueDate: today }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveBill = () => {
  if (editingId.value) {
    financeStore.editBill(editingId.value, { ...form.value })
  } else {
    financeStore.addBill({ ...form.value })
  }
  closeModal()
}

const confirmDelete = (id) => {
  if (confirm('Tem certeza que deseja excluir esta conta fixa?')) {
    financeStore.deleteBill(id)
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}
</script>
