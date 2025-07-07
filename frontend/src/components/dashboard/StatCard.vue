<template>
  <div class="dashboard-card animated-card">
    <div class="card-header">
      <div class="icon-container" :class="`bg-${color}-100`">
        <i :class="[icon, `text-${color}-600`]" />
      </div>
      <div class="trend-badge" v-if="trend !== undefined">
        <span class="trend-value" :class="trend > 0 ? 'bg-green-100 text-green-700' : trend < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'">
          <i :class="trend > 0 ? 'fas fa-arrow-up' : trend < 0 ? 'fas fa-arrow-down' : ''" class="mr-1" v-if="trend !== 0" />
          {{ Math.abs(trend) }}%
        </span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <div class="card-value">
        <span ref="counterEl">{{ displayValue }}</span>
      </div>
      <p class="card-description">{{ description }}</p>
    </div>
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  title: string
  value: string | number
  description?: string
  icon: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
  trend?: number
}

const props = defineProps<Props>()
const displayValue = ref(typeof props.value === 'number' ? 0 : props.value)
const counterEl = ref<HTMLElement | null>(null)

function animateValue(start: number, end: number, duration = 800) {
  const range = end - start
  let startTime: number | null = null
  function step(timestamp: number) {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    displayValue.value = Math.floor(start + range * progress)
    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      displayValue.value = end
    }
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (typeof props.value === 'number') {
    animateValue(0, Number(props.value))
  }
})

watch(() => props.value, (newVal, oldVal) => {
  if (typeof newVal === 'number') {
    animateValue(Number(oldVal) || 0, Number(newVal))
  } else {
    displayValue.value = newVal
  }
})
</script>

<style scoped>
.dashboard-card {
  @apply bg-white rounded-lg border p-6 shadow-lg hover:shadow-2xl transition-shadow duration-200 relative overflow-hidden;
  background: linear-gradient(135deg, #f0f4ff 0%, #f9fafb 100%);
}
.animated-card {
  animation: fadeInUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.card-header {
  @apply flex items-center justify-between mb-4;
}
.icon-container {
  @apply w-12 h-12 rounded-lg flex items-center justify-center shadow-md;
}
.icon-container i {
  @apply text-xl;
}
.trend-badge {
  @apply flex items-center;
}
.trend-value {
  @apply px-2 py-1 rounded-full text-xs font-bold flex items-center shadow;
  min-width: 48px;
  justify-content: center;
}
.card-content {
  @apply space-y-2;
}
.card-title {
  @apply text-sm font-medium text-gray-600;
}
.card-value {
  @apply text-3xl font-bold text-gray-900;
  min-height: 2.5rem;
  letter-spacing: 0.01em;
  transition: color 0.2s;
}
.card-description {
  @apply text-sm text-gray-500;
}
.card-footer {
  @apply mt-4 pt-4 border-t border-gray-100;
}
</style> 