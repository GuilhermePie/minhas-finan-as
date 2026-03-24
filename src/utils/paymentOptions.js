import Swal from 'sweetalert2'
import { useFinanceStore } from '../stores/finance'

export const handlePayment = async (item, type = 'bill') => {
  const financeStore = useFinanceStore()
  const assetAccounts = financeStore.accounts.filter(a => a.type === 'checking' || (a.type === 'asset' && !a.isInvestment && !a.name.toLowerCase().includes('reserva')));
  
  if (assetAccounts.length === 0) {
    Swal.fire({
      title: 'Erro',
      text: 'Você precisa ter pelo menos uma Conta Corrente cadastrada para realizar pagamentos. Reservas e Investimentos não podem ser usados.',
      icon: 'error',
      background: '#1e293b',
      color: '#f8fafc'
    });
    return;
  }

  let accountOptions = '';
  assetAccounts.forEach(a => {
    accountOptions += `<option value="${a.id}">${a.name} (Saldo: ${a.balance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})})</option>`;
  });

  const isDebt = type === 'debt';
  
  let html = `<div class="text-left mt-4 mb-2">
      <label class="block text-sm font-medium text-slate-300 mb-1">De qual conta o dinheiro vai sair?</label>
      <select id="swal-source" class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500">
        ${accountOptions}
      </select>
  </div>`;

  if (isDebt) {
    html = `<div class="text-left">
        <label class="block text-sm font-medium text-slate-300 mb-1">Valor do Pagamento</label>
        <input id="swal-amount" type="number" step="0.01" class="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 mb-4" placeholder="Ex: 150.00" value="${item.installmentAmount || item.balance}">
        ${html}
    </div>`;
  }

  const { value: formValues } = await Swal.fire({
    title: `Pagar ${item.name}`,
    html: html,
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#334155',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    background: '#1e293b',
    color: '#f8fafc',
    preConfirm: () => {
      const sourceId = document.getElementById('swal-source').value;
      let amount = isDebt ? parseFloat(document.getElementById('swal-amount').value) : item.amount;
      if (isDebt && (!amount || amount <= 0)) {
        Swal.showValidationMessage('Insira um valor válido para o pagamento');
        return false;
      }
      return { sourceId: parseInt(sourceId), amount };
    }
  })

  if (formValues) {
    if (isDebt) {
      financeStore.payDebtInstallment(item.id, formValues.amount, formValues.sourceId);
    } else {
      financeStore.markBillAsPaid(item.id, formValues.sourceId);
    }
    financeStore.recalculateTotals();
    
    Swal.fire({
      title: 'Sucesso!',
      text: 'O pagamento foi registrado e descontado da sua conta.',
      icon: 'success',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1'
    });
  }
}
