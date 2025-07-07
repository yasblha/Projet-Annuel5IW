<template>
  <section class="dashboard-section mb-8">
    <div class="flex items-center mb-4">
      <i v-if="icon" :class="[icon, 'mr-2', 'text-xl', 'text-blue-600', 'animate-bounce']" />
      <h2 class="text-xl font-bold text-gray-900 flex-1">{{ title }}</h2>
      <slot name="actions" />
    </div>
    <div>
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title: string
  icon?: string
}

defineProps<Props>()
</script>

<style scoped>
.dashboard-section {
  /* Espacement et structure */
}
</style> 