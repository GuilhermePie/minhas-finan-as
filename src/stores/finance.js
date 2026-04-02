import { defineStore } from 'pinia'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    balance: 0,
    debts: 0,
    transactions: [],
    bills: [],
    accounts: [],
    budgets: [],
    theme: 'midnight'
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
        let desc = `Pagamento: ${debt.name}`
        if (debt.isInstallment && debt.totalInstallments) {
          desc += ` (${debt.currentInstallment}/${debt.totalInstallments})`
        }

        this.addTransaction({
          type: 'expense',
          amount: amount,
          category: 'Gastos Fixos',
          date: new Date().toISOString().split('T')[0],
          description: desc,
          accountId: sourceAccountId
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
      if (transaction.accountId) {
        const acc = this.accounts.find(a => a.id === transaction.accountId)
        if (acc) {
          if (transaction.type === 'income') acc.balance += transaction.amount
          else acc.balance -= transaction.amount
        }
      }
      this.transactions.push({ id: Date.now(), ...transaction })
      this.recalculateTotals()
    },
    editTransaction(id, updatedTransaction) {
      const index = this.transactions.findIndex(t => t.id === id)
      if (index !== -1) {
        const oldT = this.transactions[index]
        
        // Revert old transaction effect
        if (oldT.accountId) {
          const oldAcc = this.accounts.find(a => a.id === oldT.accountId)
          if (oldAcc) {
            if (oldT.type === 'income') oldAcc.balance -= oldT.amount
            else oldAcc.balance += oldT.amount
          }
        }
        
        // Apply new transaction effect
        if (updatedTransaction.accountId) {
          const newAcc = this.accounts.find(a => a.id === updatedTransaction.accountId)
          if (newAcc) {
            if (updatedTransaction.type === 'income') newAcc.balance += updatedTransaction.amount
            else newAcc.balance -= updatedTransaction.amount
          }
        }

        this.transactions[index] = { ...oldT, ...updatedTransaction }
        this.recalculateTotals()
      }
    },
    deleteTransaction(id) {
      const t = this.transactions.find(t => t.id === id)
      if (t && t.accountId) {
        const acc = this.accounts.find(a => a.id === t.accountId)
        if (acc) {
          if (t.type === 'income') acc.balance -= t.amount
          else acc.balance += t.amount
        }
      }
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
        let desc = `Pagamento: ${bill.name}`
        if (bill.isInstallment && bill.totalInstallments) {
          desc += ` (${bill.currentInstallment}/${bill.totalInstallments})`
        }

        this.addTransaction({
          type: 'expense',
          amount: bill.amount,
          category: 'Gastos Fixos',
          date: new Date().toISOString().split('T')[0],
          description: desc,
          accountId: sourceAccountId
        })

        if (bill.isFixed) {
          const dateObj = new Date(bill.dueDate)
          dateObj.setUTCMonth(dateObj.getUTCMonth() + 1)
          bill.dueDate = dateObj.toISOString().split('T')[0]
        } else if (bill.isInstallment && bill.currentInstallment < bill.totalInstallments) {
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
    
    // Budgets
    addBudget(budget) {
      if (!this.budgets) this.budgets = []
      this.budgets.push({ id: Date.now(), ...budget })
    },
    editBudget(id, updatedBudget) {
      if (!this.budgets) this.budgets = []
      const index = this.budgets.findIndex(b => b.id === id)
      if (index !== -1) {
        this.budgets[index] = { ...this.budgets[index], ...updatedBudget }
      }
    },
    deleteBudget(id) {
      if (!this.budgets) this.budgets = []
      this.budgets = this.budgets.filter(b => b.id !== id)
    },
    
    // Utilities
    recalculateTotals() {
      const availableTypes = ['asset', 'checking']
      const debtTypes = ['debt', 'credit_card', 'loan']
      
      this.balance = this.accounts.filter(a => 
        availableTypes.includes(a.type) && !a.isInvestment && !a.name.toLowerCase().includes('reserva')
      ).reduce((acc, a) => acc + a.balance, 0)
      
      this.debts = this.accounts.filter(a => debtTypes.includes(a.type)).reduce((acc, a) => acc + a.balance, 0)
    }
  },
  persist: {
    key: 'gestor-contas-personal'
  }
})
