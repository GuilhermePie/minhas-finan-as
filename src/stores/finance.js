import { defineStore } from 'pinia'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    balance: 0,
    debts: 0,
    transactions: [],
    bills: [],
    accounts: []
  }),
  getters: {
    totalIncome: (state) => state.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    totalExpense: (state) => state.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    upcomingBills: (state) => {
      const bills = state.bills.filter(b => !b.paid).map(b => ({ ...b, itemType: 'bill' }))
      const debts = state.accounts.filter(a => ['debt', 'credit_card', 'loan'].includes(a.type) && a.dueDate).map(a => ({ ...a, itemType: 'debt' }))
      return [...bills, ...debts].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    },
  },
  actions: {
    // Accounts
    addAccount(account) {
      this.accounts.push({ id: Date.now(), ...account })
      this.recalculateTotals()
    },
    editAccount(id, updatedAccount) {
      const index = this.accounts.findIndex(a => a.id === id)
      if (index !== -1) {
        this.accounts[index] = { ...this.accounts[index], ...updatedAccount }
        this.recalculateTotals()
      }
    },
    deleteAccount(id) {
      this.accounts = this.accounts.filter(a => a.id !== id)
      this.recalculateTotals()
    },
    payDebtInstallment(id, amount, sourceAccountId) {
      const debt = this.accounts.find(a => a.id === id)
      if (debt && ['debt', 'credit_card', 'loan'].includes(debt.type)) {
        const sourceAcc = this.accounts.find(a => a.id === sourceAccountId)
        if (sourceAcc) sourceAcc.balance -= amount

        let desc = `Pagamento: ${debt.name}`
        if (debt.isInstallment && debt.totalInstallments) {
          desc += ` (${debt.currentInstallment}/${debt.totalInstallments})`
        }

        this.addTransaction({
          type: 'expense',
          amount: amount,
          category: 'Contas',
          date: new Date().toISOString().split('T')[0],
          description: desc
        })

        debt.balance -= amount
        
        if (debt.isInstallment && debt.currentInstallment < debt.totalInstallments) {
          debt.currentInstallment++
          if (debt.dueDate) {
            const dateObj = new Date(debt.dueDate)
            dateObj.setUTCMonth(dateObj.getUTCMonth() + 1)
            debt.dueDate = dateObj.toISOString().split('T')[0]
          }
        }
        
        if (debt.balance <= 0 || (debt.isInstallment && debt.currentInstallment > debt.totalInstallments)) {
          this.deleteAccount(debt.id)
        } else {
          this.recalculateTotals()
        }
      }
    },

    // Transactions
    addTransaction(transaction) {
      this.transactions.push({ id: Date.now(), ...transaction })
      this.recalculateTotals()
    },
    editTransaction(id, updatedTransaction) {
      const index = this.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        this.transactions[index] = { ...this.transactions[index], ...updatedTransaction }
        this.recalculateTotals()
      }
    },
    deleteTransaction(id) {
      this.transactions = this.transactions.filter(t => t.id !== id)
      this.recalculateTotals()
    },

    // Bills
    addBill(bill) {
      this.bills.push({ id: Date.now(), ...bill })
    },
    editBill(id, updatedBill) {
      const index = this.bills.findIndex(b => b.id === id)
      if (index !== -1) {
        this.bills[index] = { ...this.bills[index], ...updatedBill }
      }
    },
    deleteBill(id) {
      this.bills = this.bills.filter(b => b.id !== id)
    },
    markBillAsPaid(billId, sourceAccountId) {
      const bill = this.bills.find(b => b.id === billId)
      if (bill && !bill.paid) {

        const sourceAcc = this.accounts.find(a => a.id === sourceAccountId)
        if (sourceAcc) sourceAcc.balance -= bill.amount


        let desc = `Pagamento: ${bill.name}`
        if (bill.isInstallment && bill.totalInstallments) {
          desc += ` (${bill.currentInstallment}/${bill.totalInstallments})`
        }

        this.addTransaction({
          type: 'expense',
          amount: bill.amount,
          category: 'Contas',
          date: new Date().toISOString().split('T')[0],
          description: desc
        })

        if (bill.isInstallment && bill.currentInstallment < bill.totalInstallments) {
          bill.currentInstallment++
          // Move due date 1 month forward
          const dateObj = new Date(bill.dueDate)
          dateObj.setUTCMonth(dateObj.getUTCMonth() + 1)
          bill.dueDate = dateObj.toISOString().split('T')[0]
        } else {
          bill.paid = true
        }
      }
    },
    
    // Utilities
    recalculateTotals() {
      const assetTypes = ['asset', 'checking', 'investment', 'reserve']
      const debtTypes = ['debt', 'credit_card', 'loan']
      this.balance = this.accounts.filter(a => assetTypes.includes(a.type)).reduce((acc, a) => acc + a.balance, 0)
      this.debts = this.accounts.filter(a => debtTypes.includes(a.type)).reduce((acc, a) => acc + a.balance, 0)
    }
  },
  persist: {
    key: 'gestor-contas-personal'
  }
})
