<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="emit('cancel')"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-sm z-10">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <button @click="emit('cancel')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-6">
        <p class="text-gray-700">{{ message }}</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2 px-6 pb-6">
        <button
          @click="emit('cancel')"
          class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none"
        >
          {{ cancelLabel }}
        </button>
        <button
          @click="emit('confirm')"
          class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['confirm', 'cancel'])

const confirmLabel = props.confirmText || 'Confirmer'
const cancelLabel = props.cancelText || 'Annuler'
</script>
