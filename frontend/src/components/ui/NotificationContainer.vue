<template>
  <div class="fixed top-4 right-4 z-50 space-y-4">
    <Notification
      v-for="notification in notificationStore.notifications"
      :key="notification.id"
      :show="true"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :duration="0"
      @close="notificationStore.removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notification.store'
import Notification from './Notification.vue'

const notificationStore = useNotificationStore()
</script> 