<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      :class="notificationClasses"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <i :class="iconClass" class="h-6 w-6"></i>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium" :class="titleClass">
              {{ title }}
            </p>
            <p v-if="message" class="mt-1 text-sm" :class="messageClass">
              {{ message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="close"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="sr-only">Fermer</span>
              <i class="fas fa-times h-5 w-5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000
})

const emit = defineEmits<Emits>()

const notificationClasses = computed(() => {
  const baseClasses = 'bg-white shadow-lg rounded-lg'
  switch (props.type) {
    case 'success':
      return `${baseClasses} border-l-4 border-green-400`
    case 'error':
      return `${baseClasses} border-l-4 border-red-400`
    case 'warning':
      return `${baseClasses} border-l-4 border-yellow-400`
    case 'info':
    default:
      return `${baseClasses} border-l-4 border-blue-400`
  }
})

const iconClass = computed(() => {
  const baseClasses = 'h-6 w-6'
  switch (props.type) {
    case 'success':
      return `fas fa-check-circle text-green-400 ${baseClasses}`
    case 'error':
      return `fas fa-exclamation-circle text-red-400 ${baseClasses}`
    case 'warning':
      return `fas fa-exclamation-triangle text-yellow-400 ${baseClasses}`
    case 'info':
    default:
      return `fas fa-info-circle text-blue-400 ${baseClasses}`
  }
})

const titleClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    case 'info':
    default:
      return 'text-blue-800'
  }
})

const messageClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-700'
    case 'error':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    case 'info':
    default:
      return 'text-blue-700'
  }
})

const close = () => {
  emit('close')
}

// Auto-close après la durée spécifiée
if (props.duration > 0) {
  setTimeout(() => {
    if (props.show) {
      close()
    }
  }, props.duration)
}
</script> 