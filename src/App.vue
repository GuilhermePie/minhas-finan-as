<template>
  <div class="flex h-screen overflow-hidden bg-dark-900 text-slate-100 relative">
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <Sidebar 
      class="absolute lg:relative z-50 h-full transition-transform duration-300 lg:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
      @close="isMobileMenuOpen = false"
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden w-full">
      <!-- Topbar Header -->
      <header class="h-16 shrink-0 border-b border-dark-800 bg-dark-900/50 backdrop-blur-md flex items-center px-4 sm:px-6 justify-between z-30">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = true" class="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden rounded-md transition-colors">
            <Menu class="w-6 h-6" />
          </button>
          <h1 class="text-lg sm:text-xl font-semibold capitalize truncate">{{ currentRouteName }}</h1>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-primary-500/20 text-white">
            GU
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-dark-900 p-4 sm:p-6 pb-24 lg:pb-6">
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
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import { Menu } from 'lucide-vue-next'

const route = useRoute()
const isMobileMenuOpen = ref(false)

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

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
