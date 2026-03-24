<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex justify-center items-center px-4" @click.self="close">
        <div class="absolute inset-0 bg-dark-900/80 backdrop-blur-sm transition-opacity" @click="close"></div>
        <div class="relative bg-dark-800 border border-dark-700 rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all flex flex-col max-h-[90vh]">
          <div class="flex items-center justify-between mb-5 shrink-0">
            <h3 class="text-xl font-bold text-white">{{ title }}</h3>
            <button @click="close" class="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            <slot></slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean,
  title: String,
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
