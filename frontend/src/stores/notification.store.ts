import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // Auto-remove après la durée spécifiée
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value = []
  }

  // Méthodes utilitaires pour différents types de notifications
  const success = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'error', title, message, duration })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}) 