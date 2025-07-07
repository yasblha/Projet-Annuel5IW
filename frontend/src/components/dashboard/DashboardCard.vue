<template>
  <div class="dashboard-card">
    <div class="card-header">
      <div class="icon-container" :class="`bg-${color}-100`">
        <i :class="[icon, `text-${color}-600`]"></i>
      </div>
      <div class="trend" v-if="trend">
        <span 
          class="trend-value"
          :class="trend > 0 ? 'text-green-600' : 'text-red-600'"
        >
          <i :class="trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'" class="mr-1"></i>
          {{ Math.abs(trend) }}%
        </span>
        <span class="trend-label">vs mois dernier</span>
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <div class="card-value">{{ value }}</div>
      <p class="card-description">{{ description }}</p>
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  description: string
  icon: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
  trend?: number
}

defineProps<Props>()
</script>

<style scoped>
.dashboard-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200;
}

.card-header {
  @apply flex items-center justify-between mb-4;
}

.icon-container {
  @apply w-12 h-12 rounded-lg flex items-center justify-center;
}

.icon-container i {
  @apply text-xl;
}

.trend {
  @apply text-right;
}

.trend-value {
  @apply text-sm font-medium block flex items-center justify-end;
}

.trend-label {
  @apply text-xs text-gray-500;
}

.card-content {
  @apply space-y-2;
}

.card-title {
  @apply text-sm font-medium text-gray-600;
}

.card-value {
  @apply text-3xl font-bold text-gray-900;
}

.card-description {
  @apply text-sm text-gray-500;
}

.card-footer {
  @apply mt-4 pt-4 border-t border-gray-100;
}
</style> 