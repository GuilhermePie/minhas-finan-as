<template>
  <div class="flex h-screen overflow-hidden bg-dark-900 text-slate-100">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar Header -->
      <header class="h-16 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md flex items-center px-6 justify-between">
        <h1 class="text-xl font-semibold capitalize">{{ currentRouteName }}</h1>
        <div class="flex items-center gap-4">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-primary-500/20 text-white">
            GU
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-dark-900 p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const currentRouteName = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  if (path === '/accounts') return 'Contas & Cartões'
  if (path === '/transactions') return 'Transações'
  if (path === '/monthly') return 'Gastos por Mês'
  if (path === '/bills') return 'Despesas Mensais'
  return path.substring(1)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
